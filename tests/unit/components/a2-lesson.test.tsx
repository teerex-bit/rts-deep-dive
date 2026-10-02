import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { A2Lesson } from '../../../components/deep-dive/A2Lesson';
import { A2_SECTIONS } from '../../../content/deep-dive/v1/awaken/catch-yourself-being-you';
import StagePage from '../../../app/(app)/deep-dive/[stageId]/page';

vi.mock('../../../server/services/deep-dive-service', () => ({
  getA1: vi.fn(async () => null), getA2: vi.fn(async () => null),
  getA3: vi.fn(async () => null), getA4: vi.fn(async () => null),
}));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('A2 participant experience', () => {
  it('teaches the pattern and preserves the passage attribution', () => {
    const section = A2_SECTIONS.find(item => item.id === 'scripture')!;
    render(<A2Lesson editReflection={vi.fn()} section={section} reflection={null} saveReflection={vi.fn()} />);

    expect(screen.getByRole('figure', { name: /James 1:23–24/i })).toBeInTheDocument();
    expect(screen.getByText(/World English Bible/)).toBeInTheDocument();
    expect(screen.getByText(/seeing a repeated response is not condemnation/i)).toBeInTheDocument();
  });

  it('saves and confirms the private reflection only after the server action succeeds', async () => {
    let confirmSave!: () => void;
    const saveReflection = vi.fn(() => new Promise<{ saved: boolean }>(resolve => {
      confirmSave = () => resolve({ saved: true });
    }));
    render(<A2Lesson editReflection={vi.fn()} section={A2_SECTIONS.find(item => item.id === 'reflection')!} reflection="Saved thought" saveReflection={saveReflection} />);

    expect(screen.getByLabelText('What would you like to keep in your own words?')).toHaveValue('Saved thought');
    expect(screen.getByRole('button', { name: 'Save & continue' })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('What would you like to keep in your own words?'), { target: { value: 'A thought worth keeping' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save & continue' }));
    await waitFor(() => expect(saveReflection).toHaveBeenCalledOnce());
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    confirmSave();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Reflection saved.'));
  });

  it('keeps whitespace-only text unsavable and permits continuing without writing', async () => {
    const saveReflection = vi.fn(async () => ({ saved: false }));
    render(<A2Lesson editReflection={vi.fn()} section={A2_SECTIONS.find(item => item.id === 'reflection')!} reflection={null} saveReflection={saveReflection} />);
    fireEvent.change(screen.getByLabelText('What would you like to keep in your own words?'), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Save & continue' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue without writing' }));
    await waitFor(() => expect(saveReflection).toHaveBeenCalledOnce());
  });

  it('clearly teaches a no-interpretation daily practice', () => {
    render(<A2Lesson editReflection={vi.fn()} section={A2_SECTIONS.find(item => item.id === 'practice')!} reflection={null} saveReflection={vi.fn()} />);

    expect(screen.getByRole('region', { name: 'Practice for the next few days' })).toHaveTextContent('notice when a familiar response appears');
    expect(screen.getByRole('region', { name: 'Practice for the next few days' })).toHaveTextContent(/collect observations/i);
  });





  it('opens with ordinary situations before teaching the idea of patterns', () => {
    render(<A2Lesson editReflection={vi.fn()} section={A2_SECTIONS[0]} reflection={null} saveReflection={vi.fn()} />);
    expect(screen.getByText('Someone misunderstands you.')).toBeInTheDocument();
    expect(screen.getByText('Plans suddenly change.')).toBeInTheDocument();
    expect(screen.getByText(/Different situations\. Something about your response may still be familiar\./)).toBeInTheDocument();
  });



  it('retains private wording and a retry action after a failed reflection save', async () => {
    const saveReflection = vi.fn(async () => ({ saved: false, error: 'Could not save your reflection. Please try again.' }));
    render(<A2Lesson editReflection={vi.fn()} section={A2_SECTIONS.find(item => item.id === 'reflection')!} reflection={null} saveReflection={saveReflection} />);
    fireEvent.change(screen.getByLabelText('What would you like to keep in your own words?'), { target: { value: 'My own words' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save & continue' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save');
    expect(screen.getByLabelText('What would you like to keep in your own words?')).toHaveValue('My own words');
    expect(screen.getByRole('button', { name: 'Save & continue' })).toBeEnabled();
  });

  it('makes NOTICE, NAME, ASK, RECEIVE a navigable practice without optional labels', () => {
    render(<A2Lesson editReflection={vi.fn()} section={A2_SECTIONS.find(item => item.id === 'go-deeper')!} reflection={null} saveReflection={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'ASK' }));
    expect(screen.getByRole('region', { name: 'ASK' })).toHaveTextContent('God, what do You want me to see here?');
    fireEvent.click(screen.getByRole('button', { name: 'RECEIVE' }));
    expect(screen.getByRole('region', { name: 'RECEIVE' })).toHaveTextContent(/stay with what becomes clear/i);
    expect(screen.queryByText(/optional/i)).not.toBeInTheDocument();
  });

  it('allows completed reflection revision', () => {
    render(<A2Lesson editReflection={vi.fn()} section={A2_SECTIONS.find(item => item.id === 'reflection')!} reflection="Saved thought" saveReflection={vi.fn()} review />);
    expect(screen.getByLabelText('What would you like to keep in your own words?')).toHaveValue('Saved thought');
    expect(screen.getByRole('button', { name: 'Save reflection' })).toBeDisabled();
  });

  it('offers both lessons from the Awaken stage page', async () => {
    render(await StagePage({ params: Promise.resolve({ stageId: 'awaken' }) }));

    expect(screen.getByRole('link', { name: 'Begin Pay Attention · A1' })).toHaveAttribute('href', '/deep-dive/awaken/pay-attention');
    expect(screen.getByRole('link', { name: 'Begin Catch Yourself Being You · A2' })).toHaveAttribute('href', '/deep-dive/awaken/catch-yourself-being-you');
  });
  it('carries the participant conversation into guided reflection without saving AI words automatically', async () => {
    const requests: any[] = [];
    vi.stubGlobal('fetch', async (_url: string, options: RequestInit) => {
      requests.push(JSON.parse(String(options.body)));
      return Response.json({ kind: 'success', question: '', guidance: '', observation: 'You may notice yourself going quiet.', complete: true });
    });
    const props = { editReflection: vi.fn(), reflection: null, saveReflection: vi.fn() };
    const view = render(<A2Lesson {...props} section={A2_SECTIONS.find(s => s.id === 'patterns')!} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I went quiet when my plan changed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('You may notice yourself going quiet.');
    expect(props.saveReflection).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'That fits' }));
    view.rerender(<A2Lesson {...props} section={A2_SECTIONS.find(s => s.id === 'reflection')!} />);
    expect(screen.getByLabelText('What would you like to keep in your own words?')).toHaveValue('You may notice yourself going quiet.');
    fireEvent.change(screen.getByLabelText('Looking back, what stands out to you?'), { target: { value: 'The quiet response' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('You may notice yourself going quiet.');
    expect(requests[1]).toMatchObject({ lesson: 'a2', phase: 'reflection', context: [{ question: 'What happened in one recent moment?', answer: 'I went quiet when my plan changed' }] });
    expect(props.saveReflection).not.toHaveBeenCalled();
  });

});
