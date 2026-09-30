'use client';
import { useState } from 'react';
type Turn={question:string;answer:string};
type GuideResult={kind?:string;action?:string;question?:string;guidance?:string;complete?:boolean};
type Recognition='yes'|'beginning'|'not-yet'|null;

export function A1SimulationInquiry({moment,reaction}:{moment:string;reaction:string}){
 const first=reaction?{q:`What was it about that moment that brought up ${reaction.toLowerCase()} for you?`,g:'Just notice the connection. You do not need to explain it.'}:{q:'What did you notice happening inside you?',g:'You do not need to know why.'};
 const [started,setStarted]=useState(false),[turns,setTurns]=useState<Turn[]>([]),[answer,setAnswer]=useState(''),[prompt,setPrompt]=useState(first),[pending,setPending]=useState(false),[readyToRecognize,setReadyToRecognize]=useState(false),[recognition,setRecognition]=useState<Recognition>(null),[guideStatus,setGuideStatus]=useState<'untested'|'ai'|'fallback'>('untested');

 async function submit(){
  const value=answer.trim();if(!value||pending)return;
  const next=[...turns,{question:prompt.q,answer:value}];setTurns(next);setPending(true);
  if(next.length>=4){setAnswer('');setReadyToRecognize(true);setPending(false);return}
  try{
   const r=await fetch(new URL('/api/ai/awaken-guide',window.location.origin).toString(),{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({moment,reaction,turns:next,mode:'next'})});
   const result=await r.json() as GuideResult;
   if(r.ok&&result.kind==='success'){setGuideStatus('ai');if(result.complete||result.action==='finish'){setAnswer('');setReadyToRecognize(true);return}const q=result.question?.trim();if(q&&q.toLowerCase()!==prompt.q.toLowerCase()){setPrompt({q,g:result.guidance?.trim()||''});setAnswer('');return}}
   setGuideStatus('fallback');setAnswer('');setReadyToRecognize(true);
  }catch{setGuideStatus('fallback');setAnswer('');setReadyToRecognize(true)}
  finally{setPending(false)}
 }

 if(!started)return <section className="awaken-inquiry-bridge"><p className="eyebrow">STAY WITH THE MOMENT</p><h2>You noticed something happen in you.</h2><p className="awaken-journey__lead">{reaction?<>You called it <strong>{reaction.toLowerCase()}</strong>. We are only going to look long enough to notice that it was already part of the moment.</>:<>We are only going to look long enough to notice what was happening inside.</>}</p><div className="awaken-inquiry-bridge__invitation"><strong>No diagnosis. No fixing. Just notice.</strong><button className="button" onClick={()=>setStarted(true)}>Look at the moment</button></div></section>;

 if(readyToRecognize&&!recognition)return <section className="awaken-recognition-check"><p className="eyebrow">BEFORE WE LEAVE THIS MOMENT</p><h2>Can you see that something was already happening in you before you responded?</h2><div className="awaken-recognition-check__choices"><button className="button" onClick={()=>setRecognition('yes')}>Yes, I can see that</button><button className="awaken-quiet-button" onClick={()=>setRecognition('beginning')}>I'm beginning to</button><button className="awaken-quiet-button" onClick={()=>{setRecognition('not-yet');setReadyToRecognize(false);setPrompt({q:'If you look at the moment once more, did anything shift in you before you decided what to do?',g:'A feeling, thought, urge, tension—or even uncertainty is enough.'})}}>Not really yet</button></div></section>;

 if(recognition)return <section className="awaken-release-moment"><p className="eyebrow">THAT IS ENOUGH FOR NOW</p><h2>{recognition==='yes'?'You saw it.':'You are beginning to notice it.'}</h2><p>You do not have to understand what it was or why it was there. The point was simply to notice that the moment involved more than the outward response.</p>{turns.length?<div className="awaken-release-moment__glimpse"><span>ONE THING YOU NOTICED</span><blockquote>“{turns[turns.length-1].answer}”</blockquote></div>:null}<p className="awaken-release-moment__carry">Let this moment go. See if you notice something happening inside you in another ordinary moment.</p></section>;

 return <section className="awaken-sim-question"><p className="eyebrow">STAY WITH THE MOMENT {guideStatus!=='untested'?<span className={`awaken-guide-status awaken-guide-status--${guideStatus}`}>{guideStatus==='ai'?'AI CONNECTED':'FALLBACK'}</span>:null}</p>{moment?<aside className="awaken-sim-question__moment"><span>THE MOMENT</span><p>{moment}</p>{reaction?<strong>You first noticed: {reaction}</strong>:null}</aside>:null}<h2>{prompt.q}</h2>{prompt.g?<p className="awaken-chain__guidance">{prompt.g}</p>:null}<textarea value={answer} disabled={pending} onChange={e=>setAnswer(e.target.value)} placeholder="Write what you actually noticed…"/><div className="awaken-sim-question__actions"><button type="button" className="button" disabled={pending||!answer.trim()} onClick={submit}>{pending?'Following what you said…':'Keep following it'}</button></div></section>;
}
