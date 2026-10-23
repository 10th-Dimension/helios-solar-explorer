import * as THREE from 'three';

/**
 * Lighting and appearance approximations for the atlas, not a radiative-transfer
 * solver or a live image of space weather. Scientific radii/axes belong in data.
 * All supplied sphere meshes must have uniform scale. Textures use SRGBColorSpace.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vLocalPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentHeader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSunPosition;
  uniform float uActivity;
  uniform float uQuality;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  float sat(float x) { return clamp(x, 0.0, 1.0); }
`;

// Continuous 3-D value noise avoids the longitude seam and artificial latitude
// stripes of the previous photosphere. No textures or allocations per frame.
const noiseShader = /* glsl */ `
  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm3(vec3 p) {
    float n = noise3(p) * 0.55;
    n += noise3(p * 2.03 + 11.7) * 0.28;
    n += noise3(p * 4.11 - 4.2) * 0.17;
    return n;
  }
`;

function uniforms() {
  return {
    uTime: { value: 0 },
    uSunPosition: { value: new THREE.Vector3() },
    uActivity: { value: 0 },
    uQuality: { value: 1 },
    uOpacity: { value: 1 },
  };
}

function makeMaterial(
  name: string,
  fragmentShader: string,
  extraUniforms: Record<string, THREE.IUniform> = {},
  parameters: THREE.ShaderMaterialParameters = {},
) {
  const material = new THREE.ShaderMaterial({
    name,
    vertexShader,
    fragmentShader: fragmentHeader + fragmentShader,
    uniforms: { ...uniforms(), ...extraUniforms },
    ...parameters,
  });
  material.userData.celestialMaterial = true;
  return material;
}

/** Real day/night maps share one body orientation. Night light is not procedural. */
export function createEarthMaterial(day: THREE.Texture, night: THREE.Texture) {
  return makeMaterial('Helios Earth day / night', /* glsl */ `
    uniform sampler2D uDayMap;
    uniform sampler2D uNightMap;
    void main() {
      vec3 normal = normalize(vWorldNormal);
      vec3 lightDirection = normalize(uSunPosition - vWorldPosition);
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float ndotl = dot(normal, lightDirection);
      float mu = max(dot(normal, viewDirection), 0.0);
      vec3 day = texture2D(uDayMap, vUv).rgb;
      vec3 night = texture2D(uNightMap, vUv).rgb;
      // Blue Marble contains no ocean mask. This conservative colour-derived
      // mask only modulates a restrained specular lobe; it adds no geography.
      float ocean = smoothstep(0.015, 0.10, day.b - max(day.r, day.g));
      float sunlight = pow(max(ndotl, 0.0), 0.94);
      vec3 color = day * (0.0018 + sunlight * 1.12);
      vec3 halfDirection = normalize(lightDirection + viewDirection);
      float specular = pow(max(dot(normal, halfDirection), 0.0), 105.0);
      float fresnel = 0.025 + 0.975 * pow(1.0 - mu, 5.0);
      color += vec3(1.0, 0.97, 0.88) * specular * ocean
        * max(ndotl, 0.0) * (0.12 + fresnel * 0.30);
      float darkness = 1.0 - smoothstep(-0.24, 0.045, ndotl);
      color += night * vec3(1.8, 1.17, 0.55) * darkness;
      gl_FragColor = vec4(color, uOpacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `, { uDayMap: { value: day }, uNightMap: { value: night } });
}

/** Use the supplied transparent cloud map; geometry at 1.007–1.012 Earth radii. */
export function createCloudMaterial(map: THREE.Texture) {
  return makeMaterial('Helios sunlit clouds', /* glsl */ `
    uniform sampler2D uCloudMap;
    void main() {
      vec4 cloud = texture2D(uCloudMap, vUv);
      vec3 normal = normalize(vWorldNormal);
      vec3 lightDirection = normalize(uSunPosition - vWorldPosition);
      float ndotl = dot(normal, lightDirection);
      float day = max(ndotl, 0.0);
      float twilight = exp(-abs(ndotl) * 18.0);
      vec3 color = vec3(0.0018, 0.0025, 0.004) + vec3(0.94, 0.97, 1.0) * day;
      color += vec3(0.095, 0.028, 0.009) * twilight;
      // Alpha comes from coverage, not illumination: clouds also occlude cities.
      float coverage = cloud.a * smoothstep(0.02, 0.55, dot(cloud.rgb, vec3(0.3333)));
      gl_FragColor = vec4(color, coverage * 0.82 * uOpacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `, { uCloudMap: { value: map } }, { transparent: true, depthWrite: false });
}

const atmosphereProfiles: Record<string, { color: string; density: number; width: number; sunset: string }> = {
  earth: { color: '#5ba8ff', density: 0.58, width: 3.0, sunset: '#e5753e' },
  venus: { color: '#ddbb84', density: 0.47, width: 2.3, sunset: '#c56b30' },
  mars: { color: '#ce8861', density: 0.19, width: 3.8, sunset: '#8bb7d2' },
  jupiter: { color: '#c1a78d', density: 0.16, width: 3.8, sunset: '#b28061' },
  saturn: { color: '#d6c295', density: 0.16, width: 3.8, sunset: '#b99156' },
  uranus: { color: '#86d8dc', density: 0.22, width: 3.4, sunset: '#6cb7ca' },
  neptune: { color: '#5086dc', density: 0.23, width: 3.6, sunset: '#657fae' },
};

/** Back-facing thin shell; recommended 1.018 Earth, 1.008 Mars, 1.025 Venus. */
export function createAtmosphereMaterial(id: string) {
  const profile = atmosphereProfiles[id] ?? atmosphereProfiles.earth;
  return makeMaterial(`Helios ${id} atmosphere`, /* glsl */ `
    uniform vec3 uScatterColor;
    uniform vec3 uSunsetColor;
    uniform float uDensity;
    uniform float uRimPower;
    void main() {
      vec3 normal = normalize(vWorldNormal);
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      vec3 lightDirection = normalize(uSunPosition - vWorldPosition);
      float ndotl = dot(normal, lightDirection);
      float ndotv = abs(dot(normal, viewDirection));
      float limb = pow(1.0 - ndotv, uRimPower);
      float lit = smoothstep(-0.20, 0.55, ndotl);
      float terminator = exp(-abs(ndotl) * 14.0);
      float forwardScatter = pow(max(dot(-viewDirection, lightDirection), 0.0), 5.0);
      vec3 color = mix(uScatterColor, uSunsetColor, terminator * 0.72);
      float alpha = limb * uDensity * (0.012 + lit * 0.88 + terminator * 0.24);
      color *= 0.58 + forwardScatter * 0.36;
      gl_FragColor = vec4(color, alpha * uOpacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `, {
    uScatterColor: { value: new THREE.Color(profile.color) },
    uSunsetColor: { value: new THREE.Color(profile.sunset) },
    uDensity: { value: profile.density },
    uRimPower: { value: profile.width },
  }, { transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending });
}

/** Opaque photosphere replaces the underlying emissive orange material. */
export function createSolarMaterial() {
  return makeMaterial('Helios granular photosphere', noiseShader + /* glsl */ `
    uniform vec3 uEventDirection;
    void main() {
      vec3 localNormal = normalize(vLocalPosition);
      vec3 normal = normalize(vWorldNormal);
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float mu = max(dot(normal, viewDirection), 0.0);
      vec3 p = localNormal * 105.0 + vec3(0.0, uTime * 0.022, uTime * 0.013);
      float granules = noise3(p);
      float fine = uQuality > 0.5 ? noise3(p * 2.75 + uTime * 0.011) : 0.5;
      float cells = smoothstep(0.21, 0.81, granules * 0.82 + fine * 0.18);
      float macro = noise3(localNormal * 13.0 + uTime * 0.003);
      float limbDarkening = 0.39 + 0.61 * pow(mu, 0.63);
      vec3 color = mix(vec3(0.76, 0.67, 0.49), vec3(1.60, 1.49, 1.25), cells);
      color *= (0.84 + macro * 0.23) * limbDarkening;
      // One bounded active region; event timing comes from the scene scheduler.
      float region = smoothstep(0.975, 0.999, dot(localNormal, normalize(uEventDirection)));
      float spot = smoothstep(0.997, 0.9997, dot(localNormal, normalize(uEventDirection)));
      color *= 1.0 - spot * sat(uActivity) * 0.78;
      color += vec3(1.1, 0.65, 0.25) * region * (1.0 - spot) * sat(uActivity) * 0.70;
      gl_FragColor = vec4(color, uOpacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `, { uEventDirection: { value: new THREE.Vector3(0.28, 0.51, 0.81).normalize() } });
}

/** Shell at 1.24 solar render radii; dim scattering envelope, no solid halo disk. */
export function createCoronaMaterial() {
  return makeMaterial('Helios low solar corona', noiseShader + /* glsl */ `
    uniform float uShellScale;
    uniform vec3 uEventDirection;
    void main() {
      vec3 normal = normalize(vWorldNormal);
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float mu = abs(dot(normal, viewDirection));
      float projectedRadius = uShellScale * sqrt(max(0.0, 1.0 - mu * mu));
      float height = max(projectedRadius - 1.0, 0.0);
      float envelope = smoothstep(0.995, 1.018, projectedRadius)
        * (1.0 - smoothstep(1.17, 1.235, projectedRadius)) * exp(-height * 17.0);
      float structure = 0.72 + noise3(normalize(vLocalPosition) * 6.0 + uTime * 0.008) * 0.28;
      float region = smoothstep(0.92, 0.995,
        dot(normalize(vLocalPosition), normalize(uEventDirection)));
      float alpha = envelope * structure * (0.14 + sat(uActivity) * region * 0.22);
      gl_FragColor = vec4(vec3(0.92, 0.72, 0.49), alpha * uOpacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `, {
    uShellScale: { value: 1.24 },
    uEventDirection: { value: new THREE.Vector3(0.28, 0.51, 0.81).normalize() },
  }, { transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending });
}

/** RingGeometry lies in local XY. Supply absolute local inner/outer radii. */
export function createRingMaterial(id: string, inner: number, outer: number) {
  return makeMaterial(`Helios ${id} particulate rings`, noiseShader + /* glsl */ `
    uniform float uInnerRadius;
    uniform float uOuterRadius;
    uniform float uPlanetRadius;
    uniform vec3 uPlanetCenter;
    uniform vec3 uRingColor;
    void main() {
      float radius = length(vLocalPosition.xy);
      float t = (radius - uInnerRadius) / max(uOuterRadius - uInnerRadius, 0.001);
      float grain = noise3(vec3(radius * 240.0, 1.0, 0.0));
      float bands = 0.63 + 0.22 * sin(radius * 113.0) + (grain - 0.5) * 0.18;
      float edge = smoothstep(0.0, 0.015, t) * (1.0 - smoothstep(0.985, 1.0, t));
      vec3 sunDirection = normalize(uSunPosition - vWorldPosition);
      vec3 toCenter = uPlanetCenter - vWorldPosition;
      float alongRay = dot(toCenter, sunDirection);
      float closest = length(toCenter - sunDirection * max(alongRay, 0.0));
      float shadow = alongRay > 0.0 ? smoothstep(uPlanetRadius * 0.94, uPlanetRadius * 1.03, closest) : 1.0;
      float illumination = 0.10 + abs(dot(normalize(vWorldNormal), sunDirection)) * 0.75;
      vec3 color = uRingColor * illumination * mix(0.035, 1.0, shadow) * bands;
      gl_FragColor = vec4(color, edge * (0.52 + grain * 0.22) * uOpacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `, {
    uInnerRadius: { value: inner },
    uOuterRadius: { value: outer },
    uPlanetRadius: { value: inner / (id === 'uranus' ? 1.48 : 1.31) },
    uPlanetCenter: { value: new THREE.Vector3() },
    uRingColor: { value: new THREE.Color(id === 'uranus' ? '#87a7aa' : '#dac9a8') },
  }, { transparent: true, side: THREE.DoubleSide, depthWrite: false });
}

/** Pass render-frame world positions after any floating-origin rebase. */
export function updateCelestialMaterial(
  material: THREE.ShaderMaterial,
  elapsedSeconds: number,
  sunWorldPosition: THREE.Vector3,
  activity = 0,
  quality = 1,
) {
  material.uniforms.uTime.value = elapsedSeconds;
  material.uniforms.uSunPosition.value.copy(sunWorldPosition);
  material.uniforms.uActivity.value = THREE.MathUtils.clamp(activity, 0, 1);
  material.uniforms.uQuality.value = THREE.MathUtils.clamp(quality, 0, 1);
  material.uniforms.uOpacity.value = material.opacity;
}
