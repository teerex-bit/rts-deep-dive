import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SY2Lesson } from '../../../components/deep-dive/SY2Lesson';
import { SY2_SECTIONS } from '../../../content/deep-dive/v1/see-clearly/sy2';

afterEach(cleanup);
const props = { record: null, source: null, reflection: null, completed: false, reviewReflection: false, saveChain: vi.fn(), saveReflection: vi.fn(), editReflection: vi.fn() };

describe('SY2 authored flow', () => {
  it('teaches the connected formation chain before asking for a participant trace', () => {
    expect(SY2_SECTIONS.map(section => section.id)).toEqual(['entry', 'chain', 'example', 'trace', 'distinction', 'reflection', 'practice', 'carry-forward']);
    render(<SY2Lesson {...props} section={SY2_SECTIONS[1]} />);
    expect(screen.getByRole('list', { name: 'The formation chain' })).toHaveTextContent('WHAT I SEE');
    expect(screen.getByRole('list', { name: 'The formation chain' })).toHaveTextContent('HOW I LIVE');
  });
  it('offers an independent moment and a deliberate owned SY1 source without assuming its meaning', () => {
    render(<SY2Lesson {...props} section={SY2_SECTIONS[3]} source={{ id: 'owned', eventFacts: 'A message went unanswered.', automaticInterpretation: 'I felt ignored.' }} />);
    expect(screen.getByLabelText('Use a moment I wrote about earlier')).toBeInTheDocument();
    expect(screen.getByLabelText('Use another recent moment')).toBeChecked();
    expect(screen.getByText(/Don’t worry about explaining it perfectly/)).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: 'A moment you wrote about earlier' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('What was I seeing in this moment?')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Continue without saving this trace' })).toBeInTheDocument();
    const context = screen.getByRole('list', { name: 'Your place in the formation chain' });
    expect(context).toHaveTextContent('SEE');
    expect(context).toHaveTextContent('LIVE');
    expect(context.querySelectorAll('li[aria-current="step"]')).toHaveLength(1);
  });
  it('allows partial chain editing during completed review', () => {
    render(<SY2Lesson {...props} completed section={SY2_SECTIONS[3]} record={{ sourceSc1RecordId: null, sourceWasLinked: false, perception: 'I saw a pause.', belief: null, expectation: null, desire: null, intention: null, choice: null, outcome: null }} />);
    expect(screen.getByLabelText('What was I seeing in this moment?')).toHaveValue('I saw a pause.');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });
  it('starts naturally when there is no earlier moment', () => {
    render(<SY2Lesson {...props} section={SY2_SECTIONS[3]} />);
    expect(screen.getByText('Use a recent moment.')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Choose a starting point' })).not.toBeInTheDocument();
  });
  it('puts reflection context before the optional writing controls', () => {
    render(<SY2Lesson {...props} section={SY2_SECTIONS.find(section => section.id === 'reflection')!} />);
    expect(screen.getByText(/Looking backward through the moment may have helped you notice/)).toBeInTheDocument();
    expect(screen.getByText(/You do not need to settle everything here/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue without writing' })).toBeInTheDocument();
  });
});
