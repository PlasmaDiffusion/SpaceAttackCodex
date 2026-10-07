import { Application, Container, Graphics, Text } from 'pixi.js';
import './style.css';

const WIDTH = 1000;
const HEIGHT = 620;
const PLAYER_SPEED = 360;
const PLAYER_HALF_WIDTH = 34;

type GameKey = 'a' | 'd' | 'arrowleft' | 'arrowright' | 'arrowup' | 'arrowdown' | ' ' | 'escape';

const heldKeys = new Set<GameKey>();
const acceptedKeys = new Set<GameKey>([
  'a', 'd', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'escape',
]);

const app = new Application();

async function startGame(): Promise<void> {
  await app.init({
    width: WIDTH,
    height: HEIGHT,
    background: '#0b1221',
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  const mount = document.querySelector<HTMLElement>('#game');
  if (!mount) throw new Error('Game mount element #game was not found.');
  mount.appendChild(app.canvas);

  const scene = new Container();
  app.stage.addChild(scene);

  // A subtle star grid gives the play area a sense of scale without distracting from the player.
  const grid = new Graphics();
  for (let x = 40; x < WIDTH; x += 40) {
    for (let y = 40; y < HEIGHT; y += 40) {
      grid.circle(x, y, 1).fill({ color: '#8799bd', alpha: 0.16 });
    }
  }
  scene.addChild(grid);

  const groundY = HEIGHT - 76;
  const ground = new Graphics()
    .moveTo(0, groundY)
    .lineTo(WIDTH, groundY)
    .stroke({ color: '#394863', width: 2 });
  scene.addChild(ground);

  const triangle = new Graphics()
    .moveTo(0, -34)
    .lineTo(30, 24)
    .lineTo(-30, 24)
    .closePath()
    .fill('#72f2c4')
    .stroke({ color: '#d0fff0', width: 2 });
  triangle.x = WIDTH / 2;
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
  instructions.position.set(WIDTH - 28, 27);
  scene.addChild(instructions);

  const pauseLabel = new Text({
    text: 'PAUSED',
    style: { fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: '700', fill: '#f1f5ff', letterSpacing: 5 },
  });
  pauseLabel.anchor.set(0.5);
  pauseLabel.position.set(WIDTH / 2, HEIGHT / 2);
  pauseLabel.visible = false;
  scene.addChild(pauseLabel);

  let paused = false;
  const update = (ticker: { deltaTime: number }): void => {
    if (paused) return;
    let direction = 0;
    if (heldKeys.has('a') || heldKeys.has('arrowleft')) direction -= 1;
    if (heldKeys.has('d') || heldKeys.has('arrowright')) direction += 1;

    triangle.x += direction * PLAYER_SPEED * (ticker.deltaTime / 60);
    triangle.x = Math.max(PLAYER_HALF_WIDTH, Math.min(WIDTH - PLAYER_HALF_WIDTH, triangle.x));
  };
  app.ticker.add(update);

  const normalizeKey = (key: string): GameKey | null => {
    const normalized = key.toLowerCase();
    return acceptedKeys.has(normalized as GameKey) ? normalized as GameKey : null;
  };

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    if (!key) return;
    if (key === ' ' || key.startsWith('arrow')) event.preventDefault();

    if (key === 'escape' && !event.repeat) {
      paused = !paused;
      pauseLabel.visible = paused;
    }
    heldKeys.add(key);
  });

  window.addEventListener('keyup', (event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    if (key) heldKeys.delete(key);
  });

  window.addEventListener('blur', () => heldKeys.clear());
}

void startGame();
