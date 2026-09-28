'use client';

import { useActionState, useState } from 'react';
import { A4MomentInquiry } from './A4MomentInquiry';
import { AwakenIdentityPattern } from './AwakenIdentityPattern';
import { LessonActionError } from './LessonTransitionForm';
import { ReviewReflection, type ReviewReflectionAction } from './ReviewReflection';
import type { NewAwakenSection } from '../../content/deep-dive/v1/awaken/four-module-lessons';

export type NewReflectionSaveState = Readonly<{ saved: boolean; error?: string }>;
type ReflectionAction = (state: NewReflectionSaveState, formData: FormData) => Promise<NewReflectionSaveState>;
type LessonProps = { section: NewAwakenSection; reflection: string | null; saveReflection: ReflectionAction; editReflection: ReviewReflectionAction; review?: boolean };

function Reflection({ section, reflection, saveReflection, editReflection, review }: LessonProps) {
  const [state, action, pending] = useActionState(saveReflection, { saved: false });
  const [body, setBody] = useState(reflection ?? '');
  const [edited, setEdited] = useState(false);
  if (review) return <ReviewReflection id="new-awaken-reflection" label={section.prompt ?? 'Your reflection'} reflection={reflection} action={editReflection} />;
  return <form className="deep-dive-reflection" action={action}>
    <label htmlFor="new-awaken-reflection">{section.prompt}</label>
    <textarea id="new-awaken-reflection" name="body" rows={3} value={body} onChange={event => { setBody(event.target.value); setEdited(true); }} />
    <div className="deep-dive-reflection__actions">
      <button className="button" type="submit" disabled={pending || !body.trim()}>{pending ? 'Saving…' : 'Save & continue'}</button>
      <button className="button button--secondary" type="submit" name="skip" value="true" disabled={pending}>Continue without writing</button>
    </div>
    <p className="status-message status-message--saved" role="status" aria-live="polite">{state.saved && !edited ? 'Reflection saved.' : ''}</p>
    <LessonActionError error={state.error} />
  </form>;
}

const A4_PRACTICE = [
  ['01', 'WHAT AM I EXPECTING RIGHT NOW?'],
  ['02', 'WHAT DO I WANT RIGHT NOW?'],
  ['03', 'WHAT AM I AFRAID MIGHT HAPPEN?'],
] as const;

function Lesson({ section, reflection, saveReflection, editReflection, review, module }: LessonProps & { module: 'a3' | 'a4' }) {
  const movement = module === 'a3' ? 'SEPARATE' : 'UNDERSTAND';
  const number = module === 'a3' ? '03' : '04';
  return <article className={`deep-dive-lesson awaken-v2 deep-dive-lesson--${module} deep-dive-lesson--${section.id}`}>
    {section.id === 'entry' ? <header className="awaken-v2-opening">
      <img className="awaken-v2-opening__mark" src="/assets/page-awaken/curriculum-logo-transparent.png" alt="Reforming the Soul" />
      <div className="awaken-v2-opening__copy">
        <p className="eyebrow">AWAKEN · {number}</p>
        <p className="awaken-v2-opening__movement">{movement}</p>
        <h1>{section.title}</h1>
        <p className="awaken-v2-opening__lead">{section.paragraphs[0]}</p>
      </div>
    </header> : <><p className="eyebrow deep-dive-section-label">{section.id === 'carry-forward' ? 'TAKE THIS WITH YOU' : section.eyebrow}</p><h1>{section.title}</h1>{section.id === 'carry-forward' ? <div className="awaken-v2-closing">{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div> : section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</>}
    {section.id === 'entry' ? <div className="awaken-v2-opening__continuation">{section.paragraphs.slice(1).map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div> : null}
    {module === 'a3' && section.id === 'trace' ? <AwakenIdentityPattern /> : null}
    {module === 'a4' && section.id === 'trace' ? <A4MomentInquiry /> : null}
    {module === 'a4' && section.id === 'carry-forward' ? <section className="a4-carry-practice" aria-label="Daily questions">
      <p className="eyebrow">TAKE THIS WITH YOU</p>
      {A4_PRACTICE.map(([number, question]) => <p className="a4-carry-practice__question" key={number}><span>{number}</span><strong>{question}</strong></p>)}
      <p className="a4-carry-practice__close">You do not have to answer every question. Even noticing one expectation, desire, or fear can help you stay present.</p>
    </section> : null}
    {section.id === 'reflection' ? <Reflection section={section} reflection={reflection} saveReflection={saveReflection} editReflection={editReflection} review={review} /> : null}
  </article>;
}

export function A3Lesson(props: LessonProps) { return <Lesson {...props} module="a3" />; }
export function A4Lesson(props: LessonProps) { return <Lesson {...props} module="a4" />; }
