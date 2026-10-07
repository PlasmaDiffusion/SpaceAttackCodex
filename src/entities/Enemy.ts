import type { Texture } from 'pixi.js';
import { Entity } from '../entity';
import { GAME_WIDTH } from '../render';

export class Enemy extends Entity {
  constructor(texture: Texture, x: number, y: number, speed = 2) {
    super(texture, { x, y, health: 1, velX: speed });
  }

  override update(deltaTime: number): void {
    super.update(deltaTime);
    const halfWidth = this.width / 2;
    if (this.x <= halfWidth || this.x >= GAME_WIDTH - halfWidth) {
      this.x = Math.max(halfWidth, Math.min(GAME_WIDTH - halfWidth, this.x));
      this.velX *= -1;
    }
  }
}
