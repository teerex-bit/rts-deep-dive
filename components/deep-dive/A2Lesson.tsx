'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import type { A2Section } from '../../content/deep-dive/v1/awaken/catch-yourself-being-you';
import { LessonActionError } from './LessonTransitionForm';
import { ReviewReflection, type ReviewReflectionAction } from './ReviewReflection';

export type A2ReflectionSaveState = Readonly<{ saved: boolean; error?: string }>;
type A2ReflectionAction = (state: A2ReflectionSaveState, formData: FormData) => Promise<A2ReflectionSaveState>;

const SITUATIONS = [
  'Someone misunderstands me',
  'A plan changes unexpectedly',
  'Tension rises in a conversation',
  'Someone seems disappointed in me',
  'I feel overlooked',
] as const;
const RESPONSES = ['Control', 'Withdrawal', 'Fixing', 'Pleasing', 'Proving', 'Escaping', 'Defensiveness', 'Urgency', 'Something else'] as const;
const PRACTICE = [
  ['NOTICE', 'Something in me just changed.'],
  ['NAME', 'What am I feeling, wanting, or doing?'],
  ['ASK', 'God, what do You want me to see here?'],
  ['RECEIVE', 'Stay with what becomes clear without forcing an answer.'],
] as const;

export function A2Lesson({ section, reflection, saveReflection, editReflection, review = false }: { section: A2Section; reflection: string | null; saveReflection: A2ReflectionAction; editReflection: ReviewReflectionAction; review?: boolean }) {
  const [saveState, formAction, pending] = useActionState(saveReflection, { saved: false });
  const [editedSinceSave, setEditedSinceSave] = useState(false);
  const [body, setBody] = useState(reflection ?? '');
  const [a1Reaction, setA1Reaction] = useState('');
  const [a1Moment, setA1Moment] = useState('');
  const [situations, setSituations] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<string,string>>({});
  const [activePractice, setActivePractice] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('rts-awaken-lived-moment');
      if (raw) {
        const saved = JSON.parse(raw) as { reaction?: string };
        setA1Reaction(saved.reaction ?? '');
      }
    } catch {}
  }, []);
  useEffect(() => { if (reflection && !a1Moment) setA1Moment(reflection); }, [reflection, a1Moment]);
  useEffect(() => { if (!pending && saveState.saved) setEditedSinceSave(false); }, [pending, saveState.saved]);

  const selectedResponses = useMemo(() => situations.map(s => responses[s]).filter(Boolean), [situations, responses]);
  const counts = useMemo(() => selectedResponses.reduce<Record<string,number>>((all, value) => ({ ...all, [value]: (all[value] ?? 0) + 1 }), {}), [selectedResponses]);
  const repeated = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
  const toggle = (value:string) => setSituations(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);

  if (section.id === 'entry') return (
    <article className="awaken-journey a2-lived a2-lived--entry">
      <p className="eyebrow">AWAKEN · CATCH YOURSELF BEING YOU</p>
      <h1>Was it only one moment?</h1>
      <p className="awaken-journey__lead">In Pay Attention, you slowed one moment down long enough to notice what was happening inside you. Now we are going to look sideways instead of deeper.</p>
      {(a1Reaction || a1Moment) ? <aside className="a2-lived__carry">
        <span>FROM THE MOMENT YOU JUST NOTICED</span>
        {a1Moment ? <p>{a1Moment}</p> : null}
        {a1Reaction ? <strong>You noticed {a1Reaction.toLowerCase()}.</strong> : null}
      </aside> : null}
      <div className="a2-lived__question"><span>THE QUESTION NOW</span><h2>Have you met this response before?</h2></div>
    </article>
  );

  if (section.id === 'patterns') return (
    <article className="awaken-journey a2-lived a2-lived--patterns">
      <p className="eyebrow">LOOK ACROSS YOUR LIFE</p>
      <h1>Different moments can carry a familiar movement.</h1>
      <p className="awaken-journey__lead">Do not hunt for a diagnosis. Simply notice whether the response you saw in A1—or another familiar response—shows up in more than one kind of moment.</p>
      <div className="a2-lived__pattern-builder">
        <section>
          <p className="eyebrow">01 · WHICH MOMENTS FEEL FAMILIAR?</p>
          <div className="a2-lived__situation-list">{SITUATIONS.map(s => <button type="button" className={situations.includes(s)?'is-selected':''} aria-pressed={situations.includes(s)} onClick={()=>toggle(s)} key={s}>{s}</button>)}</div>
        </section>
        <section>
          <p className="eyebrow">02 · WHAT DO YOU TEND TO DO THERE?</p>
          {situations.length ? situations.map(s => <div className="a2-lived__moment" key={s}><h3>{s}</h3><div>{RESPONSES.map(r => <button type="button" className={responses[s]===r?'is-selected':''} aria-pressed={responses[s]===r} onClick={()=>setResponses(current=>({...current,[s]:r}))} key={r}>{r}</button>)}</div></div>) : <p className="a2-lived__empty">Choose one or more moments on the left. We will compare them here.</p>}
        </section>
      </div>
      {selectedResponses.length >= 2 ? <div className="a2-lived__discovery">
        <p className="eyebrow">STEP BACK AND LOOK</p>
        {repeated && repeated[1] > 1 ? <><h2>Different moments. Familiar movement.</h2><p>You chose <strong>{repeated[0].toLowerCase()}</strong> in more than one situation. That repetition is what we mean by a pattern.</p></> : <><h2>You do not need a neat pattern.</h2><p>Your responses may differ from moment to moment. The practice is learning to notice what repeats when it does.</p></>}
        <strong className="a2-lived__not-label">A pattern is something you do. It is not a label for who you are.</strong>
      </div> : null}
    </article>
  );

  if (section.id === 'scripture') return (
    <article className="awaken-journey a2-lived a2-lived--scripture">
      <div className="awaken-scripture__reference"><span>JAMES</span><strong>1:23–24</strong></div>
      <div className="awaken-scripture__body">
        <p className="eyebrow">THE MIRROR</p>
        <h1>Seeing does not create what is there.</h1>
        <p className="a2-lived__mirror-line">A mirror simply lets you see what was already present.</p>
        <blockquote>“He is like a man looking at his natural face in a mirror.”</blockquote>
        <p>James uses the mirror as an image of honest attention. Seeing a repeated response is not condemnation. You are learning to remain present long enough to recognize yourself.</p>
      </div>
    </article>
  );

  if (section.id === 'reflection') return (
    <article className="awaken-journey a2-lived a2-lived--reflection">
      <p className="eyebrow">WHAT IS BECOMING VISIBLE?</p>
      <h1>What seems to repeat?</h1>
      <p className="awaken-journey__lead">Think about the moments you just compared. You are not being asked to explain where the pattern came from or what it says about you. Put into words only what you can actually see repeating.</p>
      {repeated ? <aside className="a2-lived__carry"><span>YOUR WORKING OBSERVATION</span><strong>{repeated[0]}</strong><p>appeared in {repeated[1]} of the moments you compared.</p></aside> : a1Reaction ? <aside className="a2-lived__carry"><span>YOU BEGAN WITH</span><strong>{a1Reaction}</strong></aside> : null}
      {review ? <ReviewReflection id="a2-reflection" label="Where do you notice this response showing up?" reflection={reflection} action={editReflection} /> : <form className="awaken-reflection a2-lived__reflection-form" action={formAction}>
        <label htmlFor="a2-reflection">Where do you notice this response showing up?</label>
        <textarea id="a2-reflection" name="body" value={body} placeholder="I notice this when…" onChange={event=>{setBody(event.target.value);setEditedSinceSave(true)}} />
        <div className="awaken-reflection__actions"><button className="button" type="submit" disabled={pending||!body.trim()}>{pending?'Saving…':'Keep this observation'}</button><button className="awaken-quiet-button" type="submit" name="skip" value="true" disabled={pending}>Continue without writing</button></div>
        <p className="status-message status-message--saved" role="status">{saveState.saved&&!editedSinceSave?'Your observation is saved.':''}</p><LessonActionError error={saveState.error}/>
      </form>}
    </article>
  );

  if (section.id === 'go-deeper') return (
    <article className="awaken-journey a2-lived a2-lived--practice">
      <p className="eyebrow">A SMALL PRACTICE</p><h1>Catch it closer to the moment.</h1>
      <p className="awaken-journey__lead">Patterns become easier to recognize when you catch them while they are happening. You do not need to complete all four movements every time.</p>
      <div className="a2-lived__practice-steps">{PRACTICE.map(([name],i)=><button type="button" className={activePractice===i?'is-active':''} onClick={()=>setActivePractice(i)} key={name}><span>0{i+1}</span>{name}</button>)}</div>
      <div className="a2-lived__practice-focus"><span>{PRACTICE[activePractice][0]}</span><p>{PRACTICE[activePractice][1]}</p></div>
    </article>
  );

  if (section.id === 'practice') return (
    <article className="awaken-journey a2-lived a2-lived--carry-forward">
      <p className="eyebrow">IN YOUR DAY</p><h1>Collect observations, not explanations.</h1>
      <p className="awaken-journey__lead">Over the next few days, catch familiar responses as close to the moment as you can. One sentence is enough.</p>
      <div className="a2-lived__example"><span>FOR EXAMPLE</span><blockquote>I noticed I became defensive when I felt misunderstood.</blockquote></div>
      <p>You can stop there. You are learning to recognize the pattern before trying to change it.</p>
    </article>
  );

  return (
    <article className="awaken-journey a2-lived a2-lived--ending">
      <p className="eyebrow">CARRY FORWARD</p><h1>You are seeing what repeats.</h1>
      <p className="awaken-journey__lead">A repeated response can become familiar enough that it feels like identity. But what has been formed in you is not the whole truth about who you are.</p>
      <div className="a2-lived__next"><span>THE NEXT QUESTION</span><p>When I say, “That is just who I am,” am I describing who I am—or something I learned to do?</p></div>
    </article>
  );
}
