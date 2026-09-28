type A2PatternBridgeMoment = Readonly<{ internal: string; response: string }>;

/*
 * TEMPORARY A2_PATTERN_BRIDGE:
 * Deterministic participant feedback used until the approved AI-supported
 * reflection layer is implemented. Keep isolated so it can be replaced
 * without altering the A2 curriculum or interaction model.
 */

function frequencies(values: readonly string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function repeated(counts: ReadonlyMap<string, number>) {
  return [...counts.entries()].filter(([, count]) => count > 1);
}

function participantList(values: readonly string[]) {
  const labels = [...values];
  if (labels.length < 2) return labels[0] ?? '';
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function sentenceStart(value: string) {
  return value.length ? `${value[0].toLocaleUpperCase()}${value.slice(1)}` : value;
}

/** Return a short, observation-only response for the completed A2 mapping pairs. */
export function getA2PatternBridgeFeedback(moments: readonly A2PatternBridgeMoment[]): string {
  const completeMoments = moments.filter(moment => moment.internal.trim() !== '' && moment.response.trim() !== '');

  if (completeMoments.length === 0) {
    return 'Choose both a first internal move and a typical response in any moment to begin noticing what may be familiar.';
  }

  if (completeMoments.length === 1) {
    return 'You have noticed one moment. Add another if you want to see whether anything familiar appears in a different situation.';
  }

  const internalCounts = frequencies(completeMoments.map(moment => moment.internal));
  const responseCounts = frequencies(completeMoments.map(moment => moment.response));
  const pairCounts = frequencies(completeMoments.map(moment => `${moment.internal}\u0000${moment.response}`));
  const repeatedPairs = repeated(pairCounts);

  if (repeatedPairs.length) {
    const pairDescriptions = repeatedPairs.map(([key]) => {
      const [internal, response] = key.split('\u0000');
      return `${sentenceStart(internal)} was followed by ${response.toLocaleLowerCase()}`;
    });
    if (pairDescriptions.length === 1) {
      return `You noticed the same movement more than once. ${pairDescriptions[0]} in different moments. That repetition is worth noticing.`;
    }
    return `You noticed the same movements more than once: ${participantList(pairDescriptions)}. Those repetitions are worth noticing.`;
  }

  const repeatedResponses = repeated(responseCounts);
  if (repeatedResponses.length > 1) {
    return `You noticed more than one response appearing across these moments: ${participantList(repeatedResponses.map(([response]) => response.toLocaleLowerCase()))}. For now, simply notice that these responses are showing up more than once.`;
  }

  const repeatedInternals = repeated(internalCounts);
  if (repeatedInternals.length > 1) {
    const internalLabels = repeatedInternals.map(([internal], index) => index === 0 ? sentenceStart(internal) : internal.toLocaleLowerCase());
    return `Some of the same internal movements appeared in different situations. ${participantList(internalLabels)} each showed up more than once. That is useful to notice.`;
  }

  const dominantResponses = [...responseCounts.entries()].filter(([, count]) => count >= 3);
  if (dominantResponses.length) {
    const [response] = dominantResponses.sort((left, right) => right[1] - left[1])[0];
    return `${response} showed up in several different moments. The situations were different, but this response appeared repeatedly. You do not need to explain it yet—just notice it.`;
  }

  const dominantInternals = [...internalCounts.entries()].filter(([, count]) => count >= 3);
  if (dominantInternals.length) {
    const [internal] = dominantInternals.sort((left, right) => right[1] - left[1])[0];
    return `${internal} appeared in several of these moments, even though what you did next was not always the same. You are beginning to notice something that may be familiar.`;
  }

  if (repeatedResponses.length === 1) {
    const [response] = repeatedResponses[0];
    return `Different things were happening inside, but both moments moved toward ${response.toLocaleLowerCase()}. You may be beginning to recognize a familiar response.`;
  }

  if (repeatedInternals.length === 1) {
    const [internal] = repeatedInternals[0];
    return `The responses were different, but ${internal.toLocaleLowerCase()} appeared in both moments. The same internal movement does not always lead to the same response.`;
  }

  return 'These moments do not have to match to be useful. You noticed what was happening inside you and what you did next. That is the practice: becoming more familiar with yourself as you respond.';
}
