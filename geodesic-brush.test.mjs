import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {Vector3,Triangle} from 'three';
import {rawTopology,surfacePath,slicingSurfacePath} from './src/continuous.js';
import {brushFaces} from './src/selection-repair.js';
import {buildPickingTree,closestSurface} from './src/picking.js';
import {deserialize} from 'node:v8';import {readFileSync} from 'node:fs';
const api=await Module();api.setup();const cube=api.Manifold.cube([2,2,2],true),t=rawTopology(cube.getMesh());
const p=t.faces[0].map(i=>t.vertices[i]).reduce((s,p)=>s.map((x,i)=>x+p[i]/3),[0,0,0]);
const flat=brushFaces(t,0,p,4,'plane'),sphere=brushFaces(t,0,p,4,'sphere');assert.equal(sphere.length,12);assert.equal(flat.length,2);assert(flat.every(i=>sphere.includes(i)));cube.delete();
if(!process.argv.includes('--real')){console.log('PASS planar and spherical brush footprints');process.exit(0);}
const mesh=deserialize(readFileSync('../../work/spider-prepared.bin'))[0],model=rawTopology(mesh),tree=buildPickingTree(mesh.vertProperties,mesh.triVerts);
const len=p=>p.points.slice(1).reduce((s,x,i)=>s+new Vector3(...x).distanceTo(new Vector3(...p.points[i])),0);
let improved=0;
for(const [aa,bb] of [ [[14.519083769991994,-25,37.87118846550584],[11.434581873938441,-25,35.12974749132991]], [[-10,-28,42],[10,-28,42]],[[4,-35,40],[14,-35,44]],[[-12,-25,65],[8,-25,63]],[[8,-25,90],[15,-25,100]],[[12,-35,42],[10,-35,45.464101615]] ]){
 const a=closestSurface(tree,new Vector3(...aa)),b=closestSurface(tree,new Vector3(...bb)),path=surfacePath(model,a,b);let old;try{old=slicingSurfacePath(model,a,b,{local:true})}catch{}
 assert(path.points.length===path.faces.length+1);for(let i=0;i<path.faces.length;i++){const tri=new Triangle(...model.faces[path.faces[i]].map(v=>new Vector3(...model.vertices[v])));for(const q of [path.points[i],path.points[i+1]]){const v=new Vector3(...q);assert(tri.closestPointToPoint(v,new Vector3()).distanceTo(v)<1e-4);}}
 if(old){assert(len(path)<=len(old)*1.000001);if(len(path)<len(old)*.99)improved++;console.log(JSON.stringify({before:len(old),after:len(path),segments:path.faces.length}));}
}
assert(improved>0,'Known curved-region detour must become shorter');
console.log('PASS brush disk versus sphere, real-model paths remain on original triangles; shorter routes:',improved);
