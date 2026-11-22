export const LEGACY=['SMA','ALF','SHE','HEL','RAV','FRA'];
export const CAPS={SMA:3,ALF:2,SHE:3,HEL:3,RAV:2,FRA:3};
export const NAMES={SMA:'Impact',ALF:'Aim',SHE:'Research',HEL:'Armour',RAV:'Tricks',FRA:'Profit'};
export function initLegacy(p){if(LEGACY.includes(p.hero)){p.tokens={SMA:2,ALF:1,SHE:2,HEL:3,RAV:1,FRA:1}[p.hero];p.wind=[];}}
export function earn(g,i,n=1){const p=g.s.players[i],v=Math.min(n,CAPS[p.hero]-p.tokens);p.tokens+=v;if(v){g.event('earned'+p.hero);g.log(`${p.name} gains ${v} ${NAMES[p.hero]} · ${p.tokens}/${CAPS[p.hero]}.`);}return v;}
export function spend(g,i,n){g.need(g.s.players[i].tokens>=n,'Not enough Hero tokens.');g.s.players[i].tokens-=n;g.event('spent'+g.s.players[i].hero);}
function ask(g,i,key,title,options,extra={}){g.ask(i,'legacy-token',title,options.map(x=>x[0]),{key,labels:Object.fromEntries(options),...extra});}
export function actions(g,i){const s=g.s,p=s.players[i],m=s.mods[i];if(!p||s.phase!=='reaction'||s.turn!==i||s.prompt)return [];const own=s.active===i,a=[];const add=(id,label,text,cost,ops)=>{if(p.tokens>=cost)a.push({id,label,text,cost,ops});};
 if(p.hero==='SMA'&&own&&!m.impactLaunch)add('impact-launch','Launch · 3 Impact','+2 damage; on hit: push up to 3. No Crunch bonus this attack.',3,[{op:'boost',n:2},{op:'launch',n:3}]);
 if(p.hero==='ALF'&&own&&!m.aimUsed){add('aim-range','Adjust · 1 Aim','+2 maximum Range.',1,[{op:'reach',n:2}]);add('aim-gap','Find the Gap · 2 Aim','Ignore 3 Block.',2,[{op:'ignore',n:3}]);}
 if(p.hero==='SHE'&&p.hp<20)add('research-heal','Treatment · 2 Research','Heal 3.',2,[{op:'heal',n:3}]);
 if(p.hero==='HEL'&&!own&&!m.armourUsed){add('armour-brace','Brace · 1 plate','Gain 2 Block.',1,[{op:'block',n:2}]);add('armour-hold','Hold the Line · 2 plates','Gain 3 Block; resist pushes and pulls this attack.',2,[{op:'block',n:3},{op:'armourAnchor'}]);}
 if(p.hero==='RAV'){if(!p.pinned&&!m.slipUsed)add('trick-slip','Slip Through · 1 Trick','Move 1, or cross an adjacent rival.',1,[{op:'trickMove'}]);if(own&&!m.backstabUsed)add('trick-stab','Backstab · 2 Tricks','+2 damage.',2,[{op:'boost',n:2}]);}return a;
}
export function use(g,i,id){const a=actions(g,i).find(x=>x.id===id);g.need(a,'That token action is not available.');spend(g,i,a.cost);const m=g.s.mods[i];if(id==='impact-launch')m.impactLaunch=true;if(id.startsWith('aim-'))m.aimUsed=true;if(id.startsWith('armour-'))m.armourUsed=true;if(id==='trick-slip')m.slipUsed=true;if(id==='trick-stab')m.backstabUsed=true;g.abilityReaction(i,a.label,a.ops,null,a.text);}
export function healthPaid(g,i){if(earn(g,i)) (g.s.tokenPending??=[]).push({op:'researchDraw',i});}
export function crossing(g,i,from,to,rival){const s=g.s,p=s.players[i],m=s.mods[i];if(p.hero!=='RAV'||s.active==null||s.context?.type==='attack'&&s.context.hit||Math.sign(from-rival)===Math.sign(to-rival)||s.context?.tokenMovement)return; if(s.context)s.context.crossed=true;if(!m.trickCrossed){m.trickCrossed=true;earn(g,i);}}
export function beforeWall(g,t,n,raw){const s=g.s,p=s.players[t.i],m=s.mods[t.i];if(p.hero!=='SMA'||s.context?.type!=='attack'||t.op!=='push'||raw>=1&&raw<=8||!p.tokens||m.crunchUsed||m.impactLaunch||t.crunchChecked)return false;ask(g,t.i,'crunch','Spend 1 Impact for +2 wall-slam damage?',[['keep','Keep Impact'],['spend','Crunch · +2 damage']],{force:{...t,crunchChecked:true},distance:n});return true;}
export function handle(g,t){const s=g.s,i=t.i,p=s.players[i],m=s.mods[i];switch(t.op){
 case'nextTempo':g.nextTempo();break;
 case'researchDraw':ask(g,i,'researchDraw','Use the Research for a card, or save it?',[['keep','Save Research'],['draw','Spend 1 · draw 1']]);break;
 case'profitGain':if(earn(g,i,t.n||1))ask(g,i,'cash','Take the Coin now, or save Profit?',[['keep','Save Profit'],['cash','Cash out · gain 1 Coin']]);break;
 case'legacyGain':earn(g,i,t.n||1);break;
 case'armourAnchor':m.armourAnchor=true;break;
 case'trickMove':{s.context.tokenMovement=true;const o=s.players[1-i],beyond=o.pos+Math.sign(o.pos-p.pos),choices=g.availableMoves(i,1);if(!p.pinned&&Math.abs(p.pos-o.pos)===1&&beyond>=1&&beyond<=8)choices.push(beyond);g.ask(i,'move','Slip Through: move 1, or cross the adjacent rival.',[...new Set(choices)],{op:'move',i,n:1});break;}
 case'impactPrep':earn(g,i);break;
 case'impactPierce':if(p.tokens)ask(g,i,'impactPierce','Spend 1 Impact to ignore 2 more Block?',[['keep','Keep Impact'],['spend','Spend 1 · ignore 2 Block']]);break;
 case'aimDraw':if(p.tokens&&!s.drawUsed[i])ask(g,i,'aimDraw','Spend 1 Aim to draw 1?',[['keep','Keep Aim'],['draw','Spend 1 · draw 1']]);break;
 case'escapeAim':if(Math.abs(p.pos-s.players[1-i].pos)>=3)earn(g,i);break;
 case'antidote':s.mods[s.active].damage=(s.mods[s.active].damage||0)-4;g.log('Antidote: current attack −4 damage.');break;
 case'researchPay':{const opts=[['keep','Keep resources']];if(p.hp>t.cost)opts.push(['hp',`Pay ${t.cost} Health · +${t.bonus} damage`]);if(p.tokens)opts.push(['research',`Spend 1 Research · +${t.bonus} damage`]);ask(g,i,'researchPay','Power Blood Bolt?',opts,{cost:t.cost,bonus:t.bonus});break;}
 case'plateStrike':if(p.tokens)ask(g,i,'plateStrike','Break 1 plate for +2 damage?',[['keep','Keep armour'],['spend','Break 1 · +2 damage']]);break;
 case'trickTheft':ask(g,i,'trickTheft','Take their Coin, or prepare a Trick?',[['coin','Steal up to 1 Coin'],...(p.tokens<CAPS.RAV?[['trick','Gain 1 Trick instead']]:[])]);break;
 case'crossDraw':if(s.context.crossed&&p.tokens&&!s.drawUsed[i])ask(g,i,'crossDraw','Spend 1 Trick to draw 1?',[['keep','Keep Trick'],['draw','Spend 1 · draw 1']]);break;
 default:return false;}return true;
}
export function choose(g,i,q,v){if(q.kind!=='legacy-token')return false;const s=g.s,p=s.players[i],t=q.task,m=s.mods[i];switch(t.key){
 case'crunch':if(v==='spend'){spend(g,i,1);m.crunchUsed=true;t.force.crunchBonus=2;}g.force(t.force,t.distance);break;
 case'researchDraw':case'aimDraw':case'crossDraw':if(v==='draw'){spend(g,i,1);g.draw(i,1);if(t.key!=='researchDraw')s.drawUsed[i]=true;g.event(t.key);g.log(`${p.name} spends a token to draw 1.`);}break;
 case'cash':if(v==='cash'){spend(g,i,1);p.coins=Math.min(8,p.coins+1);g.event('profitCashed');}break;
 case'impactPierce':if(v==='spend'){spend(g,i,1);m.ignore=(m.ignore||0)+2;}break;
 case'plateStrike':if(v==='spend'){spend(g,i,1);m.damage=(m.damage||0)+2;}break;
 case'researchPay':if(v!=='keep'){if(v==='research')spend(g,i,1);else{p.hp-=t.cost;g.paid(i,'hp');g.checkThresholds(i);}m.damage=(m.damage||0)+t.bonus;}break;
 case'trickTheft':if(v==='trick')earn(g,i);else{s.queue.unshift({op:'steal',i,n:1});}break;
 }return true;
}
export function end(g,t){const s=g.s,p=s.players[t.i],i=t.i;if(p.hero==='HEL'&&g.def(t.card).category==='Hero'&&s.context.hit&&p.armourRepairRound!==s.round){p.armourRepairRound=s.round;earn(g,i);};if(p.hero==='FRA'&&g.def(t.card).category==='Basic'&&s.context.hit)s.queue.unshift({op:'profitGain',i});}
export function canDeal(g,i){const s=g.s,p=s.players[i];return p.hero==='FRA'&&s.phase==='shop'&&s.shopTurn===i&&!s.shopDone[i]&&p.dealUsedRound!==s.round&&(p.tokens>=2||p.dealCredit)&&p.loot.length<2&&s.market.length>0;}
export function deal(g,i,replace,selection){g.need(canDeal(g,i),'Inside Deal is unavailable.');g.need(replace===null||g.s.market.includes(replace),'Choose a market card to replace.');if(replace!==null){g.need(!g.s.players[i].dealRefreshed&&!g.s.players[i].dealCredit,'Only one market replacement.');const s=g.s;g.refillLootDeck();g.need(s.lootDeck.length,'No card is available to replace this offer.');const k=s.market.indexOf(replace),next=s.lootDeck.pop();s.lootDeck.unshift(s.market[k]);s.market[k]=next;g.event('marketRefresh');} // Purchasing is a second command after seeing the replacement.
 if(selection===null){g.need(replace!==null&&!g.s.players[i].dealRefreshed,'Only one market replacement.');g.s.players[i].dealRefreshed=true;spend(g,i,2);g.s.players[i].dealCredit=true;return;}
 g.need(g.s.market.includes(selection),'Choose a face-up item.');if(!g.s.players[i].dealCredit)spend(g,i,2);g.s.players[i].dealCredit=false;g.drawLoot(i,selection);g.s.players[i].dealUsedRound=g.s.round;g.s.shopDone[i]=g.s.players[i].coins<2||g.s.players[i].loot.length>=2;g.s.shopTurn=g.shopActor();if(g.s.shopTurn===null)g.s.phase='program';g.event('insideDeals');}
