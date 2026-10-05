export function installQuestShortcut({doc=document,win=window,load}={}){
 const button=doc.getElementById('openQuests');if(!button)return;
 button.addEventListener('click',async()=>{
  if(button.disabled)return;button.disabled=true;button.textContent='Opening…';
  try{
   await load();doc.querySelector('.nav [data-s="profile"]')?.click();
   win.tcgProfileStudio?.switchTab('overview');
   const section=doc.getElementById('profileChallengesSlot')?.closest('details');
   if(section){section.open=true;section.querySelector('summary')?.focus();section.scrollIntoView?.({block:'start',behavior:'auto'});}
  }catch{button.textContent='Retry quests';}
  finally{button.disabled=false;if(button.textContent!=='Retry quests')button.textContent='✦ QUESTS';}
 });
}
