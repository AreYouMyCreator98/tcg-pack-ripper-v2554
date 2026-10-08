import {LeagueController} from './controller.js';
import {LeagueView} from './view.js';
export function installLeague({target=window,doc=document,client,bridge,hubRoot,hubView}){
 const root=doc.createElement('div');root.id='collectorLeague';root.hidden=true;hubRoot.after(root);
 const launch=doc.createElement('button');launch.type='button';launch.className='league-launch';launch.textContent='Collector League · Draft Duel QA';launch.hidden=true;root.after(launch);
 let view,lastIdentity;const controller=new LeagueController({client,bridge,notify:()=>{if(!view)return;launch.hidden=!controller.state.data?.enabled;view.render();const identity=JSON.stringify(controller.state.data?.profile);if(lastIdentity!==identity){lastIdentity=identity;if(target.CustomEvent)target.dispatchEvent(new target.CustomEvent('tcg:profile-updated'));}}});
 const close=()=>{controller.visible=false;root.hidden=true;hubRoot.hidden=false;hubView.render();};
 view=new LeagueView(root,controller,{close,profile:()=>target.tcgProfileStudioBridge?.snapshot?.()?.profile});
 const open=()=>{controller.visible=true;root.hidden=false;hubRoot.hidden=true;if(hubView.shops)hubView.shops.hidden=true;view.render();controller.resume();};launch.addEventListener('click',open);
 const change=e=>view.change(e);root.addEventListener('change',change);
 const api={controller,view,open,close,customize:()=>{const d=controller.state.data;if(!d?.enabled)return;if(d.match&&!['result','cancelled'].includes(d.match.phase)){open();return;}view.dismissed=d.match?.id;view.custom={theme:'dark-silver',frame:'bronze',trackers:['wins','season_high','streak'],...d.profile?.league_banner};open();},active:()=>controller.visible,setUser:async user=>{close();await controller.setUser(user);},resume:()=>controller.resume(),dispose:()=>{controller.dispose();view.dispose();root.removeEventListener('change',change);launch.removeEventListener('click',open);root.remove();launch.remove();}};
 target.tcgLeague=api;return api;
}
