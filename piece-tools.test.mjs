import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {repairPiece,drillPiece} from './src/piece-tools.js';
import {ObjectProject} from './src/project.js';
import {encodeProject,decodeProject} from './src/project-file.js';
import {rescaleProject} from './src/rescale.js';
import {connectParts} from './src/post-connector.js';
const api=await Module();api.setup();
const solid=api.Manifold.cube([20,20,20],true),mesh=solid.getMesh();
const frame={position:[0,0,10],normal:[0,0,-1],u:[1,0,0],v:[0,-1,0]};
const cfg={mode:'hole',shape:'square',width:4,height:4,depth:5,through:false};
const volume=m=>{const s=new api.Manifold(new api.Mesh(m));try{assert.equal(s.status(),'NoError');return s.volume();}finally{s.delete();}};
const blind=drillPiece(api,mesh,cfg,frame);assert.ok(Math.abs(volume(blind)-7920)<1e-4);
const through=drillPiece(api,mesh,{...cfg,through:true},frame);assert.ok(Math.abs(volume(through)-7680)<1e-4);
for(const shape of ['circle','rectangle','hexagon']){const m=drillPiece(api,mesh,{...cfg,shape},frame);assert.ok(volume(m)<8000);}
assert.throws(()=>drillPiece(api,mesh,{...cfg,width:-1},frame),/medidas/);
assert.throws(()=>drillPiece(api,mesh,{...cfg,width:100,height:100,through:true},frame),/toda/);
assert.throws(()=>drillPiece(api,mesh,cfg,{...frame,position:[100,0,10]}),/alcança/);
// Damage a connector/socket pair and verify repair never moves an existing vertex.
const a=api.Manifold.cube([20,20,10],true).translate([0,0,-5]),b=api.Manifold.cube([20,20,10],true).translate([0,0,5]);
const pair=connectParts(api,a,b,{width:4,thickness:4,depth:3,tipScale:.8,clearance:.2,pinSide:'first',pinShape:'rectangle'},{position:[0,0,0],normal:[0,0,1],u:[1,0,0],v:[0,1,0]});
for(const m of pair){const broken={...m,triVerts:m.triVerts.slice(3)},fixed=repairPiece(api,broken,40);assert.deepEqual(fixed.mesh.vertProperties,m.vertProperties);assert.equal(fixed.report.holes,1);assert.ok(Math.abs(volume(fixed.mesh)-volume(m))<1e-4);}
assert.throws(()=>repairPiece(api,{...mesh,triVerts:mesh.triVerts.slice(3)},1),/limite/);
assert.equal(repairPiece(api,through,4).report.holes,0,'a valid through hole must remain open as a tunnel');
assert.equal(repairPiece(api,blind,4).report.holes,0,'a valid blind cavity must not be filled');
const project=new ObjectProject();project.reset([mesh],'piece');const id=project.items[0].id;
project.modify(id,blind,{config:cfg,frame});assert.equal(project.items.length,1);
const restored=decodeProject(encodeProject(project.state(),'hole')).state;
const scaled=rescaleProject(api,restored,2);assert.ok(Math.abs(volume(scaled.meshes[0].mesh)-7920*8)<.01);
project.undo();assert.equal(project.items[0].id,id);assert.equal(project.operations.length,0);
if(process.argv.includes('--real')){
 const {readFile}=await import('node:fs/promises');const real=decodeProject(new Uint8Array(await readFile('../../work/miranha-editavel.poneko'))).state;
 const eye=real.items.reduce((a,b)=>a.mesh.triVerts.length<b.mesh.triVerts.length?a:b).mesh;
 const broken={...eye,triVerts:eye.triVerts.slice(3)},fixed=repairPiece(api,broken,200);
 assert.deepEqual(fixed.mesh.vertProperties,eye.vertProperties);assert.equal(fixed.report.holes,1);assert.ok(Math.abs(volume(fixed.mesh)-volume(eye))<.01);
 const p=eye.vertProperties,t=eye.triVerts;let best=0,area=0;
 for(let i=0;i<t.length;i+=3){const x=[0,1,2].map(k=>p[t[i+1]*3+k]-p[t[i]*3+k]),y=[0,1,2].map(k=>p[t[i+2]*3+k]-p[t[i]*3+k]),n=[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]];const size=Math.hypot(...n);if(size>area){area=size;best=i;}}
 const {Vector3}=await import('three'),v=j=>new Vector3(...p.slice(t[best+j]*3,t[best+j]*3+3)),aa=v(0),bb=v(1),cc=v(2),n=bb.clone().sub(aa).cross(cc.clone().sub(aa)).normalize().negate(),u=bb.clone().sub(aa).normalize(),vv=n.clone().cross(u).normalize();
 const f={position:aa.add(bb).add(cc).multiplyScalar(1/3).toArray(),normal:n.toArray(),u:u.toArray(),v:vv.toArray()};
 for(const through of [false,true]){const drilled=drillPiece(api,eye,{...cfg,shape:'circle',width:.6,depth:.5,through},f);assert.ok(volume(drilled)<volume(eye));}
 console.log('Actual Spiderman eye: local repair and blind/through holes passed.');
}
solid.delete();a.delete();b.delete();console.log('Piece repair, holes, atomic rejection, project roundtrip and rescale passed.');
