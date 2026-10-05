import {escapeHtml as e,errorMessage} from './model.js';

const button=(a,label,id='')=>`<button type="button" data-social-action="${a}" data-id="${e(id)}">${label}</button>`;
const socialError=error=>({FRIENDS_REQUIRED:'Accept a friend request before messaging.',PLAYER_UNAVAILABLE:'That collector is unavailable.',REQUEST_NOT_FOUND:'That friend request is no longer available.',SOCIAL_RATE_LIMIT:'Please wait a minute before sending more requests or messages.',FRIEND_LIMIT:'One of you has reached the 100-friend/request limit.',INVALID_MESSAGE:'Write a message of 1–500 characters.'}[error?.message]||errorMessage(error));

export class Social {
 constructor({client,notify=()=>{},active=()=>false,visible=()=>true,storage=globalThis.localStorage,clock=globalThis,uuid=()=>crypto.randomUUID()}){
  Object.assign(this,{client,notify,active,visible,storage,clock,uuid});this.uid=null;this.epoch=0;this.data={friends:[],blocked:[]};this.results=[];this.messages=[];this.drafts={};this.search='';this.peer=null;this.error='';this.pending=null;this.busy=false;
 }
 async rpc(action,payload={},request=null){
  let timer;try{
   const response=await Promise.race([this.client.rpc('hub_social',{p_action:action,p_payload:payload,p_request_id:request}),new Promise((_,reject)=>{timer=this.clock.setTimeout(()=>reject(Error('Connection timed out')),12000);})]);
   if(response.error)throw Object.assign(Error(response.error.message),{code:response.error.code});return response.data;
  }finally{this.clock.clearTimeout(timer);}
 }
 key(){return 'tcg-social-pending:'+this.uid;}
 async setUser(user){
  const uid=user?.id||null;if(uid===this.uid)return;const epoch=++this.epoch;
  this.clock.clearInterval(this.timer);if(this.channel)this.client.removeChannel(this.channel);this.channel=null;
  this.uid=uid;this.data={friends:[],blocked:[]};this.results=[];this.messages=[];this.drafts={};this.peer=null;this.search='';this.searched=false;this.hasOlder=false;this.error='';this.busy=false;this.task=null;this.pending=null;this.notify();
  if(!uid||!this.client)return;
  try{this.pending=JSON.parse(this.storage?.getItem(this.key())||'null');}catch{}
  this.channel=this.client.channel('hub-social:'+uid).on('postgres_changes',{event:'UPDATE',schema:'public',table:'hub_signals',filter:'topic=eq.social'},()=>{if(epoch===this.epoch&&this.visible())this.refresh();}).subscribe();
  this.lastPing=0;
  this.timer=this.clock.setInterval(()=>{if(!this.visible())return;if(Date.now()-this.lastPing>30000)this.presence();if(this.active())this.refresh();},6000);
  await this.resume();
 }
 async presence(){const epoch=this.epoch;this.lastPing=Date.now();try{await this.rpc('ping');if(epoch===this.epoch&&!this.active())await this.refresh();}catch{}}
 async refresh(){
  if(!this.uid||this.task||this.busy)return this.task;const epoch=this.epoch;
  const task=(async()=>{try{
   const data=await this.rpc('snapshot');if(epoch!==this.epoch)return;this.data=data;this.error='';
   if(this.peer&&!data.friends.some(f=>f.user_id===this.peer&&f.accepted)){this.peer=null;this.messages=[];}
   const peer=this.peer;
   if(peer&&this.active()){
    const result=await this.rpc('thread',{user_id:peer});if(epoch!==this.epoch||peer!==this.peer)return;
    const map=new Map(this.messages.map(m=>[m.id,m]));for(const m of result.messages)map.set(m.id,m);this.messages=[...map.values()].sort((a,b)=>a.id-b.id);
    this.hasOlder=result.messages.length===60||this.hasOlder;
    const last=this.messages.at(-1)?.id;if(last){await this.rpc('read',{user_id:peer,through:last});if(epoch!==this.epoch||peer!==this.peer)return;const friend=this.data.friends.find(f=>f.user_id===peer);if(friend)friend.unread=0;}
   }
  }catch(error){if(epoch===this.epoch&&this.visible())this.error=socialError(error);}finally{if(epoch===this.epoch)this.notify();}})();
  this.task=task;try{await task;}finally{if(this.task===task)this.task=null;}
 }
 async resume(){if(!this.uid||!this.visible())return;this.error='';await this.presence();if(this.pending)await this.mutate(null,null,true);else await this.refresh();}
 async mutate(action,payload,retry=false){
  if(this.busy)return;if(this.pending&&!retry){this.error='Check the pending action before starting another.';this.notify();return;}
  const epoch=this.epoch;this.busy=true;this.error='';this.notify();
  try{
   await this.task;if(epoch!==this.epoch)return;
   if(!retry){this.pending={action,payload,id:this.uuid()};this.storage?.setItem(this.key(),JSON.stringify(this.pending));}
   const p=this.pending;await this.rpc(p.action,p.payload,p.id);if(epoch!==this.epoch)return;
   if(p.action==='send'&&this.drafts[p.payload.user_id]===p.payload.message)this.drafts[p.payload.user_id]='';
   this.pending=null;this.storage?.removeItem(this.key());
  }catch(error){if(epoch===this.epoch){if(error.code&&!/^(50|PGRST00)/.test(error.code)){this.pending=null;this.storage?.removeItem(this.key());}this.error=socialError(error);}}
  finally{if(epoch===this.epoch){this.busy=false;this.notify();}}
  if(epoch===this.epoch&&!this.pending){const error=this.error;await this.refresh();if(error){this.error=error;this.notify();}}
 }
 async onClick(event){
  const b=event.target.closest('[data-social-action]');if(!b||b.disabled)return;const a=b.dataset.socialAction,id=b.dataset.id;
  if(a==='open'){this.peer=id;this.messages=[];this.hasOlder=false;this.error='';this.notify();await this.task;return this.refresh();}
  if(a==='retry')return this.pending?this.mutate(null,null,true):this.refresh();
  if(a==='older'){
   const peer=this.peer,epoch=this.epoch;try{const result=await this.rpc('thread',{user_id:peer,before:this.messages[0]?.id});if(epoch!==this.epoch||peer!==this.peer)return;const map=new Map([...result.messages,...this.messages].map(m=>[m.id,m]));this.messages=[...map.values()].sort((a,b)=>a.id-b.id);this.hasOlder=result.messages.length===60;this.notify();}catch(error){this.error=socialError(error);this.notify();}return;
  }
  return this.mutate(a,{user_id:id});
 }
 onInput(event){const {name,value}=event.target;if(name==='social-search')this.search=value;if(name==='social-message'&&this.peer)this.drafts[this.peer]=value;}
 async onSubmit(event){
  event.preventDefault();const form=event.target.closest('[data-social-form]');if(!form||this.busy)return;
  if(form.dataset.socialForm==='message')return this.mutate('send',{user_id:this.peer,message:(this.drafts[this.peer]||'').trim()});
  const epoch=this.epoch,term=this.search;try{const result=await this.rpc('search',{query:term});if(epoch!==this.epoch||term!==this.search)return;this.results=result.players;this.searched=true;this.error='';this.notify();}catch(error){if(epoch===this.epoch){this.error=socialError(error);this.notify();}}
 }
 markup(){
  if(!this.uid)return '<div class="hub-empty"><strong>Friends & messages</strong><p>Sign in through Profile → Settings to meet other collectors.</p></div>';
  const friend=this.data.friends.find(f=>f.user_id===this.peer&&f.accepted),accepted=this.data.friends.filter(f=>f.accepted),requests=this.data.friends.filter(f=>!f.accepted);
  const status=f=>`<span class="social-presence ${f.online?'online':''}" title="Online means active within the last 90 seconds">${f.online?'● Online':'○ Offline'}</span>`;
  return `<section data-social-root><div class="hub-section-title"><div><h2>Friends & messages</h2><p>Private conversations with accepted friends. Online status may take up to 90 seconds to change.</p></div></div><div role="status">${e(this.error)}${this.pending?button('retry','Retry pending action'):this.error?button('retry','Reconnect'):''}</div><div class="social-layout" ${this.busy?'aria-busy="true"':''}><aside class="hub-compose"><h3>Your friends <small>${accepted.length}</small></h3><div class="social-friends">${accepted.map(f=>`<article><strong>${e(f.name)}</strong>${status(f)}<small>${e(f.user_id.slice(0,8))} · ${f.rp} RP${f.unread?` · ${f.unread} unread`:''}</small><div>${button('open','Message',f.user_id)}${button('remove','Remove',f.user_id)}${button('block','Block',f.user_id)}</div></article>`).join('')||'<p>No friends yet. Search for a collector below.</p>'}</div><h3>Requests</h3>${requests.map(f=>`<article class="social-request"><strong>${e(f.name)}</strong><small>${f.requested_by===this.uid?'Request sent':'Wants to be your friend'}</small>${f.requested_by!==this.uid?button('accept','Accept',f.user_id):''}${button('remove',f.requested_by===this.uid?'Cancel':'Decline',f.user_id)}</article>`).join('')||'<p>No pending requests.</p>'}<form data-social-form="search"><label>Find a collector<input name="social-search" value="${e(this.search)}" minlength="2" maxlength="60" placeholder="Name or full collector ID" required></label><button type="submit">Search</button></form>${this.results.map(p=>`<article class="social-request"><strong>${e(p.name)}</strong><small>${e(p.user_id.slice(0,8))} · ${p.rp} RP</small>${this.data.friends.some(f=>f.user_id===p.user_id)?'<span>Already added</span>':button('request','Add friend',p.user_id)}</article>`).join('')|| (this.searched?'<p>No matching collectors.</p>':'')}<details><summary>Blocked collectors</summary>${this.data.blocked.map(p=>`<p>${e(p.name)} ${button('unblock','Unblock',p.user_id)}</p>`).join('')||'<p>None</p>'}</details></aside><section class="hub-compose social-conversation">${friend?`<header><h3>${e(friend.name)}</h3>${status(friend)}</header>${this.hasOlder?button('older','Load older messages'):''}<div class="social-messages" role="log" aria-label="Private messages">${this.messages.map(m=>`<article class="hub-message ${m.sender_id===this.uid?'mine':''}"><small>${m.sender_id===this.uid?'You':e(friend.name)} · ${e(new Date(m.created_at).toLocaleString())}</small><p>${e(m.body)}</p></article>`).join('')||'<p>Start your conversation.</p>'}</div><form data-social-form="message"><label>Private message<textarea name="social-message" maxlength="500" required placeholder="Write to your friend">${e(this.drafts[this.peer]||'')}</textarea></label><button type="submit" ${this.pending?'disabled':''}>${this.busy?'Sending…':'Send message'}</button></form><small>Only you and this friend can access this conversation through the game.</small>`:'<div class="hub-empty"><strong>Your collector circle</strong><p>Select a friend to open your private conversation.</p></div>'}</section></div></section>`;
 }
 dispose(){++this.epoch;this.uid=null;this.clock.clearInterval(this.timer);if(this.channel)this.client.removeChannel(this.channel);}
}
