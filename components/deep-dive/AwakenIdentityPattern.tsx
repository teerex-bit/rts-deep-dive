'use client';
import { AwakenGuidedInquiry } from './AwakenGuidedInquiry';
export function AwakenIdentityPattern({ context = '' }: { context?: string }) {
  return <AwakenGuidedInquiry lesson="a3" context={context ? [{ question: 'What have I already recognized about how I respond?', answer: context }] : []} initialQuestion="Which response you already noticed feels most like you?" />;
}
