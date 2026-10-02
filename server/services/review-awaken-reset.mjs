import pg from 'pg';

const project = 'zxikzybpodxecgpkncix';
const expectedActor = '9e53e70b-db58-4d25-abd4-5f89537142a6';
const modules = Object.freeze(['awaken.pay-attention','awaken.catch-yourself-being-you',
  'awaken.your-reactions-have-a-history','awaken.formation-is-not-identity']);
export class ReviewResetRefused extends Error {}
function check(condition,message) { if(!condition) throw new ReviewResetRefused(message); }

function validate(actor,env) {
  check(Date.now() < Date.parse('2026-10-02T06:00:00Z'), 'Temporary reset window expired.');
  check(env.VERCEL_ENV === 'preview' && env.VERCEL_GIT_COMMIT_REF === 'review-deep-dive', 'Only the named Vercel review deployment is permitted.');
  check(env.REVIEW_TEST_ACCESS === 'true' && Boolean(env.REVIEW_TEST_USER_EMAIL)
    && actor?.id === expectedActor && actor.email === env.REVIEW_TEST_USER_EMAIL, 'Only the verified designated review actor is permitted.');
  const api=env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
  check(api === `https://${project}.supabase.co`, 'Review Auth project mismatch.');
  check(!env.SUPABASE_URL || env.SUPABASE_URL === api, 'Conflicting Auth configuration.');
  const connection=env.RTS_DATABASE_URL;
  let url;try{url=new URL(connection);}catch{throw new ReviewResetRefused('Review database credentials unavailable.');}
  const direct=url.hostname === `db.${project}.supabase.co`;
  const pooler=/^[a-z0-9-]+\.pooler\.supabase\.com$/.test(url.hostname)
    && decodeURIComponent(url.username).endsWith(`.${project}`);
  check(['postgres:','postgresql:'].includes(url.protocol) && (direct || pooler)
    && url.pathname === '/postgres' && !url.hash && Boolean(url.password)
    && [...url.searchParams].every(([key,value]) => key === 'sslmode' && ['require','verify-full'].includes(value)),
  'Review database identity or connection options are unsafe.');
  check(!env.DATABASE_URL || env.DATABASE_URL === connection, 'Conflicting database configuration.');
  return connection;
}
async function connectDefault(connectionString) {
  const client = new pg.Client({connectionString,connectionTimeoutMillis:10000,application_name:'review-awaken-reset'});
  await client.connect();return client;
}
export async function runReviewReset(actor,env,apply=false,connect=connectDefault) {
  const connection=validate(actor,env);
  const client=await connect(connection);
  try {
    await client.query('begin isolation level serializable');
    await client.query("set local statement_timeout = '10s'");
    await client.query("set local lock_timeout = '5s'");
    await client.query('set local role authenticated');
    await client.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:actor.id,role:'authenticated'})]);
    await client.query("select set_config('request.jwt.claim.sub',$1,true)",[actor.id]);
    await client.query('select id from public.deep_dive_module_progress where user_id=$1 and module_id=any($2::text[]) for update',[actor.id,modules]);
    const count=async()=> (await client.query(`select
      (select count(*)::integer from public.deep_dive_module_progress where user_id=$1 and module_id=any($2::text[])) as progress,
      (select count(*)::integer from public.deep_dive_reflections r join public.deep_dive_module_progress p
        on (p.id,p.user_id)=(r.progress_id,r.user_id) where p.user_id=$1 and r.user_id=$1 and p.module_id=any($2::text[])) as reflections`,[actor.id,modules])).rows[0];
    const before=await count();
    if(!apply) {await client.query('rollback');return {...before,blank:false};}
    const deleted=await client.query('delete from public.deep_dive_module_progress where user_id=$1 and module_id=any($2::text[]) returning id',[actor.id,modules]);
    check(deleted.rows.length === before.progress,'Deletion count mismatch.');
    const after=await count();
    check(after.progress === 0 && after.reflections === 0,'Blank-state verification failed.');
    const orphans=await client.query('select count(*)::integer as count from public.deep_dive_reflections where user_id=$1 and progress_id=any($2::uuid[])',[actor.id,deleted.rows.map(row=>row.id)]);
    check(orphans.rows[0].count === 0,'Reflection cascade verification failed.');
    await client.query('commit');return {...before,blank:true};
  } catch(error) {await client.query('rollback').catch(()=>{});throw error;}
  finally {await client.end().catch(()=>{});}
}
