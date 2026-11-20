import test from 'node:test';
import assert from 'node:assert/strict';
import {lastStandTransitions,lastStandArt} from '../public/brawl2/last-stand.js';
test('activation cues fire only on a new transition, including simultaneous transforms',()=>{
 assert.deepEqual(lastStandTransitions(null,[{ultimate:true},{ultimate:false}]),[]);
 assert.deepEqual(lastStandTransitions([false,false],[{ultimate:true},{ultimate:true}]),[0,1]);
 assert.deepEqual(lastStandTransitions([true,false],[{ultimate:true},{ultimate:false}]),[]);
});
test('art preserves normal and Raven silhouettes while selecting transformed sprites',()=>{
 assert.equal(lastStandArt({hero:'SMA',ultimate:false},'base.webp'),'base.webp');
 assert.equal(lastStandArt({hero:'SMA',ultimate:true},'base.webp'),'assets/last-stand/SMA.webp');
 assert.equal(lastStandArt({hero:'RAV',ultimate:true},'raven.webp'),'raven.webp');
});
