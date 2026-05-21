import { describe, it, expect } from 'vitest';
import { ScoringSystem } from '../../src/systems/ScoringSystem';

describe('ScoringSystem', () => {
  it('computes score as money * multiplier', () => {
    expect(ScoringSystem.compute(1000, 1.5)).toBe(1500);
  });
  it('caps multiplier at 3.0', () => {
    expect(ScoringSystem.newMultiplier(2.9)).toBe(3.0);
    expect(ScoringSystem.newMultiplier(3.0)).toBe(3.0);
  });
});
