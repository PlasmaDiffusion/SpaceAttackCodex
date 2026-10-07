import { Container, Graphics, Text } from 'pixi.js';
import { GAME_HEIGHT, GAME_WIDTH } from './gameConfig';

export type ScreenState = 'title' | 'playing' | 'paused' | 'respawning' | 'gameover';

interface ScorePopup {
  text: Text;
  remaining: number;
}

export class HUD {
  private readonly scoreText: Text;
  private readonly highScoreText: Text;
  private readonly roundText: Text;
  private readonly livesText: Text;
  private readonly healthFill: Graphics;
  private readonly screenOverlay: Container;
  private readonly screenTitle: Text;
  private readonly screenMessage: Text;
  private readonly scorePopups: ScorePopup[] = [];

  constructor(private readonly layer: Container) {
    const labelStyle = { fontFamily: 'monospace', fontSize: 14, fill: '#e9f1ff', letterSpacing: 1 };
    this.scoreText = new Text({ text: 'SCORE  0', style: labelStyle });
    this.scoreText.position.set(24, 20);
    layer.addChild(this.scoreText);

    this.highScoreText = new Text({ text: 'HIGH  0', style: labelStyle });
    this.highScoreText.anchor.set(1, 0);
    this.highScoreText.position.set(GAME_WIDTH - 24, 20);
    layer.addChild(this.highScoreText);

    this.roundText = new Text({ text: 'ROUND  1', style: labelStyle });
    this.roundText.anchor.set(1, 1);
    this.roundText.position.set(GAME_WIDTH - 24, GAME_HEIGHT - 18);
    layer.addChild(this.roundText);

    this.livesText = new Text({ text: 'LIVES', style: labelStyle });
    this.livesText.position.set(GAME_WIDTH / 2 - 25, GAME_HEIGHT - 30);
    layer.addChild(this.livesText);

    const healthLabel = new Text({ text: 'HULL', style: { ...labelStyle, fontSize: 10, fill: '#9eabc2' } });
    healthLabel.position.set(24, GAME_HEIGHT - 54);
    layer.addChild(healthLabel);
    const healthTrack = new Graphics().roundRect(24, GAME_HEIGHT - 36, 150, 10, 5).fill('#28364c');
    layer.addChild(healthTrack);
    this.healthFill = new Graphics();
    layer.addChild(this.healthFill);

    this.screenOverlay = new Container();
    this.screenOverlay.visible = false;
    const veil = new Graphics().rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill({ color: '#050914', alpha: 0.78 });
    this.screenOverlay.addChild(veil);
    this.screenTitle = new Text({
      text: 'SPACE ATTACK CODEX',
      style: { fontFamily: 'Trebuchet MS, sans-serif', fontSize: 38, fontWeight: '700', fill: '#72f2c4', letterSpacing: 3 },
    });
    this.screenTitle.anchor.set(0.5);
    this.screenTitle.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 48);
    this.screenOverlay.addChild(this.screenTitle);
    this.screenMessage = new Text({
      text: 'PRESS SPACE TO START',
      style: { fontFamily: 'monospace', fontSize: 16, fill: '#f1f5ff', letterSpacing: 2, align: 'center' },
    });
    this.screenMessage.anchor.set(0.5);
    this.screenMessage.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16);
    this.screenOverlay.addChild(this.screenMessage);
    layer.addChild(this.screenOverlay);
  }

  update(score: number, highScore: number, round: number, lives: number, health: number, maxHealth: number, deltaTime: number): void {
    this.scoreText.text = `SCORE  ${score.toString().padStart(6, '0')}`;
    this.highScoreText.text = `HIGH  ${highScore.toString().padStart(6, '0')}`;
    this.roundText.text = `ROUND  ${round}`;
    this.livesText.text = `LIVES  ${'◆ '.repeat(lives).trim() || '—'}`;

    this.healthFill.clear();
    const ratio = Math.max(0, Math.min(1, health / maxHealth));
    if (ratio > 0) {
      const color = ratio > 0.5 ? '#72f2c4' : ratio > 0.25 ? '#ffe47a' : '#ff6482';
      this.healthFill.roundRect(24, GAME_HEIGHT - 36, 150 * ratio, 10, 5).fill(color);
    }

    for (let index = this.scorePopups.length - 1; index >= 0; index -= 1) {
      const popup = this.scorePopups[index];
      popup.remaining -= deltaTime;
      popup.text.y -= 24 * deltaTime;
      popup.text.alpha = Math.max(0, popup.remaining / 1.4);
      if (popup.remaining <= 0) {
        this.layer.removeChild(popup.text);
        popup.text.destroy();
        this.scorePopups.splice(index, 1);
      }
    }
  }

  showPoints(x: number, y: number, points: number): void {
    const text = new Text({
      text: `+${points}`,
      style: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700', fill: '#ffe47a' },
    });
    text.anchor.set(0.5);
    text.position.set(x, y);
    this.layer.addChild(text);
    this.scorePopups.push({ text, remaining: 1.4 });
  }

  setScreen(state: ScreenState, highScore: number, score = 0): void {
    this.screenOverlay.visible = state !== 'playing';
    if (state === 'title') {
      this.screenTitle.text = 'SPACE ATTACK CODEX';
      this.screenMessage.text = `PRESS SPACE TO START\nHIGH SCORE  ${highScore.toString().padStart(6, '0')}`;
    } else if (state === 'paused') {
      this.screenTitle.text = 'PAUSED';
      this.screenMessage.text = 'PRESS ESCAPE TO RESUME';
    } else if (state === 'respawning') {
      this.screenTitle.text = 'PLAYER DESTROYED';
      this.screenMessage.text = 'ROUND RESTARTING';
    } else if (state === 'gameover') {
      this.screenTitle.text = 'GAME OVER';
      this.screenMessage.text = `FINAL SCORE  ${score.toString().padStart(6, '0')}`;
    }
  }
}
