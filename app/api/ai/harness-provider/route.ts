import { NextResponse } from 'next/server';
import { isSameOriginRequest } from '../../../../server/http/same-origin';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';

const headers={'cache-control':'no-store','content-type':'application/json'};
const ALLOWED_MODELS=new Set(['gpt-5.4-mini','gpt-5.4-nano','gpt-6-luna']);

type Body={model?:string;instructions:string;input:unknown;schema:{name:string;schema:Record<string,unknown>}};

function outputText(data:Record<string,unknown>){
 const output=data.output as Array<Record<string,unknown>>|undefined;
 const texts=output?.flatMap(item=>item.content as Array<Record<string,unknown>>??[]).filter(item=>item.type==='output_text'&&typeof item.text==='string');
 return texts?.length===1?String(texts[0].text):null;
}

export async function POST(request:Request){
 try{
  await requireActor();
  if(process.env.VERCEL_ENV!=='preview')return new Response(JSON.stringify({kind:'not_preview'}),{status:404,headers});
  if(!isSameOriginRequest(request))return new Response(JSON.stringify({kind:'forbidden'}),{status:403,headers});
  const body=await request.json() as Body;
  if(!body||typeof body.instructions!=='string'||body.instructions.length>16000||!body.schema||typeof body.schema.name!=='string'||!body.schema.schema)return new Response(JSON.stringify({kind:'invalid_request'}),{status:400,headers});
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey)return new Response(JSON.stringify({kind:'unavailable'}),{status:503,headers});
  const model=body.model&&ALLOWED_MODELS.has(body.model)?body.model:(process.env.RTS_AWAKEN_GUIDE_MODEL??'gpt-5.4-mini');
  const started=Date.now();
  const response=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',signal:AbortSignal.timeout(30000),
   headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},
   body:JSON.stringify({
    model,store:false,
    input:[
     {role:'developer',content:[{type:'input_text',text:body.instructions}]},
     {role:'user',content:[{type:'input_text',text:'[HARNESS_DATA_UNTRUSTED]\n'+JSON.stringify(body.input)}]},
    ],
    text:{format:{type:'json_schema',name:body.schema.name,strict:true,schema:body.schema.schema}},
   }),
  });
  if(!response.ok)return new Response(JSON.stringify({kind:'provider_error',status:response.status}),{status:502,headers});
  const data=await response.json() as Record<string,unknown>;
  const text=outputText(data); if(!text)return new Response(JSON.stringify({kind:'invalid_provider_output'}),{status:502,headers});
  let value:unknown; try{value=JSON.parse(text)}catch{return new Response(JSON.stringify({kind:'invalid_provider_output'}),{status:502,headers})}
  const usage=(data.usage??{}) as Record<string,unknown>;
  return NextResponse.json({kind:'success',value,meta:{model,latencyMs:Date.now()-started,inputTokens:usage.input_tokens??null,outputTokens:usage.output_tokens??null,totalTokens:usage.total_tokens??null,providerRequestId:typeof data.id==='string'?data.id:null}},{headers});
 }catch(error){
  if(error instanceof AuthenticationRequiredError)return new Response(JSON.stringify({kind:'unauthorized'}),{status:401,headers});
  return new Response(JSON.stringify({kind:'server_error'}),{status:500,headers});
 }
}
