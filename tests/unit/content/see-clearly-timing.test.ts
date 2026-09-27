import { describe, expect, it } from 'vitest';
import { SC1_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sc1';
import { SY2_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sy2';
import { SY3_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sy3';
import { SY4_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sy4';
import { SG1_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sg1';
import { SG2_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sg2';
import { SG3_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sg3';
import { SG4_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sg4';

const lessons = [SC1_SECTIONS, SY2_SECTIONS, SY3_SECTIONS, SY4_SECTIONS, SG1_SECTIONS, SG2_SECTIONS, SG3_SECTIONS, SG4_SECTIONS];
const future = /\b(?:in the coming days|over the next few days|during the next few days|for the next few days|this week|notice over time)\b/i;

describe('See Clearly reflection timing', () => {
  it('keeps future-facing noticing after the immediate reflection in every lesson', () => {
    for (const sections of lessons) {
      const reflection = sections.findIndex(section => section.id === 'reflection');
      expect(reflection).toBeGreaterThan(-1);
      for (const section of sections.slice(0, reflection + 1))
        expect(section.paragraphs.join(' '), `${sections[0].title}: ${section.id}`).not.toMatch(future);
    }
  });
  it('keeps the approved immediate questions and the Gospel noticing lens', () => {
    expect(SG1_SECTIONS.find(section => section.id === 'carry-forward')?.paragraphs).toContain(
      'In the coming days, notice when this picture of God becomes visible. You do not need to correct it or prove where it came from.');
    expect(SG2_SECTIONS.find(section => section.id === 'carry-forward')?.paragraphs).toContain(
      'In the coming days, notice whether a similar expectation appears. Which moment brings it into view? There is no need to produce an explanation.');
    expect(SG3_SECTIONS.find(section => section.id === 'carry-forward')?.paragraphs.slice(-5)).toEqual([
      'In the coming days, read a Gospel encounter slowly.', 'What does Jesus notice?', 'How does He respond?',
      'What does He refuse to compromise?', 'What does this show you about God?',
    ]);
  });
});
