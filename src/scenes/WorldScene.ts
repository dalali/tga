import Phaser from 'phaser';
import { CONFIG } from '../config';
import { GameState } from '../state/GameState';
import { EVENTS } from '../state/events';
import { Vehicle } from '../entities/vehicles/Vehicle';
import { Sedan } from '../entities/vehicles/Sedan';
import { Sports } from '../entities/vehicles/Sports';
import { Truck } from '../entities/vehicles/Truck';

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

  private vehicles!: Phaser.GameObjects.Group;
  private currentVehicle: Vehicle | null = null;
  private eKey!: Phaser.Input.Keyboard.Key;
  private driveKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

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

    // Drive keys share keycodes with wasd — reference the same Key objects
    // so both on-foot and driving use the same underlying key state
    this.driveKeys = {
      W: this.wasd.W,
      A: this.wasd.A,
      S: this.wasd.S,
      D: this.wasd.D,
    };

    // E key for enter/exit vehicle
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Spawn parked vehicles at road tiles
    this.vehicles = this.add.group();
    this.spawnVehicles();

    // Vehicle-vehicle and player-vehicle colliders
    this.physics.add.collider(this.vehicles, this.vehicles);
    this.physics.add.collider(this.player, this.vehicles);

    // E key exit (keydown event so it fires once per press)
    this.input.keyboard!.on('keydown-E', () => {
      if (this.currentVehicle) this.exitVehicle();
    });

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

  private spawnVehicles(): void {
    // Spawn at road tiles — offset from centre to avoid player spawn
    const spawnPoints = [
      { type: 'sedan',  tx: 35, ty: 32 },
      { type: 'sedan',  tx: 28, ty: 32 },
      { type: 'sports', tx: 32, ty: 35 },
      { type: 'truck',  tx: 32, ty: 28 },
      { type: 'sedan',  tx: 38, ty: 36 },
    ];

    for (const sp of spawnPoints) {
      const x = sp.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
      const y = sp.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
      let v: Vehicle;
      if (sp.type === 'sedan') v = new Sedan(this, x, y);
      else if (sp.type === 'sports') v = new Sports(this, x, y);
      else v = new Truck(this, x, y);
      this.physics.add.existing(v);
      this.vehicles.add(v);
      // Collide vehicles with tilemap
      this.physics.add.collider(v, this.groundLayer);
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
    const dt = Math.min(delta, 50);

    if (this.currentVehicle) {
      this.updateDriving(dt);
    } else {
      this.updateOnFoot();
      this.checkVehicleEntry();
    }

    // Debug tile position + FPS overlay
    if (this.debugText) {
      const tx = Math.floor(this.player.x / CONFIG.TILE_SIZE);
      const ty = Math.floor(this.player.y / CONFIG.TILE_SIZE);
      this.debugText.setText(
        `tile(${tx},${ty}) | fps:${Math.round(this.game.loop.actualFps)} | ${this.currentVehicle ? 'DRIVING' : 'ON FOOT'}`
      );
    }
  }

  private updateOnFoot(): void {
    const left  = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up    = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.S.isDown;
    const sprint = this.wasd.SHIFT.isDown;

    const speed = sprint ? CONFIG.PLAYER_SPRINT : CONFIG.PLAYER_SPEED;
    let vx = 0, vy = 0;
    if (left)  vx -= speed;
    if (right) vx += speed;
    if (up)    vy -= speed;
    if (down)  vy += speed;

    // Normalise diagonal movement to consistent speed
    if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }

    this.player.setVelocity(vx, vy);

    // Rotate player sprite to face movement direction
    if (vx !== 0 || vy !== 0) {
      this.player.setRotation(Math.atan2(vy, vx) + Math.PI / 2);
    }
  }

  private updateDriving(delta: number): void {
    if (!this.currentVehicle) return;

    const accel = this.driveKeys.W.isDown ? 1
                : (this.driveKeys.S.isDown ? -1 : 0);
    const turn  = this.driveKeys.A.isDown ? -1 : (this.driveKeys.D.isDown ? 1 : 0);

    this.currentVehicle.driveUpdate(delta, accel, turn);

    // Keep player hidden at vehicle position
    this.player.setPosition(this.currentVehicle.x, this.currentVehicle.y);
    this.cameras.main.startFollow(this.currentVehicle, true, 0.08, 0.08);
  }

  private checkVehicleEntry(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.eKey)) return;

    // Find nearest unoccupied vehicle within range
    const ENTER_DIST = 30;
    let nearest: Vehicle | null = null;
    let nearestDist = Infinity;

    this.vehicles.getChildren().forEach((obj) => {
      const v = obj as Vehicle;
      if (v.isOccupied()) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, v.x, v.y);
      if (d < ENTER_DIST && d < nearestDist) {
        nearest = v;
        nearestDist = d;
      }
    });

    if (nearest) {
      this.enterVehicle(nearest);
    }
  }

  private enterVehicle(v: Vehicle): void {
    this.currentVehicle = v;
    v.setOccupied(true);
    this.player.setVisible(false);
    this.player.setVelocity(0, 0);
    this.player.body!.enable = false;
    this.cameras.main.startFollow(v, true, 0.08, 0.08);
    // Zoom out slightly while driving
    this.cameras.main.setZoom(1.5);
  }

  private exitVehicle(): void {
    if (!this.currentVehicle) return;
    const v = this.currentVehicle;
    v.halt();
    v.setOccupied(false);
    // Place player next to car
    this.player.setPosition(v.x + 20, v.y);
    this.player.setVisible(true);
    this.player.body!.enable = true;
    this.currentVehicle = null;
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2);
  }
}

// Suppress unused import warnings — EVENTS will be used in full mission/wanted implementation
void EVENTS;
