import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '../../../../components/design-system/AppShell';
import { AWAKEN_INTRODUCTION } from '../../../../content/deep-dive/v1';
import { awakenModuleNavigation } from '../../../../components/deep-dive/awaken-module-navigation';
import { getA1, getA2, getA3, getA4 } from '../../../../server/services/deep-dive-service';
import { getSC1 } from '../../../../server/services/see-clearly-sc1-service';
import { getSY2 } from '../../../../server/services/see-clearly-sy2-service';
import { getSY3 } from '../../../../server/services/see-clearly-sy3-service';
import { getSY4 } from '../../../../server/services/see-clearly-sy4-service';
import { getSG1 } from '../../../../server/services/see-clearly-sg1-service';
import { getSG2 } from '../../../../server/services/see-clearly-sg2-service';
import { getSG3 } from '../../../../server/services/see-clearly-sg3-service';
import { getSG4 } from '../../../../server/services/see-clearly-sg4-service';
import { SeeClearlyStage } from '../../../../components/deep-dive/SeeClearlyStage';
import { BecomeStage } from '../../../../components/deep-dive/BecomeStage';

export default async function StagePage({ params }: { params: Promise<{ stageId: string }> }) {
  const { stageId } = await params;
  if (stageId === 'become') return <AppShell stage="Become"><BecomeStage /></AppShell>;
  if (stageId === 'see-clearly') {
    const [{ progress }, { progress: sy2 }, { progress: sy3 }, { progress: sy4 }, { progress: sg1 }, { progress: sg2 }, { progress: sg3 }, { progress: sg4 }] = await Promise.all([getSC1(), getSY2(), getSY3(), getSY4(), getSG1(), getSG2(), getSG3(), getSG4()]);
    const status = progress?.completedAt ? 'review' : progress ? 'resume' : 'begin';
    const sy2Status = sy2?.completedAt ? 'review' : sy2 ? 'resume' : 'begin';
    const sy3Status = sy3?.completedAt ? 'review' : sy3 ? 'resume' : 'begin';
    const sy4Status = sy4?.completedAt ? 'review' : sy4 ? 'resume' : 'begin';
    const sg1Status = sg1?.completedAt ? 'review' : sg1 ? 'resume' : 'begin';
    const sg2Status = sg2?.completedAt ? 'review' : sg2 ? 'resume' : 'begin';
    const sg3Status = sg3?.completedAt ? 'review' : sg3 ? 'resume' : 'begin';
    const sg4Status = sg4?.completedAt ? 'review' : sg4 ? 'resume' : 'begin';
    return <AppShell stage="See Clearly"><SeeClearlyStage status={status} sy2Status={sy2Status} sy3Status={sy3Status} sy4Status={sy4Status} sg1Status={sg1Status} sg2Status={sg2Status} sg3Status={sg3Status} sg4Status={sg4Status} /></AppShell>;
  }
  if (stageId !== 'awaken') notFound();
  const [a1, a2, a3, a4] = await Promise.all([getA1(), getA2(), getA3(), getA4()]);
  const lessons = [
    awakenModuleNavigation('pay-attention', 'Pay Attention · A1', a1),
    awakenModuleNavigation('catch-yourself-being-you', 'Catch Yourself Being You · A2', a2),
    awakenModuleNavigation('your-reactions-have-a-history', 'Separate · A3', a3),
    awakenModuleNavigation('formation-is-not-identity', 'Understand · A4', a4),
  ];

  const nextLesson = lessons.find(lesson => !lesson.label.startsWith('Review ')) ?? lessons[lessons.length - 1];
  const firstArrival = !a1 && !a2 && !a3 && !a4;
  return (
    <AppShell stage="Awaken">
      <section className="deep-dive-home deep-dive-home--see-clearly">
        <p className="eyebrow">THE FORMATION JOURNEY{firstArrival ? '' : ' · AWAKEN'}</p>
        <h1>Awaken</h1>
        {firstArrival ? (
          <>
            <div className="see-clearly-welcome">
              <p className="see-clearly-welcome__lead">{AWAKEN_INTRODUCTION}</p>
            </div>
            <div className="see-clearly-welcome__first">
              <span className="eyebrow">YOUR FIRST STEP</span>
              <h2>Pay Attention</h2>
              <p>Begin by noticing what is already happening within you.</p>
              <Link className="button deep-dive-stage-actions__primary" href={lessons[0].href}>BEGIN AWAKEN</Link>
            </div>
          </>
        ) : (
          <>
            <p className="deep-dive-introduction">{AWAKEN_INTRODUCTION}</p>
            <div className="see-clearly-next">
              <p className="eyebrow">NEXT</p>
              <h2>{nextLesson.label.replace(/^(Begin|Resume|Review) /, '')}</h2>
              <p>Continue from where you are. You do not need to hold the whole journey in view.</p>
              <Link className="button deep-dive-stage-actions__primary" href={nextLesson.href}>CONTINUE</Link>
            </div>
          </>
        )}
        <Link className="deep-dive-stage-actions__back" href="/dashboard">BACK TO FORMATION JOURNEY</Link>
      </section>
    </AppShell>
  );
}
