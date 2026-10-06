import Phaser from 'phaser';
import { RunInput } from '../systems/RunInput';
import { loadUiAssets } from '../utils/loadUiAssets';

type ResultData = {
  timeMs: number;
  coins: number;
};

export class GameScene extends Phaser.Scene {
  private readonly worldWidth = 7600;
  private readonly floorY = 610;

  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private boosts!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;

  private runInput = new RunInput();
  private startedAt = 0;
  private coinsCollected = 0;
  private finished = false;
  private skillReadyAt = 0;
  private slideUntil = 0;
  private hazardInvulnerableUntil = 0;

  private timerText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Rectangle;
  private progressFrameX = 0;
  private progressFrameWidth = 0;

  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('game');
  }

  preload(): void {
    loadUiAssets(this);
  }

  create(): void {
    this.runInput.reset();
    this.startedAt = this.time.now;
    this.coinsCollected = 0;
    this.finished = false;
    this.skillReadyAt = 0;
    this.slideUntil = 0;
    this.hazardInvulnerableUntil = 0;

    this.physics.world.setBounds(0, 0, this.worldWidth, 720);
    this.cameras.main.setBounds(0, 0, this.worldWidth, 720);

    this.createBackground();
    this.createStage();
    this.createPlayer();
    this.createHud();
    this.bindInput();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.boosts, this.hitBoost, undefined, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.hitHazard, undefined, this);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -300, 80);
    this.showFeedback('GO!', '#16a34a');
  }

  private createBackground(): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x68d7ff, 0x68d7ff, 0xecfaff, 0xecfaff, 1);
    sky.fillRect(0, 0, this.worldWidth, 720);

    for (let x = 200; x < this.worldWidth; x += 460) {
      this.add.circle(x, 120, 36, 0xffffff, 0.4);
      this.add.circle(x + 28, 108, 28, 0xffffff, 0.4);
      this.add.circle(x + 58, 122, 32, 0xffffff, 0.4);
    }

    for (let x = 140; x < this.worldWidth; x += 340) {
      this.add.rectangle(x, 390, 180, 180, 0xffffff, 0.15).setOrigin(0.5, 1);
      this.add.rectangle(x + 60, 405, 110, 140, 0x7dd3fc, 0.16).setOrigin(0.5, 1);
    }

    for (let x = 60; x < this.worldWidth; x += 180) {
      this.add.circle(x, 560, 80, 0x22c55e, 0.24);
      this.add.circle(x + 55, 570, 60, 0x16a34a, 0.18);
    }

    this.add.rectangle(this.worldWidth / 2, 655, this.worldWidth, 130, 0x14532d);
    this.add.rectangle(this.worldWidth / 2, 620, this.worldWidth, 12, 0xfacc15, 0.95);
  }

  private createStage(): void {
    this.platforms = this.physics.add.staticGroup();
    this.boosts = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();
    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });

    this.addPlatform(0, this.floorY, 1550, 55);
    this.addPlatform(1680, this.floorY, 1020, 55);
    this.addPlatform(2860, this.floorY, 900, 55);
    this.addPlatform(3900, this.floorY, 1600, 55);
    this.addPlatform(5650, this.floorY, 1950, 55);

    this.addPlatform(2050, 500, 300, 28);
    this.addPlatform(3330, 465, 270, 28);
    this.addPlatform(4580, 500, 300, 28);
    this.addPlatform(6200, 470, 320, 28);

    this.addBoost(930, this.floorY - 42);
    this.addBoost(2500, this.floorY - 42);
    this.addBoost(4380, this.floorY - 42);
    this.addBoost(5890, this.floorY - 42);

    this.addHazard(3180, this.floorY - 34);
    this.addHazard(4850, this.floorY - 34);
    this.addHazard(6760, this.floorY - 34);

    const coinPositions = [
      [700, 500], [1120, 500], [1830, 520], [2110, 430], [2330, 520],
      [3000, 515], [3390, 395], [3600, 510], [4100, 510], [4640, 430],
      [5220, 510], [5720, 510], [6260, 400], [6500, 500], [7050, 500],
    ];

    coinPositions.forEach(([x, y]) => {
      const coin = this.physics.add.image(x, y, 'ui-coin').setDisplaySize(48, 48);
      const coinBody = coin.body as Phaser.Physics.Arcade.Body;
      coinBody.setAllowGravity(false);
      coinBody.setImmovable(true);
      coinBody.setCircle(24);
      this.coins.add(coin);
    });

    this.add.image(this.worldWidth - 320, 355, 'ui-goal-sign').setDisplaySize(320, 213);
  }

  private addPlatform(x: number, y: number, width: number, height: number): void {
    const platform = this.add.rectangle(x + width / 2, y, width, height, 0x475569);
    platform.setStrokeStyle(6, 0x1e293b);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
  }

  private addBoost(x: number, y: number): void {
    const pad = this.add.rectangle(x, y, 150, 26, 0x22d3ee);
    pad.setStrokeStyle(5, 0x0369a1);
    this.physics.add.existing(pad, true);
    this.boosts.add(pad);
    this.add.text(x, y - 8, '▶ ▶', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  private addHazard(x: number, y: number): void {
    const hazard = this.add.triangle(x, y, 0, 38, 35, 0, 70, 38, 0xef4444);
    hazard.setStrokeStyle(4, 0x991b1b);
    this.physics.add.existing(hazard, true);
    this.hazards.add(hazard);
  }

  private createPlayer(): void {
    if (!this.textures.exists('runner')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff);
      g.fillCircle(26, 18, 13);
      g.lineStyle(9, 0xffffff, 1);
      g.beginPath();
      g.moveTo(26, 32); g.lineTo(26, 76);
      g.moveTo(26, 44); g.lineTo(4, 63);
      g.moveTo(26, 44); g.lineTo(49, 61);
      g.moveTo(26, 76); g.lineTo(7, 106);
      g.moveTo(26, 76); g.lineTo(49, 105);
      g.strokePath();
      g.generateTexture('runner', 56, 112);
      g.destroy();
    }

    this.player = this.physics.add.sprite(160, 490, 'runner');
    this.player.setTint(0x0f172a);
    this.player.setCollideWorldBounds(false);
    this.player.setMaxVelocity(980, 1500);
    this.player.setDragX(300);
    this.player.body?.setSize(42, 96).setOffset(7, 12);
  }

  private createHud(): void {
    const hud = this.add.image(640, 82, 'ui-hud').setDisplaySize(1200, 400).setScrollFactor(0).setDepth(20);
    const hudWidth = hud.displayWidth;
    const hudHeight = hud.displayHeight;
    const left = hud.x - hudWidth / 2;
    const top = hud.y - hudHeight / 2;

    const makeValueText = (x: number, y: number, value: string, size = 30, align: 'left' | 'center' = 'left') =>
      this.add.text(x, y, value, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: `${size}px`,
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#082f74',
        strokeThickness: 6,
        align,
      }).setScrollFactor(0).setDepth(21).setOrigin(align === 'center' ? 0.5 : 0, 0.5);

    this.timerText = makeValueText(left + hudWidth * 0.09, top + hudHeight * 0.58, '0.00 秒', 24);
    this.speedText = makeValueText(left + hudWidth * 0.255, top + hudHeight * 0.58, '0', 24, 'center');
    this.comboText = makeValueText(left + hudWidth * 0.365, top + hudHeight * 0.58, '0', 24, 'center');
    this.coinText = makeValueText(left + hudWidth * 0.93, top + hudHeight * 0.58, '0', 30, 'center');

    this.progressFrameX = left + hudWidth * 0.425;
    this.progressFrameWidth = hudWidth * 0.36;
    const progressY = top + hudHeight * 0.62;

    this.add.rectangle(this.progressFrameX + this.progressFrameWidth / 2, progressY, this.progressFrameWidth, 26, 0x0b3e91, 0.45)
      .setScrollFactor(0)
      .setDepth(21)
      .setStrokeStyle(2, 0xffffff, 0.25);
    this.progressBar = this.add.rectangle(this.progressFrameX, progressY, 0, 18, 0x3bdeff)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(22);

    this.feedbackText = this.add.text(640, 156, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#082f74',
      strokeThickness: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(22);

    this.add.image(640, 658, 'ui-control-strip').setDisplaySize(1100, 367).setScrollFactor(0).setDepth(20);
  }

  private bindInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('キーボード入力を初期化できませんでした。');
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time: number): void {
    if (this.finished) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (Phaser.Input.Keyboard.JustDown(this.keyA)) this.handleStep('A', time);
    if (Phaser.Input.Keyboard.JustDown(this.keyD)) this.handleStep('D', time);

    if (Phaser.Input.Keyboard.JustDown(this.keyW) && body.blocked.down) {
      this.player.setVelocityY(-650);
      this.showFeedback('ジャンプ！', '#38bdf8');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyS) && body.blocked.down) {
      this.slideUntil = time + 550;
      body.setSize(46, 54).setOffset(5, 58);
      this.player.setScale(1.08, 0.58);
      this.showFeedback('スライド！', '#a78bfa');
    }

    if (time > this.slideUntil && this.player.scaleY < 0.9) {
      body.setSize(42, 96).setOffset(7, 12);
      this.player.setScale(1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keySpace) && time >= this.skillReadyAt) {
      this.player.setVelocityX(Math.max(body.velocity.x, 820));
      this.skillReadyAt = time + 4000;
      this.showFeedback('ダッシュ！', '#f97316');
    }

    if (this.player.y > 690) this.resetAfterFall();
    if (this.player.x >= this.worldWidth - 520) {
      this.finishRace();
      return;
    }

    const elapsed = time - this.startedAt;
    this.timerText.setText(`${(elapsed / 1000).toFixed(2)} 秒`);
    this.speedText.setText(`${Math.max(0, Math.round(body.velocity.x))}`);
    this.comboText.setText(`${this.runInput.getCombo()}`);
    this.coinText.setText(`${this.coinsCollected}`);
    const progress = Phaser.Math.Clamp(this.player.x / (this.worldWidth - 520), 0, 1);
    this.progressBar.width = this.progressFrameWidth * progress;
  }

  private handleStep(key: 'A' | 'D', time: number): void {
    const result = this.runInput.step(key, time);
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (!result.valid) {
      this.player.setVelocityX(body.velocity.x * 0.72);
      this.showFeedback('ミス', '#ef4444');
      return;
    }

    const nextSpeed = Phaser.Math.Clamp(body.velocity.x + result.impulse, 0, 900);
    this.player.setVelocityX(nextSpeed);
    if (result.timing === 'perfect') this.showFeedback('パーフェクト！', '#22c55e');
    else if (result.timing === 'good') this.showFeedback('グッド！', '#38bdf8');
    else this.showFeedback('おそい！', '#f59e0b');
  }

  private hitBoost(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.y > 200) return;
    this.player.setVelocityX(Math.max(body.velocity.x, 860));
    this.showFeedback('ブースト！', '#06b6d4');
  }

  private collectCoin(_player: unknown, coin: unknown): void {
    const coinObject = coin as Phaser.GameObjects.GameObject;
    coinObject.destroy();
    this.coinsCollected += 1;
    this.showFeedback('+1', '#facc15');
  }

  private hitHazard(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.time.now < this.slideUntil) return;
    if (this.time.now < this.hazardInvulnerableUntil) return;
    this.hazardInvulnerableUntil = this.time.now + 700;
    this.player.setVelocityX(Math.max(90, body.velocity.x * 0.38));
    this.player.setVelocityY(-260);
    this.showFeedback('いたっ！', '#ef4444');
  }

  private resetAfterFall(): void {
    const safeX = Math.max(120, this.player.x - 420);
    this.player.setPosition(safeX, 460);
    this.player.setVelocity(0, 0);
    this.runInput.reset();
    this.showFeedback('もどった！', '#f59e0b');
  }

  private finishRace(): void {
    this.finished = true;
    const data: ResultData = {
      timeMs: this.time.now - this.startedAt,
      coins: this.coinsCollected,
    };
    this.player.setVelocity(0, 0);
    this.cameras.main.flash(350, 255, 255, 255);
    this.time.delayedCall(500, () => this.scene.start('result', data));
  }

  private showFeedback(message: string, color: string): void {
    this.feedbackText.setText(message).setColor(color).setAlpha(1).setScale(1);
    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      scale: 1.12,
      duration: 650,
      ease: 'Quad.Out',
    });
  }
}
