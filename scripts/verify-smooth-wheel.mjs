import assert from 'node:assert/strict';
import {smoothWheelStep} from '../app/smoothWheel.ts';
import {getStellarObject} from '../app/stellar.ts';
assert.equal(getStellarObject('sol').name,'Home [Our Sun]');
assert(getStellarObject('sol').designation.includes('Sol'));
for(const hz of [30,60,120]) for(const input of [-4800,-100,100,4800]) {
  let pending=input,total=0,steps=0;
  for(let frame=0;frame<hz*3;frame++){const s=smoothWheelStep(pending,1/hz);assert(Math.abs(s.applied)<=180);assert(Math.sign(s.applied)===Math.sign(input)||s.applied===0);total+=s.applied;pending=s.pending;if(s.applied)steps++;}
  assert(Math.abs(total+pending-input)<1e-8);assert(Math.abs(pending)<1e-6);assert(steps>1);
}
assert.deepEqual(smoothWheelStep(100,0),{applied:0,pending:100});
assert.deepEqual(smoothWheelStep(NaN,1/60),{applied:0,pending:0});
console.log('Verified bounded, monotonic, delta-conserving wheel easing at 30/60/120 Hz in both directions.');
