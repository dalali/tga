import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload(): void {
    // Load tilemap and tileset
    this.load.tilemapTiledJSON('city', 'assets/maps/city.json');
    this.load.image('tileset', 'assets/sprites/tileset.png');

    // Keep placeholder textures for entities (will be replaced with sprite sheets later)
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // player - blue 14x14 square
    g.fillStyle(0x4488ff); g.fillRect(1, 1, 14, 14);
    g.generateTexture('player', 16, 16); g.clear();

    // sedan - yellow rectangle
    g.fillStyle(0xffcc00); g.fillRect(0, 0, 24, 16);
    g.generateTexture('sedan', 24, 16); g.clear();

    // sports car - orange
    g.fillStyle(0xff8800); g.fillRect(0, 0, 24, 14);
    g.generateTexture('sports', 24, 14); g.clear();

    // truck - green, wider
    g.fillStyle(0x44aa44); g.fillRect(0, 0, 28, 18);
    g.generateTexture('truck', 28, 18); g.clear();

    // civilian ped - green
    g.fillStyle(0x44cc44); g.fillRect(2, 2, 12, 12);
    g.generateTexture('civilian', 16, 16); g.clear();

    // cop - red
    g.fillStyle(0xee2222); g.fillRect(2, 2, 12, 12);
    g.generateTexture('cop', 16, 16); g.clear();

    // bullet - white dot
    g.fillStyle(0xffffff); g.fillCircle(3, 3, 3);
    g.generateTexture('bullet', 6, 6); g.clear();

    // waypoint marker - yellow diamond
    g.fillStyle(0xffdd00);
    g.fillTriangle(8, 0, 16, 8, 8, 16);
    g.fillTriangle(8, 0, 0, 8, 8, 16);
    g.generateTexture('waypoint', 16, 16); g.clear();

    g.destroy();
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
