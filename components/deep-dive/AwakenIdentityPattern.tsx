'use client';

import { useState } from 'react';
import { composeObservedPattern } from './a3-identity-pattern';

const UNKNOWN = 'I’m not sure';

const FIELDS = [
  { label: 'Something I notice myself doing', hint: 'It can be something you noticed once or something that seems to happen repeatedly.' },
  { label: 'A situation where I notice it', hint: 'Use a particular kind of moment if one comes to mind.' },
  { label: 'When this keeps happening, what am I tempted to say about myself?', hint: 'Examples only: “I’m just defensive.” “I’m insecure.” “I’m controlling.” “I’m bad at relationships.” “I’ve always been this way.” “I’m not sure what I think it says about me.”' },
] as const;

export function AwakenIdentityPattern() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const current = FIELDS[step];

  function updateAnswer(value: string) {
    setAnswers(previous => previous.map((answer, index) => index === step ? value : answer));
  }

  function continueWith(value = answers[step]) {
    setAnswers(previous => previous.map((answer, index) => index === step ? value : answer));
    setStep(previous => Math.min(previous + 1, FIELDS.length));
  }

  return <section className="awaken-guided awaken-guided--identity awaken-v2-identity" aria-label="Separate identity from pattern">
    {step < FIELDS.length ? <div className="awaken-guided__step awaken-v2-guided-step" aria-live="polite">
      <p className="eyebrow">NOTICE · {step + 1} OF {FIELDS.length}</p>
      <label htmlFor={`a3-identity-${step}`}>{current.label}</label>
      <textarea id={`a3-identity-${step}`} rows={3} value={answers[step]} onChange={event => updateAnswer(event.target.value)} aria-describedby={`a3-identity-hint-${step}`} />
      <small id={`a3-identity-hint-${step}`}>{current.hint}</small>
      <div className="awaken-guided__actions">
        <button className="button" type="button" disabled={!answers[step].trim()} onClick={() => continueWith()}>NEXT</button>
        <button className="button button--secondary" type="button" onClick={() => continueWith(UNKNOWN)}>{UNKNOWN}</button>
      </div>
    </div> : <section className="awaken-guided__comparison awaken-v2-comparison" role="region" aria-label="Notice the difference" aria-live="polite">
      <p className="eyebrow">NOTICE THE DIFFERENCE</p>
      <div className="awaken-v2-comparison__pair">
        <figure className="awaken-v2-comparison__identity">
          <figcaption>WHAT I CALL MYSELF</figcaption>
          <blockquote><span className="awaken-v2-comparison__prefix">I am</span><span className="awaken-v2-comparison__answer">{answers[2]}</span></blockquote>
        </figure>
        <span className="awaken-v2-comparison__divider" aria-hidden="true">AND</span>
        <figure className="awaken-v2-comparison__pattern">
          <figcaption>WHAT I ACTUALLY NOTICED</figcaption>
          <blockquote>{composeObservedPattern(answers[0], answers[1])}</blockquote>
        </figure>
      </div>
      <h2>One statement names you. The other describes something you noticed yourself doing in a particular kind of moment.</h2>
      <p>What you say about yourself is a conclusion about who you are. What you noticed yourself doing in a particular kind of moment describes a pattern.</p>
      <p>A pattern may be real, and it may need to change, without being the whole truth about who you are. The goal is not positive thinking. The goal is accuracy.</p>
      <p className="awaken-v2-comparison__prompt">WHAT DIFFERENCE DO YOU NOTICE?</p>
    </section>}
  </section>;
}
