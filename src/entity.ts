import { Sprite } from 'pixi.js';
import type { Texture } from 'pixi.js';

/** Shared sprite and movement state for every game object. */
export class Entity extends Sprite {
  health: number;
  readonly maxHealth: number;
  velX: number;
  velY: number;

  constructor(
    texture: Texture,
    options: { x?: number; y?: number; health?: number; velX?: number; velY?: number } = {},
  ) {
    super(texture);
    this.anchor.set(0.5);
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.maxHealth = options.health ?? 1;
    this.health = this.maxHealth;
    this.velX = options.velX ?? 0;
    this.velY = options.velY ?? 0;
  }

  /** deltaTime is Pixi's normalized ticker delta (1 is one frame at 60 FPS). */
  update(deltaTime: number): void {
    this.x += this.velX * deltaTime;
    this.y += this.velY * deltaTime;
  }

  /** Axis-aligned bounding box overlap check using each sprite's rendered bounds. */
  collidesWith(other: Entity): boolean {
    const a = this.getBounds();
    const b = other.getBounds();
    return a.x < b.x + b.width
      && a.x + a.width > b.x
      && a.y < b.y + b.height
      && a.y + a.height > b.y;
  }

  render(x: number, y: number, texture: Texture): this {
    this.position.set(x, y);
    this.texture = texture;
    return this;
  }
}
