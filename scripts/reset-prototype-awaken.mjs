import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const branch = 'prototype/awaken-lived-journey';
const projectId = 'rts-phase1-prototype';
const api = 'http://127.0.0.1:54321';
const modules = Object.freeze([
  'awaken.pay-attention', 'awaken.catch-yourself-being-you',
  'awaken.your-reactions-have-a-history', 'awaken.formation-is-not-identity',
]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function requireSafe(condition, message) {
  if (!condition) throw new Error(message);
}

// Only the already designated local Supabase project is trusted. A caller-supplied
// project ref, allowlist, URL or "prototype" flag cannot authorize a hosted target.
function validateEnvironment(env, args) {
  requireSafe(args.length <= 1 && args.every(arg => ['--dry-run', '--apply'].includes(arg)),
    'Only --dry-run (default) or --apply is accepted. No target overrides.');
  requireSafe(env.RTS_RUNTIME_ENV === 'isolated-prototype' && env.SUPABASE_PROJECT_ID === projectId,
    'The designated isolated prototype environment is required.');
  requireSafe(env.SUPABASE_URL === api, 'Only the designated local prototype Auth endpoint is permitted.');
  let target;
  try { target = new URL(env.RTS_PROTOTYPE_DATABASE_URL); } catch { throw new Error('Local prototype database credentials are required.'); }
  requireSafe(['postgres:', 'postgresql:'].includes(target.protocol)
    && target.hostname === '127.0.0.1' && target.port === '54322'
    && target.pathname === '/postgres' && !target.search && !target.hash
    && target.username === 'postgres' && Boolean(target.password),
  'Only the designated local prototype PostgreSQL endpoint is permitted.');
  for (const name of ['RTS_DATABASE_URL', 'DATABASE_URL', 'TEST_DATABASE_URL']) {
    requireSafe(!env[name] || env[name] === env.RTS_PROTOTYPE_DATABASE_URL, 'Conflicting database configuration is prohibited.');
  }
  requireSafe(!env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL === api,
    'Conflicting Auth configuration is prohibited.');
  requireSafe(Boolean(env.SUPABASE_ANON_KEY) && Boolean(env.RTS_PROTOTYPE_ACCESS_TOKEN)
    && uuid.test(env.RTS_PROTOTYPE_RESET_ACTOR_ID ?? ''),
  'Local Auth credentials and an expected actor UUID are required.');
}

function verifyContainers(containers) {
  requireSafe(Array.isArray(containers) && containers.length === 2, 'Local Docker isolation could not be verified.');
  for (const [kind, internalPort, hostPort] of [['db', '5432/tcp', '54322'], ['kong', '8000/tcp', '54321']]) {
    const container = containers.find(item => item.Name === `/supabase_${kind}_${projectId}`);
    requireSafe(container?.State?.Running
      && container.Config?.Labels?.['com.supabase.cli.project'] === projectId,
    'The running containers must belong to the designated prototype project.');
    const bindings = container.NetworkSettings?.Ports?.[internalPort];
    requireSafe(bindings?.some(binding => ['127.0.0.1', '0.0.0.0'].includes(binding.HostIp) && binding.HostPort === hostPort),
      'The prototype container must own the designated local port.');
  }
  const [first,second] = containers;
  requireSafe(Object.keys(first.NetworkSettings?.Networks ?? {}).some(network =>
    network.startsWith('supabase_network_') && network in (second.NetworkSettings?.Networks ?? {})),
  'Prototype Auth and database containers must share the local Supabase network.');
}

const defaults = {
  branch: () => execFileSync('git', ['branch', '--show-current'], {cwd: project, encoding:'utf8',timeout:5000}).trim(),
  config: () => readFileSync(path.join(project,'supabase/config.toml'),'utf8'),
  inspect: () => JSON.parse(execFileSync('docker', ['inspect',`supabase_db_${projectId}`,`supabase_kong_${projectId}`],
    { encoding:'utf8',timeout:10000,stdio:['ignore','pipe','pipe'] })),
  fetch: (...args) => fetch(...args),
  connect: async connectionString => {
    const client = new pg.Client({ connectionString, connectionTimeoutMillis:10000,
      application_name:'rts-prototype-awaken-reset' });
    await client.connect(); return client;
  },
};

export async function runReset(env, args, dependencies = defaults) {
  validateEnvironment(env,args); // Always before network/DB access, including dry runs.
  const deps = {...defaults,...dependencies};
  requireSafe(await deps.branch() === branch, 'Reset is permitted only on prototype/awaken-lived-journey.');
  requireSafe(/^project_id = "rts-phase1-prototype"$/m.test(await deps.config()), 'Local Supabase project identity does not match.');
  verifyContainers(await deps.inspect());
  const response = await deps.fetch(`${api}/auth/v1/user`, {
    headers: { apikey:env.SUPABASE_ANON_KEY, Authorization:`Bearer ${env.RTS_PROTOTYPE_ACCESS_TOKEN}` },
    redirect:'error', signal:AbortSignal.timeout(10000),
  });
  requireSafe(response.ok, 'The prototype actor must have a valid authenticated session.');
  const user = await response.json();
  requireSafe(uuid.test(user?.id ?? '') && user.role === 'authenticated'
    && user.id.toLowerCase() === env.RTS_PROTOTYPE_RESET_ACTOR_ID.toLowerCase(),
  'Authenticated actor does not match the expected prototype actor.');
  // Auth verifies the actor; the expected UUID is a confirmation, never a target selector.
  const actor = user.id.toLowerCase();
  const mode = args.includes('--apply') ? 'apply' : 'dry-run';
  const client = await deps.connect(env.RTS_PROTOTYPE_DATABASE_URL);
  try {
    await client.query('begin isolation level serializable');
    await client.query("set local statement_timeout = '10s'");
    await client.query("set local lock_timeout = '5s'");
    await client.query('set local role authenticated');
    await client.query("select set_config('request.jwt.claims',$1,true)", [JSON.stringify({sub:actor,role:'authenticated'})]);
    await client.query("select set_config('request.jwt.claim.sub',$1,true)", [actor]);
    await client.query(`select id from public.deep_dive_module_progress
      where user_id=$1 and module_id=any($2::text[]) for update`, [actor,modules]);
    const count = async () => (await client.query(`select
      (select count(*)::integer from public.deep_dive_module_progress where user_id=$1 and module_id=any($2::text[])) as progress,
      (select count(*)::integer from public.deep_dive_reflections r
        join public.deep_dive_module_progress p on (p.id,p.user_id)=(r.progress_id,r.user_id)
        where p.user_id=$1 and r.user_id=$1 and p.module_id=any($2::text[])) as reflections`, [actor,modules])).rows[0];
    const before = await count();
    if (mode === 'dry-run') {
      await client.query('rollback');
      return {mode,actor,modules:[...modules],...before,blank:false};
    }
    const deleted = await client.query(`delete from public.deep_dive_module_progress
      where user_id=$1 and module_id=any($2::text[]) returning id`, [actor,modules]);
    requireSafe(deleted.rows.length === before.progress, 'Reset deletion count did not match.');
    const after = await count();
    requireSafe(after.progress === 0 && after.reflections === 0, 'Awaken reset verification failed.');
    // Check the cascade directly as well; a join alone could hide orphan reflections.
    const remaining = await client.query(`select count(*)::integer as count from public.deep_dive_reflections
      where user_id=$1 and progress_id=any($2::uuid[])`, [actor,deleted.rows.map(row=>row.id)]);
    requireSafe(remaining.rows[0].count === 0, 'Awaken reflections did not cascade.');
    await client.query('commit');
    return {mode,actor,modules:[...modules],...before,blank:mode === 'apply'};
  } catch (error) {
    await client.query('rollback').catch(()=>{});
    throw error;
  } finally { await client.end().catch(()=>{}); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await runReset(process.env,process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
  } catch {
    // Driver/Auth/Docker errors can contain credentials or payloads. Never print them.
    process.stderr.write('Prototype Awaken reset refused or not confirmed. Check the documented isolation, credentials, actor and branch requirements; verify state before retrying.\n');
    process.exitCode = 1;
  }
}
