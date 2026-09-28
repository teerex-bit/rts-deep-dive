import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { A3Lesson, A4Lesson } from '../../../components/deep-dive/A3A4Lesson';
import { A3_SECTIONS, A4_SECTIONS } from '../../../content/deep-dive/v1/awaken/four-module-lessons';

afterEach(cleanup);

const base = { editReflection: vi.fn(), reflection: null, saveReflection: vi.fn() };

describe('A3 separates identity from learned patterns', () => {
  it('begins with an observation and guides the participant one step at a time', () => {
    render(<A3Lesson {...base} section={A3_SECTIONS.find(s => s.id === 'trace')!} />);
    expect(screen.getByText(/Start with whatever you have noticed/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Something I notice myself doing')).toBeInTheDocument();
    expect(screen.queryByLabelText('A situation where I notice it')).not.toBeInTheDocument();
  });

  it('builds a direct wording comparison and accepts uncertainty without interpretation', () => {
    render(<A3Lesson {...base} section={A3_SECTIONS.find(s => s.id === 'trace')!} />);
    fireEvent.change(screen.getByLabelText('Something I notice myself doing'), { target: { value: 'I like ice cream' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    fireEvent.change(screen.getByLabelText('A situation where I notice it'), { target: { value: 'weekends' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    expect(screen.getByLabelText(/what am I tempted to say about myself/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    const comparison = screen.getByRole('region', { name: 'Notice the difference' });
    expect(comparison).toHaveTextContent('I’m not sure');
    expect(comparison).toHaveTextContent('I am __________.');
    expect(comparison).toHaveTextContent('I tend to I like ice cream when weekends.');
    expect(comparison).not.toHaveTextContent(/this means|learned to respond|your past|protect yourself/i);
    expect(screen.getByText(/What you say about yourself is a conclusion/i)).toBeInTheDocument();
    expect(screen.getByText(/What you noticed yourself doing in a particular kind of moment describes a pattern/i)).toBeInTheDocument();
  });

  it('keeps reflection open and makes the saved prompt ask what the participant notices', () => {
    const section = A3_SECTIONS.find(s => s.id === 'reflection')!;
    render(<A3Lesson {...base} section={section} />);
    expect(screen.getByLabelText('What difference do you notice?')).toBeInTheDocument();
    expect(section.prompt).toBe('What difference do you notice?');
    expect(screen.getByRole('button', { name: 'Continue without writing' })).toBeEnabled();
  });
});

describe('A4 understands what may be moving underneath a response', () => {
  it('guides one recent moment through expectation, desire, fear, and importance', () => {
    render(<A4Lesson {...base} section={A4_SECTIONS.find(s => s.id === 'trace')!} />);
    expect(screen.getByLabelText('What happened?')).toBeInTheDocument();
    expect(screen.queryByLabelText('What were you expecting to happen?')).not.toBeInTheDocument();
    const answers = [
      ['What happened?', 'A decision was questioned'],
      ['What were you expecting to happen?', 'They would stop trusting me'],
      ['What did you want to happen?', 'To be understood'],
      ['What were you afraid might happen?', 'I would lose respect'],
      ['What felt threatened or important here?', 'Being respected'],
    ];
    for (const [label, answer] of answers) {
      fireEvent.change(screen.getByLabelText(label), { target: { value: answer } });
      fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    }
    const moment = screen.getByRole('region', { name: 'Looking across this moment' });
    expect(moment).toHaveTextContent('A decision was questioned');
    expect(moment).toHaveTextContent('They would stop trusting me');
    expect(moment).toHaveTextContent('To be understood');
    expect(moment).toHaveTextContent('I would lose respect');
    expect(moment).toHaveTextContent('Being respected');
    expect(moment).toHaveTextContent('What do you notice underneath your response?');
    expect(moment).not.toHaveTextContent(/this means|you do this because/i);
  });

  it('allows “I’m not sure” and introduces threatened concerns only after teaching', () => {
    render(<A4Lesson {...base} section={A4_SECTIONS.find(s => s.id === 'trace')!} />);
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    expect(screen.getByText(/reputation, control, comfort, security, belonging/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    expect(screen.getByRole('region', { name: 'Looking across this moment' })).toHaveTextContent('I’m not sure');
  });

  it('uses the optional existing reflection mechanism only for something worth keeping', () => {
    const section = A4_SECTIONS.find(s => s.id === 'reflection')!;
    render(<A4Lesson {...base} section={section} />);
    expect(section.prompt).toMatch(/anything you noticed here that you want to remember/i);
    expect(screen.getByRole('button', { name: 'Continue without writing' })).toBeEnabled();
  });
});
