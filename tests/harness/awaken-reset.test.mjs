import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { runReset } from '../../scripts/reset-prototype-awaken.mjs';

const actor = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const modules = ['awaken.pay-attention', 'awaken.catch-yourself-being-you',
  'awaken.your-reactions-have-a-history', 'awaken.formation-is-not-identity'];
const env = {
  RTS_RUNTIME_ENV: 'isolated-prototype', SUPABASE_PROJECT_ID: 'rts-phase1-prototype',
  SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_ANON_KEY: 'local-key',
  RTS_PROTOTYPE_DATABASE_URL: 'postgresql://postgres:local@127.0.0.1:54322/postgres',
  RTS_PROTOTYPE_ACCESS_TOKEN: 'local-session', RTS_PROTOTYPE_RESET_ACTOR_ID: actor,
};
function container(name, port) {
  return { Name: `/supabase_${name}_rts-phase1-prototype`,
    Config: { Labels: { 'com.supabase.cli.project': 'rts-phase1-prototype' } },
    State: { Running: true }, NetworkSettings: { Networks: { supabase_network_rts_phase1_prototype: {} },
      Ports: { [name === 'db' ? '5432/tcp' : '8000/tcp']: [{ HostIp: '127.0.0.1', HostPort: port }] } } };
}
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
  const deps = {
    branch: () => 'prototype/awaken-lived-journey', config: () => 'project_id = "rts-phase1-prototype"',
    inspect: () => [container('db','54322'),container('kong','54321')],
    fetch: async () => ({ ok: true, json: async () => ({ id: actor, role: 'authenticated' }) }),
    connect: async () => ({ query: (sql,values) => db.query(sql,values), end: async () => {} }),
  };
  return { db, deps };
}
async function snapshot(db) {
  return [ (await db.query('select * from public.deep_dive_module_progress order by id')).rows,
    (await db.query('select * from public.deep_dive_reflections order by id')).rows ];
}
test('default dry run rolls back and reports only authenticated A1–A4 counts', async () => {
  const {db,deps} = await fixture();
  try {
    const before = await snapshot(db);
    const connect = deps.connect;
    deps.connect = async()=>{
      const client = await connect();
      return {...client, query:(sql,values)=>{
        assert.ok(!/^delete /i.test(sql), 'dry run must never delete');
        return client.query(sql,values);
      }};
    };
    const result = await runReset(env,[],deps);
    assert.equal(result.mode,'dry-run'); assert.equal(result.progress,4); assert.equal(result.reflections,4);
    assert.deepEqual(result.modules,modules); assert.deepEqual(await snapshot(db),before);
    assert.ok(!JSON.stringify(result).includes('private wording'));
  } finally { await db.close(); }
});
test('apply clears four modules and cascades their reflections; preserves another actor and other curriculum', async () => {
  const {db,deps} = await fixture();
  try {
    const before = await snapshot(db);
    const result = await runReset(env,['--apply'],deps);
    assert.equal(result.blank,true); assert.equal(result.progress,4);
    const keep = row => row.user_id !== actor || row.module_id === 'see-clearly.sc1';
    const expectedProgress = before[0].filter(keep);
    const ids = new Set(expectedProgress.map(row => row.id));
    assert.deepEqual(await snapshot(db),[expectedProgress,before[1].filter(row => ids.has(row.progress_id))]);
    assert.equal((await runReset(env,['--apply'],deps)).progress,0);
  } finally { await db.close(); }
});
for (const patch of [
  { RTS_RUNTIME_ENV: 'production' }, { RTS_RUNTIME_ENV: 'review' },
  { SUPABASE_PROJECT_ID: 'zxikzybpodxecgpkncix' },
  { SUPABASE_URL: 'https://zxikzybpodxecgpkncix.supabase.co' },
  { RTS_PROTOTYPE_DATABASE_URL: 'postgresql://postgres:secret@db.production.supabase.co/postgres' },
  { RTS_PROTOTYPE_DATABASE_URL: 'postgresql://postgres:local@127.0.0.1:54322/postgres?host=production' },
  { RTS_DATABASE_URL: 'postgresql://postgres:secret@review.invalid/postgres' },
  { RTS_PROTOTYPE_ACCESS_TOKEN: '' }, { RTS_PROTOTYPE_RESET_ACTOR_ID: other },
]) test(`fails closed: ${Object.keys(patch)[0]}=${Object.values(patch)[0].includes('secret')?'hosted':Object.values(patch)[0]}`, async () => {
  let connections = 0;
  await assert.rejects(runReset({...env,...patch},['--apply'],{
    branch: ()=>'prototype/awaken-lived-journey',config: ()=>'project_id = "rts-phase1-prototype"',
    inspect: ()=>[container('db','54322'),container('kong','54321')],
    fetch: async()=>({ok:true,json:async()=>({id:actor,role:'authenticated'})}),
    connect: async()=>{ connections++; throw Error('must not connect'); },
  })); assert.equal(connections,0);
});
test('wrong branch, missing Docker isolation, failed auth, and target overrides never connect', async () => {
  const {db,deps} = await fixture();
  try {
    for (const override of [{branch:()=> 'main'}, {branch:()=> 'review'}, {inspect:()=>[]},
      {inspect:()=>[container('db','54322'),container('kong','9999')]},
      {fetch:async()=>({ok:false})},
      {fetch:async()=>({ok:true,json:async()=>({id:other,role:'authenticated'})})}]) {
      let connections = 0;
      await assert.rejects(runReset(env,['--apply'],{...deps,...override,
        connect: async()=>{ connections++; throw Error('unsafe target connected'); }}));
      assert.equal(connections,0);
    }
    for (const flag of ['--actor='+other,'--all','--module=see-clearly.sc1','--db-url=remote','--apply --dry-run']) {
      let connections = 0;
      await assert.rejects(runReset(env,[flag],{...deps,connect:async()=>{connections++;throw Error('override connected');}}));
      assert.equal(connections,0);
    }
  } finally {await db.close();}
});
test('verification failure rolls the entire delete back', async () => {
  const {db,deps} = await fixture();
  try {
    const before = await snapshot(db); let counts = 0;
    deps.connect = async()=>({end:async()=>{},query:async(sql,values)=>{
      if (sql.includes('count(*)') && ++counts === 2) throw Error('verification failed');
      return db.query(sql,values);
    }});
    await assert.rejects(runReset(env,['--apply'],deps));
    assert.equal(counts,2, 'failure must occur during verification after deletion');
    assert.deepEqual(await snapshot(db),before);
  } finally {await db.close();}
});
