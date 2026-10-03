import { errorMessage } from './model.js';

const ECONOMIC = new Set(['listing_create','listing_buy','listing_cancel','trade_offer','room_ready','room_cancel','heartbeat']);
export class HubController {
  constructor({client,bridge={},storage=globalThis.localStorage,notify=()=>{},clock=globalThis,timeout=15000,uuid=()=>crypto.randomUUID()}) {
    Object.assign(this,{client,bridge,storage,notify,clock,timeout,uuid});
    this.state={status:'signed-out',data:null,error:'',busy:false,background:false,action:null,online:0};
    this.epoch=0; this.revision=0; this.uid=null; this.pending=null; this.channel=null; this.timer=null; this.refreshTask=null; this.disposed=false;
  }
  emit(patch={}) {Object.assign(this.state,patch); this.notify(this.state);}
  pendingKey() {return `tcg-hub-v256-pending:${this.uid}`;}
  persistPending() {
    if(this.pending)this.storage?.setItem(this.pendingKey(),JSON.stringify(this.pending));
    else this.storage?.removeItem(this.pendingKey());
  }
  async rpc(action,payload={},id=null) {
    let timer;
    try {
      const result=await Promise.race([
        this.client.rpc('hub_command',{p_action:action,p_payload:payload,p_request_id:id}),
        new Promise((_,reject)=>{timer=this.clock.setTimeout(()=>reject(Object.assign(new Error('Connection timed out. Retry the pending action to check its outcome.'),{uncertain:true})),this.timeout);})
      ]);
      if(result.error) {
        const e=Object.assign(new Error(result.error.message),{code:result.error.code});
        // PostgREST SQL failures roll back. Transport failures may have committed.
        e.uncertain=!result.error.code || /^(50|PGRST00)/.test(result.error.code);
        throw e;
      }
      if(result.data?.version!==256)throw Object.assign(new Error('Unexpected Trade Hub response. Refresh to reconnect.'),{uncertain:true});
      return result.data;
    } catch(e) {if(e.uncertain===undefined)e.uncertain=true;throw e;}
    finally {this.clock.clearTimeout(timer);}
  }
  async setUser(user) {
    if(this.disposed)return;
    const uid=user?.id||null;
    if(uid===this.uid && (this.state.data||this.state.status==='connecting'))return;
    const epoch=++this.epoch;
    this.uid=uid;
    this.emit({data:null,error:'',busy:false,background:false,action:null,status:uid?'connecting':'signed-out'});
    await this.disconnect();
    if(epoch!==this.epoch)return;
    this.pending=null;this.refreshTask=null;
    await this.bridge.reset?.();
    if(!uid)return;
    try {this.pending=JSON.parse(this.storage?.getItem(this.pendingKey())||'null');} catch {this.pending=null;}
    if(this.pending&&ECONOMIC.has(this.pending.action))await this.bridge.hold?.();
    await this.refresh();
    if(epoch!==this.epoch||this.disposed)return;
    this.channel=this.client.channel(`hub-v256:${uid}`)
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'hub_signals'},()=>{if(this.bridge.active?.()!==false)this.refresh();})
      .subscribe(status=>{if(epoch!==this.epoch)return; if(status==='SUBSCRIBED')this.refresh();else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')this.emit({status:'reconnecting'});});
    // Polling recovers dropped realtime events. It is bounded, account-scoped and cleaned up.
    this.timer=this.clock.setInterval(()=>{if(!this.state.busy&&this.bridge.active?.()!==false)this.refresh();},5000);
    this.heartbeatTimer=this.clock.setInterval(()=>{if(!this.pending&&!this.state.busy&&this.bridge.active?.()!==false)this.command('heartbeat',{}, {quiet:true}).catch(()=>{});},25000);
  }
  async refresh() {
    if(!this.uid||this.disposed||this.state.busy)return;
    if(this.refreshTask)return this.refreshTask;
    const epoch=this.epoch,revision=this.revision;
    const task=this.rpc('snapshot').then(async data=>{
      if(epoch!==this.epoch||revision!==this.revision||this.disposed)return;
      // A slow collection pull must not hide a newly matched opponent.
      // Economic controls still pass through beginHubTransaction before mutating.
      this.emit({data,status:'connected',error:this.pending?'An action needs recovery. Use Retry pending action before making another change.':''});
      if(!this.pending)await this.bridge.sync?.(data.save_version);
      if(epoch!==this.epoch||revision!==this.revision||this.disposed)return;
      this.emit({data,status:'connected',error:this.pending?'An action needs recovery. Use Retry pending action before making another change.':''});
      this.bridge.rank?.(data.profile,data);
    }).catch(e=>{if(epoch===this.epoch&&revision===this.revision&&!this.disposed)this.emit({status:'offline',error:errorMessage(e)});});
    this.refreshTask=task;
    try {await task;} finally {if(this.refreshTask===task)this.refreshTask=null;}
  }
  async command(action,payload={},options={}) {
    const epoch=this.epoch;
    if(this.state.busy&&this.state.background&&!options.quiet)await this.commandTask;
    if(epoch!==this.epoch||this.disposed)throw new Error('Account changed. Reconnect to continue.');
    if(this.state.busy)throw new Error('Another action is still finishing.');
    const task=this.performCommand(action,payload,options);this.commandTask=task;
    try {return await task;} finally {if(this.commandTask===task)this.commandTask=null;}
  }
  async performCommand(action,payload={}, {quiet=false,retry=false}={}) {
    if(!this.uid)throw new Error('AUTH_REQUIRED');
    if(this.state.busy)throw new Error('Another action is still finishing.');
    if(this.pending&&!retry)throw new Error('Retry the pending action first.');
    const uid=this.uid,epoch=this.epoch;
    ++this.revision;
    this.emit({busy:true,background:quiet,action,error:''});
    let economic=false;
    try {
      await this.refreshTask;
      if(epoch!==this.epoch||this.disposed)return;
      // Persist BEFORE sending. A reload after a lost response can reuse the same receipt.
      if(!retry) {
        economic=ECONOMIC.has(action);
        const version=economic?await this.bridge.begin?.():undefined;
        if(epoch!==this.epoch||this.disposed)return;
        if(version!==undefined&&['listing_create','trade_offer','room_ready'].includes(action))payload={...payload,save_version:version};
        this.pending={action,payload,id:this.uuid()};this.persistPending();
      } else {economic=ECONOMIC.has(this.pending.action);if(economic)await this.bridge.hold?.();}
      if(epoch!==this.epoch)throw new Error('Account changed. Reconnect to continue.');
      const {action:a,payload:p,id}=this.pending;
      const data=await this.rpc(a,p,id);
      if(epoch!==this.epoch||this.disposed)return;
      if(economic)await this.bridge.finish?.(true);
      if(epoch!==this.epoch||this.disposed)return;
      this.pending=null;this.persistPending();
      this.emit({data,status:'connected',error:''});
      this.bridge.rank?.(data.profile,data);
      return data;
    } catch(e) {
      if(epoch===this.epoch&&!this.disposed) {
        if(!e.uncertain) {this.pending=null;this.persistPending();}
        if(economic&&!e.uncertain)await this.bridge.finish?.(false).catch(()=>{});
        this.emit({error:errorMessage(e),status:e.uncertain?'recovering':this.state.status});
      }
      if(!quiet)throw e;
    } finally {if(epoch===this.epoch&&uid===this.uid&&!this.disposed)this.emit({busy:false,background:false,action:null});}
  }
  retry() {if(!this.pending)return this.refresh();return this.command(this.pending.action,this.pending.payload,{retry:true});}
  async disconnect() {
    this.clock.clearInterval(this.timer);this.clock.clearInterval(this.heartbeatTimer);
    this.timer=null;this.heartbeatTimer=null;
    const channel=this.channel;this.channel=null;
    if(channel)try{await this.client.removeChannel(channel);}catch{}
  }
  async dispose() {this.disposed=true;++this.epoch;await this.disconnect();}
}
