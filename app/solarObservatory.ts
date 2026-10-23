import * as THREE from 'three';

// Exposure-controlled, illustrative reconstructions informed by NASA SDO/AIA
// and Hinode SOT. Neither material is an observation or spectral calculation.
const vertex = `
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vLocal = position;
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const noise = `
float hash(vec3 p) {
  p = fract(p * .1031); p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float noise3(vec3 p) {
  vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
    mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
    mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p) {
  return noise3(p)*.55+noise3(p*2.03+13.)*.28+noise3(p*4.1-7.)*.17;
}
`;
function material(name: string, fragment: string, transparent = false) {
  const m = new THREE.ShaderMaterial({
    name, vertexShader: vertex,
    fragmentShader: `uniform float uTime;
uniform float uUvView;
uniform float uOpacity;
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
` + noise + fragment,
    uniforms: { uTime: { value: 0 }, uUvView: { value: 0 }, uOpacity: { value: 1 },
      uSunPosition: { value: new THREE.Vector3() }, uActivity: { value: 0 }, uQuality: { value: 1 } },
    transparent, depthWrite: !transparent,
    blending: transparent ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  return m;
}

export function createHomeSurface() {
  return material('Helios Home observatory surface', `
float cells(vec3 p) {
  vec3 i=floor(p), f=fract(p);
  float a=10., b=10.;
  for(int z=-1;z<=1;z++) for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++) {
    vec3 o=vec3(float(x),float(y),float(z));
    vec3 s=vec3(hash(i+o),hash(i+o+17.),hash(i+o+43.));
    vec3 c=.5+.32*sin(s*6.283+uTime*.16);
    float d=length(o+c-f);
    b=min(b,max(a,d)); a=min(a,d);
  }
  return smoothstep(.012,.12,b-a)*(.72+.28*(1.-smoothstep(.05,.8,a)));
}
float spot(vec3 n,vec3 axis,float r) {
  float d=length(n-normalize(axis))/r;
  float angle=atan(n.z-axis.z,n.x-axis.x);
  d*=1.+.08*sin(angle*13.)+.06*noise3(n*170.);
  float pen=1.-smoothstep(.55,1.,d);
  float umbra=1.-smoothstep(.25,.48,d);
  return pen*.32+umbra*.56;
}
void main() {
  vec3 n=normalize(vLocal);
  float mu=max(dot(normalize(vNormal),normalize(cameraPosition-vWorld)),0.);
  vec3 p=n*67.;
  float footprint=max(length(dFdx(p)),length(dFdy(p)));
  float detail=1.-smoothstep(.7,1.9,footprint);
  float granules=.68;
  if(detail>.01) granules=mix(.68,cells(p),detail);
  float fine=noise3(n*210.+vec3(uTime*.035,0,0));
  // Dark lanes surround bright convective cells, without broad dark blotches.
  float convection=.46+.52*granules+.10*fine;
  float spots=spot(n,vec3(.45,.28,.85),.060)
    +spot(n,vec3(.53,.26,.81),.035)
    +spot(n,vec3(-.82,-.22,.52),.040)
    +spot(n,vec3(.3,-.25,-.92),.052)
    +spot(n,vec3(-.45,.25,-.85),.031);
  spots=min(spots,.92);
  float faculae=pow(fbm(n*32.),4.)*(1.-mu)*.9;
  float limb=.23+.77*pow(mu,.6);
  // A filtered, exposure-controlled warm white; never saturate into a blank disk.
  vec3 optical=vec3(.92,.61,.25)*convection*limb*(1.-spots)+vec3(.13,.10,.055)*faculae;
  // Multi-scale emissive network, stretched filaments and localized hot regions.
  vec3 warp=vec3(fbm(n*8.),fbm(n*8.+21.),fbm(n*8.-17.));
  vec3 q=n*42.+warp*3.+vec3(0,uTime*.028,0);
  float turbulence=fbm(q);
  float network=pow(1.-abs(2.*turbulence-1.),5.);
  float filament=smoothstep(.45,.65,fbm(n*16.+warp*4.));
  float hot=pow(max(0.,1.-length(n-normalize(vec3(.45,.28,.85)))*3.5),2.);
  hot+=pow(max(0.,1.-length(n-normalize(vec3(-.82,-.22,.52)))*4.),2.);
  float emission=.035+.48*network*network+.10*granules+.9*hot;
  emission*=.72+.28*noise3(n*130.+uTime*.055);
  vec3 uv=mix(vec3(.08,.001,.0002),vec3(1.7,.22,.006),clamp(emission,0.,1.));
  uv+=vec3(.65,.31,.04)*hot*network;
  uv*=.62+.38*mu;
  uv*=1.-filament*.45;
  gl_FragColor=vec4(mix(optical,uv,uUvView),uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`);
}

export function createHomeLoops(radius: number) {
  const group = new THREE.Group();
  group.name = 'Home ultraviolet magnetic arcades';
  const mats: THREE.ShaderMaterial[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const regions = [
    new THREE.Vector3(.45,.28,.85),new THREE.Vector3(-.82,-.22,.52),
    new THREE.Vector3(.85,.2,-.48),new THREE.Vector3(-.35,.25,-.9),
    new THREE.Vector3(.1,-.9,.35),new THREE.Vector3(.05,.75,.65),
  ];
  regions.forEach((axis,region) => {
    axis.normalize();
    const tangent = new THREE.Vector3().crossVectors(axis,new THREE.Vector3(0,1,0)).normalize();
    const across = new THREE.Vector3().crossVectors(axis,tangent).normalize();
    for (let strand=0;strand<6;strand++) {
      const width=.10+strand*.018;
      const height=(.12+strand*.022)*(1.+.08*Math.sin(strand*2.4+region));
      const points: THREE.Vector3[] = [];
      for(let j=0;j<=56;j++) {
        const t=j/56;
        const direction=axis.clone().addScaledVector(tangent,Math.cos(t*Math.PI)*width)
          .addScaledVector(across,((strand-2.5)*.012+.018*Math.sin(t*6.28+strand))*Math.sin(t*Math.PI)).normalize();
        points.push(direction.multiplyScalar(radius*(1.+height*Math.pow(Math.sin(t*Math.PI),.85)*(1.+.06*Math.sin(t*9.+region)))));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry=new THREE.TubeGeometry(curve,64,radius*.0032,6,false);
      geometries.push(geometry);
      const m=material('Helios ultraviolet plasma strand', `
uniform float uGlow;
void main() {
  float thread=pow(.5+.5*cos(vUv.y*6.283),2.);
  float flow=.45+.55*pow(.5+.5*sin(vUv.x*36.-uTime*1.8),3.);
  float pulse=.72+.28*sin(uTime*.35+vUv.x*5.);
  vec3 color=mix(vec3(2.2,.15,.004),vec3(3.2,.6,.025),flow);
  color=mix(color,vec3(1.8,.07,.001),uGlow);
  gl_FragColor=vec4(color,thread*(.5+.5*flow)*pulse*uUvView*uOpacity*mix(1.,.16,uGlow));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,true);
      m.uniforms.uTime.value=region+strand;
      m.uniforms.uGlow = { value: 0 };
      mats.push(m);
      group.add(new THREE.Mesh(geometry,m));
      const glowGeometry = new THREE.TubeGeometry(curve,64,radius*.010,6,false);
      const glowMaterial = m.clone();
      glowMaterial.uniforms.uGlow.value = 1;
      geometries.push(glowGeometry);
      mats.push(glowMaterial);
      group.add(new THREE.Mesh(glowGeometry,glowMaterial));
    }
  });
  return { group, materials:mats, geometries };
}

