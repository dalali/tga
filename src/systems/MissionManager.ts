export interface Mission {
  id: string; type: 'deliver' | 'kill' | 'escape';
  title: string; objective: string;
  timerMs: number; reward: number;
}

export class MissionManager {
  private missions: Mission[] = [];
  private active: Mission | null = null;

  load(data: Mission[]): void { this.missions = data; }
  accept(id: string): Mission | null {
    const m = this.missions.find(x => x.id === id) ?? null;
    this.active = m;
    return m;
  }
  getActive(): Mission | null { return this.active; }
  complete(): void { this.active = null; }
  fail(): void { this.active = null; }
}
