import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('src/main.js','utf8');
const material=()=>({transparent:false,opacity:1,depthWrite:true});
const a={material:material()},b={material:material()};
const state={pin:{visible:true,material:material()},pinEditing:true,parts:[],pieceDraft:null,postPin:null,project:{items:[{id:'a'},{id:'b'}]},objectMeshes:new Map([['a',a],['b',b]]),activeId:'a',mode:'plane',closed:false};
vm.createContext(state);vm.runInContext(source.slice(source.indexOf('function syncPinXray(){'),source.indexOf('function updateVisuals(){')),state);
state.syncPinXray();assert.equal(a.material.opacity,.22);assert.equal(a.material.transparent,true);assert.equal(a.material.needsUpdate,true);assert.equal(state.pin.material.depthTest,false);
state.pinEditing=false;state.syncPinXray();assert.equal(a.material.opacity,1);assert.equal(a.material.depthWrite,true);
state.pinEditing=true;state.postPin={baseId:'a',mateId:'b'};state.syncPinXray();assert.equal(b.material.opacity,.22);
state.parts=[{}];state.syncPinXray();assert.equal(b.material.opacity,1);assert.equal(state.pin.material.depthTest,true);
// Exercise the actual pointer handler: preview must never submit a geometry job.
let preview,requests=0;
const ui={performance:{now:()=>1000},smoothPreview:null,gesture:null,strokeTool:'points',lastPointerWork:0,invalidate(){},down:null,gizmoDrag:null,pinGizmo:{enabled:false},pointDrag:null,busy:false,traceBusy:false,drawing:true,mode:'surface',parts:[],pickPoint:()=>-1,highlightPoint(){},$:()=>({style:{}}),closed:false,anchors:[{point:[0,0,0]},{point:[1,0,0]}],hitAt:()=>({point:[1,1,0]}),asAnchor:x=>x,hover:{visible:false},showHover:p=>preview=p,request:()=>{requests++;throw Error('Unexpected geometry job')}};
vm.createContext(ui);const start=source.indexOf("$('canvas').addEventListener('pointermove',async e=>{");const end=source.indexOf("\n$('canvas').addEventListener('pointerup'",start);const callback=source.slice(start,end).replace("$('canvas').addEventListener('pointermove',",'handler = ').replace(/\);\s*$/,';');vm.runInContext(callback,ui);
for(let i=0;i<100;i++){ui.lastPointerWork=0;await ui.handler({buttons:0});}
assert.equal(requests,0);assert.equal(preview[0],ui.anchors[1]);assert.equal(preview.at(-1),ui.anchors[0]);
console.log('PASS plane and post-cut X-ray, opacity restoration, 100 pointer previews with zero geometry requests and fixed start.');
// Committing a point keeps every previous path by identity and only resolves the new edge.
let jobs=[];const oldPath={points:[[0,0,0],[10,0,0]],faces:[0]};
const edit={busy:false,traceBusy:false,closed:false,valid:true,span:10,anchors:[{point:[0,0,0]},{point:[10,0,0]}],segments:[oldPath],asAnchor:x=>x,vertex:x=>({distanceTo:y=>Math.hypot(...x.point.map((v,i)=>v-y.p[i])),p:x.point}),hover:{visible:false},hoverVersion:0,sync(){},request:async(type,payload)=>{jobs.push({type,payload});return {path:{points:[payload.start.point,payload.end.point],faces:[0]}}},remember(){},restoreEditing(){},editVersion:0,drawTrace(){},clearMessage(){},message:e=>{throw Error(e)}};
vm.createContext(edit);vm.runInContext(source.slice(source.indexOf('async function addPoint(hit){'),source.indexOf('async function closeContour(){')),edit);
const first=edit.anchors[0];await edit.addPoint({point:[.5,1,0]});assert.equal(edit.anchors[0],first);assert.equal(edit.segments[0],oldPath);assert.equal(jobs.length,1);assert.equal(jobs[0].type,'path');assert.equal(jobs[0].payload.start.point[0],10);
console.log('PASS one new path per confirmed point; previous paths and start preserved even near the first endpoint.');
