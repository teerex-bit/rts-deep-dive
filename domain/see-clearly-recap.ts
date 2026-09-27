export const recapPrompts = [
  { module: 'sc1', table: 'see_clearly_sc1_records', title: 'What happened and what I made it mean', section: 'interaction', route: 'facts-and-interpretation', fields: ['event_facts', 'automatic_interpretation'] },
  { module: 'sy2', table: 'see_clearly_sy2_records', title: 'The formation chain', section: 'trace', route: 'follow-the-formation-chain', fields: ['perception', 'belief', 'expectation', 'desire', 'intention', 'choice', 'outcome'] },
  { module: 'sy3', table: 'see_clearly_sy3_records', title: 'A story I learned to carry', section: 'recognition', route: 'the-learned-self-story', fields: ['self_story_hypothesis'] },
  { module: 'sy4', table: 'see_clearly_sy4_records', title: 'What is actually true', section: 'look-again', route: 'what-is-actually-true-about-me', fields: ['truth_to_live_from'] },
  { module: 'sg1', table: 'see_clearly_sg1_records', title: 'A picture of God I learned', section: 'recognition', route: 'the-god-i-learned', fields: ['learned_god_image'] },
  { module: 'sg2', table: 'see_clearly_sg2_records', title: 'What I expected from God', section: 'recognition', route: 'what-i-expect-from-god', fields: ['expectation'] },
  { module: 'sg3', table: 'see_clearly_sg3_records', title: 'What I noticed in Jesus', section: 'observation', route: 'jesus-shows-us-the-father', fields: ['observation'] },
  { module: 'sg4', table: 'see_clearly_sg4_records', title: 'What trust looks like here', section: 'trust-question', route: 'can-i-trust-god-here', fields: ['trust_meaning'] },
] as const;

export type RecapSource = { module: string; title: string; href: string; words: string[]; progressId: string };
export type RecapRecord = { narrative: string; clarification: string; carryForward: string; confirmedAt: Date | null };
export function provisionalNarrative(items: RecapSource[]) {
  const lead: Record<string, string> = {
    sc1: 'I began with what happened and what it seemed to mean:',
    sy2: 'I followed what that moment set in motion:',
    sy3: 'A story I may have learned to carry sounded like this:',
    sy4: 'I began to put a deeper truth into my own words:',
    sg1: 'The picture of God I had learned seemed to be:',
    sg2: 'In an ordinary moment, I noticed an expectation:',
    sg3: 'Looking at Jesus, I noticed:',
    sg4: 'With the outcome still open, I wondered what trust might mean:',
  };
  const sentences = items.map(item => `${lead[item.module] ?? 'I noticed:'} “${item.words.join('” and “')}”`);
  const self = items.filter(item => ['sc1', 'sy2', 'sy3', 'sy4'].includes(item.module)).length;
  return [sentences.slice(0, self).join(' '), sentences.slice(self).join(' ')].filter(Boolean).join('\n\n');
}
