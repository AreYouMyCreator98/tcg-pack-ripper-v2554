import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

export const USERS = ['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
export async function database() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
    create table public.user_saves(user_id uuid primary key references auth.users,save_data jsonb not null,save_version integer not null default 1,updated_at timestamptz default now());
    create table public.mp_profiles(user_id uuid primary key,display_name text,ranked_rp numeric default 0,ranked_wins integer default 0,ranked_losses integer default 0,ranked_ties integer default 0,ranked_streak integer default 0,ranked_season_high numeric default 0);
  `);
  for (const [i, id] of USERS.entries()) {
    await db.query('insert into auth.users values($1)',[id]);
    await db.query('insert into public.user_saves(user_id,save_data) values($1,$2)',[id,JSON.stringify({state:{coins:100,binder:{['card-'+i]:{id:'card-'+i,name:'Card '+i,qty:3,market:5,set:'Test',rarity:'Ultra Rare'}},bulkV64:{},starterV199:{eligible:true,remaining:10,used:0},sealedV161:{packCredits:{}}}})]);
  }
  const migration = await readFile(new URL('../supabase/migrations/20261003073323_trade_hub_v256.sql',import.meta.url),'utf8');
  await db.exec(migration);
  await db.exec(await readFile(new URL('../supabase/migrations/20261003101824_trade_hub_identity_ranked.sql',import.meta.url),'utf8'));
  await db.exec("insert into hub_private.expansions(id,name) values('sv04.5','Test set')");
  for(let i=0;i<20;i++) await db.query('insert into hub_private.catalog(id,set_id,card,tier) values($1,$2,$3,$4)', ['catalog-'+i,'sv04.5',JSON.stringify({id:'catalog-'+i,name:'Test card '+i,set:'Test set',setId:'sv04.5',market:.1,rarity:'Rare'}),i%6]);
  // Commands run with the same role and auth.uid boundary as the real Data API.
  async function call(uid,action,payload={},requestId=randomUUID()) {
    return db.transaction(async tx=>{
      await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[uid||'']);
      await tx.exec('set local role authenticated');
      const result=await tx.query('select public.hub_command($1,$2,$3) as result',[action,JSON.stringify(payload),action==='snapshot'?null:requestId]);
      return result.rows[0].result;
    });
  }
  return {db,call,close:()=>db.close()};
}
