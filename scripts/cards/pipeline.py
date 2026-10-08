"""Explicit maintenance only. Downloads/checkpoints stay in ignored .temp/."""
import io,shutil,fcntl,argparse,concurrent.futures,hashlib,json,os,pathlib,subprocess,tempfile,threading,time,urllib.request,urllib.error
from catalog import ROOT,catalog
os.environ.setdefault('MAGICK_THREAD_LIMIT','1')
MAGICK=shutil.which('magick') or shutil.which('convert') or 'magick'
TIERS={'thumb':(200,75),'medium':(500,85),'high':(1000,92)}
LOCK=threading.Lock()
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def atomic(path,data):
 path.parent.mkdir(parents=True,exist_ok=True)
 tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(data,separators=(',',':'))+'\n');tmp.replace(path)
def request(url,method='GET',data=None,headers=None):
 for attempt in range(5):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,data=data,method=method,headers=headers or {}),timeout=30) as r:return r.status,dict(r.headers),r.read()
  except urllib.error.HTTPError as e:
   body=e.read();e=urllib.error.HTTPError(e.url,e.code,e.msg,e.headers,io.BytesIO(body))
   transient_key=e.code==400 and headers and 'apikey' in headers and (b'Invalid Compact JWS' in body or (b'headers must have required property' in body and b'authorization' in body))
   if (e.code not in (429,500,502,503,504) and not transient_key) or attempt==4:raise e from None
   if transient_key:
    headers=dict(headers)
    if b'Invalid Compact JWS' in body:headers.pop('Authorization',None)
    else:headers['Authorization']='Bearer '+headers['apikey']
    time.sleep(.2*(attempt+1));continue
  except (TimeoutError,OSError):
   if attempt==4:raise
  time.sleep(1+attempt)
def public_bytes(url,sha):
 # Bypass a cached missing-object response from the pre-upload HEAD request.
 for attempt in range(5):
  try:return request(url+'?verify='+sha,headers={'Cache-Control':'no-cache'})[2]
  except urllib.error.HTTPError as error:
   if error.code not in (400,404) or attempt==4:raise
   time.sleep(.5*(attempt+1))
def dimensions(path):
 out=subprocess.check_output([MAGICK,'-regard-warnings',str(path),'-format','%m %w %h','info:'],stderr=subprocess.DEVNULL,text=True).split()
 if len(out)!=3:raise ValueError('Animated/multiple or invalid image')
 fmt,w,h=out[0],int(out[1]),int(out[2])
 if fmt not in ('WEBP','PNG','JPEG') or w<150 or h<200 or w>6000 or h>8000 or not .55<w/h<.85:raise ValueError('Invalid card image format/dimensions')
 return w,h
def valid_local(rec,folder,source):
 try:return rec['source']==source and all((folder/(q+'.webp')).is_file() and digest(folder/(q+'.webp'))==rec['tiers'][q]['sha256'] for q in TIERS)
 except (KeyError,OSError):return False

def main():
 p=argparse.ArgumentParser();p.add_argument('action',choices=['sync','audit']);p.add_argument('--set',dest='set_id');p.add_argument('--card',action='append');p.add_argument('--retry-failed',action='store_true');p.add_argument('--resume-verified',action='store_true',help='Trust complete previously verified manifest entries; omit for remote revalidation');p.add_argument('--dry-run',action='store_true');p.add_argument('--local-only',action='store_true');p.add_argument('--create-bucket',action='store_true');p.add_argument('--limit',type=int);p.add_argument('--concurrency',type=int,default=3);p.add_argument('--max-total-mb',type=int,default=2048);args=p.parse_args()
 sets,cards=catalog();allcards=cards
 if args.set_id:
  if args.set_id not in sets+['specials']:p.error('Set is not currently playable')
  cards=[c for c in cards if c['set']==args.set_id]
 if args.card:
  unknown=set(args.card)-{c['id'] for c in cards}
  if unknown:p.error('Unknown/nonselected card IDs: '+','.join(sorted(unknown)))
  cards=[c for c in cards if c['id'] in args.card]
 cache=ROOT/'.temp/card-mirror';statefile=cache/'state.json';state=json.loads(statefile.read_text()) if statefile.exists() else {'cards':{},'failures':{}}
 if args.retry_failed:cards=[c for c in cards if c['id'] in state['failures']]
 if args.limit is not None:
  if args.limit<1:p.error('limit must be positive')
  cards=cards[:args.limit]
 manifestpath=ROOT/'public/card-assets.json';manifest=json.loads(manifestpath.read_text()) if manifestpath.exists() else {'version':1,'cards':{}}
 def valid(c):return valid_local(state['cards'].get(c['id'],{}),cache/c['set']/c['id'],c['source'])
 def mirrored(c):return all(manifest['cards'].get(c['id'],{}).get(q) for q in TIERS)
 if args.action=='audit' or args.dry_run:
  local=[c for c in cards if valid(c)];uploaded=[c for c in cards if mirrored(c)];sizes={q:sum(state['cards'][c['id']]['tiers'][q]['bytes'] for c in local) for q in TIERS}
  storage={q:sum(manifest['cards'][c['id']].get('bytes',{}).get(q,0) for c in uploaded) for q in TIERS}
  print(json.dumps({'playableSets':len(sets),'uniqueCards':len(allcards),'selected':len(cards),'custom':sum(c['custom'] for c in cards),'external':sum(not c['custom'] for c in cards),'missingSource':sum(not c['source'] for c in cards),'separatePrintingRecords':0,'mirrored':len(uploaded),'missingMirror':len(cards)-len(uploaded),'fallbackOnly':len(cards)-len(uploaded),'localValid':len(local),'invalidLocal':sum(c['id'] in state['cards'] and not valid(c) for c in cards),'failed':{c['id']:state['failures'][c['id']] for c in cards if c['id'] in state['failures']},'localBytes':sizes,'uploadedBytes':storage,'averageLocalBytes':{q:round(n/max(1,len(local))) for q,n in sizes.items()},'largestLocal':sorted([{'id':c['id'],'bytes':sum(t['bytes'] for t in state['cards'][c['id']]['tiers'].values())} for c in local],key=lambda x:x['bytes'],reverse=True)[:10],'wouldDownload':sum(not c['custom'] and not valid(c) and (args.local_only or not mirrored(c)) and not (cache/c['set']/c['id']/'source.image').exists() for c in cards),'wouldConvert':sum(not valid(c) and (args.local_only or not mirrored(c)) for c in cards),'wouldUpload':0 if args.local_only else sum(not mirrored(c) for c in cards)*3,'wouldSkip':len(local) if args.local_only else len(uploaded)},indent=2));return
 base=os.environ.get('CARD_ASSET_SUPABASE_URL','').rstrip('/');bucket=os.environ.get('CARD_ASSET_BUCKET','card-assets');key=os.environ.get('SUPABASE_SERVICE_ROLE_KEY','')
 if not args.local_only and (not base.startswith('https://') or not key):p.error('Upload requires CARD_ASSET_SUPABASE_URL and build-side SUPABASE_SERVICE_ROLE_KEY. Use --local-only for preparation.')
 if not re_safe(bucket):p.error('Invalid bucket name')
 if not args.local_only:
  auth={'apikey':key} # Start with API-key auth; request() handles gateway-required context.
  try:
   _,_,raw=request(base+'/storage/v1/bucket/'+bucket,headers=auth)
   if not json.loads(raw).get('public'):p.error('Existing bucket is private; use a dedicated public card-assets bucket. No policies were changed.')
  except urllib.error.HTTPError as e:
   if e.code not in (400,404) or not args.create_bucket:raise
   request(base+'/storage/v1/bucket',method='POST',headers={**auth,'Content-Type':'application/json'},data=json.dumps({'id':bucket,'name':bucket,'public':True,'allowed_mime_types':['image/webp'],'file_size_limit':20971520}).encode())
 cache.mkdir(parents=True,exist_ok=True)
 lockfile=open(cache/'sync.lock','w')
 try:fcntl.flock(lockfile,fcntl.LOCK_EX|fcntl.LOCK_NB)
 except BlockingIOError:p.error('Another card sync is running; resume after it finishes.')
 total=sum(t['bytes'] for r in state['cards'].values() for t in r.get('tiers',{}).values())
 def job(c):
  nonlocal total
  folder=cache/c['set']/c['id'];rec=state['cards'].get(c['id'],{})
  try:
   if mirrored(c) and not args.local_only:
    if args.resume_verified:
     with LOCK:
      if c['id'] in state['failures']:state['failures'].pop(c['id'],None);atomic(statefile,state)
     print('SKIP VERIFIED',c['id'],flush=True);return
    entry=manifest['cards'][c['id']]
    intact=True
    for q in TIERS:
     try:
      _,headers,_=request(entry[q],method='HEAD')
      intact=intact and int(next((v for k,v in headers.items() if k.lower()=='content-length'),'0'))==entry.get('bytes',{}).get(q,-1)
     except Exception:intact=False
    if intact:
     with LOCK:state['failures'].pop(c['id'],None);atomic(statefile,state)
     print('SKIP',c['id'],flush=True);return
   if not valid(c):
    folder.mkdir(parents=True,exist_ok=True);source=folder/'source.image'
    if not source.exists():
     if c['custom']:data=(ROOT/'public'/c['source']).read_bytes()
     else:
      try:_,headers,data=request(c['source'])
      except urllib.error.HTTPError as error:
       # Some source cards have a valid PNG but no WebP export. Preserve identity.
       if error.code!=404 or not c['source'].startswith('https://assets.tcgdex.net/') or not c['source'].endswith('/high.webp'):raise
       _,headers,data=request(c['source'][:-4]+'png')
      if not next((v for k,v in headers.items() if k.lower()=='content-type'),'').startswith('image/'):raise ValueError('Source returned non-image content type')
     if not 1000<len(data)<20*1024*1024:raise ValueError('Invalid image byte size')
     part=folder/'source.part';part.write_bytes(data)
     try:dimensions(part)
     except Exception:part.unlink(missing_ok=True);raise
     part.replace(source)
    w,h=dimensions(source);tiers={}
    for q,(width,quality) in TIERS.items():
     dest=folder/(q+'.webp');part=folder/(q+'.part.webp')
     subprocess.run([MAGICK,'-regard-warnings',str(source),'-auto-orient','-resize',str(width)+'x>','-strip','-quality',str(quality),str(part)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
     dw,dh=dimensions(part);part.replace(dest);tiers[q]={'bytes':dest.stat().st_size,'sha256':digest(dest),'width':dw,'height':dh}
    rec={'source':c['source'],'sourceWidth':w,'sourceHeight':h,'tiers':tiers}
    with LOCK:
     total+=sum(t['bytes'] for t in tiers.values())-sum(t['bytes'] for t in state['cards'].get(c['id'],{}).get('tiers',{}).values());state['cards'][c['id']]=rec;atomic(statefile,state)
   # A native WebP already within the tier bound needs no lossy re-encode.
   # Also applies on resume, so prepared libraries gain this optimization safely.
   source=folder/'source.image'
   if source.exists():
    native=source.read_bytes()
    if native[:4]==b'RIFF' and native[8:12]==b'WEBP':
     saved=0
     for q,t in rec['tiers'].items():
      if rec['sourceWidth']<=TIERS[q][0] and len(native)<t['bytes']:
       if dimensions(source)!=(rec['sourceWidth'],rec['sourceHeight']):raise ValueError('Cached source dimensions changed')
       dest=folder/(q+'.webp');part=folder/(q+'.part.webp');part.write_bytes(native);part.replace(dest)
       saved+=t['bytes']-len(native);rec['tiers'][q]={'bytes':len(native),'sha256':digest(dest),'width':rec['sourceWidth'],'height':rec['sourceHeight']}
     if saved:
      with LOCK:total-=saved;state['cards'][c['id']]=rec;atomic(statefile,state)
   with LOCK:
    if total>args.max_total_mb*1024*1024:raise ValueError('Storage budget exceeded; stop and review before any further upload')
   if not args.local_only:
    entry={'set':c['set'],'source':'supabase','custom':c['custom'],'fallback':c['source'],'bytes':{q:t['bytes'] for q,t in rec['tiers'].items()}}
    auth={'apikey':key} # Start with API-key auth; request() handles gateway-required context.
    for q,t in rec['tiers'].items():
     path='/'.join(['cards',c['set'],c['id'],t['sha256'][:20],q+'.webp']);obj=base+'/storage/v1/object/'+bucket+'/'+path;public=base+'/storage/v1/object/public/'+bucket+'/'+path
     # Create atomically without overwrite; avoid a negative CDN HEAD cache.
     try:request(obj,method='POST',data=(folder/(q+'.webp')).read_bytes(),headers={**auth,'Content-Type':'image/webp','Cache-Control':'public, max-age=31536000, immutable','x-upsert':'false'})
     except urllib.error.HTTPError as error:
      if error.code not in (400,409):raise
      if error.code==400:
       try:detail=json.loads(error.read())
       except Exception:detail={}
       if detail.get('code')!='KeyAlreadyExists' and detail.get('error')!='Duplicate':raise RuntimeError('Upload rejected: '+str(detail.get('code') or error.code)+' '+str(detail.get('message') or 'Bad request'))
      # A resumed object may already exist. Only checksum-verified public bytes
      # below can establish success; other 400s cannot publish missing art.
     # Do not publish private/unreadable objects to browsers.
     remote=public_bytes(public,t['sha256'])
     if hashlib.sha256(remote).hexdigest()!=t['sha256']:raise ValueError('Uploaded object checksum mismatch')
     entry[q]=public
    with LOCK:
     manifest['cards'][c['id']]=entry;manifest['generatedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());atomic(manifestpath,manifest)
   with LOCK:
    state['failures'].pop(c['id'],None);atomic(statefile,state)
   print('READY' if args.local_only else 'MIRRORED',c['id'],flush=True)
  except Exception as e:
   if isinstance(e,urllib.error.HTTPError):
    try:
     detail=json.loads(e.read());e=RuntimeError(str(e)+' '+str(detail.get('code') or detail.get('error') or '')+' '+str(detail.get('message') or ''))
    except Exception:pass
   with LOCK:
    state['failures'][c['id']]={'set':c['set'],'source':c['source'],'reason':str(e)[:300]};atomic(statefile,state)
   print('FAILED',c['id'],type(e).__name__,flush=True)
 try:
  with concurrent.futures.ThreadPoolExecutor(max_workers=max(1,min(6 if args.local_only else 32,args.concurrency))) as pool:list(pool.map(job,cards))
 finally:lockfile.close()
 if any(c['id'] in state['failures'] for c in cards):raise SystemExit(1)
def re_safe(s):return bool(s) and all(c.isalnum() or c in '-_' for c in s)
if __name__=='__main__':main()
