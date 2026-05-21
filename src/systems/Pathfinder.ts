import { js as EasyStar } from 'easystarjs';

export interface PathNode { x: number; y: number; }

export class Pathfinder {
  private easystar: EasyStar;
  private gridWidth: number = 0;
  private gridHeight: number = 0;
  private ready: boolean = false;

  constructor() {
    this.easystar = new EasyStar();
    this.easystar.enableDiagonals();
    this.easystar.enableCornerCutting();
    this.easystar.setIterationsPerCalculation(500);
  }

  /**
   * Call once after the tilemap is loaded.
   * grid: 2D array [row][col] of tile GIDs.
   * walkableTiles: which GIDs are passable (road=1, sidewalk=18).
   */
  init(grid: number[][], walkableTiles: number[]): void {
    this.gridHeight = grid.length;
    this.gridWidth  = grid[0]?.length ?? 0;
    this.easystar.setGrid(grid);
    this.easystar.setAcceptableTiles(walkableTiles);
    this.ready = true;
  }

  findPath(startX: number, startY: number, endX: number, endY: number): Promise<PathNode[]> {
    if (!this.ready) return Promise.resolve([]);

    // Clamp to grid bounds
    const sx = Math.max(0, Math.min(this.gridWidth  - 1, startX));
    const sy = Math.max(0, Math.min(this.gridHeight - 1, startY));
    const ex = Math.max(0, Math.min(this.gridWidth  - 1, endX));
    const ey = Math.max(0, Math.min(this.gridHeight - 1, endY));

    return new Promise((resolve) => {
      this.easystar.findPath(sx, sy, ex, ey, (path) => {
        resolve(path ?? []);
      });
      this.easystar.calculate();
    });
  }

  update(): void {
    if (this.ready) this.easystar.calculate();
  }
}
