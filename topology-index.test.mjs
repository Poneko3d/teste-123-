import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {topologyIndex} from './src/topology-index.js';
import {rawTopology} from './src/continuous.js';
import {generateFaceGroups} from './src/face-groups.js';
const api=await Module();api.setup();
for(const solid of [api.Manifold.cube([3,4,5]),api.Manifold.sphere(10,64)]){
 const mesh=solid.getMesh(),original=mesh.triVerts.slice(),t=rawTopology(mesh),edges=new Map(),neighbors=t.vertices.map(()=>[]);
 t.faces.forEach((f,id)=>{for(let j=0;j<3;j++){const a=f[j],b=f[(j+1)%3],key=a<b?a+':'+b:b+':'+a;if(!edges.has(key)){edges.set(key,[]);neighbors[a].push(b);neighbors[b].push(a);}edges.get(key).push(id);}});
 assert.deepEqual([...t.edges], [...edges]);assert.deepEqual(t.neighbors,neighbors);assert.equal(t.edges.size,edges.size);
 for(let face=0;face<t.faces.length;face++)for(let edge=0;edge<3;edge++){
  const f=t.faces[face],a=f[edge],b=f[(edge+1)%3],key=a<b?a+':'+b:b+':'+a;
  assert.equal(t.adjacentFace(face,edge),edges.get(key).find(n=>n!==face));
 }
 for(const method of ['edges','orientation'])for(const size of [0,.2]){
  const old=generateFaceGroups({...t,edges,adjacentFace:undefined},15,method,size),next=generateFaceGroups(t,15,method,size);
  assert.deepEqual(next.labels,old.labels);assert.equal(next.count,old.count);
 }
 assert.deepEqual(mesh.triVerts,original);assert.equal(t.edges.get('999999:999998'),undefined);solid.delete();
}
assert.throws(()=>topologyIndex(Uint32Array.from([0,1,2]),3),/borda aberta/);
assert.throws(()=>topologyIndex(Uint32Array.from([0,1,2,1,0,3,0,1,4]),5),/borda aberta/);
console.log('PASS compact connectivity: exact edge order, adjacency, lazy neighbors, identical groups, unchanged indices and invalid mesh rejection.');
