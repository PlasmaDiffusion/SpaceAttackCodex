import type { Texture } from 'pixi.js';
import { Entity } from './entity';
import { GAME_HEIGHT, GAME_WIDTH } from './render';

export class Player extends Entity {
  private readonly movementSpeed = 6;

  constructor(texture: Texture) {
    super(texture, { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 82, health: 3 });
  }

  move(direction: number): void {
    this.velX = direction * this.movementSpeed;
  }

  override update(deltaTime: number): void {
    super.update(deltaTime);
    this.x = Math.max(this.width / 2, Math.min(GAME_WIDTH - this.width / 2, this.x));
  }

  shoot(texture: Texture): Bullet {
    return new Bullet(texture, this.x, this.y - this.height / 2 - 10);
  }
}

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

export class Bullet extends Entity {
  constructor(texture: Texture, x: number, y: number) {
    super(texture, { x, y, health: 1, velY: -12 });
  }
}
