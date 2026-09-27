import { ReactNode, Suspense } from 'react';
import { StageContext } from './StageContext';
import { Wordmark } from './Wordmark';
import { ReviewNavigator, type ReviewNavStage } from './ReviewNavigator';
import { REVIEW_NAVIGATION } from '../deep-dive/review-navigator-content';
import { issueReviewJump, reviewActorAllowed } from '../../server/auth/review-navigator';
import { requireActor } from '../../server/auth/require-actor';

type AppShellProps = {
  children: ReactNode;
  stage: 'Awaken' | 'See Clearly' | 'Become' | 'Join';
  accountAction?: ReactNode;
};

async function ReviewNavigatorSlot() {
  const actor = await requireActor();
  const stages: ReviewNavStage[] | null = actor && reviewActorAllowed(actor) && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) ? REVIEW_NAVIGATION.map(group => ({
    stage: group.stage,
    lessons: group.lessons.map(lesson => ({ title: lesson.title, path: lesson.path,
      sections: lesson.sections.map(section => ({ id: section.id, title: section.title,
        href: `${lesson.path}?section=${encodeURIComponent(section.id)}&reviewJump=${encodeURIComponent(issueReviewJump(actor, lesson.path, section.id) ?? '')}` })),
    })),
  })) : null;
  if (stages) {
    const path = '/deep-dive/see-clearly/what-has-become-clear';
    stages[1].lessons.push({ title: 'What Has Become Clear', path,
      href: `${path}?section=overview&reviewJump=${encodeURIComponent(issueReviewJump(actor, path, 'overview') ?? '')}`, sections: [] });
  }
  return stages ? <ReviewNavigator stages={stages} /> : null;
}

export function AppShell({ children, stage, accountAction }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <Wordmark href="/dashboard" />
        <div className="app-shell-account">{process.env.REVIEW_TEST_ACCESS === 'true' ? <Suspense fallback={null}><ReviewNavigatorSlot /></Suspense> : null}{accountAction ?? <form action="/auth/callback?action=sign-out" method="post"><button className="app-shell-sign-out" type="submit">Sign out</button></form>}</div>
      </header>
      <StageContext currentStage={stage} />
      <main className="app-shell-content" id="main-content">{children}</main>
    </div>
  );
}
