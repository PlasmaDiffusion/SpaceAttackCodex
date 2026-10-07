import type { Texture } from 'pixi.js';
import { Entity } from '../entity';

export class Projectile extends Entity {
  readonly isFromPlayer: boolean;
  readonly damage: number;

  constructor(texture: Texture, x: number, y: number, isFromPlayer = true, damage = 10) {
    super(texture, { x, y, health: 1, velY: isFromPlayer ? -620 : 260 });
    this.isFromPlayer = isFromPlayer;
    this.damage = damage;
  }
}
