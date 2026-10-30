import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {profileConnector} from './src/profile-connector.js';
const api=await Module();api.setup();const source=api.Manifold.cube([30,30,20],true),points=[[-8,-6,10],[8,-6,10],[8,0,10],[3,0,10],[3,6,10],[-8,6,10]],cfg={patchDepth:2,profileArea:70,depth:3,clearance:.2,connector:true};
const {parts}=profileConnector(api,source,points,[0,0,1],cfg);assert.equal(parts.length,2);for(const part of parts){assert.equal(part.status(),'NoError');assert.ok(part.volume()>0);const outside=part.subtract(source);assert.ok(outside.volume()<1e-5);outside.delete();}
// Cross-sections follow one continuous taper, including the old shoulder level.
const polygonArea=162,ratio=Math.sqrt(.7),tipZ=5,mouthZ=10;
for(const z of [5.01,7.99,8.01,9.99]){
 const slice=parts[0].slice(z),scale=ratio+(1-ratio)*(z-tipZ)/(mouthZ-tipZ);
 assert.ok(Math.abs(slice.area()-polygonArea*scale*scale)<1e-3,'continuous taper at z='+z);slice.delete();
}
const overlap=parts[0].intersect(parts[1]);assert.ok(overlap.volume()<1e-5);overlap.delete();const total=parts[0].volume()+parts[1].volume();assert.ok(total<source.volume());assert.ok(total>source.volume()*.9);parts.forEach(p=>p.delete());
const plain=profileConnector(api,source,points,[0,0,1],{...cfg,connector:false});assert.ok(Math.abs(plain.parts.reduce((v,p)=>v+p.volume(),0)-source.volume())<1e-5);assert.ok(Math.abs(plain.parts[0].boundingBox().min[2]-8)<1e-5,'no extension: depth stops at the patch thickness');
const plainSection=plain.parts[0].slice(8.01);assert.ok(plainSection.area()<polygonArea*.72,'disabled extension retains the tapered profile');plainSection.delete();plain.parts.forEach(p=>p.delete());
assert.throws(()=>profileConnector(api,source,points,[0,0,1],{...cfg,depth:100}),/atravessa/);const side=profileConnector(api,source,[[15,-6,-5],[15,6,-5],[15,6,5],[15,-6,5]],[1,0,0],cfg);assert.ok(side.parts.every(p=>p.status()==='NoError'));side.parts.forEach(p=>p.delete());source.delete();console.log('Passed planar concave patch: two closed solids, shaped tongue/socket, clearance, no overlap, depth validation.');

// A plain patch is clipped to existing material; it needs no free-standing
// tongue to fit completely inside a thin wall.
const thin=api.Manifold.cube([30,30,1],true),rim=[[-8,-6,.5],[8,-6,.5],[8,6,.5],[-8,6,.5]];
const clipped=profileConnector(api,thin,rim,[0,0,1],{...cfg,patchDepth:2,connector:false});
assert.ok(clipped.parts.every(p=>p.status()==='NoError'&&p.volume()>0));assert.ok(Math.abs(clipped.parts.reduce((v,p)=>v+p.volume(),0)-thin.volume())<1e-5);
assert.throws(()=>profileConnector(api,thin,rim,[0,0,1],{...cfg,patchDepth:2,connector:true}),/atravessa/);
clipped.parts.forEach(p=>p.delete());thin.delete();console.log('Passed: patch without extension clips to a thin wall; oversized extended connector remains rejected.');

// A projected cutter used to capture an unrelated overhanging rim fragment.
// The selected-surface loft must preserve the cap and leave that material alone.
const {rawTopology}=await import('./src/continuous.js'),{faceGroupBoundary}=await import('./src/face-groups.js'),{profileRegion}=await import('./src/profile-region.js');
const base=api.Manifold.cylinder(10,8,8,32,true),chipBase=api.Manifold.cube([.3,.3,.3],true),chip=chipBase.translate([6,0,6]),withRim=base.add(chip),topology=rawTopology(withRim.getMesh());
const selected=[];topology.faces.forEach((f,id)=>{if(f.every(v=>Math.abs(topology.vertices[v][2]-5)<1e-5))selected.push(id);});
const boundary=faceGroupBoundary(topology,selected),region=profileRegion(topology,boundary.paths),outline=boundary.ring.map(id=>topology.vertices[id]);assert.ok(region);
const clean=profileConnector(api,withRim,outline,[0,0,1],{...cfg,connector:false,region});const components=clean.parts[0].decompose();assert.equal(components.length,1);components.forEach(p=>p.delete());
assert.ok(Math.abs(clean.parts.reduce((v,p)=>v+p.volume(),0)-withRim.volume())<1e-4,'material is partitioned, never dropped');
const retained=clean.parts[1].intersect(chip);assert.ok(Math.abs(retained.volume()-chip.volume())<1e-6,'unselected rim stays in original object');retained.delete();
const mesh=clean.parts[0].getMesh(),coords=new Set();for(let i=0;i<mesh.vertProperties.length;i+=mesh.numProp)coords.add(Array.from(mesh.vertProperties.slice(i,i+3)).join(','));for(const p of region.vertices)assert.ok(coords.has(p.join(',')),'selected exterior vertices remain exact');
clean.parts.forEach(p=>p.delete());[base,chipBase,chip,withRim].forEach(p=>p.delete());console.log('Passed: actual selected surface preserved, no stray rim captured, original material conserved.');

// Selected-face thick patches use the same thin-wall clipping rule.
const thinFace=api.Manifold.cube([30,30,1],true),thinRegion={vertices:rim,faces:[[0,1,2],[0,2,3]],ring:[0,1,2,3]};
const clippedFace=profileConnector(api,thinFace,rim,[0,0,1],{...cfg,patchDepth:2,connector:false,region:thinRegion});
assert.ok(clippedFace.parts.every(p=>p.status()==='NoError'&&p.volume()>0));assert.ok(Math.abs(clippedFace.parts.reduce((n,p)=>n+p.volume(),0)-thinFace.volume())<1e-5);
assert.throws(()=>profileConnector(api,thinFace,rim,[0,0,1],{...cfg,patchDepth:2,connector:true,region:thinRegion}),/atravessa/);
clippedFace.parts.forEach(p=>p.delete());thinFace.delete();console.log('PASS selected thin-wall patch: clipped without extension, excess extension rejected.');

// Closed inner shells describe cavities, not detached fragments.
const outer=api.Manifold.cube([30,30,20],true),voidTool=api.Manifold.cube([2,2,2],true).translate([0,0,-5]),hollow=outer.subtract(voidTool);
const hollowCut=profileConnector(api,hollow,points,[0,0,1],{...cfg,connector:false});
assert.ok(Math.abs(hollowCut.parts.reduce((sum,p)=>sum+p.volume(),0)-hollow.volume())<1e-5);
assert.ok(hollowCut.parts.every(p=>p.status()==='NoError'));
assert.ok(hollowCut.parts[1].decompose().some(p=>{const negative=p.volume()<0;p.delete();return negative;}));
hollowCut.parts.forEach(p=>p.delete());outer.delete();voidTool.delete();hollow.delete();
console.log('PASS Thick Patch preserves enclosed cavities instead of rejecting them as detached parts.');
