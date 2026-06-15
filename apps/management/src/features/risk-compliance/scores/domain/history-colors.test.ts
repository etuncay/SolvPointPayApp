import { describe, expect, it } from 'vitest';
import { historyRowClassForLevel, historyRowClassForScore } from './history-colors';

describe('history-colors', () => {
  it('Critical bordo sınıfı', () => {
    expect(historyRowClassForLevel('Critical')).toBe('score-history-row--critical');
  });

  it('skor 25 Low', () => {
    expect(historyRowClassForScore(25)).toBe('score-history-row--low');
  });
});
