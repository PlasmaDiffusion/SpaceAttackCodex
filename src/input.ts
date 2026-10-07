export type GameKey =
  | 'a'
  | 'd'
  | 'arrowleft'
  | 'arrowright'
  | 'arrowup'
  | 'arrowdown'
  | ' '
  | 'escape';

const acceptedKeys = new Set<GameKey>([
  'a', 'd', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'escape',
]);

function normalizeKey(key: string): GameKey | null {
  const normalized = key.toLowerCase();
  return acceptedKeys.has(normalized as GameKey) ? normalized as GameKey : null;
}

/** Tracks supported keyboard input and notifies the game when Escape is pressed. */
export function createInput(onPauseToggle: () => void) {
  const heldKeys = new Set<GameKey>();
  const pressedKeys = new Set<GameKey>();

  const onKeyDown = (event: KeyboardEvent): void => {
    const key = normalizeKey(event.key);
    if (!key) return;
    if (key === ' ' || key.startsWith('arrow')) event.preventDefault();

    if (!event.repeat) pressedKeys.add(key);
    if (key === 'escape' && !event.repeat) onPauseToggle();
    heldKeys.add(key);
  };

  const onKeyUp = (event: KeyboardEvent): void => {
    const key = normalizeKey(event.key);
    if (key) heldKeys.delete(key);
  };

  const onBlur = (): void => heldKeys.clear();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  return {
    isDown: (key: GameKey): boolean => heldKeys.has(key),
    wasPressed: (key: GameKey): boolean => {
      const pressed = pressedKeys.has(key);
      pressedKeys.delete(key);
      return pressed;
    },
    destroy: (): void => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      heldKeys.clear();
      pressedKeys.clear();
    },
  };
}
