'use client';
import { AwakenGuidedInquiry } from './AwakenGuidedInquiry';
export function A4MomentInquiry({ context = '' }: { context?: string }) {
  return <AwakenGuidedInquiry lesson="a4" context={context ? [{ question: 'What have I already recognized about my responses?', answer: context }] : []} initialQuestion="Which response you already noticed would you like to understand?" />;
}
