"""Read literal metadata from the official TCGdex source ZIP; never execute it."""
import json,re,sys,zipfile,pathlib,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
source=(root/'public/runtime/core.js').read_text(encoding='utf-8')
sets=re.findall(r"\{id:'([^']+)',name:'([^']+)',series:'([^']+)'",source.split('const SETS=[')[1].split('];')[0])
archive=pathlib.Path(sys.argv[1]); catalog=root/'supabase/catalog'
def literal(text,key):
 m=re.search(r'\b'+key+r'\s*:\s*("(?:[^"\\]|\\.)*")',text)
 return json.loads(m.group(1)) if m else None
def tier(rarity,name):
 x=(rarity+' '+name).lower()
 for score,pattern in [(5,r'hyper|secret|rainbow|gold rare'),(4,r'special illustration|shiny ultra'),(3,r'illustration|shiny rare|rare shiny|ultra rare|amazing|radiant|trainer gallery|galarian gallery|\bvmax\b|\bvstar\b'),(2,r'double rare|ace spec|\bex\b|\bgx\b|(?:^|\s)v(?:$|\s)'),(1,r'rare|holo|reverse')]:
  if re.search(pattern,x):return score
 return 0
with zipfile.ZipFile(archive) as z:
 paths=z.namelist();metadata={}
 for p in paths:
  if '/data/' in p and p.endswith('.ts') and len(p.split('/data/')[1].split('/'))==2:
   text=z.read(p).decode('utf-8');sid=literal(text,'id')
   if sid:metadata[sid]=p
 for sid,name,era in sets:
  dest=catalog/(sid+'.json')
  if dest.exists():print(sid,'cached');continue
  canonical={'sm11.5':'sm115'}.get(sid,sid)
  folder=metadata[canonical][:-3]+'/'
  cards=[];missing=[]
  for p in paths:
   if not(p.startswith(folder) and p.endswith('.ts')):continue
   text=z.read(p).decode('utf-8');block=re.search(r'\bname:\s*\{([\s\S]*?)\}',text)
   english=literal(block.group(1),'en') if block else None;rarity=literal(text,'rarity');number=p.rsplit('/',1)[1][:-3]
   if not english or not rarity:missing.append(number);continue
   cardid=canonical+'-'+number;image=f'https://assets.tcgdex.net/en/{era}/{canonical}/{number}'
   cards.append({'id':cardid,'set_id':sid,'tier':tier(rarity,english),'metadataSource':'https://github.com/tcgdex/cards-database/blob/master/'+p.split('/',1)[1],'card':{'id':cardid,'name':english,'number':number,'set':name,'setId':sid,'rarity':rarity,'img':image+'/high.webp','thumb':image+'/low.webp','market':.1,'qty':1}})
  if missing:raise ValueError(f'{sid}: unresolved literal metadata: {missing}')
  if len(cards)<10:raise ValueError('Incomplete catalog '+sid)
  cards.sort(key=lambda c:c['id']);dest.write_text(json.dumps(cards,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(sid,len(cards),'cards')
 # Gallery/Vault identities belong to their parent game's expansion.
 subsets={'swsh12.5':(['swsh12.5gg'],'swsh12.5'),'swsh4.5':(['swsh4.5sv'],'swsh4.5'),'swsh9':(['swsh9.5tg','swsh9tg'],'swsh9'),'swsh10':(['swsh10.5tg','swsh10tg'],'swsh10'),'swsh11':(['swsh11.5tg','swsh11tg'],'swsh11'),'swsh12':(['swsh12.5tg','swsh12tg'],'swsh12'),'sm11.5':(['sma'],'sma')}
 for sid,(candidates,asset_set) in subsets.items():
  canonical=next((x for x in candidates if x in metadata),None)
  if not canonical:raise ValueError('Missing subset '+sid)
  dest=catalog/(sid+'.json');cards=json.loads(dest.read_text(encoding='utf-8'));known={c['id'] for c in cards};_,name,era=next(s for s in sets if s[0]==sid);folder=metadata[canonical][:-3]+'/'
  for p in paths:
   if not(p.startswith(folder) and p.endswith('.ts')):continue
   text=z.read(p).decode('utf-8');block=re.search(r'\bname:\s*\{([\s\S]*?)\}',text);english=literal(block.group(1),'en') if block else None;rarity=literal(text,'rarity');number=p.rsplit('/',1)[1][:-3];cardid=canonical+'-'+number
   if cardid in known:continue
   if not english or not rarity:raise ValueError('Incomplete subset metadata '+p)
   image=f'https://assets.tcgdex.net/en/{era}/{asset_set}/{number}'
   cards.append({'id':cardid,'set_id':sid,'tier':max(3,tier(rarity,english)),'metadataSource':'https://github.com/tcgdex/cards-database/blob/master/'+p.split('/',1)[1],'card':{'id':cardid,'name':english,'number':number,'set':name,'setId':sid,'rarity':rarity,'img':image+'/high.webp','thumb':image+'/low.webp','market':.1,'qty':1}})
  cards.sort(key=lambda c:c['id']);dest.write_text(json.dumps(cards,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(sid,'including subset:',len(cards))
provenance={'source':'https://github.com/tcgdex/cards-database','archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'note':'Literal name, rarity and identity metadata only. Source was not executed. Market values without API quotes use the existing $0.10 metadata fallback; battle scoring never uses prices.'}
(catalog/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n',encoding='utf-8')
