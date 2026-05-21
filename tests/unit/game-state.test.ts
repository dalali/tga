import { describe, it, expect, beforeEach } from 'vitest';

// GameState is a singleton — import it fresh but reset before each test.
// We have to re-import because vitest caches modules; we use beforeEach(reset).
import { GameState } from '../../src/state/GameState';

describe('GameState', () => {
  beforeEach(() => { GameState.reset(); });

  // ── initial state ─────────────────────────────────────────────────────────
  it('starts with score=0, money=0, multiplier=1.0, hp=100, weapon=none', () => {
    const d = GameState.get();
    expect(d.score).toBe(0);
    expect(d.money).toBe(0);
    expect(d.multiplier).toBe(1.0);
    expect(d.hp).toBe(100);
    expect(d.weapon).toBe('none');
    expect(d.wantedLevel).toBe(0);
    expect(d.bustedCount).toBe(0);
  });

  // ── addMoney() ────────────────────────────────────────────────────────────
  it('addMoney() increases money and recomputes score', () => {
    GameState.addMoney(500);
    const d = GameState.get();
    expect(d.money).toBe(500);
    expect(d.score).toBe(500); // multiplier=1.0 → score=money*1.0=500
  });

  it('addMoney() uses the current multiplier when computing score', () => {
    GameState.update({ multiplier: 2.0 });
    GameState.addMoney(1000);
    expect(GameState.get().score).toBe(2000);
  });

  it('addMoney() accumulates across multiple calls', () => {
    GameState.addMoney(100);
    GameState.addMoney(200);
    expect(GameState.get().money).toBe(300);
  });

  // ── takeDamage() ──────────────────────────────────────────────────────────
  it('takeDamage() reduces hp', () => {
    GameState.takeDamage(30);
    expect(GameState.get().hp).toBe(70);
  });

  it('takeDamage() clamps hp at 0 and returns true when hp reaches 0', () => {
    const dead = GameState.takeDamage(999);
    expect(dead).toBe(true);
    expect(GameState.get().hp).toBe(0);
  });

  it('takeDamage() returns false when hp remains above 0', () => {
    expect(GameState.takeDamage(50)).toBe(false);
    expect(GameState.get().hp).toBe(50);
  });

  // ── heal() ────────────────────────────────────────────────────────────────
  it('heal() increases hp', () => {
    GameState.takeDamage(40);
    GameState.heal(20);
    expect(GameState.get().hp).toBe(80);
  });

  it('heal() clamps hp at 100', () => {
    GameState.heal(50);
    expect(GameState.get().hp).toBe(100);
  });

  // ── pickupWeapon() ────────────────────────────────────────────────────────
  it('pickupWeapon() sets weapon to pistol', () => {
    GameState.pickupWeapon('pistol');
    expect(GameState.get().weapon).toBe('pistol');
  });

  it('pickupWeapon() can upgrade to machinegun', () => {
    GameState.pickupWeapon('pistol');
    GameState.pickupWeapon('machinegun');
    expect(GameState.get().weapon).toBe('machinegun');
  });

  // ── incrementMultiplier() ─────────────────────────────────────────────────
  it('incrementMultiplier() adds 0.1 to multiplier and recomputes score', () => {
    GameState.addMoney(1000);
    GameState.incrementMultiplier();
    const d = GameState.get();
    expect(d.multiplier).toBe(1.1);
    expect(d.score).toBe(1100); // floor(1000 * 1.1) = 1100
  });

  it('incrementMultiplier() caps at 3.0', () => {
    // Jump close to cap
    GameState.update({ multiplier: 2.9 });
    GameState.incrementMultiplier(); // 3.0
    GameState.incrementMultiplier(); // should stay at 3.0
    expect(GameState.get().multiplier).toBe(3.0);
  });

  // ── bust() — PRD §3.1 death/respawn spec ─────────────────────────────────
  it('bust() restores hp to 100', () => {
    GameState.takeDamage(100);
    GameState.bust();
    expect(GameState.get().hp).toBe(100);
  });

  it('bust() resets weapon to none', () => {
    GameState.pickupWeapon('machinegun');
    GameState.bust();
    expect(GameState.get().weapon).toBe('none');
  });

  it('bust() resets wantedLevel to 0', () => {
    GameState.update({ wantedLevel: 3 });
    GameState.bust();
    expect(GameState.get().wantedLevel).toBe(0);
  });

  it('bust() deducts 20% of money (player loses money on death)', () => {
    GameState.addMoney(1000);
    GameState.bust();
    // 80% retained → 800
    expect(GameState.get().money).toBe(800);
  });

  it('bust() recomputes score after reducing money', () => {
    GameState.update({ multiplier: 2.0 });
    GameState.addMoney(1000);  // money=1000, score=2000
    GameState.bust();          // money=800, score=floor(800*2.0)=1600
    expect(GameState.get().score).toBe(1600);
  });

  it('bust() increments bustedCount', () => {
    GameState.bust();
    GameState.bust();
    expect(GameState.get().bustedCount).toBe(2);
  });

  it('bust() with $0 money keeps money at $0', () => {
    GameState.bust();
    expect(GameState.get().money).toBe(0);
  });

  // ── win condition (US-14): score >= 50000 ────────────────────────────────
  it('score reaches 50000 when money * multiplier equals 50000', () => {
    GameState.update({ multiplier: 1.0 });
    GameState.addMoney(50000);
    expect(GameState.get().score).toBeGreaterThanOrEqual(50000);
  });

  // ── reset() ──────────────────────────────────────────────────────────────
  it('reset() restores all fields to defaults', () => {
    GameState.addMoney(9999);
    GameState.update({ wantedLevel: 4, multiplier: 2.5 });
    GameState.pickupWeapon('machinegun');
    GameState.takeDamage(50);
    GameState.bust();
    GameState.reset();
    const d = GameState.get();
    expect(d.money).toBe(0);
    expect(d.score).toBe(0);
    expect(d.multiplier).toBe(1.0);
    expect(d.hp).toBe(100);
    expect(d.weapon).toBe('none');
    expect(d.wantedLevel).toBe(0);
    expect(d.bustedCount).toBe(0);
  });
});
