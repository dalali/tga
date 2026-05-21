import Phaser from 'phaser';
import { NPC } from './NPC';
import { Pathfinder } from '../../systems/Pathfinder';

const COP_SPEED = 160;
const REPATHING_MS = 500;
const SHOOT_RANGE = 80;
const SHOOT_COOLDOWN_MS = 2000;

export class Cop extends NPC {
  private pathfinder: Pathfinder;
  private repathTimer: number = 0;
  private shootTimer: number = 0;
  private path: { x: number; y: number }[] = [];
  private pathIndex: number = 0;
  protected targetX: number = 0;
  protected targetY: number = 0;
  // Unstuck logic
  private lastX: number = 0;
  private lastY: number = 0;
  private stuckTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, pathfinder: Pathfinder) {
    super(scene, x, y, 'cop', 50);
    this.pathfinder = pathfinder;
  }

  setTarget(worldX: number, worldY: number): void {
    this.targetX = worldX;
    this.targetY = worldY;
  }

  updateAI(delta: number): void {
    if (this.isDead() || this.aiState === 'idle') return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    this.repathTimer += delta;
    this.shootTimer += delta;

    // Repath every 500 ms
    if (this.repathTimer >= REPATHING_MS) {
      this.repathTimer = 0;
      this.repath();
    }

    // Unstuck: if we haven't moved > 5 px in 2 s, repath immediately
    this.stuckTimer += delta;
    if (this.stuckTimer >= 2000) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, this.lastX, this.lastY);
      if (d < 5) {
        this.repath();
      }
      this.lastX = this.x;
      this.lastY = this.y;
      this.stuckTimer = 0;
    }

    // Follow path
    if (this.path.length > 0 && this.pathIndex < this.path.length) {
      const node = this.path[this.pathIndex];
      const nodePixelX = node.x * 16 + 8;
      const nodePixelY = node.y * 16 + 8;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, nodePixelX, nodePixelY);

      if (dist < 8) {
        this.pathIndex++;
      } else {
        const angle = Math.atan2(nodePixelY - this.y, nodePixelX - this.x);
        body.setVelocity(Math.cos(angle) * COP_SPEED, Math.sin(angle) * COP_SPEED);
        this.setRotation(angle + Math.PI / 2);
      }
    } else {
      // No path — drive directly toward target (fallback)
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
      if (dist > 16) {
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        body.setVelocity(Math.cos(angle) * COP_SPEED, Math.sin(angle) * COP_SPEED);
        this.setRotation(angle + Math.PI / 2);
      } else {
        body.setVelocity(0, 0);
      }
    }
  }

  canShoot(): boolean {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
    return dist < SHOOT_RANGE && this.shootTimer >= SHOOT_COOLDOWN_MS;
  }

  resetShootTimer(): void { this.shootTimer = 0; }

  protected repath(): void {
    const startTX = Math.floor(this.x / 16);
    const startTY = Math.floor(this.y / 16);
    const endTX   = Math.floor(this.targetX / 16);
    const endTY   = Math.floor(this.targetY / 16);

    this.pathfinder.findPath(startTX, startTY, endTX, endTY).then((path) => {
      if (path.length > 1) {
        this.path = path;
        this.pathIndex = 1; // skip start node
      }
    });
  }

  die(): void {
    this.setAIState('dead');
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.setTint(0x444444);
    this.scene.time.delayedCall(4000, () => this.destroy());
  }
}
