import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeeClearlyStage, seeClearlyStageAction } from '../../../components/deep-dive/SeeClearlyStage';
import { BecomeStage } from '../../../components/deep-dive/BecomeStage';

const completed = Array(8).fill('review') as ('begin' | 'resume' | 'review')[];

describe('See Clearly stage continuation', () => {
  it.each([
    [2, 'begin', 'CONTINUE SEE CLEARLY', 'The Learned Self-Story', '/deep-dive/see-clearly/the-learned-self-story'],
    [2, 'resume', 'RESUME SEE CLEARLY', 'The Learned Self-Story', '/deep-dive/see-clearly/the-learned-self-story'],
    [4, 'begin', 'CONTINUE SEE CLEARLY', 'The God I Learned', '/deep-dive/see-clearly/the-god-i-learned'],
    [5, 'resume', 'RESUME SEE CLEARLY', 'What I Expect From God', '/deep-dive/see-clearly/what-i-expect-from-god'],
    [6, 'resume', 'RESUME SEE CLEARLY', 'Jesus Shows Us the Father', '/deep-dive/see-clearly/jesus-shows-us-the-father'],
  ] as const)('selects the first unfinished lesson at index %i', (index, status, label, title, href) => {
    const states = [...completed]; states[index] = status;
    for (let i = index + 1; i < states.length; i++) states[i] = 'begin';
    expect(seeClearlyStageAction(states)).toEqual({ label, title, href });
  });

  it('hands completed See Clearly to the real Become doorway', () => {
    expect(seeClearlyStageAction(completed)).toEqual({ label: 'REVIEW WHAT HAS BECOME CLEAR', href: '/deep-dive/see-clearly/what-has-become-clear' });
  });

  it('keeps the lesson review links and gives the hub a journey return', () => {
    const html = renderToStaticMarkup(<SeeClearlyStage status="review" sy2Status="review" sy3Status="begin" />);
    expect(html).toContain('Review SY1');
    expect(html).toContain('Review SY2');
    expect(html).toContain('BACK TO FORMATION JOURNEY');
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('href="/deep-dive/see-clearly/the-learned-self-story"');
    expect(html).not.toContain('Begin SG1');
  });

  it('shows a read-only Become doorway and routes back to See Clearly', () => {
    const html = renderToStaticMarkup(<BecomeStage />);
    expect(html).toContain('Live With God');
    expect(html).toContain('The Person Being Formed');
    expect(html).toContain('BACK TO SEE CLEARLY');
    expect(html).toContain('href="/deep-dive/see-clearly"');
    expect(html).toContain('href="/dashboard"');
    expect(html).not.toContain('Begin lesson');
  });
});
