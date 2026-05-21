import { describe, it, expect } from 'vitest';
import { ScoringSystem, CRIME_REWARDS } from '../../src/systems/ScoringSystem';

describe('ScoringSystem', () => {
  // ── existing coverage ─────────────────────────────────────────────────────
  it('computes score as money * multiplier', () => {
    expect(ScoringSystem.compute(1000, 1.5)).toBe(1500);
  });
  it('caps multiplier at 3.0', () => {
    expect(ScoringSystem.newMultiplier(2.9)).toBe(3.0);
    expect(ScoringSystem.newMultiplier(3.0)).toBe(3.0);
  });

  // ── compute() floor behaviour ─────────────────────────────────────────────
  it('compute() floors fractional results', () => {
    // 1001 * 1.1 = 1101.1 → should floor to 1101
    expect(ScoringSystem.compute(1001, 1.1)).toBe(1101);
  });

  it('compute() returns 0 when money is 0', () => {
    expect(ScoringSystem.compute(0, 2.5)).toBe(0);
  });

  // ── newMultiplier() increment from 1.0 ───────────────────────────────────
  it('newMultiplier() increments 1.0 to 1.1', () => {
    expect(ScoringSystem.newMultiplier(1.0)).toBe(1.1);
  });

  it('newMultiplier() handles floating-point: 1.2 -> 1.3', () => {
    expect(ScoringSystem.newMultiplier(1.2)).toBe(1.3);
  });

  it('newMultiplier() handles floating-point: 2.8 -> 2.9', () => {
    expect(ScoringSystem.newMultiplier(2.8)).toBe(2.9);
  });

  // ── getCrimeReward() — PRD §5.4 compliance ───────────────────────────────
  it('RUN_OVER_CIV yields $100 and +1 star (PRD §5.4)', () => {
    const r = ScoringSystem.getCrimeReward('RUN_OVER_CIV');
    expect(r.money).toBe(100);
    expect(r.stars).toBe(1);
  });

  it('SHOOT_CIV yields $50 and +1 star (PRD §5.4)', () => {
    const r = ScoringSystem.getCrimeReward('SHOOT_CIV');
    expect(r.money).toBe(50);
    expect(r.stars).toBe(1);
  });

  it('DAMAGE_COP_CAR yields $0 and +1 star (PRD §5.4)', () => {
    const r = ScoringSystem.getCrimeReward('DAMAGE_COP_CAR');
    expect(r.money).toBe(0);
    expect(r.stars).toBe(1);
  });

  it('KILL_COP yields $300 and +2 stars (PRD §5.4)', () => {
    const r = ScoringSystem.getCrimeReward('KILL_COP');
    expect(r.money).toBe(300);
    expect(r.stars).toBe(2);
  });

  it('DAMAGE_SWAT yields $0 and +1 star (PRD §5.4)', () => {
    const r = ScoringSystem.getCrimeReward('DAMAGE_SWAT');
    expect(r.money).toBe(0);
    expect(r.stars).toBe(1);
  });

  it('STEAL_OCCUPIED yields $0 and +1 star (PRD §5.4)', () => {
    const r = ScoringSystem.getCrimeReward('STEAL_OCCUPIED');
    expect(r.money).toBe(0);
    expect(r.stars).toBe(1);
  });

  // ── CRIME_REWARDS table is exhaustive ────────────────────────────────────
  it('every entry in CRIME_REWARDS has non-negative money and stars in 1-2', () => {
    for (const [crime, reward] of Object.entries(CRIME_REWARDS)) {
      expect(reward.money, `${crime}.money`).toBeGreaterThanOrEqual(0);
      expect(reward.stars, `${crime}.stars`).toBeGreaterThanOrEqual(1);
      expect(reward.stars, `${crime}.stars`).toBeLessThanOrEqual(2);
    }
  });
});
