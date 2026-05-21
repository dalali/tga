import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'PauseScene' }); }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 20, 'PAUSED', { fontSize: '48px', color: '#F5D800', fontFamily: 'monospace' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 40, 'Press P or ESC to resume', { fontSize: '16px', color: '#E8E4D4', fontFamily: 'monospace' }).setOrigin(0.5);

    const resume = (): void => {
      this.scene.resume('WorldScene');
      this.scene.stop();
    };
    this.input.keyboard!.on('keydown-P', resume);
    this.input.keyboard!.on('keydown-ESC', resume);
  }
}
