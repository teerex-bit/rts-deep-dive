import { NextResponse } from 'next/server';
export const dynamic='force-dynamic';
export const maxDuration=300;
const headers={'cache-control':'no-store','content-type':'application/json'};
const SCHEMA={type:'object',additionalProperties:false,required:['question','relevance','shouldStop','riskFlags'],properties:{question:{type:'string'},relevance:{type:'string'},shouldStop:{type:'boolean'},riskFlags:{type:'array',items:{type:'string',enum:['leading','diagnostic','pattern-seeking','over-drilling','unsupported-assumption','none']}}}};
function out(d:Record<string,unknown>){const o=d.output as Array<Record<string,unknown>>|undefined;const xs=o?.flatMap(i=>i.content as Array<Record<string,unknown>>??[]).filter(x=>x.type==='output_text'&&typeof x.text==='string');return xs?.length===1?String(xs[0].text):null}
export async function GET(){
 const batchStarted=Date.now();
 try{
  if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({kind:'not_preview'},{status:404,headers});
  const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({kind:'unavailable',reason:'missing_openai_key'},{status:503,headers});
  const datasetUrl='https://datasets-server.huggingface.co/rows?dataset=SetFit%2Fgo_emotions&config=default&split=train&offset=1200&length=50';
  const sourceStarted=Date.now();const source=await fetch(datasetUrl,{cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(!source.ok)return NextResponse.json({kind:'source_error',status:source.status},{status:502,headers});
  const sourceJson=await source.json() as {rows?:Array<{row_idx:number,row?:Record<string,unknown>}>};
  const rows=(sourceJson.rows??[]).slice(0,50);const sourceFetchMs=Date.now()-sourceStarted;
  const results=[];let totalTokens=0,providerFailures=0;
  for(const item of rows){
   const text=String(item.row?.text??'').trim();if(!text)continue;
   const labels=Object.entries(item.row??{}).filter(([k,v])=>k!=='text'&&Number(v)===1).map(([k])=>k);
   const started=Date.now();
   try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:AbortSignal.timeout(30000),headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:'gpt-5.4-mini',store:false,input:[{role:'developer',content:[{type:'input_text',text:'You are evaluating one REAL human-authored statement as a possible starting moment for RTS Awaken. Awaken helps a person notice one thing already present; it does not diagnose, construct a pattern, or excavate the whole person. Propose at most one short neutral next question grounded only in the words provided. If the statement is positive, ordinary, complete, or does not warrant inquiry, set shouldStop true and question empty. Flag leading, diagnostic, pattern-seeking, over-drilling, or unsupported assumptions; otherwise use none.'}]},{role:'user',content:[{type:'input_text',text:'[REAL_HUMAN_SOURCE_TEXT]\n'+text}]}],text:{format:{type:'json_schema',name:'rts_real_world_probe',strict:true,schema:SCHEMA}}})});
    if(!r.ok){providerFailures++;results.push({sourceRow:item.row_idx,labels,text,status:'error',providerStatus:r.status,latencyMs:Date.now()-started});continue}
    const d=await r.json() as Record<string,unknown>;const usage=(d.usage??{}) as Record<string,unknown>;const tokens=Number(usage.total_tokens??0);totalTokens+=tokens;const t=out(d);
    results.push({sourceRow:item.row_idx,labels,text,status:'success',latencyMs:Date.now()-started,inputTokens:usage.input_tokens??null,outputTokens:usage.output_tokens??null,totalTokens:tokens,result:t?JSON.parse(t):null});
   }catch(e){providerFailures++;results.push({sourceRow:item.row_idx,labels,text,status:'error',error:e instanceof Error?e.message:'unknown',latencyMs:Date.now()-started})}
  }
  const latencies=results.filter(r=>r.status==='success').map(r=>Number(r.latencyMs)).sort((a,b)=>a-b);const avg=latencies.length?Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length):0;const p=(q:number)=>latencies.length?latencies[Math.min(latencies.length-1,Math.floor((latencies.length-1)*q))]:0;
  const stopped=results.filter((r:any)=>r.status==='success'&&r.result?.shouldStop===true).length;const questioned=results.filter((r:any)=>r.status==='success'&&r.result?.shouldStop===false).length;const riskFlagged=results.filter((r:any)=>r.status==='success'&&Array.isArray(r.result?.riskFlags)&&r.result.riskFlags.some((x:string)=>x!=='none')).length;
  return NextResponse.json({kind:'success',provenance:'REAL human-authored SetFit/go_emotions (GoEmotions simplified train); fixed rows 1200-1249',count:results.length,summary:{sourceFetchMs,batchWallClockMs:Date.now()-batchStarted,successful:results.length-providerFailures,providerFailures,stopped,questioned,riskFlagged,totalTokens,averageLatencyMs:avg,p50LatencyMs:p(.5),p95LatencyMs:p(.95)},results},{headers});
 }catch(e){return NextResponse.json({kind:'error',message:e instanceof Error?e.message:'unknown',batchWallClockMs:Date.now()-batchStarted},{status:500,headers})}
}
