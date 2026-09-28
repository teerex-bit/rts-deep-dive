import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AwakenIdentityPattern } from '../../../components/deep-dive/AwakenIdentityPattern';
import { composeObservedPattern } from '../../../components/deep-dive/a3-identity-pattern';

afterEach(cleanup);

describe('Awaken identity-to-pattern exercise', () => {
  it('lets a participant begin with an observation without declaring a definite pattern or identity', () => {
    render(<AwakenIdentityPattern />);

    expect(screen.getByLabelText('Something I notice myself doing')).toHaveValue('');
    expect(screen.queryByLabelText('A situation where I notice it')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/what am I tempted to say about myself/i)).not.toBeInTheDocument();
    expect(screen.getByText(/once or something that seems to happen repeatedly/i)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Notice the difference' })).not.toBeInTheDocument();
  });

  it('compares the participant’s own identity statement and observed behavior in a situation', () => {
    render(<AwakenIdentityPattern />);
    fireEvent.change(screen.getByLabelText('Something I notice myself doing'), { target: { value: 'get defensive' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    fireEvent.change(screen.getByLabelText('A situation where I notice it'), { target: { value: 'I feel misunderstood' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    fireEvent.change(screen.getByLabelText(/what am I tempted to say about myself/i), { target: { value: 'I’m just defensive.' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));

    const comparison = screen.getByRole('region', { name: 'Notice the difference' });
    expect(comparison).toHaveTextContent('I’m just defensive.');
    expect(comparison).toHaveTextContent('I tend to get defensive when I feel misunderstood.');
    expect(comparison).toHaveTextContent('What you say about yourself is a conclusion about who you are.');
    expect(comparison).toHaveTextContent('What you noticed yourself doing in a particular kind of moment describes a pattern.');
    expect(comparison).toHaveTextContent('The goal is not positive thinking. The goal is accuracy.');
  });

  it('keeps “I’m not sure” valid without requiring an identity label', () => {
    render(<AwakenIdentityPattern />);
    fireEvent.change(screen.getByLabelText('Something I notice myself doing'), { target: { value: 'go quiet' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    fireEvent.change(screen.getByLabelText('A situation where I notice it'), { target: { value: 'conflict begins' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));

    expect(screen.getByRole('region', { name: 'Notice the difference' })).toHaveTextContent('I’m not sure');
    expect(screen.getByRole('region', { name: 'Notice the difference' })).toHaveTextContent('I tend to go quiet when conflict begins.');
  });

  it('does not turn an uncertain observation into a supposed behavior', () => {
    render(<AwakenIdentityPattern />);
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    fireEvent.click(screen.getByRole('button', { name: 'I’m not sure' }));
    const comparison = screen.getByRole('region', { name: 'Notice the difference' });
    expect(comparison).toHaveTextContent('I tend to __________ when __________.');
    expect(comparison).not.toHaveTextContent('I tend to I’m not sure when I’m not sure');
  });

  it('mechanically preserves arbitrary participant wording without interpreting it', () => {
    expect(composeObservedPattern('I like ice cream', 'weekends')).toBe('I tend to I like ice cream when weekends.');

    render(<AwakenIdentityPattern />);
    fireEvent.change(screen.getByLabelText('Something I notice myself doing'), { target: { value: 'I like ice cream' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    fireEvent.change(screen.getByLabelText('A situation where I notice it'), { target: { value: 'weekends' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
    fireEvent.change(screen.getByLabelText(/what am I tempted to say about myself/i), { target: { value: 'I am a cloud' } });
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));

    const comparison = screen.getByRole('region', { name: 'Notice the difference' });
    expect(comparison).toHaveTextContent('I tend to I like ice cream when weekends.');
    expect(comparison).toHaveTextContent('I am a cloud');
    expect(comparison).not.toHaveTextContent(/learned response|formation history|protective function|this means/i);
  });
});
