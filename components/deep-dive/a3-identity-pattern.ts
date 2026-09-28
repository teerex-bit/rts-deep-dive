/** Builds the curriculum sentence from the participant's wording without interpretation. */
export function composeObservedPattern(observation: string, situation: string) {
  const observed = observation.trim() === 'I’m not sure' ? '__________' : observation.trim();
  const context = situation.trim() === 'I’m not sure' ? '__________' : situation.trim();
  return `I tend to ${observed || '__________'} when ${context || '__________'}.`;
}
