import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {screenCut} from './src/screen-cut.js';
import {addTaperedConnector} from './src/connectors.js';
import {ObjectProject} from './src/project.js';
const api=await Module();api.setup();const cube=api.Manifold.cube([40,40,40],true);
const spec={origin:[0,0,0],normal:[0,0,1],u:[1,0,0],v:[0,1,0],distance:100};
for(const example of [{kind:'line',points:[[-30,-30],[30,30]]},{kind:'polygon',points:[[-6,-6],[6,-6],[6,6],[-6,6]]}]){
 const {parts,normal}=screenCut(api,cube,{...spec,...example});
 assert.ok(parts.every(p=>p.status()==='NoError'&&p.volume()>0));assert.ok(Math.abs(parts[0].volume()+parts[1].volume()-cube.volume())<.01);
 const overlap=parts[0].intersect(parts[1]);assert.ok(overlap.volume()<.001);overlap.delete();
 const mesh=parts.map(p=>p.getMesh());
 if(example.kind==='line')for(const ordered of [mesh,[...mesh].reverse()]){const project=new ObjectProject();project.reset([cube.getMesh()],'cube');const children=project.split(1,ordered,normal,10);for(const child of children){const m=new api.Manifold(new api.Mesh(child.mesh)),box=m.boundingBox(),center=box.min.map((x,i)=>(x+box.max[i])/2);assert.ok(center.reduce((s,x,i)=>s+x*child.offset[i],0)>=-1e-6);m.delete();}}
 parts.forEach(p=>p.delete());
}
assert.throws(()=>screenCut(api,cube,{...spec,kind:'line',points:[[50,-30],[50,30]]}),/atravessar/);
const halves=cube.splitByPlane([0,0,1],0).reverse();
const frame={position:[0,0,0],normal:[0,0,1],u:[1,0,0],v:[0,1,0]};
for(const pinShape of ['rectangle','cylinder','hexagon'])for(const pinSide of ['first','second']){
 const cfg={width:8,thickness:6,depth:8,tipScale:.7,clearance:.2,pinShape,pinSide};
 const parts=addTaperedConnector(api,cube,...halves,cfg,frame);
 assert.ok(parts.every(p=>p.status()==='NoError'));assert.ok(parts[pinSide==='first'?0:1].volume()>32000);assert.ok(parts[pinSide==='first'?1:0].volume()<32000);
 const overlap=parts[0].intersect(parts[1]);assert.ok(overlap.volume()<.001);overlap.delete();parts.forEach(p=>p.delete());
}
halves.forEach(p=>p.delete());cube.delete();console.log('Passed projected diagonal/lasso cuts, conservation, reversed part order, 3 pin shapes and both pin sides.');
