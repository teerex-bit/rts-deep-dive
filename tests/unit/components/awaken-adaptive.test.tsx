import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { A4MomentInquiry } from '../../../components/deep-dive/A4MomentInquiry';
import { AwakenIdentityPattern } from '../../../components/deep-dive/AwakenIdentityPattern';
import { A1SimulationInquiry } from '../../../components/deep-dive/A1SimulationInquiry';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function fake(question: string, complete = false, observation = '') {
  const calls: any[] = [];
  vi.stubGlobal('fetch', async (_url: string, options: RequestInit) => { calls.push(JSON.parse(String(options.body))); return Response.json({ kind: 'success', question, guidance: '', observation, complete }); });
  return calls;
}
describe('adaptive Awaken exercises', () => {
  it('A4 asks the returned follow-up using the participant’s actual event', async () => {
    const calls = fake('How did you respond when they cut you off?');
    render(<A4MomentInquiry />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Someone cut me off in traffic' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByLabelText('How did you respond when they cut you off?')).toBeInTheDocument();
    expect(calls[0]).toMatchObject({ lesson: 'a4', turns: [{ question: 'What happened?', answer: 'Someone cut me off in traffic' }] });
  });
  it('A3 asks AI for guidance rather than mechanically constructing an identity sentence', async () => {
    const calls = fake('When did you notice yourself going quiet?');
    render(<AwakenIdentityPattern />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I go quiet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByLabelText('When did you notice yourself going quiet?')).toBeInTheDocument();
    expect(calls[0].lesson).toBe('a3');
  });
  it('preserves the answer and discloses an AI outage without substituting canned guidance', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ kind: 'unavailable' }, { status: 503 }));
    render(<A4MomentInquiry />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Someone cut me off' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Guidance is unavailable');
    expect(screen.getByRole('textbox')).toHaveValue('Someone cut me off');
    expect(screen.queryByText('What were you expecting to happen?')).not.toBeInTheDocument();
  });
  it('lets the participant reject a proposed observation and sends the correction to AI', async () => {
    const calls = fake('', true, 'You wanted safety.');
    render(<A4MomentInquiry />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I braked' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('You wanted safety.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Not quite' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I was mainly frustrated' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('You wanted safety.');
    expect(calls[1].turns.at(-1).answer).toBe('I was mainly frustrated');
    expect(screen.queryByText('You saw it.')).not.toBeInTheDocument();
  });
  it('A1 accepts uncertainty as an ending without asserting a discovery', async () => {
    fake('', true);
    render(<A1SimulationInquiry moment="My spouse was late" reaction="Anger" />);
    fireEvent.click(screen.getByRole('button', { name: 'Look at the moment' }));
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    expect(await screen.findByText('You can leave this open.')).toBeInTheDocument();
    expect(screen.queryByText('You saw it.')).not.toBeInTheDocument();
  });
});

it('ends at eight answers even if the provider keeps asking, without claiming an insight', async () => {
  let count = 0;
  vi.stubGlobal('fetch', async () => Response.json({ kind: 'success', question: `Question ${++count}?`, guidance: '', observation: '', complete: false }));
  render(<A4MomentInquiry />);
  for (let index = 0; index < 8; index++) {
    fireEvent.change(screen.getByRole('textbox'), { target: { value: `Answer ${index}` } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    if (index < 7) await screen.findByLabelText(`Question ${index + 1}?`);
  }
  expect(await screen.findByText('You can leave this open.')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

it('allows tapping out before any AI request', () => {
  let called = false;
  vi.stubGlobal('fetch', async () => { called = true; throw new Error(); });
  render(<A4MomentInquiry />);
  fireEvent.click(screen.getByRole('button', { name: 'I’m ready to move on' }));
  expect(screen.getByText('You can leave this open.')).toBeInTheDocument();
  expect(called).toBe(false);
});
