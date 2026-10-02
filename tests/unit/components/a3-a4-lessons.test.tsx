import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { A3Lesson, A4Lesson } from '../../../components/deep-dive/A3A4Lesson';
import { A3_SECTIONS, A4_SECTIONS } from '../../../content/deep-dive/v1/awaken/four-module-lessons';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const base = { editReflection: vi.fn(), reflection: null, saveReflection: vi.fn() };

describe('A3 separates identity from learned patterns', () => {
  it('begins with an observation and guides the participant one step at a time', () => {
    render(<A3Lesson {...base} section={A3_SECTIONS.find(s => s.id === 'trace')!} />);
    expect(screen.getByText(/Start with whatever you have noticed/i)).toBeInTheDocument();
    expect(screen.getByLabelText('What did you notice yourself doing?')).toBeInTheDocument();
    expect(screen.queryByLabelText('A situation where I notice it')).not.toBeInTheDocument();
  });

  it('lets the participant finish without declaring an identity or pattern', () => {
    render(<A3Lesson {...base} section={A3_SECTIONS.find(s => s.id === 'trace')!} />);
    fireEvent.click(screen.getByRole('button', { name: 'I’m ready to move on' }));
    expect(screen.getByText('You can leave this open.')).toBeInTheDocument();
    expect(screen.queryByText('You saw it.')).not.toBeInTheDocument();
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
  it('uses AI to establish the actual reaction before deeper exploration', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ kind: 'success', question: 'How did you react?', guidance: '', observation: '', complete: false }));
    render(<A4Lesson {...base} section={A4_SECTIONS.find(s => s.id === 'trace')!} />);
    fireEvent.change(screen.getByLabelText('What happened?'), { target: { value: 'Someone cut me off' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByLabelText('How did you react?')).toBeInTheDocument();
    expect(screen.queryByLabelText('What were you expecting to happen?')).not.toBeInTheDocument();
  });

  it('accepts uncertainty without forcing the four categories', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ kind: 'success', question: '', guidance: '', observation: '', complete: true }));
    render(<A4Lesson {...base} section={A4_SECTIONS.find(s => s.id === 'trace')!} />);
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    expect(await screen.findByText('You can leave this open.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('uses the optional existing reflection mechanism only for something worth keeping', () => {
    const section = A4_SECTIONS.find(s => s.id === 'reflection')!;
    render(<A4Lesson {...base} section={section} />);
    expect(section.prompt).toMatch(/anything you noticed here that you want to remember/i);
    expect(screen.getByRole('button', { name: 'Continue without writing' })).toBeEnabled();
  });
});
