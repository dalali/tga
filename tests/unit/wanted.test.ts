import { describe, it, expect } from 'vitest';
import { WantedSystem } from '../../src/systems/WantedSystem';

describe('WantedSystem', () => {
  // ── existing coverage ─────────────────────────────────────────────────────
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

  // ── reset ────────────────────────────────────────────────────────────────
  it('reset() clears stars and cooldown', () => {
    const w = new WantedSystem();
    w.add(3);
    w.update(15000, false); // accumulate half a cooldown interval
    w.reset();
    expect(w.getStars()).toBe(0);
    // After reset, a decay tick should not trigger (no stars to decay)
    expect(w.update(30001, false)).toBe(false);
  });

  // ── getCopCount / isSwatActive ────────────────────────────────────────────
  it('getCopCount() returns the current star count', () => {
    const w = new WantedSystem();
    w.add(2);
    expect(w.getCopCount()).toBe(2);
  });

  it('isSwatActive() is false below 4 stars', () => {
    const w = new WantedSystem();
    w.add(3);
    expect(w.isSwatActive()).toBe(false);
  });

  it('isSwatActive() is true at exactly 4 stars', () => {
    const w = new WantedSystem();
    w.add(4);
    expect(w.isSwatActive()).toBe(true);
  });

  // ── decay boundary ────────────────────────────────────────────────────────
  // Implementation uses strict > so exactly 30000ms is NOT enough; need 30001.
  it('update() returns false at exactly 30000ms (strict > threshold not yet crossed)', () => {
    const w = new WantedSystem();
    w.add(1);
    expect(w.update(30000, false)).toBe(false);
    expect(w.getStars()).toBe(1);
  });

  it('update() returns true at 30001ms (threshold crossed)', () => {
    const w = new WantedSystem();
    w.add(1);
    expect(w.update(30001, false)).toBe(true);
    expect(w.getStars()).toBe(0);
  });

  it('decay does not drop stars below 0', () => {
    const w = new WantedSystem();
    w.add(1);
    w.update(30001, false); // drops to 0
    const decayedAgain = w.update(30001, false);
    expect(decayedAgain).toBe(false);
    expect(w.getStars()).toBe(0);
  });

  // ── cooldown resets after each decay ─────────────────────────────────────
  it('decay resets cooldown so a second decay requires another 30s', () => {
    const w = new WantedSystem();
    w.add(3);
    w.update(30001, false); // first decay: 3 -> 2
    expect(w.getStars()).toBe(2);
    // Only 1ms more — should not decay again
    expect(w.update(1, false)).toBe(false);
    expect(w.getStars()).toBe(2);
    // Another full 30s — should decay again
    expect(w.update(30001, false)).toBe(true);
    expect(w.getStars()).toBe(1);
  });

  // ── LoS resets cooldown accumulation ─────────────────────────────────────
  it('cop sight resets accumulated cooldown', () => {
    const w = new WantedSystem();
    w.add(2);
    w.update(20000, false);  // accumulate 20s
    w.update(1, true);       // cop sees player — resets cooldown to 0
    // Now we need a fresh full 30s without LoS to decay
    expect(w.update(29999, false)).toBe(false);
    expect(w.update(2, false)).toBe(true); // crosses 30001ms total
    expect(w.getStars()).toBe(1);
  });
});
