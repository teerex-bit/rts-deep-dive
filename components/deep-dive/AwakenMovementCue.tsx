const MOVEMENTS = ['NOTICE', 'RECOGNIZE', 'SEPARATE', 'UNDERSTAND'] as const;

export function AwakenMovementCue({ active }: { active: 1 | 2 | 3 | 4 }) {
  return <nav className="awaken-v2-movement-cue" aria-label="Awaken movement">
    <ol>{MOVEMENTS.map((movement, index) => <li key={movement} aria-current={active === index + 1 ? 'step' : undefined} className={active === index + 1 ? 'is-active' : active > index + 1 ? 'is-complete' : undefined}>
      <span>{movement}</span>
    </li>)}</ol>
  </nav>;
}
