export const CRIME_REWARDS = {
  RUN_OVER_CIV:   { money: 100, stars: 1 },
  SHOOT_CIV:      { money: 50,  stars: 1 },
  DAMAGE_COP_CAR: { money: 0,   stars: 1 },
  KILL_COP:       { money: 300, stars: 2 },
  DAMAGE_SWAT:    { money: 0,   stars: 1 },
  STEAL_OCCUPIED: { money: 0,   stars: 1 },
} as const;

export type CrimeType = keyof typeof CRIME_REWARDS;

export class ScoringSystem {
  static compute(money: number, multiplier: number): number {
    return Math.floor(money * multiplier);
  }

  static newMultiplier(current: number): number {
    return Math.min(3.0, parseFloat((current + 0.1).toFixed(1)));
  }

  static getCrimeReward(crime: CrimeType): { money: number; stars: number } {
    return CRIME_REWARDS[crime];
  }
}
