import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createMobileSession,readMobilePreference} from '../public/brawl2/mobile-session.js';
import {PlaytestRecorder} from '../public/brawl2/playtest-recorder.js';
import {Brawl2} from '../public/brawl2/engine.js';
const data=JSON.parse(readFileSync(new URL('../public/brawl2/data.json',import.meta.url),'utf8'));
const KEY='test-save';
const REC=KEY+'-mobile-playtest-v1';
function fixture(options={}){
 let now=1000;
 const map=new Map();
 const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const doc=new EventTarget();doc.hidden=false;
 const win=new EventTarget();
 const game=new Brawl2(data,{seed:123});
 const ctx={game,mode:'solo',viewer:0,screen:'game'};
 const recorder=new PlaytestRecorder(()=>now);
 const history=[];
 const config={enabled:true,saveKey:KEY,recorder,getContext:()=>ctx,onStatus:s=>history.push(s),storage,document:doc,window:win,clock:()=>now,...options};
 const session=createMobileSession(config);
 return {map,storage,doc,win,game,ctx,recorder,history,session,config,setNow:n=>{now=n;}};
}
test('disabled helper leaves desktop persistence and listeners alone',()=>{
 const f=fixture({enabled:false});
 f.recorder.start(f.game.s,0,'solo');
 assert.equal(f.session.save(),false);
 f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));
 assert.equal(f.map.size,0);assert.equal(f.history.length,0);
});
test('denied preference storage falls back without throwing',()=>{
 assert.equal(readMobilePreference('brawl2-flow','on',{getItem(){throw Error('denied');}}),'on');
});
test('local save checkpoints current state and only opt-in public recording',()=>{
 const f=fixture();
 f.session.save();assert.equal(f.map.has(REC),false);
 f.game.s.players[1].hand[0].id='OPPONENT_PRIVATE_CANARY';
 f.game.s.players[1].hand[0].uid='PRIVATE_UID';
 f.recorder.start(f.game.s,0,'solo');
 f.setNow(2000);f.game.s.players[0].hp=17;f.session.save();
 assert.equal(JSON.parse(f.map.get(KEY)).players[0].hp,17);
 const report=JSON.parse(f.map.get(REC)).report;
 assert.equal(report.exchanges.at(-1).resources[0].hp,17);
 assert.equal(report.foregroundMs,1000);
 assert.doesNotMatch(JSON.stringify(report),/OPPONENT_PRIVATE_CANARY|PRIVATE_UID/);
 assert.equal(f.session.status.saved,true);
});
test('online checkpoints exclude authoritative game and private credentials',()=>{
 const f=fixture();f.ctx.mode='online';f.game.room={id:'ROOM_A'};f.game.token='SECRET_TOKEN';
 f.recorder.start(f.game.s,0,'online');f.session.checkpoint();
 assert.equal(f.map.has(KEY),false);
 assert.doesNotMatch(f.map.get(REC),/SECRET_TOKEN/);
 assert.equal(JSON.parse(f.map.get(REC)).identity.room,'ROOM_A');
 assert.doesNotMatch(JSON.stringify(JSON.parse(f.map.get(REC)).report),/ROOM_A/);
});
test('reload restores opt-in recording and counts absence as hidden time',()=>{
 const f=fixture();f.recorder.start(f.game.s,0,'solo');f.setNow(2000);f.session.save();
 f.recorder.enabled=false;f.setNow(5000);
 assert.equal(f.session.restoreRecording(),true);
 assert.equal(f.recorder.report.foregroundMs,1000);
 assert.equal(f.recorder.report.hiddenMs,3000);
 assert.equal(f.recorder.report.exchanges.length,1);
});
test('another online room with identical Heroes cannot restore old recording',()=>{
 const f=fixture();f.ctx.mode='online';f.game.room={id:'ROOM_A'};
 f.recorder.start(f.game.s,0,'online');f.session.save();f.recorder.enabled=false;
 f.game.room={id:'ROOM_B'};
 assert.equal(f.session.restoreRecording(),false);
 assert.equal(f.recorder.enabled,false);
});
test('finished report does not accrue time after reload',()=>{
 const f=fixture();f.recorder.start(f.game.s,0,'solo');f.game.s.phase='over';f.game.s.winner=0;f.setNow(2000);f.session.save();
 f.recorder.enabled=false;f.setNow(10000);f.session.restoreRecording();
 assert.equal(f.recorder.finished,true);assert.equal(f.recorder.report.hiddenMs,0);
});
test('corrupt recording is ignored without affecting resumed game',()=>{
 const f=fixture();f.map.set(REC,'{bad json');
 assert.equal(f.session.restoreRecording(),false);assert.equal(f.game.s.phase,'program');
});
test('save failure remains truthful and does not stop play or recording',()=>{
 const f=fixture({storage:{getItem(){return null;},setItem(){throw Error('quota');},removeItem(){}}});
 f.recorder.start(f.game.s,0,'solo');assert.equal(f.session.save(),false);
 assert.equal(f.session.status.saved,false);assert.equal(f.session.status.recordingSaved,false);
 assert.equal(f.recorder.enabled,true);assert.equal(f.game.s.phase,'program');
});
test('background event checkpoints before resume',async()=>{
 let resumes=0;const f=fixture({onResume:async()=>{resumes++;}});
 f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));
 assert.equal(f.map.has(KEY),true);
 f.doc.hidden=false;await f.session.resume();assert.equal(resumes,1);
});
test('online resume failure keeps controls gated until an applied poll snapshot',async()=>{
 const f=fixture({onResume:async()=>{throw Error('offline');}});f.ctx.mode='online';f.game.room={id:'ROOM_A'};
 await f.session.resume();assert.equal(f.session.resuming,true);assert.equal(f.session.status.connected,false);
 f.session.setConnected(true);assert.equal(f.session.resuming,false);assert.equal(f.session.status.connected,true);
});
test('synchronous refresh failure allows a later retry',async()=>{
 let calls=0;const f=fixture({onResume:()=>{calls++;if(calls===1)throw Error('first');}});f.ctx.mode='online';
 await f.session.resume();assert.equal(f.session.resuming,true);
 await f.session.resume();assert.equal(calls,2);assert.equal(f.session.resuming,false);
});
test('offline gates mobile online input; online reconciles once',async()=>{
 let calls=0;const f=fixture({onResume:async()=>{calls++;}});f.ctx.mode='online';
 f.win.dispatchEvent(new Event('offline'));assert.equal(f.session.resuming,true);
 f.win.dispatchEvent(new Event('online'));await f.session.resume();assert.equal(calls,1);assert.equal(f.session.resuming,false);
});
test('new match clears persisted opt-in and destroy removes lifecycle effects',()=>{
 const f=fixture();f.recorder.start(f.game.s,0,'solo');f.session.save();f.session.clearRecording();
 assert.equal(f.map.has(REC),false);
 f.map.clear();f.session.destroy();f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));
 assert.equal(f.map.size,0);
});
