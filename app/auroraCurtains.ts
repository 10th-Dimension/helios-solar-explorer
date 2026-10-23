import * as THREE from 'three';

// NASA ISS observations: green ~100–300 km, red above it up to ~500 km.
// https://esrs.jsc.nasa.gov/Collections/EarthObservatory/articles/AuroraDancingintheNight.htm
export const AURORA_CURTAIN_POLICY = { earthRadiusKm: 6371, baseAltitudeKm: 100, maximumAltitudeKm: 500, arcsPerHemisphere: 3, hemispheres: 2, preview: 'EXPLICIT_PERSISTENT_ILLUSTRATION' } as const;
const arcs = [{ start: -.35, length: 3.8, latitude: 67.2 }, { start: 2.6, length: 2.3, latitude: 70 }, { start: 4.6, length: 1.75, latitude: 65.8 }];

/** Six interrupted longitude × altitude sheets, merged into one draw call. */
export function createAuroraCurtainGeometry(radius: number, segments = 256, rows = 10) {
  if (!Number.isFinite(radius) || radius <= 0 || segments < 8 || rows < 2) throw new Error('Invalid auroral curtain geometry');
  const positions: number[] = [], uv: number[] = [], magnetic: number[] = [], indices: number[] = [];
  for (const hemisphere of [1, -1]) for (const [arcIndex, arc] of arcs.entries()) {
    const start = positions.length / 3;
    for (let y = 0; y <= rows; y++) for (let x = 0; x <= segments; x++) {
      const t = x / segments, h = y / rows, lon = arc.start + t * arc.length + (hemisphere < 0 ? .72 : 0);
      const lat = THREE.MathUtils.degToRad(arc.latitude), r = radius * (1 + (100 + h * 400) / 6371);
      positions.push(r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat) * hemisphere, r * Math.cos(lat) * Math.sin(lon));
      uv.push(t, h); magnetic.push(lon, lat, hemisphere, arcIndex);
      if (x < segments && y < rows) {
        const a = start + y * (segments + 1) + x, b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setAttribute('aMagnetic', new THREE.Float32BufferAttribute(magnetic, 4));
  geometry.setIndex(indices);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius * 1.085);
  return geometry;
}

export function createAuroraCurtainMaterial(radius: number) {
  return new THREE.ShaderMaterial({
    name: 'Helios folded auroral curtains', transparent: true, side: THREE.DoubleSide,
    depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uActivity: { value: 0 }, uOpacity: { value: 1 }, uQuality: { value: 1 }, uSunPosition: { value: new THREE.Vector3() }, uRadius: { value: radius }, uMagneticAxis: { value: new THREE.Vector3(.16, .98, -.12).normalize() } },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uRadius; uniform vec3 uMagneticAxis;
      attribute vec4 aMagnetic;
      varying vec2 vUv; varying vec3 vWorldPosition; varying vec3 vRadialWorld;
      varying float vLongitude; varying float vAltitude; varying float vArc;
      void main() {
        vUv = uv; vLongitude = aMagnetic.x; vArc = aMagnetic.w;
        float lon = aMagnetic.x, time = uTime * .13;
        float fold = sin(lon * 5.0 + sin(lon * 2.3 - time) * 1.8 + time) * .035;
        fold += sin(lon * 17.0 + sin(lon * 8.0 + time) * 1.6 - time * 1.3 + aMagnetic.w) * .010;
        float lat = aMagnetic.y + fold + sin(lon * 2.0 + time * .3) * .016;
        lat += uv.y * sin(lon * 9.0 + time) * .0018;
        vec3 pole = normalize(uMagneticAxis);
        vec3 axisX = normalize(cross(pole, vec3(0.0, 0.0, 1.0)));
        vec3 axisZ = normalize(cross(axisX, pole));
        vec3 radial = cos(lat) * (axisX * cos(lon) + axisZ * sin(lon)) + pole * sin(lat) * aMagnetic.z;
        float top = 350.0 + 150.0 * (.5 + .5 * sin(lon * 17.0 + sin(lon * 47.0 - time) * 1.2));
        vAltitude = 100.0 + uv.y * (top - 100.0);
        vec3 local = radial * uRadius * (1.0 + vAltitude / 6371.0);
        vec4 world = modelMatrix * vec4(local, 1.0);
        vWorldPosition = world.xyz;
        // Tangential curtain normals cannot determine the day/night boundary.
        vRadialWorld = normalize(mat3(modelMatrix) * radial);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uActivity; uniform float uOpacity; uniform float uQuality;
      uniform vec3 uSunPosition;
      varying vec2 vUv; varying vec3 vWorldPosition; varying vec3 vRadialWorld;
      varying float vLongitude; varying float vAltitude; varying float vArc;
      float hash1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
      float noise1(float x) { float i=floor(x),f=fract(x); return mix(hash1(i),hash1(i+1.0),f*f*(3.0-2.0*f)); }
      void main() {
        float darkness = 1.0 - smoothstep(-.17, .08, dot(normalize(vRadialWorld), normalize(uSunPosition - vWorldPosition)));
        float ends = smoothstep(0.0, .11, vUv.x) * (1.0 - smoothstep(.89, 1.0, vUv.x));
        float phase = vLongitude * mix(180.0, 550.0, uQuality)
          + sin(vLongitude * 13.0 - uTime * .16) * 4.0
          + sin(vLongitude * 35.0 + uTime * .21) * 3.0
          + sin(vLongitude * 91.0 - uTime * .09) * 1.6
          + vUv.y * sin(vLongitude * 19.0 + uTime * .15) * 1.2 + uTime * .35;
        // Nonperiodic fine rays: avoid evenly spaced barcode/picket-fence bars.
        float rays = pow(noise1(phase),1.65) * .82 + pow(noise1(phase*2.31+14.0),3.0) * .38;
        rays = mix(rays,.32,smoothstep(.9,2.8,fwidth(phase)));
        float modulation = .56 + .44 * sin(vLongitude * 7.0 + vArc * 2.0 - uTime * .23);
        float breaks = .12 + .88 * smoothstep(-.75, .05, sin(vLongitude * 3.7 + vArc * 1.7 + uTime * .055));
        float green = smoothstep(100.0, 119.0, vAltitude) * (1.0 - smoothstep(220.0, 325.0, vAltitude));
        float columnTop = mix(320.0,500.0,noise1(vLongitude*180.0+uTime*.11));
        float red = smoothstep(235.0, 325.0, vAltitude) * (1.0 - smoothstep(columnTop-75.0,columnTop,vAltitude));
        float lowerEdge = exp(-pow((vAltitude - 123.0) / 18.0, 2.0));
        vec3 emission = vec3(.065, 2.5, .38) * green * (.28 + rays * .72);
        emission += vec3(.16, 1.4, .36) * lowerEdge * (.45 + rays * .55);
        emission += vec3(1.0, .035, .15) * red * (.09 + rays * .26);
        float alpha = darkness * ends * breaks * modulation * max(green, red * .38)
          * (1.0 - smoothstep(.70, 1.0, vUv.y)) * clamp(uActivity, 0.0, 1.0) * .94 * uOpacity;
        if (alpha < .002) discard;
        gl_FragColor = vec4(emission, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
