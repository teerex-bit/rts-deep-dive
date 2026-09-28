import type { BridgeDefinition } from '../../domain/curriculum';
import Link from 'next/link';
import { Teaching } from './Teaching';
import { PHASE_1_NODES } from '../../content/phase-1/v1/curriculum';

export function Bridge({ content }: { content: BridgeDefinition }) {
  const target = PHASE_1_NODES.find(node => node.id === content.targetNodeId);
  const nextTitle = target?.content.kind === 'interaction' ? target.content.title ?? target.content.prompt : target?.content.kind === 'session' || target?.content.kind === 'module' ? target.content.title : undefined;
  return <><Teaching title={content.title}>{content.teaching}</Teaching><div><p className="eyebrow">NEXT</p>{nextTitle ? <p className="deep-dive-transition__title">{nextTitle}</p> : null}<Link className="button" href={`/formation/${content.targetNodeId}`}>NEXT</Link></div></>;
}
