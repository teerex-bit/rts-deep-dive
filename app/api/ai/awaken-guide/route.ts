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
  if (!response.ok) throw new Error(`provider_${response.status}`);
  const data = await response.json() as Record<string, unknown>;
  const text = outputText(data);
  if (!text) throw new Error('provider_no_output');
  return JSON.parse(text) as Record<string, unknown>;
}

const INQUIRY = `You are the invisible inquiry engine inside Reforming the Soul (RTS), Awaken. The participant never chats with you and never sees your analysis. Your output selects the next beautifully designed RTS page question.

PRIMARY RULE: understand THIS lived moment before trying to map it to a formation framework. Follow what the participant actually says. The RTS formation model is a private lens, never a checklist.

Maintain a partial evidence map only where supported: event, perception, emotion, meaning, belief, expectation, desire, fear, protection, intention, choice, aftermath, self_judgment, other_judgment, god_assumption, relational_assumption, uncertainty. It is correct for many areas to remain empty.

Before proposing a question, apply the RELEVANCE TEST: Why is this the most useful question specifically because of something the participant said? If the answer is merely "because this is the next formation category", choose another question.

A good question:
- refers naturally to the participant's actual situation or wording;
- helps them notice something not yet clear;
- asks one thing only;
- sounds human and conversational, not clinical, therapeutic, theological, or like a questionnaire;
- may stay with one important phrase for multiple turns when warranted.

Actions:
advance = a natural new angle is supported;
clarify = answer is ambiguous and one clarification would materially help;
follow = participant introduced something significant worth staying with;
reframe = previous question did not fit; approach from another angle;
accept_uncertainty = accept "I don't know"/"nothing really" and move without pressure;
finish = enough is visible for a useful synthesis.

Hard boundaries:
- Never diagnose, infer trauma, invent hidden motives, assign identity labels, or claim what God is saying.
- Never assume a negative pattern exists. Peace, joy, ordinary behavior, and "nothing deeper" are valid.
- Never tell the participant what they "really" feel or mean.
- Do not force belief/expectation/desire/protection questions when unsupported.
- "I don't know" and "nothing really" are valid. At most one gentle alternate-angle follow-up before accepting uncertainty.
- If the participant gives a self-evaluation ("I was weak", "I'm stupid"), distinguish it from observable behavior and usually follow the meaning of that evaluation.
- Avoid repeating answered questions.
- Target 6-10 questions; hard maximum 12. Finish earlier if the moment is already coherent.
- relevance is INTERNAL audit text, concise and evidence-based. It will not be shown to participant.
- observations must quote or closely preserve participant evidence; do not manufacture evidence.
- question must be empty when action=finish; otherwise one short question.
- guidance is at most one short sentence and may be empty.`;

const SYNTHESIS = `You are the invisible synthesis engine inside Reforming the Soul (RTS), Awaken. Using only the participant's exact lived-moment material, produce a concise reflection that helps them SEE what became visible.

Do not diagnose, explain hidden motives, infer trauma, label identity, prescribe a fix, claim what God is saying, or turn uncertainty into certainty. Distinguish event from interpretation and observable action from self-judgment. If a connection is not supported, omit it.

headline: a short participant-facing observation, not a diagnosis.
summary: 70-120 words, grounded in their actual wording.
noticing: one or two neutral observations worth noticing.
carryQuestion: one open question grounded in something unresolved or significant. It must not presume a pathology.
The participant's discovery belongs to them. Use language such as "you described", "you connected", "both appeared", "worth noticing", not "this means".`;

export async function POST(request: Request) {
  try {
    await requireActor();
    if (!isSameOriginRequest(request)) return new Response(JSON.stringify({ kind: 'forbidden' }), { status: 403, headers });
    const body = await request.json() as RequestBody;
    if (!body || !Array.isArray(body.turns) || body.turns.length > 12 || body.turns.some(t => !t || typeof t.question !== 'string' || typeof t.answer !== 'string')) return new Response(JSON.stringify({ kind: 'invalid_request' }), { status: 400, headers });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ kind: 'unavailable' }, { status: 503, headers });
    const context = { moment: String(body.moment ?? '').slice(0,4000), reaction: String(body.reaction ?? '').slice(0,500), turns: body.turns.map(t => ({ question: t.question.slice(0,500), answer: t.answer.slice(0,4000) })) };
    if (body.mode === 'synthesis') return NextResponse.json({ kind: 'success', ...(await askOpenAI(apiKey, SYNTHESIS, context, SYNTH_SCHEMA, 'rts_awaken_synthesis')) }, { headers });
    if (body.turns.length >= 12) return NextResponse.json({ kind: 'success', action: 'finish', question: '', guidance: '', relevance: 'Hard inquiry limit reached.', observations: [], complete: true }, { headers });
    return NextResponse.json({ kind: 'success', ...(await askOpenAI(apiKey, INQUIRY, context, NEXT_SCHEMA, 'rts_awaken_next_question')) }, { headers });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) return new Response(JSON.stringify({ kind: 'unauthorized' }), { status: 401, headers });
    return NextResponse.json({ kind: 'unavailable' }, { status: 503, headers });
  }
}
