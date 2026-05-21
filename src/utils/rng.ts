export class RNG {
  private seed: number;
  constructor(seed: number = Date.now()) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 0xffffffff;
  }
  between(min: number, max: number): number { return min + this.next() * (max - min); }
}
