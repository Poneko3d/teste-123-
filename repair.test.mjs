import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import * as THREE from 'three';
import {importSolid} from './src/geometry.js';
const api=await Module();api.setup();
const box=new THREE.BoxGeometry(20,20,20).toNonIndexed();
const base=Array.from(box.attributes.position.array);
const triangles=p=>Array.from({length:p.length/9},(_,i)=>p.slice(i*9,i*9+9));
const flip=t=>[...t.slice(6,9),...t.slice(3,6),...t.slice(0,3)];
function verify(label,positions,expected,check=()=>{}){
 let report;const solid=importSolid(api,positions,r=>report=r);
 assert.equal(solid.status(),'NoError',label);assert.ok(Math.abs(solid.volume()-expected)<.1,`${label}: ${solid.volume()}`);
 const halves=solid.splitByPlane([0,0,1],0);assert.ok(halves.every(s=>s.status()==='NoError'&&!s.isEmpty()),label);halves.forEach(s=>s.delete());
 check(report);solid.delete();console.log('Passed:',label);
}
verify('unchanged healthy shell',base,8000,r=>assert.deepEqual([r.holes,r.flipped,r.removed,r.welded],[0,0,0,0]));
verify('all faces inward',triangles(base).map(flip).flat(),8000,r=>assert.ok(r.flipped>0));
verify('mixed winding',triangles(base).map((t,i)=>i%3?flip(t):t).flat(),8000);
verify('missing rectangular side',base.slice(18),8000,r=>assert.equal(r.holes,1));
verify('duplicate and zero-area faces',[...base,...base.slice(0,9),0,0,0,0,0,0,0,0,0],8000,r=>assert.equal(r.removed,2));
const cracked=[...base];cracked[0]+=1e-5;verify('tiny coordinate crack',cracked,8000,r=>assert.ok(r.welded>0));
const inner=triangles(base.map(v=>v*.5)).map(flip).flat();verify('nested cavity preserved',[...base,...inner],7000);
assert.throws(()=>importSolid(api,[0,0,0,1,0,0,0,1,0]),/fechad/);
assert.throws(()=>importSolid(api,[...base,10,10,10,10,-10,10,20,0,0]),/duas faces/);
assert.throws(()=>importSolid(api,[NaN,...base.slice(1)]),/inválidas/);
console.log('Passed: repair, volume preservation, hollow shells, cut after repair, invalid geometry rejection.');
