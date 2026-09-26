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

    if (window.__fableFuryGame) {
      window.__fableFuryGame.destroy(true);
      window.__fableFuryGame = undefined;
    }

    class TrapScene extends Phaser.Scene {
      player: any;
      playerArt: any;
      cursors: any;
      keys: any;
      platforms: any;
      healthText: any;
      messageText: any;

      health = 100;
      invulnerable = false;
      won = false;
      isHit = false;
      jumpsUsed = 0;
      doubleJumpUntil = 0;
      animTimer = 0;
      runFrame = 0;
      idleFrame = 0;

      runTextures = ["harryRun1", "harryRun2", "harryRun3", "harryRun4"];
      idleTextures = ["harryIdle1", "harryIdle2"];

      constructor() {
        super("TrapScene");
      }

      makeTexture(key: string, width: number, height: number, draw: (g: any) => void) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        draw(g);
        g.generateTexture(key, width, height);
        g.destroy();
      }

      preload() {
        this.load.image("trapDungeon", "/fablefury/environment/trap-dungeon.png");

        this.load.image("harryIdle1", "/fablefury/characters/harry/idle-01.png");
        this.load.image("harryIdle2", "/fablefury/characters/harry/idle-02.png");
        this.load.image("harryRun1", "/fablefury/characters/harry/run-01.png");
        this.load.image("harryRun2", "/fablefury/characters/harry/run-02.png");
        this.load.image("harryRun3", "/fablefury/characters/harry/run-03.png");
        this.load.image("harryRun4", "/fablefury/characters/harry/run-04.png");
        this.load.image("harryJump", "/fablefury/characters/harry/jump.png");
        this.load.image("harryDoubleJump", "/fablefury/characters/harry/double%20jump.png");
        this.load.image("harryHit", "/fablefury/characters/harry/hit-01.png");

        this.makeTexture("heroPhysics", 48, 72, (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillRect(0, 0, 48, 72);
        });

        this.makeTexture("friend", 56, 70, (g) => {
          g.fillStyle(0xff9f66, 1);
          g.fillRoundedRect(8, 8, 40, 56, 12);
          g.lineStyle(4, 0x6b3415, 1);
          g.strokeRoundedRect(8, 8, 40, 56, 12);
        });

        this.makeTexture("stone", 128, 38, (g) => {
          g.fillStyle(0x44352d, 0.9);
          g.fillRoundedRect(0, 4, 128, 30, 7);
          g.lineStyle(3, 0x8d715c, 0.85);
          g.strokeRoundedRect(0, 4, 128, 30, 7);
          g.fillStyle(0x715948, 0.75);
          g.fillRect(10, 12, 28, 5);
          g.fillRect(48, 20, 34, 5);
          g.fillRect(91, 11, 25, 5);
        });

        this.makeTexture("spikes", 72, 62, (g) => {
          g.fillStyle(0xd6d6d6, 1);
          [6, 28, 50].forEach((x) => {
            g.beginPath();
            g.moveTo(x, 56);
            g.lineTo(x + 9, 8);
            g.lineTo(x + 18, 56);
            g.closePath();
            g.fillPath();
          });
          g.fillStyle(0x4f4f4f, 1);
          g.fillRect(0, 56, 72, 6);
        });

        this.makeTexture("saw", 88, 88, (g) => {
          g.fillStyle(0xbcbcbc, 1);
          g.fillCircle(44, 44, 28);
          g.lineStyle(7, 0xe7e7e7, 1);
          for (let i = 0; i < 12; i++) {
            const a = (Math.PI * 2 * i) / 12;
            const x1 = 44 + Math.cos(a) * 28;
            const y1 = 44 + Math.sin(a) * 28;
            const x2 = 44 + Math.cos(a + 0.12) * 39;
            const y2 = 44 + Math.sin(a + 0.12) * 39;
            g.beginPath();
            g.moveTo(44, 44);
            g.lineTo(x1, y1);
            g.lineTo(x2, y2);
            g.closePath();
            g.strokePath();
          }
          g.fillStyle(0x555555, 1);
          g.fillCircle(44, 44, 8);
        });

        this.makeTexture("fire", 86, 150, (g) => {
          g.fillStyle(0xff4d1f, 0.95);
          g.fillRoundedRect(0, 0, 86, 150, 20);
          g.fillStyle(0xffbe2e, 1);
          g.fillRoundedRect(10, 14, 66, 122, 18);
          g.fillStyle(0xfff0a6, 1);
          g.fillRoundedRect(24, 30, 38, 88, 14);
        });

        this.makeTexture("door", 78, 132, (g) => {
          g.fillStyle(0x4f2f1c, 1);
          g.fillRect(0, 0, 78, 132);
          g.fillStyle(0xc8914a, 1);
          g.fillRect(10, 10, 58, 112);
          g.fillStyle(0x4f2f1c, 1);
          g.fillCircle(57, 66, 5);
        });
      }

      create() {
        // Scene.restart() reuses the same Scene instance, so explicitly reset runtime state.
        this.health = 100;
        this.invulnerable = false;
        this.won = false;
        this.isHit = false;
        this.jumpsUsed = 0;
        this.doubleJumpUntil = 0;
        this.animTimer = 0;
        this.runFrame = 0;
        this.idleFrame = 0;

        this.input.keyboard?.resetKeys();

        this.physics.world.setBounds(0, 0, 3400, 720);
        this.cameras.main.setBounds(0, 0, 3400, 720);
        this.cameras.main.setBackgroundColor("#100c14");

        const dungeon = this.add.image(0, 0, "trapDungeon").setOrigin(0, 0);
        dungeon.setDisplaySize(1900, 720);
        dungeon.setScrollFactor(0.2, 0);
        dungeon.setDepth(-100);

        this.add
          .rectangle(640, 360, 1280, 720, 0x09060b, 0.12)
          .setScrollFactor(0)
          .setDepth(-90);

        this.platforms = this.physics.add.staticGroup();
        const ground = [
          100, 228, 356, 484, 612, 900, 1028, 1156, 1284, 1510, 1638, 1766, 1894,
          2022, 2320, 2448, 2576, 2704, 2995, 3123, 3251,
        ];
        ground.forEach((x) => {
          const p = this.platforms.create(x, 628, "stone");
          p.setOrigin(0, 0).setAlpha(0.5).refreshBody();
        });

        const step1 = this.platforms.create(1390, 550, "stone");
        step1.setOrigin(0, 0).setAlpha(0.5).refreshBody();
        const step2 = this.platforms.create(1518, 490, "stone");
        step2.setOrigin(0, 0).setAlpha(0.5).refreshBody();

        // Invisible physics body + separate Harry artwork keeps collision stable across differently-sized PNGs.
        this.player = this.physics.add.sprite(135, 500, "heroPhysics");
        this.player.setAlpha(0.001);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(40, 64).setOffset(4, 8);
        this.physics.add.collider(this.player, this.platforms);

        this.playerArt = this.add
          .image(this.player.x, this.player.y, "harryIdle1")
          .setOrigin(0.5, 1)
          .setDisplayHeight(170)
          .setDepth(50);

        const friends = this.physics.add.group();
        const friend1 = friends.create(65, 500, "friend");
        const friend2 = friends.create(5, 500, "friend").setTint(0x7ce9ff);
        [friend1, friend2].forEach((f: any) => {
          f.setCollideWorldBounds(true);
          f.body.setSize(38, 56).setOffset(9, 8);
          this.physics.add.collider(f, this.platforms);
        });

        this.time.addEvent({
          delay: 120,
          loop: true,
          callback: () => {
            [friend1, friend2].forEach((f: any, index: number) => {
              const target = this.player.x - 90 - index * 70;
              f.setVelocityX(Phaser.Math.Clamp((target - f.x) * 3, -180, 180));
              const jumpZones = [620, 1260, 1840, 2520];
              if (jumpZones.some((x) => Math.abs(f.x - x) < 24) && f.body.blocked.down) {
                f.setVelocityY(-500);
              }
            });
          },
        });

        const spikes = this.physics.add.staticGroup();
        [610, 682, 1815, 1887, 2515].forEach((x) => {
          const s = spikes.create(x, 590, "spikes");
          s.refreshBody();
        });

        const saw = this.physics.add.image(1265, 300, "saw");
        saw.body.allowGravity = false;
        saw.setImmovable(true);
        this.tweens.add({
          targets: saw,
          y: 535,
          duration: 1250,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        this.tweens.add({ targets: saw, angle: 360, duration: 650, repeat: -1 });

        const flames: any[] = [];
        [2145, 2785].forEach((x, index) => {
          const flame = this.physics.add.image(x, 550, "fire");
          flame.body.allowGravity = false;
          flame.setImmovable(true);
          flame.setVisible(false);
          flame.setData("hot", false);
          flames.push(flame);

          this.time.addEvent({
            delay: 2500 + index * 700,
            loop: true,
            callback: () => {
              const warning = this.add
                .text(x, 390, "!", {
                  fontFamily: "Arial, sans-serif",
                  fontSize: "56px",
                  color: "#ffd166",
                  fontStyle: "bold",
                })
                .setOrigin(0.5);
              this.tweens.add({
                targets: warning,
                alpha: 0,
                duration: 650,
                onComplete: () => warning.destroy(),
              });
              this.time.delayedCall(650, () => {
                flame.setData("hot", true);
                flame.setVisible(true);
                this.cameras.main.shake(120, 0.004);
                this.time.delayedCall(1250, () => {
                  flame.setData("hot", false);
                  flame.setVisible(false);
                });
              });
            },
          });
        });

        const door = this.physics.add.image(3290, 535, "door");
        door.body.allowGravity = false;
        door.setImmovable(true);

        this.physics.add.overlap(this.player, spikes, () => this.takeDamage(18));
        this.physics.add.overlap(this.player, saw, () => this.takeDamage(26));
        flames.forEach((flame) => {
          this.physics.add.overlap(this.player, flame, () => {
            if (flame.getData("hot")) this.takeDamage(22);
          });
        });
        this.physics.add.overlap(this.player, door, () => this.win());

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -180, 40);

        this.cursors = this.input.keyboard?.createCursorKeys();
        this.keys = this.input.keyboard?.addKeys("W,A,D,SPACE,R");

        this.healthText = this.add
          .text(24, 20, "Health 100", {
            fontFamily: "Arial, sans-serif",
            fontSize: "26px",
            color: "#ffffff",
            fontStyle: "bold",
            backgroundColor: "rgba(0,0,0,0.35)",
            padding: { x: 10, y: 6 },
          })
          .setScrollFactor(0)
          .setDepth(1000);

        this.add
          .text(24, 66, "A / D or arrows = move   Space / W / up = jump + double jump", {
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            color: "#ffffff",
            backgroundColor: "rgba(0,0,0,0.35)",
            padding: { x: 10, y: 6 },
          })
          .setScrollFactor(0)
          .setDepth(1000);

        this.add
          .text(24, 108, "Survive the trap corridor and reach the door.", {
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            color: "#ffd7a8",
            backgroundColor: "rgba(0,0,0,0.35)",
            padding: { x: 10, y: 6 },
          })
          .setScrollFactor(0)
          .setDepth(1000);

        this.messageText = this.add
          .text(640, 154, "FABLE FURY — TRAP CORRIDOR", {
            fontFamily: "Arial, sans-serif",
            fontSize: "31px",
            color: "#ffd166",
            fontStyle: "bold",
            backgroundColor: "rgba(0,0,0,0.28)",
            padding: { x: 14, y: 8 },
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(1000);
      }

      setHarryTexture(key: string) {
        if (!this.playerArt || this.playerArt.texture.key === key) return;
        this.playerArt.setTexture(key);
        this.playerArt.setDisplayHeight(key === "harryDoubleJump" ? 158 : 170);
      }

      syncHarryArt(time: number, delta: number) {
        if (!this.playerArt || !this.player) return;

        this.playerArt.setPosition(this.player.x, this.player.body.bottom + 2);

        if (this.isHit || this.health <= 0) {
          this.setHarryTexture("harryHit");
          return;
        }

        if (time < this.doubleJumpUntil) {
          this.setHarryTexture("harryDoubleJump");
          return;
        }

        const grounded = this.player.body.blocked.down || this.player.body.touching.down;
        const velocityX = this.player.body.velocity.x;

        if (!grounded) {
          this.setHarryTexture("harryJump");
          return;
        }

        this.playerArt.setAngle(0);
        this.playerArt.setFlipX(velocityX < -5);
        this.animTimer += delta;

        if (Math.abs(velocityX) > 10) {
          if (this.animTimer >= 95) {
            this.animTimer = 0;
            this.runFrame = (this.runFrame + 1) % this.runTextures.length;
          }
          this.setHarryTexture(this.runTextures[this.runFrame]);
        } else {
          if (this.animTimer >= 520) {
            this.animTimer = 0;
            this.idleFrame = (this.idleFrame + 1) % this.idleTextures.length;
          }
          this.setHarryTexture(this.idleTextures[this.idleFrame]);
        }
      }

      doDoubleJump(time: number) {
        this.player.setVelocityY(-515);
        this.jumpsUsed = 2;
        this.doubleJumpUntil = time + 430;
        this.setHarryTexture("harryDoubleJump");
        this.playerArt.setAngle(0);
        this.tweens.killTweensOf(this.playerArt);
        this.tweens.add({
          targets: this.playerArt,
          angle: 360,
          duration: 400,
          ease: "Cubic.easeOut",
          onComplete: () => this.playerArt?.setAngle(0),
        });
      }

      takeDamage(amount: number) {
        if (this.invulnerable || this.health <= 0 || this.won) return;
        this.invulnerable = true;
        this.isHit = true;
        this.health = Math.max(0, this.health - amount);
        this.healthText.setText(`Health ${this.health}`);
        this.setHarryTexture("harryHit");
        this.playerArt.setTint(0xffb0b0);
        this.player.setVelocity(-250, -260);
        this.cameras.main.shake(160, 0.006);

        this.time.delayedCall(500, () => {
          if (!this.playerArt) return;
          if (this.health > 0) {
            this.playerArt.clearTint();
            this.isHit = false;
            this.invulnerable = false;
          }
        });

        if (this.health <= 0) {
          this.messageText.setText("DEFEATED — press R to restart");
          this.playerArt.setTint(0x777777);
        }
      }

      win() {
        if (this.won) return;
        this.won = true;
        this.player.setVelocity(0, 0);
        this.messageText.setText("VICTORY — TRAP CORRIDOR CLEARED — press R to replay");
      }

      update(time: number, delta: number) {
        if (!this.player) return;

        this.syncHarryArt(time, delta);

        const restartPressed = Phaser.Input.Keyboard.JustDown(this.keys.R);
        if ((this.health <= 0 || this.won) && restartPressed) {
          this.scene.restart();
          return;
        }

        if (this.health <= 0 || this.won) return;

        const left = this.cursors.left.isDown || this.keys.A.isDown;
        const right = this.cursors.right.isDown || this.keys.D.isDown;
        const jumpPressed =
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.keys.W) ||
          Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

        if (left) this.player.setVelocityX(-240);
        else if (right) this.player.setVelocityX(240);
        else this.player.setVelocityX(0);

        const grounded = this.player.body.blocked.down || this.player.body.touching.down;
        if (grounded) this.jumpsUsed = 0;

        if (jumpPressed) {
          if (grounded) {
            this.player.setVelocityY(-540);
            this.jumpsUsed = 1;
            this.setHarryTexture("harryJump");
          } else if (this.jumpsUsed < 2) {
            this.doDoubleJump(time);
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
      if (window.__fableFuryGame) {
        window.__fableFuryGame.destroy(true);
        window.__fableFuryGame = undefined;
      }
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
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Fable Fury: Trap Corridor</h1>
          <p className="mt-3 max-w-3xl text-zinc-300">
            Harry Thistlewhip is now playable with animated movement, jumping, a spinning double jump, and a dedicated hit pose.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black p-2 shadow-2xl">
          <div ref={mountRef} className="aspect-video w-full overflow-hidden rounded-xl bg-black" />
        </div>

        <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            Move with <b className="text-white">A / D</b> or arrow keys.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            Jump with <b className="text-white">Space / W / ↑</b>, then press again in the air to double jump.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            Press <b className="text-white">R</b> after defeat or victory to restart cleanly.
          </div>
        </div>
      </div>
    </main>
  );
}
