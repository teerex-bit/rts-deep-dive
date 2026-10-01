import Link from 'next/link';

const handoffs = {
  a1: { title: 'Catch yourself being you', href: '/deep-dive/awaken/catch-yourself-being-you' },
  a2: { title: 'Separate · A3: Is This Who I Am?', href: '/deep-dive/awaken/your-reactions-have-a-history' },
  a3: { title: 'Understand · A4: What Is Shaping This Response?', href: '/deep-dive/awaken/formation-is-not-identity' },
  a4: { title: 'See Clearly', href: '/deep-dive/see-clearly' },
} as const;

export function AwakenCompletionNav({ module }: { module: keyof typeof handoffs }) {
  const next = handoffs[module];
  if (module === 'a1') return <nav className="deep-dive-completion-actions deep-dive-completion-actions--pause" aria-label="Continue your journey">
    <Link className="button button--secondary" href="/deep-dive/awaken">Back to Awaken</Link>
    <div><p className="eyebrow">NEXT</p><p className="deep-dive-transition__title">{next.title}</p><Link className="button" href={next.href}>NEXT</Link></div>
  </nav>;
  return <nav className="deep-dive-completion-actions" aria-label="Continue your journey">
    <div><p className="eyebrow">NEXT</p><p className="deep-dive-transition__title">{next.title}</p><Link className="button" href={next.href}>NEXT</Link></div>
    <Link className="deep-dive-completion-actions__back" href="/deep-dive/awaken">Back to Awaken</Link>
  </nav>;
}
