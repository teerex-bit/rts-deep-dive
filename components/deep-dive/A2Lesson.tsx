'use client';

import { useActionState, useEffect, useState } from 'react';
import type { A2Section } from '../../content/deep-dive/v1/awaken/catch-yourself-being-you';
import { LessonActionError } from './LessonTransitionForm';
import { ReviewReflection, type ReviewReflectionAction } from './ReviewReflection';
import { AwakenGuidedInquiry } from './AwakenGuidedInquiry';
import { A2ExperienceInquiry } from './A2ExperienceInquiry';
import type { AwakenTurn } from '../../domain/awaken-guidance';

export type A2ReflectionSaveState = Readonly<{ saved: boolean; error?: string }>;
type A2ReflectionAction = (state: A2ReflectionSaveState, formData: FormData) => Promise<A2ReflectionSaveState>;

const PRACTICE_STEPS = [
  {
    name: 'NOTICE',
    text: 'Something in me just changed. Pause long enough to notice it, even if that is all you can do.',
  },
  {
    name: 'NAME',
    text: 'What am I feeling, wanting, or doing? Name only what you can observe, without explaining why.',
  },
  {
    name: 'ASK',
    text: 'God, what do You want me to see here? You may leave the question open.',
  },
  {
    name: 'RECEIVE',
    text: 'Stay with what becomes clear without forcing an answer.',
  },
] as const;

export function A2Lesson({ section, reflection, saveReflection, editReflection, review = false }: { section: A2Section; reflection: string | null; saveReflection: A2ReflectionAction; editReflection: ReviewReflectionAction; review?: boolean }) {
  const [saveState, formAction, pending] = useActionState(saveReflection, { saved: false });
  const [editedSinceSave, setEditedSinceSave] = useState(false);
  const [body, setBody] = useState(reflection ?? '');
  const [activePracticeStep, setActivePracticeStep] = useState(0);
  const [conversation, setConversation] = useState<AwakenTurn[]>([]);
  function keepObservation(text: string) { setBody(text); setEditedSinceSave(true); }

  useEffect(() => {
    if (!pending && saveState.saved) setEditedSinceSave(false);
  }, [pending, saveState.saved]);

  return (
    <article className={`deep-dive-lesson deep-dive-lesson--a2 deep-dive-lesson--${section.id}`}>
      <p className="eyebrow deep-dive-section-label">{section.eyebrow}</p>
      <h1>{section.title}</h1>
      {section.id === 'entry' ? (
        <div className="a2-opening">
          <div className="a2-opening__situations">{section.paragraphs.slice(0, -1).map((paragraph, index) => <p key={paragraph}><span aria-hidden="true">0{index + 1}</span>{paragraph}</p>)}</div>
          <p className="a2-opening__turn">{section.paragraphs[section.paragraphs.length - 1]}</p>
        </div>
      ) : section.id === 'scripture' ? (
        <>
          <p className="a2-mirror-intro">A mirror does not create what is there. It helps you see what is already present.</p>
          <figure className="deep-dive-scripture a2-mirror" aria-label="James 1:23–24 Scripture passage">
            <span className="a2-mirror__label" aria-hidden="true">THE MIRROR</span>
            <blockquote><p>{section.paragraphs[0]}</p></blockquote>
            <figcaption><cite>James 1:23–24 <span aria-hidden="true">·</span> World English Bible</cite></figcaption>
          </figure>
          {section.paragraphs.slice(1).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </>
      ) : section.id === 'patterns' ? (
        <A2ExperienceInquiry onConversation={setConversation} onKeep={keepObservation} />
      ) : section.id === 'reflection' ? (
        <>
          <p>Look across the different situations you shared. You are not looking for matching behaviors. Step back and see what, if anything, you recognize about the way you respond.</p>
          <AwakenGuidedInquiry key="a2-reflection-guide" lesson="a2" phase="reflection" context={conversation} initialQuestion="When you look across these situations, what do you recognize about yourself?" onKeep={keepObservation} />
          {review ? <ReviewReflection id="a2-reflection" label={section.prompt ?? 'Your reflection'} reflection={reflection} action={editReflection} /> : <form className="deep-dive-reflection a2-reflection" action={formAction}>
            <label htmlFor="a2-reflection">{section.prompt}</label>
            <textarea id="a2-reflection" name="body" value={body} placeholder="Write only what you want to keep…" onChange={event => { setBody(event.target.value); setEditedSinceSave(true); }} />
            <div className="deep-dive-reflection__actions">
              <button className="button" type="submit" disabled={pending || !body.trim()}>{pending ? 'Saving…' : 'Save & continue'}</button>
              <button className="button button--secondary" type="submit" name="skip" value="true" disabled={pending}>Continue without writing</button>
            </div>
            <p className="status-message status-message--saved" role="status" aria-live="polite" aria-atomic="true">
              {saveState.saved && !editedSinceSave ? 'Reflection saved.' : ''}
            </p>
            <LessonActionError error={saveState.error} />
          </form>}
        </>
      ) : section.id === 'go-deeper' ? (
        <section className="a2-pause" aria-label="Pause with what you noticed">
          <p className="eyebrow">PAUSE HERE</p>
          <h2>You do not need to do anything with this yet.</h2>
          <p className="a2-pause__lead">You have just looked across several different experiences and named something you can see about yourself. Before adding anything else, let that be enough for a moment.</p>
          {body.trim() ? <blockquote className="a2-pause__recognition"><span>WHAT I RECOGNIZED</span>{body}</blockquote> : null}
          <div className="a2-pause__movement"><span>NOTICE</span><i aria-hidden="true">→</i><span>NAME</span><i aria-hidden="true">→</i><strong>LET IT BE SEEN</strong></div>
          <p>You are not fixing it, explaining it, or deciding what it says about who you are. You are learning to recognize yourself while you are living.</p>
        </section>
      ) : section.id === 'practice' ? (
        <section className="deep-dive-guidance deep-dive-guidance--practice a2-practice-intro" aria-label="Practice for the next few days">
          <p className="deep-dive-guidance__label">For the next few days</p>
          {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </section>
       ) : section.id === 'carry-forward' ? (
        <div className="a2-completion"><div className="a2-completion__lesson">{section.paragraphs.slice(0,3).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>{reflection ? <div className="a2-completion__yours"><p className="eyebrow">WHAT YOU CHOSE TO KEEP</p><blockquote>{reflection}</blockquote></div> : null}<div className="a2-completion__forward"><p>{section.paragraphs[3]}</p></div></div>
      ) : section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </article>
  );
}
