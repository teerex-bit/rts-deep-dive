import { describe, expect, it } from 'vitest';
import { provisionalNarrative, recapPrompts, type RecapSource } from '../../../domain/see-clearly-recap';

describe('See Clearly recap draft', () => {
  it('uses only available exact participant words in journey order', () => {
    const sources: RecapSource[] = [
      { module: 'sy3', title: recapPrompts[2].title, href: '', progressId: 'one', words: ['I may have learned to earn approval.'] },
      { module: 'sg3', title: recapPrompts[6].title, href: '', progressId: 'two', words: ['Jesus remained with Peter.'] },
    ];
    const draft = provisionalNarrative(sources);
    expect(draft).toContain('I may have learned to earn approval.');
    expect(draft).toContain('Jesus remained with Peter.');
    expect(draft).not.toContain('what is actually true');
    expect(provisionalNarrative([])).toBe('');
  });
});
