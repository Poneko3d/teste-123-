import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {importSolid,cutSolid} from './src/geometry.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import * as THREE from 'three';
const api=await Module();api.setup();
const cube=api.Manifold.cube([40,40,40],true);
for(const axis of ['X','Y','Z']){
 const c={axis,offset:0,u:0,v:0,radius:4,depth:8,clearance:.2,connector:true};
 const meshes=cutSolid(api,cube,c);const solids=meshes.map(m=>new api.Manifold(m));
 assert.equal(solids[0].status(),'NoError');assert.equal(solids[1].status(),'NoError');
 assert.ok(solids[0].volume()>32000);assert.ok(solids[1].volume()<32000);assert.ok(solids[0].intersect(solids[1]).volume()<.001);
 for(const [i,m] of meshes.entries()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(m.vertProperties,3));g.setIndex(new THREE.BufferAttribute(m.triVerts,1));const binary=new STLExporter().parse(new THREE.Mesh(g),{binary:true});const parsed=new STLLoader().parse(binary.buffer);const imported=importSolid(api,parsed.attributes.position.array);assert.equal(imported.status(),'NoError');assert.ok(Math.abs(imported.volume()-solids[i].volume())<.1);imported.delete();solids[i].delete();}
}
const plain=cutSolid(api,cube,{axis:'Z',offset:0,u:0,v:0,radius:4,depth:8,clearance:.2,connector:false});assert.ok(Math.abs(new api.Manifold(plain[0]).volume()-32000)<.001);
const capsule=new THREE.CapsuleGeometry(19,42,12,48);capsule.rotateX(Math.PI/2);const demo=importSolid(api,capsule.toNonIndexed().attributes.position.array);assert.equal(cutSolid(api,demo,{axis:'Z',offset:0,u:0,v:0,radius:4,depth:8,clearance:.2,connector:true}).length,2);demo.delete();
assert.throws(()=>cutSolid(api,cube,{axis:'Z',offset:50,u:0,v:0,radius:4,depth:8,clearance:.2,connector:true}),/pass through/);
assert.throws(()=>cutSolid(api,cube,{axis:'Z',offset:0,u:19,v:0,radius:4,depth:8,clearance:.2,connector:true}),/anchored/);
assert.throws(()=>cutSolid(api,cube,{axis:'Z',offset:0,u:0,v:0,radius:4,depth:30,clearance:.2,connector:true}),/socket extends/);
assert.throws(()=>importSolid(api,new Float32Array([0,0,0,1,0,0,0,1,0])),/fechad/);
cube.delete();console.log('Passed: 3 axes, connectors, clearance, closed STL roundtrip, plain cut, invalid meshes and invalid connector placement.');
