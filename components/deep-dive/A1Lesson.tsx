'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import type { A1Section } from '../../content/deep-dive/v1/awaken/pay-attention';
import { LessonActionError } from './LessonTransitionForm';
import { ReviewReflection, type ReviewReflectionAction } from './ReviewReflection';
import { A1SimulationInquiry } from './A1SimulationInquiry';

export type A1ReflectionSaveState = Readonly<{ saved: boolean; error?: string }>;
type A1ReflectionAction = (state: A1ReflectionSaveState, formData: FormData) => Promise<A1ReflectionSaveState>;

const REACTIONS = ['Anger', 'Fear', 'Embarrassment', 'Control', 'Withdrawal', 'Defensiveness', 'Urgency', 'Something else'] as const;
const PAUSE_WORDS = ['DON’T EXPLAIN IT.', 'DON’T FIX IT.', 'JUST NOTICE.', 'WHAT HAPPENED IN YOU?'] as const;
const CHAIN = [
  ['saw', 'WHAT I SAW', 'What did you think was happening?', 'In that instant, what did you assume other people were thinking, doing, or noticing?'],
  ['believed', 'WHAT I BELIEVED', 'What did that seem to say about you?', 'Finish the thought: “If this is what is happening, then I am…”'],
  ['expected', 'WHAT I EXPECTED', 'What were you bracing for?', 'What did you think would happen next? What were you expecting other people to do?'],
  ['desired', 'WHAT I DESIRED', 'What did you most want in that moment?', 'If you could have changed one thing immediately, what would you have wanted?'],
  ['intended', 'WHAT I WAS PROTECTING', 'What were you trying to protect or control?', 'What were you trying to keep from happening—or keep other people from seeing?'],
  ['chose', 'WHAT I DID', 'What did you actually do?', 'Describe the concrete response: what you said, did, avoided, changed, or held back.'],
  ['lived', 'WHAT IT DID FOR ME', 'What did that response accomplish?', 'What did it protect you from or help you get through? Did it move you toward what you wanted?'],
] as const;

type ChainKey = typeof CHAIN[number][0];
type ChainState = Record<ChainKey, string>;
const EMPTY_CHAIN: ChainState = { saw: '', believed: '', expected: '', desired: '', intended: '', chose: '', lived: '' };

export function A1Lesson({ section, reflection, saveReflection, editReflection, review = false, onInquiryStateChange }: { section: A1Section; index: number; total: number; reflection: string | null; saveReflection: A1ReflectionAction; editReflection: ReviewReflectionAction; review?: boolean; onInquiryStateChange?: (active: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [saveState, formAction, pending] = useActionState(saveReflection, { saved: false });
  const [editedSinceSave, setEditedSinceSave] = useState(false);
  const [body, setBody] = useState(reflection ?? '');
  const [pauseIndex, setPauseIndex] = useState(0);
  const [pauseStarted, setPauseStarted] = useState(false);
  const [reaction, setReaction] = useState('');
  const [chain, setChain] = useState<ChainState>(EMPTY_CHAIN);
  const [chainStep, setChainStep] = useState(0);
  const [inquiryStarted, setInquiryStarted] = useState(false);
  const [adaptiveQuestion, setAdaptiveQuestion] = useState<{ question: string; guidance: string } | null>(null);
  const [adaptiveTurns, setAdaptiveTurns] = useState<Array<{ question: string; answer: string }>>([]);
  const [guidePending, setGuidePending] = useState(false);
  const [guideComplete, setGuideComplete] = useState(false);
  const [adaptiveAnswer, setAdaptiveAnswer] = useState('');
  const [synthesis, setSynthesis] = useState<{ headline?: string; summary?: string; noticing?: string; carryQuestion?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('rts-awaken-lived-moment');
      if (raw) {
        const saved = JSON.parse(raw) as { reaction?: string; chain?: Partial<ChainState> };
        if (saved.reaction) setReaction(saved.reaction);
        if (saved.chain) setChain(current => ({ ...current, ...saved.chain }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem('rts-awaken-lived-moment', JSON.stringify({ reaction, chain })); } catch {}
  }, [reaction, chain]);

  useEffect(() => {
    if (section.id !== 'moment' || !pauseStarted) return;
    setPauseIndex(0);
    const timer = window.setInterval(() => setPauseIndex(value => Math.min(value + 1, PAUSE_WORDS.length - 1)), 2400);
    return () => window.clearInterval(timer);
  }, [section.id, pauseStarted]);

  useEffect(() => {
    if (!pending && saveState.saved) setEditedSinceSave(false);
  }, [pending, saveState.saved]);

  const completedChain = useMemo(() => CHAIN.filter(([key]) => chain[key].trim()), [chain]);
  const updateChain = (key: ChainKey, value: string) => setChain(current => ({ ...current, [key]: value }));
  const currentQuestion = adaptiveQuestion?.question ?? CHAIN[chainStep][2];
  const currentGuidance = adaptiveQuestion?.guidance ?? CHAIN[chainStep][3];

  async function advanceAdaptiveInquiry() {
    const [key] = CHAIN[chainStep];
    const answer = (adaptiveQuestion ? adaptiveAnswer : chain[key]).trim();
    if (!answer || guidePending) return;
    const turns = [...adaptiveTurns, { question: currentQuestion, answer }];
    setGuidePending(true);
    try {
      const response = await fetch('/api/ai/awaken-guide', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moment: body, reaction, turns, mode: 'next' }) });
      const result = await response.json() as { kind?: string; action?: string; question?: string; guidance?: string; complete?: boolean };
      if (!response.ok || result.kind !== 'success') {
        setAdaptiveTurns(turns);
        setAdaptiveAnswer('');
        if (chainStep < CHAIN.length - 1) setChainStep(value => value + 1);
        setAdaptiveQuestion({ question: 'What happened inside you next?', guidance: 'Stay with what you actually noticed; you do not need to force an explanation.' });
        return;
      }
      setAdaptiveTurns(turns);
      setAdaptiveAnswer('');
      if (result.complete || result.action === 'finish' || turns.length >= 12) {
        setGuideComplete(true);
        const synthResponse = await fetch('/api/ai/awaken-guide', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moment: body, reaction, turns, mode: 'synthesis' }) });
        const synth = await synthResponse.json() as { kind?: string; headline?: string; summary?: string; noticing?: string[]; carryQuestion?: string };
        if (synth.kind === 'success') setSynthesis({ headline: synth.headline, summary: synth.summary, noticing: synth.noticing?.join(' '), carryQuestion: synth.carryQuestion });
        setChainStep(CHAIN.length - 1);
      } else {
        setAdaptiveQuestion({ question: result.question || 'What else feels important about that moment?', guidance: result.guidance || '' });
        if (result.action === 'advance' || result.action === 'accept_uncertainty') {
          if (chainStep < CHAIN.length - 1) setChainStep(value => value + 1);
        }
      }
    } catch {
      setAdaptiveTurns(turns);
      setAdaptiveAnswer('');
      if (chainStep < CHAIN.length - 1) setChainStep(value => value + 1);
      setAdaptiveQuestion({ question: 'What happened inside you next?', guidance: 'Stay with what you actually noticed; you do not need to force an explanation.' });
    } finally { setGuidePending(false); }
  }

  if (section.id === 'entry') return (
    <article className="awaken-journey awaken-journey--entry">
      <div className="awaken-journey__tree" aria-hidden="true">
        <img src="/assets/page-awaken/curriculum-logo-transparent.png" alt="" />
      </div>
      <div className="awaken-journey__entry-copy">
        <p className="eyebrow">FORMATION JOURNEY · AWAKEN</p>
        <p className="awaken-journey__stage">AWAKEN</p>
        <h1>Your life is telling you something.</h1>
        <p className="awaken-journey__lead">You do not have to understand everything yet. You only have to begin paying attention.</p>
        <div className="awaken-journey__invitation">
          <span>01</span>
          <p>Before you try to change yourself, notice what is already happening inside you.</p>
        </div>
      </div>
    </article>
  );

  if (section.id === 'moment') return (
    <article className="awaken-journey awaken-journey--pause">
      <p className="eyebrow">START WITH YOUR LIFE</p>
      <h1>Bring one moment to mind.</h1>
      <p className="awaken-journey__lead">Think about something recent when something in you changed. A conversation. A disappointment. A plan that changed. A moment you felt ignored, criticized, embarrassed, anxious, or suddenly needed control.</p>
      {!pauseStarted ? (
        <div className="awaken-pause-start">
          <p>Take whatever time you need to find one ordinary moment. Nothing needs to happen until you have it.</p>
          <button className="button" type="button" onClick={() => setPauseStarted(true)}>I have a moment</button>
        </div>
      ) : (
        <div className="awaken-pause" aria-live="polite">
          <span className="awaken-pause__line" key={pauseIndex}>{PAUSE_WORDS[pauseIndex]}</span>
          <div className={"awaken-pause__choices " + (pauseIndex === PAUSE_WORDS.length - 1 ? 'is-visible' : '')}>
            {REACTIONS.map(item => <button type="button" className={reaction === item ? 'is-selected' : ''} aria-pressed={reaction === item} onClick={() => setReaction(item)} key={item}>{item}</button>)}
          </div>
        </div>
      )}
      {reaction ? <p className="awaken-journey__quiet-confirmation">Hold onto that moment. We are not going to explain it yet.</p> : null}
    </article>
  );

  if (section.id === 'outside-inside') return (
    <article className="awaken-journey awaken-journey--split">
      <p className="eyebrow">NOTICE THE DIFFERENCE</p>
      <h1>Two things happened.</h1>
      <div className="awaken-split">
        <section><span>OUTSIDE</span><h2>Something happened around you.</h2><p>The words, the message, the changed plan, the expression on someone’s face.</p></section>
        <div className="awaken-split__line" aria-hidden="true"><span>AND</span></div>
        <section><span>INSIDE</span><h2>Something happened within you.</h2><p>{reaction ? <>You noticed <strong>{reaction.toLowerCase()}</strong>.</> : <>A feeling, impulse, interpretation, or desire appeared.</>} It may have happened almost instantly.</p></section>
      </div>
      <p className="awaken-journey__statement">The event matters. So does what happened in you.</p>
    </article>
  );

  if (section.id === 'teaching') return (
    <article className="awaken-journey awaken-journey--teaching">
      <p className="eyebrow">PAY ATTENTION</p>
      <h1>That response came from somewhere.</h1>
      <div className="awaken-editorial">
        <div>
          <p>Most of us are very aware of what happens around us and much less aware of what happens inside us. The movement can be so fast that we go from an event directly into a response without noticing what occurred between the two.</p>
          <p>The first goal is not to fix your reaction. It is to see it.</p>
        </div>
        <aside><span>FOR NOW</span><p>Curiosity before correction.</p></aside>
      </div>
      <button className="awaken-text-reveal" type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>What does “notice” mean here? <span aria-hidden="true">+</span></button>
      {open ? <p className="awaken-text-reveal__answer">Become aware of what is present without immediately deciding what it means or what you need to do about it.</p> : null}
    </article>
  );

  if (section.id === 'scripture') return (
    <article className="awaken-journey awaken-journey--scripture">
      <div className="awaken-scripture__reference"><span>LUKE</span><strong>6:45</strong></div>
      <div className="awaken-scripture__body">
        <p className="eyebrow">SCRIPTURE</p>
        <blockquote>“Out of the abundance of the heart, his mouth speaks.”</blockquote>
        <p>Jesus directs our attention inward. What comes out of us can reveal something about what is already occurring within us.</p>
        <p className="awaken-scripture__question">What might your moment be revealing?</p>
      </div>
    </article>
  );

  if (section.id === 'reflection') return (
    <article className="awaken-journey awaken-journey--reflection">
      <p className="eyebrow">YOUR MOMENT</p>
      <h1>Stay with what actually happened.</h1>
      <p className="awaken-journey__lead">Describe the moment simply. Do not make a case for yourself or against someone else. We are trying to see what happened in you.</p>
      {reaction ? <p className="awaken-reflection__thread"><span>YOU NOTICED</span>{reaction}</p> : null}
      {review ? <ReviewReflection id="a1-reflection" label="What happened, and what did you feel or want to do immediately?" reflection={reflection} action={editReflection} /> : (
        <form className="awaken-reflection" action={formAction}>
          <label htmlFor="a1-reflection">What happened, and what did you feel or want to do immediately?</label>
          <textarea id="a1-reflection" name="body" value={body} placeholder="Write only what you want to keep…" onChange={event => { setBody(event.target.value); setEditedSinceSave(true); }} />
          <div className="awaken-reflection__actions">
            <button className="button" type="submit" disabled={pending || !body.trim()}>{pending ? 'Saving…' : 'Keep this moment'}</button>
            <button className="awaken-quiet-button" type="submit" name="skip" value="true" disabled={pending}>Continue without writing</button>
          </div>
          <p className="status-message status-message--saved" role="status" aria-live="polite">{saveState.saved && !editedSinceSave ? 'Your moment is saved.' : ''}</p>
          <LessonActionError error={saveState.error} />
        </form>
      )}
    </article>
  );

  if (section.id === 'go-deeper') return (
    <article className="awaken-journey awaken-sim-inquiry">
      <A1SimulationInquiry moment={body} reaction={reaction} />
    </article>
  );

  if (section.id === 'practice') return (
    <article className="awaken-journey awaken-journey--carry">
      <p className="eyebrow">TAKE IT INTO YOUR DAY</p>
      <h1>You do not need to solve what you noticed.</h1>
      <p className="awaken-journey__lead">For the next few days, pay attention to the instant something changes inside you.</p>
      <div className="awaken-carry__question"><span>WHEN IT HAPPENS</span><blockquote>What just happened in me?</blockquote></div>
      <p>Then bring the moment before God without forcing an answer.</p>
      <p className="awaken-carry__prayer">God, help me see what is happening in me.</p>
    </article>
  );

  return (
    <article className="awaken-journey awaken-journey--ending">
      <p className="eyebrow">CARRY FORWARD</p>
      <h1>Keep noticing.</h1>
      <p>You do not need to understand every reaction yet. The work of Awaken is learning to recognize the moments when something moves inside you.</p>
      <p>The more clearly you notice those moments, the easier it becomes to see what repeats.</p>
      <div className="awaken-ending__bridge"><span>NEXT</span><p>When a moment keeps repeating, it may be showing you a pattern.</p></div>
    </article>
  );
}
