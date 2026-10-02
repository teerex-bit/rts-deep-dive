import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ allowed: true }));
vi.mock('../../../server/auth/require-actor', () => {
  class AuthenticationRequiredError extends Error {}
  return { AuthenticationRequiredError, requireActor: async () => {
    if (!auth.allowed) throw new AuthenticationRequiredError();
    return { id: 'actor-one', email: 'test@example.com' };
  } };
});
import { POST } from '../../../app/api/ai/awaken-guide/route';
const result = { question: 'How did you respond when they cut you off?', guidance: '', observation: '', complete: false };
function request(body: unknown, origin = 'https://review.example') {
  return new Request('https://review.example/api/ai/awaken-guide', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
beforeEach(() => { auth.allowed = true; vi.stubEnv('OPENAI_API_KEY', 'test-only'); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Awaken guidance boundary', () => {
  it.each(['a1','a2','a3','a4'])('passes %s purpose and participant words to the provider without storing them', async lesson => {
    let sent: Record<string, any> = {};
    vi.stubGlobal('fetch', async (_url: string, options: RequestInit) => {
      sent = JSON.parse(String(options.body));
      return Response.json({ output: [{ content: [{ type: 'output_text', text: JSON.stringify(result) }] }] });
    });
    const response = await POST(request({ lesson, turns: [{ question: 'What happened?', answer: 'Someone cut me off in traffic' }] }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ kind: 'success', question: result.question });
    expect(sent.store).toBe(false);
    expect(sent.input[0].content[0].text).toContain(lesson.toUpperCase());
    expect(JSON.parse(sent.input[1].content[0].text.split('\n')[1])).toMatchObject({ lesson, turns: [{ question: 'What happened?', answer: 'Someone cut me off in traffic' }] });
  });
  it.each([{ lesson: 'other', turns: [] }, { lesson: 'a4', turns: [{ question: 'q', answer: 7 }] }, { lesson: 'a2', turns: Array(9).fill({ question: 'q', answer: 'a' }) }, { lesson: 'a3', phase: 'bad', turns: [] }])('rejects invalid input before calling the provider', async body => {
    let called = false;
    vi.stubGlobal('fetch', async () => { called = true; throw new Error('should not call'); });
    expect((await POST(request(body))).status).toBe(400);
    expect(called).toBe(false);
  });
  it('refuses unauthenticated and cross-origin callers', async () => {
    auth.allowed = false;
    expect((await POST(request({ lesson: 'a4', turns: [] }))).status).toBe(401);
    auth.allowed = true;
    expect((await POST(request({ lesson: 'a4', turns: [] }, 'https://other.example'))).status).toBe(403);
  });
  it('does not expose malformed provider output as successful guidance', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ output: [{ content: [{ type: 'output_text', text: '{"complete":false}' }] }] }));
    expect((await POST(request({ lesson: 'a4', turns: [] }))).status).toBe(503);
  });
});
