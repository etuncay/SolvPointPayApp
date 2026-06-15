import { describe, expect, it } from 'vitest';
import { wouldCreateCycle } from './dependency-graph';

describe('wouldCreateCycle', () => {
  it('detects A→B and B→A cycle on update', () => {
    const jobs = [
      { id: 'job-001', dependencyIds: ['job-002'] },
      { id: 'job-002', dependencyIds: [] },
    ];
    expect(wouldCreateCycle(jobs, 'job-002', ['job-001'])).toBe(true);
  });

  it('allows acyclic deps', () => {
    const jobs = [
      { id: 'job-001', dependencyIds: [] },
      { id: 'job-002', dependencyIds: [] },
    ];
    expect(wouldCreateCycle(jobs, 'job-002', ['job-001'])).toBe(false);
  });
});
