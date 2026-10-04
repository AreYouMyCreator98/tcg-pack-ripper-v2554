import { HubController } from './controller.js';
import { HubView } from './view.js';
import { parsePrice } from './model.js';

export function installTradeHub(target=window,doc=document) {
  if(target.tcgTradeHub)return target.tcgTradeHub;
  const screen=doc.getElementById('earn');if(!screen)return;
  const root=doc.createElement('div');root.className='trade-hub';root.id='tradeHub';screen.prepend(root);
  const shops=screen.querySelector('.exchangeV154');
  const client=target.__tcgSupabaseClient;
  const bridge={
    begin:()=>target.tcgCloudV192?.beginHubTransaction?.()??Promise.reject(new Error('SYNC_REQUIRED')),
    hold:()=>target.tcgCloudV192?.holdHubTransaction?.(),
    finish:ok=>target.tcgCloudV192?.finishHubTransaction?.(ok)??Promise.reject(new Error('SYNC_REQUIRED')),
    reset:()=>target.tcgCloudV192?.resetHubTransaction?.(),
    sync:version=>target.tcgCloudV192?.syncHubSnapshot?.(version),
    active:()=>screen.classList.contains('active')&&doc.visibilityState!=='hidden',
    rank:(profile,data)=>target.tcgHubBridge?.applyRank?.(profile,data)
  };
  // The signed-out view and local district work even if the auth SDK is unavailable.
  const controller=new HubController({client,bridge,notify:state=>view.render(state)});
  const view=new HubView(root,controller,{shops});
  view.render();
  let authSubscription;
  if(client){
    let authRevision=0;
    const {data}=client.auth.onAuthStateChange((_event,session)=>{
      ++authRevision;
      // Do not await Supabase calls inside its auth callback.
      queueMicrotask(()=>controller.setUser(session?.user).catch(e=>controller.emit({status:'offline',error:e.message})));
    });authSubscription=data?.subscription;
    const initialRevision=authRevision;
    client.auth.getSession().then(({data,error})=>{if(error)throw error;if(authRevision===initialRevision)return controller.setUser(data?.session?.user);}).catch(e=>controller.emit({status:'offline',error:e.message}));
  }
  const resume=()=>controller.resume();
  const onVisible=()=>{if(doc.visibilityState!=='hidden')resume().catch(()=>{});};
  const onPageShow=event=>{if(event.persisted)onVisible();};
  target.addEventListener('pageshow',onPageShow);
  const onOnline=()=>controller.resume().catch(()=>{});
  const onNavigation=event=>{if(event.target.closest?.('.nav [data-s="earn"]'))controller.refresh();};
  doc.addEventListener('visibilitychange',onVisible);target.addEventListener('online',onOnline);
  doc.addEventListener('click',onNavigation);
  const dispose=()=>{authSubscription?.unsubscribe();view.dispose();controller.dispose();doc.removeEventListener('visibilitychange',onVisible);doc.removeEventListener('click',onNavigation);target.removeEventListener('online',onOnline);target.removeEventListener('pageshow',onPageShow);};
  target.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
  const listCard=async(cardId,price)=>{
    if(!controller.uid)throw new Error('Sign in through Profile Settings to list cards for other players.');
    const cents=parsePrice(price);
    // Leave ownership changes to the same server transaction used by the hub form.
    view.tab='market';view.query='';view.own=true;
    doc.getElementById('marketModalV57')?.classList.remove('show');
    doc.getElementById('cardModal')?.classList.remove('show');
    doc.querySelector('.nav [data-s="earn"]')?.click();
    try{await controller.command('listing_create',{card_id:cardId,price:cents});view.notice='Card listed for all players.';}
    finally{view.render();}
  };
  target.tcgTradeHub={controller,view,dispose,listCard};
  return target.tcgTradeHub;
}
