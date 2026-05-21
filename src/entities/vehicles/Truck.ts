import Phaser from 'phaser';
import { Vehicle } from './Vehicle';
import { CONFIG } from '../../config';

export class Truck extends Vehicle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, { ...CONFIG.VEHICLE.TRUCK, textureKey: 'truck', width: 28, height: 18 });
  }
}
