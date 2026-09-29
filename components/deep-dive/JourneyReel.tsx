import Link from 'next/link';

type ReelSection = Readonly<{ id: string; title: string }>;

export function JourneyReel({ sections, index, pathname }: { sections: readonly ReelSection[]; index: number; pathname: string }) {
  const progress = sections.length > 1 ? (index / (sections.length - 1)) * 100 : 100;
  return (
    <nav className="journey-reel" aria-label="Awaken journey sections">
      <div className="journey-reel__window">
        <div className="journey-reel__track" style={{ transform: `translateX(calc(50% - ${index * 11.5}rem - 5.75rem))` }}>
          {sections.map((item, itemIndex) => {
            const distance = Math.abs(itemIndex - index);
            return (
              <Link
                key={item.id}
                href={`${pathname}?section=${item.id}`}
                className="journey-reel__item"
                data-distance={Math.min(distance, 3)}
                aria-current={itemIndex === index ? 'step' : undefined}
                tabIndex={distance <= 1 ? 0 : -1}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="journey-reel__progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    </nav>
  );
}
