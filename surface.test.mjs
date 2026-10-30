import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {surfaceTopology,topologyMesh,magneticPath,contourSurface,connectorFrame,splitContour} from './src/surface.js';
import {addTaperedConnector,frustumMesh} from './src/connectors.js';
import {importSolid} from './src/geometry.js';
import * as THREE from 'three';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
const api=await Module();api.setup();
const sphere=api.Manifold.sphere(30,64),t=surfaceTopology(sphere.getMesh());
const nearest=p=>t.vertices.reduce((best,v,i)=>new THREE.Vector3(...v).distanceToSquared(p)<new THREE.Vector3(...t.vertices[best]).distanceToSquared(p)?i:best,0);
const anchors=Array.from({length:12},(_,i)=>{const angle=i*Math.PI/6,z=4*Math.sin(angle*2),r=Math.sqrt(900-z*z);return nearest(new THREE.Vector3(r*Math.cos(angle),r*Math.sin(angle),z));});
const ring=[];
for(let i=0;i<anchors.length;i++){const path=magneticPath(t,anchors[i],anchors[(i+1)%anchors.length],ring);ring.push(...path.slice(0,-1));}
assert.ok(new Set(ring.map(id=>t.vertices[id][2].toFixed(3))).size>3,'The contour is genuinely non-planar');
const surface=contourSurface(t,ring),halves=splitContour(api,t,surface);
assert.equal(halves.length,2);assert.ok(Math.abs(halves[0].volume()+halves[1].volume()-sphere.volume())<.1);
let overlap=halves[0].intersect(halves[1]);assert.ok(overlap.volume()<.001);overlap.delete();
const cfg={width:8,thickness:6,depth:8,tipScale:.65,clearance:.2};
const frame=connectorFrame(t,surface),connected=addTaperedConnector(api,sphere,...halves,cfg,frame);
for(const s of connected){assert.equal(s.status(),'NoError');const m=s.getMesh(),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(m.vertProperties,3));g.setIndex(new THREE.BufferAttribute(m.triVerts,1));const binary=new STLExporter().parse(new THREE.Mesh(g),{binary:true});const parsed=new STLLoader().parse(binary.buffer),roundtrip=importSolid(api,parsed.attributes.position.array);assert.ok(Math.abs(roundtrip.volume()-s.volume())<.1);roundtrip.delete();}
overlap=connected[0].intersect(connected[1]);assert.ok(overlap.volume()<.001,'Connector parts do not overlap');overlap.delete();
assert.throws(()=>contourSurface(t,ring.slice(0,-3)),/conectado/);
assert.throws(()=>contourSurface(t,[...ring,ring[3]]),/cruzamentos/);
assert.throws(()=>connectorFrame(t,surface,1000,1000),/fora/);
assert.throws(()=>addTaperedConnector(api,sphere,...halves,{...cfg,depth:100},frame),/parede externa/);
const local={position:[0,0,0],normal:[0,0,1],u:[1,0,0],v:[0,1,0]},prism=frustumMesh(cfg,local,0,8);
assert.ok(Math.abs(prism.vertProperties[0]+4)<1e-5);assert.ok(Math.abs(prism.vertProperties[12]+2.6)<1e-5,'Tip is narrower than the base');
// Coarse planar faces gain graph resolution without changing geometry.
const cube=api.Manifold.cube([40,40,40],true),ct=surfaceTopology(cube.getMesh());const refined=new api.Manifold(new api.Mesh(topologyMesh(ct)));assert.ok(Math.abs(refined.volume()-cube.volume())<.001);refined.delete();cube.delete();
halves.forEach(s=>s.delete());connected.forEach(s=>s.delete());sphere.delete();
console.log(`Passed: magnetic closed contour (${ring.length} vertices), non-planar two-part cut, preserved volume, tapered rectangular connector, clearance/no overlap, STL roundtrip, invalid contours/positions, refinement.`);
