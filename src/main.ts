import './style.css';
import { createInput } from './input';
import { Enemy, Player } from './entities';
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
      let direction = 0;
      if (input.isDown('a') || input.isDown('arrowleft')) direction -= 1;
      if (input.isDown('d') || input.isDown('arrowright')) direction += 1;
      player.move(direction);

      if (input.wasPressed(' ')) entities.push(player.shoot(renderer.bulletTexture));

      for (const entity of entities) entity.update(deltaTime);
    } else {
      // Consume a space press while paused so it does not fire on resume.
      input.wasPressed(' ');
    }
    renderer.render(entities);
  });

  // Keep a reference to the input cleanup hook for future scene teardown/restarts.
  window.addEventListener('pagehide', input.destroy, { once: true });
}

void startGame();
