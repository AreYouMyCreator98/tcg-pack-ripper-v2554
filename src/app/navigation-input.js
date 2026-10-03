// Some mobile browsers suppress the compatibility click after a composited tap.
// Activate a completed tap through the existing click handlers, exactly once.
export function installNavigationInput(doc=document, win=window) {
  let start=null,last=null;
  const buttonAt=target=>{
    // Keep native text fields, selects, links and sliders on their browser path.
    if(target?.closest?.('input,select,textarea,a,[contenteditable="true"]'))return null;
    return target?.closest?.('.nav button[data-s],#profile.profile-studio button,#profile.profile-studio summary,#settings.studio-settings button,#settings.studio-settings summary');
  };
  const unavailable=button=>!button||button.disabled||button.closest('[inert]')||
    (!button.closest('.nav,#closeProfileSettingsV158,#closeSettingsShadeV158')&&doc.documentElement.classList.contains('hub-transaction-pending'));
  const down=e=>{
    if(e.isPrimary===false||e.touches?.length>1){start=null;return;}
    if(e.button>0||e.pointerType==='mouse')return;
    const button=buttonAt(e.target);if(unavailable(button))return;
    const point=e.changedTouches?.[0]||e;
    start={button,x:point.clientX,y:point.clientY,id:e.pointerId};
  };
  const cancel=()=>{start=null;};
  const move=e=>{
    if(!start)return;
    const point=e.changedTouches?.[0]||e;
    if(Math.hypot(point.clientX-start.x,point.clientY-start.y)>14)cancel();
  };
  const up=e=>{
    const tap=start;start=null;if(!tap)return;
    const point=e.changedTouches?.[0]||e;
    if((tap.id!==undefined&&tap.id!==e.pointerId)||buttonAt(e.target)!==tap.button||
      Math.hypot(point.clientX-tap.x,point.clientY-tap.y)>14||unavailable(tap.button))return;
    if(e.cancelable)e.preventDefault();
    last={button:tap.button,time:Date.now()};
    tap.button.click();
  };
  const click=e=>{
    if(e.isTrusted&&e.detail!==0&&last&&buttonAt(e.target)===last.button&&Date.now()-last.time<700){e.preventDefault();e.stopImmediatePropagation();}
  };
  const pointer=!!win.PointerEvent;
  const events=pointer?[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel]]:[['touchstart',down],['touchmove',move],['touchend',up],['touchcancel',cancel]];
  for(const [type,handler]of events)doc.addEventListener(type,handler,{capture:true,passive:false});
  doc.addEventListener('click',click,true);
  return ()=>{for(const [type,handler]of events)doc.removeEventListener(type,handler,true);doc.removeEventListener('click',click,true);};
}
