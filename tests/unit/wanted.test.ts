import { describe, it, expect } from 'vitest';
import { WantedSystem } from '../../src/systems/WantedSystem';

describe('WantedSystem', () => {
  it('adds stars capped at 4', () => {
    const w = new WantedSystem();
    w.add(3); w.add(3);
    expect(w.getStars()).toBe(4);
  });
  it('decays after 30s without LoS', () => {
    const w = new WantedSystem();
    w.add(2);
    const decayed = w.update(30001, false);
    expect(decayed).toBe(true);
    expect(w.getStars()).toBe(1);
  });
  it('does not decay when cops see player', () => {
    const w = new WantedSystem();
    w.add(2);
    w.update(31000, true);
    expect(w.getStars()).toBe(2);
  });
});
