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
    expect(draft).not.toMatch(/\n\n|___|undefined|You left this open/);
    expect(provisionalNarrative([])).toBe('');
  });
  it('keeps a long chain concise without filling absent stages', () => {
    const draft = provisionalNarrative([{ module: 'sy2', title: recapPrompts[1].title, href: '', progressId: 'one',
      words: ['I saw a pause.', 'I felt excluded.', 'I expected silence.', 'I wanted reassurance.', 'I planned to text.', 'I sent a message.', 'I waited.'] }]);
    expect(draft).toContain('I saw a pause.');
    expect(draft).toContain('I waited.');
    expect(draft).not.toContain('I felt excluded.');
    expect(draft).not.toContain('A picture of God');
  });
});
