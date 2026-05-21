import Phaser from 'phaser';
import { Vehicle } from './Vehicle';
import { CONFIG } from '../../config';

export class Sports extends Vehicle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, { ...CONFIG.VEHICLE.SPORTS, textureKey: 'sports', width: 24, height: 14 });
  }
}
