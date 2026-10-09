"""Explicit QA maintenance after reviewed V263 SQL/scheduler + isolated QA allowlist.
Runs twenty real matches, leaves public enablement unchanged. Does not certify
physical phone performance/Realtime delivery; those need separate browser checks.
Uses LEAGUE_QA_CREDENTIALS; never prints secrets. Refuses occupied QA accounts.
"""
import importlib.util,pathlib,time,json,uuid
spec=importlib.util.spec_from_file_location('league_live',pathlib.Path(__file__).with_name('verify-league-live.py'))
qa=importlib.util.module_from_spec(spec);spec.loader.exec_module(qa)

def run():
 for a in qa.ACCOUNTS:
  qa.login(a);s=qa.snapshot(a)
  assert not s.get('queue') and (not s.get('match') or s['match']['phase'] in ['result','cancelled']),'QA account in use: finish existing match first'
 games=[]
 for game in range(20):
  a=qa.ACCOUNTS[game%2];before=qa.save(a);start=time.monotonic();s=qa.command(a,'queue_join')
  while s.get('queue'):
   assert time.monotonic()-start<25,'No AI fallback: check reviewed migration, QA allowlist and scheduler health'
   time.sleep(.8);s=qa.command(a,'queue_tick')
  m=s['match'];assert m['rules'].get('ai_collector') is True,'Matched human: stop automation; do not auto-play against real players'
  queue_ms=round((time.monotonic()-start)*1000);assert m['guest_profile']['ai_collector'] is True
  receipt=str(uuid.uuid4());s=qa.match(a,'ready',m,receipt=receipt);again=qa.match(a,'ready',m,receipt=receipt);assert s['match']['id']==again['match']['id']
  awarded=qa.save(a);assert awarded.get('packs',0)==before.get('packs',0)+1;assert qa.copies(awarded)==qa.copies(before)+10
  assert abs(awarded['coins']-(before['coins']-m['pack_cost']/100))<.011
  m=s['match'];assert len(m['cards'])==10
  qa.match(a,'reveal',m,{'progress':3});qa.match(a,'reveal',m,{'progress':10});qa.match(a,'reveal',m,{'progress':6})
  deadline=time.monotonic()+60;progress=0;seen=[]
  while True:
   s=qa.snapshot(a);m=s['match'];assert m['opponent_progress']>=progress;progress=m['opponent_progress'];seen.append(progress)
   if m['phase']!='opening':break
   assert len(m['opponent_cards'])==progress;assert time.monotonic()<deadline,'Opening stalled';time.sleep(.7)
  assert m['phase']=='draft';qa.match(a,'draft_confirm',m,{'indices':qa.squad(m['cards'])})
  deadline=time.monotonic()+30
  while True:
   s=qa.snapshot(a);m=s['match']
   if m['phase']=='battle':break
   assert time.monotonic()<deadline,'Draft stalled';time.sleep(.6)
  actions=set();last=0;deadline=time.monotonic()+360
  while m['phase']=='battle':
   assert time.monotonic()<deadline,'Battle stalled';assert 'action_b' not in m and 'action_a' not in m
   if not m['action_locked']:
    action=qa.choose(m,a,game);actions.add(action['kind']);receipt=str(uuid.uuid4());qa.match(a,'turn_submit',m,{'action':action},receipt);qa.match(a,'turn_submit',m,{'action':action},receipt)
   if m['turn']==4 and last!=4:
    # Server worker must continue with this account issuing NO commands.
    time.sleep(4);qa.login(a)
   last=m['turn'];time.sleep(.6);m=qa.snapshot(a)['match']
  assert m['phase']=='result';result=m['result'];delta=result[a['id']];ai=result[m['guest_id']]
  expected=qa.delta(delta['before'],ai['before'],None if result['winner'] is None else result['winner']==a['id'])
  if expected>0:expected=int(expected*m['rules']['ai_rp_modifier']+.5)
  expected=max(0,delta['before']+expected)-delta['before'];assert delta['delta']==expected
  assert delta['after']==delta['before']+delta['delta'];assert qa.save(a)==awarded
  qa.match(a,'cancel',m);assert qa.snapshot(a)['match']['result']==result;assert qa.save(a)==awarded
  row={'game':game+1,'match':m['id'],'queue_ms':queue_ms,'elapsed_seconds':round(time.monotonic()-start,1),'turns':m['turn']-1,'actions':sorted(actions),'opponent_progress_samples':seen,'rp_delta':delta['delta'],'passed':True};games.append(row);print(json.dumps(row),flush=True)
  pathlib.Path('docs/v263/live-qa-results.json').write_text(json.dumps({'games':games,'rpc':qa.ROWS,'limitations':'Authenticated RPC QA; not physical phone or Realtime websocket verification'},indent=2)+'\n')
 assert len(games)==20
if __name__=='__main__':run()
