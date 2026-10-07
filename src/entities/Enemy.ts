import type { Texture } from 'pixi.js';
import { Entity } from '../entity';
import { GAME_HEIGHT, GAME_WIDTH } from '../gameConfig';
import { Projectile } from './Projectile';

export type EnemyKind = 'yellow' | 'green' | 'red';

export const ENEMY_SCORE: Record<EnemyKind, number> = {
  yellow: 1000,
  green: 200,
  red: 100,
};

const ATTACK_RANGE = 300;
const ATTACK_SPEED_X = 165;
const ATTACK_SPEED_Y = 115;
const ATTACK_SHOT_INTERVAL = 1.8;

export class Enemy extends Entity {
  private readonly formationX: number;
  private readonly formationY: number;
  private attackOriginX: number;
  private attacking = false;
  private attackShotTimer = 0;
  private readyToShoot = false;
  readonly kind: EnemyKind;

  constructor(texture: Texture, x: number, y: number, kind: EnemyKind, speed: number) {
    super(texture, { x, y, health: 10, velX: speed });
    this.kind = kind;
    this.formationX = x;
    this.formationY = y;
    this.attackOriginX = x;
  }

  get isAttacking(): boolean {
    return this.attacking;
  }

  get formationPositionX(): number {
    return this.formationX;
  }

  beginAttack(direction: -1 | 1): void {
    if (this.attacking) return;
    this.attacking = true;
    this.attackOriginX = this.x;
    this.velX = direction * ATTACK_SPEED_X;
    this.velY = ATTACK_SPEED_Y;
    this.attackShotTimer = 0;
  }

  override update(deltaTime: number, formationOffsetX = 0, formationVelocityX = 0): void {
    if (!this.attacking) {
      this.x = this.formationX + formationOffsetX;
      this.y = this.formationY;
      this.velX = formationVelocityX;
      return;
    }

    super.update(deltaTime);

    this.attackShotTimer += deltaTime;
    if (this.attackShotTimer >= ATTACK_SHOT_INTERVAL) {
      this.attackShotTimer -= ATTACK_SHOT_INTERVAL;
      this.readyToShoot = true;
    }

    const halfRange = ATTACK_RANGE / 2;
    const attackMinX = Math.max(this.width / 2, this.attackOriginX - halfRange);
    const attackMaxX = Math.min(GAME_WIDTH - this.width / 2, this.attackOriginX + halfRange);
    if (this.x <= attackMinX || this.x >= attackMaxX) {
      this.velX *= -1;
      this.x = Math.max(attackMinX, Math.min(attackMaxX, this.x));
    }

    if (this.y >= GAME_HEIGHT + this.height) {
      this.attacking = false;
      this.position.set(this.formationX + formationOffsetX, this.formationY);
      this.velY = 0;
      this.attackShotTimer = 0;
      this.readyToShoot = false;
    }
  }

  takeShot(texture: Texture, damage: number): Projectile | null {
    if (!this.attacking || !this.readyToShoot) return null;
    this.readyToShoot = false;
    return new Projectile(texture, this.x, this.y + this.height / 2 + 10, false, damage);
  }
}
