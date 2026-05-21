import Phaser from 'phaser';
import { Cop } from './Cop';
import { Pathfinder } from '../../systems/Pathfinder';

export class SwatCop extends Cop {
  constructor(scene: Phaser.Scene, x: number, y: number, pathfinder: Pathfinder) {
    super(scene, x, y, pathfinder);
    // SWAT is tougher
    this.hp = 120;
    this.maxHp = 120;
    this.setTint(0x2222cc); // blue tint to distinguish
  }
}
