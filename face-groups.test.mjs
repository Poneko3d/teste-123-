import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {rawTopology,key} from './src/continuous.js';
import {generateFaceGroups,selectFaceGroup,faceGroupBoundary} from './src/face-groups.js';
const api=await Module();api.setup();
const cube=api.Manifold.cube([20,20,20],true),t=rawTopology(cube.getMesh()),g=generateFaceGroups(t,20);
assert.equal(g.count,6);assert.equal(generateFaceGroups(t,20,'edges').count,6);assert.equal(generateFaceGroups(t,90,'edges').count,1);assert.equal(g.labels.length,t.faces.length);assert.ok([...g.labels].every(n=>n>=0));
let selected=selectFaceGroup(g.labels,0);assert.equal(selected.size,2);
const other=g.labels.findIndex(n=>n!==g.labels[0]);selected=selectFaceGroup(g.labels,other,selected,true);assert.equal(selected.size,4);
selected=selectFaceGroup(g.labels,other,selected,false);assert.equal(selected.size,2);
assert.equal(faceGroupBoundary(t,[...selected]).ring.length,4);
const sphere=api.Manifold.sphere(20,40),st=rawTopology(sphere.getMesh()),fine=generateFaceGroups(st,10),coarse=generateFaceGroups(st,45);assert.ok(fine.count>coarse.count);assert.equal(generateFaceGroups(st,45,'edges').count,1);assert.ok(coarse.count>1);
for(let label=0;label<coarse.count;label++){const first=coarse.labels.findIndex(n=>n===label),seen=new Set([first]),queue=[first];for(let q=0;q<queue.length;q++){const f=st.faces[queue[q]];for(let e=0;e<3;e++)for(const id of st.edges.get(key(f[e],f[(e+1)%3])))if(coarse.labels[id]===label&&!seen.has(id)){seen.add(id);queue.push(id);}}assert.equal(seen.size,[...coarse.labels].filter(n=>n===label).length);}
const patchFaces=st.faces.map((f,i)=>({f,i})).filter(({f})=>f.every(v=>st.vertices[v][2]>3)).map(x=>x.i);
const intact=faceGroupBoundary(st,patchFaces),boundaryVertices=new Set(intact.ring),hole=patchFaces.find(i=>st.faces[i].every(v=>!boundaryVertices.has(v)));
assert.notEqual(hole,undefined);const repaired=faceGroupBoundary(st,patchFaces.filter(i=>i!==hole));assert.equal(repaired.filledFaces,1);assert.deepEqual(new Set(repaired.ring),new Set(intact.ring),'fills a tiny hole without changing the outside boundary');
const north=patchFaces[0],south=st.faces.findIndex(f=>f.every(v=>st.vertices[v][2]<-10));assert.throws(()=>faceGroupBoundary(st,[north,south]),'must not bridge disconnected selections');
assert.throws(()=>generateFaceGroups(t,NaN));cube.delete();sphere.delete();
console.log('Passed whole-model grouping: complete coverage, connected groups, adjustable threshold, replace/add selection, group contour.');
