import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create(): void {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 40, 'TGA', {
      fontSize: '64px', color: '#F5D800', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 40, 'PRESS ENTER TO START', {
      fontSize: '18px', color: '#E8E4D4', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.input.keyboard!.once('keydown-ENTER', () => {
      this.scene.start('WorldScene');
      this.scene.launch('HUDScene');
    });
  }
}
