import { describe, expect, it } from 'vitest';
import { SY2_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sy2';

describe('SY2 participant language', () => {
  const copy = SY2_SECTIONS.map(section => `${section.title} ${section.paragraphs.join(' ')}`).join('\n');

  it('establishes the formation progression before introducing links and the chain', () => {
    const entry = SY2_SECTIONS[0].paragraphs.join(' ');
    expect(entry).toMatch(/what you see.*what you believe.*what you expect.*what you desire.*what you intend.*what you choose.*how you live/i);
    expect(entry).toMatch(/movement as a link.*chain/i);
  });

  it('uses participant-facing language in the example, trace, reflection, and practice sections', () => {
    expect(copy).toContain('my interpretation of what happened could be wrong or incomplete');
    expect(copy).toContain('Don’t worry about explaining it perfectly. Just begin with what happened.');
    expect(copy).toContain('You do not need to settle everything here.');
    expect(copy).toContain('You have practiced following the links backward. Now begin noticing them as they happen in ordinary life.');
    expect(copy).not.toMatch(/your words here belong to this trace|earlier moment will not supply conclusions|database|saved entry|context mechanics/i);
  });
});
