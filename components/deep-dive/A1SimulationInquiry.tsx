'use client';
import { useMemo, useState } from 'react';

type Turn={question:string;answer:string};
type Prompt={q:string;g:string};
type GuideResult={kind?:string;action?:string;question?:string;guidance?:string;complete?:boolean};
type Synthesis={headline?:string;summary?:string;noticing?:string[];carryQuestion?:string};

const FIRST:Prompt={q:'What changed in you when it happened?',g:'Stay with what stood out first and what seemed to bring it up.'};
const FALLBACKS=[
 'What felt most important about that moment to you?',
 'What happened inside you next?',
 'What did you find yourself wanting to do?',
 'What stayed with you after the moment passed?',
];

export function A1SimulationInquiry({moment,reaction}:{moment:string;reaction:string}){
 const [started,setStarted]=useState(false),[turns,setTurns]=useState<Turn[]>([]),[answer,setAnswer]=useState(''),[complete,setComplete]=useState(false);
 const [prompt,setPrompt]=useState<Prompt>(reaction?{q:`What was it about that moment that brought up ${reaction.toLowerCase()} for you?`,g:'Stay with this as a starting point, not a conclusion.'}:FIRST),[pending,setPending]=useState(false),[synthesis,setSynthesis]=useState<Synthesis|null>(null);
 const quotes=useMemo(()=>turns.slice(-5),[turns]);

 function back(){
  if(pending||!turns.length)return;
  const previous=turns[turns.length-1];
  setTurns(current=>current.slice(0,-1));
  setPrompt({q:previous.question,g:'Return to what you were noticing here. You can change or add to your answer.'});
  setAnswer(previous.answer);setComplete(false);setSynthesis(null);
 }

 async function finish(next:Turn[]){
  setComplete(true);
  try{
   const r=await fetch('/api/ai/awaken-guide',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({moment,reaction,turns:next,mode:'synthesis'})});
   const s=await r.json() as {kind?:string}&Synthesis;
   if(r.ok&&s.kind==='success')setSynthesis(s);
  }catch{}
 }

 async function submit(){
  const value=answer.trim();if(!value||pending)return;
  const next=[...turns,{question:prompt.q,answer:value}];
  setPending(true);
  try{
   const r=await fetch('/api/ai/awaken-guide',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({moment,reaction,turns:next,mode:'next'})});
   const result=await r.json() as GuideResult;
   setTurns(next);
   if(r.ok&&result.kind==='success'&&(result.complete||result.action==='finish')){setAnswer('');await finish(next);return}
   let q=(r.ok&&result.kind==='success'&&result.question?.trim())||'';
   let g=(r.ok&&result.kind==='success'&&result.guidance?.trim())||'';
   if(!q||q.toLowerCase()===prompt.q.trim().toLowerCase()){
    q=FALLBACKS.find(candidate=>!next.some(t=>t.question.toLowerCase()===candidate.toLowerCase()))??'What else feels important about what happened inside you?';
    g='Stay with what you actually noticed; you do not need to force an explanation.';
   }
   setPrompt({q,g});setAnswer('');
  }catch{
   setTurns(next);
   const q=FALLBACKS.find(candidate=>!next.some(t=>t.question.toLowerCase()===candidate.toLowerCase()))??'What else feels important about what happened inside you?';
   setPrompt({q,g:'Stay with what you actually noticed; you do not need to force an explanation.'});setAnswer('');
  }finally{setPending(false)}
 }

 if(!started)return <section className="awaken-inquiry-bridge"><p className="eyebrow">STAY WITH THE MOMENT</p><h2>Something happened. Now let’s notice what happened in you.</h2><div className="awaken-inquiry-bridge__turn"><span/><p>We’ll follow this moment one question at a time.</p></div><p className="awaken-journey__lead">There is no model to fill in and no answer you are supposed to find. Each question will follow what you actually say.</p><div className="awaken-inquiry-bridge__invitation"><strong>Start with what you actually remember.</strong><button className="button" onClick={()=>setStarted(true)}>Follow the moment</button></div></section>;

 if(!complete)return <section className="awaken-sim-question"><p className="eyebrow">STAY WITH THE MOMENT</p>{moment?<aside className="awaken-sim-question__moment"><span>THE MOMENT</span><p>{moment}</p>{reaction?<strong>Starting with what you noticed: {reaction}</strong>:null}</aside>:null}<h2>{prompt.q}</h2>{prompt.g?<p className="awaken-chain__guidance">{prompt.g}</p>:null}<textarea value={answer} disabled={pending} onChange={e=>setAnswer(e.target.value)} placeholder="Write what you actually notice…"/><div className="awaken-sim-question__actions">{turns.length?<button type="button" className="awaken-quiet-button" disabled={pending} onClick={back}>Back</button>:null}<button type="button" className="button" disabled={pending||!answer.trim()} onClick={submit}>{pending?'Following the moment…':'Keep following it'}</button></div></section>;

 return <><section className="awaken-sim-pause"><p className="eyebrow">STAY HERE FOR A MOMENT</p><h2>There may be enough here to see something.</h2><p>You do not need another answer right now.</p><button className="button" onClick={()=>document.getElementById('a1-sim-reveal')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}>See the whole movement</button></section><section className="awaken-sim-reveal" id="a1-sim-reveal"><p className="eyebrow">LOOK AT THE WHOLE MOVEMENT</p><h2>{synthesis?.headline||'Something became visible because you stayed with the moment.'}</h2>{moment?<div className="awaken-sim-reveal__event"><span>WHAT HAPPENED</span><p>{moment}</p></div>:null}{synthesis?.summary?<p className="awaken-sim-reveal__summary">{synthesis.summary}</p>:null}<div className="awaken-sim-reveal__thread">{quotes.map((t,i)=><div key={i}><span>{i===0?'WHAT GOT YOUR ATTENTION':'THEN YOU NOTICED'}</span><blockquote>“{t.answer}”</blockquote></div>)}</div>{synthesis?.noticing?.length?<div className="awaken-sim-reveal__notice"><span>SOMETHING WORTH NOTICING</span>{synthesis.noticing.map(x=><p key={x}>{x}</p>)}</div>:<div className="awaken-sim-reveal__notice"><span>SOMETHING WORTH NOTICING</span><p>These things appeared in the same ordinary moment. You do not have to decide what they mean yet.</p></div>}{synthesis?.carryQuestion?<div className="awaken-sim-reveal__carry"><span>CARRY THIS QUESTION</span><p>{synthesis.carryQuestion}</p></div>:null}</section></>;
}
