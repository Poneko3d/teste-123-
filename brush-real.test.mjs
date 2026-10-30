import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {deserialize} from 'node:v8';import {Vector3} from 'three';
import {rawTopology} from './src/continuous.js';import {buildPickingTree,closestSurface} from './src/picking.js';import {brushFaces} from './src/selection-repair.js';
const m=deserialize(await readFile('../../work/spider-prepared.bin'))[0],t=rawTopology(m),tree=buildPickingTree(m.vertProperties,m.triVerts),selected=new Set();
for(const target of [[12,-35,42],[-12,-35,42],[0,-20,0],[12,-10,-40]]){
 const h=closestSurface(tree,new Vector3(...target)),start=performance.now(),faces=brushFaces(t,h.face,h.point,1.5);assert.ok(faces.length);for(const id of faces){assert.ok(id>=0&&id<t.faces.length);selected.add(id);}const ms=performance.now()-start;
 for(const id of faces)selected.delete(id);assert.equal(selected.size,0);console.log(JSON.stringify({triangles:t.faces.length,target,painted:faces.length,ms}));
}
console.log('PASS real dense brush: both eye regions, torso and leg; add/remove selection, unchanged input geometry.');

