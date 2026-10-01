export type NewAwakenSectionId = 'entry' | 'teaching' | 'trace' | 'reframe' | 'reflection' | 'practice' | 'carry-forward';
export type NewAwakenSection = Readonly<{ id: NewAwakenSectionId; eyebrow: string; title: string; paragraphs: readonly string[]; prompt?: string }>;

export const A3_SECTIONS: readonly NewAwakenSection[] = [
  { id: 'entry', eyebrow: 'AWAKEN · SEPARATE', title: 'Is This Who I Am?', paragraphs: [
    'You may already recognize a pattern you have been noticing. Or you may only have a few reactions that seem familiar. You do not need to have it figured out. You have begun to recognize what you tend to do. Now there is room to consider what that says about you—and what it does not.',
    'A repeated response can be real, and a pattern may need to change. But something that has been formed in you is not automatically who you are. We will begin with what you have noticed, then compare the behavior itself with the conclusion you may draw about yourself.',
  ] },
  { id: 'teaching', eyebrow: 'A PATTERN IS NOT IDENTITY', title: 'What Was Formed Is Not All You Are', paragraphs: [
    'Responses can become familiar through repeated experiences, what we see modeled, what we are taught, and strategies that once seemed to help. A response may feel automatic because it has been practiced often. That history can help explain why change takes time, but you do not need to prove where a response began before you can notice it.',
    'A person may say, “I am a withdrawn person,” when what they have noticed is, “I learned to protect myself by withdrawing.” Someone may call themselves controlling, while a more specific observation is, “I often become controlling when I feel uncertain.” The second statement does not excuse the behavior or guarantee that its history is known. It describes a response without making it the whole identity.',
    'The goal is not positive thinking. The goal is accuracy. Second Corinthians 5:17 says that anyone in Christ is a new creation. Old habits and ways of responding may still need attention, but they are not the final truth about who you are in Christ. We can tell the truth about what we do while leaving room for the new life God gives.',
  ] },
  { id: 'trace', eyebrow: 'NOTICE WHAT YOU HAVE SEEN', title: 'Describe What You Notice', paragraphs: [
    'Start with whatever you have noticed, even if it happened once or is not yet a clear pattern. Then place it in a kind of moment where you noticed it. Only after that, consider what you may be tempted to say about yourself. “I’m not sure” is a complete and honest response; nothing here asks you to settle on a label.',
  ] },
  { id: 'reflection', eyebrow: 'YOUR REFLECTION', title: 'Notice the Difference', paragraphs: [
    'You have seen two kinds of statements side by side: a conclusion about who you are and a description of what you noticed yourself doing in a particular kind of moment. You do not need to decide what the difference means for your whole life. If something stands out to you, put it in your own words; if not, you can continue without writing.',
  ], prompt: 'What difference do you notice?' },
  { id: 'practice', eyebrow: 'IN YOUR DAY', title: 'Notice What You Call Yourself', paragraphs: [
    'Pay attention when a sentence like “I’m just like that,” “That’s who I am,” “I’ve always been this way,” or “I can’t help it” comes to mind. You do not have to argue with yourself or replace it with a positive slogan. Pause and ask: Is this my identity, or is this a pattern I have learned? A clear description can make room to respond differently while still taking responsibility for what you do.',
  ] },
  { id: 'carry-forward', eyebrow: 'CARRY FORWARD', title: 'Ready to Understand', paragraphs: [
    'You can notice what you do without making that response the whole truth of who you are. A pattern can be real, shaped over time, and still not define your identity. Next, you will look at one real moment and begin to notice what may have been moving underneath your response.',
  ] },
];

export const A4_SECTIONS: readonly NewAwakenSection[] = [
  { id: 'entry', eyebrow: 'AWAKEN · UNDERSTAND', title: 'What Is Driving This Response?', paragraphs: [
    'You have begun to notice an internal response, recognize something that may repeat, and separate a learned pattern from your identity. Now you can become curious about a particular moment: what were you expecting, wanting, or afraid might happen? What felt important or threatened?',
    'These questions are not a search for one hidden cause. They help you slow down enough to notice what was going on inside. You may find one thing, several things, or no clear answer yet.',
  ] },
  { id: 'teaching', eyebrow: 'LOOK BENEATH THE FIRST RESPONSE', title: 'Expectations, Desires, and Fears', paragraphs: [
    'Expectations can operate quietly: people should understand me; I should not fail; conflict will end badly; people may leave when disappointed; uncertainty may become danger; if I am not in control, something important may fall apart. The first step is not deciding whether an expectation is right. It is noticing what you expected in that moment.',
    'Desire also shapes a response. We may want respect, acceptance, peace, certainty, to be right, to be needed, to avoid embarrassment, or for someone else to change. Desire is not automatically wrong. It becomes useful to examine when it grows so important that it begins governing our response. Wanting peace may lead someone to avoid a needed conversation; wanting to be understood may lead to defensiveness; wanting order may lead to control. These are examples, not interpretations of your choices.',
    'Fear may be present too, though it is not always easy to name. You might wonder what could happen if you did not get what you wanted, or if your expectation failed. “I’m not sure” is a valid answer. You do not have to diagnose yourself or explain where a fear came from.',
  ] },
  { id: 'trace', eyebrow: 'ONE REAL MOMENT', title: 'Stay with a Moment', paragraphs: [
    'Choose one recent moment when you noticed a response in yourself. We will take it one question at a time: what happened, what you expected, what you wanted, what you feared might happen, and what felt important. You do not need to tell the whole story or make every answer clear.',
  ] },
  { id: 'reflection', eyebrow: 'YOUR REFLECTION', title: 'Keep What You Noticed', paragraphs: [
    'There may or may not be something from this moment you want to remember. If something meaningful emerged, you can save it here in your own words. You do not need a complete explanation, and you can continue without writing.',
  ], prompt: 'Was there anything you noticed here that you want to remember?' },
  { id: 'practice', eyebrow: 'IN YOUR DAY', title: 'Pause and Ask', paragraphs: [
    'When you notice a familiar response beginning, pause and ask: What am I expecting right now? What do I want right now? What am I afraid might happen? You do not have to answer every question. Even noticing one expectation, desire, fear, or concern can help you stay present without pretending you have found the whole explanation.',
  ] },
  { id: 'carry-forward', eyebrow: 'CARRY FORWARD', title: 'Carry the Questions Forward', paragraphs: [
    'You have practiced looking at one moment through your own expectations, desires, fears, and concerns. These questions can make a response easier to see without reducing it to one cause. Awaken ends here. In See Clearly, you will look more closely at what you believe about yourself and God, and ask what is actually true.',
  ] },
];
