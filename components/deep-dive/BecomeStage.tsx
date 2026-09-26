import Link from 'next/link';

/** Stage doorway only; Become lessons and progress are not available yet. */
export function BecomeStage() {
  return <section className="deep-dive-home deep-dive-home--become">
    <p className="eyebrow">THE FORMATION JOURNEY · BECOME</p>
    <h1>Become</h1>
    <p className="deep-dive-introduction">Seeing clearly is a beginning. Become turns toward life with God in ordinary moments and the kind of person being formed through repeated participation with Him.</p>
    <div className="see-clearly-movements">
      <section className="see-clearly-movement" aria-labelledby="live-with-god-heading">
        <p className="eyebrow">PART I</p>
        <h2 id="live-with-god-heading">Live With God</h2>
        <p>Learn to recognize His presence, listen without forcing certainty, and practice a daily rhythm:</p>
        <ol className="become-stage-rhythm">
          <li>Release control</li><li>Receive the moment</li><li>Take the next right step</li><li>Repeat</li>
        </ol>
      </section>
      <section className="see-clearly-movement" aria-labelledby="person-being-formed-heading">
        <p className="eyebrow">PART II</p>
        <h2 id="person-being-formed-heading">The Person Being Formed</h2>
        <p>Repeated life with God reaches beyond a single action. This movement considers desire and the will, the body, relationships, the integrated soul, and fruit that becomes visible over time.</p>
      </section>
    </div>
    <nav className="deep-dive-stage-actions" aria-label="Return to your journey">
      <Link className="deep-dive-stage-actions__back" href="/deep-dive/see-clearly">BACK TO SEE CLEARLY</Link>
      <Link className="deep-dive-stage-actions__back" href="/dashboard">BACK TO FORMATION JOURNEY</Link>
    </nav>
  </section>;
}
