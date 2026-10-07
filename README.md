# Space Attack Codex

A TypeScript and PixiJS starter with a movable player triangle, horizontally moving enemies, and upward-flying bullets. The player, enemies, and bullets are sprite-based entities with shared movement, health, AABB collision, and rendering behavior.

## Run

```sh
npm install
npm run dev
```

## Controls

- Move left: **A** or **←**
- Move right: **D** or **→**
- Fire: **Space**
- Pause or resume: **Escape**
- **↑** and **↓** are detected and have no gameplay action yet.

Movement and entity updates use PixiJS's ticker delta, so motion is scaled consistently across frame rates.
