import { NextResponse } from 'next/server';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';

export const dynamic='force-dynamic';
const noStore={'cache-control':'no-store'};

function getText(data:Record<string,unknown>){
 const output=data.output as Array<Record<string,unknown>>|undefined;
 const texts=output?.flatMap(item=>item.content as Array<Record<string,unknown>>??[]).filter(item=>item.type==='output_text'&&typeof item.text==='string');
 return texts?.length===1?String(texts[0].text):null;
}

export async function GET(request:Request){
 try{
  if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({connection:'BLOCKED',reason:'preview_only'},{status:404,headers:noStore});
  // Vercel Deployment Protection authenticates trusted GitHub OIDC callers before
  // this route executes. Browser callers still require the normal RTS review actor.
  const trustedOidc=request.headers.has('x-vercel-trusted-oidc-idp-token');
  if(!trustedOidc) await requireActor();
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey)return NextResponse.json({connection:'FAIL',keyConfigured:false,reason:'OPENAI_API_KEY is not configured in this Preview runtime'},{status:503,headers:noStore});
  const model=process.env.RTS_AWAKEN_GUIDE_MODEL??'gpt-5.4-mini';
  const started=Date.now();
  const response=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',signal:AbortSignal.timeout(15000),
   headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},
   body:JSON.stringify({
    model,store:false,
    input:[{role:'developer',content:[{type:'input_text',text:'This is an RTS server connectivity check. Return only the required structured JSON.'}]},{role:'user',content:[{type:'input_text',text:'Return connection ok.'}]}],
    text:{format:{type:'json_schema',name:'rts_connection_check',strict:true,schema:{type:'object',additionalProperties:false,required:['connection'],properties:{connection:{type:'string',enum:['ok']}}}}},
   }),
  });
  const latencyMs=Date.now()-started;
  if(!response.ok)return NextResponse.json({connection:'FAIL',keyConfigured:true,providerStatus:response.status,latencyMs},{status:502,headers:noStore});
  const data=await response.json() as Record<string,unknown>;
  const text=getText(data);
  let parsed:unknown=null; try{parsed=text?JSON.parse(text):null}catch{}
  const usage=(data.usage??{}) as Record<string,unknown>;
  const pass=!!parsed&&typeof parsed==='object'&&(parsed as Record<string,unknown>).connection==='ok';
  return NextResponse.json({connection:pass?'PASS':'FAIL',keyConfigured:true,keyExposed:false,model,latencyMs,inputTokens:usage.input_tokens??null,outputTokens:usage.output_tokens??null,totalTokens:usage.total_tokens??null,store:false},{status:pass?200:502,headers:noStore});
 }catch(error){
  if(error instanceof AuthenticationRequiredError)return NextResponse.json({connection:'BLOCKED',reason:'review_auth_required'},{status:401,headers:noStore});
  return NextResponse.json({connection:'FAIL',reason:'server_error'},{status:500,headers:noStore});
 }
}
