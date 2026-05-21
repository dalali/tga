export interface GameStateData {
  score: number;
  money: number;
  multiplier: number;
  hp: number;
  weapon: 'none' | 'pistol' | 'machinegun';
  wantedLevel: number;
  missionActive: boolean;
}

const DEFAULT: GameStateData = {
  score: 0, money: 0, multiplier: 1.0,
  hp: 100, weapon: 'none', wantedLevel: 0, missionActive: false,
};

class GameStateManager {
  private data: GameStateData = { ...DEFAULT };
  get(): Readonly<GameStateData> { return this.data; }
  update(partial: Partial<GameStateData>): void { Object.assign(this.data, partial); }
  reset(): void { this.data = { ...DEFAULT }; }
  addMoney(amount: number): void {
    this.data.money += amount;
    this.data.score = Math.floor(this.data.money * this.data.multiplier);
  }
}

export const GameState = new GameStateManager();
