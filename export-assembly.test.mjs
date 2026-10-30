import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {unzipSync,strFromU8} from 'fflate';
import {exportAssembly} from './src/export-assembly.js';
import {decodeProject} from './src/project-file.js';

function verify(items){
 const expected=items.reduce((n,x)=>n+x.mesh.triVerts.length,0);
 const obj=new OBJLoader().parse(strFromU8(exportAssembly(items,'obj')));
 assert.equal(obj.children.length,items.length);
 assert.equal(obj.children.reduce((n,x)=>n+x.geometry.attributes.position.count,0),expected);
 for(let j=0;j<items.length;j++){
  const m=items[j].mesh,p=obj.children[j].geometry.attributes.position.array;
  for(let i=0;i<m.triVerts.length;i++)for(let k=0;k<3;k++)assert.equal(p[3*i+k],m.vertProperties[m.triVerts[i]*m.numProp+k]);
 }
 const stl=exportAssembly(items,'stl'),geometry=new STLLoader().parse(stl.buffer);
 assert.equal(geometry.attributes.position.count,expected);
 let at=0;for(const {mesh:m} of items)for(const v of m.triVerts)for(let k=0;k<3;k++)assert.equal(geometry.attributes.position.array[at++],m.vertProperties[v*m.numProp+k]);
 const files=unzipSync(exportAssembly(items,'3mf')),model=strFromU8(files['3D/3dmodel.model']);
 assert.match(strFromU8(files['_rels/.rels']),/Target="\/3D\/3dmodel.model"/);
 assert.match(model,/unit="millimeter"/);
 assert.equal([...model.matchAll(/<triangle /g)].length,expected/3);
 assert.equal([...model.matchAll(/<component objectid=/g)].length,items.length);
 assert.equal([...model.matchAll(/<item objectid=/g)].length,1,'One assembly build item, not separate rearrangeable items');
 assert.match(model,new RegExp(`<build><item objectid="${items.length+1}"/></build>`));
 const meshes=[...model.matchAll(/<mesh><vertices>(.*?)<\/vertices><triangles>(.*?)<\/triangles><\/mesh>/g)];
 for(let j=0;j<items.length;j++){
  const m=items[j].mesh,verts=[...meshes[j][1].matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"\/>/g)];
  assert.equal(verts.length,m.vertProperties.length/m.numProp);
  verts.forEach((v,i)=>{for(let k=0;k<3;k++)assert.equal(+v[k+1],m.vertProperties[i*m.numProp+k]);});
 }
 // Screen visibility and exploded offsets never affect the exported assembly.
 for(const format of ['obj','stl','3mf'])assert.deepEqual(exportAssembly(items,format),exportAssembly(items.map(x=>({...x,hidden:!x.hidden,offset:[999,-888,777],exploded:true})),format));
}
const mesh={numProp:3,vertProperties:new Float32Array([0,0,0,1,0,0,0,1,0]),triVerts:new Uint32Array([0,1,2])};
verify([{name:'Peça <A> & "olho"',mesh},{name:'Peça B',mesh:{...mesh,vertProperties:new Float32Array([0,0,2,1,0,2,0,1,2])}}]);
assert.throws(()=>exportAssembly([],'3mf'));
assert.throws(()=>exportAssembly([{name:'x',mesh}],'zip'));
if(process.argv.includes('--real')){
 const {state}=decodeProject(await readFile('../../work/miranha-editavel.poneko'));
 verify(state.items);console.log(`Real Spiderman: ${state.items.length} parts, all coordinates and triangles preserved in OBJ, STL and assembled 3MF.`);
}
console.log('PASS assembled export: distinct parts, coordinates, triangle counts, units, assembly structure, exploded/hidden independence.');
