import manifest from './assets.js';
export const fallback='assets/ui/sealed-unavailable.svg';
export function resolveSealedProductImage(id,quality='thumb'){
 const a=manifest.products[id];if(!a)return fallback;
 return (a.mirrorApproved&&a[quality])||a.remote?.[quality]||a.imagePrimary||fallback;
}
export function products(catalog,state){
 const inventory=state.sealedV161?.inventory||{},favourites=state.collectorV260?.sealed?.favourites||{};
 const known=new Map(catalog.map(p=>[p.productId,p]));
 for(const key of Object.keys(inventory))if(!known.has(key))known.set(key,{productId:key,setId:key.split('|')[0],setName:key.split('|')[0],name:key.split('|')[1],packCount:null,marketValue:null,legacyType:'unknown',unlocked:false});
 return [...known.values()].map(p=>{const art=manifest.products[p.productId];return {...p,name:art?.name||`Legacy ${p.name}`,productType:art?.productType||({bundle:'BUNDLES',etb:'ETBS',box:'BOOSTER BOXES',tin:'TINS',binder:'COLLECTION BOXES'}[p.legacyType]||'SPECIAL'),sourceType:art?.sourceType||'legacy-custom',sourceUrl:art?.sourceUrl,custom:!art,ownedQuantity:Number(inventory[p.productId]||0),displayed:Number(state.sealedV161?.display?.[p.productId]||0),favourite:!!favourites[p.productId],sealedStatus:'sealed',imagePrimary:resolveSealedProductImage(p.productId),imageAlternate:[],acquired:state.sealedV161?.history?.find(h=>h.type==='buy'&&h.setId===p.setId&&h.pid===p.legacyType)?.time||0};});
}
export function filterProducts(rows,{set='',type='',owned=false,favourite=false,sort='value-high',min=0,quantity=0}={}){
 const list=rows.filter(p=>(!set||p.setId===set)&&(!type||p.productType===type)&&(!owned||p.ownedQuantity>0)&&(!favourite||p.favourite)&&(!min||p.marketValue>=min)&&(!quantity||p.ownedQuantity>=quantity));
 const cmp={'value-high':(a,b)=>(b.marketValue||0)-(a.marketValue||0),'value-low':(a,b)=>(a.marketValue||0)-(b.marketValue||0),set:(a,b)=>a.setName.localeCompare(b.setName),type:(a,b)=>a.productType.localeCompare(b.productType),newest:(a,b)=>b.acquired-a.acquired,quantity:(a,b)=>b.ownedQuantity-a.ownedQuantity}[sort];
 return list.sort((a,b)=>Number(b.favourite)-Number(a.favourite)||(cmp||(()=>0))(a,b));
}
