import { Application, Container, Graphics, Text } from 'pixi.js';

export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 620;
const PLAYER_HALF_WIDTH = 34;

export interface GameRenderer {
  app: Application;
  movePlayer(direction: number, deltaTime: number): void;
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

  const scene = new Container();
  app.stage.addChild(scene);

  // A subtle star grid gives the play area a sense of scale without distracting from the player.
  const grid = new Graphics();
  for (let x = 40; x < GAME_WIDTH; x += 40) {
    for (let y = 40; y < GAME_HEIGHT; y += 40) {
      grid.circle(x, y, 1).fill({ color: '#8799bd', alpha: 0.16 });
    }
  }
  scene.addChild(grid);

  const groundY = GAME_HEIGHT - 76;
  const ground = new Graphics()
    .moveTo(0, groundY)
    .lineTo(GAME_WIDTH, groundY)
    .stroke({ color: '#394863', width: 2 });
  scene.addChild(ground);

  const triangle = new Graphics()
    .moveTo(0, -34)
    .lineTo(30, 24)
    .lineTo(-30, 24)
    .closePath()
    .fill('#72f2c4')
    .stroke({ color: '#d0fff0', width: 2 });
  triangle.x = GAME_WIDTH / 2;
  triangle.y = groundY - 26;
  scene.addChild(triangle);

  const title = new Text({
    text: 'TRIANGLE RUNNER',
    style: { fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: '700', fill: '#f1f5ff', letterSpacing: 2 },
  });
  title.position.set(28, 24);
  scene.addChild(title);

  const instructions = new Text({
    text: 'MOVE  A / D  OR  ← / →',
    style: { fontFamily: 'DM Mono, monospace', fontSize: 12, fill: '#8e9bb5', letterSpacing: 1 },
  });
  instructions.anchor.set(1, 0);
  instructions.position.set(GAME_WIDTH - 28, 27);
  scene.addChild(instructions);

  const pauseLabel = new Text({
    text: 'PAUSED',
    style: { fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: '700', fill: '#f1f5ff', letterSpacing: 5 },
  });
  pauseLabel.anchor.set(0.5);
  pauseLabel.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  pauseLabel.visible = false;
  scene.addChild(pauseLabel);

  return {
    app,
    movePlayer(direction, deltaTime) {
      triangle.x += direction * 360 * (deltaTime / 60);
      triangle.x = Math.max(PLAYER_HALF_WIDTH, Math.min(GAME_WIDTH - PLAYER_HALF_WIDTH, triangle.x));
    },
    setPaused(paused) {
      pauseLabel.visible = paused;
    },
  };
}
