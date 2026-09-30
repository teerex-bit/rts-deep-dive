'use client';

import { useMemo, useState } from 'react';

const UNKNOWN = 'I’m not sure';
const STEPS = [
 { key:'event', label:'What happened?', hint:'Keep it concrete. One moment is enough.' },
 { key:'notice', label:'What did you notice first?', hint:'A thought, sensation, change in tone, expression, silence, or anything else that actually stood out.' },
 { key:'response', label:'What did you find yourself wanting to do?', hint:'Describe the impulse or visible response without explaining it yet.' },
] as const;

export function A4MomentInquiry() {
 const [step,setStep]=useState(0);
 const [answers,setAnswers]=useState<Record<string,string>>({});
 const [adaptive,setAdaptive]=useState<{question:string;guidance?:string}|null>(null);
 const [adaptiveAnswer,setAdaptiveAnswer]=useState('');
 const [turns,setTurns]=useState<Array<{question:string;answer:string}>>([]);
 const [pending,setPending]=useState(false);
 const [complete,setComplete]=useState(false);
 const [synthesis,setSynthesis]=useState<{headline?:string;summary?:string;noticing?:string[];carryQuestion?:string}|null>(null);
 const current=STEPS[step];
 const moment=answers.event??'';
 const compactState=useMemo(()=>({moment,activeThread:turns.slice(-2),supported:Object.entries(answers).filter(([,v])=>v).map(([k,v])=>({kind:k,value:v}))}),[moment,turns,answers]);

 function localContinue(value:string){
  const next={...answers,[current.key]:value};setAnswers(next);
  if(step<STEPS.length-1){setStep(step+1);return;}
  // The first three steps are deterministic. Only now can participant language
  // materially change what is useful next.
  void askGuide(next);
 }

 async function askGuide(nextAnswers=answers, answer?:string){
  if(pending)return;
  const prior=answer?[...turns,{question:adaptive?.question??'What feels most important about that?',answer}]:turns;
  setPending(true);
  try{
   const response=await fetch('/api/ai/awaken-guide',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
    mode:'next',
    moment:nextAnswers.event??'',
    reaction:nextAnswers.response??'',
    // Sparse context: compact supported observations + at most two relevant turns.
    supported:Object.entries(nextAnswers).filter(([,v])=>v).map(([kind,value])=>({kind,value})),
    turns:prior.slice(-2),
    activeThread:compactState.activeThread,
   })});
   const result=await response.json() as {kind?:string;action?:string;question?:string;guidance?:string;complete?:boolean};
   setTurns(prior);setAdaptiveAnswer('');
   if(!response.ok||result.kind!=='success'){setComplete(true);return;}
   if(result.complete||result.action==='finish'){setComplete(true);await makeSynthesis(nextAnswers,prior);return;}
   setAdaptive({question:result.question||'What feels most important about that?',guidance:result.guidance});
  }catch{setComplete(true)}finally{setPending(false)}
 }

 async function makeSynthesis(nextAnswers=answers,nextTurns=turns){
  try{
   const response=await fetch('/api/ai/awaken-guide',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
    mode:'synthesis',moment:nextAnswers.event??'',reaction:nextAnswers.response??'',
    supported:Object.entries(nextAnswers).filter(([,v])=>v).map(([kind,value])=>({kind,value})),
    turns:nextTurns,
   })});
   const result=await response.json();if(response.ok&&result.kind==='success')setSynthesis(result);
  }catch{}
 }

 if(complete)return <section className="awaken-cycle-complete" aria-live="polite">
  <p className="eyebrow">WHAT BECAME VISIBLE</p>
  <h2>{synthesis?.headline||'Your response had a before.'}</h2>
  {synthesis?.summary?<p>{synthesis.summary}</p>:<p>You slowed one moment down and saw more than the final response. You do not need to force anything beyond what became clear.</p>}
  {synthesis?.noticing?.length?<div className="awaken-cycle-complete__noticing">{synthesis.noticing.map((x:string)=><span key={x}>{x}</span>)}</div>:null}
  <p className="awaken-cycle-complete__possibility">Even one more noticed step creates possibility where none was visible before.</p>
 </section>;

 if(adaptive)return <section className="awaken-guided awaken-guided--adaptive" aria-live="polite">
  <p className="eyebrow">STAY WITH ONE THING</p><h2>{adaptive.question}</h2>
  {adaptive.guidance?<p>{adaptive.guidance}</p>:null}
  <textarea rows={3} value={adaptiveAnswer} onChange={e=>setAdaptiveAnswer(e.target.value)} />
  <div className="awaken-guided__actions">
   <button className="button" type="button" disabled={pending||!adaptiveAnswer.trim()} onClick={()=>void askGuide(answers,adaptiveAnswer.trim())}>{pending?'…':'NEXT'}</button>
   <button className="button button--secondary" type="button" disabled={pending} onClick={()=>void askGuide(answers,UNKNOWN)}>{UNKNOWN}</button>
  </div>
 </section>;

 return <section className="awaken-guided awaken-guided--moment" aria-label="Slow one moment down">
  <div className="awaken-guided__step" aria-live="polite">
   <p className="eyebrow">LOOK {step+1}</p><label htmlFor={`awaken-moment-${step}`}>{current.label}</label>
   <textarea id={`awaken-moment-${step}`} rows={3} value={answers[current.key]??''} onChange={e=>setAnswers({...answers,[current.key]:e.target.value})} />
   <small>{current.hint}</small>
   <div className="awaken-guided__actions">
    <button className="button" type="button" disabled={pending||!(answers[current.key]??'').trim()} onClick={()=>localContinue(answers[current.key])}>{pending?'…':'NEXT'}</button>
    {step>0?<button className="button button--secondary" type="button" onClick={()=>localContinue(UNKNOWN)}>{UNKNOWN}</button>:null}
   </div>
  </div>
 </section>;
}
