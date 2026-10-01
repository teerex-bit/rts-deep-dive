import Link from 'next/link';

const selfLessons = [
  'Facts and Interpretation',
  'How a Reaction Takes Shape',
  'The Learned Self-Story',
  'What Is Actually True About Me',
] as const;
const godLessons = [
  'The God I Learned',
  'What I Expect From God',
  'Jesus Shows Us the Father',
  'Can I Trust God Here?',
] as const;
const lessonRoutes = [
  'facts-and-interpretation', 'follow-the-formation-chain', 'the-learned-self-story',
  'what-is-actually-true-about-me', 'the-god-i-learned', 'what-i-expect-from-god',
  'jesus-shows-us-the-father', 'can-i-trust-god-here',
] as const;
type LessonStatus = 'begin' | 'resume' | 'review';

export function seeClearlyStageAction(statuses: readonly LessonStatus[]) {
  const next = statuses.findIndex(status => status !== 'review');
  if (next < 0 || next >= lessonRoutes.length) return { label: 'NEXT', title: 'What Has Become Clear', href: '/deep-dive/see-clearly/what-has-become-clear' };
  return {
    label: 'NEXT',
    title: [...selfLessons, ...godLessons][next],
    href: `/deep-dive/see-clearly/${lessonRoutes[next]}`,
  };
}

export function SeeClearlyStage({ status, sy2Status, sy3Status, sy4Status, sg1Status, sg2Status, sg3Status, sg4Status }: { status: 'begin' | 'resume' | 'review'; sy2Status?: 'begin' | 'resume' | 'review'; sy3Status?: 'begin' | 'resume' | 'review'; sy4Status?: 'begin' | 'resume' | 'review'; sg1Status?: 'begin' | 'resume' | 'review'; sg2Status?: 'begin' | 'resume' | 'review'; sg3Status?: 'begin' | 'resume' | 'review'; sg4Status?: 'begin' | 'resume' | 'review' }) {
  const href = `/deep-dive/see-clearly/facts-and-interpretation${status === 'review' ? '?section=entry' : ''}`;
  const action = seeClearlyStageAction([status, sy2Status ?? 'begin', sy3Status ?? 'begin', sy4Status ?? 'begin', sg1Status ?? 'begin', sg2Status ?? 'begin', sg3Status ?? 'begin', sg4Status ?? 'begin']);
  const firstArrival = status === 'begin' && [sy2Status, sy3Status, sy4Status, sg1Status, sg2Status, sg3Status, sg4Status].every(item => !item || item === 'begin');
  if (firstArrival) return <section className="deep-dive-home deep-dive-home--see-clearly">
    <p className="eyebrow">THE FORMATION JOURNEY</p>
    <h1>See Clearly</h1>
    <div className="see-clearly-welcome">
      <p className="see-clearly-welcome__lead">You have started to notice what happens within you. Now we can begin to look at the lens through which you understand what happens.</p>
      <p>Sometimes what happened and what we believe it means become so closely connected that we cannot tell where one ends and the other begins. Seeing clearly starts by slowing that down.</p>
      <p>We will begin with something simple: <strong>what actually happened, and what meaning did you give it?</strong></p>
    </div>
    <div className="see-clearly-welcome__first">
      <span className="eyebrow">YOUR FIRST STEP</span>
      <h2>Facts and Interpretation</h2>
      <p>Bring one ordinary moment. We will look at it together without deciding yet whether your first interpretation was right or wrong.</p>
      <Link className="button deep-dive-stage-actions__primary" href={href}>BEGIN SEE CLEARLY</Link>
    </div>
    <Link className="deep-dive-stage-actions__back" href="/dashboard">BACK TO FORMATION JOURNEY</Link>
  </section>;
  return <section className="deep-dive-home deep-dive-home--see-clearly">
    <p className="eyebrow">THE FORMATION JOURNEY · SEE CLEARLY</p>
    <h1>See Clearly</h1>
    <p className="deep-dive-introduction">We often respond to the meaning we give a moment before we have had time to examine it. See Clearly makes room to look at the lens through which you understand yourself and then the picture of God you actually expect and live from.</p>
    <div className="see-clearly-next">
      <p className="eyebrow">{action.label}</p>
      <h2>{action.title}</h2>
      <p>Continue from where you are. You do not need to hold the whole journey in view.</p>
      <Link className="button deep-dive-stage-actions__primary" href={action.href}>{action.label}</Link>
    </div>
    <Link className="deep-dive-stage-actions__back" href="/dashboard">BACK TO FORMATION JOURNEY</Link>
  </section>;
}
