export interface PedSpawnPoint { x: number; y: number; }

export class PedSpawner {
  private readonly TARGET_COUNT = 20;
  private readonly TILE_SIZE = 16;

  getInitialSpawnPoints(mapCols: number, mapRows: number): PedSpawnPoint[] {
    const points: PedSpawnPoint[] = [];
    for (let i = 0; i < this.TARGET_COUNT; i++) {
      points.push({
        x: (6 + Math.random() * (mapCols - 12)) * this.TILE_SIZE,
        y: (6 + Math.random() * (mapRows - 12)) * this.TILE_SIZE,
      });
    }
    return points;
  }

  getTargetCount(): number { return this.TARGET_COUNT; }
}
