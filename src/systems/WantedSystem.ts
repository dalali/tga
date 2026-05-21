export class WantedSystem {
  private stars: number = 0;
  private cooldownMs: number = 0;
  private readonly DECAY_INTERVAL = 30000;

  add(delta: number): void { this.stars = Math.min(4, this.stars + delta); this.cooldownMs = 0; }
  getStars(): number { return this.stars; }
  reset(): void { this.stars = 0; this.cooldownMs = 0; }

  update(dt: number, copsSeePlayer: boolean): boolean {
    if (this.stars === 0) return false;
    if (copsSeePlayer) { this.cooldownMs = 0; return false; }
    this.cooldownMs += dt;
    if (this.cooldownMs >= this.DECAY_INTERVAL) {
      this.stars = Math.max(0, this.stars - 1);
      this.cooldownMs = 0;
      return true;
    }
    return false;
  }
}
