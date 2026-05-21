import { describe, it, expect } from 'vitest';
import { Pathfinder } from '../../src/systems/Pathfinder';

describe('Pathfinder', () => {
  // ── existing coverage ─────────────────────────────────────────────────────
  it('finds a straight path on an open grid', async () => {
    const pf = new Pathfinder();
    const grid = Array.from({ length: 5 }, () => Array(5).fill(1) as number[]);
    pf.init(grid, [1]);
    const path = await pf.findPath(0, 0, 4, 0);
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toMatchObject({ x: 4, y: 0 });
  });

  it('returns empty path when destination is completely blocked', async () => {
    const pf = new Pathfinder();
    const grid = [
      [1, 2, 1],
      [2, 2, 2],
      [1, 2, 1],
    ];
    pf.init(grid, [1]);
    const path = await pf.findPath(0, 0, 2, 2);
    expect(path).toHaveLength(0);
  });

  it('returns empty array before init', async () => {
    const pf = new Pathfinder();
    const path = await pf.findPath(0, 0, 3, 3);
    expect(path).toHaveLength(0);
  });

  // ── same-cell path ────────────────────────────────────────────────────────
  it('returns a single-node path (or empty) when start equals end', async () => {
    const pf = new Pathfinder();
    const grid = Array.from({ length: 3 }, () => [1, 1, 1]);
    pf.init(grid, [1]);
    const path = await pf.findPath(1, 1, 1, 1);
    // easystarjs may return [{ x:1, y:1 }] or [] — either is acceptable
    if (path.length > 0) {
      expect(path[path.length - 1]).toMatchObject({ x: 1, y: 1 });
    }
  });

  // ── out-of-bounds clamping ────────────────────────────────────────────────
  it('clamps out-of-bounds start/end coordinates to grid edges', async () => {
    const pf = new Pathfinder();
    const grid = Array.from({ length: 5 }, () => Array(5).fill(1) as number[]);
    pf.init(grid, [1]);
    // Provide coords well outside the 5×5 grid
    const path = await pf.findPath(-10, -10, 100, 100);
    // After clamping: (0,0) → (4,4) — should find a path on the open grid
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toMatchObject({ x: 4, y: 4 });
  });

  // ── vertical path ─────────────────────────────────────────────────────────
  it('finds a path in the vertical direction', async () => {
    const pf = new Pathfinder();
    const grid = Array.from({ length: 5 }, () => Array(5).fill(1) as number[]);
    pf.init(grid, [1]);
    const path = await pf.findPath(2, 0, 2, 4);
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toMatchObject({ x: 2, y: 4 });
  });

  // ── obstacle avoidance ────────────────────────────────────────────────────
  it('routes around a wall of impassable tiles', async () => {
    const pf = new Pathfinder();
    // 5×5 grid with a vertical wall at x=2, gap at y=4
    const grid = [
      [1, 1, 2, 1, 1],
      [1, 1, 2, 1, 1],
      [1, 1, 2, 1, 1],
      [1, 1, 2, 1, 1],
      [1, 1, 1, 1, 1], // gap in wall at row 4
    ];
    pf.init(grid, [1]);
    const path = await pf.findPath(0, 0, 4, 0);
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toMatchObject({ x: 4, y: 0 });
  });

  // ── multiple walkable tile types ──────────────────────────────────────────
  it('respects multiple walkable tile types (road=1, sidewalk=18)', async () => {
    const pf = new Pathfinder();
    const grid = [
      [1,  18, 1],
      [18,  1, 18],
      [1,  18, 1],
    ];
    pf.init(grid, [1, 18]);
    const path = await pf.findPath(0, 0, 2, 2);
    expect(path.length).toBeGreaterThan(0);
  });
});
