import Phaser from 'phaser';
import { Entity } from './Entity';
import { CONFIG } from '../config';

export class Player extends Entity {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player', CONFIG.PLAYER_HP);
  }
}
