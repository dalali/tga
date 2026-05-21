export interface GameStateData {
  score: number;
  money: number;
  multiplier: number;
  hp: number;
  weapon: 'none' | 'pistol' | 'machinegun';
  wantedLevel: number;
  missionActive: boolean;
  bustedCount: number;
}

const DEFAULT: GameStateData = {
  score: 0, money: 0, multiplier: 1.0,
  hp: 100, weapon: 'none', wantedLevel: 0,
  missionActive: false, bustedCount: 0,
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

  takeDamage(amount: number): boolean {
    this.data.hp = Math.max(0, this.data.hp - amount);
    return this.data.hp <= 0;
  }

  heal(amount: number): void {
    this.data.hp = Math.min(100, this.data.hp + amount);
  }

  bust(): void {
    this.data.hp = 100;
    this.data.weapon = 'none';
    this.data.money = Math.floor(this.data.money * 0.8);
    this.data.score = Math.floor(this.data.money * this.data.multiplier);
    this.data.wantedLevel = 0;
    this.data.bustedCount++;
  }

  pickupWeapon(w: 'pistol' | 'machinegun'): void { this.data.weapon = w; }

  incrementMultiplier(): void {
    this.data.multiplier = Math.min(3.0, parseFloat((this.data.multiplier + 0.1).toFixed(1)));
    this.data.score = Math.floor(this.data.money * this.data.multiplier);
  }
}

export const GameState = new GameStateManager();
