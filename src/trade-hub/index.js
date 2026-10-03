import { HubController } from './controller.js';
import { HubView } from './view.js';

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
  const resume=async()=>{await controller.refresh();if(controller.uid&&!controller.pending&&!controller.state.busy)await controller.command('heartbeat',{}, {quiet:true});};
  const onVisible=()=>{if(doc.visibilityState!=='hidden')resume().catch(()=>{});};
  const onPageShow=event=>{if(event.persisted)onVisible();};
  target.addEventListener('pageshow',onPageShow);
  const onOnline=()=>controller.refresh();
  const onNavigation=event=>{if(event.target.closest?.('.nav [data-s="earn"]'))controller.refresh();};
  doc.addEventListener('visibilitychange',onVisible);target.addEventListener('online',onOnline);
  doc.addEventListener('click',onNavigation);
  const dispose=()=>{authSubscription?.unsubscribe();view.dispose();controller.dispose();doc.removeEventListener('visibilitychange',onVisible);doc.removeEventListener('click',onNavigation);target.removeEventListener('online',onOnline);target.removeEventListener('pageshow',onPageShow);};
  target.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
  target.tcgTradeHub={controller,view,dispose};
  return target.tcgTradeHub;
}
