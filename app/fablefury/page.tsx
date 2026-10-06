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

    class BridgeRunScene extends Phaser.Scene {
      player: any;
      art: any;
      chaser: any;
      goblin: any;
      cursors: any;
      keys: any;
      healthText: any;
      timerText: any;
      dashText: any;
      messageText: any;
      chaseText: any;
      actionText: any;
      threatOverlay: any;

      worldW = 5600;
      worldH = 720;
      bridgeY = 520;

      health = 100;
      won = false;
      invulnerable = false;
      isHit = false;
      isSliding = false;

      jumpsUsed = 0;
      doubleJumpUntil = 0;
      slideStartedAt = 0;
      dashUntil = 0;
      dashReadyAt = 0;
      facing = 1;

      animClock = 0;
      runFrame = 0;
      idleFrame = 0;
      lastAfterimage = 0;

      runStartedAt = 0;
      finalTime = 0;
      chaseStart = 0;
      lastGroundedAt = 0;
      jumpBufferUntil = -9999;
      wasGrounded = false;
      lastVy = 0;
      lastThreatShake = 0;

      firedTriggers = new Set<number>();

      runKeys = ["harryRun1", "harryRun2", "harryRun3", "harryRun4"];
      idleKeys = ["harryIdle1", "harryIdle2"];

      constructor() {
        super("BridgeRunScene");
      }

      makeTexture(key: string, w: number, h: number, draw: (g: any) => void) {
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

        this.makeTexture("body", 42, 66, (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillRect(0, 0, 42, 66);
        });

        this.makeTexture("solid", 2, 2, (g) => {
          g.fillStyle(0xffffff, 0.01);
          g.fillRect(0, 0, 2, 2);
        });

        this.makeTexture("bridgeTile", 240, 96, (g) => {
          g.fillStyle(0x2d2528, 1);
          g.fillRect(0, 0, 240, 96);
          g.fillStyle(0x57454a, 1);
          g.fillRect(0, 0, 240, 14);
          g.fillStyle(0x80656b, 0.9);
          g.fillRect(0, 0, 240, 4);
          g.lineStyle(2, 0x3b3034, 0.9);
          for (let x = 0; x < 240; x += 60) g.strokeRect(x, 14, 60, 40);
          for (let x = 30; x < 240; x += 60) g.strokeRect(x, 54, 60, 40);
        });

        this.makeTexture("spikeBlock", 112, 74, (g) => {
          g.fillStyle(0x4a3030, 1);
          g.fillRoundedRect(0, 54, 112, 20, 5);
          g.fillStyle(0xe7d6c4, 1);
          for (let x = 4; x < 104; x += 20) {
            g.beginPath();
            g.moveTo(x, 55);
            g.lineTo(x + 10, 4);
            g.lineTo(x + 20, 55);
            g.closePath();
            g.fillPath();
          }
          g.lineStyle(3, 0xff5a2a, 1);
          g.strokeRoundedRect(0, 54, 112, 20, 5);
        });

        this.makeTexture("stoneBarrier", 92, 82, (g) => {
          g.fillStyle(0x44393e, 1);
          g.fillRoundedRect(4, 10, 84, 72, 9);
          g.lineStyle(4, 0x9b7f76, 1);
          g.strokeRoundedRect(4, 10, 84, 72, 9);
          g.lineStyle(2, 0x2a2226, 0.9);
          g.lineBetween(10, 36, 84, 36);
          g.lineBetween(18, 59, 78, 59);
        });

        this.makeTexture("highShot", 104, 34, (g) => {
          g.fillStyle(0xff4b21, 0.18);
          g.fillEllipse(50, 17, 100, 32);
          g.fillStyle(0xff8d2f, 0.45);
          g.fillEllipse(60, 17, 76, 23);
          g.fillStyle(0xffdf70, 1);
          g.fillRoundedRect(50, 11, 46, 12, 6);
          g.fillStyle(0xffffff, 0.95);
          g.fillCircle(92, 17, 6);
        });

        this.makeTexture("lowShot", 74, 44, (g) => {
          g.fillStyle(0xff351f, 0.18);
          g.fillCircle(39, 22, 22);
          g.fillStyle(0xff6b2d, 0.9);
          g.fillCircle(44, 22, 15);
          g.fillStyle(0xffd55f, 1);
          g.fillCircle(49, 22, 8);
          g.lineStyle(4, 0xffc85a, 0.9);
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            g.lineBetween(
              44 + Math.cos(a) * 16,
              22 + Math.sin(a) * 16,
              44 + Math.cos(a) * 24,
              22 + Math.sin(a) * 24
            );
          }
        });

        this.makeTexture("goblin", 180, 170, (g) => {
          g.fillStyle(0x19231a, 0.58);
          g.fillEllipse(90, 102, 130, 95);
          g.fillStyle(0x71a93c, 1);
          g.fillEllipse(82, 72, 96, 78);
          g.fillTriangle(30, 63, 4, 45, 37, 84);
          g.fillTriangle(134, 62, 171, 42, 131, 85);
          g.fillStyle(0x263020, 1);
          g.fillCircle(64, 68, 9);
          g.fillCircle(103, 68, 9);
          g.fillStyle(0xf8d45b, 1);
          g.fillCircle(66, 67, 4);
          g.fillCircle(105, 67, 4);
          g.fillStyle(0x512c24, 1);
          g.fillRect(112, 92, 58, 18);
          g.fillStyle(0x2f2421, 1);
          g.fillRect(148, 82, 23, 38);
          g.fillStyle(0xbb7332, 1);
          g.fillCircle(168, 101, 9);
          g.fillStyle(0x54312a, 1);
          g.fillTriangle(42, 44, 85, 8, 123, 48);
        });

        this.makeTexture("infernoWall", 270, 720, (g) => {
          g.fillStyle(0xff2d13, 0.15);
          g.fillRect(0, 0, 270, 720);
          for (let y = 12; y < 720; y += 72) {
            const wobble = ((y / 72) % 2) * 18;
            g.fillStyle(0xff3a16, 0.75);
            g.fillCircle(126 + wobble, y, 116);
            g.fillStyle(0xff6a1f, 0.92);
            g.fillCircle(160 - wobble * 0.35, y + 8, 86);
            g.fillStyle(0xffad24, 0.96);
            g.fillCircle(194, y + 4, 53);
            g.fillStyle(0xfff2a0, 0.9);
            g.fillCircle(220, y, 26);
          }
        });
      }

      resizeArt(key: string) {
        if (!this.art) return;
        const desired = key === "harryDouble" ? 104 : 118;
        const raw = this.art.height || this.art.frame?.realHeight || 1;
        this.art.setScale(desired / raw);
      }

      setArt(key: string) {
        if (!this.art) return;
        if (this.art.texture.key !== key) this.art.setTexture(key);
        this.resizeArt(key);
      }

      box(group: any, x: number, y: number, w: number, h: number) {
        const b = group.create(x + w / 2, y + h / 2, "solid");
        b.setDisplaySize(w, h);
        b.setVisible(false);
        b.refreshBody();
        return b;
      }

      bridgeSegment(group: any, x: number, width: number) {
        this.add
          .tileSprite(x, this.bridgeY, width, 96, "bridgeTile")
          .setOrigin(0, 0)
          .setDepth(6);

        const topGlow = this.add
          .rectangle(x + width / 2, this.bridgeY, width, 11, 0xffbd55, 0.15)
          .setDepth(13)
          .setBlendMode(Phaser.BlendModes.ADD);
        const topLine = this.add
          .rectangle(x + width / 2, this.bridgeY, width, 3, 0xffe2a3, 0.75)
          .setDepth(14)
          .setBlendMode(Phaser.BlendModes.ADD);

        this.tweens.add({
          targets: [topGlow, topLine],
          alpha: { from: 0.4, to: 0.9 },
          duration: 820,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.box(group, x, this.bridgeY, width, 28);
      }

      dangerGlow(x: number, y: number, w: number, h: number) {
        const outer = this.add
          .rectangle(x + w / 2, y + h / 2, w + 10, h + 10, 0xff3a18, 0.09)
          .setDepth(15)
          .setStrokeStyle(4, 0xff6b2a, 0.95)
          .setBlendMode(Phaser.BlendModes.ADD);
        const inner = this.add
          .rectangle(x + w / 2, y + h / 2, w, h)
          .setDepth(16)
          .setStrokeStyle(2, 0xffd15a, 0.9)
          .setBlendMode(Phaser.BlendModes.ADD);

        this.tweens.add({
          targets: [outer, inner],
          alpha: { from: 0.5, to: 1 },
          duration: 330,
          yoyo: true,
          repeat: -1,
        });
      }

      addStaticHazard(group: any, type: "spikes" | "barrier", x: number) {
        const key = type === "spikes" ? "spikeBlock" : "stoneBarrier";
        const w = type === "spikes" ? 112 : 92;
        const h = type === "spikes" ? 74 : 82;
        const y = this.bridgeY - h;

        const art = this.add.image(x, y, key).setOrigin(0, 0).setDepth(18);
        this.dangerGlow(x + 5, y + 5, w - 10, h - 6);
        this.box(group, x + 10, y + 8, w - 20, h - 8);

        this.tweens.add({
          targets: art,
          alpha: { from: 0.82, to: 1 },
          duration: 430,
          yoyo: true,
          repeat: -1,
        });
      }

      addGap(start: number, end: number) {
        const w = end - start;
        this.add
          .rectangle(start + w / 2, this.bridgeY + 78, w, 250, 0x070509, 0.98)
          .setDepth(4);
        const lava = this.add
          .rectangle(start + w / 2, 675, w, 90, 0xff4a16, 0.42)
          .setDepth(5)
          .setBlendMode(Phaser.BlendModes.ADD);
        const leftLip = this.add
          .rectangle(start, this.bridgeY, 8, 70, 0xffd15a, 0.8)
          .setDepth(16)
          .setBlendMode(Phaser.BlendModes.ADD);
        const rightLip = this.add
          .rectangle(end, this.bridgeY, 8, 70, 0xffd15a, 0.8)
          .setDepth(16)
          .setBlendMode(Phaser.BlendModes.ADD);

        this.tweens.add({
          targets: [lava, leftLip, rightLip],
          alpha: { from: 0.45, to: 0.95 },
          duration: 420,
          yoyo: true,
          repeat: -1,
        });

        const label = this.add
          .text(start + w / 2, this.bridgeY + 76, "DOUBLE JUMP", {
            fontSize: "18px",
            color: "#ffcf69",
            fontStyle: "bold",
            backgroundColor: "rgba(20,5,0,.7)",
            padding: { x: 8, y: 4 },
          })
          .setOrigin(0.5)
          .setDepth(20);
        this.tweens.add({
          targets: label,
          alpha: { from: 0.45, to: 1 },
          duration: 520,
          yoyo: true,
          repeat: -1,
        });
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
            scale: 0.2,
            duration: Phaser.Math.Between(180, 330),
            ease: "Quad.easeOut",
            onComplete: () => dot.destroy(),
          });
        }
      }

      formatTime(ms: number) {
        const total = Math.max(0, ms) / 1000;
        const minutes = Math.floor(total / 60);
        const seconds = total - minutes * 60;
        return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
      }

      telegraph(text: string, color: string) {
        if (!this.actionText) return;
        this.actionText.setText(text).setColor(color).setAlpha(1).setScale(1.12);
        this.tweens.killTweensOf(this.actionText);
        this.tweens.add({
          targets: this.actionText,
          alpha: 0,
          scale: 0.92,
          duration: 720,
          ease: "Cubic.easeOut",
        });
      }

      goblinRecoil() {
        if (!this.goblin) return;
        this.tweens.killTweensOf(this.goblin);
        this.goblin.setScale(0.78);
        this.tweens.add({
          targets: this.goblin,
          scaleX: 0.9,
          scaleY: 0.7,
          duration: 90,
          yoyo: true,
          ease: "Quad.easeOut",
        });

        const flash = this.add
          .circle(180, 315, 18, 0xffd45d, 0.9)
          .setScrollFactor(0)
          .setDepth(5)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 2.4,
          duration: 150,
          onComplete: () => flash.destroy(),
        });
      }

      spawnShot(kind: "slide" | "jump") {
        if (this.health <= 0 || this.won) return;

        this.goblinRecoil();

        const startX = this.cameras.main.worldView.x + 92;
        const y = kind === "slide" ? this.bridgeY - 64 : this.bridgeY - 22;
        const key = kind === "slide" ? "highShot" : "lowShot";
        const shot = this.physics.add.image(startX, y, key).setDepth(40);
        shot.body.allowGravity = false;
        shot.setVelocityX(kind === "slide" ? 690 : 620);

        if (kind === "slide") {
          shot.body.setSize(54, 22, true);
        } else {
          shot.body.setSize(34, 32, true);
          this.tweens.add({
            targets: shot,
            angle: 360,
            duration: 360,
            repeat: -1,
            ease: "Linear",
          });
        }

        const glow = this.add
          .ellipse(shot.x, shot.y, kind === "slide" ? 120 : 66, kind === "slide" ? 42 : 58, 0xff5b22, 0.16)
          .setDepth(38)
          .setBlendMode(Phaser.BlendModes.ADD);

        const follow = this.time.addEvent({
          delay: 16,
          loop: true,
          callback: () => {
            if (!shot.active) {
              follow.remove();
              glow.destroy();
              return;
            }
            glow.setPosition(shot.x, shot.y);
          },
        });

        this.physics.add.overlap(this.player, shot, () => {
          if (!shot.active) return;
          shot.destroy();
          glow.destroy();
          this.damage(kind === "slide" ? 28 : 24);
        });

        this.time.delayedCall(3200, () => {
          if (shot.active) shot.destroy();
          if (glow.active) glow.destroy();
        });
      }

      scheduleShot(kind: "slide" | "jump") {
        if (kind === "slide") {
          this.telegraph("SLIDE!", "#ffb14a");
        } else {
          this.telegraph("JUMP!", "#ffd966");
        }

        this.time.delayedCall(480, () => this.spawnShot(kind));
      }

      startSlide(time: number) {
        if (this.isSliding || this.health <= 0 || this.won) return;
        this.isSliding = true;
        this.slideStartedAt = time;
        this.player.body.setSize(42, 30);
        this.player.body.setOffset(0, 36);
        if (Math.abs(this.player.body.velocity.x) < 285) {
          this.player.setVelocityX(this.facing * 285);
        }
        this.burst(this.player.x - this.facing * 8, this.player.body.bottom, 0xd9c1a0, 6, 44);
      }

      stopSlide() {
        if (!this.isSliding) return;
        this.isSliding = false;
        this.player.body.setSize(42, 66);
        this.player.body.setOffset(0, 0);
        this.art.setAngle(0);
      }

      dash(time: number) {
        if (time < this.dashReadyAt || this.isSliding || this.health <= 0 || this.won) return;
        const grounded = this.player.body.blocked.down || this.player.body.touching.down;
        if (!grounded) return;

        this.dashUntil = time + 190;
        this.dashReadyAt = time + 1050;
        this.player.setAccelerationX(0);
        this.player.setDragX(0);
        this.player.setVelocityX(this.facing * 620);
        this.burst(this.player.x, this.player.body.bottom - 8, 0x92ff82, 10, 70);
        this.cameras.main.shake(70, 0.0015);
      }

      afterImage(time: number) {
        if (time - this.lastAfterimage < 45) return;
        this.lastAfterimage = time;
        const ghost = this.add
          .image(this.art.x, this.art.y, this.art.texture.key)
          .setOrigin(0.5, 1)
          .setDepth(45)
          .setFlipX(this.art.flipX)
          .setTint(0x85ff76)
          .setAlpha(0.28);
        ghost.setScale(this.art.scaleX, this.art.scaleY);
        ghost.setAngle(this.art.angle);
        this.tweens.add({
          targets: ghost,
          alpha: 0,
          x: ghost.x - this.facing * 34,
          duration: 220,
          ease: "Quad.easeOut",
          onComplete: () => ghost.destroy(),
        });
      }

      groundJump() {
        this.stopSlide();
        this.player.setVelocityY(-560);
        this.jumpsUsed = 1;
        this.jumpBufferUntil = -9999;
        this.setArt("harryJump");
        this.burst(this.player.x, this.player.body.bottom, 0xffd7a4, 5, 42);
      }

      doubleJump(time: number) {
        this.stopSlide();
        this.player.setVelocityY(-525);
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

      syncArt(time: number, delta: number) {
        this.art.setPosition(this.player.x, this.player.body.bottom + 2);
        const vx = this.player.body.velocity.x;
        const grounded = this.player.body.blocked.down || this.player.body.touching.down;

        if (Math.abs(vx) > 20) this.facing = vx > 0 ? 1 : -1;
        this.art.setFlipX(this.facing < 0);

        if (this.isHit || this.health <= 0) {
          this.setArt("harryHit");
          return;
        }

        if (this.isSliding) {
          this.setArt("harryRun2");
          this.art.setScale(this.art.scaleX * 1.18, this.art.scaleY * 0.58);
          this.art.setAngle(this.facing * 7);
          this.art.setPosition(this.player.x + this.facing * 8, this.player.body.bottom + 5);
          return;
        }

        if (time < this.doubleJumpUntil) {
          this.setArt("harryDouble");
          return;
        }

        if (!grounded) {
          this.art.setAngle(0);
          this.setArt("harryJump");
          return;
        }

        this.art.setAngle(0);
        this.animClock += delta;

        if (Math.abs(vx) > 18) {
          const frameMs = Phaser.Math.Clamp(108 - Math.abs(vx) * 0.12, 58, 95);
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

      damage(amount: number) {
        if (this.invulnerable || this.health <= 0 || this.won) return;
        this.stopSlide();
        this.invulnerable = true;
        this.isHit = true;
        this.health = Math.max(0, this.health - amount);
        this.healthText.setText(`Health ${this.health}`);
        this.setArt("harryHit");
        this.art.setTint(0xffb0b0);
        this.burst(this.player.x, this.player.body.center.y, 0xff6a2b, 12, 88);
        this.cameras.main.shake(150, 0.008);
        this.cameras.main.flash(70, 255, 80, 35);

        this.physics.world.pause();
        this.time.delayedCall(55, () => {
          this.physics.world.resume();
          if (this.health > 0) this.player.setVelocity(-170, -235);
        });

        this.time.delayedCall(430, () => {
          if (this.health > 0) {
            this.art.clearTint();
            this.isHit = false;
            this.invulnerable = false;
          }
        });

        if (this.health <= 0) this.defeat("DEFEATED");
      }

      defeat(reason: string) {
        if (this.health > 0) this.health = 0;
        this.stopSlide();
        this.healthText.setText("Health 0");
        this.isHit = true;
        this.setArt("harryHit");
        this.art.setTint(0x777777);
        this.player.setAccelerationX(0);
        this.player.setVelocity(0, 0);
        this.chaser?.setVelocityX(0);
        this.chaseText.setText(reason);
        this.messageText.setText(`${reason} — PRESS R`);
        this.physics.world.resume();
      }

      caught() {
        if (this.health <= 0 || this.won) return;
        this.burst(this.player.x, this.player.y, 0xff8b24, 20, 125);
        this.cameras.main.shake(360, 0.014);
        this.cameras.main.flash(140, 255, 80, 20);
        this.defeat("BURNED!");
      }

      win() {
        if (this.won) return;
        this.won = true;
        this.finalTime = this.time.now - this.runStartedAt;
        this.stopSlide();
        this.player.setVelocity(0, 0);
        this.player.setAccelerationX(0);
        this.chaser?.setVelocityX(0);
        this.burst(this.player.x, this.player.y - 30, 0xffe58a, 22, 130);
        this.cameras.main.flash(120, 255, 225, 140);
        this.chaseText.setText("ESCAPED!");
        this.messageText.setText(`CLEAR! ${this.formatTime(this.finalTime)} — PRESS R`);
      }

      create() {
        this.health = 100;
        this.won = false;
        this.invulnerable = false;
        this.isHit = false;
        this.isSliding = false;
        this.jumpsUsed = 0;
        this.doubleJumpUntil = 0;
        this.slideStartedAt = 0;
        this.dashUntil = 0;
        this.dashReadyAt = 0;
        this.facing = 1;
        this.animClock = 0;
        this.runFrame = 0;
        this.idleFrame = 0;
        this.lastAfterimage = 0;
        this.runStartedAt = this.time.now;
        this.finalTime = 0;
        this.chaseStart = this.time.now + 1000;
        this.lastGroundedAt = this.time.now;
        this.jumpBufferUntil = -9999;
        this.wasGrounded = false;
        this.lastVy = 0;
        this.lastThreatShake = 0;
        this.firedTriggers = new Set<number>();

        this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
        this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
        this.cameras.main.setBackgroundColor("#0b0810");

        // Repeat the dungeon painting as a subdued background plate.
        [0, 2048, 4096].forEach((x) => {
          const bg = this.add
            .image(x, 0, "dungeon")
            .setOrigin(0, 0)
            .setDepth(-100)
            .setAlpha(0.72);
          bg.setDisplaySize(2048, 720);
        });
        this.add
          .rectangle(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, 0x07060a, 0.37)
          .setDepth(-80);

        const platforms = this.physics.add.staticGroup();

        // One long bridge, interrupted only by the deliberate double-jump gap.
        this.bridgeSegment(platforms, 0, 3000);
        this.bridgeSegment(platforms, 3520, this.worldW - 3520);
        this.addGap(3000, 3520);

        // Static jump reads.
        const hazards = this.physics.add.staticGroup();
        this.addStaticHazard(hazards, "spikes", 900);
        this.addStaticHazard(hazards, "barrier", 2020);
        this.addStaticHazard(hazards, "spikes", 4200);
        this.addStaticHazard(hazards, "barrier", 4930);

        // Goblin gunner sits behind the action and telegraphs every projectile.
        this.goblin = this.add
          .image(118, 298, "goblin")
          .setScrollFactor(0)
          .setDepth(2)
          .setScale(0.78)
          .setAlpha(0.95);
        this.add
          .text(118, 205, "GOBLIN GUNNER", {
            fontSize: "14px",
            color: "#b8e876",
            fontStyle: "bold",
            backgroundColor: "rgba(0,0,0,.45)",
            padding: { x: 7, y: 4 },
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(3)
          .setAlpha(0.8);
        this.tweens.add({
          targets: this.goblin,
          y: 304,
          duration: 620,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.player = this.physics.add.sprite(250, this.bridgeY - 80, "body");
        this.player
          .setAlpha(0.001)
          .setMaxVelocity(390, 900)
          .setDragX(2100)
          .setCollideWorldBounds(false);
        this.physics.add.collider(this.player, platforms);

        this.art = this.add
          .image(this.player.x, this.player.y, "harryIdle1")
          .setOrigin(0.5, 1)
          .setDepth(50);
        this.resizeArt("harryIdle1");

        this.physics.add.overlap(this.player, hazards, () => this.damage(25));

        this.chaser = this.physics.add
          .image(20, this.worldH / 2, "infernoWall")
          .setDepth(44)
          .setAlpha(0.88)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.chaser.body.allowGravity = false;
        this.chaser.setImmovable(true);
        this.chaser.setDisplaySize(245, this.worldH + 80);
        this.chaser.body.setSize(115, 700).setOffset(150, 10);
        this.physics.add.overlap(this.player, this.chaser, () => this.caught());
        this.tweens.add({
          targets: this.chaser,
          alpha: { from: 0.72, to: 1 },
          scaleX: { from: this.chaser.scaleX * 0.96, to: this.chaser.scaleX * 1.04 },
          duration: 190,
          yoyo: true,
          repeat: -1,
        });

        const finish = this.physics.add.staticImage(this.worldW - 150, this.bridgeY - 120, "solid");
        finish.setDisplaySize(42, 260);
        finish.setVisible(false);
        finish.refreshBody();
        this.physics.add.overlap(this.player, finish, () => this.win());

        const exitGlow = this.add
          .rectangle(this.worldW - 170, this.bridgeY - 90, 20, 230, 0xffd66b, 0.2)
          .setDepth(20)
          .setBlendMode(Phaser.BlendModes.ADD);
        const exitLine = this.add
          .rectangle(this.worldW - 170, this.bridgeY - 90, 4, 215, 0xfff0a8, 0.95)
          .setDepth(21)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: [exitGlow, exitLine],
          alpha: { from: 0.35, to: 1 },
          scaleX: { from: 0.8, to: 1.4 },
          duration: 430,
          yoyo: true,
          repeat: -1,
        });

        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, true, 0.16, 0.12, -118, 16);
        this.cameras.main.setDeadzone(92, 62);

        this.cursors = this.input.keyboard?.createCursorKeys();
        this.keys = this.input.keyboard?.addKeys("W,A,D,S,SPACE,R,SHIFT,X");

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

        this.dashText = this.add
          .text(24, 62, "DASH READY", {
            fontSize: "16px",
            color: "#9dff8a",
            fontStyle: "bold",
            backgroundColor: "rgba(0,0,0,.42)",
            padding: { x: 8, y: 4 },
          })
          .setScrollFactor(0)
          .setDepth(1000)
          .setScale(0.82);

        this.chaseText = this.add
          .text(640, 48, "RUN THE BRIDGE!", {
            fontSize: "28px",
            color: "#ffcf4a",
            fontStyle: "bold",
            backgroundColor: "rgba(90,0,0,.55)",
            padding: { x: 14, y: 7 },
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(1000)
          .setScale(0.82);

        this.messageText = this.add
          .text(640, 90, "JUMP • DOUBLE JUMP • SLIDE • DASH", {
            fontSize: "18px",
            color: "#fff",
            fontStyle: "bold",
            backgroundColor: "rgba(0,0,0,.28)",
            padding: { x: 10, y: 5 },
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(1000)
          .setScale(0.82);

        this.actionText = this.add
          .text(850, 160, "", {
            fontSize: "42px",
            color: "#ffd966",
            fontStyle: "bold",
            stroke: "#260d05",
            strokeThickness: 7,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(1100)
          .setAlpha(0);

        this.time.delayedCall(1500, () => {
          if (this.health > 0) this.chaseText.setText("DON'T LET THE FIRE CATCH YOU");
        });
      }

      update(time: number, delta: number) {
        if (!this.player || !this.art || !this.keys || !this.cursors) return;

        this.syncArt(time, delta);

        const shownTime = this.won ? this.finalTime : time - this.runStartedAt;
        this.timerText?.setText(`TIME ${this.formatTime(shownTime)}`);

        if (
          (this.health <= 0 || this.won) &&
          Phaser.Input.Keyboard.JustDown(this.keys.R)
        ) {
          this.scene.restart();
          return;
        }
        if (this.health <= 0 || this.won) return;

        if (this.player.y > 700) {
          this.defeat("FELL!");
          return;
        }

        if (this.player.x < 24) {
          this.player.x = 24;
          if (this.player.body.velocity.x < 0) this.player.setVelocityX(0);
        }

        const grounded = this.player.body.blocked.down || this.player.body.touching.down;
        if (grounded) {
          this.lastGroundedAt = time;
          if (!this.wasGrounded) {
            this.jumpsUsed = 0;
            if (this.lastVy > 260) {
              this.burst(this.player.x, this.player.body.bottom, 0xd8c5ad, 6, 45);
              this.cameras.main.shake(55, 0.0015);
            }
          }
        }

        const left = this.cursors.left.isDown || this.keys.A.isDown;
        const right = this.cursors.right.isDown || this.keys.D.isDown;
        const direction = (right ? 1 : 0) - (left ? 1 : 0);

        const slideHeld = this.cursors.down.isDown || this.keys.S.isDown;
        const slidePressed =
          Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
          Phaser.Input.Keyboard.JustDown(this.keys.S);

        if (slidePressed && grounded && time >= this.dashUntil) this.startSlide(time);
        if (this.isSliding && (!slideHeld || !grounded || time - this.slideStartedAt > 900)) {
          this.stopSlide();
        }

        const dashPressed =
          Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) ||
          Phaser.Input.Keyboard.JustDown(this.keys.X);
        if (dashPressed) this.dash(time);

        if (time < this.dashUntil) {
          this.player.setAccelerationX(0);
          this.player.setDragX(0);
          this.player.setVelocityX(this.facing * 620);
          this.afterImage(time);
        } else if (this.isSliding) {
          this.player.setAccelerationX(direction * 700);
          this.player.setDragX(180);
          if (Math.abs(this.player.body.velocity.x) < 280) {
            this.player.setVelocityX(this.facing * 280);
          }
        } else {
          const accel = grounded ? 2250 : 1350;
          this.player.setAccelerationX(direction * accel);
          this.player.setDragX(grounded ? 2050 : 300);
        }

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

        if (!jumpHeld && this.player.body.velocity.y < -250) {
          this.player.setVelocityY(-250);
        }

        this.wasGrounded = grounded;
        this.lastVy = this.player.body.velocity.y;

        const dashRemaining = Math.max(0, this.dashReadyAt - time);
        this.dashText?.setText(
          dashRemaining <= 0 ? "DASH READY" : `DASH ${(dashRemaining / 1000).toFixed(1)}`
        );
        this.dashText?.setColor(dashRemaining <= 0 ? "#9dff8a" : "#b6b6b6");

        // Scripted goblin attacks. Every shot corresponds to one clear input read.
        const attackTriggers: Array<[number, "slide" | "jump"]> = [
          [1220, "slide"],
          [1650, "jump"],
          [2450, "slide"],
          [3850, "jump"],
          [4520, "slide"],
          [5150, "jump"],
        ];

        attackTriggers.forEach(([x, kind], index) => {
          if (this.player.x >= x && !this.firedTriggers.has(index)) {
            this.firedTriggers.add(index);
            this.scheduleShot(kind);
          }
        });

        if (time >= this.chaseStart && this.chaser) {
          const age = time - this.chaseStart;
          const progress = Phaser.Math.Clamp(this.player.x / this.worldW, 0, 1);
          const speed = Math.min(305, 190 + age / 170 + progress * 32);
          this.chaser.setVelocityX(speed);

          const gap = this.player.x - this.chaser.x;
          const danger = Phaser.Math.Clamp((320 - gap) / 270, 0, 1);
          this.threatOverlay?.setAlpha(danger * 0.11);

          if (gap < 285 && time - this.lastThreatShake > 240) {
            this.lastThreatShake = time;
            this.cameras.main.shake(90, gap < 175 ? 0.007 : 0.0028);
          }

          if (gap < 220) this.chaseText?.setText("MOVE! MOVE! MOVE!");
          else if (gap > 390 && age > 1800) this.chaseText?.setText("DON'T LET THE FIRE CATCH YOU");
        }
      }
    }

    window.__fableFuryGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mountRef.current,
      width: 1280,
      height: 720,
      backgroundColor: "#0b0810",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 1200 }, debug: false },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BridgeRunScene],
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
            Fable Fury: Bridge Run
          </h1>
          <p className="mt-3 max-w-3xl text-zinc-300">
            One long chase bridge built around three reads: jump, double jump, and slide —
            with a ground dash for recovering speed and a goblin gunner firing into the lane.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black p-2 shadow-2xl">
          <div ref={mountRef} className="aspect-video w-full overflow-hidden rounded-xl bg-black" />
        </div>

        <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <b className="text-white">A / D</b> or arrows to run.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <b className="text-white">Space / W / ↑</b> to jump; press again to double jump.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <b className="text-white">S / ↓</b> to slide under high shots.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <b className="text-white">Shift / X</b> to dash.
          </div>
        </div>
      </div>
    </main>
  );
}
