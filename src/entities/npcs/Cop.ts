import Phaser from 'phaser';
import { NPC } from './NPC';

export class Cop extends NPC {
  constructor(scene: Phaser.Scene, x: number, y: number) { super(scene, x, y, 'cop', 50); }
  updateAI(_delta: number): void { /* chase FSM + A* — to be implemented */ }
}
