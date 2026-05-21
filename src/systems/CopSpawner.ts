export interface SpawnDirective {
  action: 'spawn' | 'despawn';
  type: 'cop' | 'swat';
  x?: number;
  y?: number;
  id: number;
}

export class CopSpawner {
  private activeCopIds: Set<number> = new Set();
  private nextId: number = 0;
  private mapWidth: number;
  private mapHeight: number;

  constructor(mapWidthPx: number, mapHeightPx: number) {
    this.mapWidth = mapWidthPx;
    this.mapHeight = mapHeightPx;
  }

  sync(targetCount: number, isSwat: boolean): SpawnDirective[] {
    const directives: SpawnDirective[] = [];
    const current = this.activeCopIds.size;

    if (current < targetCount) {
      for (let i = current; i < targetCount; i++) {
        const id = this.nextId++;
        this.activeCopIds.add(id);
        const { x, y } = this.randomSpawnPoint();
        const type = isSwat && i === targetCount - 1 ? 'swat' : 'cop';
        directives.push({ action: 'spawn', type, x, y, id });
      }
    } else if (current > targetCount) {
      let removed = 0;
      const toRemove = current - targetCount;
      for (const id of this.activeCopIds) {
        if (removed >= toRemove) break;
        this.activeCopIds.delete(id);
        directives.push({ action: 'despawn', type: 'cop', id });
        removed++;
      }
    }

    return directives;
  }

  removeCop(id: number): void { this.activeCopIds.delete(id); }
  getActiveCount(): number { return this.activeCopIds.size; }

  private randomSpawnPoint(): { x: number; y: number } {
    const pad = 5 * 16;
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: return { x: pad + Math.random() * (this.mapWidth - pad * 2), y: pad };
      case 1: return { x: pad + Math.random() * (this.mapWidth - pad * 2), y: this.mapHeight - pad };
      case 2: return { x: pad, y: pad + Math.random() * (this.mapHeight - pad * 2) };
      default: return { x: this.mapWidth - pad, y: pad + Math.random() * (this.mapHeight - pad * 2) };
    }
  }
}
