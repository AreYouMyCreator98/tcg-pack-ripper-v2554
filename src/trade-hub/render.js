// Keep live controls and decoded images in place when a snapshot changes.
// Replacing the root during touch-down can otherwise swallow the touch-up.
export function patchMarkup(root, markup) {
  const template=root.ownerDocument.createElement('div');template.innerHTML=markup;
  function patch(parent, source){
    const wanted=[...source.childNodes];
    for(let i=0;i<wanted.length;i++){
      const next=wanted[i],old=parent.childNodes[i];
      if(!old){parent.appendChild(next.cloneNode(true));continue;}
      if(old.nodeType!==next.nodeType||old.nodeName!==next.nodeName||old.getAttribute?.('data-reveal-key')!==next.getAttribute?.('data-reveal-key')){
        old.replaceWith(next.cloneNode(true));continue;
      }
      if(next.nodeType===3){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;continue;}
      if(next.nodeType!==1)continue;
      for(const attr of [...old.attributes]){
        if(old.tagName==='DETAILS'&&attr.name==='open')continue;
        if(!next.hasAttribute(attr.name))old.removeAttribute(attr.name);
      }
      for(const attr of [...next.attributes])if(old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
      patch(old,next);
    }
    while(parent.childNodes.length>wanted.length)parent.lastChild.remove();
  }
  patch(root,template);
}

export function createArtWarmer(ImageType=globalThis.Image,clock=globalThis) {
  const entries=new Map(),queue=[];let running=0;
  function drain(){
    while(running<2&&queue.length){
      const {url,entry}=queue.shift();running++;
      const image=new ImageType();image.decoding='async';let settled=false;
      const done=ok=>{if(settled)return;settled=true;clock.clearTimeout(timer);image.onload=image.onerror=null;entry.retryAt=ok?Infinity:Date.now()+30000;running--;drain();};
      const timer=clock.setTimeout(()=>done(false),5000);
      image.onload=()=>done(true);image.onerror=()=>done(false);image.src=url;
    }
  }
  return urls=>{
    if(!ImageType)return;
    for(const url of urls.filter(Boolean)){
      if(entries.has(url)&&entries.get(url).retryAt>Date.now())continue;
      const entry={retryAt:Infinity};entries.set(url,entry);queue.push({url,entry});
    }
    while(entries.size>64)entries.delete(entries.keys().next().value);
    drain();
  };
}
