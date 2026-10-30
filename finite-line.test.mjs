import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {screenCut} from './src/screen-cut.js';
import {projectedPins} from './src/projected-pins.js';
import {resolveProfileInput} from './src/profile-input.js';
import {profileConnector} from './src/profile-connector.js';
import {rawTopology} from './src/continuous.js';
import {faceGroupBoundary} from './src/face-groups.js';
const api=await Module();api.setup();
const left=api.Manifold.cube([12,12,40],true).translate([-12,0,0]),right=api.Manifold.cube([12,12,40],true).translate([12,0,0]),bridge=api.Manifold.cube([36,12,6],true).translate([0,0,17]),source=api.Manifold.union([left,right,bridge]);
const spec={kind:'line',origin:[0,0,0],normal:[0,-1,0],u:[1,0,0],v:[0,0,1],distance:200,points:[[-22,0],[-3,0]]};
const cfg={connector:true,width:5,thickness:4,depth:3,tipScale:.8,clearance:.15,pinShape:'rectangle',pinSide:'first'};
for(const points of [spec.points,[...spec.points].reverse()]){const s={...spec,points},cut=screenCut(api,source,s),pins=projectedPins(api,source,cut.parts,s,cfg);assert.equal(pins.plans.length,1);const volumes=pins.parts.map(p=>{const i=p.intersect(right),v=i.volume();i.delete();return v;});assert.ok(volumes.some(v=>Math.abs(v-right.volume())<1e-3),'opposite leg remains whole');pins.parts.forEach(p=>p.delete());cut.parts.forEach(p=>p.delete());}
if(process.argv.includes('--real')){const {readFile}=await import('node:fs/promises'),{deserialize}=await import('node:v8');
 const original=deserialize(await readFile('../../work/spider-prepared.bin'))[0],model=new api.Manifold(new api.Mesh(original)),s={...spec,origin:[0,0,-55],points:[[-35,0],[-2,0]]},cut=screenCut(api,model,s),pins=projectedPins(api,model,cut.parts,s,cfg);assert.equal(pins.plans.length,1);console.log('Miranha finite line: one connector');pins.parts.forEach(p=>p.delete());cut.parts.forEach(p=>p.delete());model.delete();
 for(const file of ['eye15-7753','eye15-8302']){const data=deserialize(await readFile('../../work/'+file+'.bin')),solid=new api.Manifold(new api.Mesh(data.mesh)),top=rawTopology(data.mesh),boundary=faceGroupBoundary(top,data.faces),input=resolveProfileInput(top,boundary.paths,{}),result=profileConnector(api,solid,input.points,input.outward,{...cfg,patchDepth:2,profileArea:70,region:input.region});assert.ok(result.parts.every(p=>p.status()==='NoError'));result.parts.forEach(p=>p.delete());solid.delete();console.log(file+': surface patch valid without stored normal');}
}
[left,right,bridge,source].forEach(p=>p.delete());console.log('PASS finite strokes and profile surface resolution');
