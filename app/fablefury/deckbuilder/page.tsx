"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./deckbuilder.module.css";

type SkillColor = "red" | "blue" | "green" | "yellow";
type HeroId = "alf" | "shealer" | "franc" | "helga" | "smasherton" | "raven";
type BackpackToken = "empty" | "healing" | "lucky" | "crystal";
type BackpackLoot = "empty" | "coins" | "loot";

type Hero = {
  id: HeroId;
  name: string;
  race: string;
  role: string;
  mat: string;
  startingHealth: number;
  startingArmor: number;
  startingAttackDice: number;
  maxArmor: number;
  maxDice: number;
  coreSkill: { name: string; text: string };
  skillSlots: SkillColor[];
};

type Skill = { name: string; text: string; color: SkillColor };

const HEROES: Hero[] = [
  {
    id: "alf",
    name: "Alf Featherbottom",
    race: "Elf",
    role: "Archer",
    mat: "/fablefury/deckbuilder/heroes/alf-featherbottom.webp",
    startingHealth: 7,
    startingArmor: 1,
    startingAttackDice: 1,
    maxArmor: 4,
    maxDice: 5,
    coreSkill: { name: "Hangry Birds", text: "Whenever an Enemy Location is Cleared, gain 1 Crystal Ball." },
    skillSlots: ["yellow", "red", "green"],
  },
  {
    id: "shealer",
    name: "Dr. Shealer",
    race: "Human",
    role: "Priest",
    mat: "/fablefury/deckbuilder/heroes/dr-shealer.webp",
    startingHealth: 8,
    startingArmor: 1,
    startingAttackDice: 0,
    maxArmor: 4,
    maxDice: 4,
    coreSkill: { name: "Field Medicine", text: "Whenever an Enemy Location is Cleared, gain 1 Healing Potion." },
    skillSlots: ["green", "yellow", "green"],
  },
  {
    id: "franc",
    name: "Friar Franc",
    race: "Human",
    role: "Monk",
    mat: "/fablefury/deckbuilder/heroes/friar-franc.webp",
    startingHealth: 10,
    startingArmor: 0,
    startingAttackDice: 1,
    maxArmor: 3,
    maxDice: 5,
    coreSkill: { name: "Paying Respects", text: "Whenever an Enemy Location is Cleared, gain 1 Coin." },
    skillSlots: ["yellow", "green", "red"],
  },
  {
    id: "helga",
    name: "Helga",
    race: "Dwarf",
    role: "Tank",
    mat: "/fablefury/deckbuilder/heroes/helga.webp",
    startingHealth: 5,
    startingArmor: 2,
    startingAttackDice: 0,
    maxArmor: 5,
    maxDice: 4,
    coreSkill: { name: "Holding Space", text: "Whenever a Targeted Attack targets you, Core Roll 5+ to gain 1 Armor." },
    skillSlots: ["blue", "green", "blue"],
  },
  {
    id: "smasherton",
    name: "Lord Smasherton",
    race: "Dwarf",
    role: "Barbarian",
    mat: "/fablefury/deckbuilder/heroes/lord-smasherton.webp",
    startingHealth: 8,
    startingArmor: 1,
    startingAttackDice: 2,
    maxArmor: 4,
    maxDice: 6,
    coreSkill: { name: "Smite Club", text: "Whenever an Enemy deals damage to you, deal 1 damage." },
    skillSlots: ["red", "blue", "red"],
  },
  {
    id: "raven",
    name: "Raven Madison",
    race: "Elf",
    role: "Rogue",
    mat: "/fablefury/deckbuilder/heroes/raven-madison.webp",
    startingHealth: 6,
    startingArmor: 1,
    startingAttackDice: 1,
    maxArmor: 3,
    maxDice: 6,
    coreSkill: { name: "Loot Lust", text: "Whenever a Shrine Location is Cleared, draw 1 Loot." },
    skillSlots: ["red", "yellow", "blue"],
  },
];

const SKILLS: Record<SkillColor, Skill[]> = {
  red: [
    { name: "Bloody Blade", text: "When you roll triples, disable this Skill to reduce an enemy Attack stat by 1.", color: "red" },
    { name: "Boomerwrong", text: "Disable this Skill, then lose 1 Lucky Charm to deal 3 damage.", color: "red" },
    { name: "Bottled Rage", text: "Whenever an All Attack ends, deal 2 damage.", color: "red" },
  ],
  blue: [
    { name: "Absorb", text: "Whenever a Shrine Location is Cleared, gain 1 Armor.", color: "blue" },
    { name: "Atrophy", text: "Disable this Skill, then lose 1 Attack Die to reduce a damage stat by 1.", color: "blue" },
    { name: "Attention Seeker", text: "Disable this Skill, then Core Roll 5+ to redirect an All Attack to you.", color: "blue" },
  ],
  green: [
    { name: "Be Better", text: "Whenever you roll a 1, you may reroll that die.", color: "green" },
    { name: "Capital Care", text: "Lose 1 Coin to heal 1 Health.", color: "green" },
    { name: "Extra Inch", text: "Disable this Skill to increase a die by 1.", color: "green" },
  ],
  yellow: [
    { name: "5-Finger Discount", text: "Whenever a Shrine Location is Cleared, draw 1 Loot.", color: "yellow" },
    { name: "Boosting", text: "Increase all rewards by 1. This Skill cannot be disabled.", color: "yellow" },
    { name: "Cash Dash", text: "Whenever a Trap Location is Cleared, gain 2 Coins.", color: "yellow" },
  ],
};

const COLOR_LABEL: Record<SkillColor, string> = {
  red: "Attack",
  blue: "Defense",
  green: "Support",
  yellow: "Utility",
};

const TOKEN_ORDER: BackpackToken[] = ["empty", "healing", "lucky", "crystal"];
const LOOT_ORDER: BackpackLoot[] = ["empty", "coins", "loot"];

export default function DeckbuilderHeroLab() {
  const [heroId, setHeroId] = useState<HeroId>("alf");
  const hero = useMemo(() => HEROES.find((candidate) => candidate.id === heroId) ?? HEROES[0], [heroId]);
  const [health, setHealth] = useState(hero.startingHealth);
  const [armor, setArmor] = useState(hero.startingArmor);
  const [attackDice, setAttackDice] = useState(hero.startingAttackDice);
  const [equippedSkills, setEquippedSkills] = useState<Array<Skill | null>>([null, null, null]);
  const [skillPicker, setSkillPicker] = useState<number | null>(null);
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [tokens, setTokens] = useState<BackpackToken[]>(["healing", "empty", "empty"]);
  const [lootSlots, setLootSlots] = useState<BackpackLoot[]>(["coins", "empty", "empty"]);
  const [coinCounts, setCoinCounts] = useState([2, 0, 0]);

  useEffect(() => {
    setHealth(hero.startingHealth);
    setArmor(hero.startingArmor);
    setAttackDice(hero.startingAttackDice);
    setEquippedSkills([null, null, null]);
    setSkillPicker(null);
  }, [hero]);

  const maxAttackDice = Math.max(0, hero.maxDice - 1);

  function changeHero(id: HeroId) {
    setHeroId(id);
  }

  function chooseSkill(slot: number, skill: Skill) {
    setEquippedSkills((current) => current.map((item, index) => (index === slot ? skill : item)));
    setSkillPicker(null);
  }

  function cycleToken(index: number) {
    setTokens((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      return TOKEN_ORDER[(TOKEN_ORDER.indexOf(item) + 1) % TOKEN_ORDER.length];
    }));
  }

  function cycleLoot(index: number) {
    const currentItem = lootSlots[index];
    const next = LOOT_ORDER[(LOOT_ORDER.indexOf(currentItem) + 1) % LOOT_ORDER.length];
    setLootSlots((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
    setCoinCounts((current) => current.map((count, itemIndex) => {
      if (itemIndex !== index) return count;
      if (next === "coins") return Math.max(1, count);
      return 0;
    }));
  }

  function changeCoins(index: number, delta: number) {
    setLootSlots((current) => current.map((item, itemIndex) => (itemIndex === index ? "coins" : item)));
    setCoinCounts((current) => current.map((count, itemIndex) => itemIndex === index ? Math.min(6, Math.max(0, count + delta)) : count));
  }

  return (
    <main className={styles.page}>
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Fable Fury Digital Prototype</div>
          <h1>Hero Lab</h1>
          <p>Real base-game hero data, real hero mats, interactive stats, skills and backpack rules.</p>
        </div>
        <a href="/fablefury" className={styles.backLink}>← Trap prototype</a>
      </header>

      <section className={styles.heroPicker} aria-label="Choose hero">
        {HEROES.map((candidate) => (
          <button
            type="button"
            key={candidate.id}
            onClick={() => changeHero(candidate.id)}
            className={`${styles.heroChip} ${candidate.id === hero.id ? styles.heroChipActive : ""}`}
          >
            <strong>{candidate.name}</strong>
            <span>{candidate.role} · {candidate.race}</span>
          </button>
        ))}
      </section>

      <section className={styles.workspace}>
        <div className={styles.matColumn}>
          <div className={styles.matShell}>
            <img className={styles.heroMat} src={hero.mat} alt={`${hero.name} hero mat`} />

            <div className={styles.statOverlay}>
              <StatControl label="Health" value={health} min={0} max={10} onChange={setHealth} />
              <StatControl label="Armor" value={armor} min={0} max={hero.maxArmor} onChange={setArmor} />
              <StatControl label="Attack Dice" value={attackDice} min={0} max={maxAttackDice} onChange={setAttackDice} />
            </div>

            {hero.skillSlots.map((color, index) => (
              <button
                key={`${hero.id}-${index}-${color}`}
                type="button"
                className={`${styles.skillHotspot} ${styles[`slot${index + 1}`]} ${styles[color]}`}
                onClick={() => setSkillPicker(index)}
                aria-label={`Choose ${COLOR_LABEL[color]} skill for slot ${index + 1}`}
              >
                <span className={styles.skillLevel}>Skill {index + 1}</span>
                {equippedSkills[index] ? (
                  <span className={styles.equippedSkill}>{equippedSkills[index]?.name}</span>
                ) : (
                  <span className={styles.emptySkill}>+ {COLOR_LABEL[color]}</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.actionRow}>
            <button type="button" className={styles.primaryButton} onClick={() => setBackpackOpen(true)}>🎒 Open Backpack</button>
            <div className={styles.capacityNote}>
              Dice capacity: <strong>{hero.maxDice}</strong> total including the Core Die · Armor cap: <strong>{hero.maxArmor}</strong>
            </div>
          </div>
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.identityCard}>
            <span>{hero.role}</span>
            <h2>{hero.name}</h2>
            <p>{hero.race}</p>
          </div>

          <div className={styles.coreSkillCard}>
            <div className={styles.cardLabel}>Always active</div>
            <h3>{hero.coreSkill.name}</h3>
            <p>{hero.coreSkill.text}</p>
          </div>

          <div className={styles.skillSummary}>
            <div className={styles.cardLabel}>Skill progression</div>
            {hero.skillSlots.map((color, index) => (
              <button type="button" key={`${color}-summary-${index}`} onClick={() => setSkillPicker(index)}>
                <span className={`${styles.dot} ${styles[color]}`} />
                <span>Slot {index + 1}: {COLOR_LABEL[color]}</span>
                <strong>{equippedSkills[index]?.name ?? "Empty"}</strong>
              </button>
            ))}
          </div>

          <div className={styles.prototypeNote}>
            <strong>What is live already</strong>
            <p>Hero switching resets to printed starting stats. Health, Armor and Attack Dice respect their caps. Skill slots only offer their printed color. Backpack slots enforce token / Loot-or-Coins structure.</p>
          </div>
        </aside>
      </section>

      {skillPicker !== null && (
        <div className={styles.modalBackdrop} onMouseDown={() => setSkillPicker(null)}>
          <section className={styles.modal} onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.closeButton} type="button" onClick={() => setSkillPicker(null)} aria-label="Close">×</button>
            <div className={styles.eyebrow}>Shrine skill choice</div>
            <h2>Choose 1 of 3 {COLOR_LABEL[hero.skillSlots[skillPicker]]} Skills</h2>
            <p className={styles.modalIntro}>This is the first pass at the real “draw three, choose one” interaction.</p>
            <div className={styles.skillChoices}>
              {SKILLS[hero.skillSlots[skillPicker]].map((skill) => (
                <button type="button" key={skill.name} className={`${styles.skillChoice} ${styles[skill.color]}`} onClick={() => chooseSkill(skillPicker, skill)}>
                  <span>{COLOR_LABEL[skill.color]}</span>
                  <strong>{skill.name}</strong>
                  <p>{skill.text}</p>
                  <em>Equip skill</em>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {backpackOpen && (
        <div className={styles.modalBackdrop} onMouseDown={() => setBackpackOpen(false)}>
          <section className={`${styles.modal} ${styles.backpackModal}`} onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.closeButton} type="button" onClick={() => setBackpackOpen(false)} aria-label="Close">×</button>
            <div className={styles.eyebrow}>Inventory prototype</div>
            <h2>{hero.name}&apos;s Backpack</h2>
            <p className={styles.modalIntro}>Click a pocket to cycle contents. Coin pockets use − / + and cap at 6.</p>

            <div className={styles.bagStage}>
              <img src="/fablefury/deckbuilder/player-bag.webp" alt="Fable Fury player backpack" />
              {tokens.map((token, index) => (
                <button type="button" key={`token-${index}`} className={`${styles.bagSlot} ${styles[`tokenSlot${index + 1}`]}`} onClick={() => cycleToken(index)}>
                  <span>Token {index + 1}</span>
                  <strong>{tokenLabel(token)}</strong>
                </button>
              ))}
              {lootSlots.map((loot, index) => (
                <div key={`loot-${index}`} className={`${styles.bagSlot} ${styles.lootBagSlot} ${styles[`lootSlot${index + 1}`]}`}>
                  <button type="button" onClick={() => cycleLoot(index)}>
                    <span>Loot {index + 1}</span>
                    <strong>{lootLabel(loot, coinCounts[index])}</strong>
                  </button>
                  {loot === "coins" && (
                    <div className={styles.coinStepper}>
                      <button type="button" onClick={() => changeCoins(index, -1)}>−</button>
                      <b>{coinCounts[index]}</b>
                      <button type="button" onClick={() => changeCoins(index, 1)}>+</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function StatControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className={styles.statControl}>
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
        <strong>{value}</strong>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
      </div>
      <small>max {max}</small>
    </div>
  );
}

function tokenLabel(token: BackpackToken) {
  if (token === "healing") return "Healing Potion";
  if (token === "lucky") return "Lucky Charm";
  if (token === "crystal") return "Crystal Ball";
  return "Empty";
}

function lootLabel(loot: BackpackLoot, coins: number) {
  if (loot === "coins") return `${coins} Coin${coins === 1 ? "" : "s"}`;
  if (loot === "loot") return "Loot Card";
  return "Empty";
}
