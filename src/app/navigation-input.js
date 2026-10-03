// Some mobile browsers suppress the compatibility click after a composited tap.
// Activate a completed tap through the existing click handlers, exactly once.
export function installNavigationInput(doc=document, win=window) {
  let start=null,last=null;
  const buttonAt=target=>target?.closest?.('.nav button[data-s]');
  const down=e=>{
    if(e.isPrimary===false||e.button>0||e.pointerType==='mouse')return;
    const button=buttonAt(e.target);if(!button||button.disabled)return;
    const point=e.changedTouches?.[0]||e;
    start={button,x:point.clientX,y:point.clientY,id:e.pointerId};
  };
  const cancel=()=>{start=null;};
  const up=e=>{
    const tap=start;start=null;if(!tap)return;
    const point=e.changedTouches?.[0]||e;
    if((tap.id!==undefined&&tap.id!==e.pointerId)||buttonAt(e.target)!==tap.button||
      Math.hypot(point.clientX-tap.x,point.clientY-tap.y)>14||tap.button.disabled||tap.button.closest('[inert]'))return;
    if(e.cancelable)e.preventDefault();
    last={button:tap.button,time:Date.now()};
    tap.button.click();
  };
  const click=e=>{
    if(e.isTrusted&&last&&buttonAt(e.target)===last.button&&Date.now()-last.time<700){e.preventDefault();e.stopImmediatePropagation();}
  };
  const pointer=!!win.PointerEvent;
  const events=pointer?[['pointerdown',down],['pointerup',up],['pointercancel',cancel]]:[['touchstart',down],['touchend',up],['touchcancel',cancel]];
  for(const [type,handler]of events)doc.addEventListener(type,handler,{capture:true,passive:false});
  doc.addEventListener('click',click,true);
  return ()=>{for(const [type,handler]of events)doc.removeEventListener(type,handler,true);doc.removeEventListener('click',click,true);};
}
