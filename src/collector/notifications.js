export function installCollectorNotifications(win=window,doc=document){
 const root=doc.createElement('aside');root.className='collector-notifications';root.hidden=true;root.setAttribute('role','status');root.setAttribute('aria-live','polite');doc.body.append(root);
 const pending=new Set();let flushTimer=0,hideTimer=0;
 function notify(title){if(!title)return;pending.add(String(title));if(flushTimer)return;flushTimer=win.setTimeout(()=>{flushTimer=0;const messages=[...pending];pending.clear();root.textContent=messages.slice(0,3).join(' · ')+(messages.length>3?' · +'+(messages.length-3)+' more':'');root.hidden=false;win.clearTimeout(hideTimer);hideTimer=win.setTimeout(()=>root.hidden=true,5000);},180);}
 return notify;
}
