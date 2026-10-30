import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {Vector3} from 'three';
import {rawTopology,surfacePath,carveSurface} from './src/continuous.js';
import {contourSurface,splitContour} from './src/surface.js';
import {buildPickingTree,closestSurface} from './src/picking.js';
const api=await Module();api.setup();
let source=api.Manifold.sphere(30,48);
if(process.argv.includes('--real')){const {readFile}=await import('node:fs/promises'),{deserialize}=await import('node:v8');source.delete();source=new api.Manifold(new api.Mesh(deserialize(await readFile('../../work/spider-prepared.bin'))[0]));}
const mesh=source.getMesh(),t=rawTopology(mesh),tree=buildPickingTree(mesh.vertProperties,mesh.triVerts),real=process.argv.includes('--real');
const anchors=Array.from({length:6},(_,i)=>{const q=i*Math.PI*2/6;return closestSurface(tree,real?new Vector3(8+4*Math.cos(q),-35,42+4*Math.sin(q)):new Vector3(30,5*Math.cos(q)+.123,5*Math.sin(q)+.321));});
const paths=anchors.map((a,i)=>surfacePath(t,a,anchors[(i+1)%anchors.length],{local:true})),carved=carveSurface(t,paths);
assert.throws(()=>carveSurface(t,[paths[0],paths[2]]),/interrupção/,'A genuine missing segment must remain invalid');
const s=contourSurface(carved.topology,carved.ring),boundary=carved.ring.map(i=>[...s.vertices[i]]),candidates=splitContour(api,carved.topology,s),parts=candidates.map(p=>p.intersect(source));
for(const p of parts){assert.equal(p.status(),'NoError');assert.ok(p.volume()>0);}
carved.ring.forEach((id,i)=>assert.deepEqual(s.vertices[id],boundary[i]));
const union=parts[0].add(parts[1]),missing=source.subtract(union),outside=union.subtract(source),overlap=parts[0].intersect(parts[1]);
assert.ok(missing.volume()<source.volume()*1e-6);assert.ok(outside.volume()<source.volume()*1e-6);assert.ok(overlap.volume()<source.volume()*1e-6);
console.log('PASS '+(real?'Miranha 1.85M triangles':'sphere')+': connected contour, genuine gap rejected, two valid solids, original boundary, conserved volume.');
[...candidates,...parts,union,missing,outside,overlap,source].forEach(p=>p.delete());
