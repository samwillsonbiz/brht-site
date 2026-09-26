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
      cursors: any;
      keys: any;
      healthText: any;
      messageText: any;
      chaseText: any;

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
      lastThreatShake = 0;

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

        this.makeTexture("inferno", 230, 210, (g) => {
          g.fillStyle(0xff2d16, 0.38);
          g.fillCircle(120, 108, 100);
          g.fillStyle(0xff541f, 0.9);
          g.fillCircle(125, 108, 78);
          g.fillStyle(0xff9e1f, 1);
          g.fillCircle(136, 108, 58);
          g.fillStyle(0xfff08a, 1);
          g.fillCircle(148, 108, 34);
          g.fillStyle(0xff5a1f, 0.95);
          g.fillTriangle(70, 55, 2, 28, 58, 96);
          g.fillTriangle(67, 92, 0, 90, 62, 126);
          g.fillTriangle(75, 132, 10, 180, 76, 157);
          g.fillStyle(0xffc43d, 0.9);
          g.fillTriangle(96, 70, 28, 60, 88, 103);
          g.fillTriangle(92, 125, 24, 150, 92, 151);
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
        const desiredHeight = key === "harryDouble" ? 104 : 118;
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
        this.chaseStart = this.time.now + 900;
        this.lastThreatShake = 0;

        this.physics.world.setBounds(0, 0, 3400, 720);
        this.cameras.main.setBounds(0, 0, 3400, 720);
        this.cameras.main.setBackgroundColor("#100c14");

        const bg = this.add.image(0, 0, "dungeon").setOrigin(0, 0).setDepth(-100);
        bg.setDisplaySize(1900, 720);
        bg.setScrollFactor(0.2, 0);

        const platforms = this.physics.add.staticGroup();
        [100,228,356,484,612,900,1028,1156,1284,1510,1638,1766,1894,2022,2320,2448,2576,2704,2995,3123,3251]
          .forEach((x) => platforms.create(x, 628, "stone").setOrigin(0, 0).setAlpha(0.32).refreshBody());
        platforms.create(1390, 550, "stone").setOrigin(0, 0).setAlpha(0.32).refreshBody();
        platforms.create(1518, 490, "stone").setOrigin(0, 0).setAlpha(0.32).refreshBody();

        this.player = this.physics.add.sprite(260, 500, "body");
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
            delay: 2200 + i * 650,
            loop: true,
            callback: () => {
              const warn = this.add.text(x, 390, "!", { fontSize: "56px", color: "#ffd166", fontStyle: "bold" }).setOrigin(0.5);
              this.tweens.add({ targets: warn, alpha: 0, duration: 550, onComplete: () => warn.destroy() });
              this.time.delayedCall(550, () => {
                flame.setData("hot", true).setVisible(true);
                this.time.delayedCall(1050, () => flame.setData("hot", false).setVisible(false));
              });
            },
          });
        });

        this.chaser = this.physics.add.image(0, 515, "inferno").setDepth(45);
        this.chaser.body.allowGravity = false;
        this.chaser.setImmovable(true);
        this.chaser.setScale(0.86);
        this.chaser.body.setSize(135, 150, true);
        this.tweens.add({ targets: this.chaser, scaleX: 0.94, scaleY: 0.94, duration: 220, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.chaser, angle: 8, duration: 180, yoyo: true, repeat: -1 });

        const door = this.physics.add.image(3290, 535, "door").setImmovable(true);
        door.body.allowGravity = false;

        this.physics.add.overlap(this.player, spikes, () => this.damage(18));
        this.physics.add.overlap(this.player, saw, () => this.damage(26));
        flames.forEach((f) => this.physics.add.overlap(this.player, f, () => f.getData("hot") && this.damage(22)));
        this.physics.add.overlap(this.player, this.chaser, () => this.caught());
        this.physics.add.overlap(this.player, door, () => this.win());

        // Tight, action-oriented camera. Harry sits left of centre so you see just enough of what is coming.
        this.cameras.main.setZoom(1.55);
        this.cameras.main.startFollow(this.player, true, 0.14, 0.12, -95, 18);
        this.cameras.main.setDeadzone(110, 70);

        this.cursors = this.input.keyboard?.createCursorKeys();
        this.keys = this.input.keyboard?.addKeys("W,A,D,SPACE,R");

        this.healthText = this.add.text(24, 20, "Health 100", {
          fontSize: "22px", color: "#fff", fontStyle: "bold", backgroundColor: "rgba(0,0,0,.45)", padding: { x: 9, y: 5 },
        }).setScrollFactor(0).setDepth(1000).setScale(0.82);

        this.chaseText = this.add.text(640, 55, "RUN! THE INFERNO IS COMING!", {
          fontSize: "30px", color: "#ffcf4a", fontStyle: "bold", backgroundColor: "rgba(90,0,0,.62)", padding: { x: 15, y: 8 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setScale(0.82);

        this.messageText = this.add.text(640, 100, "KEEP MOVING", {
          fontSize: "21px", color: "#fff", fontStyle: "bold", backgroundColor: "rgba(0,0,0,.28)", padding: { x: 10, y: 5 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setScale(0.82);

        this.time.delayedCall(1700, () => {
          if (this.chaseText && this.health > 0) this.chaseText.setText("DON'T LET IT CATCH YOU");
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
        if (Math.abs(vx) > 10) {
          if (this.animClock > 82) {
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

      doubleJump(time: number) {
        this.player.setVelocityY(-530);
        this.jumpsUsed = 2;
        this.doubleJumpUntil = time + 420;
        this.setArt("harryDouble");
        this.tweens.killTweensOf(this.art);
        this.art.setAngle(0);
        this.tweens.add({ targets: this.art, angle: 360, duration: 380, ease: "Cubic.easeOut", onComplete: () => this.art?.setAngle(0) });
      }

      damage(amount: number) {
        if (this.invulnerable || this.health <= 0 || this.won) return;
        this.invulnerable = true;
        this.isHit = true;
        this.health = Math.max(0, this.health - amount);
        this.healthText.setText(`Health ${this.health}`);
        this.setArt("harryHit");
        this.art.setTint(0xffb0b0);
        this.player.setVelocity(-220, -250);
        this.cameras.main.shake(130, 0.006);
        this.time.delayedCall(420, () => {
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
        }
      }

      caught() {
        if (this.health <= 0 || this.won) return;
        this.health = 0;
        this.isHit = true;
        this.healthText.setText("Health 0");
        this.setArt("harryHit");
        this.art.setTint(0xff704d);
        this.player.setVelocity(120, -300);
        this.chaser.setVelocityX(0);
        this.cameras.main.shake(360, 0.012);
        this.chaseText.setText("BURNED!");
        this.messageText.setText("THE INFERNO GOT YOU — PRESS R");
      }

      win() {
        if (this.won) return;
        this.won = true;
        this.player.setVelocity(0, 0);
        this.chaser?.setVelocityX(0);
        this.chaseText.setText("ESCAPED!");
        this.messageText.setText("VICTORY — PRESS R TO REPLAY");
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
        if (left) this.player.setVelocityX(-285);
        else if (right) this.player.setVelocityX(305);
        else this.player.setVelocityX(0);

        const grounded = this.player.body.blocked.down || this.player.body.touching.down;
        if (grounded) this.jumpsUsed = 0;

        const jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
        if (jump && grounded) {
          this.player.setVelocityY(-555);
          this.jumpsUsed = 1;
          this.setArt("harryJump");
        } else if (jump && this.jumpsUsed < 2) {
          this.doubleJump(time);
        }

        if (time >= this.chaseStart && this.chaser) {
          const chaseAge = time - this.chaseStart;
          const speed = Math.min(252, 175 + chaseAge / 260);
          this.chaser.setVelocityX(speed);

          const gap = this.player.x - this.chaser.x;
          if (gap < 245 && time - this.lastThreatShake > 280) {
            this.lastThreatShake = time;
            this.cameras.main.shake(90, gap < 150 ? 0.005 : 0.0025);
          }
          if (gap < 200 && this.chaseText) this.chaseText.setText("MOVE! MOVE! MOVE!");
          else if (gap > 360 && this.chaseText && chaseAge > 1800) this.chaseText.setText("DON'T LET IT CATCH YOU");
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
          <p className="mt-3 max-w-3xl text-zinc-300">A tighter chase-camera version of the trap corridor. Keep moving, clear the hazards, and stay ahead of the inferno.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black p-2 shadow-2xl">
          <div ref={mountRef} className="aspect-video w-full overflow-hidden rounded-xl bg-black" />
        </div>
        <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">Move quickly with <b className="text-white">A / D</b> or arrow keys.</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">Jump with <b className="text-white">Space / W / ↑</b>; press again in the air to double jump.</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">The inferno never stops. Press <b className="text-white">R</b> after defeat or victory.</div>
        </div>
      </div>
    </main>
  );
}