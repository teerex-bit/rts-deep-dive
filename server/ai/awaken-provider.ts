export async function requestAwakenGuidance(apiKey: string, instructions: string, context: unknown) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', signal: AbortSignal.timeout(25_000),
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.RTS_AWAKEN_GUIDE_MODEL ?? 'gpt-5.4-mini', store: false,
    input: [
      { role: 'developer', content: [{ type: 'input_text', text: instructions }] },
      { role: 'user', content: [{ type: 'input_text', text: '[PARTICIPANT_DATA_UNTRUSTED]\n' + JSON.stringify(context) }] },
    ], text: { format: { type: 'json_schema', name: 'rts_awaken_guidance', strict: true, schema: SCHEMA } },
    }),
  });
  if (!response.ok) {
    console.error('[awaken-guide] provider unavailable', { status: response.status });
    throw new Error('provider_unavailable');
  }
  const data = await response.json();
  const texts = data.output?.flatMap((item: { content?: { type: string; text?: string }[] }) => item.content ?? []).filter((item: { type: string; text?: string }) => item.type === 'output_text' && typeof item.text === 'string');
  if (!texts?.length) { console.error('[awaken-guide] provider output shape invalid', { textCount: texts?.length ?? 0 }); throw new Error('invalid_output_shape'); }
  try { return JSON.parse(texts[texts.length - 1].text) as unknown; } catch { console.error('[awaken-guide] provider output JSON invalid'); throw new Error('invalid_output_json'); }
}

const SCHEMA = { type: 'object', additionalProperties: false, required: ['question','guidance','observation','complete'], properties: {
  question: { type: 'string' }, guidance: { type: 'string' }, observation: { type: 'string' }, complete: { type: 'boolean' },
} };
