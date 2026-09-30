import { NextResponse } from 'next/server';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';

export const dynamic='force-dynamic';
const headers={'cache-control':'no-store','content-type':'application/json'};
const MODELS=new Set(['gpt-5.4-mini','gpt-5.4-nano']);
const DOMAINS=['marriage','parenting','friendship','work','criticism','embarrassment','conflict','rejection','disappointment','unfairness','uncertainty','waiting','mistake','being ignored','unexpected change','finances','church','relationship with God','temptation','loneliness','success','joy','gratitude','peace','generosity','ordinary mundane moment'];
const STYLES=['articulate','terse','literal','low-awareness','self-aware','self-critical','other-critical','spiritualizing','uncertain','resistant','contradictory','emotionally intense','emotionally restrained','detailed','one-word responder'];

function text(data:Record<string,unknown>){const o=data.output as Array<Record<string,unknown>>|undefined;const xs=o?.flatMap(i=>i.content as Array<Record<string,unknown>>??[]).filter(x=>x.type==='output_text'&&typeof x.text==='string');return xs?.length===1?String(xs[0].text):null}
async function ai(apiKey:string,instructions:string,input:unknown,schema:object,name:string,model='gpt-5.4-mini'){
 const started=Date.now();const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:AbortSignal.timeout(30000),headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify({model:MODELS.has(model)?model:'gpt-5.4-mini',store:false,input:[{role:'developer',content:[{type:'input_text',text:instructions}]},{role:'user',content:[{type:'input_text',text:'[SYNTHETIC_TEST_DATA]\n'+JSON.stringify(input)}]}],text:{format:{type:'json_schema',name,strict:true,schema}}})});if(!r.ok)throw new Error('provider_'+r.status);const d=await r.json() as Record<string,unknown>;const t=text(d);if(!t)throw new Error('no_output');const u=(d.usage??{}) as Record<string,unknown>;return {value:JSON.parse(t),meta:{latencyMs:Date.now()-started,inputTokens:u.input_tokens??0,outputTokens:u.output_tokens??0,totalTokens:u.total_tokens??0}}
}
const SCENARIO_SCHEMA={type:'object',additionalProperties:false,required:['domain','participantStyle','event','privateTruth','notPresent','openingAnswer'],properties:{domain:{type:'string'},participantStyle:{type:'string'},event:{type:'string'},privateTruth:{type:'array',items:{type:'string'}},notPresent:{type:'array',items:{type:'string'}},openingAnswer:{type:'string'}}};
const NEXT_SCHEMA={type:'object',additionalProperties:false,required:['action','question','guidance','relevance','complete'],properties:{action:{type:'string',enum:['advance','clarify','follow','reframe','accept_uncertainty','finish']},question:{type:'string'},guidance:{type:'string'},relevance:{type:'string'},complete:{type:'boolean'}}};
const ANSWER_SCHEMA={type:'object',additionalProperties:false,required:['answer'],properties:{answer:{type:'string'}}};
const EVAL_SCHEMA={type:'object',additionalProperties:false,required:['relevance','coherence','responsiveness','unsupportedAssumption','overreach','uncertainty','depth','overDrilling','agency','threadDiscipline','confirmationSeeking','prematurePattern','notes'],properties:{relevance:{type:'integer',minimum:1,maximum:5},coherence:{type:'integer',minimum:1,maximum:5},responsiveness:{type:'integer',minimum:1,maximum:5},unsupportedAssumption:{type:'boolean'},overreach:{type:'boolean'},uncertainty:{type:'integer',minimum:1,maximum:5},depth:{type:'integer',minimum:1,maximum:5},overDrilling:{type:'boolean'},agency:{type:'integer',minimum:1,maximum:5},threadDiscipline:{type:'integer',minimum:1,maximum:5},confirmationSeeking:{type:'boolean'},prematurePattern:{type:'boolean'},notes:{type:'string'}}};

const INQUIRY=`You are the invisible RTS Awaken inquiry engine. Follow this lived moment, not a checklist. Ask one short question that makes sense specifically because of what was just said. Hardwired and held loosely: the formation framework may orient you privately but must not force an interpretation. If several things surface, stay with one coherent thread: you don't do all of them through one process; you do all the process for one of them. Never diagnose, infer trauma/hidden motives, claim what God is saying, or turn one moment into a pattern. Never ask the participant to search past/future life for confirming examples. Accept genuine uncertainty. Target 4-8 turns, hard maximum 10. Return structured decision.`;
const PARTICIPANT=`Role-play only the supplied synthetic participant. You know the private truth, but reveal only what the current RTS question reasonably draws out. Preserve the assigned communication style. Do not help RTS by dumping hidden ground truth. You may say I don't know, nothing, or correct the question when that is realistic. Never mention this simulation.`;
const EVALUATOR=`Evaluate the RTS inquiry against the hidden synthetic truth. Scores 1-5 where 5 is best. Flag unsupported assumptions, overreach, over-drilling, confirmation-seeking, premature pattern formation. Thread discipline means staying with one meaningful thread rather than processing everything. The next question should make sense because of what the participant just said. Do not reward depth that was manufactured.`;

export async function POST(request:Request){
 try{
  await requireActor();if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({kind:'not_preview'},{status:404,headers});
  const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({kind:'unavailable'},{status:503,headers});
  const body=await request.json().catch(()=>({})) as {count?:number;seed?:string};const count=Math.max(1,Math.min(Number(body.count)||1,20));const results=[];let calls=0,totalTokens=0,totalLatency=0;
  for(let i=0;i<count;i++){
   const domain=DOMAINS[(i*7+(body.seed?.length??0))%DOMAINS.length],style=STYLES[(i*11+(body.seed?.charCodeAt(0)??3))%STYLES.length];
   const sc=await ai(key,`Generate one realistic synthetic lived moment for RTS testing. Domain hint: ${domain}. Participant style: ${style}. Sometimes the moment is healthy/positive and has no hidden dysfunction. privateTruth lists only things genuinely present; notPresent lists tempting but false interpretations.`,{run:i+1,seed:body.seed??'baseline'},SCENARIO_SCHEMA,'rts_lab_scenario');calls++;totalTokens+=Number(sc.meta.totalTokens);totalLatency+=sc.meta.latencyMs;
   const scenario=sc.value as Record<string,unknown>;const turns:Array<{question:string;answer:string}>=[];let question='What changed in you when it happened?',guidance='Stay with what actually stood out first.',done=false;
   for(let turn=0;turn<10&&!done;turn++){
    const ans=await ai(key,PARTICIPANT,{scenario,turns,question},ANSWER_SCHEMA,'rts_lab_answer');calls++;totalTokens+=Number(ans.meta.totalTokens);totalLatency+=ans.meta.latencyMs;const answer=String((ans.value as Record<string,unknown>).answer??'');turns.push({question,answer});
    const nxt=await ai(key,INQUIRY,{event:scenario.event,turns},NEXT_SCHEMA,'rts_lab_next');calls++;totalTokens+=Number(nxt.meta.totalTokens);totalLatency+=nxt.meta.latencyMs;const n=nxt.value as Record<string,unknown>;done=Boolean(n.complete)||n.action==='finish';if(!done){question=String(n.question||'What feels most important about that moment?');guidance=String(n.guidance||'')}
   }
   const ev=await ai(key,EVALUATOR,{scenario,turns},EVAL_SCHEMA,'rts_lab_eval');calls++;totalTokens+=Number(ev.meta.totalTokens);totalLatency+=ev.meta.latencyMs;
   results.push({run:i+1,scenario,turns,evaluation:ev.value});
  }
  return NextResponse.json({kind:'success',synthetic:true,count:results.length,summary:{calls,totalTokens,averageLatencyMs:calls?Math.round(totalLatency/calls):0},results},{headers});
 }catch(error){if(error instanceof AuthenticationRequiredError)return NextResponse.json({kind:'unauthorized'},{status:401,headers});return NextResponse.json({kind:'error',message:error instanceof Error?error.message:'unknown'},{status:500,headers})}
}
