import './style.css';
import { createInput } from './input';
import type { ScreenState } from './hud';
import { Enemy, ENEMY_SCORE } from './entities/Enemy';
import type { EnemyKind } from './entities/Enemy';
import { Player } from './entities/Player';
import { Projectile } from './entities/Projectile';
import { createRenderer, GAME_HEIGHT, GAME_WIDTH } from './render';
import type { Entity } from './entity';

const STARTING_LIVES = 3;
const BASE_ENEMY_SPEED = 24;
const ENEMY_SPEED_PER_ROUND = 2;
const MAX_ENEMY_SPEED = 48;
const MAX_PROJECTILE_DAMAGE = 30;
const FORMATION_EDGE_OFFSET = 70;

function readHighScore(): number {
  try {
    return Number(localStorage.getItem('space-attack-codex-high-score')) || 0;
  } catch {
    return 0;
  }
}

function writeHighScore(score: number): void {
  try {
    localStorage.setItem('space-attack-codex-high-score', String(score));
  } catch {
    // The game remains playable when browser storage is unavailable.
  }
}

async function startGame(): Promise<void> {
  const mount = document.querySelector<HTMLElement>('#game');
  if (!mount) throw new Error('Game mount element #game was not found.');

  const renderer = await createRenderer(mount);
  const player = new Player(renderer.playerTexture);
  let enemies: Enemy[] = [];
  let projectiles: Projectile[] = [];
  let round = 1;
  let score = 0;
  let highScore = readHighScore();
  let lives = STARTING_LIVES;
  let nextExtraLifeAt = 10_000;
  let mode: ScreenState = 'title';
  let attackSelectionTimer = 3;
  let gameOverTimer = 0;
  let roundRestartTimer = 0;
  let formationOffsetX = 0;
  let formationDirection: -1 | 1 = 1;

  const getProjectileDamage = (): number => Math.min(10 + (round - 1) * 2, MAX_PROJECTILE_DAMAGE);
  const createWave = (): Enemy[] => {
    const enemySpeed = Math.min(BASE_ENEMY_SPEED + (round - 1) * ENEMY_SPEED_PER_ROUND, MAX_ENEMY_SPEED);
    const wave: Enemy[] = [];
    const add = (kind: EnemyKind, x: number, y: number, direction: number): void => {
      const enemy = new Enemy(renderer.enemyTextures[kind], x, y, kind, enemySpeed);
      enemy.velX *= direction;
      wave.push(enemy);
    };

    add('yellow', GAME_WIDTH * 0.42, 100, 1);
    add('yellow', GAME_WIDTH * 0.58, 100, 1);
    for (let column = 0; column < 5; column += 1) {
      const x = 250 + column * 125;
      add('green', x, 148, 1);
    }
    const redSpacing = (GAME_WIDTH - 180) / 9;
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 10; column += 1) {
        add('red', 90 + column * redSpacing, 195 + row * 42, 1);
      }
    }
    return wave;
  };

  const setMode = (nextMode: ScreenState): void => {
    mode = nextMode;
    renderer.hud.setScreen(mode, highScore, score);
  };

  const beginGame = (): void => {
    round = 1;
    score = 0;
    lives = STARTING_LIVES;
    nextExtraLifeAt = 10_000;
    player.restoreHealth();
    projectiles = [];
    enemies = createWave();
    attackSelectionTimer = 3;
    formationOffsetX = 0;
    formationDirection = 1;
    setMode('playing');
  };

  const restartRound = (): void => {
    player.restoreHealth();
    projectiles = [];
    enemies = createWave();
    attackSelectionTimer = 3;
    formationOffsetX = 0;
    formationDirection = 1;
    setMode('playing');
  };

  const killPlayer = (): void => {
    if (mode !== 'playing') return;
    player.health = 0;
    player.visible = false;
    lives -= 1;
    projectiles = [];
    if (lives <= 0) {
      gameOverTimer = 3.5;
      setMode('gameover');
    } else {
      roundRestartTimer = 2;
      setMode('respawning');
    }
  };

  const input = createInput(() => {
    if (mode === 'playing') setMode('paused');
    else if (mode === 'paused') setMode('playing');
  });

  const selectAttackers = (): void => {
    const candidates = enemies.filter((enemy) => !enemy.isAttacking);
    for (let count = 0; count < Math.min(3, candidates.length); count += 1) {
      const index = Math.floor(Math.random() * candidates.length);
      const [enemy] = candidates.splice(index, 1);
      enemy.beginAttack(Math.random() < 0.5 ? -1 : 1);
    }
  };

  renderer.hud.setScreen('title', highScore);

  renderer.app.ticker.add((ticker) => {
    const deltaTime = ticker.deltaMS / 1000;

    if (mode === 'title') {
      if (input.wasPressed(' ')) beginGame();
    } else if (mode === 'gameover') {
      input.wasPressed(' ');
      gameOverTimer -= deltaTime;
      if (gameOverTimer <= 0) setMode('title');
    } else if (mode === 'respawning') {
      roundRestartTimer -= deltaTime;
      if (roundRestartTimer <= 0) restartRound();
    } else if (mode === 'playing') {
      const formationSpeed = Math.min(BASE_ENEMY_SPEED + (round - 1) * ENEMY_SPEED_PER_ROUND, MAX_ENEMY_SPEED);
      formationOffsetX += formationDirection * formationSpeed * deltaTime;
      if (formationOffsetX >= FORMATION_EDGE_OFFSET) {
        formationOffsetX = FORMATION_EDGE_OFFSET;
        formationDirection = -1;
      } else if (formationOffsetX <= -FORMATION_EDGE_OFFSET) {
        formationOffsetX = -FORMATION_EDGE_OFFSET;
        formationDirection = 1;
      }
      const formationVelocityX = formationDirection * formationSpeed;

      attackSelectionTimer -= deltaTime;
      while (attackSelectionTimer <= 0) {
        attackSelectionTimer += 3;
        selectAttackers();
      }

      const playerProjectile = player.handleInput(input, renderer.projectileTexture, true, getProjectileDamage());
      if (playerProjectile) projectiles.push(playerProjectile);

      for (const enemy of enemies) {
        enemy.update(deltaTime, formationOffsetX, formationVelocityX);
        const enemyProjectile = enemy.takeShot(renderer.projectileTexture, getProjectileDamage());
        if (enemyProjectile) projectiles.push(enemyProjectile);
      }
      player.update(deltaTime);
      for (const projectile of projectiles) projectile.update(deltaTime);

      for (const enemy of enemies) {
        if (enemy.collidesWith(player)) {
          killPlayer();
          break;
        }
      }

      let playerDamagedThisFrame = false;
      for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0 && mode === 'playing'; projectileIndex -= 1) {
        const projectile = projectiles[projectileIndex];
        if (projectile.y < -30 || projectile.y > GAME_HEIGHT + 30) {
          projectiles.splice(projectileIndex, 1);
          continue;
        }

        if (projectile.isFromPlayer) {
          for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
            const enemy = enemies[enemyIndex];
            if (!projectile.collidesWith(enemy)) continue;
            enemy.health = Math.max(0, enemy.health - projectile.damage);
            projectiles.splice(projectileIndex, 1);
            if (enemy.health <= 0) {
              score += ENEMY_SCORE[enemy.kind];
              renderer.hud.showPoints(enemy.x, enemy.y, ENEMY_SCORE[enemy.kind]);
              enemies.splice(enemyIndex, 1);
              if (score >= nextExtraLifeAt) {
                lives += 1;
                nextExtraLifeAt += 10_000;
              }
              if (score > highScore) {
                highScore = score;
                writeHighScore(highScore);
              }
            }
            break;
          }
        } else if (!playerDamagedThisFrame && projectile.collidesWith(player)) {
          playerDamagedThisFrame = true;
          player.damage(projectile.damage);
          projectiles.splice(projectileIndex, 1);
          if (player.health <= 0) {
            killPlayer();
          }
        }
      }

      if (mode === 'playing' && enemies.length === 0) {
        round += 1;
        enemies = createWave();
        attackSelectionTimer = 3;
        projectiles = projectiles.filter((projectile) => projectile.isFromPlayer);
      }
    } else {
      // Consume the fire press while paused so it cannot fire immediately on resume.
      player.handleInput(input, renderer.projectileTexture, false, getProjectileDamage());
    }

    const entities: Entity[] = [player, ...enemies, ...projectiles];
    renderer.render(entities);
    renderer.hud.update(score, highScore, round, lives, player.health, player.maxHealth, mode === 'playing' ? deltaTime : 0);
  });

  window.addEventListener('pagehide', input.destroy, { once: true });
}

void startGame();
