import assert from 'node:assert/strict';
import * as THREE from 'three';
import { AURORA_CURTAIN_POLICY as policy, createAuroraCurtainGeometry, createAuroraCurtainMaterial } from '../app/auroraCurtains.ts';

assert.equal(policy.baseAltitudeKm,100);
assert.equal(policy.maximumAltitudeKm,500);
assert.equal(policy.arcsPerHemisphere*policy.hemispheres,6);
for (const [segments,rows] of [[320,12],[224,10],[128,8]]) {
  const geometry=createAuroraCurtainGeometry(2,segments,rows);
  const p=geometry.getAttribute('position'),uv=geometry.getAttribute('uv'),magnetic=geometry.getAttribute('aMagnetic');
  assert.equal(p.count,6*(segments+1)*(rows+1));
  assert.equal(uv.count,p.count); assert.equal(magnetic.count,p.count);
  assert.equal(geometry.index.count,6*segments*rows*6);
  for(let i=0;i<p.count;i++) {
    const radius=Math.hypot(p.getX(i),p.getY(i),p.getZ(i));
    assert(Number.isFinite(radius));
    assert(radius>=2*(1+100/6371)-1e-6 && radius<=2*(1+500/6371)+1e-6);
    assert(radius<geometry.boundingSphere.radius);
    assert([1,-1].includes(magnetic.getZ(i)));
    assert(uv.getX(i)>=0&&uv.getX(i)<=1&&uv.getY(i)>=0&&uv.getY(i)<=1);
  }
  for(const index of geometry.index.array) assert(index>=0&&index<p.count);
  geometry.dispose();
}
assert.throws(()=>createAuroraCurtainGeometry(0));
const material=createAuroraCurtainMaterial(2);
assert.equal(material.side,THREE.DoubleSide); assert.equal(material.depthTest,true); assert.equal(material.depthWrite,false);
assert.equal(material.blending,THREE.AdditiveBlending);
assert(material.vertexShader.includes('vRadialWorld'));
assert(material.fragmentShader.includes('fwidth'));
material.dispose();
console.log('Verified six altitude-bounded auroral sheets, all LOD indices/attributes, both hemispheres, depth/occlusion settings and finite bounds. GPU appearance requires browser validation.');
