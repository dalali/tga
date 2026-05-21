import { Mission } from '../types/missions';

export type MissionState = 'inactive' | 'active' | 'passed' | 'failed';

export interface MissionEvent {
  type: 'started' | 'passed' | 'failed';
  mission: Mission;
  reward?: number;
}

export class MissionManager {
  private missions: Mission[] = [];
  private active: Mission | null = null;
  private state: MissionState = 'inactive';
  private elapsedMs: number = 0;
  private listeners: ((e: MissionEvent) => void)[] = [];

  load(data: Mission[]): void { this.missions = data; }
  getMissions(): Mission[] { return [...this.missions]; }
  getActive(): Mission | null { return this.active; }
  getState(): MissionState { return this.state; }
  getElapsedMs(): number { return this.elapsedMs; }
  getRemainingMs(): number {
    if (!this.active) return 0;
    return Math.max(0, this.active.timerMs - this.elapsedMs);
  }

  on(listener: (e: MissionEvent) => void): void { this.listeners.push(listener); }
  private emit(e: MissionEvent): void { this.listeners.forEach(l => l(e)); }

  accept(missionId: string): boolean {
    if (this.state === 'active') return false;
    const m = this.missions.find(x => x.id === missionId);
    if (!m) return false;
    this.active = m;
    this.state = 'active';
    this.elapsedMs = 0;
    this.emit({ type: 'started', mission: m });
    return true;
  }

  update(delta: number): void {
    if (this.state !== 'active' || !this.active) return;
    this.elapsedMs += delta;
    if (this.elapsedMs >= this.active.timerMs) this.fail();
  }

  complete(): void {
    if (this.state !== 'active' || !this.active) return;
    const m = this.active;
    this.state = 'passed';
    this.active = null;
    this.emit({ type: 'passed', mission: m, reward: m.reward });
    setTimeout(() => { if (this.state === 'passed') this.state = 'inactive'; }, 3000);
  }

  fail(): void {
    if (this.state !== 'active' || !this.active) return;
    const m = this.active;
    this.state = 'failed';
    this.active = null;
    this.emit({ type: 'failed', mission: m });
    setTimeout(() => { if (this.state === 'failed') this.state = 'inactive'; }, 2000);
  }

  isActive(): boolean { return this.state === 'active'; }
}
