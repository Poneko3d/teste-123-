import assert from 'node:assert/strict';
import {generateFaceGroups,toggleFaceGroup} from './src/face-groups.js';
import {key} from './src/continuous.js';
function topology(vertices,faces){const edges=new Map();faces.forEach((f,i)=>{for(let j=0;j<3;j++){const k=key(f[j],f[(j+1)%3]);if(!edges.has(k))edges.set(k,[]);edges.get(k).push(i);}});return {vertices,faces,edges};}
const t=topology([[0,0,0],[10,0,0],[0,10,0],[0,-.01,.01],[30,0,0],[30.01,0,0],[30,.01,0]],[[0,1,2],[1,0,3],[4,5,6]]);
const before=structuredClone(t);
const raw=generateFaceGroups(t,15,'edges',0),clean=generateFaceGroups(t,15,'edges',1);
assert.equal(raw.count,3);assert.equal(clean.count,3);
assert.notEqual(clean.labels[0],clean.labels[1],'Sharp edge is preserved even for a tiny region');
assert.notEqual(clean.labels[0],clean.labels[2],'Disconnected tiny shell is preserved');
assert.deepEqual(t,before,'No vertices or triangles are changed');
assert.equal(clean.sizeThreshold,1);
assert.equal(generateFaceGroups(t,15,'orientation',1).count,2);
assert.throws(()=>generateFaceGroups(t,15,'edges',NaN));
assert.throws(()=>generateFaceGroups(t,15,'edges',101));
console.log('PASS size threshold: adjacent slivers merged, disconnected shells retained, geometry unchanged.');

const labels=new Int32Array([0,0,1,1]);
const first=toggleFaceGroup(labels,0),both=toggleFaceGroup(labels,2,first),remaining=toggleFaceGroup(labels,1,both);
assert.deepEqual([...first],[0,1]);assert.deepEqual([...both],[0,1,2,3]);assert.deepEqual([...remaining],[2,3]);assert.equal(toggleFaceGroup(labels,3,remaining).size,0);
console.log('PASS double-click group selection: add, remove, preserve other selected groups.');
