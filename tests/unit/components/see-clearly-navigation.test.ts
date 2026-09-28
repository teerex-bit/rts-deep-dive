import { describe, expect, it } from 'vitest';
import { seeClearlyNavigation } from '../../../components/deep-dive/see-clearly-navigation';

describe('See Clearly group navigation', () => {
  it('keeps the first movement within See Yourself Clearly', () => {
    for (const id of ['sc1', 'sy2', 'sy3', 'sy4'] as const) {
      const navigation = seeClearlyNavigation(id);
      expect(navigation.backLabel).toBe('Back to See Yourself Clearly');
      expect(navigation.backHref).toBe('/deep-dive/see-clearly#see-yourself-heading');
    }
    expect(seeClearlyNavigation('sc1')).toMatchObject({ nextLabel: 'NEXT', nextTitle: 'How a Reaction Takes Shape', nextHref: '/deep-dive/see-clearly/follow-the-formation-chain' });
    expect(seeClearlyNavigation('sy2')).toMatchObject({ nextLabel: 'NEXT', nextTitle: 'The Learned Self-Story' });
    expect(seeClearlyNavigation('sy3')).toMatchObject({ nextLabel: 'NEXT', nextTitle: 'What Is Actually True About Me' });
    expect(seeClearlyNavigation('sy4')).toMatchObject({ transition: 'You have finished See Yourself Clearly.', nextLabel: 'NEXT', nextTitle: 'The God I Learned', nextHref: '/deep-dive/see-clearly/the-god-i-learned' });
  });

  it('keeps the second movement within See God Clearly and hands off to Become', () => {
    for (const id of ['sg1', 'sg2', 'sg3', 'sg4'] as const) {
      const navigation = seeClearlyNavigation(id);
      expect(navigation.backLabel).toBe('Back to See God Clearly');
      expect(navigation.backHref).toBe('/deep-dive/see-clearly#see-god-heading');
    }
    expect(seeClearlyNavigation('sg1')).toMatchObject({ nextLabel: 'NEXT', nextTitle: 'What I Expect From God' });
    expect(seeClearlyNavigation('sg2')).toMatchObject({ nextLabel: 'NEXT', nextTitle: 'Jesus Shows Us the Father' });
    expect(seeClearlyNavigation('sg3')).toMatchObject({ nextLabel: 'NEXT', nextTitle: 'Can I Trust God Here?' });
    expect(seeClearlyNavigation('sg4')).toMatchObject({ nextLabel: 'NEXT', nextTitle: 'What Has Become Clear' });
  });
});
