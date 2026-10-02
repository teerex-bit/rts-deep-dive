'use client';
import { useState } from 'react';
import { validGuidance, type AwakenLesson, type AwakenTurn } from '../../domain/awaken-guidance';

type Props = { lesson: AwakenLesson; initialQuestion: string; moment?: string; reaction?: string; phase?: 'inquiry' | 'reflection'; context?: AwakenTurn[]; onConversation?: (turns: AwakenTurn[]) => void; onKeep?: (text: string) => void };
export function AwakenGuidedInquiry({ lesson, initialQuestion, moment = '', reaction = '', phase = 'inquiry', context = [], onConversation, onKeep }: Props) {
  const [turns, setTurns] = useState<AwakenTurn[]>([]);
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState('');
  const [guidance, setGuidance] = useState('');
  const [observation, setObservation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [view, setView] = useState<'ask' | 'confirm' | 'check' | 'done'>('ask');
  const [kept, setKept] = useState('');

  function finish(text = '') {
    setKept(text); setView('done');
    if (text) onKeep?.(text);
  }
  async function submit(value = answer.trim()) {
    if (!value || pending) return;
    const next = [...turns, { question, answer: value }];
    if (next.length > 8) { finish(); return; }
    setPending(true); setError(false);
    try {
      const response = await fetch('/api/ai/awaken-guide', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lesson, phase, moment, reaction, turns: next, context }) });
      const result = await response.json();
      if (!response.ok || result.kind !== 'success' || !validGuidance(result)) throw new Error('unavailable');
      setTurns(next); onConversation?.(next); setAnswer(''); setGuidance(result.guidance);
      if (result.complete || next.length >= 8) {
        setObservation(result.observation.trim());
        if (result.observation.trim()) setView('confirm'); else finish();
      } else { setQuestion(result.question); if (next.length === 3 && lesson !== 'a2') setView('check'); }
    } catch { setError(true); }
    finally { setPending(false); }
  }
  if (view === 'done') return <section className="awaken-release-moment" aria-live="polite">
    <h2>{kept ? 'Keep what fits.' : 'You can leave this open.'}</h2>
    {kept ? <blockquote>{kept}</blockquote> : <p>You do not have to find a connection or settle on an explanation.</p>}
    <p>You can move on when you are ready.</p>
  </section>;
  if (view === 'check') return <section className="awaken-guided" aria-live="polite">
    <h2>Do you have enough to move on?</h2>
    <p>You can keep looking if it helps. Nothing clear yet is also an honest place to stop.</p>
    <div className="awaken-guided__actions">
      <button type="button" className="button" onClick={() => finish()}>I’m ready to move on</button>
      <button type="button" className="button button--secondary" onClick={() => setView('ask')}>Keep looking</button>
    </div>
  </section>;
  if (view === 'confirm') return <section className="awaken-guided" aria-live="polite">
    <p className="eyebrow">LOOKING ACROSS WHAT YOU SHARED</p><blockquote>{observation}</blockquote><h2>Does that fit what you see?</h2>
    <div className="awaken-guided__actions">
      <button type="button" className="button" onClick={() => finish(observation)}>That fits</button>
      <button type="button" className="button button--secondary" onClick={() => { setQuestion(lesson === 'a2' ? 'What do you see differently when you look across them?' : `What would you change about this observation: “${observation}”?`); setGuidance('Use your own words.'); setView('ask'); }}>Not quite</button>
      <button type="button" className="awaken-quiet-button" onClick={() => finish()}>I’m not sure</button>
    </div>
  </section>;
  return <section className="awaken-guided" aria-label="Guided reflection" aria-busy={pending}>
    {moment ? <aside><span>THE MOMENT</span><p>{moment}</p>{reaction ? <p>You first noticed: {reaction}</p> : null}</aside> : null}
    {turns.length ? <details open={lesson === 'a2'}><summary>What you have shared</summary>{turns.map((turn, index) => <div key={index}><p>{turn.question}</p><blockquote>{turn.answer}</blockquote></div>)}</details> : null}
    {guidance ? <p aria-live="polite">{guidance}</p> : null}
    <label htmlFor={`${lesson}-${phase}-answer`}>{question}</label>
    <textarea id={`${lesson}-${phase}-answer`} rows={3} value={answer} maxLength={4000} disabled={pending} onChange={event => setAnswer(event.target.value)} placeholder="Use your own words…" />
    {error ? <p role="alert">Guidance is unavailable right now. Your answer is still here. Try again or finish for now.</p> : null}
    <div className="awaken-guided__actions">
      <button type="button" className="button" disabled={pending || !answer.trim()} onClick={() => submit()}>{pending ? 'Thinking…' : error ? 'Try again' : 'Continue'}</button>
      <button type="button" className="button button--secondary" disabled={pending} onClick={() => submit('I’m not sure')}>I’m not sure</button>
      {turns.length >= (lesson === 'a2' ? 5 : 3) ? <button type="button" className="awaken-quiet-button" disabled={pending} onClick={() => { if (answer.trim()) { const next = [...turns, { question, answer: answer.trim() }]; setTurns(next); onConversation?.(next); } finish(); }}>I’m ready to move on</button> : null}
    </div>
    {turns.length >= (lesson === 'a2' ? 5 : 3) ? <p>You can keep looking, or move on if you have enough.</p> : null}
  </section>;
}
