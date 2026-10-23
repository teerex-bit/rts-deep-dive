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
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');setPage(Math.min(8,Math.max(0,saved.page||0)));setSelected(saved.selected||'');setInfluence(saved.influence||'');setResponse(saved.response||'');setClearResponse(saved.clearResponse||'');setReveal(!!saved.reveal);setReflectionStep(saved.reflectionStep||0);setFollowup(saved.followup||'');}catch{}setReady(true)},[]);
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
      .rts-restart{border:1px solid #d9d1c5;background:#fffdfa;color:#263a4a;border-radius:8px;padding:7px 10px;font:600 12px Arial,sans-serif;cursor:pointer}\n      .rts-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:13px}
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
      @media(min-width:700px){.rts-shell{padding-top:38px}.rts-prose p{font-size:18px}}
      @media(max-width:350px){.rts-shell{padding-left:17px;padding-right:17px}.rts-prose p{font-size:16px}}
    `}</style>
    <div className="rts-shell">
      <header className="rts-header"><span>REFORMING THE SOUL</span><button type="button" className="rts-restart" onClick={()=>{setReflectionStep(0);advance(0)}}>← Back to beginning</button><img className="rts-tree-logo" src="https://raw.githubusercontent.com/teerex-bit/rts-website/main/public/assets/logos/rts-tree-wordmark.png" alt="Tree of Life" /></header>
      <p className="rts-stage-label">{page<2?"INTRODUCTION":page>=5?"SEE CLEARLY":"AWAKEN"}</p><nav aria-label="Section progress" className="rts-progress">{["Awaken","See Clearly","Become","Join"].map((label,i)=><span key={label} className={i<=(page>=5?1:0)?"active":""} title={label}/>)}</nav>
      {reading ? <section className="rts-see rts-reading-chapter">
        <div className={`rts-chapter-art ${page===0?'rts-chapter-art--opening':'rts-chapter-art--awaken'}`} aria-hidden="true"><span>{page===0?<>THE<br/>BEGINNING</>:<>AWAKEN</>}</span><div className="rts-chapter-line"/></div>
        <p className="rts-kicker">{chapter.eyebrow}</p><h1>{chapter.title}</h1>
        <article className="rts-prose rts-chapter-prose">{chapter.paragraphs.map((p,i)=>page===2 && (i===3||i===5||i===7||i===11)?<blockquote key={i}>{p}</blockquote>:<p key={i}>{p}</p>)}</article>
        {page===2 ? <div className="rts-awaken-next"><button className="rts-button rts-wide" onClick={()=>advance(3)}>Pause and notice →</button><button className="rts-button rts-back" onClick={()=>advance(1)}>← Previous</button></div> : <><div className="rts-divider"/><div className="rts-actions"><span className="rts-small">Opening · Read at your pace</span><button className="rts-button" onClick={()=>advance(1)}>Pause and notice →</button></div></>}
      </section> : page===1 ? <>
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
      </section> : page>=5 ? <section className="rts-see">
        {page===5 ? <>
          <div className="rts-chapter-art" aria-hidden="true"><span>SEE<br/>CLEARLY</span><div className="rts-chapter-line"/></div>
          <p className="rts-kicker">02 / SEE CLEARLY</p><h1>Looking Beneath the Reaction</h1>
          <p>Awaken helps us notice what happens within us. See Clearly begins to uncover what lies beneath those reactions.</p>
          <p>Our beliefs shape our expectations. Our expectations influence our desires. And our desires often determine how we respond before we have considered why.</p>
          <blockquote>Clarity precedes obedience.</blockquote>
          <p>We are not simply trying to understand ourselves better. We are learning to see ourselves, our circumstances, and God more clearly—with Jesus as our clearest revelation of the Father.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(6)}>Explore what is beneath →</button>
        </> : page===6 ? <>
          <p className="rts-kicker">SEE CLEARLY · THE INNER PATH</p><h1>What We See Shapes What We Become</h1>
          <p>Our responses rarely begin at the moment we act. Something is already happening beneath the surface: the way we interpret what happened, what we believe it means, what we expect will happen next, and what we want to secure or avoid.</p>
          <div className="rts-chain"><span>What I see</span><span>What I believe</span><span>What I expect</span><span>What I desire</span><span>What I intend</span></div>
          <p>Seeing this movement helps us recognize that changing an action is not always the same as changing the person from whom the action comes. We can restrain a response while continuing to hold the belief that produced it.</p>
          <p>God's invitation is deeper than behavior management. He invites us to bring what is hidden into the light, where it can be examined in His presence.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(7)}>Pause and look within →</button>
        </> : page===7 ? <>
          <p className="rts-kicker">SEE CLEARLY · A MOMENT TO NOTICE</p><h1>Look Beneath Your Response</h1>
          <p>Return to the experience you noticed in Awaken. Instead of deciding whether your response was good or bad, consider what you were expecting or hoping would happen.</p>
          <p className="rts-prompt">What did that moment seem to say about you, the other person, or God?</p>
          <textarea className="rts-field" aria-label="See Clearly reflection" placeholder="Notice a belief or expectation, without forcing an answer…" value={clearResponse} onChange={e=>setClearResponse(e.target.value)}/>
          <p className="rts-small">You may leave this blank and continue. Your answer is not analyzed or interpreted automatically.</p>
          <button className="rts-button rts-wide" onClick={()=>advance(8)}>Continue →</button>
        </> : <>
          <p className="rts-kicker">SEE CLEARLY · GOD AS HE IS</p><h1>Jesus Changes What We See</h1>
          <p>We may know what we have been taught about God and still respond to Him through expectations shaped by disappointment, fear, or our experience with other people.</p>
          <p>That is why seeing clearly is not only about understanding ourselves. It is also about allowing Jesus to correct the picture of God we carry. We do not have to guess what the Father is like when we can look at the Son.</p>
          <blockquote>Jesus is not the exception to what God is like. He is the revelation of what God is like.</blockquote>
          <p>As our understanding of God becomes clearer, our relationship with Him can change. Trust no longer has to be a demand we place on ourselves; it can grow as we come to know the One we are trusting.</p>
          <p>Seeing clearly is not the end of formation. It prepares us to live differently with God in the ordinary moments of our lives.</p>
          <div className="rts-finish"><p className="rts-kicker">SEE CLEARLY · SECTION COMPLETE</p><h2>Clarity opens the way to becoming.</h2><p>The next movement is Become, where awareness and trust take shape in daily life.</p><button className="rts-button" onClick={()=>advance(7)}>← Revisit reflection</button></div>
        </>}
        {page>5&&<button className="rts-button rts-back" onClick={()=>advance(page-1)}>← Previous</button>}
      </section> : <>
        <p className="rts-kicker">AWAKEN · NOTICE YOURSELF</p>
        {reflectionStep===0 ? <>
          <h1>Which of these feels familiar?</h1>
          <p className="rts-hint">Think about everyday experiences. Choose one that brings a real situation to mind.</p>
          {options.map(v=><button key={v} className="rts-option" aria-pressed={selected===v} onClick={()=>{setSelected(v);setResponse('');setFollowup('')}}>{v}</button>)}
          <div className="rts-actions"><button className="rts-button rts-back" onClick={()=>advance(2)}>← Back</button><button className="rts-button" disabled={!selected} onClick={()=>setReflectionStep(1)}>Continue →</button></div>
        </> : reflectionStep===1 ? <>
          <h1>Bring that moment to mind.</h1>
          <div className="rts-selected">{selected}</div>
          <p className="rts-hint">What happened, and what did you notice happening within you?</p>
          <textarea className="rts-field" aria-label="Your experience" placeholder="Describe what you remember…" value={response} onChange={e=>setResponse(e.target.value)}/>
          <div className="rts-actions"><button className="rts-button rts-back" onClick={()=>setReflectionStep(0)}>← Back</button><button className="rts-button" disabled={!response.trim()} onClick={()=>setReflectionStep(2)}>Continue →</button></div>
        </> : <>
          <h1>Look a little closer.</h1>
          <p className="rts-hint">Read your own words before trying to explain what they mean.</p>
          <div className="rts-selected">{response}</div>
          <p className="rts-hint">What stands out most to you now—a thought, a feeling, an impulse, or something that stayed with you afterward?</p>
          <textarea className="rts-field" aria-label="What stands out" placeholder="What do you notice now?" value={followup} onChange={e=>setFollowup(e.target.value)}/>
          <div className="rts-actions"><button className="rts-button rts-back" onClick={()=>setReflectionStep(1)}>← Back</button><button className="rts-button" onClick={()=>advance(4)}>Complete Awaken →</button></div>
          <p className="rts-small">You can continue without writing more. No interpretation is imposed on your experience.</p>
        </>}

      </>}
    </div>
  </main>;
}
