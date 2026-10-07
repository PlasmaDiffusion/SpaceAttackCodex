import './style.css';
import { createInput } from './input';
import { createRenderer } from './rendering';

async function startGame(): Promise<void> {
  const mount = document.querySelector<HTMLElement>('#game');
  if (!mount) throw new Error('Game mount element #game was not found.');

  const renderer = await createRenderer(mount);
  let paused = false;
  const input = createInput(() => {
    paused = !paused;
    renderer.setPaused(paused);
  });

  renderer.app.ticker.add((ticker) => {
    if (paused) return;

    let direction = 0;
    if (input.isDown('a') || input.isDown('arrowleft')) direction -= 1;
    if (input.isDown('d') || input.isDown('arrowright')) direction += 1;
    renderer.movePlayer(direction, ticker.deltaTime);
  });

  // Keep a reference to the input cleanup hook for future scene teardown/restarts.
  window.addEventListener('pagehide', input.destroy, { once: true });
}

void startGame();
