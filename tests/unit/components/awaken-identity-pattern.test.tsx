import { describe, expect, it } from 'vitest';
import { composeObservedPattern } from '../../../components/deep-dive/a3-identity-pattern';
// The active identity inquiry's adaptive behavior is covered in awaken-adaptive.test.tsx.
describe('observed pattern formatting for existing callers', () => {
  it('keeps uncertain observations blank', () => {
    expect(composeObservedPattern('I’m not sure', 'I’m not sure')).toBe('I tend to __________ when __________.');
  });
  it('preserves participant wording', () => {
    expect(composeObservedPattern('get defensive', 'I feel misunderstood')).toBe('I tend to get defensive when I feel misunderstood.');
  });
});
