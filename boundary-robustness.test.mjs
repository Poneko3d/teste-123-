import {smoothContour} from './src/smooth-contour.js';
import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {Triangle,Vector3} from 'three';
import {rawTopology,adjacentSurfacePath} from './src/continuous.js';
import {profileConnector} from './src/profile-connector.js';
const api=await Module();api.setup();const source=api.Manifold.cube([30,30,20],true),t=rawTopology(source.getMesh());
const center=f=>t.faces[f].reduce((p,id)=>p.add(new Vector3(...t.vertices[id])),new Vector3()).divideScalar(3).toArray();
const path=adjacentSurfacePath(t,{face:0,point:center(0)},{face:6,point:center(6)});
assert.equal(path.faces.length,path.points.length-1);
for(let i=0;i<path.faces.length;i++){const tri=new Triangle(...t.faces[path.faces[i]].map(v=>new Vector3(...t.vertices[v])));for(const p of [path.points[i],path.points[i+1]]){const point=new Vector3(...p);assert.ok(tri.closestPointToPoint(point,new Vector3()).distanceTo(point)<1e-8,'fallback stays on original triangle');}}
const face=t.faces[0],edgePaths=face.map((v,i)=>({points:[t.vertices[v],t.vertices[face[(i+1)%3]]],faces:[0]}));const zero=smoothContour(t,null,edgePaths,0,.5);assert.equal(zero.paths,edgePaths,'zero strength preserves exact original boundary');assert.equal(zero.deviation,0);
const points=[[-8,-6,10],[8,-6,10],[8,5.99,10],[7.98,6.01,10],[8.01,6.01,10],[7.99,5.98,10],[8,6,10],[-8,6,10]],before=structuredClone(points);
assert.throws(()=>profileConnector(api,source,points,[0,0,1],{patchDepth:2,profileArea:70,depth:3,clearance:.2,connector:false}),/fragmentos/);
assert.deepEqual(points,before);source.delete();console.log('Passed: surface path stays on original triangles; disconnected slivers are rejected instead of exported.');
