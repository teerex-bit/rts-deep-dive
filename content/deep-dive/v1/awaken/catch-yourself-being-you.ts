export type A2SectionId = 'entry' | 'patterns' | 'scripture' | 'reflection' | 'go-deeper' | 'practice' | 'carry-forward';

export type A2Section = Readonly<{
  id: A2SectionId;
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
  prompt?: string;
}>;

export const A2_SECTIONS: readonly A2Section[] = [
  {
    id: 'entry', eyebrow: 'AWAKEN · A2', title: 'Catch Yourself Being You',
    paragraphs: [
      'Someone misunderstands you.',
      'Plans suddenly change.',
      'Conflict begins.',
      'Someone seems disappointed in you.',
      'You feel overlooked.',
      'Something goes well and you immediately want to make sure it stays that way.',
      'Different situations. Something about your response may still be familiar.',
    ],
  },
  {
    id: 'patterns', eyebrow: 'CATCH YOURSELF BEING YOU', title: 'Look across a few different situations',
    paragraphs: [
      'You do not need to respond the same way every time. We are going to look at a few different situations and how you responded in each. Then you can step back and decide what, if anything, you recognize about yourself.',
    ],
  },
  {
    id: 'scripture', eyebrow: 'A MOMENT TO CONSIDER', title: 'Seeing clearly',
    paragraphs: [
      'For if anyone is a hearer of the word and not a doer, he is like a man looking at his natural face in a mirror. For he sees himself, and goes away, and immediately forgets what kind of man he was.',
      'James uses a mirror to describe the value of seeing honestly. Seeing a repeated response is not condemnation. Give yourself truthful attention without turning it into self-criticism.',
      'A repeated response may connect with what you believe, expect, or feel is at stake. We will explore those connections later. For now, simply notice what repeats.',
    ],
  },
  {
    id: 'reflection', eyebrow: 'YOUR REFLECTION', title: 'What do you recognize about yourself?',
    paragraphs: [
      'Look across the different situations you explored. You may recognize a familiar way you move when something presses on you, or you may see that you respond differently in different situations.',
      'Do not force a pattern. Keep only what you can honestly see in your own responses.',
    ],
    prompt: 'What would you like to keep in your own words?',
  },
  {
    id: 'go-deeper', eyebrow: 'A SMALL PRACTICE', title: 'Notice, name, ask, receive',
    paragraphs: [
      'Begin with what you can notice and name what is happening. Ask God what He wants you to see, then stay with what becomes clear. The question can remain open; you do not need to manufacture an answer.',
    ],
  },
  {
    id: 'practice', eyebrow: 'IN YOUR DAY', title: 'Catch yourself being you',
    paragraphs: [
      'Over the next few days, notice when a familiar response appears. Catch it as close to the moment as possible and name what is happening. Ask God what He wants you to notice, and stay with what becomes clear without forcing an answer.',
      'You are not trying to fix the pattern yet. Collect observations. One sentence is enough: “I noticed I became defensive when I felt misunderstood.” You can stop at noticing or naming without forcing an explanation.',
    ],
  },
  {
    id: 'carry-forward', eyebrow: 'CARRY FORWARD', title: 'A pattern is something you can notice',
    paragraphs: [
      'The way you respond in a moment may reveal a pattern, but it does not automatically define who you are. As you keep noticing, pay attention to the language you use about yourself.',
      'For now, carry forward what you observed. These patterns will prepare you for a later lesson; you do not need to explain or change them today.',
    ],
  },
] as const;
