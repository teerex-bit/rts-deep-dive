import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { runReviewReset } from '../../server/services/review-awaken-reset.mjs';
const actor = '9e53e70b-db58-4d25-abd4-5f89537142a6';
const other = '22222222-2222-4222-8222-222222222222';
const modules = ['awaken.pay-attention', 'awaken.catch-yourself-being-you',
  'awaken.your-reactions-have-a-history', 'awaken.formation-is-not-identity'];
const actorIdentity = {id:actor,email:'review@example.test'};
const env = {VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'review-deep-dive',
  REVIEW_TEST_ACCESS:'true',REVIEW_TEST_USER_EMAIL:actorIdentity.email,
  NEXT_PUBLIC_SUPABASE_URL:'https://zxikzybpodxecgpkncix.supabase.co',
  RTS_DATABASE_URL:'postgresql://postgres:secret@db.zxikzybpodxecgpkncix.supabase.co:5432/postgres?sslmode=require'};
const connect = db => async()=>({query:(sql,params)=>db.query(sql,params),end:async()=>{}});
async function fixture() {
  const db = new PGlite();
  await db.exec(`create schema auth; create role authenticated;
    create function auth.uid() returns uuid language sql as $$
      select (current_setting('request.jwt.claims',true)::jsonb->>'sub')::uuid $$;
    create table public.deep_dive_module_progress (
      id uuid primary key, user_id uuid not null, module_id text not null,
      unique(id,user_id));
    create table public.deep_dive_reflections (
      id uuid primary key, user_id uuid not null, progress_id uuid not null, body text,
      foreign key(progress_id,user_id) references public.deep_dive_module_progress(id,user_id) on delete cascade);
    alter table public.deep_dive_module_progress enable row level security;
    alter table public.deep_dive_module_progress force row level security;
    alter table public.deep_dive_reflections enable row level security;
    alter table public.deep_dive_reflections force row level security;
    create policy owner on public.deep_dive_module_progress to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
    create policy owner on public.deep_dive_reflections to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
    grant usage on schema auth to authenticated;
    grant select,update,delete on public.deep_dive_module_progress,public.deep_dive_reflections to authenticated;`);
  let n = 1;
  for (const user of [actor, other]) for (const module of [...modules, 'see-clearly.sc1']) {
    const id = `00000000-0000-4000-8000-${String(n++).padStart(12, '0')}`;
    await db.query('insert into public.deep_dive_module_progress values($1,$2,$3)', [id,user,module]);
    await db.query('insert into public.deep_dive_reflections values($1,$2,$1,$3)', [id,user,'private wording']);
  }
  return db;
}
async function snapshot(db) {
  return [ (await db.query('select * from public.deep_dive_module_progress order by id')).rows,
    (await db.query('select * from public.deep_dive_reflections order by id')).rows ];
}
test('dry run reports only four modules without deleting anything', async()=>{
 const db=await fixture();try{
  const before=await snapshot(db);
  const result=await runReviewReset(actorIdentity,env,false,connect(db));
  assert.equal(result.progress,4);assert.equal(result.reflections,4);assert.equal(result.blank,false);
  assert.deepEqual(await snapshot(db),before);
 }finally{await db.close();}
});
test('apply removes only authenticated actor A1–A4 and cascades reflections, preserving other actor and curriculum',async()=>{
 const db=await fixture();try{
  const before=await snapshot(db);
  const result=await runReviewReset(actorIdentity,env,true,connect(db));
  assert.equal(result.blank,true);assert.equal(result.progress,4);
  const keep=before[0].filter(row=>row.user_id!==actor||row.module_id==='see-clearly.sc1');
  const ids=new Set(keep.map(row=>row.id));
  assert.deepEqual(await snapshot(db),[keep,before[1].filter(row=>ids.has(row.progress_id))]);
  const after=await runReviewReset(actorIdentity,env,false,connect(db));
  assert.equal(after.progress,0);assert.equal(after.reflections,0);
 }finally{await db.close();}
});
for(const patch of [ {VERCEL_ENV:'production'}, {VERCEL_GIT_COMMIT_REF:'main'},
 {REVIEW_TEST_ACCESS:'false'}, {NEXT_PUBLIC_SUPABASE_URL:'https://production.supabase.co'},
 {RTS_DATABASE_URL:'postgresql://postgres:secret@db.production.supabase.co/postgres'},
 {RTS_DATABASE_URL:'postgresql://postgres.zxikzybpodxecgpkncix:secret@attacker.invalid/postgres'},
 {RTS_DATABASE_URL:env.RTS_DATABASE_URL+'&host=production'},
 {DATABASE_URL:'postgresql://postgres:secret@production.invalid/postgres'},
 ])test('rejects unsafe configuration '+Object.keys(patch)[0]+':'+Object.values(patch)[0].slice(0,10),async()=>{
 let calls=0;await assert.rejects(runReviewReset(actorIdentity,{...env,...patch},true,async()=>{calls++;throw Error('unexpected connect');}));
 assert.equal(calls,0);
});
for(const identity of [{...actorIdentity,id:other},{...actorIdentity,email:'other@example.test'},null])
 test('rejects another or missing verified actor '+identity?.id+identity?.email,async()=>{
 let calls=0;await assert.rejects(runReviewReset(identity,env,true,async()=>{calls++;throw Error('unexpected connect');}));
 assert.equal(calls,0);
});
test('failed blank-state verification rolls back deletion',async()=>{
 const db=await fixture();try{
  const before=await snapshot(db);let counts=0;
  await assert.rejects(runReviewReset(actorIdentity,env,true,async()=>({end:async()=>{},query:async(sql,params)=>{
   if(sql.includes('count(*)')&&++counts===2)throw Error('verification failed');
   return db.query(sql,params);
  }})));
  assert.equal(counts,2);assert.deepEqual(await snapshot(db),before);
 }finally{await db.close();}
});
