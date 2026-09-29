import Link from 'next/link';

type ReelSection = Readonly<{ id: string; title: string }>;

export function JourneyReel({ sections, index, pathname }: { sections: readonly ReelSection[]; index: number; pathname: string }) {
  const previous = index > 0 ? sections[index - 1] : null;
  const current = sections[index];
  const next = index < sections.length - 1 ? sections[index + 1] : null;
  const progress = sections.length > 1 ? (index / (sections.length - 1)) * 100 : 100;

  const item = (section: ReelSection | null, position: 'previous' | 'current' | 'next') => (
    <div className={`journey-reel__slot journey-reel__slot--${position}`}>
      {section ? (
        <Link
          href={`${pathname}?section=${section.id}`}
          className="journey-reel__item"
          aria-current={position === 'current' ? 'step' : undefined}
        >
          {section.title}
        </Link>
      ) : null}
    </div>
  );

  return (
    <nav className="journey-reel journey-reel--three" aria-label="Awaken journey sections">
      <div className="journey-reel__window">
        <div className="journey-reel__three-track">
          {item(previous, 'previous')}
          {item(current, 'current')}
          {item(next, 'next')}
        </div>
      </div>
      <div className="journey-reel__progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    </nav>
  );
}
