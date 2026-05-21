import Phaser from 'phaser';
import { Vehicle } from './Vehicle';
import { CONFIG } from '../../config';

export class Sedan extends Vehicle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'sedan', CONFIG.VEHICLE.SEDAN);
  }
}
