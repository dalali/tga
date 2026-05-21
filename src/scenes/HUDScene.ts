import Phaser from 'phaser';
import { GameState } from '../state/GameState';
import { EVENTS } from '../state/events';

export class HUDScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private starsText!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'HUDScene' }); }

  create(): void {
    this.scoreText = this.add.text(16, 16, '$0', { fontSize: '18px', color: '#F5D800', fontFamily: 'monospace' });
    this.starsText = this.add.text(700, 16, '★★★★', { fontSize: '18px', color: '#333', fontFamily: 'monospace' }).setOrigin(1, 0);

    this.registry.events.on(EVENTS.SCORE_CHANGED, (score: number) => {
      this.scoreText.setText(`$${score.toLocaleString()}`);
    });
    this.registry.events.on(EVENTS.WANTED_CHANGED, (level: number) => {
      const filled = '★'.repeat(level);
      const empty  = '☆'.repeat(4 - level);
      this.starsText.setText(filled + empty).setColor(level > 0 ? '#E03030' : '#555');
    });

    // Mute key
    this.input.keyboard!.on('keydown-M', () => {
      this.sound.mute = !this.sound.mute;
    });

    // Reference GameState to suppress unused import warning
    void GameState;
  }
}
