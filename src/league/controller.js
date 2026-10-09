import {transactionId} from '../utils/transaction-id.js';
export function phaseOf(data){if(data?.queue)return 'QUEUED';const m=data?.match;if(!m)return 'IDLE';return {clash:'CLASH',opening:'OPENING',draft:m.my_draft?'READY':'DRAFT',battle:m.action_locked?'RESOLVING':'BATTLE',result:'RESULT',cancelled:'IDLE'}[m.phase]||'IDLE';}
const terminal=m=>!m||['result','cancelled'].includes(m.phase);
// One account-scoped writer, coalesced reveal progress, compact authoritative reads.
export class LeagueController {
 constructor({client,bridge={},notify=()=>{},storage=globalThis.localStorage,uuid=transactionId,clock=globalThis}){Object.assign(this,{client,bridge,notify,storage,uuid,clock});this.state={phase:'IDLE',data:null,error:'',busy:false};this.epoch=0;this.uid=null;this.pending=null;this.visible=false;this.revealTarget=0;this.offset=0;this.metrics=[];this.readVersion=0;this.art=new Map();this.failures=0;this.nextReadAt=0;this.refreshQueued=false;}
 emit(p={}){Object.assign(this.state,p);this.notify(this.state);}
 key(){return 'tcg-league-pending:'+this.uid;}
 persist(){try{this.pending?this.storage?.setItem(this.key(),JSON.stringify(this.pending)):this.storage?.removeItem(this.key());}catch{}}
 async rpc(action,payload={},id=null){let timer;const start=performance.now();try{const r=await Promise.race([this.client.rpc('league_command',{p_action:action,p_payload:payload,p_request_id:id}),new Promise((_,reject)=>{timer=this.clock.setTimeout(()=>reject(Object.assign(Error('Connection interrupted. Reconnect to confirm your action.'),{uncertain:true})),10000);})]);if(r.error)throw Object.assign(Error(r.error.message),{uncertain:!r.error.code||/^PGRST00|^50/.test(r.error.code)});if(r.data?.version!==262)throw Object.assign(Error('League response unavailable.'),{uncertain:true});this.metrics.push({action,ms:performance.now()-start,bytes:JSON.stringify(r.data).length});if(this.metrics.length>100)this.metrics.shift();return r.data;}finally{this.clock.clearTimeout(timer);}}
 async accept(data,epoch){if(epoch!==this.epoch)return;this.offset=Date.parse(data.server_time)-Date.now();const old=this.state.data?.match;if(old?.id!==data.match?.id)this.revealTarget=0;this.revealTarget=Math.max(this.revealTarget,data.match?.my_progress||0);const identity=JSON.stringify(data.profile);if(identity!==this.lastIdentity){this.lastIdentity=identity;this.bridge.rank?.(data.profile,data);}this.emit({data,phase:phaseOf(data),error:''});this.loadArt(data,epoch);this.connect(epoch);
  try{if(data.match?.phase==='clash'&&data.match.my_ready)this.storage?.setItem('tcg-league-ready:'+this.uid,'true');}catch{}
  // Keep the economic barrier until BOTH packs are committed, including reloads.
  const waiting=(data.match?.phase==='clash'&&data.match.my_ready)||this.pending?.action==='ready';
  if(waiting){this.held=true;this.bridge.hold?.();}
  else if(this.held){await this.bridge.finish?.(true);if(epoch===this.epoch){this.held=false;try{this.storage?.removeItem('tcg-league-ready:'+this.uid);}catch{}}}
  else await this.bridge.sync?.(data.save_version);
 }
 loadArt(data,epoch){for(const p of [data.match?.host_profile,data.match?.guest_profile]){const id=p?.user_id;if(!id||this.art.has(id))continue;if(p.ai_collector){this.art.set(id,p.avatar||'');continue;}this.art.set(id,null);this.client.rpc('league_identity_art',{p_user_id:id}).then(({data:art,error})=>{if(epoch!==this.epoch)return;if(!error){this.art.set(id,art?.avatar||'');if(this.art.size>8)this.art.delete(this.art.keys().next().value);this.emit();}}).catch(()=>{});}}
 async setUser(user){if(this.disposed)return;const uid=user?.id||null;if(uid===this.uid)return;if(this.uid)this.bridge.reset?.();this.disconnect();const epoch=++this.epoch;this.uid=uid;this.pending=null;this.held=false;this.revealTarget=0;this.art.clear();this.lastIdentity=null;this.emit({data:null,error:'',phase:'IDLE',busy:false});if(!uid||!this.client)return;
  try{this.pending=JSON.parse(this.storage?.getItem(this.key())||'null');}catch{}
  let held=false;try{held=this.storage?.getItem('tcg-league-ready:'+uid)==='true';}catch{}
  if(this.pending?.action==='ready'||held){this.held=true;this.bridge.hold?.();}
  await this.refresh();if(epoch!==this.epoch||!this.state.data?.enabled)return;
  this.connect(epoch);
 }
 connect(epoch=this.epoch){if(this.channel||!this.state.data?.enabled||typeof this.client?.channel!=='function')return;
  this.channel=this.client.channel('league:'+this.uid).on('postgres_changes',{event:'*',schema:'public',table:'league_signals',filter:'user_id=eq.'+this.uid},()=>{if(epoch!==this.epoch||this.disposed)return;if(this.bridge.visible?.()===false){this.refreshQueued=true;return;}this.refresh();}).subscribe(status=>{if(epoch!==this.epoch)return;if(status==='SUBSCRIBED')this.refresh();});
  this.timer=this.clock.setInterval(()=>{if(this.bridge.visible?.()===false)return;if(this.visible||!terminal(this.state.data?.match)||this.state.data?.queue)this.pulse();},1500);
 }

 refresh(){
  if(this.disposed||!this.uid||Date.now()<this.nextReadAt)return Promise.resolve();
  if(this.read||this.write){this.refreshQueued=true;return this.read||this.write;}
  const epoch=this.epoch,version=this.readVersion;
  this.read=(async()=>{try{const data=await this.rpc('snapshot');if(version===this.readVersion){await this.accept(data,epoch);this.failures=0;this.nextReadAt=0;}}catch(e){if(epoch===this.epoch){this.nextReadAt=Date.now()+Math.min(30000,1500*2**Math.min(++this.failures,5));this.emit({phase:'RECONNECTING',error:e.message});}}finally{if(epoch===this.epoch){this.read=null;this.flushRefresh();}}})();return this.read;
 }
 flushRefresh(){if(!this.refreshQueued||this.write||this.read)return;this.refreshQueued=false;queueMicrotask(()=>this.refresh());}

 async command(action,payload={}){if(this.write)return this.write;if(this.pending&&this.pending.action!==action)throw Error('Reconnect to confirm the pending action first.');const epoch=this.epoch;++this.readVersion;
  this.write=(async()=>{this.emit({busy:true,error:''});try{
   if(action==='ready'&&!this.held){await this.bridge.begin?.();this.held=true;try{this.storage?.setItem('tcg-league-ready:'+this.uid,'true');}catch{}}
   if(epoch!==this.epoch)return;
   if(!this.pending){this.pending={action,payload,id:this.uuid()};this.persist();}
   const p=this.pending;const data=await this.rpc(p.action,p.payload,p.id);if(epoch!==this.epoch)return;this.pending=null;this.persist();await this.accept(data,epoch);
  }catch(e){if(epoch!==this.epoch)return;if(e.uncertain===false){this.pending=null;this.persist();if(this.held&&action==='ready'){await this.bridge.finish?.(false);this.held=false;}}this.emit({error:e.message,phase:e.uncertain?'RECONNECTING':phaseOf(this.state.data)});throw e;
  }finally{if(epoch===this.epoch){this.write=null;this.emit({busy:false});this.flushRefresh();}}})();return this.write;
 }
 matchCommand(action,payload={}){const m=this.state.data?.match;if(!m)return Promise.reject(Error('No active match.'));return this.command(action,{match_id:m.id,revision:m.revision,turn:m.turn,...payload});}
 reveal(progress){this.revealTarget=Math.min(10,Math.max(this.revealTarget,progress));this.emit();if(this.revealing)return this.revealing;this.revealing=(async()=>{try{while(this.state.data?.match?.phase==='opening'&&this.revealTarget>(this.state.data.match.my_progress||0)){if(this.write)await this.write;await this.matchCommand('reveal',{progress:this.revealTarget});}}finally{this.revealing=null;}})();return this.revealing;}
 async pulse(){if(this.write||Date.now()<this.nextReadAt)return;try{if(this.pending){await this.command(this.pending.action,this.pending.payload);return;}const d=this.state.data;if(d?.queue)await this.command('queue_tick');else if(!terminal(d?.match)&&Date.parse(d.match.deadline)<=Date.now()+this.offset)await this.matchCommand('tick');else await this.refresh();}catch{}}
 async resume(){this.nextReadAt=0;await this.refresh();await this.pulse();}
 disconnect(){this.clock.clearInterval(this.timer);if(this.channel)this.client?.removeChannel(this.channel);this.channel=null;this.refreshQueued=false;this.nextReadAt=0;this.failures=0;this.read=null;this.write=null;this.revealing=null;}
 dispose(){this.disposed=true;++this.epoch;this.uid=null;this.disconnect();}
}
