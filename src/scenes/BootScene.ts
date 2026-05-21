import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload(): void {
    // Assets loaded here once real assets exist
    // For now, create placeholder textures programmatically
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // Placeholder player (blue rect)
    g.fillStyle(0x4488ff);
    g.fillRect(0, 0, 16, 16);
    g.generateTexture('player', 16, 16);
    g.clear();

    // Placeholder car (yellow rect)
    g.fillStyle(0xffcc00);
    g.fillRect(0, 0, 24, 16);
    g.generateTexture('sedan', 24, 16);
    g.clear();

    // Placeholder NPC (green rect)
    g.fillStyle(0x44cc44);
    g.fillRect(0, 0, 12, 12);
    g.generateTexture('civilian', 12, 12);
    g.clear();

    // Placeholder cop (red rect)
    g.fillStyle(0xee2222);
    g.fillRect(0, 0, 12, 12);
    g.generateTexture('cop', 12, 12);
    g.clear();

    g.destroy();
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
