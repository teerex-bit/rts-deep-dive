import { describe, expect, it } from 'vitest';
import { getA2PatternBridgeFeedback } from '../../../components/deep-dive/A2_PATTERN_BRIDGE';

describe('A2_PATTERN_BRIDGE', () => {
  it('prompts the participant to complete both fields when no moment is complete', () => {
    expect(getA2PatternBridgeFeedback([])).toBe('Choose both a first internal move and a typical response in any moment to begin noticing what may be familiar.');
  });

  it('does not claim a pattern from one completed moment', () => {
    expect(getA2PatternBridgeFeedback([{ internal: 'Anxiety', response: 'Withdrawal' }])).toBe(
      'You have noticed one moment. Add another if you want to see whether anything familiar appears in a different situation.',
    );
  });

  it('names an identical internal move and response pair', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Anxiety', response: 'Withdrawal' },
      { internal: 'Anxiety', response: 'Withdrawal' },
    ])).toBe('You noticed the same movement more than once. Anxiety was followed by withdrawal in different moments. That repetition is worth noticing.');
  });

  it('notices the same response following different internal moves', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Fear', response: 'Control' },
      { internal: 'Urgency', response: 'Control' },
    ])).toBe('Different things were happening inside, but both moments moved toward control. You may be beginning to recognize a familiar response.');
  });

  it('notices the same internal move followed by different responses', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Insecurity', response: 'Pleasing' },
      { internal: 'Insecurity', response: 'Proving' },
    ])).toBe('The responses were different, but insecurity appeared in both moments. The same internal movement does not always lead to the same response.');
  });

  it('gives useful feedback when nothing repeats', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Fear', response: 'Control' },
      { internal: 'Urgency', response: 'Withdrawal' },
    ])).toBe('These moments do not have to match to be useful. You noticed what was happening inside you and what you did next. That is the practice: becoming more familiar with yourself as you respond.');
  });

  it('notices a response showing up in at least three different moments', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Fear', response: 'Control' },
      { internal: 'Urgency', response: 'Control' },
      { internal: 'Insecurity', response: 'Control' },
    ])).toBe('Control showed up in several different moments. The situations were different, but this response appeared repeatedly. You do not need to explain it yet—just notice it.');
  });

  it('notices an internal move appearing in at least three moments', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Anxiety', response: 'Control' },
      { internal: 'Anxiety', response: 'Withdrawal' },
      { internal: 'Anxiety', response: 'Pleasing' },
    ])).toBe('Anxiety appeared in several of these moments, even though what you did next was not always the same. You are beginning to notice something that may be familiar.');
  });

  it('identifies multiple response families that repeat', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Fear', response: 'Control' },
      { internal: 'Urgency', response: 'Control' },
      { internal: 'Discomfort', response: 'Withdrawal' },
      { internal: 'Uncertainty', response: 'Withdrawal' },
    ])).toBe('You noticed more than one response appearing across these moments: control and withdrawal. For now, simply notice that these responses are showing up more than once.');
  });

  it('identifies multiple internal movements that repeat', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Anxiety', response: 'Control' },
      { internal: 'Anxiety', response: 'Withdrawal' },
      { internal: 'Discomfort', response: 'Pleasing' },
      { internal: 'Discomfort', response: 'Proving' },
    ])).toBe('Some of the same internal movements appeared in different situations. Anxiety and discomfort each showed up more than once. That is useful to notice.');
  });

  it('supports all five completed situations', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Fear', response: 'Control' },
      { internal: 'Urgency', response: 'Withdrawal' },
      { internal: 'Discomfort', response: 'Fixing' },
      { internal: 'Insecurity', response: 'Pleasing' },
      { internal: 'Uncertainty', response: 'Proving' },
    ])).toBe('These moments do not have to match to be useful. You noticed what was happening inside you and what you did next. That is the practice: becoming more familiar with yourself as you respond.');
  });

  it('ignores incomplete pairs instead of inferring from their chosen field', () => {
    expect(getA2PatternBridgeFeedback([
      { internal: 'Anxiety', response: 'Withdrawal' },
      { internal: 'Anxiety', response: '' },
      { internal: '', response: 'Withdrawal' },
      { internal: 'Fear', response: '   ' },
    ])).toBe('You have noticed one moment. Add another if you want to see whether anything familiar appears in a different situation.');
  });
});
