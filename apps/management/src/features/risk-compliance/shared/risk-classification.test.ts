import { describe, expect, it } from 'vitest';
import { classifyRiskLevel } from './risk-classification';

describe('classifyRiskLevel', () => {
  it('score 45 → Medium', () => {
    expect(classifyRiskLevel(45)).toBe('Medium');
  });

  it('boundaries', () => {
    expect(classifyRiskLevel(30)).toBe('Low');
    expect(classifyRiskLevel(31)).toBe('Medium');
    expect(classifyRiskLevel(90)).toBe('High');
    expect(classifyRiskLevel(91)).toBe('Critical');
  });
});
