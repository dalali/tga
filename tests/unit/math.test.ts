import { describe, it, expect } from 'vitest';
import { lerp, clamp } from '../../src/utils/math';

describe('math utils', () => {
  it('lerps correctly', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  it('clamps correctly', () => { expect(clamp(15, 0, 10)).toBe(10); expect(clamp(-5, 0, 10)).toBe(0); });
});
