import { NextResponse } from 'next/server';
import { isSameOriginRequest } from '../../../../server/http/same-origin';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';

const headers = { 'cache-control': 'no-store', 'content-type': 'application/json' };
const MODEL = process.env.RTS_AWAKEN_GUIDE_MODEL ?? 'gpt-6-luna';

type Turn = { question: string; answer: string };
type RequestBody = { moment?: string; reaction?: string; turns: Turn[]; step: number; mode?: 'next' | 'synthesis' };

const fallbackQuestions = [
  'What did you think was happening in that moment?',
  'What did that seem to say about the situation or about you?',
  'What were you bracing for or expecting to happen next?',
  'What did you most want in that moment?',
  'What were you trying to protect, prevent, or control?',
  'What did you actually do?',
  'What happened inside you after you responded that way?',
];

function extractText(data: Record<string, unknown>) {
  const output = data.output as Array<Record<string, unknown>> | undefined;
  const texts = output?.flatMap(item => item.content as Array<Record<string, unknown>> ?? []).filter(item => item.type === 'output_text' && typeof item.text === 'string');
  return texts?.length === 1 ? String(texts[0].text) : null;
}

export async function POST(request: Request) {
  try {
    await requireActor();
    if (!isSameOriginRequest(request)) return new Response(JSON.stringify({ kind: 'forbidden' }), { status: 403, headers });
    const body = await request.json() as RequestBody;
    if (!body || !Array.isArray(body.turns) || body.turns.length > 12 || !Number.isInteger(body.step)) return new Response(JSON.stringify({ kind: 'invalid_request' }), { status: 400, headers });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ kind: 'fallback', question: fallbackQuestions[Math.min(body.step, fallbackQuestions.length - 1)] }, { headers });

    const instructions = body.mode === 'synthesis'
      ? `You are the invisible formation-guide engine for Reforming the Soul (RTS), Awaken. The participant never chats with you. Return JSON only with keys "headline", "summary", "noticing", "carryQuestion". Use only evidence in the participant's exact answers. Briefly connect event, meaning, expectation, desire/protection, action, and self-evaluation where supported. Do not diagnose, infer trauma, assign motives, label identity, tell the participant what God is saying, or claim certainty beyond their words. If an answer does not support a category, omit that conclusion. "noticing" must be one or two neutral observations. "carryQuestion" must be one open question. Keep the total under 170 words.`
      : `You are the invisible formation-guide engine for Reforming the Soul (RTS), Awaken. The participant never chats with you; your output becomes the next designed page prompt. Return JSON only with keys "question", "guidance", "reason", "complete". Ask exactly one short neutral question. Keep the inquiry coherent around this fixed formation scaffold: perception/meaning, belief, expectation, desire, protection/intention, concrete choice, aftermath/self-evaluation. Do not mechanically ask labels. Use the participant's exact prior answers to choose the most natural next question. If an answer is vague, mismatched, or contains a self-judgment such as "I was weak", ask one clarifying/follow-up question instead of advancing. Never diagnose, infer trauma, invent hidden motives, label identity, tell them what God is saying, or pressure them to find depth. "I don't know" and "nothing really" may be valid; at most one gentle alternate-angle follow-up before moving on. Avoid repeating a question already answered. Target 7-10 total questions, hard maximum 12. Set complete true only when there is enough material for a coherent non-diagnostic synthesis or the hard maximum is reached. Guidance is one sentence or empty. Reason is an internal category token from: clarify, follow, advance, finish.`;

    const payload = {
      model: MODEL, store: false,
      input: [
        { role: 'developer', content: [{ type: 'input_text', text: instructions }] },
        { role: 'user', content: [{ type: 'input_text', text: JSON.stringify({ moment: body.moment ?? '', reaction: body.reaction ?? '', turns: body.turns, step: body.step }) }] },
      ],
      text: { format: { type: 'json_object' } },
    };
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', signal: AbortSignal.timeout(12000), headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) return NextResponse.json({ kind: 'fallback', question: fallbackQuestions[Math.min(body.step, fallbackQuestions.length - 1)] }, { headers });
    const data = await response.json() as Record<string, unknown>;
    const text = extractText(data);
    if (!text) return NextResponse.json({ kind: 'fallback', question: fallbackQuestions[Math.min(body.step, fallbackQuestions.length - 1)] }, { headers });
    const value = JSON.parse(text) as Record<string, unknown>;
    return NextResponse.json({ kind: 'success', ...value }, { headers });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) return new Response(JSON.stringify({ kind: 'unauthorized' }), { status: 401, headers });
    return NextResponse.json({ kind: 'fallback', question: 'What seems most important to notice about what happened inside you?' }, { headers });
  }
}
