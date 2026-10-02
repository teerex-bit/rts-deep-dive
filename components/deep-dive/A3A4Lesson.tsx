'use client';

import { useActionState, useState } from 'react';
import { A4MomentInquiry } from './A4MomentInquiry';
import { AwakenIdentityPattern } from './AwakenIdentityPattern';
import { LessonActionError } from './LessonTransitionForm';
import { ReviewReflection, type ReviewReflectionAction } from './ReviewReflection';
import type { NewAwakenSection } from '../../content/deep-dive/v1/awaken/four-module-lessons';

export type NewReflectionSaveState = Readonly<{ saved: boolean; error?: string }>;
type ReflectionAction = (state: NewReflectionSaveState, formData: FormData) => Promise<NewReflectionSaveState>;
type LessonProps = { section: NewAwakenSection; reflection: string | null; priorReflection?: string | null; saveReflection: ReflectionAction; editReflection: ReviewReflectionAction; review?: boolean };

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
  ['NOTICE', 'Something in me just changed.'],
  ['ASK', 'What am I expecting right now? What do I want? What am I afraid might happen?'],
  ['RECEIVE', 'Stay with what becomes clear without forcing an answer.'],
] as const;

function Lesson({ section, reflection, priorReflection = null, saveReflection, editReflection, review, module }: LessonProps & { module: 'a3' | 'a4' }) {
  return <article className={`deep-dive-lesson deep-dive-lesson--${module} deep-dive-lesson--${section.id}`}>
    <p className="eyebrow deep-dive-section-label">{section.eyebrow}</p><h1>{section.title}</h1>
    {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    {module === 'a3' && section.id === 'trace' ? <div className="awaken-prior-handoff"><p>You have already seen some of the ways you respond. Choose one that feels worth looking at more closely. We are not asking for another situation.</p>{priorReflection ? <blockquote>{priorReflection}</blockquote> : null}<AwakenIdentityPattern context={priorReflection ?? ''} /></div> : null}
    {module === 'a4' && section.id === 'trace' ? <div className="awaken-prior-handoff"><p>You have already named something about how you respond. Now we can look at what may have been shaping that response without starting the story over.</p>{priorReflection ? <blockquote>{priorReflection}</blockquote> : null}<A4MomentInquiry context={priorReflection ?? ''} /></div> : null}
    {module === 'a4' && section.id === 'carry-forward' ? <section className="a4-carry-practice" aria-label="Daily questions">
      {A4_PRACTICE.map(([name, description]) => <div key={name}><strong>{name}</strong><p>{description}</p></div>)}
    </section> : null}
    {section.id === 'reflection' ? <Reflection section={section} reflection={reflection} saveReflection={saveReflection} editReflection={editReflection} review={review} /> : null}
  </article>;
}

export function A3Lesson(props: LessonProps) { return <Lesson {...props} module="a3" />; }
export function A4Lesson(props: LessonProps) { return <Lesson {...props} module="a4" />; }
