import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildPickingTree,pickSurface,closestSurface} from './src/picking.js';
const geometry=new THREE.SphereGeometry(20,192,96),mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();
const tree=buildPickingTree(geometry.attributes.position.array,geometry.index.array),cast=new THREE.Raycaster();let totalTested=0;
for(let i=0;i<100;i++){
 const origin=new THREE.Vector3(Math.cos(i*.71)*60,Math.sin(i*.71)*60,30*Math.sin(i)),target=new THREE.Vector3(Math.sin(i)*4,Math.cos(i)*4,0);cast.set(origin,target.sub(origin).normalize());
 const expected=cast.intersectObject(mesh)[0],actual=pickSurface(tree,cast.ray);assert.equal(!!actual,!!expected);assert.ok(actual.point.distanceTo(expected.point)<1e-5);assert.ok(actual.normal.length()>.99);totalTested+=actual.tested;
}
assert.ok(totalTested/100<geometry.index.count/3*.1);
cast.set(new THREE.Vector3(100,100,100),new THREE.Vector3(1,0,0));assert.equal(pickSurface(tree,cast.ray),null);
console.log(`Passed picking: exact intersections; average ${(totalTested/100).toFixed(0)} triangle checks vs ${geometry.index.count/3} full scan.`);
const nearest=closestSurface(tree,new THREE.Vector3(25,0,0));assert.ok(Math.abs(nearest.point[0]-20)<.001);assert.ok(Number.isInteger(nearest.face));
geometry.dispose();mesh.material.dispose();
