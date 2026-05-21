import Phaser from 'phaser';
import { Entity } from '../Entity';

export interface VehicleConfig {
  speed: number;      // max speed in px/s
  accel: number;      // acceleration in px/s²
  turnRate: number;   // degrees/s at full speed; faster at lower speed
  hp: number;
  textureKey: string;
  width: number;
  height: number;
}

export class Vehicle extends Entity {
  protected vConfig: VehicleConfig;
  protected heading: number = 0;    // radians, 0 = right
  protected currentSpeed: number = 0;
  protected occupied: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: VehicleConfig) {
    super(scene, x, y, config.textureKey, config.hp);
    this.vConfig = config;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(config.width - 4, config.height - 4);
    this.setDepth(5);
  }

  isOccupied(): boolean { return this.occupied; }
  setOccupied(v: boolean): void { this.occupied = v; }

  driveUpdate(delta: number, accelInput: number, turnInput: number): void {
    const dt = delta / 1000;
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Acceleration / braking
    if (accelInput > 0) {
      this.currentSpeed = Math.min(this.vConfig.speed, this.currentSpeed + this.vConfig.accel * dt);
    } else if (accelInput < 0) {
      // Reverse is slower
      this.currentSpeed = Math.max(-this.vConfig.speed * 0.4, this.currentSpeed - this.vConfig.accel * 1.5 * dt);
    } else {
      // Coast / friction
      const friction = this.vConfig.accel * 0.6 * dt;
      if (Math.abs(this.currentSpeed) < friction) {
        this.currentSpeed = 0;
      } else {
        this.currentSpeed -= Math.sign(this.currentSpeed) * friction;
      }
    }

    // Steering — turn rate is higher at low speeds, lower at high
    if (Math.abs(this.currentSpeed) > 10 && turnInput !== 0) {
      const speedRatio = Math.abs(this.currentSpeed) / this.vConfig.speed;
      // Full turn rate at low speed, reduces to 40% at max speed
      const effectiveTurnRate = this.vConfig.turnRate * (1.0 - speedRatio * 0.6);
      const turnDelta = Phaser.Math.DegToRad(effectiveTurnRate) * dt;
      this.heading += turnInput * Math.sign(this.currentSpeed) * turnDelta;
    }

    // Apply velocity
    const vx = Math.cos(this.heading) * this.currentSpeed;
    const vy = Math.sin(this.heading) * this.currentSpeed;
    body.setVelocity(vx, vy);

    // Rotate sprite to match heading (heading 0 = right, sprite 0 = up, so offset by -90°)
    this.setRotation(this.heading + Math.PI / 2);
  }

  brake(): void {
    this.currentSpeed *= 0.85;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(
      Math.cos(this.heading) * this.currentSpeed,
      Math.sin(this.heading) * this.currentSpeed
    );
  }

  halt(): void {
    this.currentSpeed = 0;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  getHeading(): number { return this.heading; }
  getCurrentSpeed(): number { return this.currentSpeed; }
}
