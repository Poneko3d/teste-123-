import assert from 'node:assert/strict';import {zipSync,strToU8} from 'fflate';import {parse3MF} from './src/three-mf-import.js';
const model='<model unit="millimeter"><resources><object id="1"><mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/></vertices><triangles><triangle v1="0" v2="1" v3="2"/></triangles></mesh></object></resources><build/></model>';
const root='<model unit="millimeter"><resources><object id="9"><components><component p:path="/3D/Objects/parts.model" objectid="1" transform="2 0 0 0 2 0 0 0 2 3 4 5"/></components></object></resources><build><item objectid="9" transform="1 0 0 0 1 0 0 0 1 10 0 0"/></build></model>';
const pack=(r=root,m=model)=>zipSync({'_rels/.rels':strToU8('<Relationships><Relationship Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" Target="/3D/3dmodel.model"/></Relationships>'),'3D/3dmodel.model':strToU8(r),'3D/Objects/parts.model':strToU8(m)});
const mesh=parse3MF(pack());assert.deepEqual([...mesh.vertProperties],[13,4,5,15,4,5,13,6,5]);assert.deepEqual([...mesh.triVerts],[0,1,2]);
const mirror=parse3MF(pack(root.replace('2 0 0','-2 0 0')));assert.deepEqual([...mirror.triVerts],[0,2,1]);
assert.throws(()=>parse3MF(pack(root,model.replace('v3="2"','v3="99"'))));assert.throws(()=>parse3MF(pack(root.replace('/3D/Objects/parts.model','/missing.model'))));assert.throws(()=>parse3MF(pack(root.replace('millimeter','inch'))));
console.log('PASS background 3MF reader: component packages, assembly transforms, mirrored winding, units and invalid references.');
