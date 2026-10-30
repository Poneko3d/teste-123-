import {createGeometryJobs} from './src/geometry-jobs.js';
import {undoSpecific,historyLabel} from './src/selective-history.js';
import {holeCutter} from './src/piece-tools.js';
import {editContour} from './src/contour-edit.js';
import {displayBuffers} from './src/display-geometry.js';
import {pickSurface} from './src/picking.js';
import {selectFaceGroup,toggleFaceGroup} from './src/face-groups.js';
import {pinFits,placePin} from './src/pin-placement.js';
// Controller integration with a minimal DOM and real geometry worker; no browser rendering is simulated.
import assert from 'node:assert/strict';
import * as Three from 'three';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {ObjectProject} from './src/project.js';
import {frustumMesh,connectorFrameForSide} from './src/connectors.js';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
import {ThreeMFLoader} from 'three/addons/loaders/3MFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {zipSync,unzipSync,strFromU8} from 'fflate';
const workspace=await readFile('src/workspace.html','utf8'),elements=new Map();
class Element{
 constructor(tag='div'){this.events=new Map();this.tag=tag;this.value='';this.children=[];this.style={};this.dataset={};const classes=new Set();this.classList={add(...values){values.forEach(v=>classes.add(v));},remove(...values){values.forEach(v=>classes.delete(v));},contains:v=>classes.has(v),toggle(v,force){const on=force??!classes.has(v);on?classes.add(v):classes.delete(v);return on;}};this.parentElement=this;this.labels=[{textContent:'Measure'}];}
 set innerHTML(value){this.html=value;for(const match of value.matchAll(/<([\w-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){const el=new Element(match[1]);el.id=match[3];el.value=/\bvalue="([^"]*)"/.exec(match[2])?.[1]??(el.id==='axis'?'Z':el.id==='faceMethod'?'edges':el.id==='cutStyle'?'surface':el.id==='pinShape'?'rectangle':'');el.checked=/\bchecked\b/.test(match[2]);elements.set(el.id,el);}}
 append(...els){this.children.push(...els);}replaceChildren(...els){this.children=els;}after(el){if(el.id)elements.set(el.id,el);}setAttribute(){}removeAttribute(){}addEventListener(type,fn,options){const list=this.events.get(type)??[];list.push({fn,capture:options===true||options?.capture});this.events.set(type,list);}async emit(type,e){const pending=[];for(const x of [...(this.events.get(type)??[])].sort((a,b)=>Number(b.capture)-Number(a.capture)))pending.push(x.fn(e));await Promise.all(pending);}setPointerCapture(){}remove(){}click(){return this.onclick?.();}
 querySelectorAll(){return this.children.flatMap(e=>e.children??[]).filter(e=>e.tag==='button');}getBoundingClientRect(){return {width:800,height:600,left:0,top:0};}
}
const app=new Element();elements.set('app',app);
const document={getElementById:id=>elements.get(id),querySelector:()=>app,querySelectorAll:()=>[],createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener(){},dispatchEvent(){},body:new Element()};
class Renderer{constructor({canvas}){this.domElement=canvas;}setPixelRatio(){}setSize(){}setAnimationLoop(){}}
class Controls extends Three.EventDispatcher{constructor(camera){super();this.camera=camera;this.target=new Three.Vector3();this.mouseButtons={};}update(){this.camera.lookAt(this.target);this.camera.updateMatrixWorld();}}
class TransformControls extends Three.EventDispatcher{
 constructor(){super();this.mode='translate';this.helper=new Three.Object3D();}setSpace(){}setSize(){}getHelper(){return this.helper;}attach(o){this.object=o;}detach(){this.object=null;}setMode(m){this.mode=m;}
}
class ResizeObserver{observe(){}}
let workerInstance;class Worker{constructor(){workerInstance=this;}postMessage(data){Promise.resolve(globalThis.onmessage({data})).catch(error=>this.onerror(error));}}
let workerSource=await readFile('src/worker.js','utf8');workerSource=workerSource.replace("import wasmUrl from 'manifold-3d/manifold.wasm?url';",`const wasmUrl=${JSON.stringify(import.meta.resolve('manifold-3d/manifold.wasm').replace('file:///',''))};`);
const temp='src/.controller-worker.mjs';await writeFile(temp,workerSource);globalThis.onmessage=null;globalThis.postMessage=data=>workerInstance.onmessage({data});
try{
 await import(pathToFileURL(process.cwd()+'/'+temp));
 let source=await readFile('src/main.js','utf8');source=source.replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.url',JSON.stringify(import.meta.url)).replace('sync();demo();','sync();');
 const context={createGeometryJobs,undoSpecific,historyLabel,installWorkspaceUI:()=>{},holeCutter,editContour,installHelp:()=>{},installDownloadAuth:()=>action=>action(),displayBuffers,installLocale:()=>{},pickSurface,selectFaceGroup,toggleFaceGroup,pinFits,THREE:{...Three,WebGLRenderer:Renderer},OrbitControls:Controls,TransformControls,STLLoader,STLExporter,ThreeMFLoader,FBXLoader,ObjectProject,frustumMesh,connectorFrameForSide,toCreasedNormals,zipSync,unzipSync,strFromU8,workspace,document,Worker,ResizeObserver,devicePixelRatio:1};
 const controller=Function(...Object.keys(context),source+';return {projectSaveState,restoreSavedEditor,paintFaces,finishBrush,setBrushHeld:v=>{brushDrawing=v;},getOverlay:()=>faceOverlay,setPainted:ids=>{selectedFaces=new Set(ids);groupsConfirmed=false;},startPieceTool,queuePiecePreview,setHoleFrame:f=>{pieceDraft.frame=f;queuePiecePreview();},applyContourEdit,positionTraceMenu,setLine:(i,a)=>{selectedLine=i;selectedLineAnchor=a;selectedPoint=-1;},rebasePostControls,renderPostPin,setPostFrame:f=>{postPin.frame=f;rebasePostControls();renderPostPin();},toggleObjectSelection,togglePointSelection,drawFaces,positionFaceMenu,previewSelectedFaces,commitScreenStroke,pinGizmos,advanceAssembly,toggleObjectAssembly,toggleObjectVisibility,closeContour,commitStroke,addPoint,load,controls,generateGroups,pin,pinGizmo,pinTarget,config,updateVisuals,demo,build,selectObject,overview,project,changeMode,meshSTL,getState:()=>({pieceDraft,postPin,selectedPoint,selectedFaces,busy,valid,cap,projectionDraft,activeId,parts:parts.length,original,objectMeshes,anchors,segments,closed,smoothPreview,faceGroups,groupsConfirmed,gesture}),setFaces:ids=>{selectedFaces=new Set(ids);groupsConfirmed=true;}};')(...Object.values(context));
 await controller.demo();
 const canvas=elements.get('canvas'),event={pointerId:1,clientX:400,clientY:300,button:2,buttons:2,stopImmediatePropagation(){}};
 await canvas.emit('pointerdown',event);assert.equal(controller.getState().gesture.owner,'camera');assert.equal(controller.controls.enabled,true);
 await canvas.emit('pointermove',{...event,clientX:450});assert.equal(controller.getState().anchors.length,0);
 await canvas.emit('pointerup',{...event,buttons:0});await new Promise(r=>setTimeout(r,1));assert.equal(controller.getState().gesture,null);
 elements.get('faceTool').onclick();await canvas.emit('pointerdown',{...event,button:0,buttons:1});assert.equal(controller.getState().gesture.owner,'trace');assert.equal(controller.controls.enabled,false);
 await canvas.emit('pointercancel',event);await new Promise(r=>setTimeout(r,1));assert.equal(controller.controls.enabled,true);assert.equal(controller.getState().gesture,null);
 elements.get('orbit').onclick();await canvas.emit('pointerdown',{...event,button:0,buttons:1});assert.equal(controller.getState().gesture.owner,'camera');await canvas.emit('pointerup',{...event,button:0,buttons:0});await new Promise(r=>setTimeout(r,1));
 await canvas.emit('pointerdown',{...event,button:0,buttons:1,pointerType:'touch',pointerId:10});
 await canvas.emit('pointerdown',{...event,button:0,buttons:1,pointerType:'touch',pointerId:11});assert.equal(controller.getState().gesture.owner,'camera');
 await canvas.emit('pointerup',{...event,button:0,buttons:0,pointerType:'touch',pointerId:10});assert.ok(controller.getState().gesture,'second touch keeps camera active');
 await canvas.emit('pointerup',{...event,button:0,buttons:0,pointerType:'touch',pointerId:11});await new Promise(r=>setTimeout(r,1));assert.equal(controller.getState().gesture,null);
 // A delayed release from the first click must not clear the second gesture.
 const rapid={...event,button:0,buttons:1,pointerId:22,pointerType:'mouse'};
 await canvas.emit('pointerdown',rapid);await canvas.emit('pointerup',{...rapid,buttons:0});
 await canvas.emit('pointerdown',rapid);await new Promise(r=>setTimeout(r,2));
 assert.ok(controller.getState().gesture,'second press survives first release cleanup');
 await canvas.emit('pointerup',{...rapid,buttons:0});await new Promise(r=>setTimeout(r,2));
 assert.equal(controller.getState().gesture,null);
 await controller.generateGroups();assert.equal(controller.getState().faceGroups.labels.length,controller.project.items[0].mesh.triVerts.length/3);assert.equal(controller.getState().groupsConfirmed,false);elements.get('confirmFaces').onclick();assert.equal(controller.getState().groupsConfirmed,true);assert.equal(controller.pin.visible,false,'no pin before contour');elements.get('faceTool').onclick();controller.setFaces([0]);controller.drawFaces();assert.ok(!elements.get('faceMenu').classList.contains('hidden'),'selection opens floating toolbar');elements.get('faceMenuClear').onclick();assert.ok(elements.get('faceMenu').classList.contains('hidden'),'clear selection hides toolbar');
 await controller.demo();elements.get('brushTool').onclick();controller.setBrushHeld(true);controller.paintFaces({clientX:400,clientY:300});assert.ok(controller.getState().selectedFaces.size>0,'paint appears before releasing pointer');assert.ok(controller.getOverlay(),'live overlay exists while held');controller.setBrushHeld(false);controller.finishBrush();await new Promise(r=>setTimeout(r,30));controller.setPainted([0]);controller.drawFaces();controller.updateVisuals();assert.equal(controller.getState().faceGroups,null);assert.equal(controller.getState().groupsConfirmed,false);assert.equal(elements.get('useFaces').disabled,false,'brush selection needs no automatic groups');elements.get('faceTool').onclick();assert.ok(controller.getState().selectedFaces.has(0));elements.get('brushTool').onclick();assert.ok(controller.getState().selectedFaces.has(0));await elements.get('useFaces').onclick();assert.equal(controller.getState().closed,true,'painted border becomes a closed contour');
 await controller.demo(true);assert.ok(controller.pin.visible,'pin after contour');assert.equal(controller.pinGizmos.filter(g=>g.object===controller.pinTarget&&g.getHelper().visible).length,1,'only the selected gizmo is visible');
 assert.ok(!elements.get('pinMenu').classList.contains('hidden'),'connector toolbar appears');elements.get('pinMenuRotate').onclick();assert.equal(controller.pinGizmos[1].getHelper().visible,true);assert.equal(controller.pinGizmos.filter(g=>g.getHelper().visible).length,1);const side=elements.get('pinSide').value;elements.get('flipPin').onclick();assert.notEqual(elements.get('pinSide').value,side);elements.get('flipPin').onclick();
 const beforeSmooth=controller.getState().anchors;elements.get('smoothPanel').open=true;elements.get('smoothPanel').ontoggle();await new Promise(r=>setTimeout(r,550));assert.ok(controller.getState().smoothPreview,'opening smoothing generates preview automatically');await elements.get('previewSmooth').onclick();assert.ok(controller.getState().smoothPreview,'smoothing produces a preview');assert.equal(controller.getState().anchors,beforeSmooth,'preview does not modify committed contour');assert.ok(controller.getState().smoothPreview.deviation<=.500001);elements.get('cancelSmooth').onclick();assert.equal(controller.getState().anchors,beforeSmooth);
 await elements.get('previewSmooth').onclick();elements.get('applySmooth').onclick();assert.notEqual(controller.getState().anchors,beforeSmooth);assert.equal(controller.getState().smoothPreview,null);

 const placed=controller.config();assert.ok(Number.isFinite(placed.u));
 controller.pinGizmo.dispatchEvent({type:'mouseDown'});controller.pinTarget.position.x+=10000;controller.pinGizmo.dispatchEvent({type:'objectChange'});assert.equal(controller.config().u,placed.u,'outside drag rejected');controller.pinGizmo.dispatchEvent({type:'mouseUp'});
 await controller.demo();elements.get('faceTool').onclick();controller.setFaces([0]);controller.previewSelectedFaces();await new Promise(r=>setTimeout(r,550));assert.ok(controller.getState().cap,'face selection produces automatic preview');assert.equal(controller.getState().closed,false,'preview does not commit selection');await elements.get('useFaces').onclick();assert.equal(controller.getState().anchors.length,3,'single triangle creates contour even when pin cannot fit');assert.equal(controller.pin.visible,false,'a pin is rejected when the region has no safe depth');
 await controller.demo();assert.equal(controller.project.items.length,1);elements.get('connector').checked=false;controller.changeMode('plane');await controller.build();assert.equal(controller.project.items.length,2);
 const sibling=controller.project.items[1],first=controller.project.items[0];const siblingDisplay=controller.getState().objectMeshes.get(sibling.id);await controller.selectObject(first.id);assert.equal(controller.getState().valid,true);controller.changeMode('plane');elements.get('axis').value='X';elements.get('axis').onchange();await controller.build();assert.equal(controller.project.items.length,3);assert.equal(controller.project.items[2],sibling);assert.equal(controller.getState().objectMeshes.get(sibling.id),siblingDisplay,'cut retains untouched sibling GPU geometry');
 controller.overview('assembled');controller.advanceAssembly(Infinity);assert.ok([...controller.getState().objectMeshes.values()].every(m=>m.position.length()===0));controller.overview('exploded');controller.advanceAssembly(Infinity);assert.ok([...controller.getState().objectMeshes.values()].some(m=>m.position.length()>0));
 const moving=controller.project.items[0],stationary=controller.project.items[1],stillBefore=controller.getState().objectMeshes.get(stationary.id).position.clone();
 controller.toggleObjectAssembly(moving.id);const movingMesh=controller.getState().objectMeshes.get(moving.id),motion=movingMesh.userData.assemblyMotion;assert.ok(motion,'individual assembly starts an animation');
 controller.advanceAssembly(motion.start+225);assert.ok(movingMesh.position.distanceTo(motion.from)>0,'movement interpolates');assert.ok(movingMesh.position.distanceTo(motion.to)>0,'movement does not jump to target');
 assert.ok(controller.getState().objectMeshes.get(stationary.id).position.equals(stillBefore),'other objects remain in place');
 controller.toggleObjectAssembly(moving.id);const reversed=movingMesh.userData.assemblyMotion;assert.ok(reversed.from.equals(movingMesh.position),'reversal starts at current position');controller.advanceAssembly(Infinity);assert.deepEqual(movingMesh.position.toArray(),moving.offset);
 const hiddenId=controller.project.items[0].id;controller.toggleObjectVisibility(hiddenId);assert.equal(controller.getState().objectMeshes.get(hiddenId).visible,false,'eye hides object');controller.overview('assembled');assert.equal(controller.getState().objectMeshes.get(hiddenId).visible,false,'view changes preserve hidden state');controller.toggleObjectVisibility(hiddenId);assert.equal(controller.getState().objectMeshes.get(hiddenId).visible,true,'eye reveals object');
 const beforeScale=controller.project.items.map(x=>x.mesh);elements.get('scalePercent').value='150';await elements.get('applyScale').onclick();assert.equal(controller.project.scale,1.5);assert.equal(controller.project.items.length,3);assert.ok(controller.project.items.every((x,i)=>x.mesh!==beforeScale[i]));assert.ok(!controller.getState().busy);await elements.get('undoCut').onclick();assert.equal(controller.project.scale,1);assert.deepEqual(controller.project.items.map(x=>x.mesh),beforeScale);
 const bytes=controller.meshSTL(sibling.mesh);assert.ok(bytes.length>84);for(let i=0;i<8&&controller.project.items.length>2;i++)await elements.get('undoCut').onclick();assert.equal(controller.project.items.length,2);
 await controller.selectObject(controller.project.items[0].id);assert.ok(controller.getState().original.visible);assert.equal([...controller.getState().objectMeshes.values()].filter(m=>m.visible).length,controller.project.items.length);
 await controller.demo(true);assert.equal(controller.project.items.length,1);assert.equal(controller.getState().parts,0);controller.overview('assembled');await controller.selectObject(controller.project.items[0].id);elements.get('connector').checked=false;await controller.build();assert.equal(controller.project.items.length,2);
 await controller.demo();const mesh=controller.project.items[0].mesh,faceIds=[];for(let i=0;i<mesh.triVerts.length;i+=3)if([0,1,2].every(j=>mesh.vertProperties[mesh.triVerts[i+j]*mesh.numProp+2]>=-1e-6))faceIds.push(i/3);controller.setFaces(faceIds);await elements.get('useFaces').onclick();assert.ok(controller.getState().anchors.length>2);await controller.build();assert.equal(controller.project.items.length,2);
 await controller.load(new Three.BoxGeometry(30,30,20),'planar-test.stl');elements.get('cutStyle').value='profile';elements.get('connector').checked=true;elements.get('depth').value=3;
 const profileMesh=controller.project.items[0].mesh,top=[];for(let i=0;i<profileMesh.triVerts.length;i+=3)if([0,1,2].every(j=>profileMesh.vertProperties[profileMesh.triVerts[i+j]*profileMesh.numProp+2]>9.99))top.push(i/3);
 controller.setFaces(top);await elements.get('useFaces').onclick();assert.ok(controller.getState().anchors.length>=3);assert.ok(controller.config().profileNormal);await controller.build();assert.equal(controller.project.items.length,2,'planar face becomes a thick interlocking patch');

 await controller.load(new Three.BoxGeometry(30,30,20),'endpoint-test.stl');controller.changeMode('surface');elements.get('pointTool').onclick();
 const traceMesh=controller.getState().original;
 function traceHit(x,y=2){const hits=new Three.Raycaster(new Three.Vector3(x,y,100),new Three.Vector3(0,0,-1)).intersectObject(controller.getState().original);assert.ok(hits.length);const hit=hits[0];return {...hit,normal:hit.face.normal};}
 function traceAnchor(x,y=2){const h=traceHit(x,y);return {point:h.point.toArray(),normal:h.normal.toArray(),face:h.faceIndex};}
 await controller.commitStroke([traceAnchor(-4),traceAnchor(0)]);
 await controller.commitStroke([traceAnchor(1),traceAnchor(4)]);
 assert.equal(controller.getState().anchors.at(-1).point[0],4,'second stroke extends nearest tail');
 const beforeThird=controller.getState().anchors.map(a=>a.point);
 await controller.commitStroke([traceAnchor(-5),traceAnchor(-8)]);
 assert.equal(controller.getState().anchors[0].point[0],4,'third stroke reverses chain to extend its original head');
 assert.equal(controller.getState().anchors.at(-1).point[0],-8);
 const joined=controller.getState();assert.equal(joined.segments.length,joined.anchors.length-1);
 for(let i=0;i<joined.segments.length;i++){assert.deepEqual(joined.segments[i].points[0],joined.anchors[i].point);assert.deepEqual(joined.segments[i].points.at(-1),joined.anchors[i+1].point);}
 await elements.get('undo').onclick();assert.deepEqual(controller.getState().anchors.map(a=>a.point),beforeThird,'undo restores orientation and previous strokes');
 await controller.addPoint(traceHit(-7));assert.equal(controller.getState().anchors.at(-1).point[0],-7,'point mode also extends the nearest head');
 elements.get('clear').onclick();
 await controller.commitStroke([traceAnchor(-4),traceAnchor(0)]);
 await controller.commitStroke([traceAnchor(0),traceAnchor(4)]);
 assert.equal(controller.getState().anchors.length,3,'exact endpoint snap does not duplicate anchor');
 elements.get('clear').onclick();elements.get('cutStyle').value='profile';elements.get('cutStyle').onchange();elements.get('freeTool').onclick();assert.equal(controller.config().cutStyle,'profile','manual drawing preserves the selected profile mode');

 for(const reverse of [false,true]){
  await controller.load(new Three.BoxGeometry(30,30,20),'drawn-profile.stl');controller.changeMode('surface');elements.get('cutStyle').value='profile';elements.get('connector').checked=true;elements.get('depth').value=3;
  let outline=[[-5,-4],[5,-4],[5,4],[-5,4]].map(([x,y])=>traceAnchor(x,y));if(reverse)outline.reverse();
  await controller.commitStroke(outline);await controller.closeContour();
  assert.equal(controller.getState().closed,true,'manual outline closes in profile mode');assert.ok(controller.config().profileNormal[2]>.99,'outward direction is independent of drawing order');
  await controller.build();assert.equal(controller.project.items.length,2,'drawn outline generates two thick closed pieces');
 }
 await controller.load(new Three.BoxGeometry(30,30,20),'selection-toggle.stl');
 await controller.commitStroke([traceAnchor(-4),traceAnchor(0),traceAnchor(4)]);
 const selectionAnchors=controller.getState().anchors.map(a=>a.point),selectionObject=controller.getState().activeId;
 controller.togglePointSelection(1);assert.equal(controller.getState().selectedPoint,1);
 controller.togglePointSelection(1);assert.equal(controller.getState().selectedPoint,-1);
 assert.deepEqual(controller.getState().anchors.map(a=>a.point),selectionAnchors,'point deselection preserves geometry');
 await controller.toggleObjectSelection(selectionObject);assert.equal(controller.getState().activeId,null);
 assert.equal(controller.project.items.length,1,'deselection does not delete object');
 await controller.toggleObjectSelection(selectionObject);assert.equal(controller.getState().activeId,selectionObject);
 assert.deepEqual(controller.getState().anchors.map(a=>a.point),selectionAnchors,'reselection restores draft');
 controller.togglePointSelection(1);controller.positionTraceMenu();assert.ok(!elements.get('traceMenu').classList.contains('hidden'),'point selection shows contextual actions');
 assert.ok(elements.get('lineMenuInsert').classList.contains('hidden'),'point menu excludes line insertion');
 elements.get('traceMenuClear').onclick();assert.ok(elements.get('traceMenu').classList.contains('hidden'),'deselect hides contextual actions');
 controller.setLine(0,traceAnchor(-2));controller.positionTraceMenu();assert.ok(!elements.get('lineMenuInsert').classList.contains('hidden'),'line menu offers insertion');
 await elements.get('lineMenuInsert').onclick();assert.equal(controller.getState().anchors.length,4);assert.equal(controller.getState().anchors[1].point[0],-2);
 controller.togglePointSelection(1);await elements.get('pointMenuRemove').onclick();assert.equal(controller.getState().anchors.length,3);
 await controller.load(new Three.BoxGeometry(30,30,20),'post-connector-workflow.stl');
 elements.get('connector').checked=false;elements.get('axis').value='Z';controller.changeMode('plane');await controller.build();
 await elements.get('addPostPin').onclick();assert.ok(controller.getState().postPin);
 controller.setPostFrame({position:[0,0,0],normal:[0,0,1],u:[1,0,0],v:[0,1,0]});
 assert.ok(controller.pin.visible,'post-cut connector preview appears');
 elements.get('u').value=1;elements.get('u').oninput();assert.equal(controller.getState().postPin.frame.position[0],1,'post-cut horizontal slider moves the preview');
 elements.get('rotation').value=90;elements.get('rotation').oninput();assert.ok(controller.getState().postPin.frame.u[1]>.99,'post-cut rotation slider rotates the preview');
 await elements.get('postFit').onclick();assert.match(elements.get('postStatus').textContent,/validado/);
 const pairBefore=controller.project.items.map(x=>x.mesh);await elements.get('postApply').onclick();
 assert.equal(controller.project.operations.at(-1).kind,'connector');assert.equal(controller.project.items.length,2);
 assert.ok(controller.project.items.every((x,i)=>x.mesh!==pairBefore[i]));
 await elements.get('undoAll').onclick();assert.deepEqual(controller.project.items.map(x=>x.mesh),pairBefore);
 await elements.get('redoAll').onclick();assert.equal(controller.project.operations.at(-1).kind,'connector');
 await controller.load(new Three.BoxGeometry(20,20,20),'hole-workflow.stl');
 elements.get('holeShape').value='square';
 await controller.startPieceTool('hole');
 controller.setHoleFrame({position:[0,0,10],normal:[0,0,-1],u:[1,0,0],v:[0,-1,0]});
 for(let i=0;i<100&&!controller.getState().pieceDraft?.result;i++)await new Promise(r=>setTimeout(r,20));
 assert.ok(controller.getState().pieceDraft.result,'automatic hole preview');
 const beforeHole=controller.project.items[0].mesh;
 await elements.get('pieceApply').onclick();assert.equal(controller.project.operations.at(-1).kind,'modify');
 assert.notEqual(controller.project.items[0].mesh,beforeHole);
 await elements.get('undoAll').onclick();assert.deepEqual(controller.project.items[0].mesh.vertProperties,beforeHole.vertProperties);assert.deepEqual(controller.project.items[0].mesh.triVerts,beforeHole.triVerts);
 await elements.get('redoAll').onclick();assert.equal(controller.project.operations.at(-1).recipe.config.mode,'hole');
 await controller.selectObject(controller.project.items[0].id);await controller.startPieceTool('repair');
 await new Promise(r=>setTimeout(r,450));assert.match(elements.get('pieceStatus').textContent,/Nenhum reparo/);
 await elements.get('pieceCancel').onclick();assert.equal(controller.getState().pieceDraft,null);
 await controller.load(new Three.BoxGeometry(20,20,20),'broken-piece.stl');
 const damagedItem=controller.project.items[0];damagedItem.mesh={...damagedItem.mesh,triVerts:damagedItem.mesh.triVerts.slice(3)};
 controller.project.roots[0].mesh=damagedItem.mesh;
 const preservedVertices=damagedItem.mesh.vertProperties;
 await controller.selectObject(damagedItem.id);assert.equal(controller.getState().valid,false,'open mesh stays selectable for repair');
 elements.get('repairLimit').value='40';await controller.startPieceTool('repair');
 for(let i=0;i<100&&!controller.getState().pieceDraft?.result;i++)await new Promise(r=>setTimeout(r,20));
 assert.ok(controller.getState().pieceDraft.result,'open mesh repair preview');
 await elements.get('pieceApply').onclick();assert.deepEqual(controller.project.items[0].mesh.vertProperties,preservedVertices);
 assert.equal(controller.project.operations.at(-1).recipe.config.mode,'repair');
 console.log('Passed controller: startup, two cuts, object selection, preserved sibling, assembled/exploded positions, export and undo.');
}finally{await unlink(temp);}


