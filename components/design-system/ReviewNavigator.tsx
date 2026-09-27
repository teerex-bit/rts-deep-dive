'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export type ReviewNavStage = { stage: string; lessons: { title: string; path: string; href?: string; sections: { id: string; title: string; href: string }[] }[] };

export function ReviewNavigator({ stages }: { stages: ReviewNavStage[] }) {
  const path = usePathname();
  const section = useSearchParams().get('section');
  const current = stages.flatMap(stage => stage.lessons.map(lesson => ({ stage: stage.stage, lesson }))).find(item => item.lesson.path === path);
  const currentSection = current?.lesson.sections.find(item => item.id === section);
  const currentStage = current?.stage ?? (path.startsWith('/deep-dive/awaken') ? 'AWAKEN' : path.startsWith('/deep-dive/see-clearly') ? 'SEE CLEARLY' : path.startsWith('/deep-dive/become') ? 'BECOME' : 'FORMATION JOURNEY');

  return <details key={`${path}?section=${section ?? ''}`} className="review-navigator">
    <summary>REVIEW NAVIGATOR</summary>
    <nav className="review-navigator__panel" aria-label="Review navigator">
      <div className="review-navigator__orientation" aria-live="polite">Current: {currentStage}{current ? ` / ${current.lesson.title}` : ''}{currentSection ? ` / ${currentSection.title}` : path.endsWith('/what-has-become-clear') ? ' / What Has Become Clear' : ''}</div>
      {stages.map(stage => <section key={stage.stage} aria-label={stage.stage}>
        <h2><Link href={stage.stage === 'AWAKEN' ? '/deep-dive/awaken' : '/deep-dive/see-clearly'}>{stage.stage}</Link></h2>
        {stage.lessons.map(lesson => lesson.sections.length ? <details key={lesson.path} open={lesson.path === path}>
          <summary aria-current={lesson.path === path ? 'location' : undefined}>{lesson.title}</summary>
          <ul>{lesson.sections.map(item => <li key={item.id}><Link href={item.href} aria-current={lesson.path === path && item.id === section ? 'page' : undefined}>{item.title}</Link></li>)}</ul>
        </details> : <Link key={lesson.path} href={lesson.href ?? lesson.path} aria-current={lesson.path === path ? 'page' : undefined}>{lesson.title}</Link>)}
      </section>)}
      <section aria-label="BECOME"><h2>BECOME</h2><Link href="/deep-dive/become" aria-current={path === '/deep-dive/become' ? 'page' : undefined}>Become — Stage Overview</Link></section>
    </nav>
  </details>;
}
