import type { Texture } from 'pixi.js';
import { Entity } from '../entity';

export class Projectile extends Entity {
  constructor(texture: Texture, x: number, y: number) {
    super(texture, { x, y, health: 1, velY: -12 });
  }
}
