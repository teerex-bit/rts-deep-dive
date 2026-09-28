'use client';

import { useState } from 'react';

const UNKNOWN = 'I’m not sure';
const MOMENT_STEPS = [
  { label: 'What happened in this moment?', hint: 'Choose one recent moment when you noticed a response in yourself.' },
  { label: 'What were you expecting to happen?', hint: 'Expectations can be quiet: people should understand me; I should not fail; conflict will end badly; people may leave when disappointed; uncertainty may become danger; without control, something important may fall apart. For now, just notice what you expected.' },
  { label: 'What did you want to happen?', hint: 'Desire is not automatically wrong. You may have wanted respect, acceptance, peace, certainty, to be right, to be needed, to avoid embarrassment, or for someone else to change. Notice what mattered to you.' },
  { label: 'What were you afraid might happen?', hint: 'You do not need to know for certain or explain where a fear came from. “I’m not sure” is a valid answer.' },
  { label: 'What felt threatened or important here?', hint: 'Before answering, consider what can feel important in a moment: reputation, control, comfort, security, belonging, being respected, being understood, or wanting something to go a certain way. These are examples, not answers assigned to you.' },
] as const;
const TRACE_LABELS = ['THE MOMENT', 'EXPECTATION', 'DESIRE', 'FEAR', 'WHAT MATTERED'] as const;

export function A4MomentInquiry() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(MOMENT_STEPS.length).fill(''));
  const current = MOMENT_STEPS[step];

  function continueWith(value = answers[step]) {
    setAnswers(previous => previous.map((answer, index) => index === step ? value : answer));
    setStep(previous => Math.min(previous + 1, MOMENT_STEPS.length));
  }

  return <section className="awaken-guided awaken-guided--moment awaken-v2-trace" aria-label="Understand a response">
    {step < MOMENT_STEPS.length ? <div className="awaken-v2-trace__active" aria-live="polite">
      {step > 0 ? <ol className="awaken-v2-trace__completed" aria-label="What you have noticed so far">
        <li><span>THE MOMENT</span><p>{answers[0]}</p></li>
        {MOMENT_STEPS.slice(1, step).map((item, index) => <li key={item.label}><span>{TRACE_LABELS[index + 1]}</span><p>{answers[index + 1]}</p></li>)}
      </ol> : null}
      <div className="awaken-v2-trace__prompt">
      <p className="eyebrow">{TRACE_LABELS[step]} · {step + 1} OF {MOMENT_STEPS.length}</p>
      {step > 0 ? <h2>{MOMENT_STEPS[step].label}</h2> : null}
      {step === 2 ? <p>A desire is not automatically wrong. It becomes important to notice when it starts governing how we respond.</p> : null}
      <label htmlFor={`a4-moment-${step}`}>{current.label}</label>
      <textarea id={`a4-moment-${step}`} rows={3} value={answers[step]} onChange={event => setAnswers(previous => previous.map((answer, index) => index === step ? event.target.value : answer))} aria-describedby={`a4-moment-hint-${step}`} />
      <small className="awaken-v2-trace__hint" id={`a4-moment-hint-${step}`}>{current.hint}</small>
      <div className="awaken-guided__actions">
        <button className="button" type="button" disabled={!answers[step].trim()} onClick={() => continueWith()}>NEXT</button>
        <button className="button button--secondary" type="button" onClick={() => continueWith(UNKNOWN)}>{UNKNOWN}</button>
      </div>
      </div>
    </div> : <section className="awaken-guided__summary awaken-v2-trace__summary" role="region" aria-label="Looking across this moment" aria-live="polite">
      <p className="eyebrow">LOOK AT THE MOMENT AGAIN</p>
      <figure className="awaken-v2-trace__moment"><figcaption>THE MOMENT</figcaption><blockquote>{answers[0]}</blockquote></figure>
      <dl>{MOMENT_STEPS.slice(1).map((item, index) => <div key={item.label}><dt>{TRACE_LABELS[index + 1]}</dt><dd>{answers[index + 1]}</dd></div>)}</dl>
      <h2>WHAT DO YOU NOTICE?</h2>
      <p>You do not have to find one hidden cause or settle on a neat conclusion. Looking across what you expected, wanted, feared, and considered important may help you notice what was moving in that moment. You can leave the question open.</p>
    </section>}
  </section>;
}
