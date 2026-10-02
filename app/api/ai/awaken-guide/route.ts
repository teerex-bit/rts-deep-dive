import { NextResponse } from 'next/server';
import { isSameOriginRequest } from '../../../../server/http/same-origin';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';
import { guidanceInstructions, LESSON_PURPOSES } from '../../../../server/ai/awaken-guidance';
import { validGuidance, type AwakenLesson } from '../../../../domain/awaken-guidance';
import { requestAwakenGuidance } from '../../../../server/ai/awaken-provider';

const headers = { 'cache-control': 'no-store' };
function turnsValid(turns: unknown): turns is { question: string; answer: string }[] {
  return Array.isArray(turns) && turns.length <= 8 && turns.every(t => t && typeof t.question === 'string' && t.question.length <= 1000 && typeof t.answer === 'string' && t.answer.length <= 4000);
}
export async function POST(request: Request) {
  try {
    await requireActor();
    if (!isSameOriginRequest(request)) return NextResponse.json({ kind: 'forbidden' }, { status: 403, headers });
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ kind: 'invalid_request' }, { status: 400, headers }); }
    const lesson = body?.lesson ?? 'a1';
    if (!Object.hasOwn(LESSON_PURPOSES, lesson) || !turnsValid(body?.turns)
      || (body.phase !== undefined && !['inquiry','reflection'].includes(body.phase))
      || (body.context !== undefined && !turnsValid(body.context))
      || (body.moment !== undefined && (typeof body.moment !== 'string' || body.moment.length > 4000))
      || (body.reaction !== undefined && (typeof body.reaction !== 'string' || body.reaction.length > 500))) {
      return NextResponse.json({ kind: 'invalid_request' }, { status: 400, headers });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ kind: 'unavailable' }, { status: 503, headers });
    const context = { lesson, phase: body.phase ?? 'inquiry', moment: body.moment ?? '', reaction: body.reaction ?? '', turns: body.turns, earlierConversation: body.context ?? [] };
    const result = await requestAwakenGuidance(apiKey, guidanceInstructions(lesson as AwakenLesson, body.phase === 'reflection'), context);
    if (!validGuidance(result)) throw new Error('invalid_output');
    return NextResponse.json({ kind: 'success', ...result, complete: result.complete || body.turns.length >= 8, question: result.complete || body.turns.length >= 8 ? '' : result.question.trim() }, { headers });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) return NextResponse.json({ kind: 'unauthorized' }, { status: 401, headers });
    // Never log participant words, provider payloads, or credentials.
    console.error('[awaken-guide] guidance unavailable', { cause: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ kind: 'unavailable' }, { status: 503, headers });
  }
}
