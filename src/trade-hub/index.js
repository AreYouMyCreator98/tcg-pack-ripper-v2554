import { installLeague } from '../league/index.js';
import { HubController } from './controller.js';
import { HubView } from './view.js';
import { parsePrice } from './model.js';
import { Social } from './social.js';

export function installTradeHub(target=window,doc=document) {
  if(target.tcgTradeHub)return target.tcgTradeHub;
  const screen=doc.getElementById('earn');if(!screen)return;
  const root=doc.createElement('div');root.className='trade-hub';root.id='tradeHub';screen.prepend(root);
  const shops=screen.querySelector('.exchangeV154');
  const client=target.__tcgSupabaseClient;
  let league;
  const leagueHeld=()=>league?.controller?.held||target.localStorage?.getItem('tcg-league-ready:'+target.tcgCloudV192?.user?.id)==='true';
  const bridge={
    begin:()=>target.tcgCloudV192?.beginHubTransaction?.()??Promise.reject(new Error('SYNC_REQUIRED')),
    hold:()=>target.tcgCloudV192?.holdHubTransaction?.(),
    finish:ok=>target.tcgCloudV192?.finishHubTransaction?.(ok)??Promise.reject(new Error('SYNC_REQUIRED')),
    reset:()=>leagueHeld()?undefined:target.tcgCloudV192?.resetHubTransaction?.(),
    sync:version=>leagueHeld()?Promise.resolve():target.tcgCloudV192?.syncHubSnapshot?.(version),
    active:()=>!league?.active()&&screen.classList.contains('active')&&doc.visibilityState!=='hidden',
    visible:()=>doc.visibilityState!=='hidden',
    rank:(profile,data)=>target.tcgHubBridge?.applyRank?.(profile,data)
  };
  // The signed-out view and local district work even if the auth SDK is unavailable.
  const controller=new HubController({client,bridge,notify:state=>{view.render(state);if(target.CustomEvent)target.dispatchEvent(new target.CustomEvent('tcg:hub-updated',{detail:state}));}});
  const view=new HubView(root,controller,{shops});
  const social=new Social({client,active:()=>view.tab==='friends'&&bridge.active(),visible:bridge.visible,notify:()=>{if(view.tab==='friends')view.render();else {const b=root.querySelector('[data-hub-tab="friends"]');if(b)b.textContent='Friends'+(social.data.friends.some(f=>f.unread)?' •':'');}}});
  view.social=social;
  league=installLeague({target,doc,client,bridge:{...bridge,reset:()=>target.tcgCloudV192?.resetHubTransaction?.(),sync:version=>target.tcgCloudV192?.syncHubSnapshot?.(version),rank:(p,d)=>bridge.rank(p,{...d,escrow:controller.state.data?.escrow,totals:controller.state.data?.totals})},hubRoot:root,hubView:view});
  const setUser=user=>{if(controller.uid!==(user?.id||null))target.tcgCardInspector?.close();social.setUser(user).catch(()=>{});const leagueTask=league.setUser(user);return Promise.all([controller.setUser(user),leagueTask]);};
  view.render();
  let authSubscription;
  if(client){
    let authRevision=0;
    const {data}=client.auth.onAuthStateChange((_event,session)=>{
      ++authRevision;
      // Do not await Supabase calls inside its auth callback.
      queueMicrotask(()=>setUser(session?.user).catch(e=>controller.emit({status:'offline',error:e.message})));
    });authSubscription=data?.subscription;
    const initialRevision=authRevision;
    client.auth.getSession().then(({data,error})=>{if(error)throw error;if(authRevision===initialRevision)return setUser(data?.session?.user);}).catch(e=>controller.emit({status:'offline',error:e.message}));
  }
  const resume=()=>{league.resume().catch(()=>{});view.notice='';social.resume().catch(()=>{});return league.active()?Promise.resolve():controller.resume();};
  const onVisible=()=>{if(doc.visibilityState!=='hidden')resume().catch(()=>{});else controller.suspend();};
  const onPageShow=event=>{if(event.persisted)onVisible();};
  target.addEventListener('pageshow',onPageShow);
  const onOnline=()=>resume().catch(()=>{});
  const onNavigation=event=>{if(event.target.closest?.('.nav [data-s="earn"]')){if(league.active())league.resume();else controller.refresh();}};
  doc.addEventListener('visibilitychange',onVisible);target.addEventListener('online',onOnline);
  doc.addEventListener('click',onNavigation);
  const dispose=()=>{authSubscription?.unsubscribe();league.dispose();view.dispose();controller.dispose();social.dispose();doc.removeEventListener('visibilitychange',onVisible);doc.removeEventListener('click',onNavigation);target.removeEventListener('online',onOnline);target.removeEventListener('pageshow',onPageShow);};
  target.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
  const listCard=async(cardId,price)=>{
    if(!controller.uid)throw new Error('Sign in through Profile Settings to list cards for other players.');
    const cents=parsePrice(price);
    // Leave ownership changes to the same server transaction used by the hub form.
    view.tab='market';view.query='';view.own=false;
    doc.getElementById('marketModalV57')?.classList.remove('show');
    doc.getElementById('cardModal')?.classList.remove('show');
    doc.querySelector('.nav [data-s="earn"]')?.click();
    try{await controller.command('listing_create',{card_id:cardId,price:cents});view.notice='Card listed for all players.';}
    finally{view.render();}
  };
  target.tcgTradeHub={controller,view,social,dispose,listCard};
  return target.tcgTradeHub;
}
