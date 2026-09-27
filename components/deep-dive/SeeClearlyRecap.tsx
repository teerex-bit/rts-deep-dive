'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { recapPrompts, provisionalNarrative, type RecapRecord, type RecapSource } from '../../domain/see-clearly-recap';
import { LessonActionError } from './LessonTransitionForm';

type SaveState = { error?: string; signIn?: boolean };
type Props = {
  sources: RecapSource[]; fingerprint: string; record: RecapRecord | null;
  action: (state: SaveState, form: FormData) => Promise<SaveState>;
};
export function SeeClearlyRecap({ sources, fingerprint, record, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [narrative, setNarrative] = useState(record?.narrative || provisionalNarrative(sources));
  const [clarification, setClarification] = useState(record?.clarification ?? '');
  const [carry, setCarry] = useState(record?.carryForward ?? '');
  return <section className="deep-dive-home deep-dive-recap">
    <p className="eyebrow">SEE CLEARLY · LOOK BACK</p>
    <h1>What Has Become Clear</h1>
    <p className="deep-dive-introduction">Here is what your own words seem to show across this journey. Read slowly. Change anything that no longer fits. You may leave earlier questions open.</p>
    <form action={formAction} className="deep-dive-recap__form">
      <input type="hidden" name="fingerprint" value={fingerprint} />
      <label htmlFor="recap-narrative">The story I can see so far</label>
      <textarea id="recap-narrative" name="narrative" rows={Math.max(6, Math.min(13, sources.length + 4))} value={narrative} onChange={event => setNarrative(event.target.value)} placeholder="In my own words, what has become clearer?" />
      <p>This is a draft for you to shape. Your earlier answers remain as you wrote them.</p>
      <label htmlFor="recap-clarification">As you read this now, what has changed, become clearer, or no longer feels true? <span>(optional)</span></label>
      <textarea id="recap-clarification" name="clarification" rows={3} value={clarification} onChange={event => setClarification(event.target.value)} />
      <label htmlFor="recap-carry">What from this do you want to learn to live differently? <span>(optional)</span></label>
      <textarea id="recap-carry" name="carryForward" rows={3} value={carry} onChange={event => setCarry(event.target.value)} />
      <button className="button" disabled={pending || !narrative.trim()}>{pending ? 'Confirming…' : record?.confirmedAt ? 'Confirm my changes' : 'Confirm what I want to carry'}</button>
      <LessonActionError error={state.error} signIn={state.signIn} />
    </form>
    {record?.confirmedAt ? <Link className="button deep-dive-recap__continue" href="/deep-dive/become">Continue to Become</Link> : null}
    <details className="deep-dive-recap__review"><summary>Look back at what I wrote</summary>
      <ol>{recapPrompts.map(prompt => {
        const item = sources.find(source => source.module === prompt.module);
        return <li key={prompt.module}><strong>{prompt.title}</strong>
          {item ? <><p>{item.words.join(' · ')}</p><Link href={item.href}>Review my words</Link></>
            : <><p>You left this open.</p><Link href={`/deep-dive/see-clearly/${prompt.route}?section=${prompt.section}&returnTo=recap`}>Add something</Link></>}
        </li>;
      })}</ol>
    </details>
    <Link className="deep-dive-stage-actions__back" href="/deep-dive/see-clearly">Back to See Clearly</Link>
  </section>;
}
