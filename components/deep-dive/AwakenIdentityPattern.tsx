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

  return <section className="awaken-guided awaken-guided--identity" aria-label="Separate identity from pattern">
    {step < FIELDS.length ? <div className="awaken-guided__step" aria-live="polite">
      <p className="eyebrow">STEP {step + 1} OF {FIELDS.length}</p>
      <label htmlFor={`a3-identity-${step}`}>{current.label}</label>
      <textarea id={`a3-identity-${step}`} rows={3} value={answers[step]} onChange={event => updateAnswer(event.target.value)} aria-describedby={`a3-identity-hint-${step}`} />
      <small id={`a3-identity-hint-${step}`}>{current.hint}</small>
      <div className="awaken-guided__actions">
        <button className="button" type="button" disabled={!answers[step].trim()} onClick={() => continueWith()}>NEXT</button>
        <button className="button button--secondary" type="button" onClick={() => continueWith(UNKNOWN)}>{UNKNOWN}</button>
      </div>
    </div> : <section className="awaken-guided__comparison" role="region" aria-label="Notice the difference" aria-live="polite">
      <p className="eyebrow">NOTICE THE DIFFERENCE</p>
      <p>What you say about yourself is a conclusion about who you are. What you noticed yourself doing in a particular kind of moment describes a pattern. Those are not necessarily the same thing.</p>
      <div className="awaken-guided__pair">
        <p><strong>“I am __________.”</strong><span>{answers[2]}</span></p>
        <p><strong>“I tend to … when …”</strong><span>{composeObservedPattern(answers[0], answers[1])}</span></p>
      </div>
      <p>A repeated response can be real, and a pattern may need to change. But something formed in you is not automatically who you are. The goal is not positive thinking. The goal is accuracy.</p>
    </section>}
  </section>;
}
