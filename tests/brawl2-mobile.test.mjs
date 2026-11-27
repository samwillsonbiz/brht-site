import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Brawl2} from '../public/brawl2/engine.js';
import {projectGame} from '../lib/brawl2/rooms.mjs';
import {phonePresentation, assignAttackSlot, mobileStateKey, movementDescription, createMobileUI} from '../public/brawl2/mobile-ui.js';

const data=JSON.parse(fs.readFileSync(new URL('../public/brawl2/data.json',import.meta.url)));

function fresh(heroes=['SMA','ALF']) {
  return new Brawl2(data,{heroes,seed:19});
}

function reactionGame(heroes=['SMA','ALF']) {
  const g=fresh(heroes);
  g.s.edge=0;
  g.s.players[0].pos=3;
  g.s.players[1].pos=5;
  g.s.players[0].hand=['B01','B02','B09'].map(id=>g.instance(id));
  g.s.players[1].hand=['B02','B02','B09'].map(id=>g.instance(id));
  for(const i of [0,1])g.commit(i,g.hand(i,'Attack').map(c=>c.uid));
  g.advance();
  assert.equal(g.s.active,0);
  assert.equal(g.s.phase,'reaction');
  assert.equal(g.s.turn,1);
  return g;
}

// Tests use the same engine API as the app. The tiny presentation harness only
// records the sheet and command calls; it supplies no alternative game rules.
function harness(g,viewer=0) {
  const state={game:g,viewer,screen:'game',mode:'solo',selected:[],busy:false};
  const out={html:'',commands:0,closed:0,toasts:[],scry:[]};
  const ui=createMobileUI({
    getContext:()=>state,
    def:c=>g.def(c),
    card:c=>`<article>${c.name}</article>`,
    modal:html=>{out.html=html;},
    closeModal:()=>{out.closed++;},
    toast:t=>out.toasts.push(t),
    render:()=>{},
    run:async fn=>{out.commands++;await fn();},
    setSelected:next=>{state.selected=next;},
    getScry:()=>out.scry,
    setScry:next=>{out.scry=next;},
  });
  const click=dataset=>ui.handleClick({}, {dataset,closest:()=>null});
  return {state,out,ui,click};
}

test('phone presentation leaves ordinary desktop and large tablets on their existing interface',()=>{
  assert.equal(phonePresentation({coarse:false,shortSide:390}),false);
  assert.equal(phonePresentation({coarse:true,shortSide:768}),false);
  assert.equal(phonePresentation({coarse:true,shortSide:390}),true);
  assert.equal(phonePresentation({coarse:true,shortSide:600}),true);
  assert.equal(phonePresentation({coarse:false,shortSide:900,force:true}),true);
});

test('ordered assignments replace and swap without duplicating a physical card',()=>{
  const original=['first','second'];
  assert.deepEqual(assignAttackSlot(original,'third',0,2),['third','second']);
  assert.deepEqual(assignAttackSlot(original,'first',1,2),['second','first']);
  assert.deepEqual(assignAttackSlot(original,'second',0,2),['second','first']);
  assert.deepEqual(original,['first','second']);
  assert.deepEqual(assignAttackSlot([],'first',0,0),[]);
  assert.deepEqual(assignAttackSlot(['first'],'second',1,1),['first']);
});

test('zero, one and two available attacks can be locked using the existing engine',()=>{
  for(const ids of [['B09'],['B01','B09'],['B01','B02','B09']]) {
    const g=fresh();
    g.s.players[0].hand=ids.map(id=>g.instance(id));
    const required=g.requiredAttacks(0);
    let selected=[];
    for(const [slot,c] of g.hand(0,'Attack').entries())selected=assignAttackSlot(selected,c.uid,slot,required);
    g.commit(0,selected);
    assert.equal(g.s.committed[0],true);
    assert.equal(g.s.plans[0].length,required);
    assert.equal(g.s.players[0].hand.length,1);
  }
});

test('the locked plan still shows both committed attacks when only Reactions remain in hand',()=>{
  const g=fresh();
  g.s.players[0].hand=['B01','B02','B09'].map(id=>g.instance(id));
  g.commit(0,g.hand(0,'Attack').map(c=>c.uid));
  assert.equal(g.requiredAttacks(0),0);
  const html=harness(g).ui.decision('<span>Waiting</span>');
  assert.match(html,/Quick Jab/);
  assert.match(html,/Heavy Blow/);
  assert.match(html,/Attacks locked/);
});

test('inspecting a card changes no game state; explicit assignment remains uncommitted',async()=>{
  const g=fresh();
  g.s.players[0].hand=['B01','B02','B09'].map(id=>g.instance(id));
  const h=harness(g),uid=g.s.players[0].hand[0].uid,before=structuredClone(g.s);
  await h.click({card:uid});
  assert.deepEqual(g.s,before);
  assert.match(h.out.html,/Assign Attack 1/);
  await h.click({mobile:'assign',slot:'0'});
  assert.deepEqual(h.state.selected,[uid]);
  assert.deepEqual(g.s,before);
  assert.equal(h.out.commands,0);
});

test('a changed reaction turn invalidates an open card sheet before any command is sent',async()=>{
  const g=reactionGame(),h=harness(g,1),uid=g.s.players[1].hand[0].uid;
  await h.click({card:uid});
  assert.match(h.out.html,/Play reaction/);
  g.pass(1);
  const afterPass=structuredClone(g.s);
  await h.click({mobile:'play-card'});
  assert.equal(h.out.commands,0);
  assert.deepEqual(g.s,afterPass);
  assert.match(h.out.toasts.at(-1),/fight moved on/);
});

test('movement taps preview only; confirmation applies the original legal movement exactly once',async()=>{
  const g=reactionGame();
  g.react(1,g.s.players[1].hand[0].uid);
  assert.equal(g.s.prompt.kind,'move');
  const h=harness(g,1),before=structuredClone(g.s);
  await h.click({space:'4'});
  assert.deepEqual(g.s,before);
  assert.match(h.ui.decision(''),/Move to space 4/);
  await h.click({space:'6'});
  assert.deepEqual(g.s,before);
  await h.click({mobile:'confirm-space'});
  assert.equal(g.s.players[1].pos,6);
  assert.equal(h.out.commands,1);
  await h.click({mobile:'confirm-space'});
  assert.equal(h.out.commands,1);
});

test('an online revision change invalidates a staged destination',async()=>{
  const g=reactionGame();
  g.react(1,g.s.players[1].hand[0].uid);
  g.room={id:'test-room',revision:4};
  const h=harness(g,1);
  await h.click({space:'4'});
  g.room.revision=5;
  await h.click({mobile:'confirm-space'});
  assert.equal(h.out.commands,0);
  assert.equal(g.s.players[1].pos,5);
  assert.equal(g.s.prompt.kind,'move');
});

test('hero ability inspection preserves resources and uses the existing ability only on confirmation',async()=>{
  const g=reactionGame(['MAR','ALF']);
  g.s.players[0].tokens=1;
  g.pass(1);
  const h=harness(g),before=structuredClone(g.s);
  await h.click({abilityCard:'advance'});
  assert.deepEqual(g.s,before);
  assert.match(h.out.html,/How to gain/);
  await h.click({mobile:'use-ability'});
  assert.equal(h.out.commands,1);
  assert.equal(g.s.players[0].tokens,0);
  assert.equal(g.s.prompt.kind,'move');
  assert.equal(g.s.players[0].pos,3);
});

test('Wind replacement describes relocating a marker, including flattened online prompts',()=>{
  const g=fresh(['MEI','ALF']);
  g.s.players[0].pos=4;
  g.s.players[0].wind=[2,6,8];
  g.ask(0,'wind-replace','Relocate a Wind marker.',[2,6,8],{op:'token',key:'replace',to:4});
  const solo=movementDescription(g,6);
  const online=Brawl2.restore(data,projectGame(g,0));
  assert.equal(online.s.prompt.task,undefined);
  assert.equal(movementDescription(online,6),solo);
  assert.match(solo,/from space 6 to space 4/);
  assert.match(solo,/fighter stays put/);
});

test('state keys change for viewer, pending prompt, shifted Loot and server revision',()=>{
  const g=fresh(),initial=mobileStateKey(g,0);
  assert.notEqual(mobileStateKey(g,1),initial);
  g.s.players[0].loot=[data.heroes[0].defaultLoot[0]];
  assert.notEqual(mobileStateKey(g,0),initial);
  const withLoot=mobileStateKey(g,0);
  g.ask(0,'move','Move now.',[2,3,4],{op:'move',n:1});
  assert.notEqual(mobileStateKey(g,0),withLoot);
  const withPrompt=mobileStateKey(g,0);
  g.room={id:'room',revision:1};
  assert.notEqual(mobileStateKey(g,0),withPrompt);
  const firstRevision=mobileStateKey(g,0);
  g.room.revision=2;
  assert.notEqual(mobileStateKey(g,0),firstRevision);
});

test('online mobile decisions use the public projection without revealing rival plans',()=>{
  const g=fresh();
  g.s.players[1].hand=['A02','A03','A10'].map(id=>g.instance(id));
  g.commit(1,g.hand(1,'Attack').map(c=>c.uid));
  const projected=Brawl2.restore(data,projectGame(g,0));
  const html=harness(projected).ui.decision('');
  assert.doesNotMatch(html,/Quick on the Draw/);
  assert.doesNotMatch(html,new RegExp(g.def('A03').name));
  assert.doesNotMatch(html,/Perfect Preparation/);
});
