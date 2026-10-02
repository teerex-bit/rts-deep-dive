export type AwakenLesson = 'a1' | 'a2' | 'a3' | 'a4';
export type AwakenTurn = { question: string; answer: string };
export type AwakenGuideResponse = { question: string; guidance: string; observation: string; complete: boolean };

export function validGuidance(value: unknown): value is AwakenGuideResponse {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  return typeof result.question === 'string' && result.question.length <= 500
    && typeof result.guidance === 'string' && result.guidance.length <= 1000
    && typeof result.observation === 'string' && result.observation.length <= 1200
    && typeof result.complete === 'boolean'
    && (result.complete || Boolean(result.question.trim()));
}
