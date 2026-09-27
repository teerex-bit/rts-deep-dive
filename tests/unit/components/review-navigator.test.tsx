import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReviewNavigator } from '../../../components/design-system/ReviewNavigator';

let currentPath = '/deep-dive/awaken/pay-attention';
let currentSection = 'entry';
vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
  useSearchParams: () => new URLSearchParams({ section: currentSection }),
}));

const stages = [{ stage: 'AWAKEN', lessons: [{ title: 'Pay Attention', path: '/deep-dive/awaken/pay-attention', sections: [
  { id: 'entry', title: 'Welcome', href: '/deep-dive/awaken/pay-attention?section=entry&reviewJump=token' },
  { id: 'reflection', title: 'Notice it', href: '/deep-dive/awaken/pay-attention?section=reflection&reviewJump=token' },
] }] }];

describe('review navigator location changes', () => {
  it('closes its panel after a section jump and identifies the new location when reopened', () => {
    currentPath = '/deep-dive/awaken/pay-attention'; currentSection = 'entry';
    const { rerender } = render(<ReviewNavigator stages={stages} />);
    fireEvent.click(screen.getByText('REVIEW NAVIGATOR'));
    expect(screen.getByText('REVIEW NAVIGATOR').closest('details')).toHaveProperty('open', true);
    currentSection = 'reflection';
    rerender(<ReviewNavigator stages={stages} />);
    expect(screen.getByText('REVIEW NAVIGATOR').closest('details')).toHaveProperty('open', false);
    fireEvent.click(screen.getByText('REVIEW NAVIGATOR'));
    expect(screen.getByRole('navigation', { name: 'Review navigator' })).toHaveTextContent('AWAKEN / Pay Attention / Notice it');
  });
});
