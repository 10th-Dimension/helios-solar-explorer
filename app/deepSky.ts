import * as THREE from 'three';

// Non-interactive statistical distant field. It never supplies catalog identities or positions.
export function createDeepSky(count: number) {
  let state = 17091;
  const random = () => { state = Math.imul(state, 1664525) + 1013904223 | 0; return (state >>> 0) / 4294967296; };
  const positions: number[] = [], colors: number[] = [], sizes: number[] = [];
  const galacticPole = new THREE.Vector3(-.8677, .456, -.1981).normalize();
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const theta = random() * Math.PI * 2;
    const z = random() * 2 - 1;
    const dir = new THREE.Vector3(Math.sqrt(1 - z * z) * Math.cos(theta), z, Math.sqrt(1 - z * z) * Math.sin(theta));
    if (i > count * .65) dir.addScaledVector(galacticPole, -dir.dot(galacticPole) * .91).normalize();
    const radius = 18000 + random() * 12000;
    positions.push(dir.x * radius, dir.y * radius, dir.z * radius);
    const brightness = Math.pow(random(), 5);
    color.setHSL(.06 + random() * .59, .12 + random() * .3, .48 + brightness * .45);
    color.multiplyScalar(.2 + brightness * .8);
    colors.push(color.r, color.g, color.b);
    sizes.push(.55 + brightness * 2.8);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  const material = new THREE.ShaderMaterial({
    depthWrite: false, depthTest: true, transparent: true, blending: THREE.AdditiveBlending,
    uniforms: { uPixelRatio: { value: 1 } },
    vertexShader: 'attribute float aSize; varying vec3 vColor; uniform float uPixelRatio; void main(){vColor=color;gl_PointSize=aSize*uPixelRatio;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec3 vColor; void main(){float r=length(gl_PointCoord-.5)*2.;float alpha=exp(-r*r*4.)*(1.-smoothstep(.65,1.,r));gl_FragColor=vec4(vColor,alpha*.8);}',
    vertexColors: true,
  });
  const points = new THREE.Points(geometry, material);
  points.name = 'illustrative-distant-magnitude-field';
  points.renderOrder = -100;
  points.frustumCulled = false;
  return points;
}
