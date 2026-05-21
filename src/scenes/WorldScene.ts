import Phaser from 'phaser';
import { CONFIG } from '../config';
import { GameState } from '../state/GameState';
import { EVENTS } from '../state/events';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor() { super({ key: 'WorldScene' }); }

  create(): void {
    GameState.reset();

    // Placeholder ground
    this.add.rectangle(0, 0, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE, 0x333340)
      .setOrigin(0, 0);

    // Placeholder player
    this.player = this.add.rectangle(400, 300, 16, 16, 0x4488ff);
    this.physics.add.existing(this.player);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey('W'),
      A: this.input.keyboard!.addKey('A'),
      S: this.input.keyboard!.addKey('S'),
      D: this.input.keyboard!.addKey('D'),
    };

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE);

    // Pause
    this.input.keyboard!.on('keydown-P', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  update(_time: number, delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = CONFIG.PLAYER_SPEED;
    body.setVelocity(0, 0);

    const left  = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up    = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.S.isDown;

    if (left)  body.setVelocityX(-speed);
    if (right) body.setVelocityX(speed);
    if (up)    body.setVelocityY(-speed);
    if (down)  body.setVelocityY(speed);

    void delta;
  }
}

// Suppress unused import warnings — these will be used in full implementation
void GameState;
void EVENTS;
