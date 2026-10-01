import { NextResponse } from 'next/server';
import { isSameOriginRequest } from '../../../../server/http/same-origin';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';

const headers = { 'cache-control': 'no-store', 'content-type': 'application/json' };
const MODEL = process.env.RTS_AWAKEN_GUIDE_MODEL ?? 'gpt-5.4-mini';

type Turn = { question: string; answer: string };
type RequestBody = { moment?: string; reaction?: string; turns: Turn[]; mode?: 'next' | 'synthesis' };

const NEXT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['action','question','guidance','relevance','observations','complete'],
  properties: {
    action: { type: 'string', enum: ['advance','clarify','follow','reframe','accept_uncertainty','finish'] },
    question: { type: 'string' },
    guidance: { type: 'string' },
    relevance: { type: 'string' },
    observations: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['area','evidence'], properties: { area: { type: 'string', enum: ['event','perception','emotion','meaning','belief','expectation','desire','fear','protection','intention','choice','aftermath','self_judgment','other_judgment','god_assumption','relational_assumption','uncertainty'] }, evidence: { type: 'string' } } } },
    complete: { type: 'boolean' },
  },
} as const;

const SYNTH_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['headline','summary','noticing','carryQuestion'],
  properties: {
    headline: { type: 'string' }, summary: { type: 'string' },
    noticing: { type: 'array', minItems: 1, maxItems: 2, items: { type: 'string' } },
    carryQuestion: { type: 'string' },
  },
} as const;

function outputText(data: Record<string, unknown>) {
  const output = data.output as Array<Record<string, unknown>> | undefined;
  const texts = output?.flatMap(item => item.content as Array<Record<string, unknown>> ?? []).filter(item => item.type === 'output_text' && typeof item.text === 'string');
  return texts?.length === 1 ? String(texts[0].text) : null;
}

async function askOpenAI(apiKey: string, instructions: string, context: unknown, schema: object, name: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', signal: AbortSignal.timeout(15_000),
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, store: false,
      input: [
        { role: 'developer', content: [{ type: 'input_text', text: instructions }] },
        { role: 'user', content: [{ type: 'input_text', text: '[PARTICIPANT_DATA_UNTRUSTED]\n' + JSON.stringify(context) }] },
      ],
      text: { format: { type: 'json_schema', name, strict: true, schema } },
    }),
  });
  if (!response.ok) {
    const providerBody = await response.text();
    let providerMessage = '';
    try {
      const parsed = JSON.parse(providerBody) as { error?: { message?: string; code?: string; type?: string } };
      providerMessage = [parsed.error?.type, parsed.error?.code, parsed.error?.message].filter(Boolean).join(' | ').slice(0, 500);
    } catch { providerMessage = providerBody.slice(0, 300); }
    console.error('[awaken-guide] OpenAI rejected request', { status: response.status, detail: providerMessage || 'no safe detail' });
    throw new Error(`provider_${response.status}`);
  }
  const data = await response.json() as Record<string, unknown>;
  const text = outputText(data);
  if (!text) throw new Error('provider_no_output');
  return JSON.parse(text) as Record<string, unknown>;
}

const INQUIRY = `You are an invisible context backstop for Reforming the Soul (RTS), Awaken A1. RTS controls the journey; you only make the next question fit what the participant just said.

A1 OBJECTIVE: help the participant look honestly at what they noticed in a real moment. Do not try to produce a realization, agreement, insight, or conclusion. The participant decides what they notice and whether anything is there.

The participant has already chosen an initial noticing word such as anger, fear, embarrassment, control, withdrawal, defensiveness, urgency, or their own wording. Treat it only as a starting point.

Ask only when the participant's latest answer gives a genuine reason to keep looking. Usually 1-3 AI-generated questions after the initial noticing word; sometimes none. Never exceed 4. Stopping is a success when the participant has noticed enough or there is nothing more to notice.

OUTPUT STYLE IS CRITICAL:
- The question must be short: ideally 6-10 words, never more than 12.
- Ask one thing only.
- Use ordinary spoken language.
- Keep it concrete and tied to the immediate moment.
- Do not use therapeutic, clinical, analytical, or abstract language.
- The guidance field should normally be EMPTY. If guidance is truly needed, use no more than 6 simple words. Never write a teaching sentence, explanation, or instruction in guidance.
- The relevance field is internal audit text and is not participant-facing.
- observations are internal audit data and must be grounded in the participant's own words.

Do not:
- diagnose;
- search for causes or childhood origins;
- infer trauma or hidden motives;
- correct beliefs;
- prescribe behavior;
- connect this moment to prior lessons or prior moments;
- force See/Believe/Expect/Desire/Intend/Choose/Live categories;
- ask "what is most important?", "what is underneath that?", or similarly heavy questions;
- manufacture depth;
- steer the participant toward the intended recognition;
- assume the participant must discover that "something was already happening in you";
- treat agreement with the lesson as a successful answer;
- explain why the question is being asked;
- ask about the participant's moment, reaction, feeling, urge, thought, or what changed inside them;
- NEVER ask about the question itself, whether a question felt weird, confusing, uncomfortable, or strange;
- NEVER use wording such as "that question", "this question", "my question", "the question", or "what felt weird about it".

FINISH when the participant has noticed something useful, when uncertainty is the honest answer, or when there is simply nothing more to notice. "I don't know," "nothing," or "I don't think anything happened" can all be successful A1 endings. Never keep asking merely to obtain the intended recognition.

Actions: advance, clarify, follow, reframe, accept_uncertainty, finish.
When finish, question must be empty.`;

const SYNTHESIS = `You are the invisible synthesis engine inside Reforming the Soul (RTS), Awaken A1.

A1 is about honest noticing, not producing recognition. Use only the participant's actual material. Organize what they noticed without suggesting what they should have noticed.

Do not diagnose, explain causes, infer motives, correct beliefs, prescribe change, label identity, or claim what God is saying. Do not manufacture a revelation. It is completely acceptable for the participant not to know exactly what the internal movement was.

headline: short and simple; favor recognition over interpretation.
summary: 45-90 words. Briefly connect the event, the participant's initial noticing word, and one or two things they noticed while staying with it. If uncertainty remained, preserve it.
noticing: one or two neutral observations grounded in their words.
carryQuestion: orient toward future noticing, not deeper analysis. Prefer a form of "See if you notice that same movement again" when appropriate.

The ending should communicate: You do not have to explain or change anything yet. Whatever you honestly noticed is enough for A1.`;

export async function POST(request: Request) {
  try {
    await requireActor();
    if (!isSameOriginRequest(request)) {
      console.error('[awaken-guide] same-origin check failed', { origin: request.headers.get('origin'), host: request.headers.get('host'), urlHost: new URL(request.url).host });
      return new Response(JSON.stringify({ kind: 'forbidden', diagnostic: 'same_origin' }), { status: 403, headers });
    }
    console.info('[awaken-guide] request reached endpoint', { mode: (await request.clone().json().catch(() => null) as { mode?: string } | null)?.mode ?? 'unknown' });
    const body = await request.json() as RequestBody;
    if (!body || !Array.isArray(body.turns) || body.turns.length > 12 || body.turns.some(t => !t || typeof t.question !== 'string' || typeof t.answer !== 'string')) return new Response(JSON.stringify({ kind: 'invalid_request' }), { status: 400, headers });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[awaken-guide] OPENAI_API_KEY is not configured');
      return NextResponse.json({ kind: 'unavailable', diagnostic: 'missing_api_key' }, { status: 503, headers });
    }
    const context = { moment: String(body.moment ?? '').slice(0,4000), reaction: String(body.reaction ?? '').slice(0,500), turns: body.turns.map(t => ({ question: t.question.slice(0,500), answer: t.answer.slice(0,4000) })) };
    if (body.mode === 'synthesis') return NextResponse.json({ kind: 'success', ...(await askOpenAI(apiKey, SYNTHESIS, context, SYNTH_SCHEMA, 'rts_awaken_synthesis')) }, { headers });
    if (body.turns.length >= 4) return NextResponse.json({ kind: 'success', action: 'finish', question: '', guidance: '', relevance: 'Hard inquiry limit reached.', observations: [], complete: true }, { headers });
    const result = await askOpenAI(apiKey, INQUIRY, context, NEXT_SCHEMA, 'rts_awaken_next_question');
    const question = typeof result.question === 'string' ? result.question.trim() : '';
    const metaQuestion = /\b(that|this|the|my) question\b|what felt weird|what felt strange|did that feel/i.test(question);
    if (metaQuestion) {
      const repaired = await askOpenAI(
        apiKey,
        INQUIRY + '\\n\\nREPAIR REQUIRED: The previous draft asked about the question itself. Do not do that. Ask instead about what the participant noticed in the actual moment.',
        context,
        NEXT_SCHEMA,
        'rts_awaken_next_question_repair'
      );
      repaired.guidance = '';
      return NextResponse.json({ kind: 'success', ...repaired }, { headers });
    }
    result.guidance = '';
    return NextResponse.json({ kind: 'success', ...result }, { headers });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      console.error('[awaken-guide] review request was not authenticated');
      return new Response(JSON.stringify({ kind: 'unauthorized', diagnostic: 'auth' }), { status: 401, headers });
    }
    const diagnostic = error instanceof Error ? error.message.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) : 'unknown';
    console.error('[awaken-guide] request failed', { diagnostic });
    return NextResponse.json({ kind: 'unavailable', diagnostic }, { status: 503, headers });
  }
}
