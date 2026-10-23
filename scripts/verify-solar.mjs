import assert from 'node:assert/strict';
import { createHomeSurface, createHomeLoops } from '../app/solarObservatory.ts';
const surface = createHomeSurface();
assert.equal(surface.transparent, false);
assert.equal(surface.uniforms.uUvView.value, 0);
assert.ok(surface.fragmentShader.includes('dFdx'));
surface.dispose();
for (const radius of [1, 5.5]) {
  const { group, materials, geometries } = createHomeLoops(radius);
  assert.equal(group.children.length, 72);
  assert.equal(materials.length, geometries.length);
  for (const geometry of geometries) {
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const distance = Math.hypot(positions.getX(i), positions.getY(i), positions.getZ(i));
      assert.ok(Number.isFinite(distance));
      assert.ok(distance >= radius * .985 && distance < radius * 1.30);
    }
    geometry.computeBoundingSphere();
    assert.ok(Number.isFinite(geometry.boundingSphere.radius));
    geometry.dispose();
  }
  for (const material of materials) {
    assert.equal(material.depthWrite, false);
    assert.equal(material.uniforms.uUvView.value, 0);
    material.dispose();
  }
}
console.log('Verified two solar radii, 36 anchored arc strands, finite bounds, view defaults and transparent depth behavior. GPU appearance checked separately in browser.');

