// Fable Fury: Brawl v0.3. Serializable rules engine, independent of the browser UI.
export class Brawl {
  constructor(data, config = {}) {
    this.data = data;
    this.defs = Object.fromEntries(data.cards.map(c => [c.id, c]));
    this.s = {version: 2, rng: config.seed ?? Date.now() % 2147483646 + 1, mode: config.mode || 'solo', round: 1,
      phase: 'program', reveal: 0, edge: 0, uid: 0, effect: 0, log: [], queue: [], prompt: null,
      shown: [false, false], plans: [null, null], committed: [false, false], shopDone: [false, false],
      lootDeck: [], lootDiscard: [], players: [], winner: null, beat: 'Program two cards'};
    this.s.edge = this.random() < .5 ? 0 : 1;
    for (let i = 0; i < 2; i++) {
      const hero = config.heroes?.[i] || ['SMA', 'RAV'][i];
      const h = data.heroes.find(x => x.id === hero);
      if (!h) throw Error('Unknown Hero');
      const pool = data.cards.filter(c => c.category === 'Hero' && c.hero === h.name);
      const chosen = config.chosen?.[i] || pool.filter(c => c.starter).map(c => c.id);
      if (chosen.length !== 5 || new Set(chosen).size !== 5 || chosen.some(id => !pool.some(c => c.id === id))) throw Error('Choose five cards from your Hero pool.');
      const deck = [];
      const basics = config.basics?.[i] || Brawl.defaultBasics(data);
      if (basics.length !== 10 || new Set(basics).size !== 10 || basics.some(id => this.defs[id]?.category !== 'Basic')) throw Error('Choose ten different Basic cards.');
      for (const id of basics) deck.push(this.instance(id));
      for (const id of chosen) deck.push(this.instance(id));
      this.s.players.push({hero, name: h.name, pos: i ? 6 : 2, hp: 18, coins: 0, fury: 0, specialReady: false,
        deck: this.shuffle(deck), discard: [], hand: [], loot: [], trait: 0, block: 0, roundBlock: 0,
        usedLoot: false, moved: false, damageTaken: 0, blocked: 0, resolveEarned: false, crossed: false,
        immunePush: false, planted: false, plantBonus: false, nextDamage: 0, nextSpeed: 0, slow: 0,
        movePenalty: 0, attackPenalty: 0, counters: [], delayed: [], basicFirst: false,
        reclaimed: [], peek: [], usedSpecial: 0, lootBought: 0});
    }
    this.s.lootDeck = this.shuffle(data.cards.filter(c => c.category === 'Loot').map(c => c.id));
    for (let i = 0; i < 2; i++) this.draw(i, 5);
    this.log('The Brawl begins. Program two cards.');
    this.prepareBot();
  }
  static defaultBasics(data) {return data.cards.filter(c => c.category === 'Basic' && !['BAS-009', 'BAS-011'].includes(c.id)).map(c => c.id);}
  static restore(data, state) {
    if (state.version !== 2 || !state.players?.length) throw Error('This saved match uses older rules. Start a new v0.3 Brawl.');
    const game = Object.create(Brawl.prototype); game.data = data;
    game.defs = Object.fromEntries(data.cards.map(c => [c.id, c])); game.s = structuredClone(state); return game;
  }
  random() {this.s.rng = this.s.rng * 16807 % 2147483647; return (this.s.rng - 1) / 2147483646;}
  shuffle(a) {a = [...a]; for (let i = a.length - 1; i > 0; i--) {const j = Math.floor(this.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]];} return a;}
  instance(id) {return {id, uid: `c${++this.s.uid}`};}
  log(message, kind = 'info', player = null) {this.s.log.push({message, kind, player, round: this.s.round, reveal: this.s.reveal + 1}); if (this.s.log.length > 250) this.s.log.shift();}
  def(c) {return this.defs[typeof c === 'string' ? c : c.id];}
  hero(i) {return this.data.heroes.find(h => h.id === this.s.players[i].hero);}
  range() {return Math.abs(this.s.players[0].pos - this.s.players[1].pos);}
  bot(i) {return this.s.mode === 'solo' && i === 1 || this.s.mode === 'bots';}
  draw(i, count) {
    const p = this.s.players[i];
    while (count-- > 0) {
      if (!p.deck.length) {p.deck = this.shuffle(p.discard); p.discard = [];}
      if (!p.deck.length) break;
      p.hand.push(p.deck.pop());
    }
  }
  available(i) {
    const p = this.s.players[i];
    return [...p.hand, ...(p.specialReady ? [{id: `${p.hero}-SP1`, uid: `special-${i}`}] : [])];
  }
  options(input = {}) {return {direction: 'toward', steps: 3, aim: 'damage', trait: true, remedy: 'damage', coin: true, push: true, follow: true, ...input};}
  commit(i, choices) {
    if (this.s.phase !== 'program' || this.s.committed[i]) throw Error('Programming is closed.');
    if (choices.length !== 2 || choices[0].uid === choices[1].uid) throw Error('Choose two different cards.');
    const available = this.available(i);
    const plan = choices.map(x => {
      const card = available.find(c => c.uid === x.uid); if (!card) throw Error('That card is not in your hand.');
      return {card: {...card}, opts: this.options(x.opts), done: false, speed: 0};
    });
    this.s.plans[i] = plan; this.s.committed[i] = true;
    const p = this.s.players[i];
    for (const item of plan) {
      if (item.card.uid.startsWith('special')) p.specialReady = false;
      else p.hand = p.hand.filter(c => c.uid !== item.card.uid);
    }
    if (this.s.committed.every(Boolean)) {
      this.s.phase = 'resolve'; this.s.beat = 'Reveal Action 1';
      for (const p of this.s.players) p.usedLoot = false;
      this.s.queue = [{type: 'window', window: 'scout'}, {type: 'reveal', index: 0}];
    }
  }
  prepareBot() {
    // Deliberately observes only its hand and public resources/positions; never the opponent's plan or hand.
    for (let i = 0; i < 2; i++) if (this.bot(i) && !this.s.committed[i]) this.commit(i, this.botPlan(i));
  }
  botPlan(i) {
    const p = this.s.players[i], dist = this.range();
    const score = card => {
      const d = this.def(card); const r = this.printedRange(d);
      let v = this.random() * 1.1 + (d.category === 'Basic' && p.coins < 4 ? .9 : 0);
      if (d.damage) v += dist >= r[0] && dist <= r[1] ? Number(d.damage) * 1.2 + Number(d.speed) * .15 : -.8;
      if (/Move|move/.test(d.text) && (dist > 1 || p.hero === 'ALF' && dist < 3)) v += 2;
      if (/Heal/.test(d.text)) v += p.hp < 12 ? 3 : -.5;
      if (/Block/.test(d.text)) v += dist <= 2 ? 1.5 : .2;
      if (d.category === 'Special') v += 2;
      if (d.name === 'Backstep' && dist > 3) v -= 2;
      if (d.name === 'Advance' && dist === 1) v -= 2;
      return v;
    };
    const selected = this.available(i).map(c => ({c, v: score(c)})).sort((a, b) => b.v - a.v).slice(0, 2).map(x => x.c);
    if (dist > 1 && selected.length === 2 && /Move/.test(this.def(selected[1]).text) && !/Move/.test(this.def(selected[0]).text)) selected.reverse();
    return selected.map(c => ({uid: c.uid, opts: {direction: p.hero === 'ALF' && dist < 3 ? 'away' : 'toward', remedy: this.def(c).damage ? 'damage' : /Block/.test(this.def(c).text) ? 'block' : 'move'}}));
  }
  printedRange(d) {const a = String(d.range || '1').split('-').map(Number); return [a[0], a[1] || a[0]];}
  opts(i) {return this.s.plans[i]?.[this.s.reveal]?.opts || this.options();}
  direction(i, direction = 'toward') {
    const toward = Math.sign(this.s.players[1 - i].pos - this.s.players[i].pos);
    return direction === 'left' ? -1 : direction === 'right' ? 1 : direction === 'away' ? -toward : toward;
  }
  move(i, count, direction = 'free', forced = false, optional = false) {
    const p = this.s.players[i], op = this.s.players[1 - i];
    let n = Math.max(0, count);
    if (!forced) {
      if (optional) n = Math.min(n, this.opts(i).steps);
      n = Math.max(0, n - p.movePenalty); p.movePenalty = 0;
    }
    const dir = typeof direction === 'number' ? direction : this.direction(i, direction === 'free' ? this.opts(i).direction : direction);
    let target = Math.max(1, Math.min(7, p.pos + dir * n));
    if (target === op.pos) target -= dir;
    if (direction === 'toward') {
      while(target!==p.pos&&Math.abs(target-op.pos)>=Math.abs(p.pos-op.pos))target-=dir;
      if(target===op.pos)target-=dir;
    }
    const old = p.pos;
    if (target === old) return 0;
    const crossed = (old - op.pos) * (target - op.pos) < 0;
    if (p.hero === 'SMA') {
      for (let step = old; step !== target; step += dir) if (Math.abs(step + dir - op.pos) < Math.abs(step - op.pos)) p.trait = Math.min(2, p.trait + 1);
    }
    p.pos = target; p.moved = true; p.planted = false;
    if (crossed) p.crossed = true;
    this.log(`${p.name} moves ${old} → ${target}.`, 'move', i); return Math.abs(target - old);
  }
  relocate(i, pos) {
    if (pos < 1 || pos > 7 || pos === this.s.players[1 - i].pos) return;
    const p = this.s.players[i]; if (p.pos === pos) return;
    const dir = Math.sign(pos - p.pos), n = Math.abs(pos - p.pos);
    // Teleport is movement for stationary/crossing reminders, but not a walk through intermediate spaces.
    const old = p.pos; p.pos = pos; p.moved = true; p.planted = false;
    if ((old - this.s.players[1 - i].pos) * (pos - this.s.players[1 - i].pos) < 0) p.crossed = true;
    if (p.hero === 'SMA' && Math.abs(pos - this.s.players[1 - i].pos) < Math.abs(old - this.s.players[1 - i].pos)) p.trait = Math.min(2, p.trait + n);
    this.log(`${p.name} relocates ${old} → ${pos}.`, 'move', i); return dir;
  }
  gainFury(i, amount = 1) {
    const p = this.s.players[i]; if (p.specialReady || this.s.plans[i]?.some(a => !a.done && this.def(a.card).category === 'Special')) return;
    p.fury += amount;
    if (p.fury >= 3) {p.fury = 0; p.specialReady = true; this.log(`${p.name}'s Fury Special is ready!`, 'fury', i);}
  }
  lose(i, amount, source, effect) {
    const p = this.s.players[i], loss = Math.max(0, amount); if (!loss) return 0;
    p.hp = Math.max(0, p.hp - loss); p.damageTaken += loss;
    this.log(`${p.name} loses ${loss} HP.`, 'damage', i);
    if (source !== i && p.lastFuryEffect !== effect) {p.lastFuryEffect = effect; this.gainFury(i);}
    return loss;
  }
  heal(i, n) {const p=this.s.players[i], amount=Math.max(0,Math.min(n,18-p.hp));p.hp+=amount;this.log(`${p.name} heals ${amount} HP.`, 'heal', i);}
  block(i, n, round = false) {this.s.players[i][round ? 'roundBlock' : 'block'] += n; this.log(`${this.s.players[i].name} gains Block ${n}${round ? ' for the round' : ''}.`, 'block', i);}
  coin(i, n) {this.s.players[i].coins = Math.min(8, Math.max(0, this.s.players[i].coins + n));}
  checkWinner() {
    if (this.s.players.some(p => p.hp <= 0)) {
      this.s.winner = this.s.players.every(p => p.hp <= 0) ? 'draw' : this.s.players[0].hp <= 0 ? 1 : 0;
      this.s.phase = 'over'; this.s.prompt = null; this.s.queue = [];
      this.log(this.s.winner === 'draw' ? 'A double knockout. The Brawl is a draw!' : `${this.s.players[this.s.winner].name} wins the Brawl!`, 'victory'); return true;
    } return false;
  }
  pushTasks(...tasks) {this.s.queue.unshift(...tasks);}
  advance() {
    if (this.s.prompt || this.s.phase !== 'resolve') return;
    let guard = 0;
    while (this.s.queue.length && this.s.phase === 'resolve' && !this.s.prompt) {
      if (++guard > 300) throw Error('Resolution queue exceeded safety limit.');
      const task = this.s.queue.shift();
      if (task.type === 'pause') {this.s.beat = task.label; return;}
      this.task(task);
    }
  }
  task(t) {
    const s = this.s;
    if (t.type === 'window') {
      const order = t.players || [s.edge, 1 - s.edge];
      for (let j = 0; j < order.length; j++) {
        const i = order[j], choices = this.eligibleLoot(i, t.window, t);
        if (!choices.length) continue;
        if (j + 1 < order.length) this.pushTasks({...t, players: order.slice(j + 1)});
        if (this.bot(i)) {this.applyLoot(i, choices[0], t); this.checkWinner();}
        else s.prompt = {kind: 'loot', player: i, choices, window: t.window, context: t};
        return;
      }
    } else if (t.type === 'reveal') {
      s.reveal = t.index; s.shown[t.index] = true;
      if (t.index === 0) for (const p of s.players) {p.moved = false; p.block = 0; p.blocked = 0; p.damageTaken = 0;}
      for (let i = 0; i < 2; i++) {
        const p = s.players[i], a = s.plans[i][t.index], d = this.def(a.card);
        a.speed = Number(d.speed) + (t.index === 1 ? p.nextSpeed : 0) - p.slow;
        if (p.hero === 'FRA' && t.index === 1 && p.basicFirst && d.category === 'Hero') a.speed++;
        p.slow = 0;
      }
      this.log(`Action ${t.index + 1} revealed: ${this.def(s.plans[0][t.index].card).name} / ${this.def(s.plans[1][t.index].card).name}.`, 'reveal');
      this.pushTasks({type: 'window', window: 'revealed'}, {type: 'order'}, {type: 'pause', label: `Resolve Action ${t.index + 1}`});
    } else if (t.type === 'order') {
      const speeds = s.plans.map(plan => plan[s.reveal].speed);
      const first = speeds[0] === speeds[1] ? s.edge : speeds[0] > speeds[1] ? 0 : 1;
      this.log(`${s.players[first].name} acts first (${speeds[first]} Speed${speeds[0] === speeds[1] ? ', Edge breaks the tie' : ''}).`, 'speed', first);
      s.queue.push({type: 'window', window: 'beforeCard', actor: first}, {type: 'card', actor: first}, {type: 'pause', label: 'Resolve the slower card'}, {type: 'window', window: 'beforeCard', actor: 1 - first}, {type: 'card', actor: 1 - first}, {type: 'pause', label: s.reveal === 0 ? 'Between reveals' : 'Finish the round'}, {type: 'endReveal'});
    } else if (t.type === 'card') this.resolveCard(t.actor);
    else if (t.type === 'attackRange') {
      const a = s.attack;
      if (this.range() < a.min || this.range() > a.max) {
        a.missed = true; this.log(`${a.name} misses at Range ${this.range()}.`, 'miss', a.actor);
        const p = s.players[1 - a.actor]; if (p.warning) p.trait = 1;
      } else this.pushTasks({type: 'window', window: 'beforeDamage', actor: a.actor}, {type: 'window', window: 'reaction', actor: a.actor}, {type: 'attackDamage'});
    } else if (t.type === 'attackDamage') this.attackDamage();
    else if (t.type === 'force') this.force(t);
    else if (t.type === 'finishCard') this.finishCard(t.actor);
    else if (t.type === 'endReveal') this.endReveal();
    else if (t.type === 'beginSecond') {
      s.reveal = 1;
      for (const p of s.players) {p.usedLoot = false; p.block = 0; p.counters = []; p.blocked = 0; p.damageTaken = 0; p.moved = false; p.warning = false; p.painkiller = false;}
      this.pushTasks({type: 'window', window: 'between'}, {type: 'reveal', index: 1});
    } else if (t.type === 'delayedAttack') {
      const p = s.players[t.actor];
      if (p.blocked > 0) {this.move(t.actor, 1, 'toward');this.attack(t.actor, this.def(`${p.hero}-SP1`), {damage: 4, range: '1', push: 2});}
    }
  }
  resolveCard(i) {
    const s = this.s, p = s.players[i], op = s.players[1 - i], a = s.plans[i][s.reveal], d = this.def(a.card), name = d.name;
    this.log(`${p.name} resolves ${name}.`, 'card', i);
    if (s.reveal === 1 && p.adrenaline) {this.move(i, 1, 'free', false, true);p.adrenaline = false;}
    p.remedyBonus = null;
    if (p.hero === 'SHE' && p.trait && a.opts.trait) {
      const choice = a.opts.remedy;
      if (choice === 'move' || choice === 'block' && d.block || choice === 'damage' && d.damage) {
        p.trait--; p.remedyBonus = choice;
        if (choice === 'move') this.move(i, 1, 'free');
      }
    }
    const b = (n, round = false) => this.block(i, n + (p.remedyBonus === 'block' ? 1 : 0), round);
    const heal = n => this.heal(i, n);
    let extra = {}, doAttack = Boolean(d.damage);
    switch (name) {
      case 'Quick Jab': break;
      case 'Heavy Blow': extra.ignore = 1; break;
      case 'Lunge': this.move(i, 2, 'toward', false, true); break;
      case 'Sweep': extra.push = a.opts.push ? 1 : 0; break;
      case 'Shove': extra.push = a.opts.push ? 2 : 0; break;
      case 'Advance': case 'Run-Up': this.move(i, 2, 'toward', false, true); break;
      case 'Backstep': this.move(i, 2, 'away', false, true); b(1); break;
      case 'Guard': b(2); break;
      case 'Throwing Stone': break;
      case 'Counter': b(2); p.counters.push(1); break;
      case 'Feint': this.move(i, 1); if (s.reveal === 0) p.nextSpeed += 2; break;
      case 'Brace': b(3, true); p.immunePush = true; break;
      case 'Shoulder Charge': this.move(i, 1, 'toward'); extra.push = 1; extra.follow = a.opts.follow; break;
      case 'Hammer Drop': break;
      case 'Cragcruncher Sweep': extra.push = 2; break;
      case 'Plant Your Feet': b(3, true); p.planted = true; break;
      case 'Leap Smash': this.move(i, 2, 'toward', false, true); break;
      case 'Backbreaker': if ([1, 7].includes(op.pos)) {extra.bonus = 2; extra.ignore = 2;} break;
      case 'Overrun': {const old = p.pos; this.move(i, 3, 'free', false, true); if ((old - op.pos) * (p.pos - op.pos) < 0) this.pushTasks({type: 'window', window: 'force', actor: i, target: 1 - i, amount: 1, dir: Math.sign(p.pos - old), effect: ++s.effect}, {type: 'force', actor: i, target: 1 - i, amount: 1, dir: Math.sign(p.pos - old), effect: s.effect}); break;}
      case 'Vanish': this.move(i, 1); p.trait = 1; break;
      case 'Shadow Step': {const old = p.pos;this.move(i, 2, 'free', false, true);if ((old - op.pos) * (p.pos - op.pos) < 0) p.trait = 1;break;}
      case 'Backstab': extra.ignore = 1; if (p.crossed) extra.bonus = 2; break;
      case 'Throwing Knives': break;
      case 'Feinting Slash': extra.onHit = 'dodge'; break;
      case 'Pickpocket': extra.onHit = 'steal1'; break;
      case 'Smoke Veil': b(2); p.veilStartBlocked=p.blocked; p.delayed.push('veil'); break;
      case 'Poisoned Blade': extra.ignore = 2; break;
      case 'Quick Shot': case 'Power Shot': break;
      case 'Pinning Arrow': extra.onHit = 'pin'; break;
      case 'Reposition': this.move(i, 2, 'away', false, true); if (this.range() >= 3) p.trait = 1; break;
      case 'Point Blank': extra.push = 2; break;
      case 'Grapple Arrow': extra.pull = 1; break;
      case 'Volley': extra.ignore = 1; break;
      case "Jasper's Warning": b(2); p.warning = true; break;
      case 'Palm Strike': extra.push = a.opts.push ? 1 : 0; break;
      case 'Flowing Step': this.move(i, 2, 'free', false, true); if (this.range() === 1) p.nextDamage++; break;
      case 'Coin Toss': if (a.opts.coin && p.coins) {this.coin(i, -1); extra.bonus = 2;} break;
      case 'Low Sweep': extra.undodgeable = true; extra.onHit = 'pin'; break;
      case 'Bribe': {const pay = a.opts.coin && p.coins; if (pay) this.coin(i, -1); b(pay ? 4 : 2); break;}
      case 'Meditate': b(2, true); p.nextIgnore = (p.nextIgnore || 0) + 2; break;
      case 'Empty Hand': if (!p.loot.length) extra.bonus = 2; break;
      case 'Collection Plate': extra.onHit = 'collection'; break;
      case 'Shield Up': b(4); break;
      case 'Advance Behind Shield': this.move(i, 1, 'toward'); b(2); break;
      case 'Shield Bash': if (p.trait) extra.bonus = 1; if (p.block + p.roundBlock > 0) extra.push = 1; break;
      case 'Hold the Line': b(3, true); p.immunePush = true; break;
      case 'Reversal': b(2); p.counters.push(2); break;
      case 'Body Check': this.move(i, 1, 'toward'); extra.push = 2; extra.follow = a.opts.follow; break;
      case 'Guard Break': extra.ignore = 2; break;
      case 'Wallop': extra.push = 1; break;
      case 'Bandage Up': heal(2); break;
      case 'Sedative Dart': extra.onHit = 'sedate'; break;
      case 'Sterile Field': b(3); break;
      case 'Scalpel': extra.ignore = 99; break;
      case 'Adrenaline': this.move(i, 1); if (s.reveal === 0) {p.nextSpeed += 2; p.adrenaline = true;} break;
      case 'Painkiller': b(2); p.painkiller = true; p.painkillerHeal = 1; break;
      case 'Defibrillator': if (p.hp <= 8) extra.bonus = 2; break;
      case 'Diagnosis':
        if (s.reveal === 0) {p.peek = [1];this.move(i, 1);this.chooseOrBot(i, 'peek', []);}
        else {this.draw(i, 1);this.chooseOrBot(i, 'discard', p.hand.map(c => c.uid));} break;
      case 'FULL SEND': this.move(i, 2, 'toward', false, true); extra.push = 2; break;
      case 'NOTHING PERSONAL': {
        const sign = this.direction(i, a.opts.direction);const candidates = [op.pos + sign, op.pos - sign].filter(v => v >= 1 && v <= 7);
        this.relocate(i, candidates[0]);p.trait = 1;extra.ignore = 1;break;
      }
      case 'JASPER, NOW!': extra.ignore = 2; break;
      case 'DIVINE AUDIT': this.move(i, 1); extra.onHit = 'audit'; break;
      case 'ABSOLUTELY NOT':
        b(5); doAttack = false;
        if (s.plans[1 - i][s.reveal].done) this.pushTasks({type: 'delayedAttack', actor: i});
        else p.specialCounter = true; break;
      case 'STAT!': heal(2); this.move(i, 2, 'free', false, true); extra.ignore = 2; break;
      default: throw Error(`Unimplemented card: ${name}`);
    }
    this.s.queue.splice(this.s.queue.findIndex(t => t.type === 'pause') < 0 ? this.s.queue.length : this.s.queue.findIndex(t => t.type === 'pause'), 0, {type: 'finishCard', actor: i});
    if (doAttack) this.attack(i, d, extra);
    this.checkWinner();
  }
  attack(i, d, extra = {}) {
    const p = this.s.players[i]; const r = this.printedRange(d);
    let bonus = extra.bonus || 0;
    bonus += p.nextDamage; p.nextDamage = 0;
    if (p.planted) {bonus++; p.planted = false;}
    if (p.hero === 'FRA' && this.s.reveal === 1 && p.basicFirst && d.category === 'Hero') bonus += 2;
    let max = r[1];
    if (p.hero === 'ALF' && p.trait && this.opts(i).trait) {
      const choice = this.opts(i).aim;
      if (choice === 'range' || this.range() >= 3) {p.trait = 0; if (choice === 'range') max++;else bonus += 2;}
    }
    if (p.remedyBonus === 'damage') {bonus += 2;p.remedyBonus = null;}
    const ignore = (extra.ignore || 0) + (p.nextIgnore || 0);p.nextIgnore = 0;
    const penalty = p.attackPenalty; p.attackPenalty = 0;
    this.s.attack = {actor: i, id: d.id, name: d.name, damage: Number(extra.damage ?? d.damage) + bonus - penalty + (p.protein || 0),
      min: r[0], max, ignore: p.ignoreAll ? 99 : ignore, follow: extra.follow, push: extra.push || 0, pull: extra.pull || 0,
      onHit: extra.onHit, undodgeable: extra.undodgeable, reduction: 0, effect: ++this.s.effect};
    p.protein = 0;p.ignoreAll = false;
    this.pushTasks({type: 'window', window: 'beforeRange', actor: i}, {type: 'attackRange'});
  }
  attackDamage() {
    const a = this.s.attack, i = a.actor, p = this.s.players[i], op = this.s.players[1 - i];
    const potentialDamage=Math.max(0,a.damage)+(p.hero==='SMA'?p.trait:0)+(p.hero==='HEL'&&p.trait&&this.opts(i).trait?2:0);
    const potentialBlock=Math.max(0,op.block+op.roundBlock+(a.tempBlock||0)-a.ignore);
    if (op.hero === 'RAV' && op.trait && this.opts(1 - i).trait && !a.undodgeable && potentialDamage>potentialBlock+a.reduction) {
      op.trait = 0; op.nextIgnore = (op.nextIgnore || 0) + 1; this.log(`${op.name} spends Dodge: cancels ${a.name}.`, 'dodge', 1 - i);this.move(1 - i, 1);return;
    }
    // Momentum is applied only to a hit; fully blocked/dodged attacks preserve it.
    const block = Math.max(0, op.block + op.roundBlock + (a.tempBlock || 0) - a.ignore);
    let damage = Math.max(0, a.damage);
    if (p.hero === 'SMA') {damage += p.trait;if (damage > block + a.reduction) p.trait = 0;}
    if (p.hero === 'HEL' && p.trait && this.opts(i).trait) {damage += 2;a.push++;p.trait = 0;}
    const prevented = Math.min(damage, block);
    // Spend only Block that actually absorbed damage; bypassed Block remains.
    let spend=Math.max(0,prevented-(a.tempBlock||0));
    const revealSpend=Math.min(op.block,spend);op.block-=revealSpend;spend-=revealSpend;
    op.roundBlock=Math.max(0,op.roundBlock-spend);
    op.blocked += prevented;
    if (op.hero === 'HEL' && prevented >= 2 && !op.resolveEarned) {op.trait = 1;op.resolveEarned = true;this.log(`${op.name} gains Resolve.`, 'trait', 1 - i);}
    const loss = this.lose(1 - i, Math.max(0, damage - block - a.reduction), i, a.effect);
    if (!loss) this.log(`${a.name} deals no HP loss.`, 'block', 1 - i);
    if (loss) {
      switch (a.onHit) {
        case 'dodge': p.trait = 1;break;
        case 'steal1': if (op.coins) {this.coin(1 - i, -1);this.coin(i, 1);}break;
        case 'poison': op.attackPenalty += 2;break;
        case 'pin': op.movePenalty++;break;
        case 'sedate': {
          const pending=this.s.plans[1-i]?.[this.s.reveal];
          if(pending&&!pending.done)pending.speed-=2;
          else if(this.s.reveal===0)op.slow+=2;
          break;
        }
        case 'collection': if (op.coins > p.coins) {this.coin(1 - i, -1);this.coin(i, 1);}break;
        case 'audit': {
          if (!op.coins) this.lose(1 - i, 1, i, a.effect);
          else {const n = Math.min(2, op.coins);this.coin(1 - i, -n);this.coin(i, n);}break;
        }
      }
      const n = a.push || a.pull;
      if (n) {
        const t = {actor: i, target: 1 - i, amount: n, dir: Math.sign(op.pos - p.pos) * (a.pull ? -1 : 1), effect: a.effect, follow: a.follow};
        this.pushTasks({type: 'window', window: 'force', ...t}, {type: 'force', ...t});
      }
    }
    if (op.painkiller && prevented >= 2) this.heal(1 - i, op.painkillerHeal || 1);
    if (!loss && prevented > 0 && prevented >= damage && this.range() === 1) for (const n of op.counters) this.lose(i, n, 1 - i, ++this.s.effect);
    if (a.smokeMove) this.move(1 - i, 1);
    this.checkWinner();
  }
  force(t) {
    const p = this.s.players[t.target];
    if (p.immunePush) {this.log(`${p.name} cannot be pushed or pulled.`, 'block', t.target);return;}
    if (p.forcePrevent) {p.forcePrevent=false;this.log(`${p.name} prevents the forced movement.`, 'block', t.target);return;}
    let amount = t.amount - (p.forceReduce || 0);p.forceReduce = 0;
    if (p.reverseForce) {amount = amount - 2 * Math.min(2, Math.max(0, amount));p.reverseForce = false;}
    if (!amount) return;
    const dir = Math.sign(amount) * t.dir, n = Math.abs(amount);
    const wall = p.pos + n * dir < 1 || p.pos + n * dir > 7;
    const old=p.pos;this.move(t.target, n, dir, true);
    if(t.follow && Math.sign(p.pos-old)===t.dir) this.move(t.actor,Math.abs(p.pos-old),'toward');
    if (wall) {this.log('Wall Slam!', 'slam', t.target);this.lose(t.target, 1, t.actor, t.effect);}
    this.checkWinner();
  }
  finishCard(i) {
    const p = this.s.players[i], op = this.s.players[1 - i], a = this.s.plans[i][this.s.reveal], d = this.def(a.card);
    a.done = true;
    if (d.category === 'Basic') {
      this.coin(i, 1); if (this.s.reveal === 0) p.basicFirst = true;
      this.log(`${p.name} earns 1 Coin from a Basic card.`, 'coin', i);
      this.pushTasks({type: 'window', window: 'afterBasic', actor: i, card: a.card});
    }
    if (d.category === 'Special') p.usedSpecial++;
    if (p.hero === 'SHE' && (d.block || /Heal/.test(d.text))) p.trait = Math.min(3, p.trait + 1);
    if (op.specialCounter) {op.specialCounter = false;this.pushTasks({type: 'delayedAttack', actor: 1 - i});}
  }
  endReveal() {
    for (let i = 0; i < 2; i++) {
      const p = this.s.players[i];
      for (const delayed of p.delayed) {
        if (delayed === 'veil') {this.move(i, 1);if (p.blocked>(p.veilStartBlocked||0)) p.trait = 1;}
      }
      p.delayed = [];
      if (p.hero === 'ALF' && !p.moved) p.trait = 1;
    }
    if (this.s.reveal === 0) this.pushTasks({type: 'beginSecond'});
    else {
      this.s.phase = 'shop';this.s.beat = 'Buy secret Loot';this.s.shopDone = [false, false];
      for (let i = 0; i < 2; i++) if (this.bot(i)) this.shop(i, true);
    }
  }
  eligibleLoot(i, window, t = {}) {
    const p = this.s.players[i], a = this.s.attack;
    if (p.usedLoot) return [];
    return p.loot.filter(id => {
      const n = Number(id.slice(-3));
      if (window === 'scout') return n === 16;
      if (window === 'between') return [2,3,6,7,8,12,15,19,23].includes(n) && (n !== 7 || this.s.lootDiscard.length);
      if (window === 'revealed') return [1,13,18].includes(n) && (n !== 18 || Boolean(this.def(this.s.plans[i][this.s.reveal].card).damage));
      if (window === 'beforeCard') return t.actor === i && [4,14].includes(n) && (n !== 14 || Boolean(this.def(this.s.plans[i][this.s.reveal].card).damage));
      if (window === 'beforeRange') return t.actor === i && [17,20].includes(n);
      if (window === 'beforeDamage') return t.actor === i && this.range() === 1 && [5,21].includes(n);
      if (window === 'reaction') return t.actor !== i && [9,11].includes(n);
      if (window === 'force') return t.target === i && [10,22].includes(n) && !p.immunePush;
      if (window === 'afterBasic') return t.actor === i && n === 24;
      return false;
    });
  }
  chooseOrBot(i, kind, choices, extra = {}) {
    if (this.bot(i)) {
      if (kind === 'space') this.relocate(i, this.s.players[i].hero === 'ALF' ? choices.sort((a,b) => Math.abs(b-this.s.players[1-i].pos)-Math.abs(a-this.s.players[1-i].pos))[0] : choices.sort((a,b) => Math.abs(a-this.s.players[1-i].pos)-Math.abs(b-this.s.players[1-i].pos))[0]);
      if (kind === 'discard') this.discardChoice(i, choices[0]);
      if (kind === 'retrieve') {this.s.players[i].loot.push(choices[0]);this.s.lootDiscard.splice(this.s.lootDiscard.indexOf(choices[0]),1);}
      // The bot keeps its committed Action 2 rather than consulting the opponent's hidden hand.
    } else this.s.prompt = {kind, player: i, choices, ...extra};
  }
  playLoot(id) {
    const prompt = this.s.prompt;
    if (prompt?.kind !== 'loot' || !prompt.choices.includes(id)) throw Error('Loot is not available at this timing.');
    this.s.prompt = null; this.applyLoot(prompt.player, id, prompt.context);
    if (!this.s.prompt && !this.checkWinner()) this.advance();
  }
  skipPrompt() {
    const prompt = this.s.prompt;
    if (!prompt) return;
    if (prompt.kind === 'discard') return this.choose(prompt.choices[0]);
    if (prompt.kind === 'space') return this.choose(prompt.choices[0]);
    this.s.prompt = null; this.advance();
  }
  choose(value) {
    const q = this.s.prompt; if (!q) return;
    if (!q.choices.includes(value) && !(q.kind === 'replace' && value === null)) throw Error('Invalid choice.');
    this.s.prompt = null; const p = this.s.players[q.player];
    if (q.kind === 'space') this.relocate(q.player, value);
    if (q.kind === 'discard') this.discardChoice(q.player, value);
    if (q.kind === 'retrieve') {p.loot.push(value);this.s.lootDiscard.splice(this.s.lootDiscard.indexOf(value),1);}
    if (q.kind === 'replace' && value !== null) {
      const replacement = this.available(q.player).find(c => c.uid === value);
      const old = this.s.plans[q.player][1].card;
      if (replacement.uid.startsWith('special')) p.specialReady = false;
      else p.hand = p.hand.filter(c => c.uid !== value);
      if (old.uid.startsWith('special')) p.specialReady = true;else p.hand.push(old);
      this.s.plans[q.player][1].card = replacement;
      this.log(`${p.name} replaces Action 2.`, 'card', q.player);
    }
    this.advance();
  }
  discardChoice(i, uid) {
    const p = this.s.players[i], c = p.hand.find(c => c.uid === uid);
    if (c) {p.hand = p.hand.filter(x => x.uid !== uid);p.discard.push(c);}
  }
  applyLoot(i, id, context = {}) {
    const p = this.s.players[i], op = this.s.players[1 - i], n = Number(id.slice(-3)), a = this.s.attack;
    const index = p.loot.indexOf(id);if (index < 0 || p.usedLoot) throw Error('Cannot use that Loot.');
    p.loot.splice(index, 1);p.usedLoot = true;
    const priorDiscard = [...this.s.lootDiscard];this.s.lootDiscard.push(id);
    this.log(`${p.name} uses ${this.def(id).name}.`, 'loot', i);
    switch (n) {
      case 1: this.s.plans[i][this.s.reveal].speed += 3;break;
      case 2: case 3: case 15: this.attack(i, {...this.def(id), damage: n === 15 ? '4' : '3', range: n === 2 ? '1-2' : n === 3 ? '3-4' : '2-4'}, {ignore:n===3?1:0});break;
      case 4: this.move(i, 2, 'free', false, true);break;
      case 5: a.damage += 2;break;
      case 6: {
        const effect = ++this.s.effect;this.lose(i, 2, i, effect);this.lose(1-i, 2, i, effect);
        for (let k=0;k<2;k++) {const pos=this.s.players[k].pos;this.move(k,1,pos<4?-1:pos>4?1:this.direction(k,this.opts(k).direction),true);}break;
      }
      case 7: if (priorDiscard.length) this.chooseOrBot(i,'retrieve',priorDiscard);break;
      case 8: this.coin(i,3);this.gainFury(i);break;
      case 9: a.reduction += 2;break;
      case 10: p.forcePrevent = true;p.nextDamage++;break;
      case 11: a.tempBlock = (a.tempBlock||0)+4;a.smokeMove=true;break;
      case 12: this.gainFury(i,2);break;
      case 13: this.chooseOrBot(i,'space',[1,2,3,4,5,6,7].filter(v=>v!==op.pos&&v!==p.pos));break;
      case 14: p.ignoreAll=true;break;
      case 16: p.peek=[0,1];this.chooseOrBot(i,'peek',[]);break;
      case 17: {
        const t={actor:i,target:1-i,amount:Math.min(2,this.opts(i).steps),dir:Math.sign(p.pos-op.pos),effect:++this.s.effect};
        this.pushTasks({type:'window',window:'force',...t},{type:'force',...t});break;
      }
      case 18: this.s.plans[i][this.s.reveal].speed=1;p.protein=3;break;
      case 19: p.peek=[1];this.chooseOrBot(i,'replace',this.available(i).map(c=>c.uid));break;
      case 20: a.max+=2;break;
      case 21: a.damage++;a.push+=2;break;
      case 22: p.reverseForce=true;break;
      case 23: this.heal(i,2);p.nextDamage++;break;
      case 24: p.hand.push(context.card);this.s.plans[i][this.s.reveal].reclaimed=true;break;
      default: throw Error(`Unimplemented Loot: ${id}`);
    }
  }
  shop(i, buy) {
    if (this.s.phase !== 'shop' || this.s.shopDone[i]) throw Error('Loot purchase is closed.');
    const p=this.s.players[i];
    if (buy && p.coins>=4 && p.loot.length<2) {
      if (!this.s.lootDeck.length) {this.s.lootDeck=this.shuffle(this.s.lootDiscard);this.s.lootDiscard=[];}
      if (this.s.lootDeck.length) {this.coin(i,-4);p.loot.push(this.s.lootDeck.pop());p.lootBought++;this.log(`${p.name} buys secret Loot for 4 Coins.`, 'coin',i);}
    }
    this.s.shopDone[i]=true;
  }
  nextRound() {
    if (this.s.phase!=='shop'||!this.s.shopDone.every(Boolean)) throw Error('Both Heroes must finish the Loot phase.');
    for(let i=0;i<2;i++) {
      const p=this.s.players[i];
      for(const a of this.s.plans[i]) if(this.def(a.card).category!=='Special'&&!a.reclaimed) p.discard.push(a.card);
      this.draw(i,Math.max(0,5-p.hand.length));
      Object.assign(p,{block:0,roundBlock:0,usedLoot:false,moved:false,damageTaken:0,blocked:0,resolveEarned:false,crossed:false,immunePush:false,planted:false,nextDamage:0,nextIgnore:0,forcePrevent:false,nextSpeed:0,slow:0,movePenalty:0,attackPenalty:0,counters:[],delayed:[],basicFirst:false,reclaimed:[],peek:[],warning:false,painkiller:false,protein:0,ignoreAll:false,adrenaline:false,specialCounter:false});
      if(['SMA','RAV'].includes(p.hero))p.trait=0;
    }
    this.s.round++;this.s.edge=1-this.s.edge;this.s.reveal=0;this.s.shown=[false,false];this.s.plans=[null,null];this.s.committed=[false,false];this.s.phase='program';this.s.beat='Program two cards';this.s.attack=null;
    this.log(`Round ${this.s.round}. Edge passes to ${this.s.players[this.s.edge].name}.`,'round');this.prepareBot();
  }
}
