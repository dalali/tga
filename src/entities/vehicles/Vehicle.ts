import Phaser from 'phaser';
import { Entity } from '../Entity';

export interface VehicleConfig { speed: number; accel: number; turnRate: number; hp: number; }

export class Vehicle extends Entity {
  protected vConfig: VehicleConfig;
  protected heading: number = 0;
  protected currentSpeed: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, config: VehicleConfig) {
    super(scene, x, y, texture, config.hp);
    this.vConfig = config;
  }
}
