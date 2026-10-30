import assert from 'node:assert/strict';
import {pinFits,placePin} from './src/pin-placement.js';
const area={polygon:[[0,0],[40,0],[40,10],[10,10],[10,40],[0,40]],center:[20,20]},c={u:0,v:0,width:4,thickness:4,clearance:.2};
assert.equal(pinFits(area,c),false);const best=placePin(area,c,true);assert.ok(best);assert.ok(pinFits(area,{...c,...best}));
const bounded=placePin(area,{...c,u:999,v:999});assert.ok(pinFits(area,{...c,...bounded}));
assert.equal(placePin(area,{...c,width:200},true),null);
assert.deepEqual(placePin(area,{...c,...best}),best);
console.log('Passed: concave cut, automatic interior placement, boundary constraint, oversized pin, valid position preserved.');
