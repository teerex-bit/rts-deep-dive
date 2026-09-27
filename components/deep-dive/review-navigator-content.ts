import { A1_SECTIONS, A2_SECTIONS } from '../../content/deep-dive/v1';
import { A3_SECTIONS, A4_SECTIONS } from '../../content/deep-dive/v1/awaken/four-module-lessons';
import { SC1_SECTIONS } from '../../content/deep-dive/v1/see-clearly/sc1';
import { SY2_SECTIONS } from '../../content/deep-dive/v1/see-clearly/sy2';
import { SY3_SECTIONS } from '../../content/deep-dive/v1/see-clearly/sy3';
import { SY4_SECTIONS } from '../../content/deep-dive/v1/see-clearly/sy4';
import { SG1_SECTIONS } from '../../content/deep-dive/v1/see-clearly/sg1';
import { SG2_SECTIONS } from '../../content/deep-dive/v1/see-clearly/sg2';
import { SG3_SECTIONS } from '../../content/deep-dive/v1/see-clearly/sg3';
import { SG4_SECTIONS } from '../../content/deep-dive/v1/see-clearly/sg4';

export const REVIEW_NAVIGATION = [
  { stage: 'AWAKEN', lessons: [
    { title: 'Pay Attention', path: '/deep-dive/awaken/pay-attention', sections: A1_SECTIONS },
    { title: 'Catch Yourself Being You', path: '/deep-dive/awaken/catch-yourself-being-you', sections: A2_SECTIONS },
    { title: 'Your Reactions Have a History', path: '/deep-dive/awaken/your-reactions-have-a-history', sections: A3_SECTIONS },
    { title: 'Formation Is Not Identity', path: '/deep-dive/awaken/formation-is-not-identity', sections: A4_SECTIONS },
  ] },
  { stage: 'SEE CLEARLY', lessons: [
    { title: 'Facts and Interpretation', path: '/deep-dive/see-clearly/facts-and-interpretation', sections: SC1_SECTIONS },
    { title: 'Follow the Formation Chain', path: '/deep-dive/see-clearly/follow-the-formation-chain', sections: SY2_SECTIONS },
    { title: 'The Learned Self-Story', path: '/deep-dive/see-clearly/the-learned-self-story', sections: SY3_SECTIONS },
    { title: 'What Is Actually True About Me', path: '/deep-dive/see-clearly/what-is-actually-true-about-me', sections: SY4_SECTIONS },
    { title: 'The God I Learned', path: '/deep-dive/see-clearly/the-god-i-learned', sections: SG1_SECTIONS },
    { title: 'What I Expect From God', path: '/deep-dive/see-clearly/what-i-expect-from-god', sections: SG2_SECTIONS },
    { title: 'Jesus Shows Us the Father', path: '/deep-dive/see-clearly/jesus-shows-us-the-father', sections: SG3_SECTIONS },
    { title: 'Can I Trust God Here', path: '/deep-dive/see-clearly/can-i-trust-god-here', sections: SG4_SECTIONS },
  ] },
] as const;
