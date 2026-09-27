import { redirect } from 'next/navigation';
import { AppShell } from '../design-system/AppShell';
import { SeeClearlyRecap } from './SeeClearlyRecap';
import { lessonSaveFailure } from './lesson-state';
import { getSG4 } from '../../server/services/see-clearly-sg4-service';
import { confirmSeeClearlyRecap, getSeeClearlyRecap } from '../../server/services/see-clearly-recap-service';

export async function SeeClearlyRecapPage() {
  const { progress } = await getSG4();
  if (!progress?.completedAt) redirect('/deep-dive/see-clearly');
  const data = await getSeeClearlyRecap();
  async function confirm(_: { error?: string; signIn?: boolean }, form: FormData) {
    'use server';
    const narrative = String(form.get('narrative') ?? '');
    if (!narrative.trim()) return { error: 'Write a few words before confirming.' };
    try {
      const saved = await confirmSeeClearlyRecap({
        fingerprint: String(form.get('fingerprint') ?? ''), narrative,
        clarification: String(form.get('clarification') ?? ''), carryForward: String(form.get('carryForward') ?? ''),
      });
      if (!saved) return { error: 'Your earlier words changed. Refresh this page to see them before confirming.' };
    } catch (error) { return lessonSaveFailure(error, 'We could not confirm your words. They are still here; please try again.'); }
    redirect('/deep-dive/see-clearly/what-has-become-clear');
  }
  return <AppShell stage="See Clearly"><SeeClearlyRecap {...data} action={confirm} /></AppShell>;
}
