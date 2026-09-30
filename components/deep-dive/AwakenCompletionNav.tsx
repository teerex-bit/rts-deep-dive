'use client';

import Link from 'next/link';

const handoffs = {
 a1:{title:'Catch Yourself Being You',href:'/deep-dive/awaken/catch-yourself-being-you'},
 a2:{title:'A Response Is Not an Identity',href:'/deep-dive/awaken/your-reactions-have-a-history'},
 a3:{title:'See the Moment in Slow Motion',href:'/deep-dive/awaken/formation-is-not-identity'},
} as const;

function clearActiveMoment(){
 try{
  localStorage.removeItem('rts-awaken-lived-moment');
  localStorage.removeItem('rts-awaken-active-cycle');
  sessionStorage.removeItem('rts-awaken-active-cycle');
  sessionStorage.setItem('rts-awaken-reset-requested','1');
 }catch{}
}

export function AwakenCompletionNav({module}:{module:'a1'|'a2'|'a3'|'a4'}){
 if(module!=='a4'){
  const next=handoffs[module];
  return <nav className="deep-dive-completion-actions" aria-label="Continue Awaken">
   <div><p className="eyebrow">NEXT</p><p className="deep-dive-transition__title">{next.title}</p><Link className="button" href={next.href}>NEXT</Link></div>
   <Link className="deep-dive-completion-actions__back" href="/deep-dive/awaken">Back to Awaken</Link>
  </nav>;
 }
 return <section className="awaken-finale">
  <div className="awaken-finale__statement">
   <p className="eyebrow">AWAKEN · COMPLETE</p>
   <h2>Your response had a before.</h2>
   <p>You saw something that used to happen without your awareness.</p>
   <strong>That creates possibility.</strong>
  </div>
  <div className="awaken-finale__actions">
   <Link className="button" href="/deep-dive/see-clearly">Continue to See Clearly</Link>
   <Link className="button button--secondary" href="/deep-dive/awaken/pay-attention" onClick={clearActiveMoment}>Try another moment</Link>
   <button className="awaken-finale__quiet" type="button" onClick={()=>document.getElementById('awaken-deeper')?.scrollIntoView({behavior:'smooth'})}>Go deeper with this moment</button>
  </div>
  <div id="awaken-deeper" className="awaken-finale__deeper">
   <p className="eyebrow">IF YOU WANT TO STAY HERE</p>
   <h3>You do not have to be finished with the moment because the cycle is complete.</h3>
   <p>Return to what became visible and stay with one thing. You do not need to repeat every step or search for a larger explanation.</p>
  </div>
 </section>;
}
