import type { Texture } from 'pixi.js';
import { Entity } from '../entity';
import type { InputState } from '../input';
import { GAME_HEIGHT, GAME_WIDTH } from '../render';
import { Projectile } from './Projectile';

export class Player extends Entity {
  private readonly movementSpeed = 6;

  constructor(texture: Texture) {
    super(texture, { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 82, health: 3 });
  }

  handleInput(input: InputState, projectileTexture: Texture, canAct = true): Projectile | null {
    let direction = 0;
    if (input.isDown('a') || input.isDown('arrowleft')) direction -= 1;
    if (input.isDown('d') || input.isDown('arrowright')) direction += 1;
    this.velX = (canAct ? direction : 0) * this.movementSpeed;

    const shootPressed = input.wasPressed(' ');
    return canAct && shootPressed ? this.shoot(projectileTexture) : null;
  }

  override update(deltaTime: number): void {
    super.update(deltaTime);
    this.x = Math.max(this.width / 2, Math.min(GAME_WIDTH - this.width / 2, this.x));
  }

  private shoot(texture: Texture): Projectile {
    return new Projectile(texture, this.x, this.y - this.height / 2 - 10);
  }
}
