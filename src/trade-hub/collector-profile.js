import {escapeHtml as e, errorMessage} from './model.js';

export const collectorLink=(id,name)=>id?`<button type="button" class="hub-collector-link" data-collector-id="${e(id)}">${e(name||'Collector')}</button>`:e(name||'Collector');

export class CollectorProfile {
 constructor(view,banner,art){Object.assign(this,{view,banner,art});this.id=null;this.data=null;this.error='';this.revision=0;this.busy=false;}
 close(){this.id=null;this.data=null;this.busy=false;++this.revision;}
 async open(id){this.close();this.id=id;this.view.render();await this.load();this.view.root.querySelector('.hub-collector-profile')?.scrollIntoView?.({block:'start',behavior:'auto'});}
 async load(liked=null){
  if(this.busy||!this.id)return;const id=this.id,revision=this.revision,uid=this.view.controller.uid;this.busy=true;this.error='';this.view.render();let timer;
  try{const response=await Promise.race([this.view.controller.client.rpc('hub_collector_profile',{p_user_id:id,p_liked:liked}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Connection timed out. Try again.')),12000);})]);
   if(response.error)throw response.error;if(revision===this.revision&&uid===this.view.controller.uid)this.data=response.data;
  }catch(error){if(revision===this.revision)this.error=errorMessage(error);}
  finally{clearTimeout(timer);if(revision===this.revision){this.busy=false;this.view.render();}}
 }
 markup(){
  const d=this.data,p=d?.profile,own=this.id===this.view.controller.uid;
  const action=(a,label,disabled=false)=>`<button type="button" data-collector-action="${a}" ${disabled||this.busy?'disabled':''}>${label}</button>`;
  return `<section class="hub-collector-profile" aria-label="Collector profile"><header>${action('close','← Back')}<span class="hub-eyebrow">COLLECTOR PROFILE</span></header><div role="status">${e(this.error)}${this.error?action('retry','Try again'):''}</div>${p?`${this.banner(p)}<p class="social-presence ${d.online?'online':''}">${d.online?'● Online':'○ Offline'} · ${Number(d.likes)||0} profile likes</p><div class="hub-profile-actions">${own?'':action('like',d.liked?'♥ Liked':'♡ Like profile')}${own?'':d.friendship==='accepted'?action('message','Message'):d.friendship==='incoming'?action('accept','Accept friend request'):d.friendship==='outgoing'?'<span>Friend request sent</span>':action('friend','Add friend')}${own?'':action('battle','Battle')+action('trade','Trade')}</div><h3>Best hits</h3><p class="hub-footnote">Top cards in this collector’s saved Binder, ranked by rarity.</p><div class="hub-profile-hits">${(d.hits||[]).map(c=>`<article>${this.art(c)}<strong>${e(c.name)}</strong><small>${e(c.rarity)}</small></article>`).join('')||'<p>No saved hits yet.</p>'}</div><small class="hub-footnote">Online status updates within 90 seconds. Battle records follow this collector’s privacy setting.</small>`:`<p>${this.busy?'Loading collector…':'Sign in to view this collector.'}</p>`}</section>`;
 }
 async action(name){
  if(name==='close'){this.close();this.view.render();return;}
  if(name==='retry')return this.load();if(this.busy||!this.data)return;
  if(name==='like')return this.load(!this.data.liked);
  const peer=this.id,social=this.view.social;
  if(name==='friend'||name==='accept'){await social.mutate(name==='friend'?'request':'accept',{user_id:peer});if(this.id===peer){await this.load();if(social.error){this.error=social.error;this.view.render();}}return;}
  if(name==='message'){this.close();this.view.tab='friends';social.peer=peer;social.messages=[];social.hasOlder=false;this.view.render();await social.refresh();this.view.root.querySelector('.social-conversation')?.scrollIntoView?.({block:'start'});return;}
  if(name==='battle'||name==='trade'){
   const data=this.view.controller.state.data;
   if(!data){this.error='Connect to Trade Hub first.';this.view.render();return;}
   this.busy=true;this.view.render();
   const result=await this.view.run('room_create',{kind:name==='battle'?'battle':'trade',set_id:this.view.drafts.set_id||data.sets[0]?.set_id,pack_count:1});
   this.busy=false;if(this.id!==peer)return;
   if(!result?.room_id){this.error=this.view.notice||'Could not create the room. Try again.';this.view.render();return;}
   this.close();this.view.tab=name==='battle'?'battles':'trades';this.view.notice='Room ready. Copy the invite code and send it to your collector.';this.view.render();
  }
 }
}
