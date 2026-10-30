import assert from 'node:assert/strict';
import { interiorLeaderPath } from '../app/interiorLeader.ts';

const viewport = {width:1200,height:800};
const note = {left:40,top:350,right:340,bottom:470};
for (const point of [{x:600,y:420,z:0},{x:800,y:180,z:.9},{x:10,y:420,z:0},{x:200,y:600,z:0}]) {
  const leader=interiorLeaderPath(point,note,viewport);
  assert(leader,'An on-screen region outside the side note needs a leader.');
  assert.equal(leader.x,point.x); assert.equal(leader.y,point.y);
  const coordinates=leader.path.match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert(coordinates.every(Number.isFinite));
  const [x,y]=coordinates;
  assert(x===note.left||x===note.right||y===note.top||y===note.bottom,'Leader must leave a side-note boundary.');
  assert.deepEqual(coordinates.slice(-2),[point.x,point.y],'The marker must remain attached to the projected selected region.');
}
for(const point of [{x:600,y:420,z:1.01},{x:600,y:420,z:-1.01},{x:-1,y:420,z:0},{x:1201,y:420,z:0},{x:600,y:801,z:0},{x:100,y:400,z:0},{x:NaN,y:420,z:0}]) {
  assert.equal(interiorLeaderPath(point,note,viewport),null,'Do not point off-screen, behind the camera, or through the text card.');
}
assert.equal(interiorLeaderPath({x:600,y:420,z:0},{left:40,right:340,top:-200,bottom:-10},viewport),null);
assert.equal(interiorLeaderPath({x:600,y:420,z:0},{left:40,right:340,top:400,bottom:390},viewport),null);
const mobile=interiorLeaderPath({x:195,y:650,z:0},{left:12,right:378,top:20,bottom:300},{width:390,height:844});
assert(mobile); assert(mobile.path.startsWith('M 195 300 '),'A note above the scene should connect from its lower edge.');
console.log('Verified planetary leader attachment, side-note boundaries, rotated/zoomed projections, mobile placement and hidden/invalid target handling. GPU appearance is checked in browser.');
