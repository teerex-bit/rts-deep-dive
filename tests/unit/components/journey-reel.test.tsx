import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JourneyReel } from '../../../components/deep-dive/JourneyReel';
import { A1_SECTIONS } from '../../../content/deep-dive/v1';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

afterEach(() => { cleanup(); push.mockReset(); });

function renderReel(index = 3) {
  const navigateSection = vi.fn(async (id: string) => ({ destination: `/deep-dive/awaken/pay-attention?section=${id}` }));
  render(<JourneyReel sections={A1_SECTIONS} currentSectionId={A1_SECTIONS[index].id} navigateSection={navigateSection} />);
  return navigateSection;
}

describe('JourneyReel', () => {
  it('renders the ordered section headings and marks only the current section active', () => {
    renderReel(2);
    const navigation = screen.getByRole('navigation', { name: 'Journey sections' });
    const items = screen.getAllByRole('button');
    expect(items.map(item => item.textContent)).toEqual(A1_SECTIONS.map(section => section.title));
    expect(navigation.querySelector('[aria-current="step"]')).toHaveTextContent(A1_SECTIONS[2].title);
  });

  it('translates one continuous track to center the selected section', async () => {
    const navigateSection = vi.fn(async (id: string) => ({ destination: `/deep-dive/awaken/pay-attention?section=${id}` }));
    const { container } = render(<JourneyReel sections={A1_SECTIONS} currentSectionId={A1_SECTIONS[3].id} navigateSection={navigateSection} />);
    const viewport = container.querySelector('.journey-reel__window') as HTMLDivElement;
    const track = container.querySelector('.journey-reel__track') as HTMLDivElement;
    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 800 });
    screen.getAllByRole('button').forEach((item, index) => {
      Object.defineProperty(item, 'offsetLeft', { configurable: true, value: 400 + index * 200 });
      Object.defineProperty(item, 'offsetWidth', { configurable: true, value: 200 });
    });

    fireEvent.click(screen.getByRole('button', { name: A1_SECTIONS[4].title }));

    await waitFor(() => expect(track.style.transform).toBe('translate3d(-900px, 0, 0)'));
    expect(track.style.paddingInline).toBe('400px');
    expect(navigateSection).toHaveBeenCalledWith(A1_SECTIONS[4].id);
  });

  it('navigates to a visible previous section when clicked', async () => {
    const navigateSection = renderReel(3);
    fireEvent.click(screen.getByRole('button', { name: A1_SECTIONS[2].title }));
    await waitFor(() => expect(navigateSection).toHaveBeenCalledWith(A1_SECTIONS[2].id));
    expect(push).toHaveBeenCalledWith(`/deep-dive/awaken/pay-attention?section=${A1_SECTIONS[2].id}`);
  });

  it('navigates to a visible upcoming section when clicked', async () => {
    const navigateSection = renderReel(3);
    fireEvent.click(screen.getByRole('button', { name: A1_SECTIONS[4].title }));
    await waitFor(() => expect(navigateSection).toHaveBeenCalledWith(A1_SECTIONS[4].id));
    expect(push).toHaveBeenCalledWith(`/deep-dive/awaken/pay-attention?section=${A1_SECTIONS[4].id}`);
  });

  it('supports arrow-key section navigation', async () => {
    const navigateSection = renderReel(3);
    fireEvent.keyDown(screen.getByRole('navigation', { name: 'Journey sections' }), { key: 'ArrowLeft' });
    await waitFor(() => expect(navigateSection).toHaveBeenCalledWith(A1_SECTIONS[2].id));
  });

  it('drags labels through center, updates the nearest item, then snaps and navigates', async () => {
    const navigateSection = renderReel(3);
    const viewport = screen.getByRole('navigation', { name: 'Journey sections' }).querySelector('.journey-reel__window') as HTMLDivElement;
    const track = screen.getByRole('navigation', { name: 'Journey sections' }).querySelector('.journey-reel__track') as HTMLDivElement;
    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 });
    viewport.getBoundingClientRect = () => ({ left: 0, right: 300, width: 300, top: 0, bottom: 64, height: 64, x: 0, y: 0, toJSON: () => ({}) });
    screen.getAllByRole('button').forEach((item, index) => {
      Object.defineProperty(item, 'offsetLeft', { configurable: true, value: 150 + index * 200 });
      Object.defineProperty(item, 'offsetWidth', { configurable: true, value: 140 });
      item.getBoundingClientRect = () => {
        const translation = Number(track.style.transform.match(/translate3d\((-?[\d.]+)/)?.[1] ?? 0);
        const left = 150 + index * 200 + translation;
        return { left, right: left + 140, width: 140, top: 0, bottom: 64, height: 64, x: left, y: 0, toJSON: () => ({}) };
      };
    });
    fireEvent(window, new Event('resize'));

    fireEvent.pointerDown(viewport, { pointerId: 9, pointerType: 'mouse', button: 0, clientX: 220 });
    fireEvent.pointerMove(viewport, { pointerId: 9, pointerType: 'mouse', clientX: 20 });
    expect(track.style.transform).toContain('-870px');
    expect(screen.getAllByRole('button')[4]).toHaveAttribute('data-active', 'true');
    fireEvent.pointerUp(viewport, { pointerId: 9, pointerType: 'mouse', clientX: 20 });

    await waitFor(() => expect(navigateSection).toHaveBeenCalledWith(A1_SECTIONS[4].id));
    expect(push).toHaveBeenCalledWith(`/deep-dive/awaken/pay-attention?section=${A1_SECTIONS[4].id}`);
  });
});
