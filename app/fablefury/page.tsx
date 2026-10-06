"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Phaser?: any;
    __fableFuryGame?: any;
  }
}

export default function FableFuryPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !mountRef.current || !window.Phaser) return;
    const Phaser = window.Phaser;

    window.__fableFuryGame?.destroy(true);

    class TrapScene extends Phaser.Scene {
      player: any;
      art: any;
      chaser: any;
      sawLarge: any;
      sawSmall: any;
      cursors: any;
      keys: any;
      healthText: any;
      messageText: any;
      chaseText: any;
      timerText: any;
      threatOverlay: any;

      worldW = 3400;
      worldH = 720;
      sx = this.worldW / 2048;
      sy = this.worldH / 682;

      health = 100;
      invulnerable = false;
      won = false;
      isHit = false;
      jumpsUsed = 0;
      doubleJumpUntil = 0;
      animClock = 0;
      runFrame = 0;
      idleFrame = 0;
      chaseStart = 0;
      runStartedAt = 0;
      finalTime = 0;
      lastThreatShake = 0;
      lastGroundedAt = -9999;
      jumpBufferUntil = -9999;
      wasGrounded = false;
      lastVy = 0;

      runKeys = ["harryRun1", "harryRun2", "harryRun3", "harryRun4"];
      idleKeys = ["harryIdle1", "harryIdle2"];

      constructor() {
        super("TrapScene");
      }

      wx(n: number) {
        return n * this.sx;
      }

      wy(n: number) {
        return n * this.sy;
      }

      tex(key: string, w: number, h: number, draw: (g: any) => void) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        draw(g);
        g.generateTexture(key, w, h);
        g.destroy();
      }

      preload() {
        this.load.image("dungeon", "/fablefury/environment/trap-dungeon.png");

        [
          ["harryIdle1", "idle-01"],
          ["harryIdle2", "idle-02"],
          ["harryRun1", "run-01"],
          ["harryRun2", "run-02"],
          ["harryRun3", "run-03"],
          ["harryRun4", "run-04"],
          ["harryJump", "jump"],
          ["harryDouble", "double%20jump"],
          ["harryHit", "hit-01"],
        ].forEach(([k, f]) =>
          this.load.image(k, `/fablefury/characters/harry/${f}.png`)
        );

        [
          ["platformStart", "start-platform"],
          ["platformCenter", "center-platform"],
          ["platformHangingSmall", "hanging-platform-small"],
          ["platformHangingLarge", "hanging-platform-large"],
          ["platformTrapBridge", "trap-bridge"],
          ["platformRight", "right-platform"],
        ].forEach(([k, f]) =>
          this.load.image(k, `/fablefury/platforms/${f}.png`)
        );

        [
          ["spikesLeftArt", "spikes-left"],
          ["spikesMiddleArt", "spikes-middle"],
          ["sawLargeArt", "saw-large"],
          ["sawSmallArt", "saw-small"],
        ].forEach(([k, f]) =>
          this.load.image(k, `/fablefury/hazards/${f}.png`)
        );

        this.tex("body", 42, 66, (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillRect(0, 0, 42, 66);
        });

        this.tex("solid", 2, 2, (g) => {
          g.fillStyle(0xffffff, 0.01);
          g.fillRect(0, 0, 2, 2);
        });

        this.tex("infernoWall", 270, 720, (g) => {
          g.fillStyle(0xff2d13, 0.18);
          g.fillRect(0, 0, 270, 720);
          for (let y = 20; y < 720; y += 72) {
            const wobble = ((y / 72) % 2) * 18;
            g.fillStyle(0xff3a16, 0.72);
            g.fillCircle(128 + wobble, y, 118);
            g.fillStyle(0xff6a1f, 0.9);
            g.fillCircle(162 - wobble * 0.35, y + 8, 88);
            g.fillStyle(0xffad24, 0.96);
            g.fillCircle(194, y + 4, 55);
            g.fillStyle(0xfff2a0, 0.92);
            g.fillCircle(220, y, 27);
          }
          g.fillStyle(0xff8a1f, 0.82);
          for (let y = 0; y < 720; y += 90) {
            g.fillTriangle(170, y + 8, 265, y + 34, 182, y + 67);
          }
        });
      }

      resizeArt(key: string) {
        if (!this.art) return;
        const h = key === "harryDouble" ? 104 : 118;
        this.art.setScale(h / (this.art.height || this.art.frame?.realHeight || 1));
      }

      setArt(key: string) {
        if (!this.art) return;
        if (this.art.texture.key !== key) this.art.setTexture(key);
        this.resizeArt(key);
      }

      piece(key: string, x: number, y: number, w: number, h: number, depth = 5) {
        const p = this.add
          .image(this.wx(x), this.wy(y), key)
          .setOrigin(0, 0)
          .setDepth(depth);
        p.setDisplaySize(this.wx(w), this.wy(h));
        return p;
      }

      box(group: any, x: number, y: number, w: number, h: number) {
        const b = group.create(this.wx(x + w / 2), this.wy(y + h / 2), "solid");
        b.setDisplaySize(this.wx(w), this.wy(h));
        b.setVisible(false);
        b.refreshBody();
        return b;
      }

      platformCue(x: number, y: number, w: number) {
        const glow = this.add
          .rectangle(this.wx(x + w / 2), this.wy(y), this.wx(w), 10, 0xffbd55, 0.16)
          .setDepth(13)
          .setBlendMode(Phaser.BlendModes.ADD);
        const lip = this.add
          .rectangle(this.wx(x + w / 2), this.wy(y), this.wx(w), 3, 0xffe2a3, 0.72)
          .setDepth(14)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: [glow, lip],
          alpha: { from: 0.38, to: 0.9 },
          duration: 760,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      dangerRect(x: number, y: number, w: number, h: number, strong = true) {
        const fill = this.add
          .rectangle(
            this.wx(x + w / 2),
            this.wy(y + h / 2),
            this.wx(w),
            this.wy(h),
            0xff351c,
            strong ? 0.12 : 0.07
          )
          .setDepth(15)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setStrokeStyle(strong ? 5 : 3, 0xff6a2b, 0.95);
        const inner = this.add
          .rectangle(
            this.wx(x + w / 2),
            this.wy(y + h / 2),
            Math.max(4, this.wx(w) - 10),
            Math.max(4, this.wy(h) - 10)
          )
          .setDepth(16)
          .setStrokeStyle(2, 0xffd15a, strong ? 0.8 : 0.6)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: [fill, inner],
          alpha: { from: strong ? 0.58 : 0.42, to: 1 },
          duration: strong ? 340 : 470,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      dangerLine(x: number, y: number, w: number) {
        const halo = this.add
          .rectangle(this.wx(x + w / 2), this.wy(y), this.wx(w), 15, 0xff3b17, 0.16)
          .setDepth(15)
          .setBlendMode(Phaser.BlendModes.ADD);
        const line = this.add
          .rectangle(this.wx(x + w / 2), this.wy(y), this.wx(w), 4, 0xffb13b, 0.95)
          .setDepth(16)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: [halo, line],
          alpha: { from: 0.48, to: 1 },
          duration: 360,
          yoyo: true,
          repeat: -1,
        });
      }

      sawCue(cx: number, cy: number, rx: number, ry: number) {
        const outer = this.add
          .ellipse(
            this.wx(cx),
            this.wy(cy),
            this.wx(rx * 2.15),
            this.wy(ry * 2.15),
            0xff3f18,
            0.1
          )
          .setDepth(15)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setStrokeStyle(4, 0xff6a24, 0.95);
        const inner = this.add
          .ellipse(
            this.wx(cx),
            this.wy(cy),
            this.wx(rx * 1.9),
            this.wy(ry * 1.9)
          )
          .setDepth(16)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setStrokeStyle(2, 0xffd15a, 0.75);
        this.tweens.add({
          targets: [outer, inner],
          scale: { from: 0.96, to: 1.04 },
          alpha: { from: 0.48, to: 1 },
          duration: 320,
          yoyo: true,
          repeat: -1,
        });
        return [outer, inner];
      }

      burst(x: number, y: number, color: number, count = 8, spread = 70) {
        for (let i = 0; i < count; i++) {
          const angle = Phaser.Math.FloatBetween(Math.PI * 1.05, Math.PI * 1.95);
          const distance = Phaser.Math.Between(Math.floor(spread * 0.45), spread);
          const dot = this.add
            .circle(x, y, Phaser.Math.Between(2, 5), color, 0.95)
            .setDepth(70)
            .setBlendMode(Phaser.BlendModes.ADD);
          this.tweens.add({
            targets: dot,
            x: x + Math.cos(angle) * distance,
            y: y + Math.sin(angle) * distance * 0.45,
            alpha: 0,
            scale: 0.25,
            duration: Phaser.Math.Between(180, 330),
            ease: "Quad.easeOut",
            onComplete: () => dot.destroy(),
          });
        }
      }

      landingBurst() {
        const y = this.player.body.bottom + 1;
        for (let i = 0; i < 7; i++) {
          const direction = i < 3 ? -1 : 1;
          const puff = this.add
            .circle(
              this.player.x + Phaser.Math.Between(-12, 12),
              y,
              Phaser.Math.Between(2, 5),
              0xffd7a4,
              0.52
            )
            .setDepth(45);
          this.tweens.add({
            targets: puff,
            x: puff.x + direction * Phaser.Math.Between(18, 52),
            y: puff.y - Phaser.Math.Between(4, 18),
            alpha: 0,
            scale: 1.8,
            duration: 230,
            ease: "Quad.easeOut",
            onComplete: () => puff.destroy(),
          });
        }
      }

      formatTime(ms: number) {
        const total = Math.max(0, ms) / 1000;
        const minutes = Math.floor(total / 60);
        const seconds = total - minutes * 60;
        return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
      }

      create() {
        Object.assign(this, {
          health: 100,
          invulnerable: false,
          won: false,
          isHit: false,
          jumpsUsed: 0,
          doubleJumpUntil: 0,
          animClock: 0,
          runFrame: 0,
          idleFrame: 0,
          chaseStart: this.time.now + 950,
          runStartedAt: this.time.now,
          finalTime: 0,
          lastThreatShake: 0,
          lastGroundedAt: this.time.now,
          jumpBufferUntil: -9999,
          wasGrounded: false,
          lastVy: 0,
        });

        this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
        this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
        this.cameras.main.setBackgroundColor("#100c14");

        const bg = this.add.image(0, 0, "dungeon").setOrigin(0, 0).setDepth(-100);
        bg.setDisplaySize(this.worldW, this.worldH);
        this.add
          .rectangle(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, 0x08060b, 0.22)
          .setDepth(-80);

        const pieces: any[] = [
          ["platformStart", 0, 300, 675, 120, 6],
          ["platformCenter", 805, 345, 230, 100, 6],
          ["platformHangingSmall", 995, 220, 180, 95, 7],
          ["platformHangingLarge", 1205, 235, 230, 130, 7],
          ["platformTrapBridge", 1115, 405, 290, 110, 7],
          ["platformRight", 1380, 320, 668, 115, 6],
        ];
        pieces.forEach(([k, x, y, w, h, d]) => this.piece(k, x, y, w, h, d));

        const spikesLeft = this.piece("spikesLeftArt", 500, 420, 350, 100, 12);
        const spikesMiddle = this.piece("spikesMiddleArt", 990, 425, 145, 95, 12);

        const platformDefs = [
          [0, 327, 660],
          [820, 370, 195],
          [1005, 244, 150],
          [1215, 260, 200],
          [1130, 430, 255],
          [1390, 346, 658],
        ];
        platformDefs.forEach(([x, y, w]) => this.platformCue(x, y, w));

        // What glows is what hurts.
        this.dangerRect(510, 448, 325, 42);
        this.dangerRect(998, 448, 126, 42);
        this.dangerLine(480, 500, 1568);
        this.dangerRect(1570, 305, 90, 45);
        this.dangerRect(1660, 95, 42, 255);

        const spikesLeftGlow = this.piece("spikesLeftArt", 500, 420, 350, 100, 11)
          .setTint(0xff5b2b)
          .setAlpha(0.42)
          .setBlendMode(Phaser.BlendModes.ADD);
        const spikesMiddleGlow = this.piece("spikesMiddleArt", 990, 425, 145, 95, 11)
          .setTint(0xff5b2b)
          .setAlpha(0.42)
          .setBlendMode(Phaser.BlendModes.ADD);

        this.tweens.add({
          targets: [spikesLeft, spikesMiddle, spikesLeftGlow, spikesMiddleGlow],
          alpha: { from: 0.58, to: 1 },
          duration: 300,
          yoyo: true,
          repeat: -1,
        });

        const platforms = this.physics.add.staticGroup();
        platformDefs.forEach(([x, y, w]) =>
          this.box(platforms, x, y, w, y === 327 || y === 346 ? 22 : 18)
        );

        this.player = this.physics.add.sprite(this.wx(220), this.wy(288), "body");
        this.player
          .setAlpha(0.001)
          .setCollideWorldBounds(true)
          .setMaxVelocity(340, 900)
          .setDragX(2100);
        this.physics.add.collider(this.player, platforms);

        this.art = this.add
          .image(this.player.x, this.player.y, "harryIdle1")
          .setOrigin(0.5, 1)
          .setDepth(50);
        this.resizeArt("harryIdle1");

        // The saws are now real moving hazards, and their warning rings travel with them.
        const largeX = this.wx(630);
        const largeY = this.wy(206);
        this.sawLarge = this.physics.add
          .image(largeX, largeY, "sawLargeArt")
          .setDepth(18)
          .setDisplaySize(this.wx(190), this.wy(200))
          .setImmovable(true);
        this.sawLarge.body.allowGravity = false;
        this.sawLarge.body.setSize(130, 132, true);

        const smallX = this.wx(855);
        const smallY = this.wy(238);
        this.sawSmall = this.physics.add
          .image(smallX, smallY, "sawSmallArt")
          .setDepth(18)
          .setDisplaySize(this.wx(130), this.wy(145))
          .setImmovable(true);
        this.sawSmall.body.allowGravity = false;
        this.sawSmall.body.setSize(90, 92, true);

        const largeCue = this.sawCue(630, 206, 72, 76);
        const smallCue = this.sawCue(855, 238, 49, 53);

        this.tweens.add({
          targets: this.sawLarge,
          angle: 360,
          duration: 560,
          repeat: -1,
          ease: "Linear",
        });
        this.tweens.add({
          targets: this.sawSmall,
          angle: -360,
          duration: 430,
          repeat: -1,
          ease: "Linear",
        });
        this.tweens.add({
          targets: [this.sawLarge, ...largeCue],
          y: this.wy(260),
          duration: 930,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        this.tweens.add({
          targets: [this.sawSmall, ...smallCue],
          x: this.wx(918),
          duration: 760,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        const hazards = this.physics.add.staticGroup();
        [
          [510, 448, 325, 42],
          [998, 448, 126, 42],
          [480, 505, 1568, 155],
          [1570, 305, 90, 45],
          [1660, 95, 42, 255],
        ].forEach(([x, y, w, h]) => this.box(hazards, x, y, w, h));

        this.chaser = this.physics.add
          .image(this.wx(14), this.worldH / 2, "infernoWall")
          .setDepth(44);
        this.chaser.body.allowGravity = false;
        this.chaser.setImmovable(true);
        this.chaser.setDisplaySize(245, this.worldH + 80);
        this.chaser.body.setSize(115, 700).setOffset(150, 10);
        this.chaser.setAlpha(0.88).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: this.chaser,
          alpha: { from: 0.72, to: 1 },
          scaleX: { from: this.chaser.scaleX * 0.96, to: this.chaser.scaleX * 1.04 },
          duration: 190,
          yoyo: true,
          repeat: -1,
        });

        const finish = this.physics.add.staticImage(this.wx(2015), this.wy(330), "solid");
        finish.setDisplaySize(this.wx(42), this.wy(330));
        finish.setVisible(false);
        finish.refreshBody();

        // A visible escape marker makes the end of the chase obvious at speed.
        const exitGlow = this.add
          .rectangle(this.wx(1994), this.wy(315), 18, this.wy(275), 0xffd66b, 0.2)
          .setDepth(20)
          .setBlendMode(Phaser.BlendModes.ADD);
        const exitLine = this.add
          .rectangle(this.wx(1994), this.wy(315), 4, this.wy(250), 0xfff0a8, 0.95)
          .setDepth(21)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: [exitGlow, exitLine],
          alpha: { from: 0.35, to: 1 },
          scaleX: { from: 0.8, to: 1.35 },
          duration: 420,
          yoyo: true,
          repeat: -1,
        });

        this.physics.add.overlap(this.player, hazards, () => this.damage(24));
        this.physics.add.overlap(this.player, this.sawLarge, () => this.damage(28));
        this.physics.add.overlap(this.player, this.sawSmall, () => this.damage(24));
        this.physics.add.overlap(this.player, this.chaser, () => this.caught());
        this.physics.add.overlap(this.player, finish, () => this.win());

        this.cameras.main.setZoom(1.55);
        this.cameras.main.startFollow(this.player, true, 0.16, 0.13, -105, 18);
        this.cameras.main.setDeadzone(96, 64);

        this.cursors = this.input.keyboard?.createCursorKeys();
        this.keys = this.input.keyboard?.addKeys("W,A,D,SPACE,R");

        this.threatOverlay = this.add
          .rectangle(0, 0, 1280, 720, 0xff2a10, 0)
          .setOrigin(0)
          .setScrollFactor(0)
          .setDepth(900)
          .setBlendMode(Phaser.BlendModes.ADD);

        this.healthText = this.add
          .text(24, 20, "Health 100", {
            fontSize: "22px",
            color: "#fff",
            fontStyle: "bold",
            backgroundColor: "rgba(0,0,0,.45)",
            padding: { x: 9, y: 5 },
          })
          .setScrollFactor(0)
          .setDepth(1000)
          .setScale(0.82);

        this.timerText = this.add
          .text(1256, 20, "TIME 0:00.00", {
            fontSize: "22px",
            color: "#fff3c4",
            fontStyle: "bold",
            backgroundColor: "rgba(0,0,0,.45)",
            padding: { x: 9, y: 5 },
          })
          .setOrigin(1, 0)
          .setScrollFactor(0)
          .setDepth(1000)
          .setScale(0.82);

        this.chaseText = this.add
          .text(640, 55, "RUN! THE INFERNO IS COMING!", {
            fontSize: "30px",
            color: "#ffcf4a",
            fontStyle: "bold",
            backgroundColor: "rgba(90,0,0,.62)",
            padding: { x: 15, y: 8 },
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(1000)
          .setScale(0.82);

        this.messageText = this.add
          .text(640, 100, "KEEP MOVING", {
            fontSize: "21px",
            color: "#fff",
            fontStyle: "bold",
            backgroundColor: "rgba(0,0,0,.28)",
            padding: { x: 10, y: 5 },
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(1000)
          .setScale(0.82);

        this.time.delayedCall(1700, () => {
          if (this.chaseText && this.health > 0) {
            this.chaseText.setText("DON'T LET IT CATCH YOU");
          }
        });
      }

      syncArt(time: number, delta: number) {
        this.art.setPosition(this.player.x, this.player.body.bottom + 2);
        const vx = this.player.body.velocity.x;
        const grounded = this.player.body.blocked.down || this.player.body.touching.down;
        this.art.setFlipX(vx < -5);

        if (this.isHit || this.health <= 0) return this.setArt("harryHit");
        if (time < this.doubleJumpUntil) return this.setArt("harryDouble");

        if (!grounded) {
          this.art.setAngle(0);
          return this.setArt("harryJump");
        }

        this.art.setAngle(0);
        this.animClock += delta;

        if (Math.abs(vx) > 18) {
          const frameMs = Phaser.Math.Clamp(112 - Math.abs(vx) * 0.14, 60, 98);
          if (this.animClock > frameMs) {
            this.animClock = 0;
            this.runFrame = (this.runFrame + 1) % 4;
          }
          this.setArt(this.runKeys[this.runFrame]);
        } else {
          if (this.animClock > 460) {
            this.animClock = 0;
            this.idleFrame = (this.idleFrame + 1) % 2;
          }
          this.setArt(this.idleKeys[this.idleFrame]);
        }
      }

      groundJump() {
        this.player.setVelocityY(-565);
        this.jumpsUsed = 1;
        this.jumpBufferUntil = -9999;
        this.setArt("harryJump");
        this.burst(this.player.x, this.player.body.bottom, 0xffd7a4, 5, 44);
      }

      doubleJump(time: number) {
        this.player.setVelocityY(-530);
        this.jumpsUsed = 2;
        this.jumpBufferUntil = -9999;
        this.doubleJumpUntil = time + 420;
        this.setArt("harryDouble");
        this.burst(this.player.x, this.player.y, 0x9dff85, 9, 62);
        this.tweens.killTweensOf(this.art);
        this.art.setAngle(0);
        this.tweens.add({
          targets: this.art,
          angle: 360,
          duration: 380,
          ease: "Cubic.easeOut",
          onComplete: () => this.art?.setAngle(0),
        });
      }

      damage(amount: number) {
        if (this.invulnerable || this.health <= 0 || this.won) return;

        this.invulnerable = true;
        this.isHit = true;
        this.health = Math.max(0, this.health - amount);
        this.healthText.setText(`Health ${this.health}`);
        this.setArt("harryHit");
        this.art.setTint(0xffb0b0);
        this.burst(this.player.x, this.player.body.center.y, 0xff6a2b, 12, 90);
        this.cameras.main.shake(145, 0.008);
        this.cameras.main.flash(65, 255, 80, 35);

        // Tiny freeze on impact gives every hit weight without making the chase feel sluggish.
        this.physics.world.pause();
        this.time.delayedCall(55, () => {
          this.physics.world.resume();
          if (this.health > 0) this.player.setVelocity(-205, -265);
        });

        this.time.delayedCall(430, () => {
          if (this.health > 0) {
            this.art.clearTint();
            this.isHit = false;
            this.invulnerable = false;
          }
        });

        if (this.health <= 0) {
          this.art.setTint(0x777777);
          this.messageText.setText("DEFEATED — PRESS R");
          this.chaser?.setVelocityX(0);
          this.physics.world.resume();
        }
      }

      caught() {
        if (this.health <= 0 || this.won) return;
        this.health = 0;
        this.isHit = true;
        this.healthText.setText("Health 0");
        this.setArt("harryHit");
        this.art.setTint(0xff704d);
        this.burst(this.player.x, this.player.y, 0xff8b24, 20, 125);
        this.player.setVelocity(120, -300);
        this.chaser.setVelocityX(0);
        this.cameras.main.shake(360, 0.014);
        this.cameras.main.flash(140, 255, 80, 20);
        this.chaseText.setText("BURNED!");
        this.messageText.setText("THE INFERNO GOT YOU — PRESS R");
      }

      win() {
        if (this.won) return;
        this.won = true;
        this.finalTime = this.time.now - this.runStartedAt;
        this.player.setVelocity(0, 0);
        this.player.setAccelerationX(0);
        this.chaser?.setVelocityX(0);
        this.burst(this.player.x, this.player.y - 30, 0xffe58a, 22, 130);
        this.cameras.main.flash(120, 255, 225, 140);
        this.chaseText.setText("ESCAPED!");
        this.messageText.setText(`CLEAR!  ${this.formatTime(this.finalTime)} — PRESS R TO REPLAY`);
      }

      update(time: number, delta: number) {
        if (!this.player || !this.art || !this.keys || !this.cursors) return;

        // Tweened Arcade bodies need to be synced so the visible moving saw is the thing that hurts.
        this.sawLarge?.body?.updateFromGameObject?.();
        this.sawSmall?.body?.updateFromGameObject?.();

        this.syncArt(time, delta);

        const shownTime = this.won ? this.finalTime : time - this.runStartedAt;
        if (this.timerText) this.timerText.setText(`TIME ${this.formatTime(shownTime)}`);

        if (
          (this.health <= 0 || this.won) &&
          Phaser.Input.Keyboard.JustDown(this.keys.R)
        ) {
          this.scene.restart();
          return;
        }
        if (this.health <= 0 || this.won) return;

        const grounded = this.player.body.blocked.down || this.player.body.touching.down;
        if (grounded) {
          this.lastGroundedAt = time;
          if (!this.wasGrounded) {
            if (this.lastVy > 260) {
              this.landingBurst();
              this.cameras.main.shake(65, 0.0018);
            }
            this.jumpsUsed = 0;
          }
        }

        const left = this.cursors.left.isDown || this.keys.A.isDown;
        const right = this.cursors.right.isDown || this.keys.D.isDown;
        const direction = (right ? 1 : 0) - (left ? 1 : 0);

        // Acceleration and air control replace the old instant on/off movement.
        const accel = grounded ? 2350 : 1450;
        this.player.setAccelerationX(direction * accel);
        this.player.setDragX(grounded ? 2200 : 320);

        const jumpPressed =
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.keys.W) ||
          Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
        const jumpHeld =
          this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;

        if (jumpPressed) this.jumpBufferUntil = time + 135;

        const coyote = time - this.lastGroundedAt <= 110;
        if (this.jumpBufferUntil >= time) {
          if (grounded || (coyote && this.jumpsUsed === 0)) {
            this.groundJump();
          } else if (!grounded && !coyote && this.jumpsUsed < 2) {
            if (this.jumpsUsed === 0) this.jumpsUsed = 1;
            this.doubleJump(time);
          }
        }

        // Releasing early gives a shorter hop; holding gives the full jump.
        if (!jumpHeld && this.player.body.velocity.y < -255) {
          this.player.setVelocityY(-255);
        }

        this.wasGrounded = grounded;
        this.lastVy = this.player.body.velocity.y;

        if (time >= this.chaseStart && this.chaser) {
          const age = time - this.chaseStart;
          const progress = Phaser.Math.Clamp(this.player.x / this.worldW, 0, 1);
          const speed = Math.min(292, 184 + age / 150 + progress * 34);
          this.chaser.setVelocityX(speed);

          const gap = this.player.x - this.chaser.x;
          const danger = Phaser.Math.Clamp((310 - gap) / 260, 0, 1);
          if (this.threatOverlay) this.threatOverlay.setAlpha(danger * 0.11);

          if (gap < 285 && time - this.lastThreatShake > 240) {
            this.lastThreatShake = time;
            this.cameras.main.shake(90, gap < 175 ? 0.007 : 0.0028);
          }

          if (gap < 220 && this.chaseText) {
            this.chaseText.setText("MOVE! MOVE! MOVE!");
          } else if (gap > 390 && this.chaseText && age > 1800) {
            this.chaseText.setText("DON'T LET IT CATCH YOU");
          }
        }
      }
    }

    window.__fableFuryGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mountRef.current,
      width: 1280,
      height: 720,
      backgroundColor: "#100c14",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 1200 }, debug: false },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [TrapScene],
    });

    return () => {
      window.__fableFuryGame?.destroy(true);
      window.__fableFuryGame = undefined;
    };
  }, [ready]);

  return (
    <main className="min-h-screen bg-[#09070c] px-4 py-8 text-white sm:px-8">
      <Script
        src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
        onReady={() => setReady(true)}
      />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-300">
            Playable prototype
          </p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Fable Fury: Trap Corridor
          </h1>
          <p className="mt-3 max-w-3xl text-zinc-300">
            Chase build: momentum movement, buffered jumps, coyote time, moving traps,
            impact effects, escalating inferno pressure, and a run timer.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black p-2 shadow-2xl">
          <div ref={mountRef} className="aspect-video w-full overflow-hidden rounded-xl bg-black" />
        </div>
        <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            Movement now has <b className="text-white">momentum and air control</b>.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            Jump with <b className="text-white">Space / W / ↑</b>; press again to spin-double-jump.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            Gold = safe. Red/orange = danger. <b className="text-white">Beat your time.</b>
          </div>
        </div>
      </div>
    </main>
  );
}
