'use client';
import {useState} from 'react';

export default function AwakenAILab(){
 const [status,setStatus]=useState('READY');
 const [result,setResult]=useState<unknown>(null);
 async function run(path:string){
  setStatus('RUNNING');setResult(null);
  try{const r=await fetch(path,{cache:'no-store'});const j=await r.json();setResult(j);setStatus(r.ok?'COMPLETE':'FAILED')}catch(e){setStatus('FAILED');setResult({error:String(e)})}
 }
 return <main style={{maxWidth:1100,margin:'0 auto',padding:'48px 24px',fontFamily:'system-ui'}}>
  <p style={{letterSpacing:'.18em',fontSize:12}}>RTS · AWAKEN</p>
  <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(42px,7vw,76px)',fontWeight:400,margin:'12px 0'}}>Inquiry Lab</h1>
  <p style={{maxWidth:720,lineHeight:1.7}}>Preview-only evaluation surface. OpenAI credentials remain server-side in Vercel. Participant-facing A1 is not modified by lab runs.</p>
  <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,margin:'36px 0'}}>
   <button onClick={()=>run('/api/ai/connection-check')} style={{padding:22,textAlign:'left'}}>1 · Check OpenAI connection</button>
   <button onClick={()=>run('/api/ai/a1-smoke-test')} style={{padding:22,textAlign:'left'}}>2 · Run A1 smoke test</button>
   <button onClick={()=>run('/api/ai/real-world-probe')} style={{padding:22,textAlign:'left'}}>3 · Run real-world probe</button>
  </section>
  <div style={{borderTop:'1px solid #c9a55b',paddingTop:22}}><strong>Status: {status}</strong></div>
  {result?<pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',marginTop:20,padding:20,background:'#f4efe4',lineHeight:1.5}}>{JSON.stringify(result,null,2)}</pre>:null}
 </main>
}
