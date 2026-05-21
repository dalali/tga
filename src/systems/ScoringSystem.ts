export class ScoringSystem {
  static compute(money: number, multiplier: number): number {
    return Math.floor(money * multiplier);
  }
  static newMultiplier(current: number): number {
    return Math.min(3.0, parseFloat((current + 0.1).toFixed(1)));
  }
}
