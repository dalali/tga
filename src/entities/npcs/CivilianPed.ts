import Phaser from 'phaser';
import { NPC } from './NPC';

const WANDER_SPEED = 40;
const WANDER_CHANGE_MS = 2000;  // change direction every 2 s
const IDLE_CHANCE = 0.3;        // 30% chance to idle instead of wander

export class CivilianPed extends NPC {
  private velX: number = 0;
  private velY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'civilian', 30);
    this.setAIState('wander');
    this.pickNewDirection();
  }

  updateAI(delta: number): void {
    if (this.isDead()) return;

    this.aiStateTimer += delta;
    if (this.aiStateTimer >= WANDER_CHANGE_MS) {
      this.pickNewDirection();
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.aiState === 'wander') {
      body.setVelocity(this.velX, this.velY);
      if (this.velX !== 0 || this.velY !== 0) {
        this.setRotation(Math.atan2(this.velY, this.velX) + Math.PI / 2);
      }
    } else {
      body.setVelocity(0, 0);
    }
  }

  private pickNewDirection(): void {
    this.aiStateTimer = 0;
    if (Math.random() < IDLE_CHANCE) {
      this.setAIState('idle');
      this.velX = 0;
      this.velY = 0;
      return;
    }
    this.setAIState('wander');
    const angle = Math.random() * Math.PI * 2;
    this.velX = Math.cos(angle) * WANDER_SPEED;
    this.velY = Math.sin(angle) * WANDER_SPEED;
  }

  die(): void {
    this.setAIState('dead');
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.setTint(0x880000);
    // Fade out after 3 s
    this.scene.time.delayedCall(3000, () => this.destroy());
  }
}
