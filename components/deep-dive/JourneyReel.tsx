'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

type ReelSection = Readonly<{ id: string; title: string }>;
type NavigationResult = Readonly<{ destination?: string; error?: string; signIn?: boolean }>;

type JourneyReelProps = Readonly<{
  sections: readonly ReelSection[];
  currentSectionId: string;
  navigateSection: (sectionId: string) => Promise<NavigationResult>;
  label?: string;
}>;

export function JourneyReel({ sections, currentSectionId, navigateSection, label = 'Journey sections' }: JourneyReelProps) {
  const router = useRouter();
  const windowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const initializedRef = useRef(false);
  const navigatingRef = useRef(false);
  const dragRef = useRef<{ pointerId: number; startX: number; startTranslation: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const currentIndex = Math.max(0, sections.findIndex(section => section.id === currentSectionId));
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const activeIndex = Math.min(pendingIndex ?? currentIndex, sections.length - 1);
  const progress = useMemo(() => sections.length < 2 ? 1 : currentIndex / (sections.length - 1), [currentIndex, sections.length]);

  const centerItem = useCallback((index: number, instant = false) => {
    const viewport = windowRef.current;
    const track = trackRef.current;
    const item = itemRefs.current[index];
    if (!viewport || !track || !item) return;
    // End spacing allows the first and last headings to reach the true viewport center.
    track.style.paddingInline = `${viewport.clientWidth / 2}px`;
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    const translation = viewport.clientWidth / 2 - itemCenter;
    track.style.transitionDuration = instant || reducedMotion ? '0ms' : '';
    track.style.transform = `translate3d(${translation}px, 0, 0)`;
  }, [reducedMotion]);

  const closestItem = useCallback(() => {
    const viewport = windowRef.current;
    if (!viewport) return currentIndex;
    const center = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
    let nearest = currentIndex;
    let distance = Number.POSITIVE_INFINITY;
    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const rect = item.getBoundingClientRect();
      const candidateDistance = Math.abs(rect.left + rect.width / 2 - center);
      if (candidateDistance < distance) {
        distance = candidateDistance;
        nearest = index;
      }
    });
    return nearest;
  }, [currentIndex]);

  useLayoutEffect(() => {
    centerItem(currentIndex, !initializedRef.current);
    initializedRef.current = true;
  }, [centerItem, currentIndex]);

  useEffect(() => {
    if (pendingIndex !== null && pendingIndex === currentIndex) setPendingIndex(null);
  }, [currentIndex, pendingIndex]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const viewport = windowRef.current;
    if (!viewport) return;
    const recenter = () => centerItem(pendingIndex ?? currentIndex, true);
    window.addEventListener('resize', recenter);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(recenter);
    observer?.observe(viewport);
    return () => {
      window.removeEventListener('resize', recenter);
      observer?.disconnect();
    };
  }, [centerItem, currentIndex, pendingIndex]);

  const navigate = useCallback(async (index: number) => {
    const section = sections[index];
    if (!section || index === currentIndex || navigatingRef.current) return;
    navigatingRef.current = true;
    setBusy(true);
    setError('');
    setPendingIndex(index);
    centerItem(index);
    try {
      const result = await navigateSection(section.id);
      if (result.destination) router.push(result.destination);
      else {
        setPendingIndex(null);
        setError(result.error ?? 'That section is not available yet.');
        centerItem(currentIndex);
      }
    } catch {
      setPendingIndex(null);
      setError('We could not open that section. Please try again.');
      centerItem(currentIndex);
    } finally {
      navigatingRef.current = false;
      setBusy(false);
    }
  }, [centerItem, currentIndex, navigateSection, router, sections]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowLeft') nextIndex = Math.max(0, activeIndex - 1);
    if (event.key === 'ArrowRight') nextIndex = Math.min(sections.length - 1, activeIndex + 1);
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = sections.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    itemRefs.current[nextIndex]?.focus();
    void navigate(nextIndex);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' && event.button !== 0) return;
    const transform = window.getComputedStyle(trackRef.current!).transform;
    const match = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*(-?[\d.]+)/);
    const startTranslation = match ? Number(match[1]) : Number(trackRef.current?.style.transform.match(/translate3d\((-?[\d.]+)/)?.[1] ?? 0);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startTranslation, moved: false };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 4 && !drag.moved) {
      drag.moved = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    if (!drag.moved) return;
    track.style.transitionDuration = '0ms';
    track.style.transform = `translate3d(${drag.startTranslation + delta}px, 0, 0)`;
    setPendingIndex(closestItem());
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;
    suppressClickRef.current = true;
    window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    const nearest = closestItem();
    setPendingIndex(nearest);
    void navigate(nearest);
  };

  const handlePointerCancel = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setPendingIndex(null);
    centerItem(currentIndex, true);
  };

  return (
    <nav className="journey-reel" aria-label={label} onKeyDown={handleKeyDown}>
      <div ref={windowRef} className="journey-reel__window" aria-busy={busy}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}>
        <div ref={trackRef} className="journey-reel__track">
          {sections.map((section, index) => {
            const distance = Math.abs(index - activeIndex);
            return (
              <button
                key={section.id}
                ref={node => { itemRefs.current[index] = node; }}
                type="button"
                className="journey-reel__item"
                data-distance={Math.min(distance, 4)}
                data-active={index === activeIndex}
                aria-current={index === activeIndex ? 'step' : undefined}
                aria-label={section.title}
                disabled={busy}
                onClick={() => { if (!suppressClickRef.current) void navigate(index); }}
              >
                {section.title}
              </button>
            );
          })}
        </div>
      </div>
      <div className="journey-reel__progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      <p className="journey-reel__status" role={error ? 'alert' : 'status'} aria-live="polite">{error}</p>
    </nav>
  );
}
