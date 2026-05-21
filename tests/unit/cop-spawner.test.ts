import { describe, it, expect } from 'vitest';
import { CopSpawner } from '../../src/systems/CopSpawner';

const MAP_W = 2048;
const MAP_H = 2048;
const PAD = 5 * 16; // 80px — matches the private constant in CopSpawner

describe('CopSpawner', () => {
  // ── sync(): spawn directives ──────────────────────────────────────────────
  it('sync(0, false) when empty produces no directives', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    expect(cs.sync(0, false)).toHaveLength(0);
  });

  it('sync(N, false) spawns exactly N cops when starting from 0', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    const dirs = cs.sync(3, false);
    expect(dirs).toHaveLength(3);
    expect(dirs.every(d => d.action === 'spawn')).toBe(true);
    expect(dirs.every(d => d.type === 'cop')).toBe(true);
    expect(cs.getActiveCount()).toBe(3);
  });

  it('sync() is idempotent when count already matches target', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    cs.sync(2, false);
    const dirs = cs.sync(2, false);
    expect(dirs).toHaveLength(0);
    expect(cs.getActiveCount()).toBe(2);
  });

  it('sync() despawns when target drops below current count', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    cs.sync(3, false);
    const dirs = cs.sync(1, false);
    expect(dirs).toHaveLength(2);
    expect(dirs.every(d => d.action === 'despawn')).toBe(true);
    expect(cs.getActiveCount()).toBe(1);
  });

  it('sync(0, false) despawns all cops', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    cs.sync(4, false);
    const dirs = cs.sync(0, false);
    expect(dirs).toHaveLength(4);
    expect(dirs.every(d => d.action === 'despawn')).toBe(true);
    expect(cs.getActiveCount()).toBe(0);
  });

  // ── SWAT tagging (US-7 / PRD §5.3) ──────────────────────────────────────
  it('sync(4, true) tags the last spawned slot as swat', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    const dirs = cs.sync(4, true);
    // Implementation tags the last slot (index targetCount-1) as swat
    const swatDirs = dirs.filter(d => d.type === 'swat');
    expect(swatDirs).toHaveLength(1);
    expect(swatDirs[0].action).toBe('spawn');
  });

  it('sync(2, false) spawns no swat even when isSwat param is false', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    const dirs = cs.sync(2, false);
    expect(dirs.every(d => d.type === 'cop')).toBe(true);
  });

  it('sync(1, true) with only one slot tags it as swat', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    const dirs = cs.sync(1, true);
    expect(dirs[0].type).toBe('swat');
  });

  // ── unique IDs ────────────────────────────────────────────────────────────
  it('each spawned cop receives a unique id', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    const dirs = cs.sync(4, false);
    const ids = dirs.map(d => d.id);
    expect(new Set(ids).size).toBe(4);
  });

  it('ids from successive syncs do not collide', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    cs.sync(0, false);
    const first = cs.sync(2, false).map(d => d.id);
    cs.sync(0, false); // despawn all
    const second = cs.sync(2, false).map(d => d.id);
    // After despawn+respawn, new IDs must not repeat the old ones
    expect(first.some(id => second.includes(id))).toBe(false);
  });

  // ── removeCop() ──────────────────────────────────────────────────────────
  it('removeCop() reduces active count', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    const dirs = cs.sync(3, false);
    const id = dirs[0].id;
    cs.removeCop(id);
    expect(cs.getActiveCount()).toBe(2);
  });

  it('removeCop() with unknown id is a no-op', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    cs.sync(2, false);
    cs.removeCop(9999);
    expect(cs.getActiveCount()).toBe(2);
  });

  // ── spawn coordinates stay within map bounds ──────────────────────────────
  it('all spawn coordinates are within [PAD, mapEdge - PAD] bounds', () => {
    const cs = new CopSpawner(MAP_W, MAP_H);
    // Run many syncs to exercise all four edge branches
    for (let i = 0; i < 40; i++) {
      cs.sync(0, false);
      const dirs = cs.sync(4, false);
      for (const d of dirs) {
        if (d.x !== undefined) {
          expect(d.x).toBeGreaterThanOrEqual(PAD);
          expect(d.x).toBeLessThanOrEqual(MAP_W - PAD);
        }
        if (d.y !== undefined) {
          expect(d.y).toBeGreaterThanOrEqual(PAD);
          expect(d.y).toBeLessThanOrEqual(MAP_H - PAD);
        }
      }
    }
  });
});
