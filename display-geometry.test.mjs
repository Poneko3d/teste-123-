import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import * as THREE from 'three';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {displayBuffers} from './src/display-geometry.js';
const api=await Module();api.setup();
for(const solid of [api.Manifold.cube([10,10,10],true),api.Manifold.sphere(10,128)]){
 const mesh=solid.getMesh(),before=mesh.vertProperties.slice(),ids=mesh.triVerts.slice();
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(mesh.vertProperties,3));g.setIndex(new THREE.BufferAttribute(mesh.triVerts,1));
 const start=performance.now(),reference=toCreasedNormals(g,Math.PI/4),oldTime=performance.now()-start;
 const t=performance.now(),result=displayBuffers(mesh),newTime=performance.now()-t;
 assert.deepEqual(result.position,reference.attributes.position.array,'all corner coordinates unchanged');assert.deepEqual(mesh.vertProperties,before);assert.deepEqual(mesh.triVerts,ids);
 let error=0;for(let i=0;i<result.normal.length;i++)error=Math.max(error,Math.abs(result.normal[i]-reference.attributes.normal.array[i]));assert.ok(error<1e-5,`normal difference ${error}`);
 console.log(`${ids.length/3} triangles: previous shading ${oldTime.toFixed(1)} ms; typed shading ${newTime.toFixed(1)} ms; max normal difference ${error}`);
 solid.delete();g.dispose();reference.dispose();
}
