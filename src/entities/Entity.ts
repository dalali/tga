import Phaser from 'phaser';

export abstract class Entity extends Phaser.GameObjects.Sprite {
  protected hp: number;
  protected maxHp: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, hp: number) {
    super(scene, x, y, texture);
    this.hp = hp;
    this.maxHp = hp;
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  isDead(): boolean { return this.hp <= 0; }
  getHp(): number { return this.hp; }
}
