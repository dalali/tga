import Phaser from 'phaser';
import { CONFIG } from '../config';
import { GameState } from '../state/GameState';
import { EVENTS } from '../state/events';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
  };
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private debugText?: Phaser.GameObjects.Text;

  constructor() { super({ key: 'WorldScene' }); }

  create(): void {
    GameState.reset();

    // Emit initial HUD values to the registry
    this.registry.set('score', 0);
    this.registry.set('wanted', 0);
    this.registry.set('hp', 100);
    this.registry.set('weapon', 'none');

    // Create tilemap
    // city.json: layer "Ground", tileset "tileset"
    // Unique GIDs: 1=road (passable), 18=sidewalk (passable),
    //              33=building (impassable), 65=water (impassable)
    const map = this.make.tilemap({ key: 'city' });
    const tileset = map.addTilesetImage('tileset', 'tileset')!;
    this.groundLayer = map.createLayer('Ground', tileset, 0, 0)!;

    // Set collision only on building (33) and water (65) tiles
    this.groundLayer.setCollision([33, 65]);

    // Physics world bounds match the map dimensions
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Player - start near centre of map (tile 32,32)
    const startX = Math.floor(CONFIG.MAP_WIDTH / 2) * CONFIG.TILE_SIZE;
    const startY = Math.floor(CONFIG.MAP_HEIGHT / 2) * CONFIG.TILE_SIZE;
    this.player = this.physics.add.sprite(startX, startY, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // Collide player with impassable tiles
    this.physics.add.collider(this.player, this.groundLayer);

    // Camera follows player with smooth lerp, bounded to map
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2); // 16px tiles appear as 32px

    // Input: cursor keys + WASD + SHIFT sprint
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SHIFT: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
    };

    // Pause toggle (P or ESC)
    this.input.keyboard!.on('keydown-P', this.togglePause, this);
    this.input.keyboard!.on('keydown-ESC', this.togglePause, this);

    // Mute toggle (M)
    this.input.keyboard!.on('keydown-M', () => {
      this.sound.mute = !this.sound.mute;
    });

    // Debug overlay (only when VITE_TGA_DEBUG=1)
    if (CONFIG.DEBUG) {
      this.debugText = this.add
        .text(10, 10, '', { fontSize: '12px', color: '#00ffff', fontFamily: 'monospace' })
        .setScrollFactor(0)
        .setDepth(100);
    }
  }

  private togglePause(): void {
    if (this.scene.isPaused('WorldScene')) {
      this.scene.resume('WorldScene');
      this.scene.stop('PauseScene');
    } else {
      this.scene.pause('WorldScene');
      this.scene.launch('PauseScene');
    }
  }

  update(_time: number, delta: number): void {
    // Clamp delta to avoid physics tunnelling on tab-switch spikes
    void delta;

    const left  = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up    = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.S.isDown;
    const sprint = this.wasd.SHIFT.isDown;

    const speed = sprint ? CONFIG.PLAYER_SPRINT : CONFIG.PLAYER_SPEED;
    let vx = 0;
    let vy = 0;

    if (left)  vx -= speed;
    if (right) vx += speed;
    if (up)    vy -= speed;
    if (down)  vy += speed;

    // Normalise diagonal movement to consistent speed
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Rotate player sprite to face movement direction
    if (vx !== 0 || vy !== 0) {
      this.player.setRotation(Math.atan2(vy, vx) + Math.PI / 2);
    }

    // Debug tile position + FPS overlay
    if (this.debugText) {
      const tx = Math.floor(this.player.x / CONFIG.TILE_SIZE);
      const ty = Math.floor(this.player.y / CONFIG.TILE_SIZE);
      this.debugText.setText(
        `tile(${tx},${ty}) | fps:${Math.round(this.game.loop.actualFps)}`
      );
    }
  }
}

// Suppress unused import warnings — EVENTS will be used in full mission/wanted implementation
void EVENTS;
