"""Explicit maintenance: run only AFTER reviewed V262 SQL + QA allowlist.
Uses the two previously authorized isolated QA accounts, never existing players.
No schema/admin mutation. Logs contain timings/results, never tokens/passwords.
LEAGUE_QA_CREDENTIALS points to a private JSON file {accounts:[{id,name,email,password}]}.
This authenticated RPC runner does not substitute for browser/Realtime/mobile checks.
"""
import os,json,time,uuid,pathlib,urllib.request,urllib.error,concurrent.futures
BASE=os.environ['CARD_ASSET_SUPABASE_URL'].rstrip('/')
KEY=os.environ['SUPABASE_SERVICE_ROLE_KEY']
PRIVATE=pathlib.Path(os.environ['LEAGUE_QA_CREDENTIALS'])
ACCOUNTS=json.loads(PRIVATE.read_text())['accounts']
assert len(ACCOUNTS)==2 and all(a['name'].startswith('QA ') for a in ACCOUNTS),'Only labelled isolated QA accounts allowed'
ROWS=[];GAMES=[]
def request(a,path,body=None,method=None):
 headers={'apikey':KEY,'Content-Type':'application/json'}
 if a:headers['Authorization']='Bearer '+a['access_token']
 req=urllib.request.Request(BASE+path,data=None if body is None else json.dumps(body).encode(),headers=headers,method=method)
 start=time.monotonic()
 try:
  with urllib.request.urlopen(req,timeout=20) as response:raw=response.read();value=json.loads(raw)
 except urllib.error.HTTPError as error:
  try:message=json.loads(error.read()).get('message','HTTP failure')
  except Exception:message='HTTP failure'
  raise RuntimeError(f'{error.code}: {message}') from None
 if '/rpc/' in path:ROWS.append({'account':a['name'],'action':body.get('p_action'),'ms':round((time.monotonic()-start)*1000,1),'bytes':len(raw)})
 return value

def login(a):
 result=request(None,'/auth/v1/token?grant_type=password',{'email':a['email'],'password':a['password']})
 assert result['user']['id']==a['id'];a['access_token']=result['access_token']

def command(a,action,payload=None,receipt=None):
 return request(a,'/rest/v1/rpc/league_command',{'p_action':action,'p_payload':payload or {},'p_request_id':receipt or (None if action=='snapshot' else str(uuid.uuid4()))})
def match(a,action,m,extra=None,receipt=None):
 return command(a,action,{'match_id':m['id'],'revision':m['revision'],'turn':m['turn'],**(extra or {})},receipt)
def snapshot(a):return command(a,'snapshot')
def save(a):
 rows=request(a,'/rest/v1/user_saves?user_id=eq.'+a['id']+'&select=save_data,save_version');assert len(rows)==1
 raw=rows[0]['save_data'];return raw.get('state',raw)
def copies(s):return sum(int(c.get('qty',0)) for key in ['binder','bulkV64'] for c in s.get(key,{}).values())
def cost(c):return 12 if 'uncommon' in c.get('rarity','').lower() else [10,16,20,24,28,30][min(5,max(0,int(c.get('tier',0))))]
def squad(cards):return sorted(range(len(cards)),key=lambda i:(cost(cards[i]),i))[:5]
def delta(rp,opp,win):
 if win is None:return 0
 expected=1/(1+10**((opp-rp)/400));return max(12,min(28,int(40*(1-expected)+.5))) if win else -max(10,min(24,int(40*expected+.5)))
def choose(m,a,game):
 side='a' if m['host_id']==a['id'] else 'b';s=m['combat'][side];active=s['squad'][s['active']];turn=m['turn']
 if turn==3:
  target=next((i for i,c in enumerate(s['squad']) if i!=s['active'] and c['hp']>0),None)
  if target is not None:return {'kind':'swap','target':target}
 if turn==2:return {'kind':'defend'}
 if turn%4==0 and active['uses']>0 and active['cooldown']==0:return {'kind':'ability'}
 return {'kind':'attack'}

def main():
 for a in ACCOUNTS:login(a)
 states=[snapshot(a) for a in ACCOUNTS]
 assert all(s.get('enabled') for s in states),'Migration + isolated QA allowlist required; public access must remain OFF'
 assert all(not s.get('queue') and (not s.get('match') or s['match']['phase'] in ['result','cancelled']) for s in states),'Resume/finish existing QA match first; never overwrite it'
 a,b=ACCOUNTS;initial=[save(x) for x in ACCOUNTS]
 for game in range(10):
  start=time.monotonic();before=[save(x) for x in ACCOUNTS]
  command(a,'queue_join');s=command(b,'queue_join');queue_deadline=time.monotonic()+90
  while s.get('queue'):
   assert time.monotonic()<queue_deadline,'QA matchmaking did not converge within the widening window'
   time.sleep(1.5);s=command(b,'queue_tick');command(a,'queue_tick')
  m=s['match'];assert m['phase']=='clash'
  match(a,'ready',m);s=match(b,'ready',m);m=s['match'];assert m['phase']=='opening'
  aa=snapshot(a);pack_costs=[aa['match'].get('pack_cost'),m.get('pack_cost')];assert len(aa['match']['cards'])==len(m['cards'])==10;assert aa['match']['rules']==m['rules'];assert m['opponent_cards']==[]
  match(a,'reveal',m,{'progress':3});seen=snapshot(b);assert len(seen['match']['opponent_cards'])==3
  with concurrent.futures.ThreadPoolExecutor(3) as pool:list(pool.map(lambda n:match(a,'reveal',m,{'progress':n}),[5,4,10]))
  s=match(b,'reveal',m,{'progress':10});assert s['match']['phase']=='draft'
  for x in ACCOUNTS:
   d=snapshot(x);match(x,'draft_confirm',d['match'],{'indices':squad(d['match']['cards'])})
  s=snapshot(a);assert s['match']['phase']=='battle';turns=0
  while s['match']['phase']=='battle':
   m=s['match'];turns+=1;assert turns<=20
   pa={'action':choose(m,a,game)};pb={'action':choose(m,b,game)}
   receipt=str(uuid.uuid4());locked=match(a,'turn_submit',m,pa,receipt);again=match(a,'turn_submit',m,pa,receipt);assert locked['match']['revision']==again['match']['revision']
   peer=snapshot(b);assert peer['match']['opponent_locked'];assert 'action_a' not in peer['match'] and 'action_b' not in peer['match']
   if game in [2,5,8] and turns==1:
    # Reauthenticate and rebuild from the compact snapshot, with A's action locked.
    login(a);restored=snapshot(a);assert restored['match']['action_locked'];assert restored['match']['combat']==locked['match']['combat']
   if game==7 and turns==2:
    from datetime import datetime,timezone
    delay=max(0,(datetime.fromisoformat(m['deadline'].replace('Z','+00:00'))-datetime.now(timezone.utc)).total_seconds())+.2
    time.sleep(min(15,delay));s=match(a,'tick',m);assert s['match']['last_turn']['b']['kind']=='defend'
   else:s=match(b,'turn_submit',m,pb)
   other=snapshot(a);assert other['match']['revision']==s['match']['revision'];assert other['match']['combat']==s['match']['combat']
  assert s['match']['phase']=='result';result=s['match']['result'];after=[save(x) for x in ACCOUNTS]
  for i,x in enumerate(ACCOUNTS):
   r=result[x['id']];o=result[ACCOUNTS[1-i]['id']];win=None if result['winner'] is None else result['winner']==x['id']
   expected=max(0,r['before']+delta(r['before'],o['before'],win));assert r['after']==expected and r['delta']==expected-r['before']
   assert copies(after[i])-copies(before[i])==10;assert after[i].get('packs',0)-before[i].get('packs',0)==1
   # Existing credit order is authoritative; the only cash change is this pack.
   cost_paid=pack_costs[i]
   if cost_paid is not None:assert abs(before[i]['coins']-after[i]['coins']-cost_paid/100)<.001
  match(a,'cancel',s['match']);assert snapshot(a)['match']['result']==result
  GAMES.append({'match':s['match']['id'],'number':game+1,'turns':turns,'seconds':round(time.monotonic()-start,1),'result':result,'cardsAwarded':[10,10]})
  print('PASS authenticated Draft Duel',game+1,'turns',turns,flush=True)
 output={'scope':'authenticated RPC QA; mobile and websocket checks are separate','matches':GAMES,'rpc':ROWS,'largeCollectionCopies':copies(initial[0])}
 pathlib.Path('/tmp/v262-live-qa-results.json').write_text(json.dumps(output,indent=2))
 print('PASS 10 authenticated matches. No publication performed.',flush=True)
if __name__=='__main__':main()
