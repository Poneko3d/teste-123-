import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {ObjectProject} from './src/project.js';
import {rawTopology,carveSurface} from './src/continuous.js';
import {faceGroupBoundary,growFaceGroup} from './src/face-groups.js';
import {contourSurface,splitContour} from './src/surface.js';
import {prepareMesh} from './src/import-mesh.js';
const api=await Module();api.setup();
const cube=api.Manifold.cube([40,40,40],true),project=new ObjectProject();
const root=project.reset([cube.getMesh()],'Modelo');
const halves=cube.splitByPlane([0,0,1],0),kids=project.split(root.id,halves.map(p=>p.getMesh()),[0,0,1],10);
const untouched=kids[1],sub=halves[0].splitByPlane([1,0,0],0);project.split(kids[0].id,sub.map(p=>p.getMesh()),[1,0,0],5);
assert.equal(project.items.length,3);assert.equal(project.items[2],untouched);assert.deepEqual(project.items[0].offset,[5,0,10]);
const sum=project.items.reduce((sum,p)=>{const m=new api.Manifold(new api.Mesh(p.mesh));assert.equal(m.status(),'NoError');const v=m.volume();m.delete();return sum+v;},0);assert.ok(Math.abs(sum-cube.volume())<.001);
assert.equal(project.undo(),true);assert.equal(project.items.length,2);assert.equal(project.undo(),true);assert.equal(project.items[0].id,root.id);
const sphere=api.Manifold.sphere(20,32),topology=rawTopology(sphere.getMesh());
const selected=topology.faces.map((f,i)=>f.every(v=>topology.vertices[v][2]>=-1e-6)?i:-1).filter(i=>i>=0);
const boundary=faceGroupBoundary(topology,selected);const carved=carveSurface(topology,boundary.paths),surface=contourSurface(carved.topology,carved.ring),cut=splitContour(api,carved.topology,surface);
assert.ok(Math.abs(cut[0].volume()+cut[1].volume()-sphere.volume())<.01);cut.forEach(p=>p.delete());
assert.throws(()=>faceGroupBoundary(topology,[]),/Selecione/);assert.throws(()=>faceGroupBoundary(topology,topology.faces.map((_,i)=>i)),/inteiro/);
const cubeTopology=rawTopology(cube.getMesh()),grown=growFaceGroup(cubeTopology,0,1);assert.equal(grown.length,2);assert.equal(faceGroupBoundary(cubeTopology,grown).ring.length,4);
const inside=api.Manifold.cube([20,20,20],true),hollow=cube.subtract(inside),prepared=prepareMesh(api,hollow.getMesh());assert.equal(prepared.meshes.length,1);assert.ok(Math.abs(prepared.solid.volume()-56000)<.01);prepared.solid.delete();hollow.delete();inside.delete();
[...halves,...sub,cube,sphere].forEach(p=>p.delete());
console.log('Passed: recursive cuts preserve siblings and volume, undo, explosion offsets, face-group boundary cut, growth and hollow import.');


const dense=api.Manifold.sphere(20,960),denseMesh=dense.getMesh();assert.ok(denseMesh.triVerts.length/3>400000);
const preserved=prepareMesh(api,denseMesh);assert.equal(preserved.optimization.tolerance,0);assert.equal(preserved.optimization.outputTriangles,denseMesh.triVerts.length/3);preserved.solid.delete();
const reduced=prepareMesh(api,denseMesh,{optimize:true});assert.ok(reduced.optimization.tolerance>0);assert.ok(reduced.optimization.outputTriangles<=denseMesh.triVerts.length/3);reduced.solid.delete();dense.delete();
console.log('Passed dense import: over 400k triangles preserved by default, simplification runs only on explicit opt-in.');

