import Phaser from 'phaser';
import { RunInput } from '../systems/RunInput';
import { loadUiAssets } from '../utils/loadUiAssets';

type ResultData = { timeMs: number; coins: number };

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
  private lastRunFrameAt = 0;
  private runFrame = 0;

  private timerText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Rectangle;
  private speedLines: Phaser.GameObjects.Rectangle[] = [];

  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor() { super('game'); }

  preload(): void { loadUiAssets(this); }

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
    this.cameras.main.setBackgroundColor('rgba(155,216,255,0.92)');

    this.createRunnerTextures();
    this.createBackground();
    this.createStage();
    this.createPlayer();
    this.createSpeedLines();
    this.createHud();
    this.bindInput();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.boosts, this.hitBoost, undefined, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.hitHazard, undefined, this);

    this.cameras.main.startFollow(this.player, true, 0.075, 0.075, -315, 70);
    this.showFeedback('GO!', '#facc15', 1.2);
  }

  private createRunnerTextures(): void {
    if (this.textures.exists('rayn-run-1')) return;

    const draw = (key: string, pose: 'run1' | 'run2' | 'jump' | 'slide') => {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      const skin = 0xffdfbd;
      const dark = 0x172033;
      const cyan = 0x22d3ee;
      const yellow = 0xfacc15;
      const white = 0xf8fafc;

      if (pose === 'slide') {
        g.fillStyle(dark).fillCircle(66, 40, 24);
        g.fillStyle(skin).fillCircle(78, 47, 16);
        g.fillStyle(white).fillRoundedRect(50, 62, 95, 42, 14);
        g.fillStyle(cyan).fillRect(107, 67, 10, 30);
        g.fillStyle(dark).fillRoundedRect(112, 91, 78, 26, 9);
        g.fillStyle(yellow).fillRect(160, 94, 10, 20);
        g.lineStyle(14, dark, 1).lineBetween(82, 96, 28, 122);
        g.lineStyle(14, dark, 1).lineBetween(130, 105, 198, 119);
        g.fillStyle(white).fillRoundedRect(8, 112, 48, 18, 8);
        g.fillStyle(white).fillRoundedRect(185, 111, 46, 18, 8);
      } else {
        const jump = pose === 'jump';
        const phase = pose === 'run2' ? -1 : 1;
        g.fillStyle(dark).fillCircle(58, 33, 29);
        g.fillStyle(skin).fillCircle(65, 40, 18);
        g.fillStyle(dark).fillTriangle(33, 18, 52, 0, 58, 26);
        g.fillStyle(dark).fillTriangle(52, 13, 74, 2, 68, 28);
        g.fillStyle(cyan).fillRoundedRect(45, 23, 16, 5, 2);

        g.fillStyle(white).fillRoundedRect(37, 60, 70, 55, 14);
        g.fillStyle(cyan).fillRect(71, 69, 8, 27);
        g.fillStyle(dark).fillRoundedRect(84, 77, 33, 39, 8);
        g.fillStyle(yellow).fillRect(104, 88, 6, 19);

        const armA = jump ? -18 : 18 * phase;
        const armB = jump ? -8 : -18 * phase;
        g.lineStyle(12, dark, 1).lineBetween(43, 72, 22 + armA, 93);
        g.lineStyle(12, dark, 1).lineBetween(102, 72, 126 + armB, 87);
        g.fillStyle(skin).fillCircle(22 + armA, 93, 9);
        g.fillStyle(skin).fillCircle(126 + armB, 87, 9);

        if (jump) {
          g.lineStyle(14, dark, 1).lineBetween(58, 112, 34, 145);
          g.lineStyle(14, dark, 1).lineBetween(86, 112, 113, 143);
          g.fillStyle(white).fillRoundedRect(14, 139, 42, 18, 8);
          g.fillStyle(white).fillRoundedRect(101, 136, 42, 18, 8);
        } else {
          g.lineStyle(14, dark, 1).lineBetween(58, 112, 31 + 22 * phase, 153);
          g.lineStyle(14, dark, 1).lineBetween(86, 112, 114 - 22 * phase, 151);
          g.fillStyle(white).fillRoundedRect(16 + 22 * phase, 145, 44, 18, 8);
          g.fillStyle(white).fillRoundedRect(100 - 22 * phase, 143, 44, 18, 8);
        }
      }
      g.generateTexture(key, pose === 'slide' ? 240 : 155, pose === 'slide' ? 145 : 170);
      g.destroy();
    };

    draw('rayn-run-1', 'run1');
    draw('rayn-run-2', 'run2');
    draw('rayn-jump', 'jump');
    draw('rayn-slide', 'slide');
  }

  private createBackground(): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x6cdcff, 0x6cdcff, 0xdff8ff, 0xdff8ff, 1);
    sky.fillRect(0, 0, this.worldWidth, 720);

    for (let x = 120; x < this.worldWidth; x += 420) {
      this.add.circle(x, 128 + (x % 3) * 18, 34, 0xffffff, 0.38);
      this.add.circle(x + 30, 115, 26, 0xffffff, 0.38);
      this.add.circle(x + 60, 130, 31, 0xffffff, 0.38);
    }

    for (let x = 100; x < this.worldWidth; x += 270) {
      const h = 105 + ((x / 270) % 4) * 28;
      this.add.rectangle(x, 505, 150, h, 0xffffff, 0.12).setOrigin(0.5, 1);
      this.add.rectangle(x + 55, 510, 82, h * 0.7, 0x38bdf8, 0.12).setOrigin(0.5, 1);
    }

    for (let x = 30; x < this.worldWidth; x += 170) {
      this.add.circle(x, 570, 78, 0x22c55e, 0.2);
      this.add.circle(x + 52, 578, 60, 0x16a34a, 0.16);
    }

    this.add.rectangle(this.worldWidth / 2, 660, this.worldWidth, 120, 0x14532d, 1);
    this.add.rectangle(this.worldWidth / 2, 618, this.worldWidth, 10, 0xfacc15, 0.9);
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

    [930, 2500, 4380, 5890].forEach(x => this.addBoost(x, this.floorY - 42));
    [3180, 4850, 6760].forEach(x => this.addHazard(x, this.floorY - 34));

    const coinPositions = [
      [700, 500], [1120, 500], [1830, 520], [2110, 430], [2330, 520],
      [3000, 515], [3390, 395], [3600, 510], [4100, 510], [4640, 430],
      [5220, 510], [5720, 510], [6260, 400], [6500, 500], [7050, 500],
    ];

    coinPositions.forEach(([x, y]) => {
      const coin = this.physics.add.image(x, y, 'ui-coin').setDisplaySize(48, 48);
      const body = coin.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setCircle(24);
      this.tweens.add({ targets: coin, y: y - 12, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.coins.add(coin);
    });

    this.add.image(this.worldWidth - 320, 360, 'ui-goal-sign').setDisplaySize(310, 207);
  }

  private addPlatform(x: number, y: number, width: number, height: number): void {
    const platform = this.add.rectangle(x + width / 2, y, width, height, 0x334155);
    platform.setStrokeStyle(5, 0x0f172a);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
  }

  private addBoost(x: number, y: number): void {
    const pad = this.add.rectangle(x, y, 150, 24, 0x22d3ee).setStrokeStyle(4, 0x0369a1);
    this.physics.add.existing(pad, true);
    this.boosts.add(pad);
    const label = this.add.text(x, y - 10, '▶ ▶ ▶', { fontSize: '24px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    this.tweens.add({ targets: label, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
  }

  private addHazard(x: number, y: number): void {
    const hazard = this.add.triangle(x, y, 0, 38, 35, 0, 70, 38, 0xef4444).setStrokeStyle(4, 0x991b1b);
    this.physics.add.existing(hazard, true);
    this.hazards.add(hazard);
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(160, 470, 'rayn-run-1').setDisplaySize(112, 124);
    this.player.setCollideWorldBounds(false);
    this.player.setMaxVelocity(980, 1500);
    this.player.setDragX(300);
    this.player.body?.setSize(54, 112).setOffset(30, 30);
  }

  private createSpeedLines(): void {
    for (let i = 0; i < 12; i += 1) {
      const line = this.add.rectangle(0, 0, 120 + i * 12, 3 + (i % 3), 0xffffff, 0)
        .setScrollFactor(0)
        .setDepth(8)
        .setOrigin(1, 0.5);
      this.speedLines.push(line);
    }
  }

  private createHud(): void {
    const panel = (x: number, w: number) =>
      this.add.rectangle(x, 48, w, 62, 0x061d4f, 0.72).setScrollFactor(0).setDepth(20).setStrokeStyle(2, 0xffffff, 0.16);

    panel(116, 178); panel(302, 150); panel(470, 150); panel(1140, 150);
    this.add.rectangle(785, 48, 430, 40, 0x061d4f, 0.64).setScrollFactor(0).setDepth(20).setStrokeStyle(2, 0xffffff, 0.16);
    this.progressBar = this.add.rectangle(575, 48, 0, 24, 0x22d3ee, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(21);

    const mkLabel = (x: number, text: string) =>
      this.add.text(x, 29, text, { fontSize: '13px', fontStyle: 'bold', color: '#8bf3ff' }).setOrigin(0.5).setScrollFactor(0).setDepth(22);
    const mkValue = (x: number, text: string, size = 24) =>
      this.add.text(x, 53, text, { fontSize: `${size}px`, fontStyle: 'bold', color: '#ffffff', stroke: '#082f74', strokeThickness: 5 }).setOrigin(0.5).setScrollFactor(0).setDepth(22);

    mkLabel(116, 'TIME'); this.timerText = mkValue(116, '0.00');
    mkLabel(302, 'SPEED'); this.speedText = mkValue(302, '0');
    mkLabel(470, 'COMBO'); this.comboText = mkValue(470, '0');
    mkLabel(1140, 'COIN'); this.coinText = mkValue(1140, '0');
    this.add.image(1093, 48, 'ui-coin').setDisplaySize(32, 32).setScrollFactor(0).setDepth(22);

    this.feedbackText = this.add.text(640, 142, '', {
      fontFamily: 'system-ui, sans-serif', fontSize: '44px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#082f74', strokeThickness: 9,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(25);

    this.add.text(640, 688, 'A ⇄ D 走る　 W ジャンプ　 S スライド　 SPACE ダッシュ', {
      fontFamily: 'system-ui, sans-serif', fontSize: '17px', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: 'rgba(3,20,47,.60)',
      padding: { left: 14, right: 14, top: 8, bottom: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
  }

  private bindInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('keyboard unavailable');
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
      this.player.setTexture('rayn-jump').setDisplaySize(112, 124);
      this.cameras.main.shake(90, 0.0025);
      this.showFeedback('JUMP!', '#38bdf8');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyS) && body.blocked.down) {
      this.slideUntil = time + 520;
      body.setSize(88, 48).setOffset(58, 76);
      this.player.setTexture('rayn-slide').setDisplaySize(150, 92);
      this.showFeedback('SLIDE!', '#a78bfa');
    }

    if (time > this.slideUntil && this.player.texture.key === 'rayn-slide') {
      body.setSize(54, 112).setOffset(30, 30);
      this.player.setTexture('rayn-run-1').setDisplaySize(112, 124);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keySpace) && time >= this.skillReadyAt) {
      this.player.setVelocityX(Math.max(body.velocity.x, 860));
      this.skillReadyAt = time + 4000;
      this.cameras.main.shake(150, 0.006);
      this.flashSpeedLines(1);
      this.showFeedback('DASH!', '#f97316', 1.18);
    }

    if (body.blocked.down && time > this.slideUntil && body.velocity.x > 40) {
      if (time - this.lastRunFrameAt > 90) {
        this.runFrame = 1 - this.runFrame;
        this.player.setTexture(this.runFrame ? 'rayn-run-2' : 'rayn-run-1').setDisplaySize(112, 124);
        this.lastRunFrameAt = time;
      }
    } else if (!body.blocked.down && this.player.texture.key !== 'rayn-slide') {
      this.player.setTexture('rayn-jump').setDisplaySize(112, 124);
    }

    const speedRatio = Phaser.Math.Clamp(body.velocity.x / 900, 0, 1);
    this.updateSpeedLines(speedRatio);
    this.cameras.main.setZoom(1 + speedRatio * 0.025);

    if (this.player.y > 690) this.resetAfterFall();
    if (this.player.x >= this.worldWidth - 520) {
      this.finishRace();
      return;
    }

    this.timerText.setText(((time - this.startedAt) / 1000).toFixed(2));
    this.speedText.setText(String(Math.max(0, Math.round(body.velocity.x))));
    this.comboText.setText(String(this.runInput.getCombo()));
    this.coinText.setText(String(this.coinsCollected));
    this.progressBar.width = 420 * Phaser.Math.Clamp(this.player.x / (this.worldWidth - 520), 0, 1);
  }

  private handleStep(key: 'A' | 'D', time: number): void {
    const result = this.runInput.step(key, time);
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (!result.valid) {
      this.player.setVelocityX(body.velocity.x * 0.66);
      this.cameras.main.shake(110, 0.004);
      this.showFeedback('MISS', '#ef4444', 0.92);
      return;
    }

    const nextSpeed = Phaser.Math.Clamp(body.velocity.x + result.impulse, 0, 900);
    this.player.setVelocityX(nextSpeed);

    if (result.timing === 'perfect') {
      this.showFeedback(`PERFECT  ×${this.runInput.getCombo()}`, '#facc15', 1.12);
      this.flashSpeedLines(0.75);
    } else if (result.timing === 'good') {
      this.showFeedback('GOOD', '#22d3ee');
    } else {
      this.showFeedback('LATE', '#fb923c', 0.95);
    }
  }

  private updateSpeedLines(strength: number): void {
    this.speedLines.forEach((line, i) => {
      const active = strength > 0.48;
      line.setAlpha(active ? (0.06 + strength * 0.26) : 0);
      line.x = 1240 - ((performance.now() * (0.55 + strength) + i * 115) % 1380);
      line.y = 150 + ((i * 43) % 430);
    });
  }

  private flashSpeedLines(strength: number): void {
    this.speedLines.forEach(line => {
      line.setAlpha(0.45 * strength);
      this.tweens.add({ targets: line, alpha: 0, duration: 300, ease: 'Quad.Out' });
    });
  }

  private hitBoost(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.y > 200) return;
    this.player.setVelocityX(Math.max(body.velocity.x, 900));
    this.cameras.main.shake(130, 0.005);
    this.flashSpeedLines(1);
    this.showFeedback('BOOST!', '#22d3ee', 1.15);
  }

  private collectCoin(_player: unknown, coin: unknown): void {
    const coinObject = coin as Phaser.GameObjects.GameObject;
    const x = (coinObject as Phaser.GameObjects.Components.Transform).x;
    const y = (coinObject as Phaser.GameObjects.Components.Transform).y;
    coinObject.destroy();
    this.coinsCollected += 1;
    const pop = this.add.text(x, y - 20, '+1', { fontSize: '28px', fontStyle: 'bold', color: '#facc15', stroke: '#7c2d12', strokeThickness: 4 }).setOrigin(0.5);
    this.tweens.add({ targets: pop, y: y - 70, alpha: 0, duration: 500, onComplete: () => pop.destroy() });
  }

  private hitHazard(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.time.now < this.slideUntil || this.time.now < this.hazardInvulnerableUntil) return;
    this.hazardInvulnerableUntil = this.time.now + 700;
    this.player.setVelocityX(Math.max(90, body.velocity.x * 0.36));
    this.player.setVelocityY(-260);
    this.cameras.main.shake(220, 0.012);
    this.showFeedback('HIT!', '#ef4444', 1.15);
  }

  private resetAfterFall(): void {
    const safeX = Math.max(120, this.player.x - 420);
    this.cameras.main.fadeOut(110, 4, 20, 47);
    this.time.delayedCall(120, () => {
      this.player.setPosition(safeX, 460);
      this.player.setVelocity(0, 0);
      this.runInput.reset();
      this.cameras.main.fadeIn(180, 4, 20, 47);
      this.showFeedback('RETURN', '#f59e0b');
    });
  }

  private finishRace(): void {
    this.finished = true;
    const data: ResultData = { timeMs: this.time.now - this.startedAt, coins: this.coinsCollected };
    this.player.setVelocity(0, 0);
    this.cameras.main.flash(300, 255, 255, 255);
    this.time.delayedCall(420, () => this.scene.start('result', data));
  }

  private showFeedback(message: string, color: string, scale = 1): void {
    this.feedbackText.setText(message).setColor(color).setAlpha(1).setScale(0.65 * scale).setY(150);
    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.add({
      targets: this.feedbackText,
      scale: 1 * scale,
      y: 132,
      alpha: 1,
      duration: 110,
      ease: 'Back.Out',
      onComplete: () => {
        this.tweens.add({ targets: this.feedbackText, alpha: 0, y: 118, duration: 420, delay: 220, ease: 'Quad.Out' });
      },
    });
  }
}
