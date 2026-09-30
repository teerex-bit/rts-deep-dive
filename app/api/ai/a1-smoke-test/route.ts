import { NextResponse } from 'next/server';
import { requireActor, AuthenticationRequiredError } from '../../../../server/auth/require-actor';

export const dynamic='force-dynamic';
const noStore={'cache-control':'no-store'};

async function call(origin:string,cookie:string,body:unknown){
 const response=await fetch(origin+'/api/ai/awaken-guide',{method:'POST',headers:{'content-type':'application/json',cookie,origin},body:JSON.stringify(body),cache:'no-store'});
 const text=await response.text(); let data:unknown; try{data=JSON.parse(text)}catch{data={raw:text.slice(0,500)}}
 return {status:response.status,data};
}
export async function GET(request:Request){
 try{
  await requireActor();
  if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({test:'BLOCKED',reason:'preview_only'},{status:404,headers:noStore});
  const url=new URL(request.url), origin=url.origin, cookie=request.headers.get('cookie')??'';
  const synthetic={moment:'A man cut in line at the grocery store.',reaction:'Anger',turns:[{question:'What was it about that moment that brought up anger for you?',answer:'Everyone else had been waiting and it felt unfair that he acted like the rules did not apply to him.'}]};
  const next=await call(origin,cookie,{...synthetic,mode:'next'});
  if(next.status!==200)return NextResponse.json({test:'FAIL',stage:'next',next},{status:502,headers:noStore});
  const nextData=next.data as Record<string,unknown>;
  const generatedQuestion=typeof nextData.question==='string'?nextData.question:'';
  const completedTurns=[...synthetic.turns,{question:generatedQuestion||'What happened next?',answer:'I stayed quiet, but I kept thinking that I should have said something.'}];
  const synthesis=await call(origin,cookie,{moment:synthetic.moment,reaction:synthetic.reaction,turns:completedTurns,mode:'synthesis'});
  if(synthesis.status!==200)return NextResponse.json({test:'FAIL',stage:'synthesis',next:next.data,synthesis},{status:502,headers:noStore});
  return NextResponse.json({test:'PASS',synthetic:true,next:next.data,synthesis:synthesis.data,note:'No participant data was used or stored.'},{headers:noStore});
 }catch(error){
  if(error instanceof AuthenticationRequiredError)return NextResponse.json({test:'BLOCKED',reason:'review_auth_required'},{status:401,headers:noStore});
  return NextResponse.json({test:'FAIL',reason:'server_error'},{status:500,headers:noStore});
 }
}
