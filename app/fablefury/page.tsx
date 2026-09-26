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
      cursors: any;
      keys: any;
      healthText: any;
      messageText: any;
      health = 100;
      invulnerable = false;
      won = false;
      isHit = false;
      jumpsUsed = 0;
      doubleJumpUntil = 0;
      animClock = 0;
      runFrame = 0;
      idleFrame = 0;
      runKeys = ["harryRun1", "harryRun2", "harryRun3", "harryRun4"];
      idleKeys = ["harryIdle1", "harryIdle2"];

      constructor() {
        super("TrapScene");
      }

      makeTexture(key: string, w: number, h: number, draw: (g: any) => void) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        draw(g);
        g.generateTexture(key, w, h);
        g.destroy();
      }

      preload() {
        this.load.image("dungeon", "/fablefury/environment/trap-dungeon.png");
        this.load.image("harryIdle1", "/fablefury/characters/harry/idle-01.png");
        this.load.image("harryIdle2", "/fablefury/characters/harry/idle-02.png");
        this.load.image("harryRun1", "/fablefury/characters/harry/run-01.png");
        this.load.image("harryRun2", "/fablefury/characters/harry/run-02.png");
        this.load.image("harryRun3", "/fablefury/characters/harry/run-03.png");
        this.load.image("harryRun4", "/fablefury/characters/harry/run-04.png");
        this.load.image("harryJump", "/fablefury/characters/harry/jump.png");
        this.load.image("harryDouble", "/fablefury/characters/harry/double%20jump.png");
        this.load.image("harryHit", "/fablefury/characters/harry/hit-01.png");

        this.makeTexture("body", 42, 66, (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillRect(0, 0, 42, 66);
        });
        this.makeTexture("stone", 128, 38, (g) => {
          g.fillStyle(0x44352d, 0.9);
          g.fillRoundedRect(0, 4, 128, 30, 7);
          g.lineStyle(3, 0x8d715c, 0.85);
          g.strokeRoundedRect(0, 4, 128, 30, 7);
        });
        this.makeTexture("spikes", 72, 62, (g) => {
          g.fillStyle(0xd9d9d9, 1);
          [5, 27, 49].forEach((x) => {
            g.beginPath();
            g.moveTo(x, 56);
            g.lineTo(x + 9, 8);
            g.lineTo(x + 18, 56);
            g.closePath();
            g.fillPath();
          });
          g.fillStyle(0x4b4b4b, 1);
          g.fillRect(0, 56, 72, 6);
        });
        this.makeTexture("saw", 88, 88, (g) => {
          g.fillStyle(0xc5c5c5, 1);
          g.fillCircle(44, 44, 30);
          g.fillStyle(0x555555, 1);
          g.fillCircle(44, 44, 8);
        });
        this.makeTexture("fire", 86, 150, (g) => {
          g.fillStyle(0xff4d1f, 0.95);
          g.fillRoundedRect(0, 0, 86, 150, 20);
          g.fillStyle(0xffcf3f, 1);
          g.fillRoundedRect(12, 15, 62, 120, 18);
        });
        this.makeTexture("door", 78, 132, (g) => {
          g.fillStyle(0x4f2f1c, 1);
          g.fillRect(0, 0, 78, 132);
          g.fillStyle(0xc8914a, 1);
          g.fillRect(10, 10, 58, 112);
        });
      }

      resizeArt(key: string) {
        if (!this.art) return;
        const desiredHeight = key === "harryDouble" ? 118 : 138;
        const rawHeight = this.art.height || this.art.frame?.realHeight || 1;
        this.art.setScale(desiredHeight / rawHeight);
      }

      setArt(key: string) {
        if (!this.art) return;
        if (this.art.texture.key !== key) this.art.setTexture(key);
        this.resizeArt(key);
      }

      create() {
        this.health = 100;
        this.invulnerable = false;
        this.won = false;
        this.isHit = false;
        this.jumpsUsed = 0;
        this.doubleJumpUntil = 0;
        this.animClock = 0;
        this.runFrame = 0;
        this.idleFrame = 0;

        this.physics.world.setBounds(0, 0, 3400, 720);
        this.cameras.main.setBounds(0, 0, 3400, 720);
        this.cameras.main.setBackgroundColor("#100c14");

        const bg = this.add.image(0, 0, "dungeon").setOrigin(0, 0).setDepth(-100);
        bg.setDisplaySize(1900, 720);
        bg.setScrollFactor(0.2, 0);

        const platforms = this.physics.add.staticGroup();
        [100,228,356,484,612,900,1028,1156,1284,1510,1638,1766,1894,2022,2320,2448,2576,2704,2995,3123,3251]
          .forEach((x) => platforms.create(x, 628, "stone").setOrigin(0, 0).setAlpha(0.45).refreshBody());
        platforms.create(1390, 550, "stone").setOrigin(0, 0).setAlpha(0.45).refreshBody();
        platforms.create(1518, 490, "stone").setOrigin(0, 0).setAlpha(0.45).refreshBody();

        this.player = this.physics.add.sprite(135, 500, "body");
        this.player.setAlpha(0.001).setCollideWorldBounds(true);
        this.physics.add.collider(this.player, platforms);

        this.art = this.add.image(this.player.x, this.player.y, "harryIdle1").setOrigin(0.5, 1).setDepth(50);
        this.resizeArt("harryIdle1");

        const spikes = this.physics.add.staticGroup();
        [610, 682, 1815, 1887, 2515].forEach((x) => spikes.create(x, 590, "spikes").refreshBody());

        const saw = this.physics.add.image(1265, 300, "saw").setImmovable(true);
        saw.body.allowGravity = false;
        this.tweens.add({ targets: saw, y: 535, duration: 1250, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.tweens.add({ targets: saw, angle: 360, duration: 650, repeat: -1 });

        const flames: any[] = [];
        [2145, 2785].forEach((x, i) => {
          const flame = this.physics.add.image(x, 550, "fire").setImmovable(true).setVisible(false);
          flame.body.allowGravity = false;
          flame.setData("hot", false);
          flames.push(flame);
          this.time.addEvent({
            delay: 2500 + i * 700,
            loop: true,
            callback: () => {
              const warn = this.add.text(x, 390, "!", { fontSize: "56px", color: "#ffd166", fontStyle: "bold" }).setOrigin(0.5);
              this.tweens.add({ targets: warn, alpha: 0, duration: 650, onComplete: () => warn.destroy() });
              this.time.delayedCall(650, () => {
                flame.setData("hot", true).setVisible(true);
                this.time.delayedCall(1250, () => flame.setData("hot", false).setVisible(false));
              });
            },
          });
        });

        const door = this.physics.add.image(3290, 535, "door").setImmovable(true);
        door.body.allowGravity = false;

        this.physics.add.overlap(this.player, spikes, () => this.damage(18));
        this.physics.add.overlap(this.player, saw, () => this.damage(26));
        flames.forEach((f) => this.physics.add.overlap(this.player, f, () => f.getData("hot") && this.damage(22)));
        this.physics.add.overlap(this.player, door, () => this.win());

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -180, 40);
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.keys = this.input.keyboard?.addKeys("W,A,D,SPACE,R");

        this.healthText = this.add.text(24, 20, "Health 100", {
          fontSize: "26px", color: "#fff", fontStyle: "bold", backgroundColor: "rgba(0,0,0,.35)", padding: { x: 10, y: 6 },
        }).setScrollFactor(0).setDepth(1000);

        this.add.text(24, 66, "A / D or arrows = move   Space / W / up = jump + double jump", {
          fontSize: "18px", color: "#fff", backgroundColor: "rgba(0,0,0,.35)", padding: { x: 10, y: 6 },
        }).setScrollFactor(0).setDepth(1000);

        this.messageText = this.add.text(640, 120, "FABLE FURY — TRAP CORRIDOR", {
          fontSize: "30px", color: "#ffd166", fontStyle: "bold", backgroundColor: "rgba(0,0,0,.28)", padding: { x: 14, y: 8 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
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
        if (Math.abs(vx) > 10) {
          if (this.animClock > 95) {
            this.animClock = 0;
            this.runFrame = (this.runFrame + 1) % 4;
          }
          this.setArt(this.runKeys[this.runFrame]);
        } else {
          if (this.animClock > 520) {
            this.animClock = 0;
            this.idleFrame = (this.idleFrame + 1) % 2;
          }
          this.setArt(this.idleKeys[this.idleFrame]);
        }
      }

      doubleJump(time: number) {
        this.player.setVelocityY(-515);
        this.jumpsUsed = 2;
        this.doubleJumpUntil = time + 430;
        this.setArt("harryDouble");
        this.tweens.killTweensOf(this.art);
        this.art.setAngle(0);
        this.tweens.add({ targets: this.art, angle: 360, duration: 400, ease: "Cubic.easeOut", onComplete: () => this.art?.setAngle(0) });
      }

      damage(amount: number) {
        if (this.invulnerable || this.health <= 0 || this.won) return;
        this.invulnerable = true;
        this.isHit = true;
        this.health = Math.max(0, this.health - amount);
        this.healthText.setText(`Health ${this.health}`);
        this.setArt("harryHit");
        this.art.setTint(0xffb0b0);
        this.player.setVelocity(-250, -260);
        this.cameras.main.shake(160, 0.006);
        this.time.delayedCall(500, () => {
          if (this.health > 0) {
            this.art.clearTint();
            this.isHit = false;
            this.invulnerable = false;
          }
        });
        if (this.health <= 0) {
          this.art.setTint(0x777777);
          this.messageText.setText("DEFEATED — press R to restart");
        }
      }

      win() {
        if (this.won) return;
        this.won = true;
        this.player.setVelocity(0, 0);
        this.messageText.setText("VICTORY — press R to replay");
      }

      update(time: number, delta: number) {
        if (!this.player || !this.art || !this.keys || !this.cursors) return;
        this.syncArt(time, delta);

        if ((this.health <= 0 || this.won) && Phaser.Input.Keyboard.JustDown(this.keys.R)) {
          this.scene.restart();
          return;
        }
        if (this.health <= 0 || this.won) return;

        const left = this.cursors.left.isDown || this.keys.A.isDown;
        const right = this.cursors.right.isDown || this.keys.D.isDown;
        if (left) this.player.setVelocityX(-240);
        else if (right) this.player.setVelocityX(240);
        else this.player.setVelocityX(0);

        const grounded = this.player.body.blocked.down || this.player.body.touching.down;
        if (grounded) this.jumpsUsed = 0;

        const jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
        if (jump && grounded) {
          this.player.setVelocityY(-540);
          this.jumpsUsed = 1;
          this.setArt("harryJump");
        } else if (jump && this.jumpsUsed < 2) {
          this.doubleJump(time);
        }
      }
    }

    window.__fableFuryGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mountRef.current,
      width: 1280,
      height: 720,
      backgroundColor: "#100c14",
      physics: { default: "arcade", arcade: { gravity: { y: 1200 }, debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [TrapScene],
    });

    return () => {
      window.__fableFuryGame?.destroy(true);
      window.__fableFuryGame = undefined;
    };
  }, [ready]);

  return (
    <main className="min-h-screen bg-[#09070c] px-4 py-8 text-white sm:px-8">
      <Script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js" strategy="afterInteractive" onLoad={() => setReady(true)} onReady={() => setReady(true)} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-300">Playable prototype</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Fable Fury: Trap Corridor</h1>
          <p className="mt-3 max-w-3xl text-zinc-300">Harry Thistlewhip is playable with run animation, jump, spinning double jump, damage and restart states.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black p-2 shadow-2xl">
          <div ref={mountRef} className="aspect-video w-full overflow-hidden rounded-xl bg-black" />
        </div>
        <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">Move with <b className="text-white">A / D</b> or arrow keys.</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">Jump with <b className="text-white">Space / W / ↑</b>; press again in the air to double jump.</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">Press <b className="text-white">R</b> after defeat or victory to restart.</div>
        </div>
      </div>
    </main>
  );
}
