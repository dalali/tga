import Phaser from 'phaser';
import { Vehicle } from './Vehicle';

export class CopCar extends Vehicle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Cop cars are faster than sedan but same model
    super(scene, x, y, { speed: 250, accel: 220, turnRate: 130, hp: 400, textureKey: 'cop', width: 24, height: 16 });
  }
}
