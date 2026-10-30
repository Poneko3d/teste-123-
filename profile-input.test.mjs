import assert from 'node:assert/strict';
import fs from 'node:fs';
import {topology,rawTopology} from './src/continuous.js';
import {resolveProfileInput} from './src/profile-input.js';
import {decodeProject} from './src/project-file.js';
const vertices=[],faces=[],major=24,minor=12,at=(i,j)=>((i+major)%major)*minor+(j+minor)%minor;
for(let i=0;i<major;i++)for(let j=0;j<minor;j++){const a=i/major*Math.PI*2,b=j/minor*Math.PI*2;vertices.push([(10+3*Math.cos(b))*Math.cos(a),(10+3*Math.cos(b))*Math.sin(a),3*Math.sin(b)]);}
for(let i=0;i<major;i++)for(let j=0;j<minor;j++){const a=at(i,j),b=at(i+1,j),c=at(i+1,j+1),d=at(i,j+1);faces.push([a,b,c],[a,c,d]);}
const t=topology(vertices,faces),ring=Array.from({length:minor},(_,j)=>at(0,j)),paths=ring.map((a,j)=>{const b=ring[(j+1)%minor],key=a<b?a+':'+b:b+':'+a;return {points:[vertices[a],vertices[b]],faces:[t.edges.get(key)[0]]};});
assert.equal(resolveProfileInput(t,paths).projectedRepair,true);
if(process.argv[2]){const {state:s}=decodeProject(new Uint8Array(fs.readFileSync(process.argv[2]))),d=s.editor.drafts.find(x=>x[0]===s.editor.activeId)[1],mesh=s.items.find(x=>x.id===s.editor.activeId).mesh;assert.equal(resolveProfileInput(rawTopology(mesh),d.segments,d.cfg).projectedRepair,true);console.log('PASS saved statue contour: additional mesh connection detected without null access.');}
console.log('PASS closed non-separating loop is not accepted as an entire surface patch.');
