import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'manifold-3d';
import {decodeProject} from './src/project-file.js';
import {scaleMesh} from './src/rescale.js';
import {rawTopology} from './src/continuous.js';
import {resolveProfileInput} from './src/profile-input.js';
import {profileConnector} from './src/profile-connector.js';
const file=process.argv[2],height=Number(process.argv[3]||0);
if(!file)throw Error('Pass a saved .poneko project and optional height in mm');
const {state:s}=decodeProject(new Uint8Array(fs.readFileSync(file)));
const d=s.editor.drafts.find(x=>x[0]===s.editor.activeId)[1];
let mesh=s.items.find(x=>x.id===s.editor.activeId).mesh;
const t=rawTopology(mesh),input=resolveProfileInput(t,d.segments,d.cfg);
if(height){
 let lo=Infinity,hi=-Infinity;
 for(let i=2;i<mesh.vertProperties.length;i+=mesh.numProp){lo=Math.min(lo,mesh.vertProperties[i]);hi=Math.max(hi,mesh.vertProperties[i]);}
 const factor=height/(hi-lo);mesh=scaleMesh(mesh,factor);
 input.points=input.points.map(p=>p.map(v=>v*factor)); if(input.region)input.region.vertices=input.region.vertices.map(p=>p.map(v=>v*factor));
 console.log({height,factor,triangles:mesh.triVerts.length/3});
}
const api=await Module();api.setup();const source=new api.Manifold(new api.Mesh(mesh));
console.time('real contour');
const result=profileConnector(api,source,input.points,input.outward,{...d.cfg,patchDepth:height?2:.002,connector:false,region:input.region,projectedRepair:input.projectedRepair});
try{
 for(const part of result.parts){assert.equal(part.status(),'NoError');const components=part.decompose();assert.equal(components.filter(p=>p.volume()>0).length,1);components.forEach(p=>p.delete());}
 const union=result.parts[0].add(result.parts[1]),missing=source.subtract(union),outside=union.subtract(source),overlap=result.parts[0].intersect(result.parts[1]);
 try{for(const p of [missing,outside,overlap]){assert.equal(p.status(),'NoError');assert.ok(Math.abs(p.volume())<=source.volume()*1e-7);}}finally{[union,missing,outside,overlap].forEach(p=>p.delete());}
 console.timeEnd('real contour');console.log('PASS saved contour: two closed connected parts; volume conservation, no model decimation.');
}finally{result.parts.forEach(p=>p.delete());source.delete();}

