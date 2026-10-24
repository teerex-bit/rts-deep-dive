'use client';

import { useEffect, useState } from 'react';

const chapters = [
  { eyebrow: 'THE BEGINNING', title: "The Person We've Become", paragraphs: [
    'Most of us begin the journey of spiritual formation already deeply formed. Long before we intentionally thought about who we were becoming, life was shaping us. Our families shaped us. Relationships shaped us. Success and failure shaped us. Pain, disappointment, fear, culture, church, and our experiences with other people all contributed to the people we became.',
    'Much of that formation happened without our awareness.',
    'We learned how to protect ourselves before we knew we were protecting ourselves. We developed ways of responding to conflict, disappointment, rejection, and uncertainty. We formed expectations about what other people would do and what we needed to do in response. We learned what made us feel safe and what made us feel threatened. We discovered ways to gain approval, avoid pain, maintain control, or keep people at a comfortable distance.',
    'Eventually, these responses became so familiar that they simply felt like us.',
    'Then we came to God carrying all of it.',
    'We may have learned what Christians believe and how Christians are supposed to behave. We may have learned Scripture, attended church, prayed, served, worshiped, and genuinely desired to follow Jesus. Yet underneath all of that, the person who had been formed through years of living was still there.',
    'That is where Reforming the Soul begins.',
    'It does not begin by asking us to try harder to behave like better Christians. It begins by helping us recognize the person from whom our behavior is already coming.'
  ]},
  { eyebrow: '01 / AWAKEN', title: 'We Begin by Waking Up', paragraphs: [
    'The first movement is Awaken, because we cannot intentionally surrender something we cannot see.',
    'Imagine someone says something that makes you feel dismissed. Before you have had time to think about it, something happens inside you. Maybe you become defensive. Maybe you withdraw. Maybe you feel an immediate need to explain yourself. Perhaps you become angry or spend the rest of the day replaying the conversation.',
    'Normally, we focus on the other person.',
    "They shouldn't have said that.",
    'Awaken asks us to notice something else.',
    'What just happened in me?',
    'That is a very different question.',
    'We are not immediately deciding whether our response was right or wrong. We are not condemning ourselves for having it. We are simply learning to pay attention.',
    'Why did that bother me so much? Why did I feel threatened? Why was it so important that I be understood? Why do I respond this way whenever someone questions me? Why does this particular situation keep producing the same reaction?',
    'At first, we may recognize these things long after they happen. Then we begin catching them sooner. Eventually, we sometimes recognize them while they are happening.',
    'That growing awareness is important because we are beginning to see the person beneath the behavior.',
    'We are learning to catch ourselves being ourselves.',
    'And eventually we can say, “Something is happening in me, and I can see it.”',
    'That is awakening.',
    'But seeing what is happening does not necessarily tell us why it is happening. For that, we have to look deeper.'
  ]}
];
const options = [
  'Someone questioned something I said or did.',
  'I felt overlooked or misunderstood.',
  "Something didn't happen the way I expected.",
  'Someone disappointed me.',
  'Something went particularly well.',
  'I had to make a difficult decision.'
];
const storageKey = 'rts-narrative-prototype-v1';
export default function NarrativeJourney() {
  const [page,setPage] = useState(0);
  const [selected,setSelected] = useState('');
  const [influence,setInfluence] = useState('');
  const [response,setResponse] = useState('');
  const [clearResponse,setClearResponse] = useState('');
  const [reveal,setReveal] = useState(false);
  const [reflectionStep,setReflectionStep] = useState(0);
  const [followup,setFollowup] = useState('');
  const [ready,setReady] = useState(false);
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');setPage(Math.min(22,Math.max(0,saved.page||0)));setSelected(saved.selected||'');setInfluence(saved.influence||'');setResponse(saved.response||'');setClearResponse(saved.clearResponse||'');setReveal(!!saved.reveal);setReflectionStep(saved.reflectionStep||0);setFollowup(saved.followup||'');}catch{}setReady(true)},[]);
  useEffect(()=>{if(ready)localStorage.setItem(storageKey,JSON.stringify({page,selected,influence,response,clearResponse,reveal,reflectionStep,followup}))},[page,selected,influence,response,clearResponse,reveal,reflectionStep,followup,ready]);
  const advance=(n:number)=>{setPage(n);window.scrollTo({top:0,behavior:'smooth'})};
  const reading = page===0 || page===2;
  const chapter=chapters[page===0?0:1];
  return <main className="rts-root">
    <style>{`
      .rts-root{min-height:100dvh;background:#f8f5ef;color:#263a4a;font-family:Georgia,'Times New Roman',serif}
      .rts-shell{max-width:600px;margin:auto;padding:12px 20px 70px}
      .rts-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.13em;color:#9b773b}
      .rts-tree-logo{display:block;width:118px;max-height:48px;object-fit:contain;object-position:right center}
      .rts-restart{border:1px solid #d9d1c5;background:#fffdfa;color:#263a4a;border-radius:8px;padding:7px 10px;font:600 12px Arial,sans-serif;cursor:pointer}
      .rts-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:13px}
      .rts-progress span{height:4px;border-radius:4px;background:#ded7ca}.rts-progress span.active{background:#b18a45}
      .rts-hero{width:100%;height:auto;display:block;border-radius:12px;margin:0 0 15px;height:145px;object-fit:cover;overflow:hidden}
      .rts-kicker{font:600 11px Arial,sans-serif;letter-spacing:.14em;color:#9b773b;margin:0 0 9px}
      .rts-root h1{font-size:clamp(28px,6.5vw,37px);line-height:1.16;letter-spacing:-.025em;font-weight:normal;margin:0 0 15px}
      .rts-prose p{font-size:16px;line-height:1.57;margin:0 0 16px}
      .rts-prose p{color:#334451}
      .rts-divider{height:1px;background:#ddd7cc;margin:23px 0 18px}
      .rts-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:25px}
      .rts-button{border:0;border-radius:12px;padding:15px 22px;background:#263a4a;color:white;font:600 15px Arial,sans-serif;min-height:50px;cursor:pointer}
      .rts-button:disabled{opacity:.45;cursor:not-allowed}.rts-back{background:transparent;color:#53616a;padding-left:0}
      .rts-option{display:block;width:100%;text-align:left;background:#fffdfa;border:1px solid #d9d1c5;border-radius:12px;padding:17px 16px;margin:10px 0;color:#263a4a;font:16px/1.4 Arial,sans-serif;min-height:55px;cursor:pointer}
      .rts-option[aria-pressed=true]{border-color:#a47c36;background:#f2e9d9;box-shadow:inset 0 0 0 1px #a47c36}
      .rts-hint{font:15px/1.6 Arial,sans-serif;color:#53616a}
      .rts-field{width:100%;box-sizing:border-box;border:1px solid #cfc6b9;border-radius:12px;padding:16px;background:#fffdfa;color:#263a4a;font:16px/1.5 Arial,sans-serif;min-height:125px;resize:vertical}
      .rts-panel{background:#eee8dc;border-radius:14px;padding:20px;margin-top:20px}.rts-panel p{font-size:17px;line-height:1.6;margin:0 0 12px}
      .rts-small{font:12px/1.5 Arial,sans-serif;color:#6e7980}
      .rts-selected{padding:16px;background:#eee8dc;border-left:3px solid #b18a45;border-radius:9px;margin:18px 0;font:16px/1.6 Georgia,serif;white-space:pre-wrap}.rts-see{padding-top:8px}.rts-chapter-prose{padding-top:2px}.rts-awaken-chapter .rts-prose p{font-size:16px;line-height:1.65;color:#334451;margin:0 0 18px}.rts-awaken-chapter .rts-hero{height:118px;border-radius:14px;margin-bottom:22px}.rts-awaken-next{margin-top:24px}.rts-awaken-next .rts-back{display:block;margin-top:2px}.rts-see p{font-size:16px;line-height:1.65;color:#334451;margin:0 0 18px}.rts-see blockquote{margin:24px 0;padding:15px 18px;border-left:3px solid #b18a45;background:#f0e8da;font:italic 20px/1.45 Georgia,serif}.rts-chapter-art{height:118px;border-radius:14px;background:linear-gradient(110deg,#263a4a,#4c6570 62%,#bd9c60);display:flex;align-items:center;justify-content:space-between;padding:18px 24px;margin:0 0 22px;color:#f8f5ef}.rts-chapter-art span{font:600 19px/1.12 Arial,sans-serif;letter-spacing:.16em}.rts-chapter-line{height:64px;width:64px;border:2px solid #e6c990;border-radius:50%;box-shadow:0 0 0 10px #ffffff15}.rts-chain{display:grid;gap:7px;margin:22px 0}.rts-chain span{padding:11px 15px;background:#eee8dc;border-left:3px solid #b18a45;border-radius:6px;font:600 15px Arial,sans-serif}.rts-prompt{font-weight:bold}.rts-wide{width:100%;margin:14px 0 22px}.rts-finish{padding:22px 18px;background:#eee8dc;border-radius:14px;margin:24px 0}.rts-finish h2{font:normal 25px/1.25 Georgia,serif;margin:0 0 14px}.rts-completion{padding:24px 0}.rts-completion p{font-size:17px;line-height:1.6;margin:0 0 20px}.rts-completion .rts-button{display:block;margin:15px 0}.rts-complete{display:block;width:100%;margin-top:20px}.rts-stage-label{font:600 11px/1.5 Arial,sans-serif;color:#967640;letter-spacing:.1em;margin:0 0 8px}
      /* Keep Introduction and Awaken reading chapters in the same typographic
         system as the See Clearly chapters. */
      .rts-reading-chapter{padding-top:8px}
      .rts-chapter-art--opening{background:linear-gradient(110deg,#263a4a,#526f70 62%,#bd9c60)}
      .rts-chapter-art--awaken{background:linear-gradient(110deg,#263a4a,#526b61 62%,#bd9c60)}
      .rts-reading-chapter .rts-chapter-art{height:145px;margin-bottom:26px}
      .rts-reading-chapter h1{font-size:clamp(32px,7vw,44px);line-height:1.12;margin-bottom:26px}
      .rts-reading-chapter .rts-prose p{font-size:clamp(17px,4.2vw,19px);line-height:1.68;margin-bottom:24px}
      .rts-reading-chapter .rts-prose p:nth-child(2),
      .rts-reading-chapter .rts-prose p:nth-child(5){margin-bottom:28px}
      .rts-reading-chapter .rts-actions{align-items:stretch}
      .rts-reading-chapter .rts-actions .rts-button{flex:1}
      .rts-reading-chapter .rts-stage-callout{margin:24px 0;padding:18px 20px;border-left:4px solid #b18a45;background:#eee8dc;font:italic 20px/1.5 Georgia,serif}
      .rts-reading-chapter .rts-chapter-section{margin:0 0 26px}
      .rts-reading-chapter .rts-chapter-section p{margin-bottom:24px}
      .rts-reading-chapter .rts-chapter-section--opening{padding-bottom:10px}
      .rts-reading-chapter blockquote{margin:24px 0;padding:15px 18px;border-left:3px solid #b18a45;background:#f0e8da;font:italic 20px/1.45 Georgia,serif}
      
      .rts-reading-chapter .rts-prose p{font-size:16px;line-height:1.65;color:#334451;margin:0 0 18px}
      .rts-reading-chapter .rts-hero{height:118px;border-radius:14px;margin-bottom:22px;object-fit:cover}
      .rts-reading-chapter .rts-kicker{margin-bottom:9px}
      .rts-reading-chapter .rts-divider{margin:24px 0 18px}
      .rts-reading-chapter .rts-actions{margin-top:24px}
      /* Each teaching screen has a distinct visual rhythm; the underlying copy stays unchanged. */
      .rts-scene{padding-top:10px}
      .rts-scene h1{margin-bottom:25px}
      .rts-scene>p:not(.rts-kicker){max-width:56ch}
      .rts-scene--5 .rts-chapter-art{height:156px}
      .rts-scene--5 blockquote{background:#e9eee9;border-left-color:#58736e}
      .rts-scene--6 .rts-chain{display:flex;flex-direction:column;gap:0;margin:28px auto 30px;max-width:500px}
      .rts-scene--6 .rts-chain-step{position:relative;box-sizing:border-box;width:100%;background:#e7ebe8;border:1px solid #c7d1cc;border-left:4px solid #658176;border-radius:12px;padding:18px 20px}
      .rts-scene--6 .rts-chain-step:not(:last-child){margin-bottom:36px}
      .rts-scene--6 .rts-chain-step:not(:last-child)::before{content:"";position:absolute;left:50%;top:100%;height:36px;width:2px;background:#658176;transform:translateX(-50%)}
      .rts-scene--6 .rts-chain-step:not(:last-child)::after{content:"";position:absolute;left:50%;bottom:-35px;width:10px;height:10px;border-right:2px solid #658176;border-bottom:2px solid #658176;transform:translateX(-50%) rotate(45deg)}
      .rts-scene--6 .rts-chain-step strong{display:block;font:700 17px/1.35 Arial,sans-serif;color:#263a4a;margin-bottom:8px}
      .rts-scene--6 .rts-chain-step p{font:16px/1.55 Georgia,serif;color:#334451;margin:0}
      .rts-scene--7 .rts-prompt{padding:20px;border-radius:12px;background:#e8ece8;border-left:4px solid #54746d;font:normal 22px/1.4 Georgia,serif}
      .rts-scene--8 .rts-question-study{border-top:1px solid #cdbb9d;border-bottom:1px solid #cdbb9d;padding:17px 0 0;margin:26px 0;background:linear-gradient(90deg,#f0e8d9,transparent)}
      .rts-scene--8 .rts-question-study p{padding:0 18px}
      .rts-scene--8 blockquote{background:#263a4a;color:#fff;border-left-color:#c7a35d;border-radius:0 12px 12px 0}
      .rts-scene--9 .rts-belief-contrast{background:#e5ebe9;border-radius:14px;padding:20px 20px 1px;margin:24px 0}
      .rts-scene--9 blockquote{background:transparent;border-top:2px solid #b18a45;border-bottom:2px solid #b18a45;border-left:0;padding:22px 8px;text-align:center}
      .rts-scene--10 .rts-example-panel{background:#ece6da;padding:21px 20px 1px;border-radius:14px;margin:24px 0}
      .rts-scene--10 blockquote{background:none;border-left:0;border-top:1px solid #b18a45;border-bottom:1px solid #b18a45;text-align:center;padding:20px 8px}
      .rts-scene--11 .rts-turning-point{background:#e6ece9;border-radius:14px;padding:22px 20px 1px;margin:24px 0;border-left:4px solid #648078}
      .rts-scene--11 .rts-finish{background:#263a4a;color:#fff}
      .rts-scene--11 .rts-finish h2,.rts-scene--11 .rts-finish p{color:#fff}
      .rts-become-hero{border-radius:16px;background:linear-gradient(120deg,#233a49,#496b6b 65%,#b79a63);padding:30px 24px;color:white;margin-bottom:30px}
      .rts-become-hero span{font:700 23px/1.2 Arial,sans-serif;letter-spacing:.16em}
      .rts-become-steps{display:grid;gap:12px;margin:28px 0}
      .rts-become-step{padding:20px;border-radius:12px;background:#e8ece8;border-left:4px solid #648078}
      .rts-become-step strong{display:block;font:700 17px/1.3 Arial,sans-serif;color:#263a4a;margin-bottom:8px}
      .rts-become-step p{margin:0!important}
      .rts-become-focus{background:#263a4a;color:white;border-radius:14px;padding:24px;margin:28px 0}
      .rts-become-focus p{color:white!important;margin:0!important}
      .rts-become-note{border-top:2px solid #b18a45;border-bottom:2px solid #b18a45;padding:22px 4px;margin:25px 0}
      .rts-become-contrast{padding:20px;background:#eee8dc;border-radius:14px;margin:25px 0}
      .rts-become-contrast p{margin:0!important}
      /* Consistent journey chrome, rhythm and responsive alignment across all stages. */
      .rts-shell{padding-top:max(18px,env(safe-area-inset-top));padding-bottom:max(76px,env(safe-area-inset-bottom))}
      .rts-header{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"brand logo" "restart restart";align-items:center;column-gap:12px;row-gap:10px;margin-bottom:22px}
      .rts-header>span{grid-area:brand;min-width:0}
      .rts-tree-logo{grid-area:logo;max-width:100%;width:112px;height:auto}
      .rts-restart{grid-area:restart;justify-self:start;min-height:38px}
      .rts-breadcrumbs{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin:0 0 12px;font:600 11px/1.5 Arial,sans-serif;letter-spacing:.11em;color:#977744}
      .rts-breadcrumbs strong{color:#263a4a;font-weight:700;letter-spacing:.04em}
      .rts-progress{margin:0 0 15px}
      .rts-screen-location{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 0 25px;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.12em;color:#8c744f}
      .rts-screen-location span:last-child{letter-spacing:.05em;font-variant-numeric:tabular-nums}
      .rts-reading-chapter,.rts-scene,.rts-completion{padding-top:0}
      .rts-root h1{margin-top:0;margin-bottom:25px}
      .rts-kicker{margin:0 0 15px;line-height:1.5}
      .rts-reading-chapter .rts-prose p{font-size:16px;line-height:1.65;margin-bottom:20px}
      .rts-reading-chapter .rts-chapter-art,.rts-scene .rts-chapter-art,.rts-become-hero{margin-top:0}
      .rts-see>.rts-button.rts-wide,.rts-awaken-next .rts-wide{display:block;margin-top:32px}
      .rts-scene>.rts-back,.rts-join>.rts-back{display:block;margin-top:4px;margin-bottom:15px}
      .rts-finish .rts-button{margin-top:10px}
      .rts-root button:focus-visible{outline:3px solid #b18a45;outline-offset:3px}
      @media(min-width:520px){.rts-header{grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"brand restart logo";margin-bottom:24px}.rts-restart{justify-self:end}}
      @media(max-width:380px){.rts-header>span{font-size:10px;letter-spacing:.07em}.rts-tree-logo{width:100px}.rts-breadcrumbs{font-size:10px}}
      .rts-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
      .rts-header .rts-tree-logo{order:2;width:120px;max-height:50px}
      .rts-header .rts-restart{order:1;background:transparent;border:0;padding:9px 0;color:#52636d;font:600 12px/1.4 Arial,sans-serif;text-align:left}
      .rts-chapter-art,.rts-reading-chapter .rts-chapter-art,.rts-scene--5 .rts-chapter-art,.rts-become-hero{box-sizing:border-box;height:145px;border-radius:14px;background:linear-gradient(110deg,#263a4a,#526f70 62%,#bd9c60);padding:24px;margin:0 0 26px;display:flex;align-items:center;justify-content:space-between}
      .rts-chapter-art span,.rts-become-hero span{font:700 19px/1.15 Arial,sans-serif;letter-spacing:.15em;color:#f8f5ef}
      .rts-root .rts-back{display:inline-block;width:auto;background:transparent!important;border:0!important;color:#52636d!important;text-align:left;font:600 14px/1.5 Arial,sans-serif;min-height:40px;padding:9px 0!important;box-shadow:none}
      .rts-teaching-emphasis{background:#e7ebe8;border-left:4px solid #658176;border-radius:12px;padding:18px 20px;margin:26px 0}
      .rts-teaching-emphasis p{color:#334451!important;margin:0!important}
      .rts-transition-summary{border-top:2px solid #b18a45;border-bottom:1px solid #d9d1c5;padding:20px 0;margin:25px 0}
      .rts-transition-summary h2{font:normal 25px/1.3 Georgia,serif;color:#263a4a;margin:0 0 12px}
      .rts-transition-summary p{margin:0!important}
      @media(max-width:380px){.rts-header .rts-tree-logo{width:105px}.rts-header .rts-restart{font-size:11px}}
      .rts-scripture{background:#f0ebe1;border-left:3px solid #b18a45;border-radius:10px;padding:20px;margin:28px 0}
      .rts-scripture>span{display:block;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.12em;color:#8d6d3a;margin-bottom:13px}
      .rts-scripture blockquote{background:transparent!important;border:0!important;border-radius:0!important;padding:0!important;margin:0 0 16px!important;color:#263a4a!important;font:italic 19px/1.5 Georgia,serif!important}
      .rts-scripture p{margin:0!important;font-size:16px!important;line-height:1.65!important}
      .rts-subheading{font:normal 25px/1.3 Georgia,serif;margin:28px 0 16px}
      .rts-reveal-card{background:#fffdfa;border:1px solid #d9d1c5;border-radius:12px;margin:10px 0;overflow:hidden;transition:border-color .2s,background-color .2s}
      .rts-reveal-card--open{border-color:#a47c36;background:#f5eee3}
      .rts-reveal-trigger{width:100%;min-height:58px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px;text-align:left;background:transparent;border:0;color:#263a4a;font:16px/1.4 Arial,sans-serif;cursor:pointer}
      .rts-reveal-trigger:focus-visible{outline:3px solid #b18a45;outline-offset:-4px}
      .rts-reveal-icon{flex:none;font:24px/1 Arial,sans-serif;color:#94723d}
      .rts-reveal-content{padding:0 17px 19px;animation:rts-reveal-in .22s ease-out}
      .rts-reveal-content p{font:16px/1.6 Georgia,serif;color:#334451;margin:2px 0 12px}
      .rts-reveal-content>span{display:block;font:12px/1.5 Arial,sans-serif;color:#65737b}
      @keyframes rts-reveal-in{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
      @media(prefers-reduced-motion:reduce){.rts-reveal-card,.rts-reveal-content{animation:none;transition:none}}
      .rts-part-intro{background:#e7ebe8;border-left:4px solid #658176;border-radius:12px;padding:20px;margin:8px 0 27px}
      .rts-part-intro strong{font:700 12px/1.4 Arial,sans-serif;letter-spacing:.12em;color:#263a4a}
      .rts-part-intro p{margin:12px 0 0!important}
      @media(min-width:700px){.rts-shell{padding-top:38px}.rts-prose p{font-size:18px}}
      @media(max-width:350px){.rts-shell{padding-left:17px;padding-right:17px}.rts-prose p{font-size:16px}}
    `}</style>
    <div className="rts-shell">
      <header className="rts-header"><button type="button" className="rts-restart" onClick={()=>{setReflectionStep(0);advance(0)}}>← Back to beginning</button><img className="rts-tree-logo" src="https://raw.githubusercontent.com/teerex-bit/rts-website/main/public/assets/logos/rts-tree-wordmark.png" alt="Tree of Life" /></header>
      <nav className="rts-breadcrumbs" aria-label="Journey location"><span>FORMATION JOURNEY</span><span aria-hidden="true">/</span><strong>{page<2?"Introduction":page>=18?"Join":page>=12?"Become":page>=5?"See Clearly":"Awaken"}</strong></nav>
      <nav aria-label="Journey stages" className="rts-progress">{["Awaken","See Clearly","Become","Join"].map((label,i)=><span key={label} className={i<=(page>=18?3:page>=12?2:page>=5?1:0)?"active":""} aria-label={label+(i===(page>=18?3:page>=12?2:page>=5?1:0)?" current stage":"")} aria-current={i===(page>=18?3:page>=12?2:page>=5?1:0)?"step":undefined} title={label}/>)}</nav>
      <div className="rts-screen-location"><span>{page<2?"INTRODUCTION":page>=18?"JOIN":page>=12?"BECOME":page>=5?"SEE CLEARLY":"AWAKEN"}</span><span>{page<2? `${page+1} / 2`:page<5?`${page-1} / 3`:page<12?`${page-4} / 7`:page<18?`${page-11} / 6`:`${page-17} / 5`}</span></div>
      {reading ? <section className="rts-see rts-reading-chapter">
        <div className={`rts-chapter-art ${page===0?'rts-chapter-art--opening':'rts-chapter-art--awaken'}`} aria-hidden="true"><span>{page===0?<>THE<br/>BEGINNING</>:<>AWAKEN</>}</span><div className="rts-chapter-line"/></div>
        <h1>{chapter.title}</h1>
        <article className="rts-prose rts-chapter-prose">{chapter.paragraphs.map((p,i)=>page===2 && (i===3||i===5||i===7||i===11)?<blockquote key={i}>{p}</blockquote>:<p key={i}>{p}</p>)}</article>
        {page===2 && <div className="rts-scripture"><span>JAMES 1:19–20 · WEB</span><blockquote>“So, then, my beloved brothers, let every man be swift to hear, slow to speak, and slow to anger; for the anger of man doesn't produce the righteousness of God.”</blockquote><p>James does not merely offer a rule for managing anger. He describes a different posture toward the moment: listening before reacting. The pause creates room to notice what is rising within us and to respond rather than simply repeat a familiar pattern.</p></div>}
        {page===2 ? <div className="rts-awaken-next"><button className="rts-button rts-wide" onClick={()=>advance(3)}>Pause and notice →</button><button className="rts-button rts-back" onClick={()=>advance(1)}>← Previous</button></div> : <><div className="rts-divider"/><div className="rts-actions"><span className="rts-small">Opening · Read at your pace</span><button className="rts-button" onClick={()=>advance(1)}>Pause and notice →</button></div></>}
      </section> : page===1 ? <>
        <p className="rts-kicker">A MOMENT TO NOTICE</p><h1>What has shaped you?</h1>
        <p className="rts-hint">Much of our formation happened without our awareness. Tap an experience to explore how it can shape us. Notice what resonates with your own story; there is no right answer.</p>
        {[
          {name:'Family and upbringing',meaning:'Our earliest surroundings often teach us what feels normal, safe, and expected. We may carry those lessons into adulthood without realizing where they began.'},
          {name:'Relationships',meaning:'Relationships teach us what closeness, trust, acceptance, and rejection feel like. Over time, those experiences can shape what we expect from others, how much of ourselves we reveal, and how we respond when connection feels uncertain.'},
          {name:'Success or failure',meaning:'Success can teach us to associate worth with achievement. Failure can make us hesitant to try again. Neither experience has to define us, but both can influence what we believe about ourselves.'},
          {name:'Pain or disappointment',meaning:'Pain can leave us expecting another loss, protecting ourselves before anything has happened. Sometimes a response that once helped us endure a difficult season continues long after that season has passed.'},
          {name:'Expectations of others',meaning:'When approval or belonging seems tied to meeting someone else’s expectations, we may learn to perform, please, or hide parts of ourselves. Those habits can feel like personality rather than something we learned.'},
          {name:'Something else',meaning:'Not every formative experience fits a category. A particular season, responsibility, change, or unexpected moment may have influenced the way you see yourself, others, or God.'}
        ].map(item=><div key={item.name} className={`rts-reveal-card ${influence===item.name?'rts-reveal-card--open':''}`}>
          <button type="button" className="rts-reveal-trigger" aria-expanded={influence===item.name} onClick={()=>setInfluence(influence===item.name?'':item.name)}>
            <span>{item.name}</span><span className="rts-reveal-icon" aria-hidden="true">{influence===item.name?'−':'+'}</span>
          </button>
          {influence===item.name&&<div className="rts-reveal-content"><p>{item.meaning}</p></div>}
        </div>)}
        <div className="rts-actions"><button className="rts-button rts-back" onClick={()=>advance(0)}>← Back</button><button className="rts-button" onClick={()=>advance(2)}>Continue →</button></div>
        <p className="rts-small">You may explore as many as you like, or continue without choosing.</p>
      </> : page===4 ? <section className="rts-completion">
        <p className="rts-kicker">AWAKEN · COMPLETED</p><h1>The Beginning of Awareness</h1>
        <p>You may not yet understand why you respond the way you do. That is all right. Awaken is not about figuring everything out. It is about beginning to notice what was previously invisible.</p>
        <p>Once we can see what is happening within us, we can begin exploring what is underneath it.</p>
        <button className="rts-button" onClick={()=>advance(5)}>Continue to See Clearly →</button>
        <button className="rts-button rts-back" onClick={()=>advance(3)}>← Revisit your reflection</button>
      </section> : page>=5 && page<=11 ? <section className={`rts-see rts-scene rts-scene--${page}`}>
        {page===5 ? <>
          <div className="rts-chapter-art" aria-hidden="true"><span>SEE<br/>CLEARLY</span><div className="rts-chapter-line"/></div>
          <p className="rts-kicker">PART I · SEE YOURSELF CLEARLY</p><h1>Then We Learn to See Clearly</h1>
          <p>Our behavior does not come from nowhere. Beneath our reactions are beliefs, expectations, desires, fears, assumptions, and intentions. We do what we do because, at some level, our response makes sense to the person we have become.</p>
          <p>This is why simply telling ourselves to behave differently often produces disappointing results. We may know that we should not be anxious and still experience anxiety. We may know that we should forgive and still carry resentment. We may know that God can be trusted while desperately trying to control an outcome.</p>
          <blockquote>The problem is not necessarily that we do not know the correct answer. Something deeper may be happening.</blockquote>
          <p>Awaken taught us to notice what is happening. See Clearly begins examining what is happening underneath—and what we actually believe to be true.</p>
          <div className="rts-scripture"><span>ROMANS 12:2 · WEB</span><blockquote>“Don’t be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what is the good, well-pleasing, and perfect will of God.”</blockquote><p>Paul describes transformation as something deeper than modifying outward behavior. The mind must be renewed. That includes learning to recognize the interpretations and assumptions we have mistaken for truth. We are not simply collecting better ideas; we are learning to see life differently in God's presence.</p></div>
          <p>When a reaction seems automatic, we can assume it reveals who we are. But a familiar response is not necessarily our identity. It may be something we learned to expect, protect, or repeat. The distinction matters: what has been formed within us can also be brought into the light and re-formed.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(6)}>Look beneath the response →</button>
        </> : page===6 ? <>
          <p className="rts-kicker">PART I · SEE YOURSELF CLEARLY · THE INNER PATH</p><h1>What We See Shapes What We Become</h1>
          <p>What we see shapes what we believe. What we believe shapes what we expect. What we expect influences what we desire. What we desire influences what we intend.</p>
          <div className="rts-chain" aria-label="From perception to a way of life"><div className="rts-chain-step"><strong>What I see</strong><p>An event happens, but I do not encounter it without interpretation. I notice certain details and give them meaning.</p></div><div className="rts-chain-step"><strong>What I believe</strong><p>The meaning I give that event reinforces something I hold to be true about myself, others, or God.</p></div><div className="rts-chain-step"><strong>What I expect</strong><p>What I believe shapes what I anticipate will happen next. I begin preparing for that expected outcome.</p></div><div className="rts-chain-step"><strong>What I desire</strong><p>My expectations awaken a desire: to feel safe, be accepted, stay in control, or receive something I think I need.</p></div><div className="rts-chain-step"><strong>What I intend</strong><p>That desire gives direction to my will. I begin forming a plan to secure what I want or avoid what I fear.</p></div><div className="rts-chain-step"><strong>What I choose</strong><p>My intention becomes visible in a decision: what I say, what I withhold, how I respond, or what I do.</p></div><div className="rts-chain-step"><strong>How I live</strong><p>As choices are repeated, they become familiar patterns. What began as a way of seeing becomes a way of living.</p></div></div>
          <div className="rts-scripture"><span>PROVERBS 4:23 · WEB</span><blockquote>“Keep your heart with all diligence, for out of it is the wellspring of life.”</blockquote><p>The heart in biblical language is not merely a place for feelings. It includes the inner life from which our desires, judgments, and choices emerge. That is why the formation chain matters: behavior is often the visible expression of something already taking shape beneath the surface.</p></div>
          <p>Consider a simple interruption. Someone changes a plan without asking you. The observable fact is that the plan changed. The meaning you assign might be that your needs do not matter. From there you may expect to be overlooked, desire to regain control, intend to confront or withdraw, and choose words that protect you. Yet another interpretation could lead to a different response. The point is not to insist that one explanation is correct, but to recognize that the event and the meaning you gave it are not identical.</p>
          <p>Our intentions shape our choices, and our repeated choices eventually become the way we live. So Reforming the Soul begins looking underneath behavior, rather than merely trying to correct it.</p>
          <p>Maybe what appears to be anger is actually self-protection. Perhaps what looks like ambition is being fueled by a need for approval. What looks like independence may actually reveal how difficult it is for us to trust someone else.</p>
          <p>Changing an action is not always the same as changing the person from whom the action comes. We can restrain a response while continuing to hold the belief that produced it.</p>
          <h2 className="rts-subheading">When a belief becomes an identity</h2>
          <p>We do not only form opinions about events. Over time we also form a story about ourselves: I am the responsible one. I am the one people leave. I have to be useful to be wanted. I must never make a mistake. A story repeated often enough can begin to feel like a fact, even when it was first learned in a particular season of life.</p>
          <p>This is where performance, guilt, and self-protection can become intertwined. If my acceptance depends on being right, correction feels threatening. If my value depends on being needed, another person's independence may feel like rejection. If I have learned to expect disappointment, I may withdraw before anyone has had the opportunity to love me well. These are possible patterns, not labels we should assign to ourselves or others.</p>
          <div className="rts-scripture"><span>EPHESIANS 2:8–10 · WEB</span><blockquote>“For by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works, that no one would boast. For we are his workmanship, created in Christ Jesus for good works”</blockquote><p>Paul puts belonging and God's workmanship before the good works that follow. Our actions matter, but they do not purchase our place with Him. Grace does not make faithful living irrelevant; it changes where faithful living comes from. We do not have to perform our way into an identity God gives us in Christ.</p></div>
          <h2 className="rts-subheading">Guilt, shame, and the invitation to return</h2>
          <p>Guilt can direct our attention toward something we have done that needs to be acknowledged and repaired. Shame often moves further, persuading us that the failure tells the whole truth about who we are. One can lead toward confession and restoration; the other can tempt us to hide, defend, or despair. Scripture does not ask us to deny responsibility. It invites us to bring responsibility into the light of mercy rather than build our identity around failure.</p>
          <p>In Genesis 3:8–10, the humans hide after their disobedience. Their actions have consequences, but hiding also changes how they approach God's presence. The question for formation is not only what went wrong. It is whether we will continue relating to God through concealment or learn to come into the light where truth and mercy can meet.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(7)}>Look at a real experience →</button>
        </> : page===7 ? <>
          <p className="rts-kicker">PART I · SEE YOURSELF CLEARLY</p><h1>Look Beneath Your Response</h1>
          <p>Return to the experience you noticed in Awaken. Instead of deciding whether your response was good or bad, look beneath it. What did you believe was happening? What did you expect? What did you want to secure or avoid?</p>
          <p className="rts-prompt">What did that moment seem to say about you, the other person, or God?</p>
          <textarea className="rts-field" aria-label="See Clearly reflection" placeholder="Notice a belief or expectation, without forcing an answer…" value={clearResponse} onChange={e=>setClearResponse(e.target.value)}/>
          <p className="rts-small">You may leave this blank and continue. Your answer is not analyzed or interpreted automatically.</p>
          <div className="rts-scripture"><span>2 CORINTHIANS 10:5 · WEB</span><blockquote>“bringing every thought into captivity to the obedience of Christ”</blockquote><p>This phrase belongs to Paul's discussion of arguments and claims raised against the knowledge of God. It is not an invitation to obsess over every passing thought. Here it reminds us that what feels persuasive within us still needs to be brought into relationship with Christ and tested against what is true.</p></div>
          <p>One helpful distinction is between what happened, what I concluded, and what I know. These may overlap, but they are not interchangeable. Sometimes clarity begins when we admit, “I know what happened, but I do not yet know what it meant.”</p>
          <h2 className="rts-subheading">Independence can look like strength</h2>
          <p>Some of the habits we admire most can also keep us from receiving. Being capable, responsible, prepared, or dependable is not itself a problem. Yet when we believe we must always be sufficient for ourselves, dependence begins to feel like weakness. We can even bring that posture into prayer: asking God to bless what we have already decided rather than making room to listen.</p>
          <div className="rts-scripture"><span>JOHN 15:4–5 · WEB</span><blockquote>“Remain in me, and I in you. As the branch can’t bear fruit by itself unless it remains in the vine, so neither can you, unless you remain in me.”</blockquote><p>Jesus describes fruitfulness as the outcome of abiding, not independent achievement. A branch does not create life by trying harder to look alive. It receives life through connection. In the same way, formation is not a project in which we become self-sufficient Christians; it is learning to live from the life of Christ.</p></div>
          <p>That is a deeper kind of clarity: recognizing not only what I do when I am afraid, but also the picture of life I have trusted. Am I trying to secure myself through control, approval, and performance, or learning to receive my life with God?</p>
          <button className="rts-button rts-wide" onClick={()=>advance(8)}>Continue to what you believe about God →</button>
        </> : page===8 ? <>
          <p className="rts-kicker">PART II · SEE GOD CLEARLY</p><div className="rts-part-intro"><strong>SEE GOD CLEARLY</strong><p>We have begun examining the person we have become. Now we turn toward the One we are learning to trust. What we believe about God shapes what we expect from Him, and those expectations influence how we live with Him.</p></div><h1>What Do I Actually Believe About God?</h1>
          <p>Eventually, looking beneath our responses brings us to an even deeper question: What do I actually believe about God? Not simply what have I been taught about God, but what do I expect from Him when life is not going the way I want?</p>
          <div className="rts-question-study"><p>What do I expect from Him when I am disappointed? Do I believe He is good when He allows something I desperately wanted to avoid? Do I experience Him as a Father who wants me, or as someone constantly evaluating my performance?</p>
          <p>Do I believe His acceptance must somehow be maintained through my behavior? Can I trust Him when I cannot understand what He is doing?</p></div>
          <blockquote>Knowing what Christians say about God is not necessarily the same as living from what we believe about Him.</blockquote>
          <p>These are not questions for judging ourselves. They help us recognize the expectations we actually bring into our relationship with God.</p>
          <div className="rts-scripture"><span>JOHN 14:9 · WEB</span><blockquote>“He who has seen me has seen the Father.”</blockquote><p>Jesus makes an extraordinary claim: the Father is not an unknown character behind Jesus whose disposition we must guess. If our inherited picture of God conflicts with the character Jesus reveals, that picture deserves to be examined. Jesus is not persuading a reluctant Father to love us; He is revealing the Father who sent Him.</p></div>
          <p>Some of us can say that God loves us while living as though His welcome depends on how well we performed that day. Others believe He is sovereign but experience His authority primarily as control. The tension between what we confess and what we expect is not a reason for shame. It is a place where truth can begin to reshape relationship.</p>
          <h2 className="rts-subheading">How our picture of God is formed</h2>
          <p>Our experience of authority often gives us an early vocabulary for understanding God. A distant parent, unpredictable leader, demanding religious environment, or season of unanswered prayer can influence what we anticipate from Him. Those experiences deserve honesty, but none is sufficient to define the Father. Even positive experiences can give us only a partial picture.</p>
          <p>We might approach Him as disappointed before we have spoken, controlling before we have listened, or merely tolerating us until we improve. Such assumptions shape prayer and surrender. It is difficult to release control to someone we secretly believe is unkind. It is difficult to receive love while assuming every gift creates a debt.</p>
          <div className="rts-scripture"><span>LUKE 15:20 · WEB</span><blockquote>“But while he was still far off, his father saw him, and was moved with compassion, and ran, and fell on his neck, and kissed him.”</blockquote><p>In Jesus' parable, the returning son's prepared speech does not create the father's compassion. The father's welcome meets him while he is still far away. The story does not erase the son's choices; it reveals a love that is already moving toward restoration. It challenges the picture of a father whose affection must first be earned back.</p></div>
          <button className="rts-button rts-wide" onClick={()=>advance(9)}>See the Father through Jesus →</button>
        </> : page===9 ? <>
          <p className="rts-kicker">PART II · SEE GOD CLEARLY · JESUS AS OUR LENS</p><h1>Learning to See God as He Is</h1>
          <p>This is the work of See Clearly. We begin examining what we believe about ourselves and what we believe about God. Jesus becomes the lens through which we learn to see the Father.</p>
          <div className="rts-belief-contrast"><p>We may have learned to approach God as distant, disappointed, controlling, unpredictable, or merely tolerating us. Those expectations can shape how we pray, how we respond to difficulty, and whether we trust Him with what matters most.</p></div>
          <p>Jesus does not simply give us another set of instructions. He reveals the Father's character. We can bring our inherited assumptions into the light of His life, His words, and the way He receives people.</p>
          <blockquote>Jesus is not the exception to what God is like. He is the revelation of what God is like.</blockquote>
          <p>Grace begins replacing our need to earn. Dependence begins replacing independence. Surrender begins challenging self-protection. We begin learning to trust the One we are actually coming to know.</p>
          <div className="rts-scripture"><span>HEBREWS 1:3 · WEB</span><blockquote>“His Son is the radiance of his glory, the very image of his substance”</blockquote><p>Jesus does more than offer information about God. His life makes the Father's character visible. We can therefore examine our assumptions in light of how Jesus responds to the fearful, the ashamed, the self-righteous, the overlooked, and those who fail. His compassion never requires us to pretend sin is harmless; His truth never requires us to imagine the Father is less loving than the Son.</p></div>
          <p>To see God clearly is not to resolve every mystery about His providence or explain every disappointment. It is to know where to look when our circumstances seem to contradict His goodness. We return to Jesus, who reveals the Father's heart and invites us into trust before we can control the outcome.</p>
          <h2 className="rts-subheading">Jesus reveals more than a reassuring idea</h2>
          <p>When Jesus touches those considered unclean, eats with people others reject, challenges religious performance, and forgives those who have failed, He is not temporarily suspending the Father's character. He is making that character known. His mercy is neither indifference to truth nor a reward for having already become worthy. He meets people in truth and calls them into life.</p>
          <div className="rts-scripture"><span>JOHN 5:19 · WEB</span><blockquote>“The Son can do nothing of himself, but what he sees the Father doing. For whatever things he does, these the Son also does likewise.”</blockquote><p>Jesus' dependence on the Father is not merely an example of restraint. It reveals a life of attentive communion. He acts from relationship, not from a separate agenda. If Jesus lives in such union with the Father, then our formation cannot be reduced to following religious instructions from a distance.</p></div>
          <h2 className="rts-subheading">Trust does not require an explanation for everything</h2>
          <p>Seeing God clearly does not mean every painful event becomes understandable. Scripture gives voice to lament, confusion, and waiting. The invitation is not to manufacture certainty about what God is doing. It is to learn the character of the One with whom we walk, so that unanswered questions do not have to become the final authority over our relationship with Him.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(10)}>From understanding to trust →</button>
        </> : page===10 ? <>
          <p className="rts-kicker">PART II · SEE GOD CLEARLY · WHAT IS TRUE</p><h1>Understanding Where It Came From</h1>
          <p>Awaken made it possible to say, “I know what I did.” See Clearly invites us to go further: “I am starting to understand where that came from, and I am learning what is actually true.”</p>
          <div className="rts-example-panel"><p>We may recognize that an angry response came from fear, that our need to control came from an expectation of abandonment, or that our desire for approval has shaped the way we relate to others. That recognition matters, but the goal is not to become experts at explaining ourselves.</p></div>
          <p>We are learning to see ourselves and God truthfully, so that our relationship with Him can be lived from trust rather than fear, performance, or self-protection.</p>
          <blockquote>Clarity precedes obedience.</blockquote>
          <p>But even clear understanding is not the same as becoming the kind of person who naturally lives from what is true.</p>
          <h2 className="rts-subheading">From an inherited picture to a living relationship</h2>
          <p>There is a difference between agreeing that God is good and beginning to entrust a particular fear to Him. There is a difference between saying we are accepted in Christ and refusing to let failure drive us into hiding. In both cases, truth is moving from a statement we affirm toward a relationship we actually inhabit.</p>
          <div className="rts-scripture"><span>2 CORINTHIANS 3:18 · WEB</span><blockquote>“But we all, with unveiled face seeing the glory of the Lord as in a mirror, are transformed into the same image from glory to glory, even as from the Lord, the Spirit.”</blockquote><p>Paul connects beholding and becoming. Transformation is not merely the product of examining ourselves more accurately; it comes as we turn toward the Lord. Seeing ourselves truthfully matters, but we are not the center of the process. The Spirit reforms us as we learn to live in His presence.</p></div>
          <button className="rts-button rts-wide" onClick={()=>advance(11)}>Complete See Clearly →</button>
        </> : <>
          <p className="rts-kicker">SEE CLEARLY · SECTION COMPLETE</p><h1>Truth Has to Become a Way of Living</h1>
          <p>Suppose I recognize that my need to control a situation comes from fear. I understand the fear. I recognize the false belief beneath it. I genuinely believe God can be trusted.</p>
          <div className="rts-turning-point"><p>Then tomorrow something happens that I cannot control. What happens next?</p></div>
          <p>That moment is where spiritual formation moves from an idea into an actual life. Seeing truth is different from becoming the kind of person who naturally lives from it.</p>
          <p>This is where Become begins: learning to live with God in the ordinary moments that reveal the person we are becoming.</p>
          <div className="rts-transition-summary"><h2>Clarity opens the way to becoming.</h2><p>The next movement is Become, where awareness and trust take shape in daily life.</p></div><button className="rts-button rts-wide" onClick={()=>advance(12)}>Begin Become →</button>
        </>}
        {page>5&&<button className="rts-button rts-back" onClick={()=>advance(page-1)}>← {page===11?"Revisit the teaching":"Previous"}</button>}
      </section> : page>=12 && page<=17 ? <section className={`rts-see rts-scene rts-become rts-scene--${page}`}>
        {page===12 ? <>
          <div className="rts-become-hero"><span>03 / BECOME</span></div>
          <p className="rts-kicker">BECOME · TRUTH BECOMES LIFE</p><h1>Truth Has to Become a Way of Living</h1>
          <p>This is where Become begins.</p>
          <p>Suppose I recognize that my need to control a situation comes from fear. I understand the fear. I recognize the false belief beneath it. I genuinely believe God can be trusted.</p>
          <div className="rts-become-focus"><p>Then tomorrow something happens that I cannot control. What happens next?</p></div>
          <p>That moment is where spiritual formation moves from an idea into an actual life.</p>
          <p>Reforming the Soul teaches a simple pattern for these moments:</p>
          <div className="rts-become-steps"><div className="rts-become-step"><strong>01 · Release control</strong></div><div className="rts-become-step"><strong>02 · Receive the moment</strong></div><div className="rts-become-step"><strong>03 · Take the next right step</strong></div><div className="rts-become-step"><strong>04 · Repeat</strong></div></div>
          <button className="rts-button rts-wide" onClick={()=>advance(13)}>Live the pattern →</button>
        </> : page===13 ? <>
          <p className="rts-kicker">BECOME · RELEASE AND RECEIVE</p><h1>Release Control. Receive the Moment.</h1>
          <div className="rts-become-step"><strong>Release control</strong><p>I release my demand that this situation must turn out the way I want before I can be okay.</p></div>
          <p>Recognizing our need for control is not the same as surrendering it. We can understand the fear beneath our reactions and still demand that events unfold according to our expectations. Releasing control means giving up the claim that our preferred outcome must happen before we can trust God.</p><p>We can still name what we want, make responsible decisions, and act with courage. Surrender is not abandoning our will. It is choosing to bring our will into relationship with God's will, without insisting that we already know the best outcome.</p><p>Then I receive the moment.</p>
          <p>Receiving the moment does not mean pretending that everything happening to us is good. It does not mean becoming passive or refusing to change something that should be changed. It means acknowledging that this is the moment in which I am presently living with God.</p>
          <div className="rts-become-note"><p>If God has allowed this moment to reach me, then this moment cannot prevent Him from forming me through it.</p></div>
          <p>Receiving the moment also means paying attention to what it reveals. An interruption may uncover impatience, disappointment may expose our demand for certainty, and another person's words may reveal how deeply we seek approval. We do not need to hide those discoveries or immediately fix ourselves. We can bring them into our relationship with God.</p>
          <p>As we become present to Him, the moment is no longer only a problem to solve. It becomes an opportunity to listen, to see ourselves truthfully, and to respond from trust instead of fear.</p>
          <p>That changes the question.</p>
          <div className="rts-become-contrast"><p>Instead of asking only, How do I get out of this? I can begin asking, What does faithfulness look like here?</p></div>
          <button className="rts-button rts-wide" onClick={()=>advance(14)}>Take the next right step →</button>
        </> : page===14 ? <>
          <p className="rts-kicker">BECOME · FAITHFULNESS IN THE PRESENT</p><h1>Take the Next Right Step. Repeat.</h1>
          <p>Then I take the next right step.</p>
          <div className="rts-teaching-emphasis"><p>Not the next twenty steps. Not the step that guarantees the outcome I want. Not the step that removes every uncertainty.</p></div>
          <p>Just the next faithful step available to me.</p>
          <p>Releasing control and receiving the moment prepare us to act differently. Instead of letting fear, the need for approval, or the demand for certainty decide our response, we can consider what love, truth, and faithfulness require in the situation actually before us.</p>
          <p>The next right step might mean listening before defending ourselves, speaking honestly without trying to manage another person's reaction, apologizing, setting a necessary boundary, or patiently completing an ordinary responsibility. It may be difficult, and it may not produce the result we hoped for. Its value lies in responding faithfully, not in guaranteeing an outcome.</p>
          <p>This is where trust becomes visible. We cannot always choose our circumstances, but we can increasingly learn to choose how we participate with God within them.</p>
          <p>And then I repeat the process.</p>
          <p>That last part matters.</p>
          <p>A single moment of surrender does not instantly undo years of familiar responses. The same fears and desires may surface again tomorrow. Repeating the pattern is not a sign that we have failed; it is how a different way of living becomes familiar.</p>
          <p>With practice we begin to notice sooner, release our demands more readily, and respond with greater freedom. The aim is not perfect performance. It is becoming a person who naturally turns toward God in the ordinary movement of life, rather than treating His presence as something reserved for exceptional moments.</p>
          <p>We repeat because formation happens through living. Tomorrow will bring another person, another inconvenience, another disappointment, another opportunity, another fear, another decision, or another ordinary moment in which the person we have become will show up.</p>
          <p>And when that happens, we practice again.</p>
          <div className="rts-become-steps">{['Release control.','Receive the moment.','Take the next right step.','Repeat.'].map((step,i)=><div className="rts-become-step" key={step}><strong>{String(i+1).padStart(2,'0')} · {step}</strong></div>)}</div>
          <button className="rts-button rts-wide" onClick={()=>advance(15)}>Notice what changes →</button>
        </> : page===15 ? <>
          <p className="rts-kicker">BECOME · THE SLOW WORK OF FORMATION</p><h1>Slowly, Something Begins to Happen</h1>
          <p>What once required enormous effort becomes a little more natural. Situations that once controlled us begin losing some of their power. We notice ourselves sooner. We surrender more readily. We recover from our reactions faster. We become less dependent on circumstances being arranged exactly as we want them.</p>
          <div className="rts-become-contrast"><p>Our relationships begin changing because we are changing.</p></div>
          <p>Our bodies learn different responses. Our wills become stronger in different directions. Our desires begin changing. The various parts of our lives become increasingly integrated around the life we are actually living with God.</p>
          <p>And eventually something appears that cannot be manufactured for very long: fruit.</p>
          
          <button className="rts-button rts-wide" onClick={()=>advance(16)}>Recognize the fruit →</button>
        </> : page===16 ? <>
          <p className="rts-kicker">BECOME · THE FRUIT OF A RESTORED LIFE</p><h1>What Grows from Living With God</h1>
          <p>Love becomes more natural. Peace becomes less dependent upon circumstances. Patience begins replacing the need to control. Grace begins replacing defensiveness. We become more capable of listening because we do not constantly have to protect ourselves. We become more capable of serving because we need less recognition in return.</p>
          <div className="rts-become-steps">{['Love','Peace','Patience','Grace','Listening','Serving'].map(item=><div className="rts-become-step" key={item}><strong>{item}</strong></div>)}</div>
          <p>This is what it means to Become.</p>
          <div className="rts-become-note"><p>It is not pretending to be the person we think a Christian should be.</p><p>It is increasingly becoming that person.</p></div>
          <button className="rts-button rts-wide" onClick={()=>advance(17)}>Complete Become →</button>
        </> : <>
          <p className="rts-kicker">BECOME · SECTION COMPLETE</p><h1>Formation Produces Participation</h1>
          <p>And then something important changes.</p>
          <p>If Reforming the Soul ended there, it would still be incomplete.</p>
          <p>God is not restoring our souls simply so that we can become healthier versions of ourselves.</p>
          <div className="rts-become-focus"><p>A restored soul becomes available.</p></div>
          <p>This is Join.</p>
          <p>As we become less preoccupied with protecting ourselves, proving ourselves, controlling outcomes, and arranging life around our own needs, we become increasingly free to participate in what God is doing around us.</p>
          <div className="rts-finish"><h2>Become complete</h2><p>The next movement is Join.</p><button className="rts-button" onClick={()=>advance(18)}>Begin Join →</button></div>
        </>}
        {page>12&&<button className="rts-button rts-back" onClick={()=>advance(page-1)}>← Previous</button>}
      </section> : page>=18 ? <section className={`rts-see rts-scene rts-become rts-join rts-scene--${page}`}>
        {page===18 ? <>
          <div className="rts-become-hero"><span>04 / JOIN</span></div>
          <p className="rts-kicker">NOTICE WHERE GOD IS WORKING</p><h1>A Restored Soul Becomes Available</h1>
          <p>God is not restoring our souls simply so that we can become healthier versions of ourselves. The freedom we discover as we release control and learn to live with Him makes us increasingly available to others.</p>
          <p>We do not have to invent a grand assignment or prove that our lives are useful. We can begin by noticing the people, needs, and opportunities already present. An interruption may become an invitation to listen. A difficult relationship may become an opportunity to love without controlling the outcome.</p>
          <div className="rts-become-note"><p>We do not have to create God's work. We can become available to participate in it.</p></div>
          <p>Join is not another performance to master. It is what becomes possible when we are less occupied with protecting ourselves, securing recognition, and arranging life around our own needs.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(19)}>Become available →</button>
        </> : page===19 ? <>
          <p className="rts-kicker">JOIN · BECOME AVAILABLE</p><h1>Notice, Then Respond</h1>
          <p>Availability begins with attention. When we are preoccupied with our own plans, we can miss the person standing in front of us. We can learn to pause, notice what is happening, and listen for what love may require.</p>
          <p>Becoming available does not mean every problem is ours to solve. We can recognize a need without taking possession of another person's life. Sometimes the next right step is practical help; sometimes it is a conversation, a prayer, or the willingness to remain present.</p>
          <div className="rts-become-contrast"><p>We offer ourselves without claiming control of the outcome.</p></div>
          <p>We can act faithfully and allow God to remain responsible for what we cannot do. This is the same surrender we have been practicing, now expressed in the way we relate to others.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(20)}>Serve and walk with people →</button>
        </> : page===20 ? <>
          <p className="rts-kicker">JOIN · SERVE AND WALK WITH PEOPLE</p><h1>Love Without Control</h1>
          <p>Serving is not simply completing tasks for God. It is making the love we have received available to someone else. We may offer time, attention, encouragement, practical assistance, or the courage to speak truth.</p>
          <p>Walking with people requires patience. Their choices may not match our expectations and their growth may not happen on our timetable. Love can remain present without trying to force another person's transformation.</p>
          <div className="rts-become-note"><p>We can give faithfully without possessing the result.</p></div>
          <p>We can listen without immediately correcting, help without creating dependence, and speak honestly without needing to manage the response. The freedom to love this way grows as our need to be approved, needed, or in control begins to loosen.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(21)}>Give what you have received →</button>
        </> : page===21 ? <>
          <p className="rts-kicker">JOIN · GIVE WHAT YOU HAVE RECEIVED</p><h1>Live Useful, Not Indispensable</h1>
          <p>What God is forming within us is not meant to remain private. Peace becomes a steady presence for someone who is anxious. Patience makes room for another person's struggle. Grace interrupts blame. Our willingness to listen helps someone feel seen.</p>
          <p>Yet usefulness is not indispensability. We are not called to make ourselves necessary or to prove our value through constant activity. Each of us has something particular to offer, including a love only we can give, without comparison or competition.</p>
          <div className="rts-become-contrast"><p>We serve because we belong, not so that we can earn a place with God.</p></div>
          <p>We give what we have received and leave room for God to do what only He can do. Participation is an expression of relationship, not a replacement for it.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(22)}>Return to attention →</button>
        </> : <>
          <p className="rts-kicker">JOIN · RETURN TO ATTENTION</p><h1>The Journey Continues Here</h1>
          <p>Join does not bring formation to an end. Participating with God will reveal new fears, expectations, desires, and attempts to control. We may miss an opportunity, respond defensively, or make our own usefulness more important than love.</p>
          <p>When that happens, we return to attention. We notice what surfaced, see it more clearly, and practice living with God again. The journey is not a straight line toward mastery. It is an ongoing relationship in which ordinary moments become opportunities to trust and respond.</p>
          <div className="rts-become-steps"><div className="rts-become-step"><strong>Release control</strong><p>Let go of the demand to direct the outcome.</p></div><div className="rts-become-step"><strong>Receive the moment</strong><p>Be present with God and the person before you.</p></div><div className="rts-become-step"><strong>Take the next right step</strong><p>Offer what faithfulness and love require now.</p></div><div className="rts-become-step"><strong>Repeat</strong><p>Return to attention as life continues.</p></div></div>
          <p>Awaken. See Clearly. Become. Join. Not four achievements to collect, but a way of learning to live with God and participate in His kingdom now.</p>
          <div className="rts-finish"><h2>The journey continues in the life you are living.</h2><button className="rts-button" onClick={()=>advance(0)}>Return to the beginning →</button></div>
        </>}
        {page>18&&<button className="rts-button rts-back" onClick={()=>advance(page-1)}>← Previous</button>}
      </section> : <section className="rts-see rts-scene rts-reflection">
        <p className="rts-kicker">AWAKEN · PRACTICING ATTENTION</p>
        <h1>Notice Without Needing to Explain</h1>
        <p>When something unsettles us, we usually turn our attention outward. We replay what someone said, what should have happened, or what needs to change. Sometimes those concerns are legitimate. But there is another part of the moment we can learn to notice: what is happening within us while we respond.</p>
        <p>Jesus does not invite us into self-suspicion or endless analysis. He invites us into truth, and truth begins with the willingness to see. We can acknowledge a reaction without condemning ourselves for having it or rushing to justify it. Awareness is not yet surrender, but it gives us something real to bring into relationship with God.</p>
        <div className="rts-scripture"><span>PSALM 139:23–24 · WEB</span><blockquote>“Search me, God, and know my heart. Try me, and know my thoughts. See if there is any wicked way in me, and lead me in the everlasting way.”</blockquote><p>David's prayer is not an attempt to diagnose himself. He invites God to know what he cannot fully see and to lead him. The goal is not self-mastery. It is an honest, trusting relationship with the One who sees clearly.</p></div>
        <h2 className="rts-subheading">An invitation, not an assessment</h2>
        <p>Think of a recent ordinary moment that stayed with you. Perhaps you felt dismissed, hurried, overlooked, praised, or unexpectedly interrupted. Instead of trying to uncover a hidden motive, simply remember what you noticed in yourself. You may have felt tension, urgency, a need to defend yourself, or a desire to withdraw. You may not be sure what you felt at all.</p>
        <p>There is no score to earn, pattern to identify, or conclusion the app needs to produce. You can sit with the moment quietly, speak with God about it, or continue reading. The practice is learning to pay attention without needing to control what you discover.</p>
        <div className="rts-teaching-emphasis"><p>“Lord, here is what I noticed. I do not need to understand it all before I bring it to You.”</p></div>
        <div className="rts-actions"><button className="rts-button rts-back" onClick={()=>advance(2)}>← Previous</button><button className="rts-button" onClick={()=>advance(4)}>Continue →</button></div>
      </section>}
    </div>
  </main>;
}
