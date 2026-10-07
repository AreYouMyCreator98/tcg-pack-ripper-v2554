"""Read only the game's registered catalogues; never query unrelated sets."""
import json,re,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
def catalog():
 text=(ROOT/'public/runtime/core.js').read_text()
 registry=text.split('const SETS=[',1)[1].split('];',1)[0]
 sets=re.findall(r"\bid:'([^']+)'",registry)
 cards=[]
 for sid in sets:
  for c in json.loads((ROOT/f'public/catalog/{sid}.json').read_text()):
   if c['setId']!=sid:raise ValueError('Catalogue set mismatch')
   cards.append({'id':c['id'],'set':sid,'source':c.get('img') or c.get('thumb'),'custom':False})
 raw=(ROOT/'public/runtime/special-collection.js').read_text()
 specials=json.loads(raw.split('const SPECIAL_CARDS_V198=',1)[1].split(';',1)[0])
 cards += [{'id':c['id'],'set':'specials','source':c['art'],'custom':True} for c in specials]
 if len({c['id'] for c in cards})!=len(cards):raise ValueError('Duplicate card identity')
 return sets,cards
