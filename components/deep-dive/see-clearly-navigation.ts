const lessons = [
  'Facts and Interpretation',
  'Follow the Formation Chain',
  'The Learned Self-Story',
  'What Is Actually True About Me',
  'The God I Learned',
  'What I Expect From God',
  'Jesus Shows Us the Father',
  'Can I Trust God Here?',
] as const;

const modules = ['sc1', 'sy2', 'sy3', 'sy4', 'sg1', 'sg2', 'sg3', 'sg4'] as const;
const routes = ['facts-and-interpretation', 'follow-the-formation-chain', 'the-learned-self-story', 'what-is-actually-true-about-me', 'the-god-i-learned', 'what-i-expect-from-god', 'jesus-shows-us-the-father', 'can-i-trust-god-here'] as const;
export type SeeClearlyModule = typeof modules[number];
const groupRoute = '/deep-dive/see-clearly';

export function seeClearlyNavigation(module: SeeClearlyModule) {
  const index = modules.indexOf(module);
  const self = index < 4;
  const group = self ? 'See Yourself Clearly' : 'See God Clearly';
  const nextIndex = index + 1;
  const nextModule = modules[nextIndex] ?? null;
  return {
    backLabel: `Back to ${group}`,
    backHref: `${groupRoute}#${self ? 'see-yourself' : 'see-god'}-heading`,
    nextLabel: nextModule ? `Continue to ${lessons[nextIndex]}` : 'Continue to What Has Become Clear',
    nextHref: nextModule ? `${groupRoute}/${routes[nextIndex]}` : `${groupRoute}/what-has-become-clear`,
    transition: module === 'sy4' ? 'You have finished See Yourself Clearly.' : module === 'sg4' ? 'You have finished See God Clearly.' : null,
  };
}
