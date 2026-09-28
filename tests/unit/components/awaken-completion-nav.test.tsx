import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AwakenCompletionNav } from '../../../components/deep-dive/AwakenCompletionNav';

afterEach(cleanup);

describe('completed Awaken lesson navigation', () => {
  const handoffs = [
    ['a1', 'Catch yourself being you', '/deep-dive/awaken/catch-yourself-being-you'],
    ['a2', 'Your Reactions Have a History', '/deep-dive/awaken/your-reactions-have-a-history'],
    ['a3', 'Formation Is Not Identity', '/deep-dive/awaken/formation-is-not-identity'],
    ['a4', 'See Clearly', '/deep-dive/see-clearly'],
  ] as const;

  for (const [module, title, href] of handoffs) {
    it(`${module} presents a forward link and a quiet route back to Awaken`, () => {
      render(<AwakenCompletionNav module={module} />);
      const forward = screen.getByRole('link', { name: 'NEXT' });
      expect(forward).toHaveAttribute('href', href);
      const destination = screen.getByText(title);
      expect(destination).toBeInTheDocument();
      expect(destination.compareDocumentPosition(forward) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(forward.textContent).not.toContain(title);
      expect(screen.getByRole('link', { name: 'Back to Awaken' })).toHaveAttribute('href', '/deep-dive/awaken');
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });
  }
  it('lets A1 end with a quiet return while leaving A2 available', () => {
    render(<AwakenCompletionNav module="a1" />);
    const forwardLink = screen.getByRole('link', { name: 'NEXT' });
    const returnLink = screen.getByRole('link', { name: 'Back to Awaken' });
    expect(returnLink).toHaveTextContent('Back to Awaken');
    expect(returnLink).toHaveClass('button--secondary');
    expect(screen.getByText('Catch yourself being you')).toBeInTheDocument();
    expect(forwardLink).toHaveClass('button');
  });
});
