import Phaser from 'phaser';
import { Entity } from '../Entity';

export abstract class NPC extends Entity {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, hp: number) {
    super(scene, x, y, texture, hp);
  }
  abstract updateAI(delta: number): void;
}
