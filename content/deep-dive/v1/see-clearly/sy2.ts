export type SY2SectionId = 'entry' | 'chain' | 'example' | 'trace' | 'distinction' | 'reflection' | 'practice' | 'carry-forward';
export type SY2Section = Readonly<{ id: SY2SectionId; eyebrow: string; title: string; paragraphs: readonly string[] }>;

export const SY2_SECTIONS: readonly SY2Section[] = [
  { id: 'entry', eyebrow: 'SEE CLEARLY · PART I · SY2', title: 'How a Reaction Takes Shape', paragraphs: [
    'You have already seen how one movement can lead into another: what you see → what you believe → what you expect → what you desire → what you intend → what you choose → how you live. Think of each movement as a link. One connects to the next; together they form a chain.',
    'Following those links backward can help you see how an eventual reaction or behavior began much earlier. Most choices have a history. By the time a behavior becomes visible, several things may already have happened inside us.',
    'Desire can become intention, intention can shape a choice, and repeated choices become part of how we live. You do not need to dissect every moment. Here you will practice noticing a process that often begins before the behavior anyone else can see.',
  ] },
  { id: 'chain', eyebrow: 'THE MOVEMENT BENEATH A CHOICE', title: 'The formation chain', paragraphs: [
    'Each link influences the next without making the next inevitable. The chain helps you notice where a response began to take shape. A link may be uncertain or missing; the purpose is attention, not a perfect account of yourself.',
  ] },
  { id: 'example', eyebrow: 'AN ORDINARY MOMENT', title: 'How one meaning can travel', paragraphs: [
    'Someone does not respond to my message. I might see that as “They are ignoring me,” believe “I am not important to them,” and expect they do not want to deal with me. Wanting reassurance, I may intend to get an answer, send another message or become cold, and find that the relationship feels more tense.',
    'This is an example, not an interpretation of you. The other person may have been busy, and my interpretation of what happened could be wrong or incomplete. A different first meaning could lead somewhere else.',
  ] },
  { id: 'trace', eyebrow: 'YOUR MOMENT', title: 'Trace one real moment', paragraphs: [
    'Choose a recent moment that stayed with you. It can be one you noticed earlier or something different. Don’t worry about explaining it perfectly. Just begin with what happened.',
    'Follow the links one at a time. If you are unsure about something, leave it open rather than forcing an answer.',
  ] },
  { id: 'distinction', eyebrow: 'A USEFUL DISTINCTION', title: 'Belief and desire are different', paragraphs: [
    'Belief is what I think is true. Desire is what I want in response to what I think is true. If I believe “This is going badly,” I might desire to regain control. Naming both helps me see why a choice seemed appealing without pretending either one was certain.',
  ] },
  { id: 'reflection', eyebrow: 'YOUR REFLECTION', title: 'What became clearer?', paragraphs: [
    'Looking backward through the moment may have helped you notice something you could not see while it was happening. Maybe you saw the meaning you gave the situation, an expectation you were carrying, or a desire underneath your response.',
    'You do not need to settle everything here. The point is simply to notice what became visible when you slowed the moment down and looked more carefully. You may keep a thought here or continue without writing.',
  ] },
  { id: 'practice', eyebrow: 'IN YOUR DAY', title: 'Notice a chain as it forms', paragraphs: [
    'You have practiced following the links backward. Now begin noticing them as they happen in ordinary life.',
    'You may catch only one or two links at first—a belief shaping an expectation, a desire beginning to influence an intention, or an interpretation starting to affect how you respond. That is enough.',
    'Over time, you are learning to recognize the chain earlier, before the final behavior is the only thing you can see.',
  ] },
  { id: 'carry-forward', eyebrow: 'CARRY FORWARD', title: 'Behavior has a beginning', paragraphs: [
    'Behavior is often the visible end of a deeper process. The point is not endless self-analysis. It is learning to notice where the chain begins shaping how you live. What story about yourself seems to travel with you through different moments?',
  ] },
];
