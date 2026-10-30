import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {parseOBJ} from './src/obj-import.js';
const file=new Blob(['v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\ng test\nf -4 -3 -2 -1\n']);
const obj=await parseOBJ(file);assert.equal(obj.triVerts.length,6);assert.equal(obj.vertProperties.length,12);
const fbx=`; FBX 7.4.0 project file
FBXHeaderExtension:  {
\tFBXHeaderVersion: 1003
\tFBXVersion: 7400
}
GlobalSettings:  {
\tVersion: 1000
\tProperties70:  {
\t\tP: "UpAxis", "int", "Integer", "",1
\t\tP: "UnitScaleFactor", "double", "Number", "",1
\t}
}
Objects:  {
\tGeometry: 1, "Geometry::Test", "Mesh" {
\t\tVertices: *12 {
\t\t\ta: 0,0,0,10,0,0,0,10,0,0,0,10
\t\t}
\t\tPolygonVertexIndex: *12 {
\t\t\ta: 0,2,-2,0,1,-4,1,2,-4,2,0,-4
\t\t}
\t}
\tModel: 2, "Model::Test", "Mesh" {
\t\tVersion: 232
\t\tProperties70:  {
\t\t\tP: "Lcl Translation", "Lcl Translation", "", "A",0,0,0
\t\t\tP: "Lcl Rotation", "Lcl Rotation", "", "A",0,0,0
\t\t\tP: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
\t\t}
\t}
}
Connections:  {
\tC: "OO",1,2
\tC: "OO",2,0
}
`;
const bytes=new TextEncoder().encode(fbx),root=new FBXLoader().parse(bytes.buffer,'');let count=0;root.traverse(obj=>{if(obj.isMesh)count+=obj.geometry.attributes.position.count;});assert.equal(count,12);assert.equal(root.userData.unitScaleFactor,1);
console.log('Passed: OBJ quad and negative indices; FBX mesh and unit metadata.');
