import Phaser from 'phaser';
import { RunInput } from '../systems/RunInput';
import { loadUiAssets } from '../utils/loadUiAssets';

import type { RaceResult } from '../systems/RaceRecord';

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
  private guide!: Phaser.GameObjects.Text;
  private guideUntil = 0;
  private keyH!: Phaser.Input.Keyboard.Key;
  private wasGrounded = false;
  private respawning = false;
  private boostReadyAt = 0;
  private dashUntil = 0;
  private dustAt = 0;
  private trailAt = 0;
  private steps = 0;
  private perfect = 0;
  private maxCombo = 0;
  private misses = 0;
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
    this.speedLines = [];
    this.wasGrounded = false;
    this.respawning = false;
    this.steps = this.perfect = this.maxCombo = this.misses = 0;
    this.boostReadyAt = this.dashUntil = this.dustAt = this.trailAt = 0;
    this.runFrame = 0;
    this.guideUntil = this.time.now + 3000;
    document.querySelector('#game')?.setAttribute('data-scene', 'game');
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

    const atlas = this.textures.get('runner-atlas');
    const source = atlas.getSourceImage() as HTMLImageElement;
    const w = source.width / 3, h = source.height / 2;
    ['rayn-run-1', 'rayn-run-2', 'rayn-jump', 'rayn-slide', 'rayn-dash', 'rayn-goal'].forEach((key, i) => {
      const canvas = this.textures.createCanvas(key, 256, 256)!;
      // Preserve proportions and align each pose's soles to the collider baseline.
      const probe = document.createElement('canvas'); probe.width = Math.ceil(w); probe.height = Math.ceil(h);
      const ctx = probe.getContext('2d')!;
      ctx.drawImage(source, (i % 3) * w, Math.floor(i / 3) * h, w, h, 0, 0, w, h);
      const pixels = ctx.getImageData(0, 0, probe.width, probe.height).data;
      let left = probe.width, top = probe.height, right = 0, bottom = 0;
      for (let y = 0; y < probe.height; y++) for (let x = 0; x < probe.width; x++) {
        if (pixels[(y * probe.width + x) * 4 + 3] > 40) {
          left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
        }
      }
      const bw = right - left + 1, bh = bottom - top + 1;
      const ratio = Math.min(220 / bw, (i === 3 ? 118 : 210) / bh);
      canvas.context.drawImage(probe, left, top, bw, bh, (256 - bw * ratio) / 2, 230 - bh * ratio, bw * ratio, bh * ratio);
      canvas.refresh();
    });
  }

  private createBackground(): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0xd9f6ff, 0xd9f6ff, 0xf8fcff, 0xf8fcff, 1);
    sky.fillRect(0, 0, this.worldWidth, 720);
    this.add.circle(1060, 155, 58, 0xfef08a).setScrollFactor(0.08);
    for (let x = 50; x < this.worldWidth; x += 420) {
      this.add.ellipse(x, 170 + x % 73, 135, 38, 0xffffff, 0.8).setScrollFactor(0.12);
    }
    for (let x = 0, i = 0; x < this.worldWidth; x += 175, i++) {
      const h = 150 + (i * 71) % 200;
      this.add.rectangle(x, 570, 132, h, 0xb7cddd, 0.6).setOrigin(0.5, 1).setScrollFactor(0.25);
      this.add.rectangle(x + 12, 570 - h - 10, 8, 35, 0xb7cddd, 0.6).setScrollFactor(0.25);
      for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
        this.add.rectangle(x - 36 + col * 34, 560 - row * 43, 18, 24, 0xffffff, 0.45).setScrollFactor(0.25);
      }
    }
    for (let x = 80, i = 0; x < this.worldWidth; x += 285, i++) {
      const h = 90 + (i * 53) % 130;
      this.add.rectangle(x, 710, 210, h + 100, 0x88b1c6, 0.35).setOrigin(0.5, 1).setScrollFactor(0.55);
      this.add.rectangle(x + 55, 610 - h + 35, 12, 52, 0x67e8f9, 0.5).setScrollFactor(0.55);
    }
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

    // Overhead gates make sliding useful; spikes must still be jumped.
    [1250, 4200, 6600].forEach(x => {
      const gate = this.add.rectangle(x, 493, 130, 100, 0xf97316).setStrokeStyle(3, 0xffffff);
      this.physics.add.existing(gate, true);
      this.hazards.add(gate);
      this.add.text(x, 426, 'S ↓', { fontSize: '24px', color: '#9a3412', fontStyle: 'bold' }).setOrigin(0.5);
    });
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
      body.setCircle(coin.width * 0.35);
      this.tweens.add({ targets: coin, y: y - 12, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.coins.add(coin);
    });

    this.add.image(this.worldWidth - 320, 360, 'ui-goal-sign').setDisplaySize(310, 207);
  }

  private addPlatform(x: number, y: number, width: number, height: number): void {
    const platform = this.add.rectangle(x + width / 2, y, width, height, 0x263c55);
    platform.setStrokeStyle(2, 0x163049);
    this.add.rectangle(x + width / 2, y - height / 2 + 4, width, 8, 0x67e8f9);
    if (height <= 30) {
      this.add.text(x + width / 2, y - 48, 'W ↑ 上ルート', {
        fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#0e7490',
      }).setOrigin(0.5);
      if (y >= 500) this.add.text(x + width / 2, this.floorY - 55, 'S ↓ 下ルート', {
        fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#0e7490',
      }).setOrigin(0.5);
    }
    if (height > 30) {
      this.add.rectangle(x + width / 2, y + 92, width, 150, 0x263c55);
      for (let dx = 35; dx < width; dx += 110) {
        this.add.rectangle(x + dx, y + 60, 32, 42, 0x456079).setStrokeStyle(2, 0x193049);
      }
    }
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
  }

  private addBoost(x: number, y: number): void {
    const pad = this.add.rectangle(x, y, 150, 24, 0x22d3ee).setStrokeStyle(3, 0x164e63);
    this.physics.add.existing(pad, true);
    this.boosts.add(pad);
    const label = this.add.text(x, y - 2, '» » »', { fontSize: '24px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    this.tweens.add({ targets: label, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
  }

  private addHazard(x: number, y: number): void {
    const hazard = this.add.triangle(x, y, 0, 38, 35, 0, 70, 38, 0xef4444).setStrokeStyle(4, 0x991b1b);
    this.add.text(x, y - 58, 'W ↑', { fontSize: '18px', fontStyle: 'bold', color: '#b91c1c' }).setOrigin(0.5);
    this.physics.add.existing(hazard, true);
    this.hazards.add(hazard);
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(160, 470, 'rayn-run-1').setDisplaySize(144, 144).setDepth(10);
    this.player.setCollideWorldBounds(false);
    this.player.setMaxVelocity(980, 1500);
    this.player.setDragX(300);
    this.player.body?.setSize(86, 170).setOffset(85,  60);
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
      this.add.rectangle(x, 48, w, 62, 0xffffff, 0.58).setScrollFactor(0).setDepth(20).setStrokeStyle(2, 0xffffff, 0.16);

    panel(116, 178); panel(302, 150); panel(470, 150); panel(1140, 150);
    this.add.rectangle(785, 48, 430, 40, 0xffffff, 0.46).setScrollFactor(0).setDepth(20).setStrokeStyle(2, 0xffffff, 0.16);
    this.progressBar = this.add.rectangle(575, 54, 0, 12, 0x22d3ee, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(21);

    const mkLabel = (x: number, text: string) =>
      this.add.text(x, 29, text, { fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#155e75' }).setOrigin(0.5).setScrollFactor(0).setDepth(22);
    const mkValue = (x: number, text: string, size = 24) =>
      this.add.text(x, 53, text, { fontFamily: 'system-ui, sans-serif', fontSize: `${size}px`, fontStyle: 'bold', color: '#163049', stroke: '#ffffff', strokeThickness: 2 }).setOrigin(0.5).setScrollFactor(0).setDepth(22);

    mkLabel(116, 'TIME'); this.timerText = mkValue(116, '0.00');
    mkLabel(302, 'SPEED'); this.speedText = mkValue(302, '0');
    mkLabel(470, 'COMBO'); this.comboText = mkValue(470, '0');
    mkLabel(785, 'GOAL');
    mkLabel(1140, 'COIN'); this.coinText = mkValue(1140, '0');
    this.add.image(1093, 48, 'ui-coin').setDisplaySize(32, 32).setScrollFactor(0).setDepth(22);

    this.feedbackText = this.add.text(640, 142, '', {
      fontFamily: 'system-ui, sans-serif', fontSize: '44px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#082f74', strokeThickness: 9,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(25);

    this.guide = this.add.text(640, 668, 'A ⇄ D 走る　 W ジャンプ　 S スライド　 SPACE ダッシュ　 H ヘルプ', {
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
    this.keyH = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time: number): void {
    if (this.finished || this.respawning) return;
    if (Phaser.Input.Keyboard.JustDown(this.keyH)) this.guideUntil = time + 3000;
    this.guide.setAlpha(Phaser.Math.Clamp((this.guideUntil - time) / 300, 0, 1));
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (Phaser.Input.Keyboard.JustDown(this.keyA)) this.handleStep('A', time);
    if (Phaser.Input.Keyboard.JustDown(this.keyD)) this.handleStep('D', time);

    if (Phaser.Input.Keyboard.JustDown(this.keyW) && body.blocked.down) {
      this.player.setVelocityY(-650);
      this.player.setTexture('rayn-jump');
      this.cameras.main.shake(90, 0.0025);
      this.showFeedback('JUMP!', '#38bdf8');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyS) && body.blocked.down) {
      this.slideUntil = time + 520;
      body.setSize(170, 68).setOffset(43, 162);
      this.player.setTexture('rayn-slide');
      this.showFeedback('SLIDE!', '#a78bfa');
    }

    if (time > this.slideUntil && this.player.texture.key === 'rayn-slide') {
      body.setSize(86, 170).setOffset(85, 60);
      this.player.setTexture('rayn-run-1');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keySpace) && time >= this.skillReadyAt) {
      this.player.setVelocityX(Math.max(body.velocity.x, 860));
      this.skillReadyAt = time + 4000;
      this.dashUntil = time + 420;
      this.cameras.main.shake(150, 0.006);
      this.flashSpeedLines(1);
      this.showFeedback('DASH!', '#f97316', 1.18);
    }

    const grounded = body.blocked.down || body.touching.down;
    if (grounded && !this.wasGrounded) this.burst(this.player.x, body.bottom, 0xffffff, 10);
    this.wasGrounded = grounded;
    if (time > this.slideUntil) {
      const pose = time < this.hazardInvulnerableUntil ? 'rayn-jump' : time < this.dashUntil ? 'rayn-dash' : !grounded ? 'rayn-jump' : this.runFrame ? 'rayn-run-2' : 'rayn-run-1';
      this.player.setTexture(pose).setTint(time < this.hazardInvulnerableUntil ? 0xff9999 : 0xffffff);
    }
    if (grounded && body.velocity.x > 80 && time > this.dustAt) {
      this.burst(this.player.x - 28, body.bottom, 0xe0f2fe, 2);
      this.dustAt = time + 130;
    }
    if (body.velocity.x > 650 && time > this.trailAt) {
      const ghost = this.add.image(this.player.x, this.player.y, this.player.texture.key).setDisplaySize(144, 144).setTint(0x22d3ee).setAlpha(0.25).setDepth(9);
      this.tweens.add({ targets: ghost, alpha: 0, x: ghost.x - 35, duration: 220, onComplete: () => ghost.destroy() });
      this.trailAt = time + 85;
    }

    const speedRatio = Phaser.Math.Clamp(body.velocity.x / 900, 0, 1);
    this.updateSpeedLines(speedRatio);


    if (this.player.y > 690) this.resetAfterFall();
    if (this.player.x >= this.worldWidth - 520) {
      this.finishRace();
      return;
    }

    this.timerText.setText(((time - this.startedAt) / 1000).toFixed(2));
    this.speedText.setText(String(Math.max(0, Math.round(body.velocity.x))));
    this.comboText.setText(String(this.runInput.getCombo()));
    this.coinText.setText(`${this.coinsCollected}/15`);
    this.progressBar.setSize(420 * Phaser.Math.Clamp((this.player.x - 160) / (this.worldWidth - 680), 0, 1), 12);
  }

  private handleStep(key: 'A' | 'D', time: number): void {
    const result = this.runInput.step(key, time);
    this.steps++;
    if (result.timing === 'perfect') this.perfect++;
    if (!result.valid) this.misses++;
    this.maxCombo = Math.max(this.maxCombo, this.runInput.getCombo());
    this.runFrame = key === 'A' ? 0 : 1;
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
    if (this.time.now < this.boostReadyAt) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.y > 200) return;
    this.boostReadyAt = this.time.now + 700;
    this.dashUntil = this.time.now + 420;
    this.burst(this.player.x, this.player.y + 45, 0x22d3ee, 16);
    this.player.setVelocityX(Math.max(body.velocity.x, 900));
    this.cameras.main.shake(130, 0.005);
    this.flashSpeedLines(1);
    this.showFeedback('BOOST!', '#22d3ee', 1.15);
  }

  private collectCoin(_player: unknown, coin: unknown): void {
    const coinObject = coin as Phaser.Physics.Arcade.Image;
    const x = coinObject.x;
    const y = coinObject.y;
    this.tweens.killTweensOf(coinObject);
    this.burst(x, y, 0xfacc15, 10);
    coinObject.destroy();
    this.coinsCollected += 1;
    const pop = this.add.text(x, y - 20, '+1', { fontSize: '28px', fontStyle: 'bold', color: '#facc15', stroke: '#7c2d12', strokeThickness: 4 }).setOrigin(0.5);
    this.tweens.add({ targets: pop, y: y - 70, alpha: 0, duration: 500, onComplete: () => pop.destroy() });
  }

  private hitHazard(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.time.now < this.hazardInvulnerableUntil) return;
    this.misses++;
    this.runInput.breakCombo();
    this.hazardInvulnerableUntil = this.time.now + 700;
    this.player.setVelocityX(Math.max(90, body.velocity.x * 0.36));
    this.player.setVelocityY(-260);
    this.cameras.main.shake(220, 0.012);
    this.showFeedback('HIT!', '#ef4444', 1.15);
  }

  private resetAfterFall(): void {
    this.respawning = true;
    this.misses++;
    const desiredX = Math.max(160, this.player.x - 420);
    const sections = [[0, 1550], [1680, 2700], [2860, 3760], [3900, 5500], [5650, 7600]];
    const section = sections.filter(([start]) => start < desiredX).at(-1)!;
    const safeX = Phaser.Math.Clamp(desiredX, section[0] + 80, section[1] - 80);
    this.cameras.main.fadeOut(110, 4, 20, 47);
    this.time.delayedCall(120, () => {
      this.player.setPosition(safeX, 460);
      this.player.setVelocity(0, 0);
      this.runInput.breakCombo();
      this.respawning = false;
      this.cameras.main.fadeIn(180, 4, 20, 47);
      this.showFeedback('RETURN', '#f59e0b');
    });
  }

  private finishRace(): void {
    this.finished = true;
    const data: RaceResult = { timeMs: this.time.now - this.startedAt, coins: this.coinsCollected, perfect: this.perfect, steps: this.steps, maxCombo: this.maxCombo, misses: this.misses };
    this.player.setVelocity(0, 0);
    (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.player.setTexture('rayn-goal').clearTint();
    this.showFeedback('GOAL!', '#facc15', 1.3);
    this.burst(this.player.x, this.player.y, 0xfacc15, 32);
    this.time.delayedCall(800, () => this.scene.start('result', data));
  }

  private burst(x: number, y: number, color: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.add.circle(x, y, Phaser.Math.Between(2, 5), color).setDepth(12);
      this.tweens.add({ targets: p, x: x + Phaser.Math.Between(-75, 75), y: y - Phaser.Math.Between(12, 80), alpha: 0, scale: 0.2, duration: 400, onComplete: () => p.destroy() });
    }
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
