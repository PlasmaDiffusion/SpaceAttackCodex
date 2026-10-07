import { Application, Container, Graphics, Text } from 'pixi.js';
import type { Texture } from 'pixi.js';
import type { Entity } from './entity';
import { GAME_HEIGHT, GAME_WIDTH } from './gameConfig';
import { HUD } from './hud';
import type { EnemyKind } from './entities/Enemy';

export { GAME_HEIGHT, GAME_WIDTH } from './gameConfig';

export interface GameRenderer {
  app: Application;
  hud: HUD;
  playerTexture: Texture;
  enemyTextures: Record<EnemyKind, Texture>;
  projectileTexture: Texture;
  render(entities: Entity[]): void;
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

  const worldLayer = new Container();
  const uiLayer = new Container();
  app.stage.addChild(worldLayer, uiLayer);

  const grid = new Graphics();
  for (let x = 40; x < GAME_WIDTH; x += 40) {
    for (let y = 40; y < GAME_HEIGHT; y += 40) {
      grid.circle(x, y, 1).fill({ color: '#8799bd', alpha: 0.16 });
    }
  }
  worldLayer.addChild(grid);

  const instructions = new Text({
    text: 'A / D  OR  ← / →  MOVE     SPACE  FIRE     ESC  PAUSE',
    style: { fontFamily: 'monospace', fontSize: 11, fill: '#61718d', letterSpacing: 1 },
  });
  instructions.anchor.set(0.5, 0);
  instructions.position.set(GAME_WIDTH / 2, 20);
  uiLayer.addChild(instructions);

  const playerGraphic = new Graphics()
    .moveTo(0, -24).lineTo(22, 18).lineTo(-22, 18).closePath()
    .fill('#72f2c4').stroke({ color: '#d0fff0', width: 2 });
  const makeEnemyGraphic = (color: string): Graphics => new Graphics()
    .roundRect(-20, -14, 40, 28, 6)
    .fill(color)
    .stroke({ color: '#ffffff', width: 2, alpha: 0.75 });
  const projectileGraphic = new Graphics().roundRect(-3, -11, 6, 22, 3).fill('#ffe47a');

  const hud = new HUD(uiLayer);
  let renderedEntities = new Set<Entity>();

  return {
    app,
    hud,
    playerTexture: app.renderer.generateTexture(playerGraphic),
    enemyTextures: {
      yellow: app.renderer.generateTexture(makeEnemyGraphic('#ffd84d')),
      green: app.renderer.generateTexture(makeEnemyGraphic('#61e58c')),
      red: app.renderer.generateTexture(makeEnemyGraphic('#ff6482')),
    },
    projectileTexture: app.renderer.generateTexture(projectileGraphic),
    render(entities) {
      const currentEntities = new Set(entities);
      for (const entity of renderedEntities) {
        if (!currentEntities.has(entity)) worldLayer.removeChild(entity);
      }
      for (const entity of entities) {
        entity.render(entity.x, entity.y, entity.texture);
        if (entity.parent !== worldLayer) worldLayer.addChild(entity);
      }
      renderedEntities = currentEntities;
    },
  };
}
