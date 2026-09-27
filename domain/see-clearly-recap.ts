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
  const byModule = new Map(items.map(item => [item.module, item.words]));
  const quote = (word: string) => `“${word}”`;
  const self: string[] = [];
  const moment = byModule.get('sc1');
  if (moment) self.push(moment.length > 1
    ? `I described what happened as ${quote(moment[0])}, and the meaning that arrived was ${quote(moment[1])}.`
    : `I described what happened as ${quote(moment[0])}.`);
  const chain = byModule.get('sy2');
  if (chain) self.push(chain.length > 1
    ? `Following a reaction, my words began with ${quote(chain[0])} and reached ${quote(chain[chain.length - 1])}.`
    : `Following a reaction, I noticed ${quote(chain[0])}.`);
  const story = byModule.get('sy3');
  if (story) self.push(`A story I sometimes carried was ${quote(story[0])}.`);
  const truth = byModule.get('sy4');
  if (truth) self.push(`I also wrote a truth I want to live from: ${quote(truth[0])}.`);

  const god: string[] = [];
  const picture = byModule.get('sg1');
  if (picture) god.push(`A picture of God I had learned was ${quote(picture[0])}.`);
  const expectation = byModule.get('sg2');
  if (expectation) god.push(`In a real moment, I expected ${quote(expectation[0])}.`);
  const observation = byModule.get('sg3');
  if (observation) god.push(`Looking at Jesus, I noticed ${quote(observation[0])}.`);
  const trust = byModule.get('sg4');
  if (trust) god.push(`With an outcome still open, I wrote ${quote(trust[0])}.`);
  return [self.join(' '), god.join(' ')].filter(Boolean).join('\n');
}
