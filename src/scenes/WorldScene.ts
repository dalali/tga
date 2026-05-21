import Phaser from 'phaser';
import { CONFIG } from '../config';
import { GameState } from '../state/GameState';
import { EVENTS } from '../state/events';
import { Vehicle } from '../entities/vehicles/Vehicle';
import { Sedan } from '../entities/vehicles/Sedan';
import { Sports } from '../entities/vehicles/Sports';
import { Truck } from '../entities/vehicles/Truck';
import { Cop } from '../entities/npcs/Cop';
import { SwatCop } from '../entities/npcs/SwatCop';
import { CivilianPed } from '../entities/npcs/CivilianPed';
import { WantedSystem } from '../systems/WantedSystem';
import { CopSpawner } from '../systems/CopSpawner';
import { PedSpawner } from '../systems/PedSpawner';
import { MissionManager } from '../systems/MissionManager';
import { Pathfinder } from '../systems/Pathfinder';
import { ScoringSystem } from '../systems/ScoringSystem';
import type { Mission } from '../types/missions';

const HOSPITAL_TX = 36;
const HOSPITAL_TY = 28;
const PAYPHONE_POSITIONS = [
  { tx: 34, ty: 30, missionId: 'mission-001' },
  { tx: 30, ty: 34, missionId: 'mission-002' },
  { tx: 30, ty: 30, missionId: 'mission-003' },
];

export class WorldScene extends Phaser.Scene {
  // Core
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; SHIFT: Phaser.Input.Keyboard.Key };
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private debugText?: Phaser.GameObjects.Text;
  private mapWidthPx: number = 0;
  private mapHeightPx: number = 0;

  // Vehicles
  private vehicles!: Phaser.GameObjects.Group;
  private currentVehicle: Vehicle | null = null;
  private eKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;

  // NPCs
  private peds!: Phaser.GameObjects.Group;
  private cops!: Phaser.GameObjects.Group;
  private copMap: Map<number, Cop | SwatCop> = new Map();

  // Systems
  private wantedSystem!: WantedSystem;
  private copSpawner!: CopSpawner;
  private pedSpawner!: PedSpawner;
  private missionManager!: MissionManager;
  private pathfinder!: Pathfinder;

  // Combat
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private shootCooldown: number = 0;
  private readonly SHOOT_COOLDOWN_MS = 400;
  private readonly BULLET_SPEED = 400;
  private readonly BULLET_RANGE = 120;
  private bullets!: Phaser.GameObjects.Group;

  // Payphones
  private payphoneMarkers: Phaser.GameObjects.Rectangle[] = [];

  // Win / bust flags
  private busted: boolean = false;
  private won: boolean = false;

  constructor() { super({ key: 'WorldScene' }); }

  create(): void {
    GameState.reset();

    // --- Tilemap ---
    const map = this.make.tilemap({ key: 'city' });
    const tileset = map.addTilesetImage('tileset', 'tileset')!;
    this.groundLayer = map.createLayer('Ground', tileset, 0, 0)!;
    this.groundLayer.setCollision([33, 65]);
    this.mapWidthPx  = map.widthInPixels;
    this.mapHeightPx = map.heightInPixels;
    this.physics.world.setBounds(0, 0, this.mapWidthPx, this.mapHeightPx);

    // --- Pathfinder (build grid from tilemap) ---
    this.pathfinder = new Pathfinder();
    const grid: number[][] = [];
    for (let row = 0; row < map.height; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < map.width; col++) {
        const tile = this.groundLayer.getTileAt(col, row);
        rowData.push(tile ? tile.index : 0);
      }
      grid.push(rowData);
    }
    this.pathfinder.init(grid, [1, 18]);

    // --- Player ---
    const startX = Math.floor(CONFIG.MAP_WIDTH / 2) * CONFIG.TILE_SIZE;
    const startY = Math.floor(CONFIG.MAP_HEIGHT / 2) * CONFIG.TILE_SIZE;
    this.player = this.physics.add.sprite(startX, startY, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.physics.add.collider(this.player, this.groundLayer);

    // --- Camera ---
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, this.mapWidthPx, this.mapHeightPx);
    this.cameras.main.setZoom(2);

    // --- Input ---
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SHIFT: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
    };
    this.eKey     = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const exitFn = () => { if (this.currentVehicle) this.exitVehicle(); };
    this.input.keyboard!.on('keydown-E',     exitFn);
    this.input.keyboard!.on('keydown-ENTER', exitFn);
    this.input.keyboard!.on('keydown-P',   this.togglePause, this);
    this.input.keyboard!.on('keydown-ESC', this.togglePause, this);
    this.input.keyboard!.on('keydown-M',   () => { this.sound.mute = !this.sound.mute; });

    // --- Vehicles ---
    this.vehicles = this.add.group();
    this.spawnVehicles();
    this.physics.add.collider(this.vehicles, this.vehicles);
    this.physics.add.collider(this.player, this.vehicles);

    // --- Bullets ---
    this.bullets = this.add.group();

    // --- NPCs ---
    this.peds = this.add.group();
    this.cops = this.add.group();
    this.wantedSystem = new WantedSystem();
    this.copSpawner   = new CopSpawner(this.mapWidthPx, this.mapHeightPx);
    this.pedSpawner   = new PedSpawner();
    this.spawnPeds();

    // --- Missions ---
    this.missionManager = new MissionManager();
    this.cache.json.get('missions') && this.missionManager.load(this.cache.json.get('missions') as Mission[]);
    this.missionManager.on((e) => {
      if (e.type === 'passed') {
        GameState.addMoney(e.reward!);
        GameState.incrementMultiplier();
        this.emitHUDUpdate();
        this.registry.set('missionState', 'passed');
        this.registry.set('missionText', `MISSION PASSED  +$${e.reward!.toLocaleString()}`);
      } else if (e.type === 'failed') {
        this.registry.set('missionState', 'failed');
        this.registry.set('missionText', 'MISSION FAILED');
      } else if (e.type === 'started') {
        this.registry.set('missionState', 'active');
        this.registry.set('missionText', e.mission.objective);
      }
    });

    // --- Payphones ---
    this.spawnPayphones();

    // Give player a pistol from the start (can upgrade to machinegun later)
    GameState.pickupWeapon('pistol');

    // --- Initial HUD ---
    this.emitHUDUpdate();

    // --- Debug ---
    if (CONFIG.DEBUG) {
      this.debugText = this.add.text(10, 10, '', {
        fontSize: '12px', color: '#00ffff', fontFamily: 'monospace',
      }).setScrollFactor(0).setDepth(100);
    }
  }

  // ─── Spawners ────────────────────────────────────────────────────────────────

  private spawnVehicles(): void {
    const points = [
      { type: 'sedan',  tx: 35, ty: 32 },
      { type: 'sedan',  tx: 28, ty: 32 },
      { type: 'sports', tx: 32, ty: 35 },
      { type: 'truck',  tx: 32, ty: 28 },
      { type: 'sedan',  tx: 38, ty: 36 },
    ];
    for (const sp of points) {
      const x = sp.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
      const y = sp.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
      const v = sp.type === 'sedan' ? new Sedan(this, x, y)
              : sp.type === 'sports' ? new Sports(this, x, y)
              : new Truck(this, x, y);
      this.physics.add.existing(v);
      this.vehicles.add(v);
      this.physics.add.collider(v, this.groundLayer);
    }
  }

  private spawnPeds(): void {
    const points = this.pedSpawner.getInitialSpawnPoints(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT);
    for (const p of points) {
      const ped = new CivilianPed(this, p.x, p.y);
      this.physics.add.collider(ped as unknown as Phaser.Physics.Arcade.Sprite, this.groundLayer);
      this.peds.add(ped);
    }
  }

  private spawnPayphones(): void {
    for (const ph of PAYPHONE_POSITIONS) {
      const x = ph.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
      const y = ph.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
      const marker = this.add.rectangle(x, y, 8, 8, 0x00ff88).setDepth(7);
      (marker as unknown as { missionId: string }).missionId = ph.missionId;
      this.payphoneMarkers.push(marker);
    }
  }

  // ─── Input handling ──────────────────────────────────────────────────────────

  private togglePause(): void {
    if (this.scene.isPaused('WorldScene')) {
      this.scene.resume('WorldScene');
      this.scene.stop('PauseScene');
    } else {
      this.scene.pause('WorldScene');
      this.scene.launch('PauseScene');
    }
  }

  // ─── Vehicle ─────────────────────────────────────────────────────────────────

  private enterVehicle(v: Vehicle): void {
    this.currentVehicle = v;
    v.setOccupied(true);
    this.player.setVisible(false);
    this.player.setVelocity(0, 0);
    this.player.body!.enable = false;
    this.cameras.main.startFollow(v, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
  }

  private exitVehicle(): void {
    if (!this.currentVehicle) return;
    const v = this.currentVehicle;
    v.halt();
    v.setOccupied(false);
    this.player.setPosition(v.x + 24, v.y);
    this.player.setVisible(true);
    this.player.body!.enable = true;
    this.currentVehicle = null;
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2);
  }

  private checkVehicleEntry(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.eKey) && !Phaser.Input.Keyboard.JustDown(this.enterKey)) return;
    const ENTER_DIST = 30;
    let nearest: Vehicle | null = null;
    let nearestDist = Infinity;
    this.vehicles.getChildren().forEach((obj) => {
      const v = obj as Vehicle;
      if (v.isOccupied()) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, v.x, v.y);
      if (d < ENTER_DIST && d < nearestDist) { nearest = v; nearestDist = d; }
    });
    if (nearest) this.enterVehicle(nearest);
  }

  // ─── Combat ──────────────────────────────────────────────────────────────────

  private tryShoot(): void {
    if (GameState.get().weapon === 'none') return;
    if (this.shootCooldown > 0) return;
    this.shootCooldown = this.SHOOT_COOLDOWN_MS;

    const src = this.currentVehicle ?? this.player;
    const rotation = src.rotation - Math.PI / 2;
    const vx = Math.cos(rotation) * this.BULLET_SPEED;
    const vy = Math.sin(rotation) * this.BULLET_SPEED;

    const bullet = this.physics.add.image(src.x, src.y, 'bullet');
    bullet.setDepth(15);
    (bullet.body as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);
    this.bullets.add(bullet);

    // Destroy bullet after it travels out of range
    this.time.delayedCall(this.BULLET_RANGE / this.BULLET_SPEED * 1000, () => {
      if (bullet?.active) bullet.destroy();
    });

    // Bullet vs NPCs
    this.physics.add.overlap(bullet, this.peds, (_b, p) => {
      bullet.destroy();
      const ped = p as unknown as CivilianPed;
      if (!ped.isDead()) {
        ped.die();
        const r = ScoringSystem.getCrimeReward('SHOOT_CIV');
        GameState.addMoney(r.money);
        this.wantedSystem.add(r.stars);
        this.emitHUDUpdate();
      }
    });

    this.physics.add.overlap(bullet, this.cops, (_b, c) => {
      bullet.destroy();
      const cop = c as unknown as Cop;
      if (!cop.isDead()) {
        const dead = cop.takeDamage(25);
        if (dead) {
          cop.die();
          const r = ScoringSystem.getCrimeReward('KILL_COP');
          GameState.addMoney(r.money);
          this.wantedSystem.add(r.stars);
          this.emitHUDUpdate();
        }
      }
    });
  }

  // ─── Run-over detection ───────────────────────────────────────────────────────

  private checkRunOver(): void {
    if (!this.currentVehicle) return;
    const v = this.currentVehicle;
    if (Math.abs(v.getCurrentSpeed()) < 60) return; // min speed to cause damage

    this.peds.getChildren().forEach((obj) => {
      const ped = obj as unknown as CivilianPed;
      if (ped.isDead()) return;
      const d = Phaser.Math.Distance.Between(v.x, v.y, ped.x, ped.y);
      if (d < 20) {
        ped.die();
        const r = ScoringSystem.getCrimeReward('RUN_OVER_CIV');
        GameState.addMoney(r.money);
        this.wantedSystem.add(r.stars);
        this.emitHUDUpdate();
      }
    });
  }

  // ─── Wanted / cop spawning ────────────────────────────────────────────────────

  private updateWanted(dt: number): void {
    // LoS check: cop sees player if within 400 px (25 tiles) with no impassable tile directly between them.
    // Full raycasting omitted; 400 px threshold is generous enough that the wanted cooldown
    // can tick in open streets while still triggering on pursuit.
    const px = this.player.x;
    const py = this.player.y;
    let copsSeePlayer = false;
    this.copMap.forEach((cop) => {
      if (cop.isDead()) return;
      const d = Phaser.Math.Distance.Between(cop.x, cop.y, px, py);
      if (d < 400) copsSeePlayer = true;
    });

    const changed = this.wantedSystem.update(dt, copsSeePlayer);
    const stars = this.wantedSystem.getStars();

    if (changed || stars !== GameState.get().wantedLevel) {
      GameState.update({ wantedLevel: stars });
      this.registry.set('wanted', stars);

      const directives = this.copSpawner.sync(this.wantedSystem.getCopCount(), this.wantedSystem.isSwatActive());
      for (const d of directives) {
        if (d.action === 'spawn') {
          const cop = d.type === 'swat'
            ? new SwatCop(this, d.x!, d.y!, this.pathfinder)
            : new Cop(this, d.x!, d.y!, this.pathfinder);
          cop.setTarget(this.player.x, this.player.y);
          cop.setAIState('chase');
          this.physics.add.collider(cop as unknown as Phaser.Physics.Arcade.Sprite, this.groundLayer);
          this.cops.add(cop);
          this.copMap.set(d.id, cop);
        } else {
          const cop = this.copMap.get(d.id);
          if (cop) { cop.destroy(); this.copMap.delete(d.id); }
        }
      }
    }

    // Update cop targets
    this.copMap.forEach((cop) => {
      if (!cop.isDead()) cop.setTarget(this.player.x, this.player.y);
    });

    // Cop shoots player
    if (stars > 0) {
      this.copMap.forEach((cop) => {
        if (cop.isDead()) return;
        if (cop.canShoot()) {
          cop.resetShootTimer();
          const dead = GameState.takeDamage(15);
          this.registry.set('hp', GameState.get().hp);
          if (dead) this.triggerBust();
        }
      });
    }
  }

  // ─── Bust / respawn ───────────────────────────────────────────────────────────

  private triggerBust(): void {
    if (this.busted) return;
    this.busted = true;
    if (this.currentVehicle) this.exitVehicle();
    this.missionManager.fail();

    this.cameras.main.fade(800, 0, 0, 0, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) {
        GameState.bust();
        this.wantedSystem.reset();
        // Clear all cops
        this.copMap.forEach(c => c.destroy());
        this.copMap.clear();
        this.cops.clear(true, true);
        this.copSpawner.reset();
        // Respawn at hospital
        const hx = HOSPITAL_TX * CONFIG.TILE_SIZE;
        const hy = HOSPITAL_TY * CONFIG.TILE_SIZE;
        this.player.setPosition(hx, hy);
        this.emitHUDUpdate();
        this.cameras.main.flash(400, 255, 255, 255);
        this.busted = false;
      }
    });
    this.registry.set('busted', true);
  }

  // ─── Payphone / mission ───────────────────────────────────────────────────────

  private checkPayphones(): void {
    if (this.missionManager.isActive()) return;
    if (!Phaser.Input.Keyboard.JustDown(this.eKey) && !Phaser.Input.Keyboard.JustDown(this.enterKey)) return;
    for (const marker of this.payphoneMarkers) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, marker.x, marker.y);
      if (d < 24) {
        const missionId = (marker as unknown as { missionId: string }).missionId;
        this.missionManager.accept(missionId);
        break;
      }
    }
  }

  // ─── Win ─────────────────────────────────────────────────────────────────────

  private checkWin(): void {
    if (this.won) return;
    if (GameState.get().score >= CONFIG.WIN_SCORE) {
      this.won = true;
      this.registry.set('won', true);
      this.scene.pause('WorldScene');
    }
  }

  // ─── HUD sync ────────────────────────────────────────────────────────────────

  private emitHUDUpdate(): void {
    const s = GameState.get();
    this.registry.set('score',  s.score);
    this.registry.set('wanted', s.wantedLevel);
    this.registry.set('hp',     s.hp);
    this.registry.set('weapon', s.weapon);
    this.registry.events.emit(EVENTS.SCORE_CHANGED,  s.score);
    this.registry.events.emit(EVENTS.WANTED_CHANGED, s.wantedLevel);
    this.registry.events.emit(EVENTS.HP_CHANGED,     s.hp);
    this.registry.events.emit(EVENTS.WEAPON_CHANGED, s.weapon);
  }

  // ─── Update ──────────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    if (this.busted || this.won) return;
    const dt = Math.min(delta, 50);

    // Movement
    if (this.currentVehicle) {
      this.updateDriving(dt);
    } else {
      this.updateOnFoot();
      this.checkVehicleEntry();
      this.checkPayphones();
    }

    // Shoot
    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    if (this.spaceKey.isDown) this.tryShoot();

    // Run-over check (when driving)
    this.checkRunOver();

    // NPC AI
    this.pathfinder.update();
    this.peds.getChildren().forEach(p => (p as unknown as CivilianPed).updateAI(dt));
    this.cops.getChildren().forEach(c => (c as unknown as Cop).updateAI(dt));

    // Wanted system
    this.updateWanted(dt);

    // Mission timer
    this.missionManager.update(dt);
    if (this.missionManager.isActive()) {
      this.registry.set('missionRemaining', this.missionManager.getRemainingMs());
    }

    // Win check
    this.checkWin();

    // Debug
    if (this.debugText) {
      const tx = Math.floor(this.player.x / CONFIG.TILE_SIZE);
      const ty = Math.floor(this.player.y / CONFIG.TILE_SIZE);
      const s  = GameState.get();
      this.debugText.setText(
        `tile(${tx},${ty}) | fps:${Math.round(this.game.loop.actualFps)} | ${this.currentVehicle ? 'DRIVING' : 'FOOT'} | $${s.money} x${s.multiplier} | ★${s.wantedLevel}`
      );
    }
  }

  private updateOnFoot(): void {
    const left   = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right  = this.cursors.right.isDown || this.wasd.D.isDown;
    const up     = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down   = this.cursors.down.isDown  || this.wasd.S.isDown;
    const sprint = this.wasd.SHIFT.isDown;

    const speed = sprint ? CONFIG.PLAYER_SPRINT : CONFIG.PLAYER_SPEED;
    let vx = 0, vy = 0;
    if (left)  vx -= speed;
    if (right) vx += speed;
    if (up)    vy -= speed;
    if (down)  vy += speed;
    if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }

    this.player.setVelocity(vx, vy);
    if (vx !== 0 || vy !== 0) this.player.setRotation(Math.atan2(vy, vx) + Math.PI / 2);
  }

  private updateDriving(delta: number): void {
    if (!this.currentVehicle) return;
    const accel = (this.wasd.W.isDown || this.cursors.up.isDown)    ? 1
                : (this.wasd.S.isDown || this.cursors.down.isDown)  ? -1 : 0;
    const turn  = (this.wasd.A.isDown || this.cursors.left.isDown)  ? -1
                : (this.wasd.D.isDown || this.cursors.right.isDown) ? 1  : 0;
    this.currentVehicle.driveUpdate(delta, accel, turn);
    this.player.setPosition(this.currentVehicle.x, this.currentVehicle.y);
    this.cameras.main.startFollow(this.currentVehicle, true, 0.08, 0.08);
  }
}
