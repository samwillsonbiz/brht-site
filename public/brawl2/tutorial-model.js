import {Brawl2} from './engine.js';
export const CHAPTERS=[['welcome','The fight'],['loadout','Your loadout'],['cards','Read the cards'],['practice','Learn by brawling'],['power','Your comeback'],['finish','Ready to fight']];
export const DRILL_STEPS={
 plan:['Plan your one-two.','Choose Advance first, then Quick Jab. Your order matters: each pair reveals separately.','Confirm attacks'],
 evade:['Alf is faster. You react first.','His shot hits at Range 2–5. Play Footwork to get inside that minimum Range.',null],
 'evade-target':['Get inside the shot.','Footwork moves up to 2 during an enemy attack. Click space 5 to stand next to Alf.',null],
 counter:['He gets an answer, too.','You escaped his Range. Now watch Alf spend a card to create distance again.','Watch Alf react'],
 block:['Back in his sights.','Alf’s Backflip puts you at distance 3. Play Brace to gain 3 Block.',null],
 'resolve-incoming':['Pass. Then the shot lands.','Alf has passed. Your pass makes two in a row: the current attack resolves.','Pass & resolve'],
 approach:['Three blocked. One gets through.','Now your Advance activates. Its printed movement happens before reactions.','Activate Advance'],
 'approach-target':['Close the distance.','Advance lets you move up to 2. Click space 7 to get beside Alf.',null],
 'resolve-own':['Your turn to strike.','Alf passes. You are at Range 1: pass to resolve your attack.','Pass & strike'],
 shove:['That’s your Impact.','Dealing Health damage earned an Impact. Spend one now to push Alf into the wall.','Spend 1 Impact · shove'],
 'pair-two':['A hit. A wall slam. A Coin.','Your finished Basic attack earns 1 Coin. Time to reveal your second pair.','Reveal pair two'],
 'second-reveal':['Quick Jab wins this race.','Its Speed is higher than Dead Centre. You get to attack first.','Activate Quick Jab'],
 'resolve-jab':['Make the second hit count.','Alf passes. Your Quick Jab is in Range, so pass to strike.','Pass & strike'],
 'save-impact':['Save something for later.','That hit earned another Impact. Keep it this time; your tokens stay between rounds.','Keep Impact'],
 'rival-second':['His big shot is still coming.','Both attacks get a turn. Now Alf activates Dead Centre.','Activate Alf’s attack'],
 'let-miss':['Too close for his big shot.','Dead Centre needs Range 3–6. You are at distance 1. Pass and let it miss.','Pass'],
 refill:['Your positioning paid off.','All four attacks are done. Keep unused cards and draw up to 4, stopping at 7 in hand.','Finish round'],
 shop:['Turn your Coins into trouble.','Spend your 2 Coins on a face-up Loot, or draw blind. Anyone can use either Hero’s Loot.',null],
 complete:['You just played a Brawl round.','You dodged, answered a counter, blocked, hit a wall and bought Loot. Keep fighting until someone reaches 0 Health.','See your comeback powers']
};
function loadout(data,id,required){const h=data.heroes.find(h=>h.id===id),deck=[...required];for(const c of h.pool.flatMap(id=>[id,id]))if(deck.length<24&&deck.filter(x=>x===c).length<2)deck.push(c);return deck;}
export class TutorialFight{
 constructor(data){this.data=data;this.step='plan';this.selected=[];this.bought=null;const hands=[['B05','B01','B09','B10','S03','S10','S05'],['A02','A01','A05','B10','A03','A04','A06']];this.game=new Brawl2(data,{heroes:['SMA','ALF'],seed:28112026,decks:['SMA','ALF'].map((h,i)=>loadout(data,h,hands[i]))});const s=this.game.s;s.edge=0;for(let i=0;i<2;i++){const p=s.players[i],all=[...p.hand,...p.deck];p.hand=hands[i].map(id=>{const k=all.findIndex(c=>c.id===id);return all.splice(k,1)[0];});p.deck=all;}}
 card(id,i=0){return this.game.s.players[i].hand.find(c=>c.id===id);}
 select(uid){this.game.need(this.step==='plan','Finish this lesson first.');const c=this.game.s.players[0].hand.find(c=>c.uid===uid),k=this.selected.indexOf(uid);if(k>=0){this.selected.splice(k);return;}const expected=this.selected.length===0?'B05':'B01';this.game.need(c?.id===expected,`Choose ${expected==='B05'?'Advance first':'Quick Jab second'} for this drill.`);this.selected.push(uid);}
 play(id){const g=this.game;if(this.step==='evade'&&id==='B09'){g.react(0,this.card(id).uid);this.step='evade-target';return;}if(this.step==='block'&&id==='B10'){g.react(0,this.card(id).uid);g.pass(1);this.step='resolve-incoming';return;}throw Error('Use the highlighted card for this lesson.');}
 move(v){const g=this.game;if(this.step==='evade-target'&&v===5){g.choose(0,v);this.step='counter';return;}if(this.step==='approach-target'&&v===7){g.choose(0,v);g.pass(1);this.step='resolve-own';return;}throw Error('Choose the highlighted space for this drill.');}
 next(){const g=this.game;switch(this.step){
 case'plan':g.need(this.selected.length===2,'Choose both highlighted attacks.');g.commit(0,this.selected);g.commit(1,['A02','A01'].map(id=>this.card(id,1).uid));g.advance();this.step='evade';break;
 case'counter':g.react(1,this.card('A05',1).uid);g.choose(1,8);this.step='block';break;
 case'resolve-incoming':g.pass(0);this.step='approach';break;
 case'approach':g.advance();this.step='approach-target';break;
 case'resolve-own':g.pass(0);this.step='shove';break;
 case'shove':g.choose(0,1);this.step='pair-two';break;
 case'pair-two':g.advance();this.step='second-reveal';break;
 case'second-reveal':g.advance();g.pass(1);this.step='resolve-jab';break;
 case'resolve-jab':g.pass(0);this.step='save-impact';break;
 case'save-impact':g.choose(0,0);this.step='rival-second';break;
 case'rival-second':g.advance();this.step='let-miss';break;
 case'let-miss':g.pass(0);g.pass(1);this.step='refill';break;
 case'refill':g.advance();this.step='shop';break;
 default:throw Error('Make the highlighted choice first.');
 }}
 buy(id){this.game.need(this.step==='shop','Loot is bought between rounds.');const p=this.game.s.players[0];this.game.shop(0,true,id);this.bought=p.loot.at(-1);this.step='complete';}
}
