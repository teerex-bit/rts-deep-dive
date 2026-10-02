'use client';
import { useState } from 'react';
import { AwakenGuidedInquiry } from './AwakenGuidedInquiry';
export function A1SimulationInquiry({ moment, reaction }: { moment: string; reaction: string }) {
  const [started, setStarted] = useState(false);
  if (!started) return <section className="awaken-inquiry-bridge"><p className="eyebrow">STAY WITH THE MOMENT</p><h2>Look at what you noticed.</h2><p>{reaction ? <>You called it <strong>{reaction.toLowerCase()}</strong>. </> : null}Stay with this moment only as long as it helps.</p><button type="button" className="button" onClick={() => setStarted(true)}>Look at the moment</button></section>;
  return <AwakenGuidedInquiry lesson="a1" moment={moment} reaction={reaction} initialQuestion="What did you notice when it happened?" />;
}
