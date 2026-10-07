// A live Hub snapshot supplies UTC. Advance it using a monotonic clock so changing
// the device wall clock cannot accelerate a connected session's rotations.
export function createCollectorClock({account,wall=()=>Date.now(),monotonic=()=>performance.now()}){
 let sample=null;
 return {
  accept(utc,user){const time=Date.parse(utc);if(user!==account()||!Number.isFinite(time))return false;if(sample?.user===user&&time<sample.time)return false;sample={user,time,at:monotonic()};return true;},
  now(){return sample?.user===account()?sample.time+Math.max(0,monotonic()-sample.at):wall();},
  source(){return sample?.user===account()?'server':'local';}
 };
}
