import { requireActor } from '../auth/require-actor';
import { seeClearlyRecapRepository } from '../data/see-clearly-recap-repository';
export async function getSeeClearlyRecap() {
  const actor = await requireActor();
  return seeClearlyRecapRepository().get(actor.id);
}
export async function confirmSeeClearlyRecap(input: { fingerprint: string; narrative: string; clarification: string; carryForward: string }) {
  const actor = await requireActor();
  return seeClearlyRecapRepository().confirm(actor.id, input);
}
