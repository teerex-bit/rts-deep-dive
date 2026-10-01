'use client';

import { useState } from 'react';

const UNKNOWN = 'I’m not sure';
const OPENING = 'You already know what happened. Now we will look at four different things that can shape a response. They are four places to look, not four answers you are supposed to find.';
const MOMENT_STEPS = [
  { label: 'What happened?', hint: 'Choose one recent moment when you noticed a response in yourself.' },
  { label: 'What were you expecting to happen?', hint: 'Expectations can be quiet: people should understand me; I should not fail; conflict will end badly; people may leave when disappointed; uncertainty may become danger; without control, something important may fall apart. For now, just notice what you expected.' },
  { label: 'What did you want to happen?', hint: 'Desire is not automatically wrong. You may have wanted respect, acceptance, peace, certainty, to be right, to be needed, to avoid embarrassment, or for someone else to change. Notice what mattered to you.' },
  { label: 'What were you afraid might happen?', hint: 'You do not need to know for certain or explain where a fear came from. “I’m not sure” is a valid answer.' },
  { label: 'What felt threatened or important here?', hint: 'Before answering, consider what can feel important in a moment: reputation, control, comfort, security, belonging, being respected, being understood, or wanting something to go a certain way. These are examples, not answers assigned to you.' },
] as const;

export function A4MomentInquiry() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(MOMENT_STEPS.length).fill(''));
  const current = MOMENT_STEPS[step];

  function continueWith(value = answers[step]) {
    setAnswers(previous => previous.map((answer, index) => index === step ? value : answer));
    setStep(previous => Math.min(previous + 1, MOMENT_STEPS.length));
  }

  return <section className="awaken-guided awaken-guided--moment" aria-label="Understand what shaped a response"><div className="a4-inquiry-intro"><p>{OPENING}</p><div className="a4-inquiry-intro__four"><span>WHAT I EXPECTED</span><span>WHAT I WANTED</span><span>WHAT I FEARED</span><span>WHAT MATTERED</span></div></div>
    {step < MOMENT_STEPS.length ? <div className="awaken-guided__step" aria-live="polite">
      <p className="eyebrow">{current.label}</p>
      {step === 2 ? <p>A desire is not automatically wrong. It becomes important to notice when it starts governing how we respond.</p> : null}
      <label htmlFor={`a4-moment-${step}`}>{current.label}</label>
      <textarea id={`a4-moment-${step}`} rows={3} value={answers[step]} onChange={event => setAnswers(previous => previous.map((answer, index) => index === step ? event.target.value : answer))} aria-describedby={`a4-moment-hint-${step}`} />
      <small id={`a4-moment-hint-${step}`}>{current.hint}</small>
      <div className="awaken-guided__actions">
        <button className="button" type="button" disabled={!answers[step].trim()} onClick={() => continueWith()}>NEXT</button>
        <button className="button button--secondary" type="button" onClick={() => continueWith(UNKNOWN)}>{UNKNOWN}</button>
      </div>
    </div> : <section className="awaken-guided__summary" role="region" aria-label="Looking across this moment" aria-live="polite">
      <p className="eyebrow">PUT THE FOUR TOGETHER</p>
      <dl>{MOMENT_STEPS.map((item, index) => <div key={item.label}><dt>{item.label}</dt><dd>{answers[index]}</dd></div>)}</dl>
      <h2>Looking across these four things, what do you see?</h2>
      <p>You do not have to find one hidden cause or settle on a neat conclusion. These four answers are simply different pieces of the same response. Look at them together and describe whatever connection, tension, or difference you see. If you do not see one yet, that is okay.</p>
    </section>}
  </section>;
}
