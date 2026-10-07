# Triangle Runner

A minimal TypeScript and PixiJS game loop. A triangle moves horizontally inside the play area.

## Run

```sh
npm install
npm run dev
```

## Controls

- Move left: **A** or **←**
- Move right: **D** or **→**
- Pause or resume: **Escape**
- **↑**, **↓**, and **Space** are also detected and have no gameplay action yet.

The movement update uses PixiJS's ticker and scales motion by frame delta, so movement speed is consistent across frame rates.
