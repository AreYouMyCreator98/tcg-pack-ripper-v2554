// Settings is a modal, not an inactive game screen. Keep its scroll surface and
// dismissal independent of collection locks and Safari's collapsing browser UI.
export function installSettingsOverlay(doc=document, win=window) {
  const root=doc.getElementById('settings');
  if(!root||root.dataset.modalInstalled)return;
  root.dataset.modalInstalled='1';
  root.classList.remove('screen');
  root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
  root.setAttribute('aria-label','Game settings');
  const card=root.querySelector('.settingsCardV158');
  const closeButton=doc.getElementById('closeProfileSettingsV158');
  closeButton.setAttribute('aria-label','Close settings');
  let opened=false,previousFocus=null,scrollX=0,scrollY=0,restore=[];
  const viewport=()=>{
    if(!opened)return;
    const vv=win.visualViewport;
    root.style.setProperty('--settings-height',`${vv?.height||win.innerHeight}px`);
    root.style.setProperty('--settings-top',`${vv?.offsetTop||0}px`);
  };
  const close=()=>{root.classList.remove('show');root.setAttribute('aria-hidden','true');sync();};
  function sync(){
    const visible=root.classList.contains('show');if(visible===opened)return;
    opened=visible;root.setAttribute('aria-hidden',String(!visible));
    if(visible){
      previousFocus=doc.activeElement;scrollX=win.scrollX||0;scrollY=win.scrollY||0;
      // Fixed-body locking also works on Safari versions without overscroll containment.
      for(const [node,values] of [[doc.documentElement,{'overflow-y':'hidden'}],[doc.body,{position:'fixed',top:`${-scrollY}px`,left:`${-scrollX}px`,width:'100%','overflow-y':'hidden'}]]){
        for(const [name,value] of Object.entries(values)){
          restore.push([node,name,node.style.getPropertyValue(name),node.style.getPropertyPriority(name)]);
          node.style.setProperty(name,value,'important');
        }
      }
      doc.documentElement.classList.add('settings-modal-open');
      viewport();closeButton.focus({preventScroll:true});
    }else{
      doc.activeElement?.blur?.();
      for(const [node,name,value,priority] of restore){if(value)node.style.setProperty(name,value,priority);else node.style.removeProperty(name);}
      restore=[];doc.documentElement.classList.remove('settings-modal-open');
      win.scrollTo(scrollX,scrollY);
      if(previousFocus?.isConnected&&!previousFocus.closest('[inert]'))previousFocus.focus({preventScroll:true});
    }
  }
  closeButton.addEventListener('click',close);
  doc.getElementById('closeSettingsShadeV158')?.addEventListener('click',close);
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();return;}
    if(event.key!=='Tab')return;
    const controls=[...card.querySelectorAll('button,input,select,summary,a[href],[tabindex="0"]')].filter(el=>{
      // Some engines return layout rectangles for controls inside closed details,
      // even though those controls cannot receive focus.
      const folded=el.closest('details:not([open])');
      return !el.disabled&&!el.closest('[hidden]')&&el.getClientRects().length&&
        (!folded||(el.tagName==='SUMMARY'&&el.parentElement===folded));
    });
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first?.focus();}
  });
  let lastY=0;
  root.addEventListener('touchstart',event=>{lastY=event.touches[0]?.clientY||0;},{passive:true});
  root.addEventListener('touchmove',event=>{
    if(event.touches.length!==1)return;
    const y=event.touches[0].clientY,dy=y-lastY;lastY=y;
    const outside=!card.contains(event.target);
    const edge=(dy>0&&card.scrollTop<=0)||(dy<0&&card.scrollTop+card.clientHeight>=card.scrollHeight-1);
    if((outside||edge)&&event.cancelable)event.preventDefault();
  },{passive:false});
  const observer=new win.MutationObserver(sync);observer.observe(root,{attributes:true,attributeFilter:['class']});
  win.visualViewport?.addEventListener('resize',viewport);
  win.visualViewport?.addEventListener('scroll',viewport);
  win.addEventListener('resize',viewport);sync();
  return {close,sync};
}
