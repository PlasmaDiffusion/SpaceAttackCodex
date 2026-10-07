import { Application, Container, Graphics, Text } from 'pixi.js';
import type { Texture } from 'pixi.js';
import type { Entity } from './entity';

export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 620;

export interface GameRenderer {
  app: Application;
  playerTexture: Texture;
  enemyTexture: Texture;
  projectileTexture: Texture;
  render(entities: Entity[]): void;
  setPaused(paused: boolean): void;
}

export async function createRenderer(mount: HTMLElement): Promise<GameRenderer> {
  const app = new Application();
  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    background: '#0b1221',
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  mount.appendChild(app.canvas);

  const stage = new Container();
  app.stage.addChild(stage);

  const grid = new Graphics();
  for (let x = 40; x < GAME_WIDTH; x += 40) {
    for (let y = 40; y < GAME_HEIGHT; y += 40) {
      grid.circle(x, y, 1).fill({ color: '#8799bd', alpha: 0.16 });
    }
  }
  stage.addChild(grid);

  const title = new Text({
    text: 'SPACE ATTACK CODEX',
    style: { fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: '700', fill: '#f1f5ff', letterSpacing: 2 },
  });
  title.position.set(28, 24);
  stage.addChild(title);

  const instructions = new Text({
    text: 'MOVE  A / D  OR  ← / →     FIRE  SPACE',
    style: { fontFamily: 'DM Mono, monospace', fontSize: 12, fill: '#8e9bb5', letterSpacing: 1 },
  });
  instructions.anchor.set(1, 0);
  instructions.position.set(GAME_WIDTH - 28, 27);
  stage.addChild(instructions);

  const pauseLabel = new Text({
    text: 'PAUSED',
    style: { fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: '700', fill: '#f1f5ff', letterSpacing: 5 },
  });
  pauseLabel.anchor.set(0.5);
  pauseLabel.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  pauseLabel.visible = false;
  stage.addChild(pauseLabel);

  const playerGraphic = new Graphics()
    .moveTo(0, -24)
    .lineTo(22, 18)
    .lineTo(-22, 18)
    .closePath()
    .fill('#72f2c4')
    .stroke({ color: '#d0fff0', width: 2 });
  const enemyGraphic = new Graphics()
    .roundRect(-22, -15, 44, 30, 5)
    .fill('#ff6482')
    .stroke({ color: '#ffd1dc', width: 2 });
  const projectileGraphic = new Graphics()
    .roundRect(-3, -11, 6, 22, 3)
    .fill('#ffe47a');

  return {
    app,
    playerTexture: app.renderer.generateTexture(playerGraphic),
    enemyTexture: app.renderer.generateTexture(enemyGraphic),
    projectileTexture: app.renderer.generateTexture(projectileGraphic),
    render(entities) {
      for (const entity of entities) {
        entity.render(entity.x, entity.y, entity.texture);
        if (entity.parent !== stage) stage.addChild(entity);
      }
    },
    setPaused(paused) {
      pauseLabel.visible = paused;
    },
  };
}
