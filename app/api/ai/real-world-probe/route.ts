import { NextResponse } from 'next/server';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';
export const dynamic='force-dynamic'; const headers={'cache-control':'no-store','content-type':'application/json'};
const CASES=[
{id:'ee4tgim',label:'embarrassment',text:'i got a bump and a bald spot. i feel dumb <3'},
{id:'ee3b6wu',label:'gratitude/anxiety',text:'Yes I heard abt the f bombs! That has to be why. Thanks for your reply:) until then hubby and I will anxiously wait 😝'},
{id:'ed6mn9k',label:'neutral',text:'When I feel down I listen to music.'},
{id:'edmc7uh',label:'disappointment',text:'Just an employee, just stressed that it takes so long to save 10k for example and even that is nothing ! Should of brought more bitcoins'},
{id:'edp5opu',label:'disappointment',text:'Honestly, same. I was miserable at my admin asst job.'},
{id:'eeal39s',label:'relief',text:'Glad you feel better! My offer still stands though, if you need someone, I’m here'},
{id:'eet9ajx',label:'admiration/amusement',text:'Lol so petty, I kinda love it. I probably wouldn’t actually do that but it’s tempting.'},
{id:'ef1rmz9',label:'annoyance/remorse',text:'I’m sorry but as someone who travels alone I would be pissed if I was told I can’t drink at the bar by myself.'},
{id:'ee1mxhu',label:'fear',text:'I’m scared to even ask my mom, I might get yelled at 😟'},
{id:'ede596k',label:'desire/love',text:'I love it! A smile from a stranger has really turned my day around, so I always hope I can possibly do the same!'}
];
const SCHEMA={type:'object',additionalProperties:false,required:['question','relevance','shouldStop','riskFlags'],properties:{question:{type:'string'},relevance:{type:'string'},shouldStop:{type:'boolean'},riskFlags:{type:'array',items:{type:'string',enum:['leading','diagnostic','pattern-seeking','over-drilling','unsupported-assumption','none']}}}};
function out(d:Record<string,unknown>){const o=d.output as Array<Record<string,unknown>>|undefined;const xs=o?.flatMap(i=>i.content as Array<Record<string,unknown>>??[]).filter(x=>x.type==='output_text'&&typeof x.text==='string');return xs?.length===1?String(xs[0].text):null}
export async function GET(){
 try{await requireActor();if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({kind:'not_preview'},{status:404,headers});const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({kind:'unavailable'},{status:503,headers});
 const results=[];let tokens=0;
 for(const c of CASES){const started=Date.now();const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:AbortSignal.timeout(20000),headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:'gpt-5.4-mini',store:false,input:[{role:'developer',content:[{type:'input_text',text:'You are evaluating one REAL human-authored statement as a possible starting moment for RTS Awaken. Awaken helps a person notice one thing already present; it does not diagnose, construct a pattern, or excavate the whole person. Propose at most one short neutral next question grounded only in the words provided. If the statement is positive, ordinary, complete, or does not warrant inquiry, set shouldStop true and question empty. Flag leading, diagnostic, pattern-seeking, over-drilling, or unsupported assumptions; otherwise use none.'}]},{role:'user',content:[{type:'input_text',text:'[REAL_HUMAN_SOURCE_TEXT]\n'+c.text}]}],text:{format:{type:'json_schema',name:'rts_real_world_probe',strict:true,schema:SCHEMA}}})});if(!r.ok){results.push({...c,status:'error',providerStatus:r.status});continue}const d=await r.json() as Record<string,unknown>;const t=out(d);const u=(d.usage??{}) as Record<string,unknown>;tokens+=Number(u.total_tokens??0);results.push({...c,status:'success',latencyMs:Date.now()-started,totalTokens:u.total_tokens??null,result:t?JSON.parse(t):null})}
 return NextResponse.json({kind:'success',provenance:'REAL human-authored GoEmotions train.tsv samples; RTS output is MODEL-CONNECTED, not source ground truth',count:results.length,totalTokens:tokens,results},{headers});
 }catch(e){if(e instanceof AuthenticationRequiredError)return NextResponse.json({kind:'unauthorized'},{status:401,headers});return NextResponse.json({kind:'error',message:e instanceof Error?e.message:'unknown'},{status:500,headers})}}
