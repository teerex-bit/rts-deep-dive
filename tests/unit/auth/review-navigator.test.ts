import { describe, expect, it } from 'vitest';
import { issueReviewJump, verifyReviewJump, reviewActorAllowed } from '../../../server/auth/review-navigator';

const actor = { id: 'review-id', email: 'review@example.com' };
const config = { REVIEW_TEST_ACCESS: 'true', REVIEW_TEST_USER_EMAIL: actor.email, SUPABASE_SECRET_KEY: 'server-secret' };
const path = '/deep-dive/see-clearly/jesus-shows-us-the-father';

describe('review navigator authorization', () => {
  it('requires the server flag and exact authenticated email', () => {
    expect(reviewActorAllowed(actor, config)).toBe(true);
    expect(reviewActorAllowed({ ...actor, email: 'other@example.com' }, config)).toBe(false);
    expect(reviewActorAllowed(actor, { ...config, REVIEW_TEST_ACCESS: 'false' })).toBe(false);
    expect(reviewActorAllowed(actor, { ...config, REVIEW_TEST_USER_EMAIL: '' })).toBe(false);
  });

  it('accepts only a signed navigator link for the same actor, path and section', () => {
    const token = issueReviewJump(actor, path, 'reflection', config, 1000);
    expect(verifyReviewJump(actor, path, 'reflection', token, config, 1001)).toBe(true);
    expect(verifyReviewJump(actor, path, 'carry-forward', token, config, 1001)).toBe(false);
    expect(verifyReviewJump(actor, '/deep-dive/awaken/pay-attention', 'reflection', token, config, 1001)).toBe(false);
    expect(verifyReviewJump({ ...actor, id: 'someone-else' }, path, 'reflection', token, config, 1001)).toBe(false);
    expect(verifyReviewJump(actor, path, 'reflection', token, config, 1000 + 16 * 60 * 1000)).toBe(false);
    expect(verifyReviewJump(actor, path, 'reflection', token, { ...config, REVIEW_TEST_ACCESS: 'false' }, 1001)).toBe(false);
    expect(verifyReviewJump(actor, path, 'reflection', 'forged', config, 1001)).toBe(false);
    expect(verifyReviewJump(actor, path, 'reflection', undefined, config, 1001)).toBe(false);
  });
});
