import Link from 'next/link';

type ReelSection = Readonly<{ id: string; title: string }>;

export function JourneyReel({ sections, index, pathname }: { sections: readonly ReelSection[]; index: number; pathname: string }) {
  const progress = sections.length > 1 ? (index / (sections.length - 1)) * 100 : 100;
  const visible = [-3, -2, -1, 0, 1, 2, 3].map(offset => ({ offset, section: sections[index + offset] ?? null }));

  return (
    <nav className="journey-reel journey-reel--anchored" aria-label="Awaken journey sections">
      <div className="journey-reel__window">
        <div className="journey-reel__anchored-track">
          {visible.map(({ offset, section }) => (
            <div className="journey-reel__anchored-slot" data-offset={offset} key={offset}>
              {section ? (
                <Link
                  href={`${pathname}?section=${section.id}`}
                  className="journey-reel__item"
                  aria-current={offset === 0 ? 'step' : undefined}
                >
                  {section.title}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="journey-reel__progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    </nav>
  );
}
