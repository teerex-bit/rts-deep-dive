'use client';

import { useState } from 'react';
import type { AwakenTurn } from '../../domain/awaken-guidance';

type Props = { onConversation?: (turns: AwakenTurn[]) => void; onKeep?: (text: string) => void };

export function A2TwoSituationInquiry({ onConversation, onKeep }: Props) {
  const [step, setStep] = useState(0);
  const [firstSituation, setFirstSituation] = useState('');
  const [firstResponse, setFirstResponse] = useState('');
  const [secondSituation, setSecondSituation] = useState('');
  const [secondResponse, setSecondResponse] = useState('');
  const [comparison, setComparison] = useState('');

  const turns: AwakenTurn[] = [
    { question: 'What happened in the first situation?', answer: firstSituation },
    { question: 'How did you respond?', answer: firstResponse },
    { question: 'What happened in a different kind of situation?', answer: secondSituation },
    { question: 'How did you respond that time?', answer: secondResponse },
  ].filter(turn => turn.answer.trim());

  function advance(value: string, setter: (value: string) => void) {
    if (!value.trim()) return;
    setter(value.trim());
    setStep(current => current + 1);
  }

  if (step >= 4) return <section className="a2-two-situations">
    <p className="eyebrow">PUT THEM SIDE BY SIDE</p>
    <h2>What, if anything, seems familiar?</h2>
    <div className="a2-two-situations__compare">
      <div><span>FIRST SITUATION</span><p>{firstSituation}</p><strong>{firstResponse}</strong></div>
      <div><span>SECOND SITUATION</span><p>{secondSituation}</p><strong>{secondResponse}</strong></div>
    </div>
    <label>Looking only at how you responded, does anything seem familiar?
      <textarea value={comparison} onChange={event => setComparison(event.target.value)} placeholder="It can be similar, different, or unclear…" />
    </label>
    <div className="awaken-guided__actions">
      <button type="button" className="button" disabled={!comparison.trim()} onClick={() => { const all=[...turns,{question:'What, if anything, seems familiar?',answer:comparison.trim()}]; onConversation?.(all); onKeep?.(comparison.trim()); setStep(5); }}>Keep what I see</button>
      <button type="button" className="button button--secondary" onClick={() => { onConversation?.(turns); setStep(5); }}>Nothing clear yet</button>
    </div>
  </section>;

  if (step === 5) return <section className="awaken-release-moment"><h2>You compared the two.</h2><p>You do not have to make them match. Similarity, difference, and uncertainty are all useful things to see.</p></section>;

  const prompts = [
    ['FIRST SITUATION','Start with one ordinary situation.','What happened?','A short description is enough…'],
    ['FIRST SITUATION','Now stay with that same situation.','How did you respond?','What did you actually do?'],
    ['SECOND SITUATION','Choose a genuinely different kind of situation.','What happened this time?','Something different from the first situation…'],
    ['SECOND SITUATION','Stay with the second situation.','How did you respond this time?','What did you actually do?'],
  ] as const;
  const values=[firstSituation,firstResponse,secondSituation,secondResponse];
  const setters=[setFirstSituation,setFirstResponse,setSecondSituation,setSecondResponse];
  const p=prompts[step];

  return <section className="a2-two-situations">
    <p className="eyebrow">{p[0]}</p><h2>{p[1]}</h2>
    {step > 0 ? <div className="a2-two-situations__history">{turns.map((turn,index)=><div key={index}><span>{turn.question}</span><p>{turn.answer}</p></div>)}</div> : null}
    <label>{p[2]}<textarea value={values[step]} onChange={event=>setters[step](event.target.value)} placeholder={p[3]} /></label>
    <div className="awaken-guided__actions"><button type="button" className="button" disabled={!values[step].trim()} onClick={()=>advance(values[step],setters[step])}>Continue</button><button type="button" className="button button--secondary" onClick={()=>{setters[step]('I’m not sure');setStep(current=>current+1)}}>I’m not sure</button></div>
  </section>;
}
