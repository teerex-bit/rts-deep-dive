import { createHmac, timingSafeEqual } from 'node:crypto';
import { requireActor, type AuthenticatedActor } from './require-actor';

type ReviewConfig = { [key: string]: string | undefined; REVIEW_TEST_ACCESS?: string; REVIEW_TEST_USER_EMAIL?: string; SUPABASE_SECRET_KEY?: string; SUPABASE_SERVICE_ROLE_KEY?: string };
const lifetime = 15 * 60 * 1000;

export function reviewActorAllowed(actor: AuthenticatedActor, config: ReviewConfig = process.env) {
  return config.REVIEW_TEST_ACCESS === 'true' && Boolean(config.REVIEW_TEST_USER_EMAIL) && actor.email === config.REVIEW_TEST_USER_EMAIL;
}

function key(config: ReviewConfig) {
  return config.SUPABASE_SECRET_KEY ?? config.SUPABASE_SERVICE_ROLE_KEY;
}

export function issueReviewJump(actor: AuthenticatedActor, path: string, section: string, config: ReviewConfig = process.env, now = Date.now()) {
  const secret = key(config);
  if (!reviewActorAllowed(actor, config) || !secret) return null;
  const payload = Buffer.from(JSON.stringify([actor.id, path, section, now + lifetime])).toString('base64url');
  const mac = createHmac('sha256', secret).update(`rts-review-jump:${payload}`).digest('base64url');
  return `${payload}.${mac}`;
}

export function verifyReviewJump(actor: AuthenticatedActor, path: string, section: string | undefined, token: string | null | undefined, config: ReviewConfig = process.env, now = Date.now()) {
  const secret = key(config);
  if (!reviewActorAllowed(actor, config) || !secret || !token || !section) return false;
  const [payload, mac, extra] = token.split('.');
  if (!payload || !mac || extra || payload.length > 2048) return false;
  const expected = createHmac('sha256', secret).update(`rts-review-jump:${payload}`).digest();
  let actual: Buffer;
  try { actual = Buffer.from(mac, 'base64url'); }
  catch { return false; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const decoded: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Array.isArray(decoded) && decoded.length === 4 && decoded[0] === actor.id && decoded[1] === path && decoded[2] === section && typeof decoded[3] === 'number' && decoded[3] >= now && decoded[3] <= now + lifetime;
  } catch { return false; }
}

export async function reviewJumpFor(query: { section?: string; reviewJump?: string }, path: string) {
  if (!query.reviewJump || !query.section || process.env.REVIEW_TEST_ACCESS !== 'true') return false;
  return verifyReviewJump(await requireActor(), path, query.section, query.reviewJump);
}
