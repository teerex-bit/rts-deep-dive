import { NextResponse } from 'next/server';
export const dynamic='force-dynamic'; export const maxDuration=300;
const headers={'cache-control':'no-store','content-type':'application/json'};
const NEXT={type:'object',additionalProperties:false,required:['action','question','relevance','complete'],properties:{action:{type:'string',enum:['follow','clarify','accept_uncertainty','finish']},question:{type:'string'},relevance:{type:'string'},complete:{type:'boolean'}}};
const ANSWER={type:'object',additionalProperties:false,required:['answer'],properties:{answer:{type:'string'}}};
const SYN={type:'object',additionalProperties:false,required:['summary','observations','carryForward'],properties:{summary:{type:'string'},observations:{type:'array',items:{type:'string'}},carryForward:{type:'string'}}};
const EVAL={type:'object',additionalProperties:false,required:['nextQuestionFit','threadDiscipline','participantAgency','patternImposition','overDrilling','synthesisFidelity','outcomeUseful','notes'],properties:{nextQuestionFit:{type:'integer',minimum:1,maximum:5},threadDiscipline:{type:'integer',minimum:1,maximum:5},participantAgency:{type:'integer',minimum:1,maximum:5},patternImposition:{type:'boolean'},overDrilling:{type:'boolean'},synthesisFidelity:{type:'integer',minimum:1,maximum:5},outcomeUseful:{type:'integer',minimum:1,maximum:5},notes:{type:'string'}}};
function text(d:any){const xs=d.output?.flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text'&&typeof x.text==='string');return xs?.length===1?xs[0].text:null}
async function ai(key:string,instructions:string,input:any,schema:any,name:string){const s=Date.now();const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:AbortSignal.timeout(30000),headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:'gpt-5.4-mini',store:false,input:[{role:'developer',content:[{type:'input_text',text:instructions}]},{role:'user',content:[{type:'input_text',text:JSON.stringify(input)}]}],text:{format:{type:'json_schema',name,strict:true,schema}}})});if(!r.ok)throw new Error('openai_'+r.status);const d=await r.json();const t=text(d);if(!t)throw new Error('no_output');return {value:JSON.parse(t),latencyMs:Date.now()-s,usage:d.usage??{}}}
const INQUIRY=`You are the invisible RTS Awaken inquiry engine. Awaken helps a person notice one supported aspect of one lived moment; it does not diagnose or explain the whole person. The next question must make sense because of what the participant just said. Hardwired and held loosely. If several things surface, stay with one coherent thread: you don't do all of them through one process; you do all the process for one of them. Never generalize one moment into a pattern, ask for confirming examples elsewhere, infer trauma/hidden motives, or claim what God is saying. Accept uncertainty. Ask one short question or finish. Aim for useful awareness, normally 2-6 turns, hard maximum 8.`;
const PARTICIPANT=`Continue a synthetic participant from a REAL human-authored starting statement. Preserve the tone and facts of the starting statement. Invent only the minimum plausible detail needed to answer the current question. Do not manufacture pathology, trauma, recurring patterns, spiritual conclusions, or hidden motives. If the question assumes something unsupported, correct it or say you don't know. Keep answers natural and usually brief. This continuation is SIMULATED and must never be represented as the original human's words.`;
const SYNTH=`Synthesize only what is supported by this inquiry. Help the participant see the moment more clearly without diagnosis, pattern claims, hidden motives, or claims about God. Distinguish what happened from what the participant noticed. Carry-forward must not tell them to search for confirmation of a proposed pattern.`;
const EVALUATOR=`Evaluate the complete RTS Awaken trace. Primary test: each next question should make sense because of the participant answer immediately before it. Judge whether RTS stayed with one thread, preserved participant agency, avoided pattern imposition and over-drilling, and whether synthesis faithfully reflects what was actually said. Outcome usefulness means the participant could plausibly see one supported aspect of the moment more clearly; it does not reward diagnosis or depth for its own sake.`;
export async function GET(request:Request){
 const batchStart=Date.now();
 try{
  if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({kind:'not_preview'},{status:404,headers});
  const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({kind:'unavailable'},{status:503,headers});
  const url=new URL(request.url);const offset=Math.max(0,Number(url.searchParams.get('offset')??0));const count=Math.max(1,Math.min(50,Number(url.searchParams.get('count')??50)));
  const sourceUrl=`https://datasets-server.huggingface.co/rows?dataset=SetFit%2Fgo_emotions&config=default&split=train&offset=${offset}&length=${count}`;
  const sf=Date.now();const sr=await fetch(sourceUrl,{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!sr.ok)throw new Error('source_'+sr.status);const sj=await sr.json() as any;const sourceFetchMs=Date.now()-sf;
  const results=[];let calls=0,totalTokens=0,failures=0;
  for(const item of (sj.rows??[]).slice(0,count)){
   const startingText=String(item.row?.text??'').trim();if(!startingText)continue;
   const labels=Object.entries(item.row??{}).filter(([k,v])=>k!=='text'&&Number(v)===1).map(([k])=>k);
   const turns:any[]=[];let question='What stood out to you most in that moment?';let complete=false;let error=null;
   try{
    for(let turn=0;turn<8&&!complete;turn++){
     const pa=await ai(key,PARTICIPANT,{startingText,labels,turns,question},ANSWER,'rts_participant_answer');calls++;totalTokens+=Number(pa.usage.total_tokens??0);
     const answer=pa.value.answer;turns.push({turn:turn+1,question,answer,answerProvenance:'SIMULATED',answerLatencyMs:pa.latencyMs});
     const nx=await ai(key,INQUIRY,{startingText,turns},NEXT,'rts_inquiry_next');calls++;totalTokens+=Number(nx.usage.total_tokens??0);
     turns[turn].rtsDecision=nx.value;turns[turn].rtsLatencyMs=nx.latencyMs;complete=Boolean(nx.value.complete)||nx.value.action==='finish';if(!complete)question=nx.value.question;
    }
    const sy=await ai(key,SYNTH,{startingText,turns},SYN,'rts_inquiry_synthesis');calls++;totalTokens+=Number(sy.usage.total_tokens??0);
    const ev=await ai(key,EVALUATOR,{startingText,labels,turns,synthesis:sy.value},EVAL,'rts_trace_evaluation');calls++;totalTokens+=Number(ev.usage.total_tokens??0);
    results.push({sourceRow:item.row_idx,sourceProvenance:'REAL',startingText,labels,turns,synthesis:sy.value,synthesisLatencyMs:sy.latencyMs,evaluation:ev.value,evaluatorLatencyMs:ev.latencyMs});
   }catch(e){failures++;error=e instanceof Error?e.message:'unknown';results.push({sourceRow:item.row_idx,sourceProvenance:'REAL',startingText,labels,turns,error})}
  }
  return NextResponse.json({kind:'success',batch:{offset,countRequested:count,countCompleted:results.length,sourceFetchMs,batchWallClockMs:Date.now()-batchStart,calls,totalTokens,failures},provenance:{startingMoments:'REAL human-authored SetFit/go_emotions',continuationAnswers:'SIMULATED',rtsQuestions:'MODEL',synthesis:'MODEL',evaluation:'MODEL'},results},{headers});
 }catch(e){return NextResponse.json({kind:'error',message:e instanceof Error?e.message:'unknown',batchWallClockMs:Date.now()-batchStart},{status:500,headers})}
}
