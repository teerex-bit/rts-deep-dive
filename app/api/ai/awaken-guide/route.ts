import { NextResponse } from 'next/server';
import { isSameOriginRequest } from '../../../../server/http/same-origin';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';

const headers = { 'cache-control': 'no-store', 'content-type': 'application/json' };
const MODEL = process.env.RTS_AWAKEN_GUIDE_MODEL ?? 'gpt-5.4-mini';

type Turn = { question: string; answer: string };
type Observation = { kind?: string; value?: unknown };
type RequestBody = { moment?: string; reaction?: string; turns?: Turn[]; supported?: Observation[]; activeThread?: Turn[]; mode?: 'next' | 'synthesis' };

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

const INQUIRY = `You are the invisible adaptive inquiry engine inside Reforming the Soul (RTS), Awaken. The app has already handled routine framework steps deterministically; you are called only because the participant's own language may change the smallest useful next move. The participant never chats with you and never sees your analysis. Your output selects the next RTS page question.

AWAKEN PURPOSE: awaken attention and possibility. Help the participant recognize that something was happening inside them alongside their outward reaction. Identifying exactly what it was, explaining why it exists, correcting it, or resolving it is NOT required.

SUCCESS = the participant can recognize "there was something happening in me worth noticing," even if they cannot name or explain it. Once that recognition is reasonably present, FINISH. Do not keep digging merely to fill categories or produce a deeper insight.

Follow THIS lived moment. Ask one natural question at a time based specifically on what the participant just said. The RTS formation model may organize your private thinking, but it must never become a checklist.

RELEVANCE TEST: before asking a question, be able to state why it follows from the participant's actual words. If the reason is only that another formation category has not been explored, do not ask it.

Prefer ordinary questions such as:
- What was it about that moment that brought that up for you?
- What did you notice happening inside you?
- Did that stay with you, or did it pass?
These are examples, not a script.

Actions:
advance = one more natural question would help recognition;
clarify = the participant's answer is unclear and one clarification would help;
follow = something they just said is worth one brief follow-up;
reframe = the previous question did not fit;
accept_uncertainty = accept that they do not know and move toward completion;
finish = they recognize an internal movement, or further questioning would force meaning.

Hard boundaries:
- Never diagnose, infer trauma, invent hidden motives, assign identity labels, or claim what God is saying.
- Never assume a negative pattern exists.
- Never tell the participant what they really feel or mean.
- "I don't know", "nothing really", and uncertainty are valid.
- Do not pursue causes or origins merely to create depth.
- Do not correct beliefs during Awaken.
- Do not prescribe behavior during Awaken.
- Do not force the participant to name the internal movement.
- If their initial feeling/word is enough to establish recognition, ask only what is necessary to connect it to the lived moment.
- Target 3-5 questions after the initial noticing choice. A sixth question is allowed only when one brief clarification is genuinely needed. Seven is the absolute hard stop. Once the participant has demonstrated awareness of an internal reaction or movement, strongly prefer FINISH over asking for deeper explanation.
- question must be empty when action=finish.
- guidance is at most one short sentence.
- relevance is internal audit text and is not shown to the participant.
- observations must be grounded in participant wording.`;

const SYNTHESIS = `You are the invisible synthesis engine inside Reforming the Soul (RTS), Awaken A1.

A1 is about recognition, not explanation. Use only the participant's actual material to help them see that something was happening inside them that they noticed by staying with the moment.

Do not diagnose, explain causes, infer motives, correct beliefs, prescribe change, label identity, or claim what God is saying. Do not manufacture a revelation. It is completely acceptable for the participant not to know exactly what the internal movement was.

headline: short and simple; favor recognition over interpretation.
summary: 45-90 words. Briefly connect the event, the participant's initial noticing word, and one or two things they noticed while staying with it. If uncertainty remained, preserve it.
noticing: one or two neutral observations grounded in their words.
carryQuestion: orient toward future noticing, not deeper analysis. Prefer a form of "See if you notice that same movement again" when appropriate.

The ending should communicate: You do not have to explain or change this yet. You saw something that had previously been happening without your awareness. Even one more noticed step creates possibility.`;

export async function POST(request: Request) {
  try {
    await requireActor();
    if (!isSameOriginRequest(request)) {
      console.error('[awaken-guide] same-origin check failed', { origin: request.headers.get('origin'), host: request.headers.get('host'), urlHost: new URL(request.url).host });
      return new Response(JSON.stringify({ kind: 'forbidden', diagnostic: 'same_origin' }), { status: 403, headers });
    }
    console.info('[awaken-guide] request reached endpoint', { mode: (await request.clone().json().catch(() => null) as { mode?: string } | null)?.mode ?? 'unknown' });
    const body = await request.json() as RequestBody;
    const turns = Array.isArray(body?.turns) ? body.turns : [];
    if (!body || turns.length > 7 || turns.some(t => !t || typeof t.question !== 'string' || typeof t.answer !== 'string')) return new Response(JSON.stringify({ kind: 'invalid_request' }), { status: 400, headers });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[awaken-guide] OPENAI_API_KEY is not configured');
      return NextResponse.json({ kind: 'unavailable', diagnostic: 'missing_api_key' }, { status: 503, headers });
    }
    const supported = Array.isArray(body.supported) ? body.supported.slice(0,6).map(item => ({
      kind: String(item?.kind ?? '').slice(0,40),
      value: String(item?.value ?? '').slice(0,700),
    })).filter(item => item.value) : [];
    const context = {
      moment: String(body.moment ?? '').slice(0,900),
      reaction: String(body.reaction ?? '').slice(0,180),
      supported,
      // Only the most recent relevant exchanges are sent. Older turns are represented
      // by supported observations rather than replaying the full transcript.
      turns: turns.slice(-2).map(t => ({ question: t.question.slice(0,240), answer: t.answer.slice(0,700) })),
    };
    if (body.mode === 'synthesis') return NextResponse.json({ kind: 'success', ...(await askOpenAI(apiKey, SYNTHESIS, context, SYNTH_SCHEMA, 'rts_awaken_synthesis')) }, { headers });
    if (turns.length >= 7) return NextResponse.json({ kind: 'success', action: 'finish', question: '', guidance: '', relevance: 'Hard inquiry limit reached.', observations: [], complete: true }, { headers });
    return NextResponse.json({ kind: 'success', ...(await askOpenAI(apiKey, INQUIRY, context, NEXT_SCHEMA, 'rts_awaken_next_question')) }, { headers });
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
