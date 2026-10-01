import { NextResponse } from 'next/server';
import { requireActor } from '../../../../../server/auth/require-actor';

const TABLES = [
  'ai_artifact_sources','ai_artifacts','ai_context_grants','ai_threads',
  'see_clearly_recap_sources','see_clearly_recaps',
  'see_clearly_sc1_records','see_clearly_sy2_records','see_clearly_sy3_records','see_clearly_sy4_records',
  'see_clearly_sg1_records','see_clearly_sg2_records','see_clearly_sg3_records','see_clearly_sg4_records',
  'deep_dive_reflections','deep_dive_module_progress',
  'formation_links','practice_returns','practices','formation_records','journal_entries',
  'user_curriculum_state','audit_events',
] as const;

export async function GET() {
  const actor = await requireActor();
  const reviewEmail = process.env.REVIEW_TEST_USER_EMAIL;
  if (process.env.REVIEW_TEST_ACCESS !== 'true' || !reviewEmail || actor.email !== reviewEmail) return new NextResponse('Not found', { status: 404 });
  return new NextResponse('<!doctype html><html><body style="font-family:system-ui;padding:40px"><h1>Reset review participant</h1><p>This clears the review participant data and progress. It does not delete the account or curriculum.</p><form method="post"><button style="padding:12px 18px;font-size:16px">Reset participant data</button></form></body></html>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function POST() {
  const actor = await requireActor();
  const reviewEmail = process.env.REVIEW_TEST_USER_EMAIL;
  if (process.env.REVIEW_TEST_ACCESS !== 'true' || !reviewEmail || actor.email !== reviewEmail) {
    return NextResponse.json({ kind: 'not_found' }, { status: 404 });
  }
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)?.replace(/\/$/, '');
  if (!serviceKey || !url) return NextResponse.json({ kind: 'configuration_error' }, { status: 500 });

  for (const table of TABLES) {
    const response = await fetch(`${url}/rest/v1/${table}?user_id=eq.${encodeURIComponent(actor.id)}`, {
      method: 'DELETE',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'return=minimal' },
    });
    if (!response.ok) {
      console.error('[review/reset] delete failed', { table, status: response.status });
      return NextResponse.json({ kind: 'reset_failed', table }, { status: 500 });
    }
  }
  return NextResponse.json({ kind: 'reset', tables: TABLES.length });
}
