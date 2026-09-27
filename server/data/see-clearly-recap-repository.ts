import { createHash } from 'node:crypto';
import pg from 'pg';

import { recapPrompts, type RecapSource, type RecapRecord } from '../../domain/see-clearly-recap';

let pool: pg.Pool | undefined;
function databasePool() {
  const url = process.env.RTS_DATABASE_URL ?? process.env.DATABASE_URL ?? (process.env.RTS_TEST_MODE === '1' ? process.env.TEST_DATABASE_URL : undefined);
  if (!url) throw new Error('Database URL is required for the See Clearly recap.');
  return pool ??= new pg.Pool({ connectionString: url });
}
async function authenticated<T>(actorId: string, run: (client: pg.PoolClient) => Promise<T>) {
  const client = await databasePool().connect();
  try {
    await client.query('begin');
    await client.query('set local role authenticated');
    await client.query("select set_config('request.jwt.claims',$1,true)", [JSON.stringify({ sub: actorId })]);
    await client.query("select set_config('request.jwt.claim.sub',$1,true)", [actorId]);
    const result = await run(client);
    await client.query('commit');
    return result;
  } catch (error) { await client.query('rollback'); throw error; }
  finally { client.release(); }
}
async function sources(client: pg.PoolClient, actorId: string, lock = false): Promise<RecapSource[]> {
  const result: RecapSource[] = [];
  for (const prompt of recapPrompts) {
    // Identifiers only come from the local fixed list above. A lock prevents a source revision during confirmation.
    const row = (await client.query<Record<string, string | null>>(
      `select p.id as progress_id, r.* from public.${prompt.table} r join public.deep_dive_module_progress p
       on p.id=r.progress_id and p.user_id=r.user_id and p.module_id=r.module_id
       where r.user_id=$1 and r.module_id=$2 ${lock ? 'for share of r' : ''}`,
      [actorId, `see-clearly.${prompt.module}`],
    )).rows[0];
    if (!row) continue;
    const words = prompt.fields.map(field => row[field]).filter((word): word is string => Boolean(word?.trim()));
    if (words.length) result.push({ module: prompt.module, title: prompt.title,
      href: `/deep-dive/see-clearly/${prompt.route}?section=${prompt.section}&returnTo=recap`,
      progressId: row.progress_id!, words });
  }
  return result;
}
export function recapFingerprint(items: RecapSource[]) {
  return createHash('sha256').update(JSON.stringify(items.map(item => [item.module, item.progressId, item.words]))).digest('hex');
}
export function seeClearlyRecapRepository() {
  return {
    get(actorId: string) { return authenticated(actorId, async client => {
      const items = await sources(client, actorId);
      const row = (await client.query<{ narrative: string; clarification: string; carry_forward: string; confirmed_at: Date | null }>(
        `select narrative,clarification,carry_forward,confirmed_at from public.see_clearly_recaps where user_id=$1`, [actorId],
      )).rows[0];
      return { sources: items, fingerprint: recapFingerprint(items),
        record: row ? { narrative: row.narrative, clarification: row.clarification, carryForward: row.carry_forward, confirmedAt: row.confirmed_at } satisfies RecapRecord : null };
    }); },
    confirm(actorId: string, input: { fingerprint: string; narrative: string; clarification: string; carryForward: string }) {
      return authenticated(actorId, async client => {
        const completed = (await client.query<{ completed_at: Date | null }>(
          `select completed_at from public.deep_dive_module_progress where user_id=$1 and module_id='see-clearly.sg4' for share`, [actorId],
        )).rows[0];
        if (!completed?.completed_at) throw new Error('Stage not complete');
        const items = await sources(client, actorId, true);
        if (recapFingerprint(items) !== input.fingerprint) return false;
        await client.query(`insert into public.see_clearly_recaps(user_id,narrative,clarification,carry_forward,confirmed_at)
          values($1,$2,$3,$4,now()) on conflict(user_id) do update set narrative=excluded.narrative,
          clarification=excluded.clarification,carry_forward=excluded.carry_forward,confirmed_at=now(),updated_at=now()`,
        [actorId, input.narrative, input.clarification, input.carryForward]);
        await client.query(`delete from public.see_clearly_recap_sources where user_id=$1`, [actorId]);
        for (const item of items) await client.query(
          `insert into public.see_clearly_recap_sources(user_id,progress_id,module_id) values($1,$2,$3)`,
          [actorId, item.progressId, `see-clearly.${item.module}`],
        );
        return true;
      });
    },
  };
}
