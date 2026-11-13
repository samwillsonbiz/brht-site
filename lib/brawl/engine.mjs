// v0.5 deterministic rules. State and queued choices are JSON serializable.
export class Brawl {
 constructor(data,c={}){
  this.data=data;this.defs=Object.fromEntries(data.cards.map(d=>[d.id,d]));
  this.s={version:5,rng:c.seed??Date.now()%2147483646+1,mode:c.mode||'solo',round:1,phase:'shop',reveal:0,edge:0,uid:0,effect:0,log:[],queue:[],prompt:null,shown:[false,false],plans:[null,null],committed:[false,false],shopDone:[false,false],lootDeck:[],lootDiscard:[],players:[],winner:null,beat:'Start-round Loot purchase',left:1,right:7};this.s.edge=this.random()<.5?0:1;
  for(let i=0;i<2;i++){
   const hero=c.heroes?.[i]||['SMA','RAV'][i],h=data.heroes.find(h=>h.id===hero);if(!h)throw Error('Unknown Hero.');
   const pool=data.cards.filter(d=>d.category==='Hero'&&d.hero===h.name),chosen=c.chosen?.[i]||pool.filter(d=>d.starter).map(d=>d.id),basics=c.basics?.[i]||Brawl.defaultBasics(data);
   if(!Brawl.validLoadout(chosen,5,pool.map(d=>d.id)))throw Error('Choose five Hero cards, maximum two copies of each.');
   if(!Brawl.validLoadout(basics,10,data.cards.filter(d=>d.category==='Basic').map(d=>d.id)))throw Error('Choose ten Basic cards, maximum two copies of each.');
   this.s.players.push({hero,name:h.name,pos:i?6:2,facing:i?-1:1,hp:18,coins:2,fury:0,skillUnlocked:false,specialReady:false,ultimate:false,deck:this.shuffle([...basics,...chosen].map(id=>this.instance(id))),discard:[],hand:[],loot:[],trait:0,block:0,roundBlock:0,wardBlock:0,usedLoot:false,usedSpecial:0,lootBought:0,peek:[],scouted:[],moved:false,blocked:0,blockedRound:0,resolveEarned:false,painGained:0,nextDamage:0,nextSpeed:0,nextIgnore:0,slow:0,movePenalty:0,counters:[],delayed:[],basicFirst:false,actionHits:[false,false],rhythmUsed:false,ravenUltUsed:false,alfUltUsed:false,miracleUsed:false});
  }
  this.s.lootDeck=this.shuffle(data.cards.filter(d=>d.category==='Loot').map(d=>d.id));for(let i=0;i<2;i++){this.draw(i,5);if(this.bot(i))this.shop(i,true);}this.log('The Brawl begins. Purchase Loot, then program two cards.');
 }
 static validLoadout(a,n,pool){return Array.isArray(a)&&a.length===n&&a.every(id=>pool.includes(id)&&a.filter(x=>x===id).length<=2);}
 static defaultBasics(d){return d.basicStarters.map(n=>d.cards.find(c=>c.category==='Basic'&&c.name===n).id);}
 static restore(data,s){if(s.version!==5||!s.players?.length)throw Error('This saved match uses older rules. Start a new v0.5 Brawl.');const g=Object.create(Brawl.prototype);g.data=data;g.defs=Object.fromEntries(data.cards.map(d=>[d.id,d]));g.s=structuredClone(s);return g;}
 random(){this.s.rng=this.s.rng*16807%2147483647;return(this.s.rng-1)/2147483646;}
 shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 instance(id){return{id,uid:`c${++this.s.uid}`};}
 def(d){return this.defs[typeof d==='string'?d:d.id];}
 hero(i){return this.data.heroes.find(h=>h.id===this.s.players[i].hero);}
 range(){return Math.abs(this.s.players[0].pos-this.s.players[1].pos);}
 bot(i){return this.s.mode==='bots'||this.s.mode==='solo'&&i===1;}
 log(message,kind='info',player=null){this.s.log.push({message,kind,player,round:this.s.round,reveal:this.s.reveal+1});if(this.s.log.length>250)this.s.log.shift();}
 draw(i,n){const p=this.s.players[i];while(n-->0){if(!p.deck.length){p.deck=this.shuffle(p.discard);p.discard=[];}if(!p.deck.length)break;p.hand.push(p.deck.pop());}}
 available(i){return[...this.s.players[i].hand];}
 options(o={}){return{direction:'toward',steps:3,path:'',aim:'damage',trait:true,remedy:'damage',coin:true,push:true,follow:true,...o};}
 opts(i){return this.s.plans[i]?.[this.s.reveal]?.opts||this.options();}
 direction(i,d='toward'){const n=Math.sign(this.s.players[1-i].pos-this.s.players[i].pos);return d==='left'?-1:d==='right'?1:d==='away'?-n:n;}
 behind(i){const p=this.s.players[i],op=this.s.players[1-i];return Math.sign(p.pos-op.pos)===-op.facing;}
 move(i,n,d='free',forced=false,optional=false){
  const p=this.s.players[i],op=this.s.players[1-i],o=this.opts(i);if(p.noMove&&!forced)return 0;n=Math.max(0,n);if(optional&&!forced)n=Math.min(n,o.steps);if(!forced){n=Math.max(0,n-(p.movePenalty||0));p.movePenalty=0;}
  const dir=typeof d==='number'?d:this.direction(i,d==='free'?o.direction:d),old=p.pos,path=!forced&&d==='free'?o.path.toUpperCase():'';if(path)n=Math.min(n,path.length);let pos=old,last=old;
  for(let k=0;k<n;k++){const ch=path[k];if(ch==='T'){p.facing=-p.facing;this.log(`${p.name} turns ${p.facing===1?'right':'left'}.`,'move',i);continue;}const step=ch==='L'?-1:ch==='R'?1:dir,next=pos+step;if(next<this.s.left||next>this.s.right)break;if(d==='toward'&&Math.abs(next-op.pos)>=Math.abs(pos-op.pos))break;pos=next;if(pos!==op.pos)last=pos;}
  p.pos=last;if(last!==old){p.moved=true;p.planted=false;p.crossed=(old-op.pos)*(last-op.pos)<0;this.log(`${p.name} moves ${old} → ${last}.`,'move',i);if(!forced)this.ravenMovement(i,p.crossed);}return Math.abs(last-old);
 }
 relocate(i,pos){const p=this.s.players[i],op=this.s.players[1-i];if(!Number.isInteger(pos)||pos<this.s.left||pos>this.s.right||pos===op.pos||p.noMove)return;const old=p.pos;p.pos=pos;if(pos!==old){p.moved=true;p.planted=false;this.log(`${p.name} relocates ${old} → ${pos}.`,'move',i);this.ravenMovement(i,(old-op.pos)*(pos-op.pos)<0);}}
 ravenMovement(i,crossed){const p=this.s.players[i];if(p.hero==='RAV'&&p.ultimate&&!p.ravenUltUsed&&(crossed||this.behind(i))){p.ravenUltUsed=true;p.trait=1;p.backstabBonus=1;this.log('Living Shadow sets Dodge and primes Backstab.','trait',i);}}
 coin(i,n){const p=this.s.players[i];p.coins=Math.max(0,Math.min(8,p.coins+n));}
 gainFury(i,n=1){const p=this.s.players[i];if(p.hp<=0)return;p.fury=Math.min(5,p.fury+n);if(p.fury>=3&&!p.skillUnlocked){p.skillUnlocked=true;const skill=this.instance(p.hero+'-SP1');p.freshSkill=skill.uid;p.hand.push(skill);this.log(`${p.name} unlocks ${this.def(p.hero+'-SP1').name}; added to hand.`,'fury',i);}if(p.fury>=5&&!p.ultimate)p.ultimatePending=true;}
 lose(i,n,source,effect){const p=this.s.players[i],loss=Math.min(p.hp,Math.max(0,n));if(!loss)return 0;p.hp-=loss;this.log(`${p.name} loses ${loss} HP.`,'damage',i);if(p.hero==='SMA'&&p.lastPainEffect!==effect){p.lastPainEffect=effect;const gain=Math.min(1,2-p.painGained);p.painGained+=gain;p.trait+=gain;}if(source!==i&&p.lastFuryEffect!==effect){p.lastFuryEffect=effect;this.gainFury(i);}return loss;}
 heal(i,n,heroCard=false){const p=this.s.players[i],gain=Math.max(0,Math.min(n,18-p.hp));p.hp+=gain;this.log(`${p.name} heals ${gain} HP.`,'heal',i);if(gain&&heroCard&&p.hero==='SHE'&&p.ultimate&&!p.miracleUsed){p.miracleUsed=true;p.trait=Math.min(3,p.trait+1);}return gain;}
 block(i,n,round=false){this.s.players[i][round?'roundBlock':'block']+=n;this.log(`${this.s.players[i].name} gains Block ${n}${round?' until end of round':''}.`,'block',i);}
 ultimates(){for(let i=0;i<2;i++){const p=this.s.players[i];if(!p.ultimatePending||p.hp<=0)continue;p.ultimatePending=false;p.ultimate=true;this.log(`${p.name} unleashes ${this.hero(i).ultimate.name}!`,'fury',i);if(p.hero==='SMA')this.closeWalls();if(p.hero==='HEL')this.block(i,2,true);if(p.hero==='SHE'){this.heal(i,2);p.trait=Math.min(3,p.trait+1);}}}
 closeWalls(){if(this.s.right-this.s.left<4)return;this.s.left++;this.s.right--;const [a,b]=[0,1].sort((a,b)=>this.s.players[a].pos-this.s.players[b].pos);this.s.players[a].pos=Math.max(this.s.left,Math.min(this.s.right-1,this.s.players[a].pos));this.s.players[b].pos=Math.max(this.s.players[a].pos+1,Math.min(this.s.right,this.s.players[b].pos));this.log(`Closing Walls: active spaces ${this.s.left}–${this.s.right}.`,'move');}
 checkWinner(){if(!this.s.players.some(p=>p.hp<=0))return false;for(const plan of this.s.plans)for(const a of plan||[])if(a.loot&&!a.lootUsed){this.s.lootDiscard.push(a.loot);a.lootUsed=true;}this.s.winner=this.s.players.every(p=>p.hp<=0)?'draw':this.s.players[0].hp<=0?1:0;this.s.phase='over';this.s.prompt=null;this.s.queue=[];this.log(this.s.winner==='draw'?'Double knockout!':`${this.s.players[this.s.winner].name} wins the Brawl!`,'victory');return true;}
 commit(i,choices){if(this.s.phase!=='program'||this.s.committed[i])throw Error('Programming is closed.');if(!Array.isArray(choices)||choices.length!==2||choices[0].uid===choices[1].uid)throw Error('Choose two different card instances.');const p=this.s.players[i],plan=choices.map(c=>{const card=p.hand.find(a=>a.uid===c.uid);if(!card)throw Error('That card is not in your hand.');return{card:{...card},opts:this.options(c.opts),done:false,speed:0,loot:null};});this.s.plans[i]=plan;this.s.committed[i]=true;p.freshSkill=null;p.hand=p.hand.filter(c=>!plan.some(a=>a.card.uid===c.uid));if(this.s.committed.every(Boolean)){this.s.phase='resolve';this.s.beat='Reveal Action 1';this.s.queue=[{type:'reveal',index:0}];}}
 prepareBot(){for(let i=0;i<2;i++)if(this.bot(i)&&!this.s.committed[i])this.commit(i,this.botPlan(i));}
 botPlan(i){const p=this.s.players[i],dist=this.range(),score=c=>{const d=this.def(c),[min,max]=this.printedRange(d),moving=/Move|move/.test(d.text);let v=this.random()*.9+(d.category==='Basic'&&p.coins<4?.8:0);if(d.damage)v+=dist>=min&&dist<=max?Number(d.damage)*1.25+Number(d.speed)*.12:moving?2:-2;if(moving&&dist>(p.hero==='ALF'?3:1))v+=2;if(/Heal/.test(d.text))v+=p.hp<12?1.6:-1;if(d.block)v+=dist<=2?1.2:-.5;if(d.name==='Blood Price')v+=p.fury<5&&p.hp>6?1.2:-5;return v;};const cards=p.hand.map(c=>({c,v:score(c)})).sort((a,b)=>b.v-a.v).slice(0,2).map(x=>x.c);if(cards.length===2&&dist>1&&/Move/.test(this.def(cards[1]).text)&&!/Move/.test(this.def(cards[0]).text))cards.reverse();return cards.map(c=>{const d=this.def(c),away=p.hero==='ALF'&&dist<3;return{uid:c.uid,opts:this.options({direction:away?'away':'toward',steps:away?Math.min(2,3-dist):Math.min(3,Math.max(0,dist-1)),remedy:d.damage?'damage':d.block?'block':'move'})};});}
 printedRange(d){const r=String(d.range||'1').split('-').map(Number);return[r[0],r[1]||r[0]];}
 pushTasks(...t){this.s.queue.unshift(...t);}
 advance(){if(this.s.phase!=='resolve'||this.s.prompt)return;let guard=0;while(this.s.queue.length&&this.s.phase==='resolve'&&!this.s.prompt){if(++guard>300)throw Error('Resolution exceeded safety limit.');const t=this.s.queue.shift();if(t.type==='pause'){this.s.beat=t.label;return;}this.task(t);}}
 task(t){const s=this.s;switch(t.type){
  case 'reveal':s.reveal=t.index;s.shown[t.index]=true;for(const p of s.players){p.usedLoot=false;p.moved=false;p.blocked=0;}this.log(`Action ${t.index+1} revealed: ${s.plans.map(a=>this.def(a[t.index].card).name).join(' / ')}.`,'reveal');this.pushTasks({type:'attach',players:[s.edge,1-s.edge]},{type:'order'},{type:'pause',label:`Resolve Action ${t.index+1}`});break;
  case 'attach':{const[i,...rest]=t.players;if(rest.length)this.pushTasks({type:'attach',players:rest});const choices=this.eligibleLoot(i);if(choices.length){if(this.bot(i))this.applyLoot(i,this.botLoot(i,choices));else s.prompt={kind:'loot',player:i,choices,window:'revealed'};}break;}
  case 'order':{for(let i=0;i<2;i++){const p=s.players[i],a=s.plans[i][s.reveal],d=this.def(a.card),loot=a.loot&&this.def(a.loot).name;let speed=Number(d.speed)+(s.reveal===1?p.nextSpeed:0)-p.slow;if(p.hero==='FRA'&&s.reveal===1&&p.basicFirst&&['Hero','Special'].includes(d.category))speed++;if(loot==='Alarm Clock')speed+=3;if(loot==='Lucky Charm')speed+=2;if(loot==='Protein Shake')speed=1;a.speed=Math.max(1,speed);p.slow=0;}const v=s.plans.map(a=>a[s.reveal].speed),first=v[0]===v[1]?s.edge:v[0]>v[1]?0:1;this.log(`${s.players[first].name} acts first (${v[first]} Speed${v[0]===v[1]?', Initiative breaks tie':''}).`,'speed',first);s.queue.push({type:'package',actor:first},{type:'pause',label:'Resolve the slower card'},{type:'package',actor:1-first},{type:'pause',label:s.reveal===0?'Between reveals':'Finish the round'},{type:'endReveal'});break;}
  case 'package':{const p=s.players[t.actor],a=s.plans[t.actor][s.reveal];Object.assign(p,{wardBlock:0,stunner:false,forcePrevent:false,reverseForce:false,glue:false,currentEffect:++s.effect,cardBonusUsed:false,remedyBonus:null,activeLoot:a.loot,cardHits:0,lootCrossed:false});this.pushTasks(...(a.loot?[{type:'lootBefore',actor:t.actor}]:[]),{type:'card',actor:t.actor},{type:'finishCard',actor:t.actor},{type:'lootAfter',actor:t.actor},{type:'finishPackage',actor:t.actor});break;}
  case 'lootBefore':this.lootBefore(t.actor);this.ultimates();this.checkWinner();break;
  case 'card':{const p=s.players[t.actor],a=s.plans[t.actor][s.reveal];if(s.reveal===1&&p.adrenaline&&!a.adrenalineMoved){a.adrenalineMoved=true;this.pushTasks(t);this.chooseLootMove(t.actor,'Adrenaline follow-up',1);break;}if(p.hero==='SHE'&&p.trait&&a.opts.trait&&a.opts.remedy==='move'&&!a.remedyPrepared){a.remedyPrepared=true;p.trait--;p.remedyBonus='move';this.pushTasks(t);this.chooseLootMove(t.actor,'Remedy',1);break;}this.resolveCard(t.actor);break;}
  case 'hit':this.resolveAttack(t.actor,this.def(t.id),t.extra);if(s.players.some(p=>p.hp<=0))this.finishCard(t.actor);this.checkWinner();break;
  case 'finishCard':this.finishCard(t.actor);break;
  case 'lootAfter':this.lootAfter(t.actor);break;
  case 'finishPackage':{const p=s.players[t.actor],a=s.plans[t.actor][s.reveal];a.done=true;if(a.loot){s.lootDiscard.push(a.loot);a.lootUsed=true;}p.activeLoot=null;p.remedyBonus=null;this.ultimates();this.checkWinner();break;}
  case 'endReveal':this.endReveal();break;
  case 'veilMove':{const p=s.players[t.actor];if(p.blocked>(p.veilStart||0))p.trait=1;this.chooseLootMove(t.actor,'Smoke Veil',1);break;}
  case 'endRevealFinish':this.endRevealFinish();break;
  case 'second':this.pushTasks({type:'reveal',index:1});break;
  default:throw Error('Unknown task '+t.type);
 }}
 resolveCard(i){const s=this.s,p=s.players[i],op=s.players[1-i],a=s.plans[i][s.reveal],d=this.def(a.card);this.log(`${p.name} resolves ${d.name}.`,'card',i);
  if(p.hero==='SHE'&&p.trait&&a.opts.trait&&!a.remedyPrepared){const ch=a.opts.remedy;if(ch==='move'||ch==='block'&&d.block||ch==='damage'&&d.damage){p.trait--;p.remedyBonus=ch;if(ch==='move')this.move(i,1);}}
  const b=(n,r=false)=>this.block(i,n+(p.remedyBonus==='block'?1:0),r),heal=n=>this.heal(i,n,['Hero','Special'].includes(d.category));let extra={},attacks=d.damage?1:0;
  switch(d.name){
   case 'Quick Strike':case 'Quick Shot':case 'Power Shot':case 'Hammer Drop':case 'Throwing Knives':break;
   case 'Heavy Strike':extra.ignore=1;break;
   case 'Step':this.move(i,2,'free',false,true);break;
   case 'Quick Step':this.move(i,1);break;
   case 'Dash':this.move(i,3,'free',false,true);break;
   case 'Pivot':p.facing=-p.facing;this.move(i,1,'free',false,true);break;
   case 'Lunge':this.move(i,2,'free',false,true);break;
   case 'Sweep':extra.push=a.opts.push?1:0;break;
   case 'Shove':extra.push=a.opts.push?2:0;break;
   case 'Guard':b(2);break;
   case 'Brace':b(3,true);p.immunePush=true;break;
   case 'Dodge Roll':this.move(i,1);p.dodge=1;if(p.hero==='RAV')p.trait=1;break;
   case 'Counter Stance':b(2);p.counters.push({damage:1,effect:p.currentEffect});break;
   case 'Recover':heal(1);this.move(i,1,'free',false,true);break;
   case 'Feint':this.move(i,1);if(s.reveal===0)p.nextSpeed+=2;break;
   case 'Battle Cry':this.coin(i,1);break;
   case 'Retreating Jab':extra.afterMove=1;break;
   case 'Focus':this.chooseOrBot(i,'focus',p.deck.slice(-2).map(c=>c.uid));break;
   case 'Shoulder Charge':this.move(i,2,'free',false,true);extra.push=1;extra.follow=a.opts.follow;break;
   case 'Groundbreaker':extra.push=1;break;
   case 'Blood Price':this.lose(i,2,i,p.currentEffect);if(p.hp>0)this.gainFury(i,2);break;
   case 'Reckless Swing':this.lose(i,1,i,p.currentEffect);break;
   case 'Backbreaker':if([s.left,s.right].includes(op.pos)){extra.bonus=2;extra.ignore=2;}break;
   case 'Plant Your Feet':b(3,true);p.planted=true;break;
   case 'Overrun':{const old=p.pos;this.move(i,3,'free',false,true);if((old-op.pos)*(p.pos-op.pos)<0)this.force({actor:i,target:1-i,amount:1,dir:Math.sign(p.pos-old),effect:p.currentEffect});break;}
   case 'Reposition':this.move(i,2,'free',false,true);if(this.range()>=3)p.trait=1;break;
   case 'Point Blank':extra.push=2;break;
   case 'Pinning Arrow':extra.onHit='pin';break;
   case 'Volley':extra.ignore=1;break;
   case 'Peek':p.trait=1;this.move(i,1,'free',false,true);this.scout(i,1);break;
   case 'Marked Target':p.marked=true;break;
   case 'Vanish':this.move(i,1);p.trait=1;break;
   case 'Shadow Step':{const old=p.pos;this.move(i,2,'free',false,true);if((old-op.pos)*(p.pos-op.pos)<0)p.trait=1;break;}
   case 'Backstab':extra.ignore=1;if(this.behind(i)){extra.bonus=2+(p.backstabBonus||0);p.backstabBonus=0;}break;
   case 'Feinting Slash':extra.onHit='dodge';break;
   case 'Pickpocket':extra.onHit='steal';break;
   case 'Smoke Veil':b(2);p.veilStart=p.blocked;p.delayed.push('veil');break;
   case 'Poisoned Blade':extra.ignore=2;break;
   case 'One-Two':attacks=2;break;
   case 'Flowing Step':this.move(i,2,'free',false,true);if(this.range()===1)p.nextDamage++;break;
   case 'Coin Toss':if(a.opts.coin&&p.coins){this.coin(i,-1);extra.bonus=2;}break;
   case 'Low Sweep':extra.undodgeable=true;extra.onHit='pin';break;
   case 'Threefold Strike':attacks=3;extra.stopOnMiss=true;break;
   case 'Meditate':b(2,true);p.nextIgnore=(p.nextIgnore||0)+2;break;
   case 'Empty Hand':if(!p.loot.length&&!a.loot)extra.bonus=2;break;
   case 'Perfect Sequence':if(p.actionHits[0])attacks=2;break;
   case 'Shield Up':b(4);break;
   case 'Advance Behind Shield':this.move(i,1);b(2);break;
   case 'Shield Bash':if(p.trait)extra.bonus=1;if(p.block+p.roundBlock+p.wardBlock)extra.push=1;break;
   case 'Hold the Line':b(3,true);p.immunePush=true;break;
   case 'Reversal':b(2);p.counters.push({damage:2,effect:p.currentEffect});break;
   case 'Body Check':this.move(i,1);extra.push=2;extra.follow=a.opts.follow;break;
   case 'Guard Break':extra.ignore=2;break;
   case 'Wallop':extra.push=1;break;
   case 'Bandage Up':heal(1);break;
   case 'Sedative Dart':extra.onHit='sedate';break;
   case 'Sterile Field':b(3);break;
   case 'Scalpel':extra.ignore=99;break;
   case 'Adrenaline':this.move(i,1);if(s.reveal===0){p.nextSpeed+=2;p.adrenaline=true;}break;
   case 'Painkiller':b(2);p.painkiller=true;break;
   case 'Defibrillator':if(p.hp<=8)extra.bonus=2;break;
   case 'Diagnosis':if(s.reveal===0){this.move(i,1);this.scout(i,1);}else{this.draw(i,1);this.chooseOrBot(i,'discard',p.hand.map(c=>c.uid));}break;
   case 'Unstoppable Charge':this.move(i,3,'free',false,true);extra.push=1;break;
   case 'Eagle Eye':p.trait=1;this.move(i,1,'free',false,true);this.scout(i,2);break;
   case 'Shadowstep':this.move(i,2,'free',false,true);p.trait=1;break;
   case 'Flurry of Faith':attacks=2;break;
   case 'Shield Wall':b(5,true);break;
   case 'Emergency Treatment':heal(1);break;
   default:throw Error('Unimplemented card '+d.name);
  }
  this.pushTasks(...Array.from({length:attacks},(_,k)=>({type:'hit',actor:i,id:d.id,extra:{...extra,index:k,damage:d.name==='Perfect Sequence'&&k===1?2:Number(d.damage)}})));this.checkWinner();
 }
 resolveAttack(i,d,e={}){
  const s=this.s,p=s.players[i],op=s.players[1-i],o=this.opts(i),isLoot=d.category==='Loot';if(e.stopOnMiss&&e.index>0&&!p.lastHit)return;const[min,printedMax]=this.printedRange(d);let max=printedMax,damage=Number(e.damage??d.damage),ignore=e.ignore||0,push=e.push||0,pull=e.pull||0;
  const first=!isLoot&&!p.cardBonusUsed,loot=p.activeLoot&&this.def(p.activeLoot).name;
  if(first){p.cardBonusUsed=true;damage+=e.bonus||0;if(p.hero==='FRA'&&s.reveal===1){damage+=p.rhythmDamage||0;p.rhythmDamage=0;if(p.basicFirst&&['Hero','Special'].includes(d.category))damage+=1;}
   if(p.remedyBonus==='damage'){damage+=2;p.remedyBonus=null;}
   if(loot==='Protein Shake')damage+=3;if(loot==='Wand of Orcus'){ignore=99;e.undodgeable=true;}if(loot==='Alarm Clock')ignore++;if(loot==='Cleats'&&p.lootCrossed)damage++;if(loot==='Super Glue')push+=2;if(loot==='Binoculars')max+=2;if(loot==='Charcuterie Board')damage+=2;
   if(loot==='Dueling Pickles'&&min===1&&printedMax===1)damage+=2;if(loot==='Jackhammer'&&min===1&&printedMax===1){damage++;push+=2;}
   if(loot==='Grappling Hook')this.force({actor:i,target:1-i,amount:Math.min(2,o.steps),dir:Math.sign(p.pos-op.pos),effect:++s.effect});
  }
  damage+=p.nextDamage||0;p.nextDamage=0;ignore+=p.nextIgnore||0;p.nextIgnore=0;if(p.planted){damage++;p.planted=false;}
  if(p.hero==='SMA'){damage+=p.trait;p.trait=0;}
  if(p.hero==='HEL'&&p.trait&&o.trait){p.trait=0;damage+=2;push++;}
  if(p.hero==='ALF'&&p.trait&&o.trait&&(o.aim==='range'||this.range()>=3)){p.trait=0;if(o.aim==='range')max++;else damage+=2;}
  if(p.marked&&min>=2)damage+=2;
  if(p.hero==='ALF'&&p.ultimate&&min>=2){max=99;if(!p.alfUltUsed){ignore+=2;p.alfUltUsed=true;}}
  p.facing=Math.sign(op.pos-p.pos);p.lastHit=false;
  if(this.range()<min||this.range()>max){this.log(`${d.name} misses at Range ${this.range()}.`,'miss',i);if(e.afterMove)this.move(i,e.afterMove,'free',false,true);return;}
  const reduction=op.stunner?2:0;const usable=Math.max(0,op.block+op.roundBlock+op.wardBlock-ignore);
  if((op.dodge||op.hero==='RAV'&&op.trait)&&this.opts(1-i).trait&&!e.undodgeable&&damage>usable+reduction){op.dodge=0;if(op.hero==='RAV'){op.trait=0;op.nextIgnore=(op.nextIgnore||0)+1;op.nextDamage=(op.nextDamage||0)+1;this.chooseLootMove(1-i,'Dodge',1);}this.log(`${op.name} Dodges ${d.name}.`,'dodge',1-i);return;}
  const glare=op.stunner&&damage>0;op.stunner=false;damage=Math.max(0,damage-reduction);const prevented=Math.min(damage,usable);let remaining=prevented;for(const key of['block','roundBlock','wardBlock']){const spent=Math.min(op[key],remaining);op[key]-=spent;remaining-=spent;}
  op.blocked+=prevented;op.blockedRound+=prevented;if(op.hero==='HEL'&&op.blockedRound>=2&&!op.resolveEarned){op.trait=1;op.resolveEarned=true;this.log(`${op.name} gains Resolve.`,'trait',1-i);}
  const effect=isLoot?++s.effect:p.currentEffect,loss=this.lose(1-i,Math.max(0,damage-prevented),i,effect);p.lastHit=loss>0;
  if(loss){if(min>=2)p.marked=false;if(!isLoot){p.cardHits++;p.actionHits[s.reveal]=true;}
   if(e.onHit==='dodge')p.trait=1;if(e.onHit==='steal'&&op.coins){this.coin(1-i,-1);this.coin(i,1);}if(e.onHit==='pin')op.movePenalty++;if(e.onHit==='sedate'&&s.reveal===0)op.slow+=2;
   if(push||pull)this.force({actor:i,target:1-i,amount:push||pull,dir:Math.sign(op.pos-p.pos)*(pull?-1:1),follow:e.follow,effect});
   if(p.hero==='FRA'&&p.ultimate&&!isLoot&&!p.rhythmUsed){p.rhythmUsed=true;if(s.reveal===0){p.nextSpeed++;p.rhythmDamage=1;}}
  }else this.log(`${d.name} deals no HP loss.`,'block',1-i);
  if(op.painkiller&&prevented>=2){op.painkiller=false;this.heal(1-i,1,true);}if(!loss&&prevented>0&&prevented>=damage&&this.range()===1)for(const counter of op.counters)this.lose(i,counter.damage,1-i,counter.effect);if(e.afterMove)this.move(i,e.afterMove,'free',false,true);if(glare)this.lose(i,1,1-i,++s.effect);
 }
 force(t){const p=this.s.players[t.target];if(p.immunePush)return;if(p.forcePrevent){p.forcePrevent=false;if(p.glue){p.nextDamage++;p.glue=false;}return;}let n=t.amount;if(p.reverseForce){n-=2*Math.min(2,n);p.reverseForce=false;}if(!n)return;const dir=Math.sign(n)*t.dir,source=this.s.players[t.actor];let amount=Math.abs(n);if(Math.sign(source.pos-p.pos)===dir)amount=Math.min(amount,Math.max(0,Math.abs(source.pos-p.pos)-1));if(!amount)return;const wall=p.pos+amount*dir<this.s.left||p.pos+amount*dir>this.s.right,old=p.pos;this.move(t.target,amount,dir,true);if(t.follow&&Math.sign(p.pos-old)===t.dir)this.move(t.actor,Math.abs(p.pos-old),'toward');if(wall){this.log('Wall Slam!','slam',t.target);this.lose(t.target,1,t.actor,t.effect);}}
 finishCard(i){const p=this.s.players[i],a=this.s.plans[i][this.s.reveal],d=this.def(a.card);if(a.cardResolved)return;a.cardResolved=true;if(d.category==='Basic'){this.coin(i,1);if(this.s.reveal===0)p.basicFirst=true;this.log(`${p.name} earns 1 Coin from a Basic.`,'coin',i);}if(d.category==='Special')p.usedSpecial++;
  if(p.hero==='SHE'&&['Hero','Special'].includes(d.category)&&(d.block||/Heal/.test(d.text)))p.trait=Math.min(3,p.trait+1);
  if(d.name==='Flurry of Faith'&&p.cardHits===2)p.cleanupDraw=(p.cleanupDraw||0)+1;if(p.hero==='FRA'&&this.s.reveal===1&&p.actionHits.every(Boolean))this.gainFury(i);this.ultimates();this.checkWinner();
 }
 scout(i,count){const p=this.s.players[i],op=this.s.players[1-i];p.scouted=[];p.peek=[];if(!this.s.shown[1]&&this.s.plans[1-i]?.[1])p.peek=[1];else p.scouted=this.shuffle(op.hand).slice(0,count).map(c=>({...c}));this.chooseOrBot(i,'peek',[]);}
 eligibleLoot(i,window='revealed'){const p=this.s.players[i],a=this.s.plans[i]?.[this.s.reveal];if(window!=='revealed'||p.usedLoot||!a||a.loot||a.done)return[];const d=this.def(a.card);return p.loot.filter(id=>{const n=this.def(id).name;if(['Homing Pigeons','Crystal Ball'].includes(n))return this.s.reveal===0;if(n==='Gum & String')return this.s.lootDiscard.length>0;if(n==='Lucky Charm')return d.category==='Basic';if(['Protein Shake','Wand of Orcus','Binoculars','Grappling Hook'].includes(n))return Boolean(d.damage);if(['Dueling Pickles','Jackhammer'].includes(n))return d.range==='1'&&Boolean(d.damage);return true;});}
 botLoot(i,a){const d=this.def(this.s.plans[i][this.s.reveal].card);return a.find(id=>d.damage&&['Protein Shake','Wand of Orcus','Dueling Pickles','Grappling Hook','Teleport Scroll'].includes(this.def(id).name))||a[0];}
 applyLoot(i,id){const p=this.s.players[i];if(!this.eligibleLoot(i).includes(id))throw Error('Loot cannot be attached to this Action.');p.loot.splice(p.loot.indexOf(id),1);p.usedLoot=true;this.s.plans[i][this.s.reveal].loot=id;this.log(`${p.name} attaches ${this.def(id).name}.`,'loot',i);}
 playLoot(id){const q=this.s.prompt;if(q?.kind!=='loot'||!q.choices.includes(id))throw Error('Loot attachment is closed.');this.applyLoot(q.player,id);this.s.prompt=null;this.advance();}
 lootBefore(i){const s=this.s,p=s.players[i],a=s.plans[i][s.reveal],n=this.def(a.loot).name;switch(n){
  case 'Cleats':this.chooseLootMove(i,n);break;
  case 'Stunner Glasses':p.stunner=true;break;
  case 'Super Glue':p.forcePrevent=true;p.glue=true;break;
  case 'Smoke Bomb':p.wardBlock=4;break;
  case 'Teleport Scroll':this.chooseOrBot(i,'space',Array.from({length:s.right-s.left+1},(_,k)=>s.left+k).filter(v=>!s.players.some(p=>p.pos===v)));break;
  case 'Homing Pigeons':p.nextSpeed+=2;this.scout(i,1);break;
  case 'Pinwheel':p.reverseForce=true;this.chooseLootMove(i,n);break;
  case 'Charcuterie Board':this.heal(i,1);break;
 }}
 lootAfter(i){const s=this.s,p=s.players[i],a=s.plans[i][s.reveal];if(!a.loot)return;const n=this.def(a.loot).name;switch(n){
  case 'Attack Kitten':case 'Blowgun':case 'Holy Hand Grenade':this.resolveAttack(i,{...this.def(a.loot),damage:n==='Holy Hand Grenade'?4:3,range:n==='Attack Kitten'?'1-2':n==='Blowgun'?'3-4':'2-4'},{ignore:n==='Blowgun'?1:0});break;
  case 'Explosive Barrel':{const effect=++s.effect;this.lose(i,1,i,effect);this.lose(1-i,3,i,effect);const center=(s.left+s.right)/2;for(let j=0;j<2;j++)this.move(j,1,s.players[j].pos<center?-1:1,true);break;}
  case 'Gum & String':this.chooseOrBot(i,'retrieve',[...s.lootDiscard]);break;
  case 'Coin Finder':this.coin(i,3);this.drawLoot(i);break;
  case 'Fury Flask':this.gainFury(i,p.hp<s.players[1-i].hp?2:1);break;
  case 'Homing Pigeons':this.chooseLootMove(i,n);break;
  case 'Crystal Ball':p.nextIgnore=(p.nextIgnore||0)+2;p.peek=[1];this.chooseOrBot(i,'replace',p.hand.map(c=>c.uid));break;
  case 'Smoke Bomb':this.chooseLootMove(i,n,1);break;
  case 'Lucky Charm':p.hand.push(a.card);a.reclaimed=true;break;
 }this.ultimates();this.checkWinner();}
 chooseLootMove(i,name,max=2){const p=this.s.players[i],op=this.s.players[1-i],choices=['stay'];if(!p.noMove){choices.push('T');for(const path of ['L','LL','R','RR'].filter(path=>path.length<=max)){const target=p.pos+(path[0]==='L'?-1:1)*path.length;if(target>=this.s.left&&target<=this.s.right&&target!==op.pos)choices.push(path);}}this.chooseOrBot(i,'lootMove',choices);if(this.s.prompt?.kind==='lootMove'){this.s.prompt.lootName=name;this.s.prompt.max=max;}}
 applyLootMove(i,path){const p=this.s.players[i],old=p.pos;if(path==='T'&&!p.noMove){if(p.movePenalty){p.movePenalty=0;return;}p.facing=-p.facing;this.log(`${p.name} turns ${p.facing===1?'right':'left'}.`,'move',i);}else if(path!=='stay')this.move(i,path.length,path[0]==='L'?-1:1);if(this.s.plans[i][this.s.reveal].loot&&this.def(this.s.plans[i][this.s.reveal].loot).name==='Cleats')p.lootCrossed=(old-this.s.players[1-i].pos)*(p.pos-this.s.players[1-i].pos)<0;}
 chooseOrBot(i,kind,choices){if(this.bot(i)){if(kind==='lootMove'){const p=this.s.players[i],op=this.s.players[1-i],want=p.hero==='ALF'?3:1;const best=choices.slice().sort((a,b)=>{const pos=x=>p.pos+(['stay','T'].includes(x)?0:(x[0]==='L'?-1:1)*x.length);return Math.abs(Math.abs(pos(a)-op.pos)-want)-Math.abs(Math.abs(pos(b)-op.pos)-want);})[0];this.applyLootMove(i,best);}if(kind==='space'){const op=this.s.players[1-i],alf=this.s.players[i].hero==='ALF';this.relocate(i,choices.sort((a,b)=>alf?Math.abs(b-op.pos)-Math.abs(a-op.pos):Math.abs(a-op.pos)-Math.abs(b-op.pos))[0]);}if(kind==='discard')this.discardChoice(i,choices[0]);if(kind==='retrieve'&&choices.length){this.s.players[i].loot.push(choices[0]);this.s.lootDiscard.splice(this.s.lootDiscard.indexOf(choices[0]),1);}return;}if(kind==='focus'&&!choices.length)return;this.s.prompt={kind,player:i,choices};}
 discardChoice(i,uid){const p=this.s.players[i],c=p.hand.find(c=>c.uid===uid);if(c){p.hand=p.hand.filter(c=>c.uid!==uid);p.discard.push(c);}}
 choose(value){const q=this.s.prompt;if(!q)return;if(!q.choices.includes(value)&&!(q.kind==='replace'&&value===null))throw Error('Invalid choice.');this.s.prompt=null;const p=this.s.players[q.player];if(q.kind==='space')this.relocate(q.player,value);if(q.kind==='lootMove')this.applyLootMove(q.player,value);if(q.kind==='discard')this.discardChoice(q.player,value);if(q.kind==='retrieve'){p.loot.push(value);this.s.lootDiscard.splice(this.s.lootDiscard.indexOf(value),1);}if(q.kind==='replace'&&value!==null){const c=p.hand.find(c=>c.uid===value),a=this.s.plans[q.player][1];p.hand=p.hand.filter(c=>c.uid!==value);p.hand.push(a.card);a.card=c;this.log(`${p.name} replaces Action 2.`,'card',q.player);}if(q.kind==='focus'){const top=p.deck.slice(-2),keep=top.find(c=>c.uid===value);p.deck.splice(-top.length);p.deck.unshift(...top.filter(c=>c.uid!==value));p.deck.push(keep);}this.advance();}
 skipPrompt(){const q=this.s.prompt;if(!q)return;if(['space','discard','focus','lootMove'].includes(q.kind))return this.choose(q.choices[0]);this.s.prompt=null;this.advance();}
 drawLoot(i){const p=this.s.players[i];if(p.loot.length>=2)return;if(!this.s.lootDeck.length){this.s.lootDeck=this.shuffle(this.s.lootDiscard);this.s.lootDiscard=[];}if(this.s.lootDeck.length)p.loot.push(this.s.lootDeck.pop());}
 shop(i,buy){if(this.s.phase!=='shop'||this.s.shopDone[i])throw Error('Loot purchase is closed.');const p=this.s.players[i];if(buy&&p.coins>=4&&p.loot.length<2){const before=p.loot.length;this.drawLoot(i);if(p.loot.length>before){this.coin(i,-4);p.lootBought++;this.log(`${p.name} buys secret Loot for 4 Coins.`,'coin',i);}}this.s.shopDone[i]=true;}
 nextRound(){if(this.s.phase!=='shop'||!this.s.shopDone.every(Boolean))throw Error('Both Heroes must finish the Loot purchase.');this.s.phase='program';this.s.beat='Program two cards';this.prepareBot();}
 endReveal(){this.pushTasks(...[0,1].filter(i=>this.s.players[i].delayed.includes('veil')).map(actor=>({type:'veilMove',actor})),{type:'endRevealFinish'});}
 endRevealFinish(){for(let i=0;i<2;i++){const p=this.s.players[i];p.delayed=[];if(p.hero==='ALF'&&!p.moved)p.trait=1;p.block=0;p.counters=[];p.painkiller=false;}if(this.s.reveal===0)this.pushTasks({type:'second'});else this.cleanup();}
 arenaPressure(){return Math.max(0,this.s.round-12)*2;}
 cleanup(){const s=this.s,pressure=this.arenaPressure();if(pressure){this.log(`Arena Fury! Both Heroes lose ${pressure} HP simultaneously; no Block, Dodge, Fury or Pain.`,'arena');for(let i=0;i<2;i++){const p=s.players[i],loss=Math.min(p.hp,pressure);p.hp-=loss;this.log(`${p.name} loses ${loss} HP to Arena Fury.`,'damage',i);}if(this.checkWinner())return;}for(let i=0;i<2;i++){const p=s.players[i];for(const a of s.plans[i])if(!a.reclaimed)p.discard.push(a.card);this.draw(i,Math.max(p.cleanupDraw||0,5-p.hand.length+(p.freshSkill&&p.hand.some(c=>c.uid===p.freshSkill)?1:0)));const carry=p.hero==='HEL'&&p.ultimate?Math.min(2,p.roundBlock+p.block):0;Object.assign(p,{block:0,roundBlock:carry,moved:false,blocked:0,blockedRound:0,resolveEarned:false,painGained:0,nextDamage:0,nextSpeed:0,nextIgnore:0,slow:0,movePenalty:0,counters:[],delayed:[],basicFirst:false,actionHits:[false,false],rhythmUsed:false,rhythmDamage:0,ravenUltUsed:false,alfUltUsed:false,miracleUsed:false,backstabBonus:0,peek:[],scouted:[],immunePush:false,adrenaline:false,planted:false,marked:false,cleanupDraw:0,dodge:0});if(['SMA','RAV'].includes(p.hero))p.trait=0;}
  s.round++;s.edge=1-s.edge;s.reveal=0;s.shown=[false,false];s.plans=[null,null];s.committed=[false,false];s.shopDone=[false,false];s.phase='shop';s.beat='Start-round Loot purchase';s.queue=[];this.log(`Round ${s.round}. Initiative passes to ${s.players[s.edge].name}.`,'round');for(let i=0;i<2;i++)if(this.bot(i))this.shop(i,true);
 }
}
