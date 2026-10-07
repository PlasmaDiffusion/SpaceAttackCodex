import './style.css';
import { createInput } from './input';
import { Enemy } from './entities/Enemy';
import { Player } from './entities/Player';
import { createRenderer } from './render';
import type { Entity } from './entity';

async function startGame(): Promise<void> {
  const mount = document.querySelector<HTMLElement>('#game');
  if (!mount) throw new Error('Game mount element #game was not found.');

  const renderer = await createRenderer(mount);
  const player = new Player(renderer.playerTexture);
  const enemies = Array.from({ length: 5 }, (_, index) =>
    new Enemy(renderer.enemyTexture, 130 + index * 185, 112, index % 2 === 0 ? 2 : -2));
  const entities: Entity[] = [player, ...enemies];

  let paused = false;
  const input = createInput(() => {
    paused = !paused;
    renderer.setPaused(paused);
  });

  renderer.app.ticker.add((ticker) => {
    const deltaTime = ticker.deltaTime;
    if (!paused) {
      const projectile = player.handleInput(input, renderer.projectileTexture);
      if (projectile) entities.push(projectile);
      for (const entity of entities) entity.update(deltaTime);
    } else {
      // Let Player consume input while paused without moving or firing.
      player.handleInput(input, renderer.projectileTexture, false);
    }
    renderer.render(entities);
  });

  // Keep a reference to the input cleanup hook for future scene teardown/restarts.
  window.addEventListener('pagehide', input.destroy, { once: true });
}

void startGame();
