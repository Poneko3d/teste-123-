import assert from 'node:assert/strict';import Module from 'manifold-3d';import {ObjectProject} from './src/project.js';import {encodeProject,decodeProject} from './src/project-file.js';
const api=await Module();api.setup();const solid=api.Manifold.cube([10,10,10]),project=new ObjectProject();project.reset([solid.getMesh()],'Model');
const state=project.state();state.editor={activeId:1,overview:false,fields:{width:'2'},connector:true,assemblyView:'assembled',camera:[30,-30,30],target:[0,0,0],drafts:[[1,{anchors:[{point:[0,0,0],face:0}],segments:[],closed:false,mode:'surface',strokeTool:'faces',cfg:{mode:'surface'},selectedFaces:[0,1],groupsConfirmed:false}]]};
const restored=decodeProject(encodeProject(state,'Progress')).state;
assert.deepEqual(restored.editor,state.editor);assert.equal(restored.items[0].mesh.vertProperties,restored.roots[0].mesh.vertProperties,'shared buffers restored once');assert.deepEqual(restored.items[0].mesh.triVerts,state.items[0].mesh.triVerts);
assert.throws(()=>decodeProject(encodeProject({...state,editor:{drafts:[[1,{anchors:[{point:[NaN,0,0]}],segments:[],mode:'surface',strokeTool:'points',cfg:{}}]]}},'Invalid')));
solid.delete();console.log('PASS saved editing progress: drafts, face selection, configuration, camera and shared buffers; malformed draft rejected.');
