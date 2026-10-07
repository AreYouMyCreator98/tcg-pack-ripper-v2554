// getRandomValues is available on ordinary HTTP LAN previews where randomUUID
// may be absent. Keep receipt IDs cryptographically random on both paths.
export function transactionId(crypto=globalThis.crypto){
 if(crypto?.randomUUID)return crypto.randomUUID();
 if(!crypto?.getRandomValues)throw new Error('This browser cannot create a transaction receipt.');
 const bytes=crypto.getRandomValues(new Uint8Array(16));
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
