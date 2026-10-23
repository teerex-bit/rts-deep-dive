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
  'Someone questioned a decision I made.',
  'I felt overlooked or dismissed.',
  'Something changed unexpectedly.',
  'Something went really well.'
];
const storageKey = 'rts-narrative-prototype-v1';
export default function NarrativeJourney() {
  const [page,setPage] = useState(0);
  const [selected,setSelected] = useState('');
  const [influence,setInfluence] = useState('');
  const [response,setResponse] = useState('');
  const [reveal,setReveal] = useState(false);
  const [ready,setReady] = useState(false);
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');setPage(Math.min(5,Math.max(0,saved.page||0)));setSelected(saved.selected||'');setInfluence(saved.influence||'');setResponse(saved.response||'');setReveal(!!saved.reveal);}catch{}setReady(true)},[]);
  useEffect(()=>{if(ready)localStorage.setItem(storageKey,JSON.stringify({page,selected,influence,response,reveal}))},[page,selected,influence,response,reveal,ready]);
  const advance=(n:number)=>{setPage(n);window.scrollTo({top:0,behavior:'smooth'})};
  const reading = page===0 || page===2;
  const chapter=chapters[page===0?0:1];
  return <main className="rts-root">
    <style>{`
      .rts-root{min-height:100dvh;background:#f8f5ef;color:#263a4a;font-family:Georgia,'Times New Roman',serif}
      .rts-shell{max-width:600px;margin:auto;padding:12px 20px 70px}
      .rts-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.13em;color:#9b773b}
      .rts-mark{width:29px;height:29px;border:1.5px solid #b18a45;border-radius:50%;display:grid;place-items:center;font-size:17px}
      .rts-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:13px}
      .rts-progress span{height:4px;border-radius:4px;background:#ded7ca}.rts-progress span.active{background:#b18a45}
      .rts-hero{width:100%;height:auto;display:block;border-radius:12px;margin:0 0 15px;max-height:145px;object-fit:cover;overflow:hidden}
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
      .rts-completion{padding:24px 0}.rts-completion p{font-size:17px;line-height:1.6;margin:0 0 20px}.rts-completion .rts-button{display:block;margin:15px 0}.rts-complete{display:block;width:100%;margin-top:20px}.rts-stage-label{font:600 11px/1.5 Arial,sans-serif;color:#967640;letter-spacing:.1em;margin:0 0 8px}
      @media(min-width:700px){.rts-shell{padding-top:38px}.rts-prose p{font-size:18px}}
      @media(max-width:350px){.rts-shell{padding-left:17px;padding-right:17px}.rts-prose p{font-size:16px}}
    `}</style>
    <div className="rts-shell">
      <header className="rts-header"><span>REFORMING THE SOUL</span><span className="rts-mark" aria-hidden="true">✦</span></header>
      <p className="rts-stage-label">{page<2?"YOUR JOURNEY · INTRODUCTION":page===5?"YOUR JOURNEY · SEE CLEARLY":"YOUR JOURNEY · AWAKEN"}</p><nav aria-label="Section progress" className="rts-progress">{[0,1,2,3,4,5].map(i=><span key={i} className={i<=page?"active":""}/>)}</nav>
      {reading ? <>
        {page===0&&<div className="rts-hero" role="img" aria-label="Warm morning light falling across a quiet interior" style={{height:145,backgroundImage:"linear-gradient(90deg, rgba(30,35,34,.16), rgba(250,228,179,.07)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85')",backgroundSize:"cover",backgroundPosition:"center 52%"}}/>}
        <p className="rts-kicker">{chapter.eyebrow}</p><h1>{chapter.title}</h1>
        <article className="rts-prose">{chapter.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</article>
        <div className="rts-divider"/>
        <div className="rts-actions">
          {page>0?<button className="rts-button rts-back" onClick={()=>advance(1)}>← Back</button>:<span className="rts-small">Opening · Read at your pace</span>}
          <button className="rts-button" onClick={()=>advance(page===0?1:3)}>{page===0?'Pause and notice →':'Continue →'}</button>
        </div>
      </> : page===1 ? <>
        <p className="rts-kicker">A MOMENT TO NOTICE</p><h1>What has shaped you?</h1>
        <p className="rts-hint">Much of our formation happened without our awareness. Which experience has been especially significant for you? There is no right answer.</p>
        {['Family and upbringing','Relationships','Success or failure','Pain or disappointment','Expectations of others','Something else'].map(v=><button key={v} className="rts-option" aria-pressed={influence===v} onClick={()=>setInfluence(v)}>{v}</button>)}
        <div className="rts-actions"><button className="rts-button rts-back" onClick={()=>advance(0)}>← Back</button><button className="rts-button" onClick={()=>advance(2)}>Continue →</button></div>
        <p className="rts-small">You may continue without choosing.</p>
      </> : page===4 ? <section className="rts-completion">
        <p className="rts-kicker">AWAKEN · COMPLETED</p><h1>The Beginning of Awareness</h1>
        <p>You may not yet understand why you respond the way you do. That is all right. Awaken is not about figuring everything out. It is about beginning to notice what was previously invisible.</p>
        <p>Once we can see what is happening within us, we can begin exploring what is underneath it.</p>
        <button className="rts-button" onClick={()=>advance(5)}>Continue to See Clearly →</button>
        <button className="rts-button rts-back" onClick={()=>advance(3)}>← Revisit your reflection</button>
      </section> : page===5 ? <section className="rts-completion">
        <p className="rts-kicker">02 / SEE CLEARLY</p><h1>Looking Beneath the Reaction</h1>
        <p>Awaken helps us notice what happens within us. See Clearly invites us to consider the beliefs, expectations, desires, and fears that may shape those reactions.</p>
        <p>We do not need to rush toward an explanation. Clarity begins with honest attention, and Jesus gives us the clearest picture of the Father we are learning to trust.</p>
        <p className="rts-small">The full See Clearly chapter is not yet built.</p>
        <button className="rts-button" onClick={()=>advance(4)}>← Return to Awaken</button>
      </section> : <>
        <p className="rts-kicker">AWAKEN · A MOMENT OF DISCOVERY</p><h1>Catch yourself being you.</h1>
        <p className="rts-hint">Think about a recent experience. Which of these feels most familiar?</p>
        {options.map(v=><button key={v} className="rts-option" aria-pressed={selected===v} onClick={()=>{setSelected(v);setReveal(false)}}>{v}</button>)}
        <p className="rts-hint">What happened, and what came out of you?</p>
        <textarea className="rts-field" aria-label="Your reflection" placeholder="Write a few words, if you'd like…" value={response} onChange={e=>{setResponse(e.target.value);setReveal(false)}}/>
        {reveal&&<section className="rts-panel">
          <p>{selected===options[0]?'When your decision was questioned, what did you feel you needed to protect or establish?':selected===options[1]?'When you felt overlooked, what did you notice yourself wanting from the other person?':selected===options[2]?'When something changed, what expectation was hardest to release?':selected===options[3]?'Even good moments can reveal our desires. What did you most want to hold onto?':'What did you notice happening in you before trying to explain it?'}</p>
          {response.trim()&&<p>You wrote: “{response.trim()}”</p>}
          <p>There is no need to judge the reaction or force an explanation. For now, simply notice it.</p>
        </section>}
        <div className="rts-actions"><button className="rts-button rts-back" onClick={()=>advance(2)}>← Back</button><button className="rts-button" onClick={()=>setReveal(true)}>{reveal?'Reflect again':'Reflect →'}</button></div>
        <button className="rts-button rts-complete" onClick={()=>advance(4)}>Complete Awaken →</button>
        <p className="rts-small">You may continue without writing a response.</p>
      </>}
    </div>
  </main>;
}
