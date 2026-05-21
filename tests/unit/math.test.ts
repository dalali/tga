import { describe, it, expect } from 'vitest';
import { lerp, clamp, angleBetween } from '../../src/utils/math';

describe('math utils', () => {
  // ── existing coverage ─────────────────────────────────────────────────────
  it('lerps correctly', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  it('clamps correctly', () => { expect(clamp(15, 0, 10)).toBe(10); expect(clamp(-5, 0, 10)).toBe(0); });

  // ── lerp() edge cases ─────────────────────────────────────────────────────
  it('lerp(a, b, 0) returns a', () => { expect(lerp(3, 9, 0)).toBe(3); });
  it('lerp(a, b, 1) returns b', () => { expect(lerp(3, 9, 1)).toBe(9); });
  it('lerp() works with negative values', () => { expect(lerp(-10, 10, 0.5)).toBe(0); });

  // ── clamp() edge cases ────────────────────────────────────────────────────
  it('clamp() returns value when within range', () => { expect(clamp(5, 0, 10)).toBe(5); });
  it('clamp() returns min when value equals min', () => { expect(clamp(0, 0, 10)).toBe(0); });
  it('clamp() returns max when value equals max', () => { expect(clamp(10, 0, 10)).toBe(10); });

  // ── angleBetween() — untested utility ────────────────────────────────────
  it('angleBetween() returns 0 for due-right direction', () => {
    expect(angleBetween(0, 0, 1, 0)).toBeCloseTo(0);
  });

  it('angleBetween() returns π/2 for due-down direction (y increases downward)', () => {
    expect(angleBetween(0, 0, 0, 1)).toBeCloseTo(Math.PI / 2);
  });

  it('angleBetween() returns π for due-left direction', () => {
    expect(Math.abs(angleBetween(0, 0, -1, 0))).toBeCloseTo(Math.PI);
  });

  it('angleBetween() returns -π/2 for due-up direction', () => {
    expect(angleBetween(0, 0, 0, -1)).toBeCloseTo(-Math.PI / 2);
  });

  it('angleBetween() works for arbitrary points', () => {
    // 45° diagonal
    expect(angleBetween(0, 0, 1, 1)).toBeCloseTo(Math.PI / 4);
  });

  it('angleBetween() is symmetric: same result regardless of origin translation', () => {
    // angleBetween(A, B) should equal angleBetween(A+offset, B+offset)
    const angle1 = angleBetween(0, 0, 3, 4);
    const angle2 = angleBetween(10, 10, 13, 14);
    expect(angle1).toBeCloseTo(angle2);
  });
});
