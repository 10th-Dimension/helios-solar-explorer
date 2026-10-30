'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { interiorLeaderPath } from './interiorLeader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GRAPHICS_PROFILES, automaticGraphicsQuality, type GraphicsQuality } from './graphicsQuality';
import { astronomicalEvent } from './astronomicalEvents';
import { createGiantTexture } from './giantTexture';
import { createDeepSky } from './deepSky';
import { getBodyOrientation, J2000_OBLIQUITY_DEG } from './bodyOrientation';
import { createEarthMaterial, createCloudMaterial, createAtmosphereMaterial, createSolarMaterial, createCoronaMaterial, createRingMaterial, updateCelestialMaterial } from './celestialMaterials';
import { createAuroraCurtainGeometry, createAuroraCurtainMaterial } from './auroraCurtains';
import { createHomeSurface, createHomeLoops } from './solarObservatory';
import { shouldRebaseRenderOrigin } from './cosmicCoordinates';
import { destinationSystems, getDestinationSystemByAnchor, type DestinationBodyRecord } from './destinationSystems';
import { getExoplanet, type ExoplanetRecord } from './exoplanets';
import { solarSystem, type SpatialEntity } from './spatial';
import { distanceLightYears, getStellarObject, getStellarSystem, localStellarObjects, toStellarRenderPosition, type StellarObjectRecord } from './stellar';
import { placeStellarLabels, type PlacedStellarLabel } from './stellarLabels';
import { smoothWheelStep } from './smoothWheel';
import { worlds, type World } from './worlds';

export type FocusRequest = { targetId: string | null; sequence: number };
export type CosmicScale = 'PLANETARY' | 'SYSTEM' | 'LOCAL_STELLAR' | 'STELLAR_SYSTEM';
export type StellarTravelRequest = { targetId: string | null; sourceId: string | null; distanceLightYears: number; sequence: number };
export type ExoplanetFocusRequest = { targetId: string | null; sequence: number };
export type SystemObjectFocusRequest = { targetId: string | null; sequence: number };

type SceneProps = {
  graphicsQuality: GraphicsQuality | 'AUTO';
  eventPreview: number;
  auroraPreview: boolean;
  pauseAnimations?: boolean;
  selectedId: string | null;
  selectedStellarId: string | null;
  selectedExoplanetId: string | null;
  selectedSystemObjectId: string | null;
  arrivedStellarId: string | null;
  focusRequest: FocusRequest;
  stellarTravelRequest: StellarTravelRequest;
  exoplanetFocusRequest: ExoplanetFocusRequest;
  systemObjectFocusRequest: SystemObjectFocusRequest;
  interiorMode: boolean;
  activeLayer: number;
  interiorNoteRef: RefObject<HTMLElement | null>;
  following: boolean;
  onSelect: (id: string) => void;
  onSelectStellar: (id: string) => void;
  onSelectExoplanet: (id: string) => void;
  onSelectSystemObject: (id: string) => void;
  onArrive: (id: string | null) => void;
  onStellarTravelProgress: (targetId: string, progress: number, remainingLightYears: number) => void;
  onStellarArrive: (targetId: string) => void;
  onExoplanetArrive: (targetId: string) => void;
  onSystemObjectArrive: (targetId: string) => void;
  onScaleChange?: (scale: CosmicScale) => void;
};

type SceneRuntime = {
  applyQuality: (quality: GraphicsQuality | 'AUTO') => void;
  previewEvents: () => void;
  frameAurora: (enabled: boolean) => void;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  bodyGroups: Map<string, THREE.Group>;
  stellarGroups: Map<string, THREE.Group>;
  exoplanetGroups: Map<string, THREE.Group>;
  systemObjectGroups: Map<string, THREE.Group>;
  cosmicRoot: THREE.Group;
  backgroundStars: THREE.Points;
  renderOriginOffset: THREE.Vector3;
  solarGroup: THREE.Group;
  orbitMaterials: THREE.LineBasicMaterial[];
  transition: CameraTransition | null;
  stellarTravel: StellarTravelTransition | null;
  focusedId: string | null;
  focusedExoplanetId: string | null;
  focusedSystemObjectId: string | null;
  inspectionBlend: number;
  stellarBlend: number;
  cosmicScale: CosmicScale;
};

type HoveredObject =
  | { kind: 'world'; world: World }
  | { kind: 'stellar'; object: StellarObjectRecord }
  | { kind: 'exoplanet'; object: ExoplanetRecord }
  | { kind: 'system-object'; object: StellarObjectRecord };

type CameraTransition = {
  startAt: number;
  duration: number;
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  targetId: string | null;
  targetDomain: 'solar' | 'exoplanet' | 'system-object';
  targetRadius: number | null;
  fromFov: number;
  toFov: number;
};

type StellarTravelTransition = {
  startAt: number;
  duration: number;
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  arcDirection: THREE.Vector3;
  targetId: string;
  catalogDistanceLightYears: number;
  arrivalStandOff: number;
  modelStartDistance: number;
  lastProgressAt: number;
  fromFov: number;
};

const systemCamera = new THREE.Vector3(0, 57, 122);
const systemTarget = new THREE.Vector3(0, 0, 0);

function makeLabel(world: World) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d')!;
  context.font = '600 31px Arial';
  context.textAlign = 'center';
  context.fillStyle = 'rgba(255,255,255,.9)';
  context.fillText(world.name.toUpperCase(), 256, 56);
  context.font = '400 17px monospace';
  context.fillStyle = 'rgba(255,255,255,.48)';
  context.fillText(world.id === 'sun' ? 'UV · FALSE COLOR' : world.distance, 256, 89);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: true }));
  sprite.scale.set(12, 3, 1);
  return sprite;
}

function makeInteriorLabel(name: string, color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d')!;
  context.fillStyle = 'rgba(3,6,11,.78)';
  context.fillRect(0, 0, 512, 96);
  context.strokeStyle = color;
  context.strokeRect(1, 1, 510, 94);
  context.fillStyle = '#f8fbff';
  context.font = '600 20px monospace';
  context.textAlign = 'center';
  context.fillText(name.toUpperCase(), 256, 58);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.6, .49, 1);
  sprite.userData.layerLabel = true;
  return sprite;
}

function bodyClass(world: World) {
  if (world.id === 'sun') return 'star';
  if (world.kind.toLowerCase().includes('gas giant')) return 'gas';
  if (world.kind.toLowerCase().includes('ice giant')) return 'ice';
  return 'rocky';
}

function makeProceduralTexture(entity: SpatialEntity, world: World) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d')!;
  context.fillStyle = world.color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  let seed = entity.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(entity.id)) {
    for (let y = 0; y < canvas.height; y += 8 + random() * 18) {
      context.globalAlpha = .08 + random() * .24;
      context.fillStyle = random() > .48 ? world.accent : '#111827';
      context.fillRect(0, y, canvas.width, 3 + random() * 13);
    }
    if (entity.id === 'jupiter') {
      context.globalAlpha = .52;
      context.fillStyle = '#9f4029';
      context.beginPath();
      context.ellipse(690, 330, 78, 32, -.08, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#e6a57d';
      context.lineWidth = 7;
      context.stroke();
    }
  } else if (entity.id === 'venus') {
    context.strokeStyle = world.accent;
    context.lineWidth = 15;
    context.globalAlpha = .22;
    for (let y = 30; y < canvas.height; y += 45) {
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(260, y - 50, 690, y + 70, 1024, y - 10);
      context.stroke();
    }
  } else {
    for (let i = 0; i < 420; i++) {
      const radius = 2 + random() * (entity.id === 'mars' ? 25 : 16);
      context.globalAlpha = .04 + random() * .18;
      context.fillStyle = random() > .48 ? world.accent : '#101318';
      context.beginPath();
      context.ellipse(random() * 1024, random() * 512, radius * (1 + random()), radius, random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}


function makeStellarGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(.055, 'rgba(255,255,255,.98)');
  gradient.addColorStop(.16, 'rgba(255,255,255,.6)');
  gradient.addColorStop(.42, 'rgba(255,255,255,.12)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function entityPosition(entity: SpatialEntity) {
  const incline = THREE.MathUtils.degToRad(entity.inclination);
  return new THREE.Vector3(
    Math.cos(entity.phase) * entity.renderOrbit,
    Math.sin(entity.phase) * Math.sin(incline) * entity.renderOrbit,
    Math.sin(entity.phase) * entity.renderOrbit,
  );
}

function easeInOutCubic(value: number) {
  return value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function smoothstep(minimum: number, maximum: number, value: number) {
  const normalized = THREE.MathUtils.clamp((value - minimum) / (maximum - minimum), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

export default function SolarSystemScene({ graphicsQuality, eventPreview, auroraPreview, pauseAnimations = false, selectedId, selectedStellarId, selectedExoplanetId, selectedSystemObjectId, arrivedStellarId, focusRequest, stellarTravelRequest, exoplanetFocusRequest, systemObjectFocusRequest, interiorMode, activeLayer, interiorNoteRef, following, onSelect, onSelectStellar, onSelectExoplanet, onSelectSystemObject, onArrive, onStellarTravelProgress, onStellarArrive, onExoplanetArrive, onSystemObjectArrive, onScaleChange }: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const layerLeaderRef = useRef<SVGSVGElement>(null);
  const layerLeaderPathRef = useRef<SVGPathElement>(null);
  const layerLeaderDotRef = useRef<SVGCircleElement>(null);
  const calloutTargetRef = useRef(interiorNoteRef);
  useEffect(() => { calloutTargetRef.current = interiorNoteRef; }, [interiorNoteRef]);
  const selectedRef = useRef(selectedId);
  const selectedStellarRef = useRef(selectedStellarId);
  const selectedExoplanetRef = useRef(selectedExoplanetId);
  const selectedSystemObjectRef = useRef(selectedSystemObjectId);
  const arrivedStellarRef = useRef(arrivedStellarId);
  const onSelectRef = useRef(onSelect);
  const onSelectStellarRef = useRef(onSelectStellar);
  const onSelectExoplanetRef = useRef(onSelectExoplanet);
  const onSelectSystemObjectRef = useRef(onSelectSystemObject);
  const onArriveRef = useRef(onArrive);
  const onStellarTravelProgressRef = useRef(onStellarTravelProgress);
  const onStellarArriveRef = useRef(onStellarArrive);
  const onExoplanetArriveRef = useRef(onExoplanetArrive);
  const onSystemObjectArriveRef = useRef(onSystemObjectArrive);
  const onScaleChangeRef = useRef(onScaleChange);
  const followingRef = useRef(following);
  const [hovered, setHovered] = useState<HoveredObject | null>(null);
  const [stellarLabels, setStellarLabels] = useState<PlacedStellarLabel[]>([]);
  const [sceneScale, setSceneScale] = useState<CosmicScale>('SYSTEM');
  const [webglError, setWebglError] = useState(false);
  const qualityRef = useRef(graphicsQuality);
  const auroraPreviewRef = useRef(auroraPreview);
  const pauseAnimationsRef = useRef(pauseAnimations);
  useEffect(() => { pauseAnimationsRef.current = pauseAnimations; }, [pauseAnimations]);
  useEffect(() => { auroraPreviewRef.current = auroraPreview; runtimeRef.current?.frameAurora(auroraPreview); }, [auroraPreview]);
  const hoveredStellarRef = useRef<string | null>(null);
  useEffect(() => { qualityRef.current = graphicsQuality; runtimeRef.current?.applyQuality(graphicsQuality); }, [graphicsQuality]);
  useEffect(() => { if (eventPreview) runtimeRef.current?.previewEvents(); }, [eventPreview]);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onSelectStellarRef.current = onSelectStellar; }, [onSelectStellar]);
  useEffect(() => { onSelectExoplanetRef.current = onSelectExoplanet; }, [onSelectExoplanet]);
  useEffect(() => { onSelectSystemObjectRef.current = onSelectSystemObject; }, [onSelectSystemObject]);
  useEffect(() => { onArriveRef.current = onArrive; }, [onArrive]);
  useEffect(() => { onStellarTravelProgressRef.current = onStellarTravelProgress; }, [onStellarTravelProgress]);
  useEffect(() => { onStellarArriveRef.current = onStellarArrive; }, [onStellarArrive]);
  useEffect(() => { onExoplanetArriveRef.current = onExoplanetArrive; }, [onExoplanetArrive]);
  useEffect(() => { onSystemObjectArriveRef.current = onSystemObjectArrive; }, [onSystemObjectArrive]);
  useEffect(() => { onScaleChangeRef.current = onScaleChange; }, [onScaleChange]);
  useEffect(() => { followingRef.current = following; }, [following]);

  useEffect(() => {
    selectedRef.current = selectedId;
    runtimeRef.current?.bodyGroups.forEach((group, id) => {
      const mesh = group.userData.bodyMesh as THREE.Mesh | undefined;
      const material = mesh?.material as THREE.MeshStandardMaterial | undefined;
      if (material?.isMeshStandardMaterial && id !== 'sun') material.emissiveIntensity = .008;
      const selection = group.userData.selection as THREE.Mesh | undefined;
      if (selection) selection.visible = id !== 'earth' && id === selectedId;
    });
  }, [selectedId]);

  useEffect(() => {
    selectedStellarRef.current = selectedStellarId;
    runtimeRef.current?.stellarGroups.forEach((group, id) => {
      const selection = group.userData.selection as THREE.Mesh | undefined;
      if (selection) selection.visible = id === selectedStellarId && runtimeRef.current!.stellarBlend > .15;
    });
  }, [selectedStellarId]);

  useEffect(() => {
    selectedExoplanetRef.current = selectedExoplanetId;
    runtimeRef.current?.exoplanetGroups.forEach((group, id) => {
      const selection = group.userData.selection as THREE.Mesh | undefined;
      const planet = group.userData.exoplanet as ExoplanetRecord | undefined;
      if (selection) selection.visible = id === selectedExoplanetId && planet?.hostStarId === arrivedStellarRef.current;
    });
  }, [selectedExoplanetId]);

  useEffect(() => {
    selectedSystemObjectRef.current = selectedSystemObjectId;
    runtimeRef.current?.systemObjectGroups.forEach((group, id) => {
      const selection = group.userData.selection as THREE.Mesh | undefined;
      if (selection) selection.visible = id === selectedSystemObjectId && Boolean(arrivedStellarRef.current);
    });
  }, [selectedSystemObjectId]);

  useEffect(() => {
    arrivedStellarRef.current = arrivedStellarId;
    runtimeRef.current?.stellarGroups.forEach((group, id) => {
      const systemGroup = group.userData.systemGroup as THREE.Group | undefined;
      if (systemGroup) systemGroup.visible = id === arrivedStellarId;
    });
    runtimeRef.current?.exoplanetGroups.forEach((group, id) => {
      const planet = group.userData.exoplanet as ExoplanetRecord | undefined;
      const selection = group.userData.selection as THREE.Mesh | undefined;
      if (selection) selection.visible = id === selectedExoplanetRef.current && planet?.hostStarId === arrivedStellarId;
    });
    runtimeRef.current?.systemObjectGroups.forEach((group, id) => {
      const selection = group.userData.selection as THREE.Mesh | undefined;
      const anchorId = group.userData.destinationAnchorId as string | undefined;
      if (selection) selection.visible = id === selectedSystemObjectRef.current && anchorId === arrivedStellarId;
    });
  }, [arrivedStellarId]);

  useEffect(() => {
    runtimeRef.current?.bodyGroups.forEach((group, id) => {
      const exterior = group.userData.bodyMesh as THREE.Mesh | undefined;
      const interior = group.userData.interiorGroup as THREE.Group | undefined;
      const showingInterior = interiorMode && id === selectedId;
      if (exterior) exterior.visible = !showingInterior;
      ['atmosphere', 'clouds', 'starSurface', 'prominences', 'ringShadow', 'aurora', 'corona', 'rings'].forEach((key) => {
        const visual = group.userData[key] as THREE.Object3D | undefined;
        if (visual) visual.visible = !showingInterior;
      });
      if (!interior) return;
      group.userData.activeLayer = activeLayer;
      const wasVisible = interior.visible;
      interior.visible = showingInterior;
      if (showingInterior) {
        if (!wasVisible) interior.scale.setScalar(.82);
        interior.lookAt(runtimeRef.current!.camera.position);
        interior.rotateY(Math.PI);
      }
      interior.traverse((object) => {
        const layerMesh = object as THREE.Mesh;
        if (!layerMesh.isMesh || typeof layerMesh.userData.layerIndex !== 'number') return;
        const layerMaterial = layerMesh.material as THREE.MeshStandardMaterial;
        const isActive = layerMesh.userData.layerIndex === activeLayer;
        layerMaterial.emissiveIntensity = isActive ? (layerMaterial.userData.activeEmissive ?? .42) : (layerMaterial.userData.baseEmissive ?? .12);
        layerMaterial.opacity = isActive ? (layerMaterial.userData.activeOpacity ?? 1) : (layerMaterial.userData.baseOpacity ?? .82);
        layerMesh.position.z = isActive ? -.08 : 0;
      });
      interior.children.forEach((child) => {
        if (child.userData.layerLabel) child.visible = child.userData.layerIndex === activeLayer;
      });
    });
  }, [activeLayer, interiorMode, selectedId]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.stellarTravel = null;
    runtime.focusedExoplanetId = null;
    runtime.focusedSystemObjectId = null;
    if (runtime.renderOriginOffset.lengthSq() > 0) {
      runtime.camera.position.add(runtime.renderOriginOffset);
      runtime.controls.target.add(runtime.renderOriginOffset);
      runtime.cosmicRoot.position.set(0, 0, 0);
      runtime.renderOriginOffset.set(0, 0, 0);
    }
    const now = performance.now();
    const fromPosition = runtime.camera.position.clone();
    const fromTarget = runtime.controls.target.clone();
    let toPosition = systemCamera.clone();
    const toTarget = systemTarget.clone();
    if (focusRequest.targetId) {
      const group = runtime.bodyGroups.get(focusRequest.targetId);
      const entity = solarSystem.entities.find((item) => item.id === focusRequest.targetId);
      if (!group || !entity) return;
      group.getWorldPosition(toTarget);
      const direction = fromPosition.clone().sub(fromTarget).normalize();
      if (Math.abs(direction.y) > .82) direction.set(.45, .3, .84).normalize();
      const standOff = Math.max(8.5, entity.renderRadius * (entity.id === 'sun' ? 4.1 : 4.3));
      toPosition = toTarget.clone().add(direction.multiplyScalar(standOff)).add(new THREE.Vector3(0, entity.renderRadius * .55, 0));
    }
    const reduced = (pauseAnimationsRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    runtime.controls.enabled = false;
    const targetRadius = focusRequest.targetId ? solarSystem.entities.find((entity) => entity.id === focusRequest.targetId)?.renderRadius ?? null : null;
    runtime.transition = { startAt: now, duration: reduced ? 80 : focusRequest.targetId ? 2100 : 1650, fromPosition, toPosition, fromTarget, toTarget, targetId: focusRequest.targetId, targetDomain: 'solar', targetRadius, fromFov: runtime.camera.fov, toFov: focusRequest.targetId ? 34 : 42 };
  }, [focusRequest]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    const targetId = stellarTravelRequest.targetId;
    if (!runtime || !targetId) return;
    const group = runtime.stellarGroups.get(targetId);
    const object = localStellarObjects.find((item) => item.id === targetId);
    if (!group || !object || !object.astrometry) return;
    const toTarget = new THREE.Vector3();
    group.getWorldPosition(toTarget);
    const fromPosition = runtime.camera.position.clone();
    const fromTarget = runtime.controls.target.clone();
    const arrivalDirection = fromPosition.clone().sub(toTarget);
    if (arrivalDirection.lengthSq() < .001) arrivalDirection.set(.52, .26, 1);
    arrivalDirection.normalize();
    const destination = getDestinationSystemByAnchor(targetId);
    const arrivalStandOff = destination?.arrivalStandOff ?? 105;
    const toPosition = toTarget.clone().add(arrivalDirection.multiplyScalar(arrivalStandOff));
    const pathDirection = toPosition.clone().sub(fromPosition).normalize();
    const arcDirection = new THREE.Vector3().crossVectors(pathDirection, runtime.camera.up).normalize();
    if (arcDirection.lengthSq() < .001) arcDirection.set(1, 0, 0);
    const reduced = (pauseAnimationsRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const catalogDistance = stellarTravelRequest.distanceLightYears || distanceLightYears(object);
    runtime.transition = null;
    runtime.focusedId = null;
    runtime.controls.enabled = false;
    runtime.stellarTravel = {
      startAt: performance.now(),
      duration: reduced ? 120 : 8400,
      fromPosition,
      toPosition,
      fromTarget,
      toTarget,
      arcDirection,
      targetId,
      catalogDistanceLightYears: catalogDistance,
      arrivalStandOff,
      modelStartDistance: Math.max(1, fromPosition.distanceTo(toTarget) - arrivalStandOff),
      lastProgressAt: 0,
      fromFov: runtime.camera.fov,
    };
    onStellarTravelProgressRef.current(targetId, 0, catalogDistance);
  }, [stellarTravelRequest]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    const targetId = exoplanetFocusRequest.targetId;
    if (!runtime) return;
    const planet = targetId ? getExoplanet(targetId) : null;
    const group = targetId ? runtime.exoplanetGroups.get(targetId) : arrivedStellarRef.current ? runtime.stellarGroups.get(arrivedStellarRef.current) : null;
    if (!group || (targetId && (!planet || planet.hostStarId !== arrivedStellarRef.current))) return;
    const toTarget = new THREE.Vector3();
    group.getWorldPosition(toTarget);
    const fromPosition = runtime.camera.position.clone();
    const fromTarget = runtime.controls.target.clone();
    const direction = fromPosition.clone().sub(fromTarget).normalize();
    if (Math.abs(direction.y) > .85) direction.set(.48, .24, .84).normalize();
    const targetRadius = planet?.renderRadius ?? null;
    const standOff = planet ? Math.max(6.5, planet.renderRadius * 7.4) : 68;
    const toPosition = toTarget.clone().add(direction.multiplyScalar(standOff)).add(new THREE.Vector3(0, planet ? planet.renderRadius * .45 : 8, 0));
    const reduced = (pauseAnimationsRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    runtime.stellarTravel = null;
    runtime.focusedId = null;
    runtime.focusedSystemObjectId = null;
    runtime.controls.enabled = false;
    runtime.transition = {
      startAt: performance.now(),
      duration: reduced ? 90 : 2200,
      fromPosition,
      toPosition,
      fromTarget,
      toTarget,
      targetId,
      targetDomain: 'exoplanet',
      targetRadius,
      fromFov: runtime.camera.fov,
      toFov: planet ? 32 : 36,
    };
  }, [exoplanetFocusRequest]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    const targetId = systemObjectFocusRequest.targetId;
    if (!runtime) return;
    const object = targetId ? getStellarObject(targetId) : null;
    const group = targetId ? runtime.systemObjectGroups.get(targetId) : arrivedStellarRef.current ? runtime.stellarGroups.get(arrivedStellarRef.current) : null;
    if (!group || (targetId && (!object || group.userData.destinationAnchorId !== arrivedStellarRef.current))) return;
    const toTarget = new THREE.Vector3();
    group.getWorldPosition(toTarget);
    const fromPosition = runtime.camera.position.clone();
    const fromTarget = runtime.controls.target.clone();
    const direction = fromPosition.clone().sub(fromTarget).normalize();
    if (Math.abs(direction.y) > .85) direction.set(.48, .24, .84).normalize();
    const body = group.userData.destinationBody as DestinationBodyRecord | undefined;
    const radius = body?.render.radius ?? 1;
    const toPosition = toTarget.clone().add(direction.multiplyScalar(Math.max(9, radius * (body?.kind === 'WHITE_DWARF' ? 14 : 5.5)))).add(new THREE.Vector3(0, radius * .4, 0));
    const reduced = (pauseAnimationsRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    runtime.stellarTravel = null;
    runtime.focusedId = null;
    runtime.focusedExoplanetId = null;
    runtime.controls.enabled = false;
    runtime.transition = {
      startAt: performance.now(), duration: reduced ? 90 : 2200, fromPosition, toPosition, fromTarget, toTarget,
      targetId, targetDomain: 'system-object', targetRadius: radius, fromFov: runtime.camera.fov, toFov: 30,
    };
  }, [systemObjectFocusRequest]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      const errorTimer = window.setTimeout(() => setWebglError(true), 0);
      return () => window.clearTimeout(errorTimer);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .035, 65000);
    camera.position.copy(systemCamera);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.insertBefore(renderer.domElement as unknown as Node, host.firstChild);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .055;
    controls.rotateSpeed = .54;
    controls.zoomSpeed = .75;
    controls.panSpeed = .42;
    controls.screenSpacePanning = true;
    controls.zoomToCursor = true;
    controls.minDistance = 5;
    controls.maxDistance = 18000;
    controls.target.copy(systemTarget);
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    let pendingWheel = 0, forwardingWheel = false, wheelCtrl = false;
    let wheelX = 0, wheelY = 0, wheelInputPeak = 0, wheelAppliedPeak = 0, wheelSteps = 0;
    const clearWheel = () => { pendingWheel = 0; };
    const onSmoothWheel = (event: WheelEvent) => {
      if (forwardingWheel || !controls.enabled || (pauseAnimationsRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      if (!Number.isFinite(pixels)) return;
      if (Math.sign(pixels) !== Math.sign(pendingWheel) || wheelCtrl !== event.ctrlKey) pendingWheel = 0;
      wheelCtrl = event.ctrlKey;
      pendingWheel = THREE.MathUtils.clamp(pendingWheel + pixels,-8000,8000);
      wheelInputPeak = Math.max(wheelInputPeak,Math.abs(pixels));
      wheelX = event.clientX; wheelY = event.clientY;
    };
    renderer.domElement.addEventListener('wheel',onSmoothWheel,{capture:true,passive:false});
    renderer.domElement.addEventListener('pointerdown',clearWheel,{capture:true});
    window.addEventListener('blur',clearWheel);

    const cosmicRoot = new THREE.Group();
    cosmicRoot.name = 'helios-floating-render-domain';
    scene.add(cosmicRoot);
    const solarGroup = new THREE.Group();
    solarGroup.name = 'helios-solar-domain';
    solarGroup.rotation.x = J2000_OBLIQUITY_DEG * Math.PI / 180;
    cosmicRoot.add(solarGroup);
    const bodyGroups = new Map<string, THREE.Group>();
    const stellarGroups = new Map<string, THREE.Group>();
    const exoplanetGroups = new Map<string, THREE.Group>();
    const systemObjectGroups = new Map<string, THREE.Group>();
    const orbitMaterials: THREE.LineBasicMaterial[] = [];

    scene.add(new THREE.AmbientLight(0x8e9bb7, .055));
    scene.add(new THREE.HemisphereLight(0xb9d9ff, 0x17100e, .12));
    solarGroup.add(new THREE.PointLight(0xfff8ef, 940, 250, 1.45));

    let currentQuality: GraphicsQuality = qualityRef.current === 'AUTO' ? automaticGraphicsQuality(host.clientWidth, navigator.hardwareConcurrency || 4) : qualityRef.current;
    let profile: (typeof GRAPHICS_PROFILES)[GraphicsQuality] = GRAPHICS_PROFILES[currentQuality];
    const backgroundStars = createDeepSky(GRAPHICS_PROFILES.ULTRA.starCount);
    const starGeometry = backgroundStars.geometry;
    const starMaterial = backgroundStars.material;
    scene.add(backgroundStars);
    let eventPreviewUntil = 0;
    const shaderMaterials: THREE.ShaderMaterial[] = [];
    const tieredTextures: THREE.Texture[] = [];
    const resizeTexture = (texture: THREE.Texture) => {
      const original = texture.userData.originalImage as HTMLImageElement | undefined;
      if (!original) return;
      const width = currentQuality === 'ULTRA' ? Math.min(5400,original.width) : currentQuality === 'HIGH' ? Math.min(4096,original.width) : Math.min(2048,original.width);
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = Math.round(width*original.height/original.width);
      canvas.getContext('2d')!.drawImage(original,0,0,canvas.width,canvas.height);
      texture.image = canvas; texture.needsUpdate = true;
    };
    const applyQuality = (choice: GraphicsQuality | 'AUTO') => {
      currentQuality = choice === 'AUTO' ? automaticGraphicsQuality(host.clientWidth, navigator.hardwareConcurrency || 4) : choice;
      profile = GRAPHICS_PROFILES[currentQuality];
      renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, currentQuality === 'ULTRA' ? 1.75 : 1.25), profile.pixelRatio));
      starGeometry.setDrawRange(0, profile.starCount);
      starMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      shaderMaterials.forEach(material => { if (material.uniforms.uQuality) material.uniforms.uQuality.value = profile.atmosphereDetail; });
      bodyGroups.forEach(group=>{ const mesh = group.userData.bodyMesh as THREE.Mesh; if(mesh?.userData.lod) mesh.geometry = mesh.userData.lod[currentQuality]; });
      const aurora = bodyGroups.get('earth')?.userData.aurora as THREE.Mesh | undefined;
      if (aurora?.userData.lod) aurora.geometry = aurora.userData.lod[currentQuality];
      tieredTextures.forEach(resizeTexture);
      host.dataset.quality = currentQuality;
    };
    let auroraReturnView: { position: THREE.Vector3; target: THREE.Vector3; fov: number } | null = null;
    const frameAurora = (enabled: boolean) => {
      const earth = bodyGroups.get('earth');
      const runtime = runtimeRef.current;
      if (!earth || runtime?.focusedId !== 'earth') { auroraReturnView = null; return; }
      scene.updateMatrixWorld(true);
      const center = earth.getWorldPosition(new THREE.Vector3());
      const mesh = earth.userData.bodyMesh as THREE.Mesh;
      const pole = new THREE.Vector3(.16,.98,-.12).normalize().applyQuaternion(mesh.getWorldQuaternion(new THREE.Quaternion()));
      const night = center.clone().sub(bodyGroups.get('sun')!.getWorldPosition(new THREE.Vector3())).normalize();
      night.addScaledVector(pole, -night.dot(pole)).normalize();
      const direction = night.clone().multiplyScalar(.788).addScaledVector(pole,.616).normalize();
      const targetDirection = night.multiplyScalar(.375).addScaledVector(pole,.927).normalize();
      const radius = (earth.userData.entity as SpatialEntity).renderRadius * mesh.getWorldScale(new THREE.Vector3()).x;
      if (!enabled) {
        if (auroraReturnView && !runtime.stellarTravel && (!runtime.transition || runtime.transition.targetId === 'earth')) {
          runtime.transition = null; controls.enabled = true;
          camera.position.copy(auroraReturnView.position); controls.target.copy(auroraReturnView.target);
          camera.fov = auroraReturnView.fov; camera.updateProjectionMatrix();
          controls.minDistance = Math.max(.65,radius*1.14); controls.update();
        }
        auroraReturnView = null; return;
      }
      auroraReturnView = { position:camera.position.clone(),target:controls.target.clone(),fov:camera.fov };
      controls.enabled = false;
      runtime.transition = { startAt:performance.now(),duration:(pauseAnimationsRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 80 : 1600,fromPosition:camera.position.clone(),toPosition:center.clone().addScaledVector(direction,radius*1.35),fromTarget:controls.target.clone(),toTarget:center.clone().addScaledVector(targetDirection,radius*1.026),targetId:'earth',targetDomain:'solar',targetRadius:radius,fromFov:camera.fov,toFov:43 };
    };
    runtimeRef.current = { applyQuality, frameAurora, previewEvents: () => { eventPreviewUntil = performance.now() + 16000; }, camera, controls, bodyGroups, stellarGroups, exoplanetGroups, systemObjectGroups, cosmicRoot, backgroundStars, renderOriginOffset: new THREE.Vector3(), solarGroup, orbitMaterials, transition: null, stellarTravel: null, focusedId: null, focusedExoplanetId: null, focusedSystemObjectId: null, inspectionBlend: 0, stellarBlend: 0, cosmicScale: 'SYSTEM' };

    const planetPickTargets: THREE.Object3D[] = [];
    const stellarPickTargets: THREE.Object3D[] = [];
    const exoplanetPickTargets: THREE.Object3D[] = [];
    const systemObjectPickTargets: THREE.Object3D[] = [];
    const disposables: Array<{ dispose: () => void }> = [starGeometry, starMaterial];
    const stellarGlowTexture = makeStellarGlowTexture();
    disposables.push(stellarGlowTexture);

    localStellarObjects.forEach((object) => {
      const renderPosition = toStellarRenderPosition(object);
      const group = new THREE.Group();
      group.name = `catalog-star-${object.id}`;
      group.position.set(renderPosition.x, renderPosition.y, renderPosition.z);
      group.userData.stellarObject = object;
      group.visible = false;
      cosmicRoot.add(group);
      stellarGroups.set(object.id, group);

      const glowMaterial = new THREE.SpriteMaterial({ map: stellarGlowTexture, color: object.visual.color, transparent: true, opacity: 0, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false });
      glowMaterial.userData.baseOpacity = .5;
      const glow = new THREE.Sprite(glowMaterial);
      glow.scale.setScalar(30 * object.visual.glowScale);
      group.add(glow);
      group.userData.glowMaterial = glowMaterial;
      group.userData.glow = glow;

      const coreMaterial = new THREE.SpriteMaterial({ map: stellarGlowTexture, color: object.visual.color, transparent: true, opacity: 0, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false });
      coreMaterial.userData.baseOpacity = 1;
      const core = new THREE.Sprite(coreMaterial);
      core.scale.setScalar(9 * object.visual.coreScale);
      group.add(core);
      group.userData.coreMaterial = coreMaterial;
      group.userData.core = core;

      const hitGeometry = new THREE.SphereGeometry(Math.max(12, 16 * object.visual.glowScale), 12, 8);
      const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
      const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
      hitMesh.userData.stellarId = object.id;
      group.add(hitMesh);
      stellarPickTargets.push(hitMesh);

      const selectionGeometry = new THREE.TorusGeometry(13 * object.visual.glowScale, .24, 8, 72);
      const selectionMaterial = new THREE.MeshBasicMaterial({ color: object.visual.color, transparent: true, opacity: .7, depthWrite: false, fog: false });
      const selection = new THREE.Mesh(selectionGeometry, selectionMaterial);
      selection.visible = false;
      group.add(selection);
      group.userData.selection = selection;
      disposables.push(glowMaterial, coreMaterial, hitGeometry, hitMaterial, selectionGeometry, selectionMaterial);
    });

    destinationSystems.forEach((destination) => {
      const anchorGroup = stellarGroups.get(destination.anchorObjectId);
      const anchor = getStellarObject(destination.anchorObjectId);
      if (!anchorGroup || !anchor) return;
      const systemGroup = new THREE.Group();
      systemGroup.name = `destination-system-${destination.id}`;
      systemGroup.visible = false;
      systemGroup.rotation.set(...destination.orientation);
      systemGroup.userData.destinationSystem = destination;
      anchorGroup.add(systemGroup);
      anchorGroup.userData.systemGroup = systemGroup;
      anchorGroup.userData.destinationSystem = destination;
      systemGroup.add(new THREE.PointLight(anchor.visual.color, destination.kind === 'PLANETARY_SYSTEM' ? 235 : 390, 110, 1.35));
      const hostBody = destination.bodies.find(body=>body.role === 'ANCHOR');
      if (hostBody) {
        const hostGeometry = new THREE.SphereGeometry(hostBody.render.radius, 64, 40);
        const hostMaterial = anchor.objectClass === 'WHITE_DWARF'
          ? new THREE.MeshBasicMaterial({color:anchor.visual.color})
          : createSolarMaterial();
        if (hostMaterial instanceof THREE.ShaderMaterial) {
          hostMaterial.userData.catalogHost = true;
          shaderMaterials.push(hostMaterial);
          hostMaterial.uniforms.uStellarTint = {value:new THREE.Color(anchor.visual.color)};
          hostMaterial.fragmentShader = hostMaterial.fragmentShader.replace('uniform vec3 uEventDirection;', 'uniform vec3 uEventDirection; uniform vec3 uStellarTint;').replace('color *= (0.84', 'color *= uStellarTint; color *= (0.84');
        }
        const hostMesh = new THREE.Mesh(hostGeometry,hostMaterial);
        const hostGroup = new THREE.Group();
        hostGroup.add(hostMesh); systemGroup.add(hostGroup);
        const selection = new THREE.Mesh(new THREE.TorusGeometry(hostBody.render.radius*1.5,.04,8,64),new THREE.MeshBasicMaterial({color:anchor.visual.color,transparent:true,opacity:.5}));
        selection.visible = false; hostGroup.add(selection);
        hostGroup.userData = { destinationBody:hostBody,destinationAnchorId:anchor.id,stellarObject:anchor,bodyMesh:hostMesh,selection };
        systemObjectGroups.set(anchor.id,hostGroup);
        disposables.push(selection.geometry,selection.material);
        disposables.push(hostGeometry,hostMaterial);
      }


      destination.orbits.forEach((orbit) => {
        const orbitPoints: THREE.Vector3[] = [];
        const incline = THREE.MathUtils.degToRad(orbit.render.inclinationDeg);
        for (let pointIndex = 0; pointIndex <= 160; pointIndex++) {
          const angle = pointIndex / 160 * Math.PI * 2;
          orbitPoints.push(new THREE.Vector3(Math.cos(angle) * orbit.render.radius, Math.sin(angle) * Math.sin(incline) * orbit.render.radius, Math.sin(angle) * orbit.render.radius));
        }
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: destination.kind === 'BINARY_STELLAR_SYSTEM' ? 0x9db9e4 : 0x8eb1c8, transparent: true, opacity: .26, depthWrite: false });
        systemGroup.add(new THREE.LineLoop(orbitGeometry, orbitMaterial));
        disposables.push(orbitGeometry, orbitMaterial);
      });

      destination.bodies.filter((body) => body.role !== 'ANCHOR').forEach((body) => {
        const bodyGroup = new THREE.Group();
        bodyGroup.position.set(...body.render.position);
        bodyGroup.userData.destinationBody = body;
        bodyGroup.userData.destinationAnchorId = destination.anchorObjectId;
        systemGroup.add(bodyGroup);

        if (body.kind === 'EXOPLANET') {
          const planet = getExoplanet(body.objectId);
          if (!planet) return;
          bodyGroup.userData.exoplanet = planet;
          exoplanetGroups.set(planet.id, bodyGroup);
          const planetGeometry = new THREE.SphereGeometry(body.render.radius, 36, 24);
          const planetMaterial = new THREE.MeshStandardMaterial({ color: body.render.color, roughness: .88, metalness: .02, emissive: new THREE.Color(body.render.accent), emissiveIntensity: .045 });
          const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
          planetMesh.userData.exoplanetId = planet.id;
          bodyGroup.add(planetMesh);
          bodyGroup.userData.planetMesh = planetMesh;
          const hitGeometry = new THREE.SphereGeometry(Math.max(2.4, body.render.radius * 1.7), 12, 8);
          const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
          const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
          hitMesh.userData.exoplanetId = planet.id;
          bodyGroup.add(hitMesh);
          exoplanetPickTargets.push(hitMesh);
          const selectionGeometry = new THREE.TorusGeometry(body.render.radius * 1.55, Math.max(.035, body.render.radius * .035), 8, 64);
          const selectionMaterial = new THREE.MeshBasicMaterial({ color: body.render.accent, transparent: true, opacity: .7, depthWrite: false, fog: false });
          const selection = new THREE.Mesh(selectionGeometry, selectionMaterial);
          selection.visible = false;
          bodyGroup.add(selection);
          bodyGroup.userData.selection = selection;
          disposables.push(planetGeometry, planetMaterial, hitGeometry, hitMaterial, selectionGeometry, selectionMaterial);
          return;
        }

        const object = getStellarObject(body.objectId);
        if (!object) return;
        bodyGroup.userData.stellarObject = object;
        systemObjectGroups.set(object.id, bodyGroup);
        const sphereGeometry = new THREE.SphereGeometry(body.render.radius, 36, 24);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: body.render.color, roughness: .42, emissive: new THREE.Color(body.render.accent), emissiveIntensity: 1.45 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        bodyGroup.add(sphere);
        bodyGroup.userData.bodyMesh = sphere;
        const glowMaterial = new THREE.SpriteMaterial({ map: stellarGlowTexture, color: body.render.accent, transparent: true, opacity: .72, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.setScalar(body.render.radius * 13);
        bodyGroup.add(glow);
        bodyGroup.userData.glow = glow;
        bodyGroup.userData.baseGlowScale = body.render.radius * 13;
        const hitGeometry = new THREE.SphereGeometry(Math.max(3.2, body.render.radius * 3), 12, 8);
        const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
        const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
        hitMesh.userData.systemObjectId = object.id;
        bodyGroup.add(hitMesh);
        systemObjectPickTargets.push(hitMesh);
        const selectionGeometry = new THREE.TorusGeometry(body.render.radius * 2.2, Math.max(.05, body.render.radius * .08), 8, 64);
        const selectionMaterial = new THREE.MeshBasicMaterial({ color: body.render.accent, transparent: true, opacity: .76, depthWrite: false, fog: false });
        const selection = new THREE.Mesh(selectionGeometry, selectionMaterial);
        selection.visible = false;
        bodyGroup.add(selection);
        bodyGroup.userData.selection = selection;
        disposables.push(sphereGeometry, sphereMaterial, glowMaterial, hitGeometry, hitMaterial, selectionGeometry, selectionMaterial);
      });
    });

    const loadEarthTexture = (url: string) => new THREE.TextureLoader().load(url, texture => { texture.userData.originalImage = texture.image; resizeTexture(texture); });
    const earthTexture = loadEarthTexture('/earth-day-nasa-200407-5400.jpg');
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.wrapS = THREE.RepeatWrapping;
    disposables.push(earthTexture);
    const earthNightTexture = loadEarthTexture('/earth-night-nasa-2016-3600.jpg');
    earthNightTexture.colorSpace = THREE.SRGBColorSpace;
    const earthCloudTexture = loadEarthTexture('/earth-clouds-nasa-2048.jpg');
    earthCloudTexture.colorSpace = THREE.SRGBColorSpace;
    [earthTexture, earthNightTexture, earthCloudTexture].forEach(texture => { texture.wrapS = THREE.RepeatWrapping; texture.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy()); });
    disposables.push(earthNightTexture, earthCloudTexture);
    tieredTextures.push(earthTexture,earthNightTexture,earthCloudTexture);

    solarSystem.entities.forEach((entity, index) => {
      const world = worlds.find((item) => item.id === entity.id)!;
      if (entity.renderOrbit > 0) {
        const points: THREE.Vector3[] = [];
        const incline = THREE.MathUtils.degToRad(entity.inclination);
        for (let p = 0; p <= 192; p++) {
          const angle = p / 192 * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(angle) * entity.renderOrbit, Math.sin(angle) * Math.sin(incline) * entity.renderOrbit, Math.sin(angle) * entity.renderOrbit));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x617087, transparent: true, opacity: .22 });
        solarGroup.add(new THREE.LineLoop(geometry, material));
        orbitMaterials.push(material);
        disposables.push(geometry, material);
      }

      const group = new THREE.Group();
      group.position.copy(entityPosition(entity));
      group.userData.entity = entity;
      solarGroup.add(group);
      bodyGroups.set(entity.id, group);

      const segments = GRAPHICS_PROFILES.ULTRA.sphereSegments;
      const axisFrame = new THREE.Group();
      const orientation = getBodyOrientation(entity.id)!;
      axisFrame.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...orientation.northPoleRender));
      group.add(axisFrame);
      group.userData.axisFrame = axisFrame;
      group.userData.orientation = orientation;
      const geometry = new THREE.SphereGeometry(entity.renderRadius, segments, segments / 2);
      const bodyTexture = entity.id === 'earth' ? earthTexture : entity.id === 'sun' ? null : ['jupiter','saturn','uranus','neptune'].includes(entity.id) ? createGiantTexture(entity.id,world.color,world.accent) : makeProceduralTexture(entity, world);
      if (bodyTexture && bodyTexture !== earthTexture) disposables.push(bodyTexture);
      const material = entity.id === 'earth' ? createEarthMaterial(earthTexture, earthNightTexture)
        : entity.id === 'sun' ? createHomeSurface()
        : new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: index < 5 ? .88 : .7, metalness: 0, emissive: new THREE.Color(world.accent), emissiveIntensity: .008, map: bodyTexture });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.lod = { ULTRA:geometry, HIGH:new THREE.SphereGeometry(entity.renderRadius,72,36), BALANCED:new THREE.SphereGeometry(entity.renderRadius,40,20) };
      disposables.push(mesh.userData.lod.HIGH,mesh.userData.lod.BALANCED);
      mesh.userData.worldId = entity.id;
      axisFrame.add(mesh);
      group.userData.bodyMesh = mesh;
      if (material instanceof THREE.ShaderMaterial) shaderMaterials.push(material);
      disposables.push(geometry, material);

      const classification = bodyClass(world);
      group.userData.classification = classification;
      if (entity.id !== 'mercury' && entity.id !== 'sun' && entity.id !== 'earth') {
        const shellScale = entity.id === 'earth' ? 1.018 : entity.id === 'mars' ? 1.008 : entity.id === 'venus' ? 1.025 : 1.012;
        const atmosphereGeometry = new THREE.SphereGeometry(entity.renderRadius * shellScale, 96, 48);
        const atmosphereMaterial = createAtmosphereMaterial(entity.id);
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        axisFrame.add(atmosphere);
        group.userData.atmosphere = atmosphere;
        shaderMaterials.push(atmosphereMaterial);
        disposables.push(atmosphereGeometry, atmosphereMaterial);
      }
      if (entity.id === 'earth') {
        const cloudGeometry = new THREE.SphereGeometry(entity.renderRadius * 1.002, 96, 48);
        const cloudMaterial = createCloudMaterial(earthCloudTexture);
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        axisFrame.add(clouds);
        group.userData.clouds = clouds;
        const auroraGeometry = createAuroraCurtainGeometry(entity.renderRadius, 320, 12);
        const auroraMaterial = createAuroraCurtainMaterial(entity.renderRadius);
        const aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
        aurora.userData.lod = { ULTRA:auroraGeometry,HIGH:createAuroraCurtainGeometry(entity.renderRadius,224,10),BALANCED:createAuroraCurtainGeometry(entity.renderRadius,128,8) };
        axisFrame.add(aurora);
        group.userData.aurora = aurora;
        shaderMaterials.push(cloudMaterial, auroraMaterial);
        disposables.push(cloudGeometry, cloudMaterial, auroraGeometry, auroraMaterial);
        disposables.push(aurora.userData.lod.HIGH,aurora.userData.lod.BALANCED);
      }
      if (classification === 'star') {
        const plasma = createHomeLoops(entity.renderRadius);
        axisFrame.add(plasma.group);
        group.userData.plasmaLoops = plasma.group;
        shaderMaterials.push(...plasma.materials);
        disposables.push(...plasma.materials, ...plasma.geometries);
        const coronaGeometry = new THREE.SphereGeometry(entity.renderRadius * 1.24, 96, 48);
        const coronaMaterial = createCoronaMaterial();
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        axisFrame.add(corona);
        group.userData.corona = corona;
        shaderMaterials.push(coronaMaterial);
        disposables.push(coronaGeometry, coronaMaterial);
      }

      const interiorGroup = new THREE.Group();
      interiorGroup.visible = false;
      interiorGroup.rotation.set(-.08, .16, 0);
      group.add(interiorGroup);
      group.userData.interiorGroup = interiorGroup;
      const layerCount = Math.max(1, world.layers.length);
      world.layers.forEach((layer, layerIndex) => {
        const layerStep = layerCount === 1 ? 0 : .72 / (layerCount - 1);
        const outerRadius = entity.renderRadius * (.28 + layerIndex * layerStep);
        const innerRadius = layerIndex === 0 ? 0 : entity.renderRadius * (.28 + (layerIndex - 1) * layerStep);
        const layerColor = new THREE.Color(layer.color);
        const fluidInterior = classification === 'gas' || classification === 'star';
        const shellGeometry = new THREE.SphereGeometry(outerRadius, classification === 'star' ? 24 : 48, classification === 'star' ? 16 : 30, 0, fluidInterior ? Math.PI * 2 : Math.PI);
        const baseOpacity = classification === 'star' ? .045 + layerIndex * .015 : classification === 'gas' ? .12 + layerIndex * .035 : classification === 'ice' ? .52 : .82;
        const shellMaterial = new THREE.MeshStandardMaterial({ color: layerColor, roughness: classification === 'rocky' ? .72 : .32, metalness: layer.name.toLowerCase().includes('metal') || layer.name.toLowerCase().includes('core') ? .3 : .02, emissive: layerColor, emissiveIntensity: classification === 'star' ? .52 : .12, side: THREE.DoubleSide, transparent: true, opacity: baseOpacity, depthWrite: classification === 'rocky' });
        shellMaterial.wireframe = classification === 'star' && layerIndex > 0;
        shellMaterial.blending = classification === 'star' ? THREE.AdditiveBlending : THREE.NormalBlending;
        shellMaterial.userData.baseOpacity = baseOpacity;
        shellMaterial.userData.activeOpacity = classification === 'star' ? .18 : classification === 'gas' ? .42 : classification === 'ice' ? .8 : 1;
        shellMaterial.userData.baseEmissive = classification === 'star' ? .52 : .12;
        shellMaterial.userData.activeEmissive = classification === 'star' ? 1.1 : .42;
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.userData.layerIndex = layerIndex;
        interiorGroup.add(shell);
        disposables.push(shellGeometry, shellMaterial);

        if (!fluidInterior) {
          const faceGeometry = innerRadius > .01 ? new THREE.RingGeometry(innerRadius, outerRadius, 72) : new THREE.CircleGeometry(outerRadius, 72);
          const faceOpacity = classification === 'ice' ? .58 : .9;
          const faceMaterial = new THREE.MeshStandardMaterial({ color: layerColor.clone().multiplyScalar(1.08), roughness: classification === 'ice' ? .35 : .78, metalness: layer.name.toLowerCase().includes('core') ? .28 : .01, emissive: layerColor, emissiveIntensity: .12, side: THREE.DoubleSide, transparent: true, opacity: faceOpacity, depthWrite: classification === 'rocky' });
          faceMaterial.userData.baseOpacity = faceOpacity;
          faceMaterial.userData.activeOpacity = classification === 'ice' ? .88 : 1;
          const face = new THREE.Mesh(faceGeometry, faceMaterial);
          face.position.z = -.004 * layerIndex;
          face.userData.layerIndex = layerIndex;
          interiorGroup.add(face);
          disposables.push(faceGeometry, faceMaterial);
        }

        if (classification === 'star') {
          const layerLabel = makeInteriorLabel(layer.name, layer.color);
          layerLabel.position.set(outerRadius * .12, outerRadius * .9, -.04);
          layerLabel.userData.layerIndex = layerIndex;
          layerLabel.visible = false;
          interiorGroup.add(layerLabel);
          const labelMaterial = layerLabel.material as THREE.SpriteMaterial;
          if (labelMaterial.map) disposables.push(labelMaterial.map);
          disposables.push(labelMaterial);
        } else {
          // A geometry anchor only: planetary text stays in the side inspector.
          const anchor = new THREE.Object3D();
          const midRadius = layerIndex === 0 ? 0 : (outerRadius + innerRadius) / 2;
          anchor.position.set(midRadius * Math.SQRT1_2, midRadius * Math.SQRT1_2, -.08);
          anchor.userData.layerCalloutAnchor = true;
          anchor.userData.layerIndex = layerIndex;
          interiorGroup.add(anchor);
        }
      });

      const hitGeometry = new THREE.SphereGeometry(Math.max(entity.renderRadius * 1.25, 2.6), 16, 12);
      const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
      hitMesh.userData.worldId = entity.id;
      group.add(hitMesh);
      planetPickTargets.push(hitMesh);
      disposables.push(hitGeometry, hitMaterial);

      const selectionGeometry = new THREE.TorusGeometry(entity.renderRadius * 1.34, Math.max(.045, entity.renderRadius * .014), 10, 80);
      const selectionMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(world.accent), transparent: true, opacity: .72, depthWrite: false });
      const selection = new THREE.Mesh(selectionGeometry, selectionMaterial);
      selection.rotation.x = Math.PI * .5;
      selection.visible = entity.id === selectedRef.current;
      group.add(selection);
      group.userData.selection = selection;
      disposables.push(selectionGeometry, selectionMaterial);

      if (entity.id === 'saturn' || entity.id === 'uranus') {
        const ringGroup = new THREE.Group();
        const bands = entity.id === 'saturn'
          ? [[1.31, 1.43, .2, 0xb8a887], [1.46, 1.73, .68, 0xe0cca1], [1.77, 1.88, .48, 0xb7a079], [1.94, 2.18, .58, 0xd8c49c], [2.23, 2.29, .2, 0xbda982]]
          : [[1.48, 1.52, .22, 0x79b9c0], [1.71, 1.75, .18, 0x8bcbd0], [1.94, 1.98, .15, 0x6ca9b1]];
        bands.forEach(([inner, outer, opacity, color]) => {
          const ringGeometry = new THREE.RingGeometry(entity.renderRadius * inner, entity.renderRadius * outer, 160);
          const ringMaterial = createRingMaterial(entity.id, entity.renderRadius * inner, entity.renderRadius * outer);
          ringMaterial.opacity = opacity;
          ringMaterial.uniforms.uRingColor.value.setHex(color);
          shaderMaterials.push(ringMaterial);
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ringGroup.add(ring);
          disposables.push(ringGeometry, ringMaterial);
        });
        ringGroup.rotation.x = Math.PI * .5;
        axisFrame.add(ringGroup);
        group.userData.rings = ringGroup;

      }

      const label = makeLabel(world);
      label.position.set(0, entity.renderRadius + 2.8, 0);
      group.add(label);
      group.userData.label = label;
      const labelMaterial = label.material as THREE.SpriteMaterial;
      if (labelMaterial.map) disposables.push(labelMaterial.map);
      disposables.push(labelMaterial);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitAt = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const stellarDomain = (runtimeRef.current?.stellarBlend ?? 0) > .18;
      const targets = stellarDomain
        ? [...planetPickTargets, ...stellarPickTargets, ...(arrivedStellarRef.current ? [...exoplanetPickTargets, ...systemObjectPickTargets] : [])]
        : planetPickTargets;
      const visibleTargets = targets.filter(object => {
        let node: THREE.Object3D | null = object;
        while (node) { if (!node.visible) return false; node = node.parent; }
        return true;
      });
      return raycaster.intersectObjects(visibleTargets, false)[0];
    };
    const onPointerMove = (event: PointerEvent) => {
      const hit = hitAt(event);
      const world = hit?.object.userData.worldId ? worlds.find((item) => item.id === hit.object.userData.worldId) : null;
      const stellar = hit?.object.userData.stellarId ? localStellarObjects.find((item) => item.id === hit.object.userData.stellarId) : null;
      const exoplanet = hit?.object.userData.exoplanetId ? getExoplanet(hit.object.userData.exoplanetId) : null;
      const systemObject = hit?.object.userData.systemObjectId ? getStellarObject(hit.object.userData.systemObjectId) : null;
      const next: HoveredObject | null = world ? { kind: 'world', world } : exoplanet ? { kind: 'exoplanet', object: exoplanet } : systemObject ? { kind: 'system-object', object: systemObject } : stellar ? { kind: 'stellar', object: stellar } : null;
      hoveredStellarRef.current = stellar?.id ?? null;
      renderer.domElement.style.cursor = next ? 'pointer' : controls.enabled ? 'grab' : 'wait';
      setHovered((current) => {
        const currentId = current?.kind === 'world' ? current.world.id : current?.object.id;
        const nextId = next?.kind === 'world' ? next.world.id : next?.object.id;
        return current?.kind === next?.kind && currentId === nextId ? current : next;
      });
    };
    let pointerStart: { x: number; y: number } | null = null;
    const onPointerDown = (event: PointerEvent) => { pointerStart = { x: event.clientX, y: event.clientY }; };
    const onPointerUp = (event: PointerEvent) => {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6 || !controls.enabled) return;
      const hit = hitAt(event);
      if (hit?.object.userData.worldId) onSelectRef.current(hit.object.userData.worldId);
      if (hit?.object.userData.stellarId) onSelectStellarRef.current(hit.object.userData.stellarId);
      if (hit?.object.userData.exoplanetId) onSelectExoplanetRef.current(hit.object.userData.exoplanetId);
      if (hit?.object.userData.systemObjectId) onSelectSystemObjectRef.current(hit.object.userData.systemObjectId);
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
      applyQuality(qualityRef.current);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(host);
    onResize();

    const pressed = new Set<string>();
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.matches('input, textarea, select, button')) return;
      pressed.add(event.key.toLowerCase());
    };
    const onKeyUp = (event: KeyboardEvent) => pressed.delete(event.key.toLowerCase());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const calloutPoint = new THREE.Vector3();
    let frame = 0;
    let lastScale: CosmicScale = 'SYSTEM';
    let lastFrameAt = performance.now();
    let visualSeconds = 0, sampleFrames = 0, sampleCpu = 0, sampleWorst = 0;
    let sampleStartedAt = lastFrameAt;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastLabelAt = 0;
    let lastLabelSignature = '';
    const render = (now: number) => {
      const frameStartedAt = performance.now();
      const frameInterval = Math.max(0,now - lastFrameAt);
      const delta = Math.min(.05, frameInterval / 1000);
      lastFrameAt = now;
      const motionPaused = pauseAnimationsRef.current || motionPreference.matches;
      if (!motionPaused && !document.hidden) visualSeconds += delta;
      const elapsed = visualSeconds;
      const runtime = runtimeRef.current;
      if (runtime?.transition || runtime?.stellarTravel || !controls.enabled || document.hidden) pendingWheel = 0;
      if (pendingWheel) {
        const step = smoothWheelStep(pendingWheel,delta); pendingWheel = step.pending;
        if (step.applied) {
          forwardingWheel = true;
          // Reuse OrbitControls' public wheel path: retain cursor anchoring and distance limits.
          renderer.domElement.dispatchEvent(new WheelEvent('wheel',{deltaY:step.applied,clientX:wheelX,clientY:wheelY,ctrlKey:wheelCtrl,cancelable:true}));
          forwardingWheel = false; wheelSteps++; wheelAppliedPeak = Math.max(wheelAppliedPeak,Math.abs(step.applied));
        }
      }
      const activeFocus = runtime?.focusedId ?? runtime?.transition?.targetId ?? null;
      if (runtime) {
        runtime.backgroundStars.position.copy(camera.position);
        const desiredBlend = activeFocus ? 1 : 0;
        runtime.inspectionBlend = THREE.MathUtils.damp(runtime.inspectionBlend, desiredBlend, 3.8, delta);
        const radialDistanceFromSol = camera.position.clone().add(runtime.renderOriginOffset).length();
        const destinationDomain = Boolean(arrivedStellarRef.current || runtime.focusedExoplanetId || runtime.focusedSystemObjectId || runtime.transition?.targetDomain === 'exoplanet' || runtime.transition?.targetDomain === 'system-object');
        const desiredStellarBlend = runtime.stellarTravel || destinationDomain ? 1 : activeFocus ? 0 : smoothstep(175, 330, radialDistanceFromSol);
        runtime.stellarBlend = THREE.MathUtils.damp(runtime.stellarBlend, desiredStellarBlend, 4.2, delta);
        const solarDomainScale = THREE.MathUtils.lerp(1, .055, smoothstep(.08, 1, runtime.stellarBlend));
        runtime.solarGroup.scale.setScalar(solarDomainScale);
        runtime.orbitMaterials.forEach((orbitMaterial) => { orbitMaterial.opacity = .22 * (1 - runtime.inspectionBlend * .94) * (1 - runtime.stellarBlend); });
      }
      bodyGroups.forEach((group, id) => {
        const mesh = group.userData.bodyMesh as THREE.Mesh;
        const entity = group.userData.entity as SpatialEntity;
        const groupWorldPosition = new THREE.Vector3();
        group.getWorldPosition(groupWorldPosition);
        const distanceToCamera = camera.position.distanceTo(groupWorldPosition);
        const orientation = getBodyOrientation(id)!;
        if (mesh.visible) mesh.rotation.y = elapsed * orientation.visualRadiansPerSecond;
        const clouds = group.userData.clouds as THREE.Mesh | undefined;
        if (clouds?.visible) clouds.rotation.y = elapsed * (orientation.visualRadiansPerSecond + .0025);
        const aurora = group.userData.aurora as THREE.Mesh | undefined;
        if (aurora) aurora.rotation.y = mesh.rotation.y;
        const interior = group.userData.interiorGroup as THREE.Group | undefined;
        if (interior?.visible) {
          const nextScale = THREE.MathUtils.damp(interior.scale.x, 1, 5.5, delta);
          interior.scale.setScalar(nextScale);
        }
        const selection = group.userData.selection as THREE.Mesh;
        selection.rotation.z = elapsed * .14;
        selection.visible = id !== 'earth' && id === selectedRef.current && distanceToCamera > entity.renderRadius * 5.5 && (runtime?.stellarBlend ?? 0) < .64;
        const label = group.userData.label as THREE.Sprite;
        label.visible = (!activeFocus || activeFocus === id) && distanceToCamera > entity.renderRadius * 6.5 && (runtime?.stellarBlend ?? 0) < .58;
        if (runtime) group.visible = (!activeFocus || activeFocus === id || runtime.inspectionBlend < .78) && (id === 'sun' || runtime.stellarBlend < .96);
      });
      stellarGroups.forEach((group, id) => {
        const object = group.userData.stellarObject as StellarObjectRecord;
        const glowMaterial = group.userData.glowMaterial as THREE.SpriteMaterial;
        const coreMaterial = group.userData.coreMaterial as THREE.SpriteMaterial;
        const glow = group.userData.glow as THREE.Sprite;
        const core = group.userData.core as THREE.Sprite;
        const blend = runtime?.stellarBlend ?? 0;
        const isArrivedHost = id === arrivedStellarRef.current;
        const isTravelTarget = runtime?.stellarTravel?.targetId === id;
        group.visible = blend > .01;
        glowMaterial.opacity = (glowMaterial.userData.baseOpacity as number) * blend;
        coreMaterial.opacity = (coreMaterial.userData.baseOpacity as number) * blend;
        const glowScale = (isArrivedHost ? 7 : 23) * object.visual.glowScale;
        const coreScale = (isArrivedHost ? .3 : 7) * object.visual.coreScale;
        glow.scale.setScalar(THREE.MathUtils.damp(glow.scale.x, glowScale, 4.5, delta));
        core.scale.setScalar(THREE.MathUtils.damp(core.scale.x, coreScale, 4.5, delta));
        const selection = group.userData.selection as THREE.Mesh;
        selection.visible = id === selectedStellarRef.current && blend > .15;
        if (selection.visible) {
          const groupWorldPosition = new THREE.Vector3();
          group.getWorldPosition(groupWorldPosition);
          selection.scale.setScalar(THREE.MathUtils.clamp(camera.position.distanceTo(groupWorldPosition) / 650, .22, 1.15));
          selection.lookAt(camera.position);
          selection.rotation.z = elapsed * .12;
          (selection.material as THREE.MeshBasicMaterial).opacity = .36 + Math.sin(elapsed * 2.2) * .12;
        }
        const systemGroup = group.userData.systemGroup as THREE.Group | undefined;
        if (systemGroup) {
          const travelRaw = isTravelTarget && runtime?.stellarTravel ? Math.min(1, (now - runtime.stellarTravel.startAt) / runtime.stellarTravel.duration) : 0;
          const reveal = isTravelTarget ? smoothstep(.7, .98, travelRaw) : isArrivedHost ? 1 : 0;
          systemGroup.visible = reveal > .001;
          const nextScale = THREE.MathUtils.damp(systemGroup.scale.x, Math.max(.001, reveal), 5.5, delta);
          systemGroup.scale.setScalar(nextScale);
        }
      });
      exoplanetGroups.forEach((group, id) => {
        const planet = group.userData.exoplanet as ExoplanetRecord;
        const mesh = group.userData.planetMesh as THREE.Mesh;
        const selection = group.userData.selection as THREE.Mesh;
        mesh.rotation.y = elapsed * .12 + planet.phase;
        selection.visible = id === selectedExoplanetRef.current && planet.hostStarId === arrivedStellarRef.current && runtime?.focusedExoplanetId !== id;
        if (selection.visible) {
          selection.lookAt(camera.position);
          selection.rotation.z = elapsed * .18;
          (selection.material as THREE.MeshBasicMaterial).opacity = .42 + Math.sin(elapsed * 2.6) * .14;
        }
      });
      systemObjectGroups.forEach((group, id) => {
        const mesh = group.userData.bodyMesh as THREE.Mesh | undefined;
        const glow = group.userData.glow as THREE.Sprite | undefined;
        const selection = group.userData.selection as THREE.Mesh;
        if (mesh) mesh.rotation.y = elapsed * .16;
        const worldPosition = new THREE.Vector3();
        group.getWorldPosition(worldPosition);
        if (glow) {
          const baseGlowScale = group.userData.baseGlowScale as number;
          const glowScale = baseGlowScale * THREE.MathUtils.clamp(camera.position.distanceTo(worldPosition) / 105, .075, 1);
          glow.scale.setScalar(THREE.MathUtils.damp(glow.scale.x, glowScale, 6, delta));
        }
        selection.visible = id === selectedSystemObjectRef.current && group.userData.destinationAnchorId === arrivedStellarRef.current && runtime?.focusedSystemObjectId !== id;
        if (selection.visible) {
          selection.lookAt(camera.position);
          selection.rotation.z = elapsed * .16;
          (selection.material as THREE.MeshBasicMaterial).opacity = .46 + Math.sin(elapsed * 2.5) * .14;
        }
      });
      if (runtime?.stellarTravel) {
        const travel = runtime.stellarTravel;
        const raw = Math.min(1, (now - travel.startAt) / travel.duration);
        const eased = easeInOutCubic(raw);
        const arcHeight = Math.sin(raw * Math.PI) * Math.min(46, travel.fromPosition.distanceTo(travel.toPosition) * .055);
        camera.position.lerpVectors(travel.fromPosition, travel.toPosition, eased).addScaledVector(travel.arcDirection, arcHeight);
        controls.target.lerpVectors(travel.fromTarget, travel.toTarget, eased);
        camera.fov = THREE.MathUtils.lerp(travel.fromFov, 36, eased);
        camera.updateProjectionMatrix();
        if (now - travel.lastProgressAt > 90 || raw >= 1) {
          travel.lastProgressAt = now;
          const renderDistanceRemaining = Math.max(0, camera.position.distanceTo(travel.toTarget) - travel.arrivalStandOff);
          const remainingRatio = THREE.MathUtils.clamp(renderDistanceRemaining / travel.modelStartDistance, 0, 1);
          onStellarTravelProgressRef.current(travel.targetId, 1 - remainingRatio, travel.catalogDistanceLightYears * remainingRatio);
        }
        if (raw >= 1) {
          runtime.stellarTravel = null;
          runtime.cosmicScale = 'LOCAL_STELLAR';
          controls.enabled = true;
          controls.minDistance = 34;
          controls.maxDistance = 18000;
          controls.target.copy(travel.toTarget);
          if (shouldRebaseRenderOrigin(controls.target)) {
            const shift = controls.target.clone();
            runtime.cosmicRoot.position.sub(shift);
            camera.position.sub(shift);
            controls.target.sub(shift);
            runtime.renderOriginOffset.add(shift);
          }
          onStellarArriveRef.current(travel.targetId);
        }
      } else if (runtime?.transition) {
        const transition = runtime.transition;
        const raw = Math.min(1, (now - transition.startAt) / transition.duration);
        const eased = easeInOutCubic(raw);
        camera.position.lerpVectors(transition.fromPosition, transition.toPosition, eased);
        controls.target.lerpVectors(transition.fromTarget, transition.toTarget, eased);
        camera.fov = THREE.MathUtils.lerp(transition.fromFov, transition.toFov, eased);
        camera.updateProjectionMatrix();
        if (raw >= 1) {
          runtime.transition = null;
          controls.enabled = true;
          if (transition.targetDomain === 'exoplanet') {
            runtime.focusedId = null;
            runtime.focusedExoplanetId = transition.targetId;
            runtime.focusedSystemObjectId = null;
            controls.minDistance = transition.targetRadius ? Math.max(.6, transition.targetRadius * 1.18) : .6;
            controls.maxDistance = transition.targetRadius ? Math.max(45, transition.targetRadius * 35) : 45;
            if (transition.targetId) onExoplanetArriveRef.current(transition.targetId);
          } else if (transition.targetDomain === 'system-object') {
            runtime.focusedId = null;
            runtime.focusedExoplanetId = null;
            runtime.focusedSystemObjectId = transition.targetId;
            controls.minDistance = transition.targetRadius ? Math.max(.45, transition.targetRadius * 1.28) : .45;
            controls.maxDistance = transition.targetRadius ? Math.max(36, transition.targetRadius * 34) : 36;
            if (transition.targetId) onSystemObjectArriveRef.current(transition.targetId);
          } else {
            runtime.focusedExoplanetId = null;
            runtime.focusedSystemObjectId = null;
            runtime.focusedId = transition.targetId;
            const targetEntity = transition.targetId ? solarSystem.entities.find((entity) => entity.id === transition.targetId) : null;
            controls.minDistance = targetEntity ? Math.max(.3, targetEntity.renderRadius * (auroraPreviewRef.current && targetEntity.id === 'earth' ? .12 : 1.14)) : 5;
            controls.maxDistance = targetEntity ? Math.max(80, targetEntity.renderRadius * 32) : 18000;
            onArriveRef.current(transition.targetId);
          }
        }
      }
      if (runtime && !runtime.transition && !runtime.stellarTravel && ((!followingRef.current && runtime.focusedId) || runtime.cosmicScale === 'LOCAL_STELLAR' || runtime.cosmicScale === 'STELLAR_SYSTEM') && pressed.size) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        const up = camera.up.clone().normalize();
        const movement = new THREE.Vector3();
        if (pressed.has('w')) movement.add(forward);
        if (pressed.has('s')) movement.sub(forward);
        if (pressed.has('d')) movement.add(right);
        if (pressed.has('a')) movement.sub(right);
        if (pressed.has('e')) movement.add(up);
        if (pressed.has('q')) movement.sub(up);
        if (movement.lengthSq()) {
          const localStellarSpeed = THREE.MathUtils.clamp(camera.position.length() * .5, 85, 360);
          const speedPerSecond = runtime.cosmicScale === 'LOCAL_STELLAR' || runtime.cosmicScale === 'STELLAR_SYSTEM' ? localStellarSpeed : Math.max(.8, camera.position.distanceTo(controls.target) * .62);
          const speed = speedPerSecond * delta * (pressed.has('shift') ? 2.4 : 1);
          movement.normalize().multiplyScalar(speed);
          camera.position.add(movement);
          controls.target.add(movement);
        }
      }
      if (runtime && !runtime.transition && !runtime.stellarTravel && shouldRebaseRenderOrigin(controls.target)) {
        const shift = controls.target.clone();
        runtime.cosmicRoot.position.sub(shift); camera.position.sub(shift); controls.target.sub(shift); runtime.renderOriginOffset.add(shift);
      }
      controls.update();
      if (auroraPreviewRef.current && runtime?.focusedId === 'earth' && !runtime.transition) {
        const earth = bodyGroups.get('earth')!;
        const center = earth.getWorldPosition(new THREE.Vector3());
        const radius = (earth.userData.entity as SpatialEntity).renderRadius * earth.getWorldScale(new THREE.Vector3()).x;
        const offset = camera.position.clone().sub(center);
        if (offset.length() < radius * 1.035) camera.position.copy(center).add(offset.normalize().multiplyScalar(radius * 1.035));
      }
      const distance = camera.position.distanceTo(controls.target);
      const scale: CosmicScale = runtime?.stellarTravel
        ? 'LOCAL_STELLAR'
        : runtime?.focusedExoplanetId || runtime?.transition?.targetDomain === 'exoplanet'
          ? 'PLANETARY'
        : arrivedStellarRef.current
            ? 'STELLAR_SYSTEM'
            : !activeFocus && camera.position.clone().add(runtime?.renderOriginOffset ?? new THREE.Vector3()).length() > 260
              ? 'LOCAL_STELLAR'
              : distance < 30 ? 'PLANETARY' : 'SYSTEM';
      if (runtime) runtime.cosmicScale = scale;
      if (scale !== lastScale) {
        lastScale = scale;
        setHovered((current) => {
          if ((scale === 'SYSTEM' || (scale === 'PLANETARY' && !arrivedStellarRef.current)) && current?.kind !== 'world') return null;
          if ((scale === 'LOCAL_STELLAR' || scale === 'STELLAR_SYSTEM') && current?.kind === 'world') return null;
          return current;
        });
        setSceneScale(scale);
        onScaleChangeRef.current?.(scale);
      }
      if (now - lastLabelAt >= 120) {
        lastLabelAt = now;
        const showLabels = scale === 'LOCAL_STELLAR' || scale === 'STELLAR_SYSTEM' || Boolean(runtime?.stellarTravel);
        const labels = showLabels ? placeStellarLabels(localStellarObjects.flatMap((object) => {
          const group = stellarGroups.get(object.id);
          if (!group || !group.visible) return [];
          const worldPosition = new THREE.Vector3();
          group.getWorldPosition(worldPosition);
          const projected = worldPosition.clone().project(camera);
          const forced = object.id === selectedStellarRef.current || object.id === runtime?.stellarTravel?.targetId || object.id === hoveredStellarRef.current;
          return [{
            id: object.id,
            name: object.name.replace(/\s*\(unresolved.*\)$/i, ''),
            x: (projected.x * .5 + .5) * host.clientWidth,
            y: (-projected.y * .5 + .5) * host.clientHeight,
            depth: projected.z,
            priority: forced ? 1000 : object.id === 'sirius-a' || object.id === 'alpha-centauri-a' || object.id === 'proxima-centauri' ? 40 : 20,
            forced,
          }];
        }), host.clientWidth, host.clientHeight) : [];
        const signature = labels.map((label) => `${label.id}:${label.x}:${label.y}:${label.anchorX}:${label.anchorY}:${Boolean(label.forced)}`).join('|');
        if (signature !== lastLabelSignature) {
          lastLabelSignature = signature;
          setStellarLabels(labels);
        }
      }
      scene.updateMatrixWorld(true);
      const sunPosition = new THREE.Vector3();
      bodyGroups.get('sun')?.getWorldPosition(sunPosition);
      const solarEvent = astronomicalEvent('SOLAR_ACTIVE_REGION', elapsed, 31, now < eventPreviewUntil);
      const auroralEvent = astronomicalEvent('AURORAL_OVAL', elapsed, 64, now < eventPreviewUntil || auroraPreviewRef.current);
      const previewDirection = bodyGroups.get('sun')!.userData.bodyMesh.worldToLocal(camera.position.clone()).normalize();
      shaderMaterials.forEach(material => {
        const activity = material.userData.catalogHost ? 0 : material.name.includes('auroral') ? auroralEvent.intensity : solarEvent.intensity;
        updateCelestialMaterial(material, elapsed, sunPosition, activity, profile.atmosphereDetail);
        if (material.uniforms.uUvView) {
          material.uniforms.uUvView.value = 1;

        }
        if (material.uniforms.uEventDirection) {
          if (now < eventPreviewUntil) material.uniforms.uEventDirection.value.copy(previewDirection);
          else material.uniforms.uEventDirection.value.set(Math.sin(solarEvent.cycle * 2.4), .2 + .3 * Math.sin(solarEvent.cycle), Math.cos(solarEvent.cycle * 2.4)).normalize();
        }
      });
      bodyGroups.forEach(group => {
        const rings = group.userData.rings as THREE.Group | undefined;
        if (group.userData.plasmaLoops) {
          group.userData.plasmaLoops.visible = group.userData.bodyMesh.visible && !group.userData.interiorGroup?.visible;
          group.userData.plasmaLoops.rotation.y = group.userData.bodyMesh.rotation.y;
        }
        if (!rings) return;
        const center = new THREE.Vector3(); group.getWorldPosition(center);
        const scale = new THREE.Vector3(); group.getWorldScale(scale);
        rings.children.forEach(child => { const material = (child as THREE.Mesh).material as THREE.ShaderMaterial; material.uniforms.uPlanetCenter.value.copy(center); material.uniforms.uPlanetRadius.value = group.userData.entity.renderRadius * scale.x; });
      });
      if (Math.floor(now / 1000) !== Math.floor((now - delta * 1000) / 1000)) {
        host.dataset.solarActivity = solarEvent.intensity.toFixed(3);
        host.dataset.auroraActivity = auroralEvent.intensity.toFixed(3);
        host.dataset.auroraMode = auroraPreviewRef.current ? 'STRONG_PREVIEW' : 'PROCEDURAL_CYCLE';
        host.dataset.earthOutline = 'NONE';
        host.dataset.wheelInputPeak = wheelInputPeak.toFixed(1);
        host.dataset.wheelAppliedPeak = wheelAppliedPeak.toFixed(1);
        host.dataset.wheelSteps = String(wheelSteps);
        host.dataset.wheelPending = pendingWheel.toFixed(2);
        host.dataset.drawCalls = String(renderer.info.render.calls);
        host.dataset.geometries = String(renderer.info.memory.geometries);
        host.dataset.textures = String(renderer.info.memory.textures);
        host.dataset.scale = scale;
        const earth = bodyGroups.get('earth')!; const earthAxis = new THREE.Vector3(0,1,0).applyQuaternion(earth.userData.axisFrame.quaternion);
        host.dataset.earthObliquity = THREE.MathUtils.radToDeg(earthAxis.angleTo(new THREE.Vector3(0,1,0))).toFixed(6);
        host.dataset.venusSpin = getBodyOrientation('venus')!.visualRadiansPerSecond.toFixed(8);
        host.dataset.uranusSpin = getBodyOrientation('uranus')!.visualRadiansPerSecond.toFixed(8);
        host.dataset.starCount = String(profile.starCount);
      }
      if (!document.hidden) renderer.render(scene, camera);
      const leader = layerLeaderRef.current;
      if (leader) {
        leader.dataset.visible = 'false';
        const group = selectedRef.current && selectedRef.current !== 'sun' ? bodyGroups.get(selectedRef.current) : undefined;
        const interior = group?.userData.interiorGroup as THREE.Group | undefined;
        const note = calloutTargetRef.current.current;
        const panel = note?.closest('aside');
        const panelStyle = panel ? getComputedStyle(panel) : null;
        const anchor = interior?.visible ? interior.children.find(child => child.userData.layerCalloutAnchor && child.userData.layerIndex === group?.userData.activeLayer) : undefined;
        if (!document.hidden && anchor && note && panel && panelStyle?.visibility !== 'hidden' && Number(panelStyle?.opacity) > 0) {
          const hostBox = host.getBoundingClientRect(), noteBox = note.getBoundingClientRect(), panelBox = panel.getBoundingClientRect();
          anchor.getWorldPosition(calloutPoint).project(camera);
          const result = interiorLeaderPath({x:(calloutPoint.x + 1) * hostBox.width / 2, y:(1 - calloutPoint.y) * hostBox.height / 2, z:calloutPoint.z}, {
            left:Math.max(noteBox.left,panelBox.left)-hostBox.left, right:Math.min(noteBox.right,panelBox.right)-hostBox.left,
            top:Math.max(noteBox.top,panelBox.top)-hostBox.top, bottom:Math.min(noteBox.bottom,panelBox.bottom)-hostBox.top,
          }, {width:hostBox.width,height:hostBox.height});
          if (result) {
            leader.setAttribute('viewBox', '0 0 ' + hostBox.width + ' ' + hostBox.height);
            leader.style.color = worlds.find(world => world.id === selectedRef.current)?.layers[group?.userData.activeLayer]?.color ?? '#e6bd68';
            layerLeaderPathRef.current?.setAttribute('d',result.path);
            layerLeaderDotRef.current?.setAttribute('cx',String(result.x));
            layerLeaderDotRef.current?.setAttribute('cy',String(result.y));
            leader.dataset.visible = 'true';
          }
        }
      }
      if (!document.hidden) {
        sampleFrames++; sampleCpu += performance.now() - frameStartedAt;
        sampleWorst = Math.max(sampleWorst,frameInterval);
      }
      if (now - sampleStartedAt >= 1000) {
        host.dataset.frameMeanCpuMs = (sampleCpu / Math.max(1,sampleFrames)).toFixed(2);
        host.dataset.frameWorstIntervalMs = sampleWorst.toFixed(2);
        host.dataset.sampleFrames = String(sampleFrames);
        host.dataset.motion = motionPaused ? 'PAUSED' : 'ANIMATED';
        host.dataset.visualSeconds = visualSeconds.toFixed(3);
        sampleFrames = 0; sampleCpu = 0; sampleWorst = 0; sampleStartedAt = now;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      controls.dispose();
      renderer.domElement.removeEventListener('wheel',onSmoothWheel,true);
      renderer.domElement.removeEventListener('pointerdown',clearWheel,true);
      window.removeEventListener('blur',clearWheel);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      bodyGroups.clear();
      stellarGroups.clear();
      exoplanetGroups.clear();
      systemObjectGroups.clear();
      runtimeRef.current = null;
    };
  }, []);

  const stellarNavigation = sceneScale === 'LOCAL_STELLAR';
  const destinationSystem = sceneScale === 'STELLAR_SYSTEM' || Boolean(arrivedStellarId);
  const exoplanetInspection = sceneScale === 'PLANETARY' && Boolean(arrivedStellarId);
  const destinationDefinition = getDestinationSystemByAnchor(arrivedStellarId);
  const destinationInstruction = destinationDefinition?.kind === 'PLANETARY_SYSTEM' ? 'SELECT A CONFIRMED PLANET' : destinationDefinition?.bodies.some(body=>body.role === 'COMPANION') ? 'SELECT A STELLAR COMPANION' : 'INSPECT THE CATALOG OBJECT';

  return (
    <div className="solar-scene" ref={hostRef} aria-label="Interactive 3D atlas of the Solar System and nearby stellar space">
      <svg className="planetary-layer-leader" ref={layerLeaderRef} aria-hidden="true"><path ref={layerLeaderPathRef} /><circle ref={layerLeaderDotRef} r="4" /></svg>
      <div className="scene-instructions"><span>{stellarNavigation ? 'DRAG TO LOOK · WASD / Q E TO DRIFT' : 'DRAG TO ORBIT'}</span><i /><span>{exoplanetInspection ? 'CATALOG BODY · ILLUSTRATIVE APPEARANCE' : destinationSystem ? destinationInstruction : stellarNavigation ? 'SCROLL TO CHANGE VIEW DEPTH' : 'SCROLL / PINCH TO APPROACH'}</span><i /><span>{stellarNavigation ? 'SHIFT ACCELERATES' : exoplanetInspection ? 'SCROLL TO CHANGE ORBIT' : destinationSystem ? 'SCROLL TO CHANGE DEPTH' : 'RIGHT-DRAG TO DRIFT'}</span></div>
      <div className={`scene-scale ${stellarNavigation || destinationSystem ? 'stellar' : ''}`}><span>{exoplanetInspection ? 'EXOPLANET RENDER DOMAIN' : destinationSystem ? 'DESTINATION SYSTEM' : stellarNavigation ? 'STELLAR RENDER DOMAIN' : 'VISUAL SCALE'}</span><strong>{exoplanetInspection ? 'CATALOG ORBIT · ILLUSTRATIVE BODY' : destinationSystem ? 'CATALOG SYSTEM · COMPRESSED' : stellarNavigation ? 'ICRS-DERIVED · COMPRESSED' : 'COMPRESSED'}</strong><p>{exoplanetInspection ? 'Measured and inferred properties remain labeled separately. No direct surface image exists.' : destinationDefinition?.kind === 'BINARY_STELLAR_SYSTEM' ? 'Measured binary scale and period remain separate from the fixed illustrative phase and compressed destination rendering.' : destinationSystem ? destinationDefinition?.kind === 'PLANETARY_SYSTEM' ? 'Confirmed planets use archive orbital parameters; sizes and separations are transformed for navigation.' : 'Catalog object and companions, where present. Sizes and system layout are illustrative; no planetary system is invented.' : stellarNavigation ? 'Directions derive from catalog astrometry. Light-year distances are mapped into a separate render domain.' : 'Orbital order is coherent. Distances and body sizes are transformed for navigation.'}</p></div>
      {(stellarNavigation || destinationSystem) && <div className="stellar-domain-key"><span><i />REAL CATALOG OBJECT · SELECTABLE</span><span><i />DISTANT FIELD · ILLUSTRATIVE</span></div>}
      <div className="stellar-label-layer"><svg aria-hidden="true">{stellarLabels.map(label=><g key={label.id}><line x1={label.anchorX} y1={label.anchorY} x2={label.x > label.anchorX ? label.x : label.x + label.width} y2={label.y} /><circle cx={label.anchorX} cy={label.anchorY} r={1.5} /></g>)}</svg>{stellarLabels.map((label) => <button key={label.id} aria-label={`Select ${label.name}`} title={getStellarObject(label.id)?.name ?? label.name} className={label.forced ? 'priority' : ''} style={{ left: label.x, top: label.y, maxWidth:label.width }} onClick={() => onSelectStellarRef.current(label.id)}>{label.name}</button>)}</div>
      {hovered?.kind === 'world' && <div className="scene-hover"><span>{hovered.world.index}</span><div><strong>{hovered.world.name}</strong><em>{hovered.world.kind} · {hovered.world.distance}</em></div><b>TRAVEL ↗</b></div>}
      {hovered?.kind === 'stellar' && <div className="scene-hover stellar-hover"><span>✦</span><div><strong>{hovered.object.name}</strong><em>{hovered.object.stellarType} · {distanceLightYears(hovered.object).toFixed(2)} LY</em><small>{getStellarSystem(hovered.object.systemId)?.name}</small></div><b>SELECT ↗</b></div>}
      {hovered?.kind === 'exoplanet' && <div className="scene-hover stellar-hover"><span>◉</span><div><strong>{hovered.object.name}</strong><em>{hovered.object.status} · {hovered.object.semiMajorAxisAU} AU</em><small>{hovered.object.likelyClass}</small></div><b>INSPECT ↗</b></div>}
      {hovered?.kind === 'system-object' && <div className="scene-hover stellar-hover"><span>✦</span><div><strong>{hovered.object.name}</strong><em>{hovered.object.stellarType} · {hovered.object.spectralType}</em><small>DESTINATION-SYSTEM MEMBER</small></div><b>INSPECT ↗</b></div>}
      {webglError && <div className="webgl-fallback"><strong>3D rendering is unavailable.</strong><p>Use Quick Travel to continue exploring the full Helios knowledge experience.</p></div>}
    </div>
  );
}
