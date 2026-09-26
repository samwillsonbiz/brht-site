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

      readonly worldW = 3400;
      readonly worldH = 720;
      readonly sourceW = 2048;
      readonly sourceH = 682;
      readonly sx = this.worldW / this.sourceW;
      readonly sy = this.worldH / this.sourceH;

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

      wx(n: number) {
        return n * this.sx;
      }

      wy(n: number) {
        return n * this.sy;
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

        this.load.image("platformStart", "/fablefury/platforms/start-platform.png");
        this.load.image("platformCenter", "/fablefury/platforms/center-platform.png");
        this.load.image("platformHangingSmall", "/fablefury/platforms/hanging-platform-small.png");
        this.load.image("platformHangingLarge", "/fablefury/platforms/hanging-platform-large.png");
        this.load.image("platformTrapBridge", "/fablefury/platforms/trap-bridge.png");
        this.load.image("platformRight", "/fablefury/platforms/right-platform.png");

        this.load.image("spikesLeftArt", "/fablefury/hazards/spikes-left.png");
        this.load.image("spikesMiddleArt", "/fablefury/hazards/spikes-middle.png");
        this.load.image("sawLargeArt", "/fablefury/hazards/saw-large.png");
        this.load.image("sawSmallArt", "/fablefury/hazards/saw-small.png");

        this.makeTexture("body", 42, 66, (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillRect(0, 0, 42, 66);
        });

        this.makeTexture("solid", 2, 2, (g) => {
          g.fillStyle(0xffffff, 0.01);
          g.fillRect(0, 0, 2, 2);
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

      addPiece(key: string, x: number, y: number, w: number, h: number, depth = 5) {
        const piece = this.add.image(this.wx(x), this.wy(y), key).setOrigin(0, 0).setDepth(depth);
        piece.setDisplaySize(this.wx(w), this.wy(h));
        return piece;
      }

      addStaticBox(group: any, x: number, y: number, w: number, h: number) {
        const box = group.create(
          this.wx(x + w / 2),
          this.wy(y + h / 2),
          "solid"
        );
        box.setDisplaySize(this.wx(w), this.wy(h));
        box.setVisible(false);
        box.refreshBody();
        return box;
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

        this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
        this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
        this.cameras.main.setBackgroundColor("#100c14");

        // The original 2048×682 scene becomes the coordinate map for the whole level.
        // Keeping the full painting underneath means the cut-out pieces line up pixel-for-pixel.
        const bg = this.add.image(0, 0, "dungeon").setOrigin(0, 0).setDepth(-100);
        bg.setDisplaySize(this.worldW, this.worldH);

        // Real foreground art cut directly from the source scene.
        this.addPiece("platformStart", 0, 300, 675, 120, 6);
        this.addPiece("platformCenter", 805, 345, 230, 100, 6);
        this.addPiece("platformHangingSmall", 995, 220, 180, 95, 7);
        this.addPiece("platformHangingLarge", 1205, 235, 230, 130, 7);
        this.addPiece("platformTrapBridge", 1115, 405, 290, 110, 7);
        this.addPiece("platformRight", 1380, 320, 668, 115, 6);

        this.addPiece("spikesLeftArt", 500, 420, 350, 100, 12);
        this.addPiece("spikesMiddleArt", 990, 425, 145, 95, 12);
        this.addPiece("sawLargeArt", 535, 105, 190, 200, 11);
        this.addPiece("sawSmallArt", 790, 165, 130, 145, 11);

        // Collision strips are matched to the visible top edges of the cut-out platform art.
        const platforms = this.physics.add.staticGroup();
        this.addStaticBox(platforms, 0, 327, 660, 22);
        this.addStaticBox(platforms, 820, 370, 195, 18);
        this.addStaticBox(platforms, 1005, 244, 150, 18);
        this.addStaticBox(platforms, 1215, 260, 200, 18);
        this.addStaticBox(platforms, 1130, 430, 255, 18);
        this.addStaticBox(platforms, 1390, 346, 658, 22);

        this.player = this.physics.add.sprite(this.wx(220), this.wy(288), "body");
        this.player.setAlpha(0.001).setCollideWorldBounds(true);
        this.physics.add.collider(this.player, platforms);

        this.art = this.add
          .image(this.player.x, this.player.y, "harryIdle1")
          .setOrigin(0.5, 1)
          .setDepth(50);
        this.resizeArt("harryIdle1");

        // Hazard boxes match the visible spikes, saw blades and lava under the route.
        const hazards = this.physics.add.staticGroup();
        this.addStaticBox(hazards, 505, 438, 335, 55);
        this.addStaticBox(hazards, 990, 440, 145, 54);
        this.addStaticBox(hazards, 558, 135, 145, 145);
        this.addStaticBox(hazards, 805, 182, 105, 108);
        this.addStaticBox(hazards, 480, 500, 1568, 165);

        // Extra traps already painted into the right-hand platform.
        this.addStaticBox(hazards, 1570, 305, 90, 45);
        this.addStaticBox(hazards, 1660, 95, 42, 255);

        this.chaser = this.physics.add.image(this.wx(18), this.wy(500), "inferno").setDepth(45);
        this.chaser.body.allowGravity = false;
        this.chaser.setImmovable(true);
        this.chaser.setScale(0.86);
        this.chaser.body.setSize(135, 150, true);
        this.tweens.add({
          targets: this.chaser,
          scaleX: 0.94,
          scaleY: 0.94,
          duration: 220,
          yoyo: true,
          repeat: -1,
        });
        this.tweens.add({
          targets: this.chaser,
          angle: 8,
          duration: 180,
          yoyo: true,
          repeat: -1,
        });

        const finish = this.physics.add.staticImage(this.wx(2015), this.wy(330), "solid");
        finish.setDisplaySize(this.wx(42), this.wy(330));
        finish.setVisible(false);
        finish.refreshBody();

        this.physics.add.overlap(this.player, hazards, () => this.damage(24));
        this.physics.add.overlap(this.player, this.chaser, () => this.caught());
        this.physics.add.overlap(this.player, finish, () => this.win());

        // Tight chase camera: Harry stays left of centre so upcoming hazards arrive fast.
        this.cameras.main.setZoom(1.55);
        this.cameras.main.startFollow(this.player, true, 0.14, 0.12, -95, 18);
        this.cameras.main.setDeadzone(110, 70);

        this.cursors = this.input.keyboard?.createCursorKeys();
        this.keys = this.input.keyboard?.addKeys("W,A,D,SPACE,R");

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

        const jump =
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.keys.W) ||
          Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

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

          if (gap < 200 && this.chaseText) {
            this.chaseText.setText("MOVE! MOVE! MOVE!");
          } else if (gap > 360 && this.chaseText && chaseAge > 1800) {
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
            The chase level now uses foreground platform and hazard art cut directly
            from the dungeon scene, with collisions aligned to the visible surfaces.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black p-2 shadow-2xl">
          <div ref={mountRef} className="aspect-video w-full overflow-hidden rounded-xl bg-black" />
        </div>

        <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            Move quickly with <b className="text-white">A / D</b> or arrow keys.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            Jump with <b className="text-white">Space / W / ↑</b>; press again in
            the air to double jump.
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            The inferno never stops. Press <b className="text-white">R</b> after
            defeat or victory.
          </div>
        </div>
      </div>
    </main>
  );
}
