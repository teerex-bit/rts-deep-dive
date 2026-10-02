'use client';
import { AwakenGuidedInquiry } from './AwakenGuidedInquiry';
export function AwakenFreshMoment({ lesson }: { lesson: 'a2' | 'a3' | 'a4' }) {
  return <AwakenGuidedInquiry lesson={lesson} initialQuestion={lesson === 'a3' ? 'What did you notice yourself doing?' : 'What happened in one recent moment?'} />;
}
