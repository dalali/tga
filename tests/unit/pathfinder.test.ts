import { describe, it, expect } from 'vitest';
import { Pathfinder } from '../../src/systems/Pathfinder';

describe('Pathfinder', () => {
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
});
