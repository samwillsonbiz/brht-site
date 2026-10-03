import type { TokenKind } from "@/lib/fableFuryHeroes";
import { getTrapPlan } from "@/lib/fableFuryTrapEngine";

export type EventContext = {
  health: number;
  armor: number;
  attackDice: number;
  coins: number;
  lootCount: number;
  lootNames: string[];
};

export type EventEffect =
  | { type: "health"; amount: number }
  | { type: "armor"; amount: number }
  | { type: "attackDice"; amount: number }
  | { type: "coins"; amount: number }
  | { type: "token"; token: TokenKind; amount: number }
  | { type: "drawLoot"; count: number; immediate?: boolean }
  | { type: "discardLoot"; count: number }
  | { type: "scout"; count: number }
  | { type: "resetRealm" }
  | { type: "note"; text: string };

export type EventRequirement = {
  health?: number;
  coins?: number;
  loot?: number;
};

export type EventOption = {
  label: string;
  description?: string;
  effects: EventEffect[];
  requires?: EventRequirement;
};

export type EventPlan =
  | { kind: "auto"; title?: string; effects: EventEffect[] }
  | { kind: "choice"; prompt: string; options: EventOption[] }
  | { kind: "roll"; prompt: string; resolve: (roll: number) => EventEffect[] }
  | { kind: "pickNumber"; prompt: string; resolve: (pick: number, roll: number) => EventEffect[] }
  | {
      kind: "optionalRoll";
      prompt: string;
      payLabel: string;
      skipLabel: string;
      cost: EventEffect[];
      requires?: EventRequirement;
      resolve: (roll: number) => EventEffect[];
      skipEffects?: EventEffect[];
    };

const note = (text: string): EventEffect => ({ type: "note", text });
const hasLoot = (ctx: EventContext, name: string) =>
  ctx.lootNames.some((lootName) => lootName.toLowerCase() === name.toLowerCase());

export function requirementMet(requirement: EventRequirement | undefined, ctx: EventContext) {
  if (!requirement) return true;
  if ((requirement.health ?? 0) > ctx.health) return false;
  if ((requirement.coins ?? 0) > ctx.coins) return false;
  if ((requirement.loot ?? 0) > ctx.lootCount) return false;
  return true;
}

export function getEventPlan(eventId: string, ctx: EventContext): EventPlan {
  const [baseId, encodedRace] = eventId.split("::");
  if (baseId.startsWith("trap-")) {
    const normalizedRace = encodedRace
      ? `${encodedRace.charAt(0).toUpperCase()}${encodedRace.slice(1).toLowerCase()}`
      : "Human";
    return getTrapPlan(baseId, { ...ctx, race: normalizedRace });
  }

  switch (eventId) {
    case "event-attractive-offer":
      return {
        kind: "choice",
        prompt: "The noble wants one of your Loot cards. Take the deal?",
        options: [
          { label: "Trade 1 Loot for 3 Coins", effects: [{ type: "discardLoot", count: 1 }, { type: "coins", amount: 3 }], requires: { loot: 1 } },
          { label: "Decline", effects: [note("You keep your Loot and move on.")] },
        ],
      };
    case "event-backdoor-bargains":
      return {
        kind: "roll",
        prompt: "Roll your Core Die to see what the merchant gives you.",
        resolve: (roll) => {
          if (roll === 1) return [{ type: "token", token: "lucky", amount: 1 }];
          if (roll === 2) return [{ type: "token", token: "crystal", amount: 1 }];
          if (roll === 3) return [{ type: "token", token: "healing", amount: 1 }];
          if (roll === 4) return [note("Nothing happens.")];
          if (roll === 5) return [{ type: "armor", amount: 1 }];
          return [{ type: "drawLoot", count: 1 }];
        },
      };
    case "event-beautiful-bullies":
      return { kind: "auto", effects: [{ type: "coins", amount: 1 }] };
    case "event-beauty-contest":
      return {
        kind: "roll",
        prompt: "Roll your Core Die. In a solo run you are automatically the highest roll.",
        resolve: (roll) => [{ type: "attackDice", amount: 1 }, note(`You rolled ${roll} and win the solo beauty contest.`)],
      };
    case "event-block-busted":
      return {
        kind: "choice",
        prompt: "Pay the late fee or take the damage.",
        options: [
          { label: "Lose 1 Coin", effects: [{ type: "coins", amount: -1 }], requires: { coins: 1 } },
          { label: "Lose 2 Health", effects: [{ type: "health", amount: -2 }], requires: { health: 2 } },
        ],
      };
    case "event-breakthrough":
      return {
        kind: "roll",
        prompt: "Roll your Core Die for the breakthrough result.",
        resolve: (roll) => {
          if (roll === 1) return [{ type: "drawLoot", count: 1 }];
          if (roll === 2) return [{ type: "coins", amount: -1 }];
          if (roll === 3) return [note("Nothing happens.")];
          if (roll === 4) return [{ type: "token", token: "lucky", amount: 1 }];
          if (roll === 5) return [{ type: "token", token: "healing", amount: 1 }];
          return [{ type: "token", token: "crystal", amount: 1 }];
        },
      };
    case "event-busking":
      return { kind: "auto", effects: [{ type: "coins", amount: 2 }, note("Solo: you are the Party Leader, so you gain 2 Coins.")] };
    case "event-character-building":
      return { kind: "roll", prompt: "Core Roll 4+ to gain 1 Coin.", resolve: (roll) => roll >= 4 ? [{ type: "coins", amount: 1 }] : [note("You needed a 4+. No Coin gained.")] };
    case "event-circumambulation":
    case "event-clean-up-crew":
    case "event-skeptical-skelly":
      return { kind: "auto", effects: [note("Nothing happens.")] };
    case "event-double-jeopardy":
      return {
        kind: "pickNumber",
        prompt: "Pick a number from 1 to 6, then roll your Core Die. Match it to gain 3 Coins.",
        resolve: (pick, roll) => pick === roll ? [{ type: "coins", amount: 3 }, note(`Exact match: ${roll}!`)] : [note(`You picked ${pick} and rolled ${roll}. No prize.`)],
      };
    case "event-dehydration":
    case "event-tummy-ache":
      return { kind: "auto", effects: [{ type: "health", amount: -1 }] };
    case "event-drinking-contest": {
      const aleBonus = hasLoot(ctx, "Ale") ? [{ type: "drawLoot", count: 1 } as EventEffect, note("Ale bonus: draw 1 additional Loot.")] : [];
      return {
        kind: "choice",
        prompt: "Join the drinking contest?",
        options: [
          { label: "Lose 3 Health · Draw 2 Loot", effects: [{ type: "health", amount: -3 }, { type: "drawLoot", count: 2 }, ...aleBonus], requires: { health: 3 } },
          { label: "Sit this one out", effects: aleBonus.length ? aleBonus : [note("You skip the contest.")] },
        ],
      };
    }
    case "event-embarrass-trespass":
      return {
        kind: "choice",
        prompt: "Choose your reward.",
        options: [
          { label: "Draw 1 Loot", effects: [{ type: "drawLoot", count: 1 }] },
          { label: "Reveal 2 Locations", description: "Peek at two unexplored locations without travelling to them.", effects: [{ type: "scout", count: 2 }] },
        ],
      };
    case "event-emotional-damage":
      return { kind: "roll", prompt: "Roll your Core Die. Odds lose 1 Health; evens gain 1 Health.", resolve: (roll) => roll % 2 === 0 ? [{ type: "health", amount: 1 }] : [{ type: "health", amount: -1 }] };
    case "event-epic-chest":
      return {
        kind: "choice",
        prompt: "Choose the chest reward.",
        options: [
          { label: "Draw 2 Loot", effects: [{ type: "drawLoot", count: 2 }] },
          { label: "Give the others 1 Coin", description: "No other Heroes exist in this solo run.", effects: [note("Solo: there are no other Heroes, so nobody gains a Coin.")] },
        ],
      };
    case "event-freaky-friday":
      return { kind: "auto", effects: [note("Solo: passing your Backpack to the Hero on your left gives it right back to you.")] };
    case "event-slap-fight":
      return { kind: "roll", prompt: "Roll your Core Die. Solo: you are both highest and lowest.", resolve: (roll) => [note(`You rolled ${roll}. Solo ruling: +1 Armor and -1 Armor cancel out.`)] };
    case "event-giant-tea-party":
      return { kind: "auto", effects: [{ type: "health", amount: -1 }] };
    case "event-gift-from-the-grave": {
      const tinctureBonus = hasLoot(ctx, "Herbal Tincture") ? [{ type: "drawLoot", count: 1 } as EventEffect, note("Herbal Tincture bonus: draw 1 Loot.")] : [];
      return { kind: "auto", effects: [{ type: "token", token: "healing", amount: 4 }, ...tinctureBonus] };
    }
    case "event-goodnight-moon":
      return { kind: "auto", effects: [{ type: "health", amount: 2 }] };
    case "event-haiku-hot-springs":
      return { kind: "auto", effects: [{ type: "health", amount: 1 }] };
    case "event-hasty-tasty":
      return {
        kind: "roll",
        prompt: "Roll your Core Die for the mystery potion.",
        resolve: (roll) => {
          if (roll === 1) return [{ type: "health", amount: 1 }];
          if (roll === 2) return [{ type: "health", amount: 2 }];
          if (roll === 3) return [{ type: "attackDice", amount: 1 }];
          if (roll === 4) return [note("Nothing happens.")];
          if (roll === 5) return [{ type: "health", amount: -2 }];
          return [{ type: "armor", amount: 1 }];
        },
      };
    case "event-hatchling-hush":
    case "event-counterfeit-scroll":
      return {
        kind: "choice",
        prompt: "Give up Loot or take 3 damage.",
        options: [
          { label: "Lose 1 Loot", effects: [{ type: "discardLoot", count: 1 }], requires: { loot: 1 } },
          { label: "Lose 3 Health", effects: [{ type: "health", amount: -3 }], requires: { health: 3 } },
        ],
      };
    case "event-haute-couture":
      return { kind: "roll", prompt: "Roll your Core Die. Solo: your roll is automatically the highest.", resolve: (roll) => [{ type: "armor", amount: 1 }, note(`You rolled ${roll} and gain 1 Armor.`)] };
    case "event-heroes-welcome":
      return { kind: "auto", effects: [{ type: "drawLoot", count: 1 }] };
    case "event-suspicious-merchant":
      return {
        kind: "choice",
        prompt: "Take the suspicious deal?",
        options: [
          { label: "Lose 1 Health · Draw 1 Loot", effects: [{ type: "health", amount: -1 }, { type: "drawLoot", count: 1 }], requires: { health: 1 } },
          { label: "Walk away", effects: [note("You decide the alley is suspicious enough already.")] },
        ],
      };
    case "event-jinx":
      return { kind: "roll", prompt: "Roll your Core Die.", resolve: (roll) => [note(`You rolled ${roll}. Solo: there is no other Hero roll to match, so you lose no Health.`)] };
    case "event-kitty-revenge": {
      const attackKitten = hasLoot(ctx, "Attack Kitten") ? [{ type: "attackDice", amount: 1 } as EventEffect, note("Attack Kitten bonus: gain 1 Attack Die.")] : [];
      return { kind: "auto", effects: [{ type: "health", amount: -2 }, ...attackKitten] };
    }
    case "event-knights-not-nerds":
      return {
        kind: "choice",
        prompt: "Keep the Coins or share them?",
        options: [
          { label: "Gain 3 Coins", effects: [{ type: "coins", amount: 3 }] },
          { label: "Give the others 1 Coin", description: "No other Heroes exist in this solo run.", effects: [note("Solo: there are no other Heroes to receive the Coins.")] },
        ],
      };
    case "event-legendary-chest":
      return { kind: "auto", effects: [{ type: "coins", amount: 2 }, { type: "drawLoot", count: 1 }] };
    case "event-li-l-hustlers":
      return {
        kind: "choice",
        prompt: "Buy some definitely legitimate merchandise?",
        options: [
          { label: "Lose 2 Coins · Draw 1 Loot", effects: [{ type: "coins", amount: -2 }, { type: "drawLoot", count: 1 }], requires: { coins: 2 } },
          { label: "No thanks", effects: [note("You keep your Coins.")] },
        ],
      };
    case "event-looty-booty":
      return { kind: "auto", effects: [{ type: "coins", amount: 1 }, { type: "drawLoot", count: 1 }] };
    case "event-misspent-youth":
      return { kind: "roll", prompt: "Roll your Core Die. Odds gain a Healing Potion; evens gain a Crystal Ball.", resolve: (roll) => roll % 2 === 0 ? [{ type: "token", token: "crystal", amount: 1 }] : [{ type: "token", token: "healing", amount: 1 }] };
    case "event-no-pain-no-gain": {
      const gymBonus = hasLoot(ctx, "Gym Membership") ? [{ type: "attackDice", amount: 1 } as EventEffect, note("Gym Membership bonus: gain 1 Attack Die.")] : [];
      return {
        kind: "choice",
        prompt: "Push through the workout?",
        options: [
          { label: "Lose 3 Health · Gain 1 Attack Die", effects: [{ type: "health", amount: -3 }, { type: "attackDice", amount: 1 }, ...gymBonus], requires: { health: 3 } },
          { label: "Skip the workout", effects: gymBonus.length ? gymBonus : [note("You skip the workout.")] },
        ],
      };
    }
    case "event-nocturnal-nuisance":
      return hasLoot(ctx, "Stunner Glasses")
        ? { kind: "auto", effects: [note("Stunner Glasses prevent the Health loss.")] }
        : { kind: "auto", effects: [{ type: "health", amount: -1 }] };
    case "event-powered-ranger":
      return { kind: "auto", effects: [{ type: "attackDice", amount: 1 }] };
    case "event-rat-crossing":
      return { kind: "roll", prompt: "Roll your Core Die. Solo: your roll is also the lowest roll.", resolve: (roll) => [{ type: "health", amount: -1 }, note(`You rolled ${roll}; as the only Hero, you are the lowest roll.`)] };
    case "event-scattered-loot":
      return {
        kind: "choice",
        prompt: "Choose what to grab.",
        options: [
          { label: "Draw 1 Loot", effects: [{ type: "drawLoot", count: 1 }] },
          { label: "Gain 2 Coins", effects: [{ type: "coins", amount: 2 }] },
        ],
      };
    case "event-sense-of-direction":
      return { kind: "auto", effects: [{ type: "resetRealm" }, note("All previously explored Locations except this Event and an already-found Shrine return to Unexplored.")] };
    case "event-side-quest":
      return {
        kind: "choice",
        prompt: "Take the side quest?",
        options: [
          { label: "Lose 2 Health · Draw 1 Loot", effects: [{ type: "health", amount: -2 }, { type: "drawLoot", count: 1 }], requires: { health: 2 } },
          { label: "Ignore it", effects: [note("You leave the side quest unfinished.")] },
        ],
      };
    case "event-unlucky-charms":
      return { kind: "roll", prompt: "Core Roll 5+ to gain 3 Coins.", resolve: (roll) => roll >= 5 ? [{ type: "coins", amount: 3 }] : [note("You needed a 5+. No Coins gained.")] };
    case "event-surstromming":
      return { kind: "auto", effects: [{ type: "attackDice", amount: 2 }, note("Solo: you are the Party Leader; there are no other Heroes to lose Health.")] };
    case "event-the-sorting-hat":
      return { kind: "auto", effects: [note("Solo: passing your Health Dial to the Hero on your left gives it right back to you.")] };
    case "event-thrift-shop":
      return {
        kind: "choice",
        prompt: "Pop some tags?",
        options: [
          { label: "Lose 2 Coins · Draw 2 Loot", effects: [{ type: "coins", amount: -2 }, { type: "drawLoot", count: 2 }], requires: { coins: 2 } },
          { label: "Keep walking", effects: [note("You keep your 2 Coins in your pocket.")] },
        ],
      };
    case "event-tripping-tomes":
      return { kind: "auto", effects: [{ type: "drawLoot", count: 1, immediate: true }, note("This Loot must be used immediately or discarded. The Loot-effect engine will handle the actual use step next.")] };
    case "event-troll-toll":
      return {
        kind: "choice",
        prompt: "Pay the Troll Toll.",
        options: [
          { label: "Lose 1 Coin", effects: [{ type: "coins", amount: -1 }], requires: { coins: 1 } },
          { label: "Lose 1 Health", effects: [{ type: "health", amount: -1 }], requires: { health: 1 } },
        ],
      };
    case "event-underground-dice":
      return {
        kind: "optionalRoll",
        prompt: "Pay 2 Coins to gamble? Odds do nothing; evens draw 2 Loot.",
        payLabel: "Pay 2 Coins & Roll",
        skipLabel: "Walk away",
        cost: [{ type: "coins", amount: -2 }],
        requires: { coins: 2 },
        resolve: (roll) => roll % 2 === 0 ? [{ type: "drawLoot", count: 2 }] : [note("Odd roll. The house wins.")],
        skipEffects: [note("You skip the underground dice game.")],
      };
    case "event-vending-machine":
      return {
        kind: "optionalRoll",
        prompt: "Pay 3 Coins to use the machine? Odds gain 1 Armor; evens gain 1 Attack Die.",
        payLabel: "Pay 3 Coins & Roll",
        skipLabel: "Leave it alone",
        cost: [{ type: "coins", amount: -3 }],
        requires: { coins: 3 },
        resolve: (roll) => roll % 2 === 0 ? [{ type: "attackDice", amount: 1 }] : [{ type: "armor", amount: 1 }],
        skipEffects: [note("You leave the machine alone.")],
      };
    case "event-vertical-leap":
      return { kind: "roll", prompt: "Roll your Core Die. Solo: you are both highest and lowest.", resolve: (roll) => [note(`You rolled ${roll}. Solo ruling: lose 2 Health and gain 2 Health cancel out.`)] };
    case "event-wishing-well":
      return {
        kind: "choice",
        prompt: "Make a wish?",
        options: [
          { label: "Lose 1 Coin · Gain 2 Health", effects: [{ type: "coins", amount: -1 }, { type: "health", amount: 2 }], requires: { coins: 1 } },
          { label: "Save your Coin", effects: [note("You keep your Coin.")] },
        ],
      };
    default:
      return { kind: "auto", effects: [note("This Event is in the database but does not yet have a digital resolver. No state was changed.")] };
  }
}
