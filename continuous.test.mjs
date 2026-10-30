import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import * as THREE from 'three';
import {rawTopology,surfacePath,carveSurface} from './src/continuous.js';
import {contourSurface,splitContour} from './src/surface.js';
import {importSolid} from './src/geometry.js';
const api=await Module();api.setup();const source=api.Manifold.sphere(30,48),mesh=source.getMesh(),t=rawTopology(mesh);
const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(mesh.vertProperties,3));geometry.setIndex(new THREE.BufferAttribute(mesh.triVerts,1));geometry.computeVertexNormals();const object=new THREE.Mesh(geometry);object.updateMatrixWorld();
function anchor(direction){const normal=new THREE.Vector3(...direction).normalize(),ray=new THREE.Raycaster(normal.clone().multiplyScalar(100),normal.clone().negate()),hit=ray.intersectObject(object)[0];assert.ok(hit);return {point:hit.point.toArray(),face:hit.faceIndex,normal:hit.normal.toArray()};}
const offgridA=anchor([1,.127,.371]),offgridB=anchor([1,.513,-.211]),diagonal=surfacePath(t,offgridA,offgridB);
assert.ok(new THREE.Vector3(...diagonal.points[0]).distanceTo(new THREE.Vector3(...offgridA.point))<1e-6);assert.ok(new THREE.Vector3(...diagonal.points.at(-1)).distanceTo(new THREE.Vector3(...offgridB.point))<1e-6);
assert.ok(diagonal.points.slice(1,-1).some(p=>t.vertices.every(v=>new THREE.Vector3(...v).distanceTo(new THREE.Vector3(...p))>1e-6)),'Path crosses triangle interiors without vertex snapping');
for(const type of ['circle','nonplanar']){
 const anchors=Array.from({length:type==='circle'?36:16},(_,i)=>{const a=i*Math.PI*2/(type==='circle'?36:16);return type==='circle'?anchor([1,.4*Math.cos(a),.4*Math.sin(a)]):anchor([Math.cos(a),Math.sin(a),.15*Math.sin(2*a)]);});
 const paths=anchors.map((a,i)=>surfacePath(t,a,anchors[(i+1)%anchors.length])),carved=carveSurface(t,paths),surface=contourSurface(carved.topology,carved.ring),parts=splitContour(api,carved.topology,surface);
 assert.equal(parts.length,2);assert.ok(Math.abs(parts[0].volume()+parts[1].volume()-source.volume())<.1);
 assert.ok(surface.vertices.length>carved.topology.vertices.length+100,'Cap has relaxed interior points');
 for(const id of carved.ring)assert.deepEqual(surface.vertices[id],carved.topology.vertices[id],'Boundary is held exactly fixed');
 const overlap=parts[0].intersect(parts[1]);assert.ok(overlap.volume()<.001);overlap.delete();
 const union=parts[0].add(parts[1]),outside=union.subtract(source),missing=source.subtract(union);console.log('volume errors',outside.volume(),missing.volume(),source.volume());assert.ok(outside.volume()<source.volume()*1e-6);assert.ok(missing.volume()<source.volume()*1e-6);[union,outside,missing].forEach(x=>x.delete());
 console.log(type+': '+carved.ring.length+' exact boundary vertices, '+surface.cap.length+' smooth cap triangles');parts.forEach(p=>p.delete());
}
const cg=new THREE.CapsuleGeometry(19,42,12,48);cg.rotateX(Math.PI/2);
const capsule=importSolid(api,cg.toNonIndexed().attributes.position.array),ct=rawTopology(capsule.getMesh()),co=new THREE.Mesh(cg);co.updateMatrixWorld();
const ca=[[-.35,14],[.4,0],[-.22,-14]].map(([angle,z])=>{const n=new THREE.Vector3(Math.cos(angle),Math.sin(angle),0),h=new THREE.Raycaster(n.clone().multiplyScalar(100).add(new THREE.Vector3(0,0,z)),n.clone().negate()).intersectObject(co)[0];return {point:h.point.toArray(),normal:h.normal.toArray()};});
// Recover face IDs on the canonical source topology, not the demo input ordering.
const cm=capsule.getMesh(),canonical=new THREE.BufferGeometry();canonical.setAttribute('position',new THREE.BufferAttribute(cm.vertProperties,3));canonical.setIndex(new THREE.BufferAttribute(cm.triVerts,1));canonical.computeVertexNormals();const canonicalMesh=new THREE.Mesh(canonical);canonicalMesh.updateMatrixWorld();
for(const a of ca){const n=new THREE.Vector3(a.point[0],a.point[1],0).normalize(),h=new THREE.Raycaster(n.clone().multiplyScalar(100).add(new THREE.Vector3(0,0,a.point[2])),n.clone().negate()).intersectObject(canonicalMesh)[0];Object.assign(a,{point:h.point.toArray(),face:h.faceIndex,normal:h.normal.toArray()});}
const cp=ca.map((a,i)=>surfacePath(ct,a,ca[(i+1)%ca.length])),carved=carveSurface(ct,cp),cap=contourSurface(carved.topology,carved.ring),halves=splitContour(api,carved.topology,cap),cu=halves[0].add(halves[1]),out=cu.subtract(capsule),missing= capsule.subtract(cu);
assert.ok(out.volume()<capsule.volume()*1e-6,'Freehand cap stays inside the cylinder');assert.ok(missing.volume()<capsule.volume()*1e-6);[...halves,cu,out,missing,capsule,source].forEach(x=>x.delete());
console.log('Passed: diagonal paths, exact click positions, circular contour, non-planar contour, freehand cylinder patch, smooth boundary-fixed cap, closed non-overlapping solids.');

