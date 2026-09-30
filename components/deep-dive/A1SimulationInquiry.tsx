'use client';

import { useState } from 'react';

type Turn = { question: string; answer: string };
type GuideResult = { kind?: string; action?: string; question?: string; guidance?: string; complete?: boolean };
type Recognition = 'yes' | 'beginning' | 'not-yet' | null;

const FALLBACK_QUESTIONS = [
  'What did you notice in yourself then?',
  'What happened inside you right before you responded?',
];

export function A1SimulationInquiry({ moment, reaction }: { moment: string; reaction: string }) {
  const first = reaction
    ? { q: `What did you notice when it happened?`, g: '' }
    : { q: 'What did you notice happening inside you?', g: '' };

  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [answer, setAnswer] = useState('');
  const [prompt, setPrompt] = useState(first);
  const [pending, setPending] = useState(false);
  const [readyToRecognize, setReadyToRecognize] = useState(false);
  const [recognition, setRecognition] = useState<Recognition>(null);

  async function submit() {
    const value = answer.trim();
    if (!value || pending) return;

    const next = [...turns, { question: prompt.q, answer: value }];
    setTurns(next);
    setPending(true);

    if (next.length >= 4) {
      setAnswer('');
      setReadyToRecognize(true);
      setPending(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/awaken-guide', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ moment, reaction, turns: next, mode: 'next' }),
      });

      const result = (await response.json()) as GuideResult;

      if (response.ok && result.kind === 'success') {
        if (result.complete || result.action === 'finish') {
          setAnswer('');
          setReadyToRecognize(true);
          return;
        }

        const question = result.question?.trim();
        if (question && question.toLowerCase() !== prompt.q.toLowerCase()) {
          setPrompt({ q: question, g: '' });
          setAnswer('');
          return;
        }
      }

      const fallback = FALLBACK_QUESTIONS[Math.min(next.length - 1, FALLBACK_QUESTIONS.length - 1)];
      setPrompt({ q: fallback, g: '' });
      setAnswer('');
    } catch {
      const fallback = FALLBACK_QUESTIONS[Math.min(next.length - 1, FALLBACK_QUESTIONS.length - 1)];
      setPrompt({ q: fallback, g: '' });
      setAnswer('');
    } finally {
      setPending(false);
    }
  }

  if (!started) {
    return (
      <section className="awaken-inquiry-bridge">
        <p className="eyebrow">STAY WITH THE MOMENT</p>
        <h2>You noticed something happen in you.</h2>
        <p className="awaken-journey__lead">
          {reaction ? (
            <>You called it <strong>{reaction.toLowerCase()}</strong>. We are only going to look long enough to notice what was already happening.</>
          ) : (
            <>We are only going to look long enough to notice what was happening inside.</>
          )}
        </p>
        <div className="awaken-inquiry-bridge__invitation">
          <strong>No diagnosis. No fixing. Just notice.</strong>
          <button className="button" onClick={() => setStarted(true)}>Look at the moment</button>
        </div>
      </section>
    );
  }

  if (readyToRecognize && !recognition) {
    return (
      <section className="awaken-recognition-check">
        <p className="eyebrow">BEFORE WE LEAVE THIS MOMENT</p>
        <h2>Can you see that something was already happening in you?</h2>
        <div className="awaken-recognition-check__choices">
          <button className="button" onClick={() => setRecognition('yes')}>Yes, I can see that</button>
          <button className="awaken-quiet-button" onClick={() => setRecognition('beginning')}>I'm beginning to</button>
          <button
            className="awaken-quiet-button"
            onClick={() => {
              setRecognition('not-yet');
              setReadyToRecognize(false);
              setPrompt({ q: 'Did anything shift in you before you acted?', g: '' });
            }}
          >
            Not really yet
          </button>
        </div>
      </section>
    );
  }

  if (recognition) {
    return (
      <section className="awaken-release-moment">
        <p className="eyebrow">THAT IS ENOUGH FOR NOW</p>
        <h2>{recognition === 'yes' ? 'You saw it.' : 'You are beginning to notice it.'}</h2>
        <p>You do not have to understand what it was or why it was there. The point was simply to notice that the moment involved more than the outward response.</p>
        {turns.length ? (
          <div className="awaken-release-moment__glimpse">
            <span>ONE THING YOU NOTICED</span>
            <blockquote>“{turns[turns.length - 1].answer}”</blockquote>
          </div>
        ) : null}
        <p className="awaken-release-moment__carry">Let this moment go. See if you notice something happening inside you in another ordinary moment.</p>
      </section>
    );
  }

  return (
    <section className="awaken-sim-question">
      <div className="awaken-sim-question__layout">
        <aside className="awaken-sim-question__moment">
          <span>THE MOMENT</span>
          <p>{moment || 'The moment you brought with you.'}</p>
          {reaction ? <strong>You first noticed: {reaction}</strong> : null}
        </aside>

        <div className="awaken-sim-question__work">
          <p className="eyebrow">STAY WITH IT</p>
          <div className="awaken-sim-question__question-wrap">
            <span className="awaken-sim-question__quiet-mark" aria-hidden="true">—</span>
            <h2>{prompt.q}</h2>
          </div>

          <label className="awaken-sim-question__answer">
            <span>WHAT DID YOU NOTICE?</span>
            <textarea
              value={answer}
              disabled={pending}
              onChange={event => setAnswer(event.target.value)}
              placeholder="Write what you actually noticed…"
              autoFocus
            />
          </label>

          <div className="awaken-sim-question__actions">
            <button type="button" className="button" disabled={pending || !answer.trim()} onClick={submit}>
              {pending ? 'Stay with it…' : 'Keep following it'}
            </button>
            <span className="awaken-sim-question__hint">You do not have to explain it.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
