'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { catalogObjects, type CatalogObject } from './catalog';
import { getDestinationSystemByAnchor } from './destinationSystems';
import { exoplanetsForHost, getExoplanet } from './exoplanets';
import { localStellarObjects, stellarObjects, distanceLightYears, getStellarObject, getStellarSystem, separationLightYears, STELLAR_EPOCH_POLICY } from './stellar';
import type { CosmicScale, ExoplanetFocusRequest, StellarTravelRequest, SystemObjectFocusRequest } from './SolarSystemScene';
import type { GraphicsQuality } from './graphicsQuality';
import { getBodyOrientation } from './bodyOrientation';
import { confidenceCopy, worlds, type Confidence, type World } from './worlds';
import { AccessibleDialog } from './AccessibleDialog';
import { SourceInspector } from './SourceInspector';
import { claimsForContext } from './science';
import { EducationPanel } from './EducationPanel';
import type { EducationTarget } from './education';

type ViewMode = 'overview' | 'interior' | 'environment';
type ExperienceMode = 'EXPLORE' | 'CATALOG';
type ArrivalSelection = CatalogObject['arrivalSelection'];
type StellarTravelState = { sourceId: string | null; targetId: string; progress: number; totalLightYears: number; remainingLightYears: number; status: 'traveling' | 'arrived' };

const SolarSystemScene = dynamic(() => import('./SolarSystemScene'), {
  ssr: false,
  loading: () => <div className="scene-loading"><i /><span>LOCATING HOME</span></div>,
});

function ConfidenceMark({ level, compact = false }: { level: Confidence; compact?: boolean }) {
  return (
    <span className={`confidence ${level}`} title={confidenceCopy[level]}>
      <i aria-hidden="true" /><span aria-hidden="true">{compact ? level.slice(0, 3) : level}</span><span className="sr-only">{level}: {confidenceCopy[level]}</span>
    </span>
  );
}

function PlanetVisual({ world, small = false }: { world: World; small?: boolean }) {
  return (
    <div
      className={`planet-visual planet-${world.id} ${small ? 'planet-small' : ''}`}
      style={{ '--planet-color': world.color, '--planet-accent': world.accent } as React.CSSProperties}
      aria-label={`Illustrative visualization of ${world.name}`}
    >
      <div className="planet-orb"><span className="planet-detail" /></div>
      {world.id === 'saturn' && <span className="rings" />}
      {world.id === 'uranus' && <span className="rings uranus-rings" />}
      {!small && <span className="planet-shadow" />}
    </div>
  );
}

function Metric({ label, value, compare, claimId }: { label: string; value: string; compare?: string; claimId?: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {compare && <em>{compare}</em>}{claimId && <SourceInspector claimIds={[claimId]} label={`Evidence: ${label.toLowerCase()}`} />}
    </div>
  );
}

function Overview({ world }: { world: World }) {
  return (
    <div className="view-grid">
      <section className="story-card">
        <div className="eyebrow-row"><span>PLANET STORY</span><span className="model-note">SUMMARY · MIXED EVIDENCE</span></div>
        <p>{world.story}</p><SourceInspector context={{kind:'world',id:world.id}} label="Evidence for this world's facts" />
        <div className="truth-line"><ConfidenceMark level="illustrative" /><span>{world.visualNote}</span></div>
      </section>
      <section className="metrics-grid">
        <Metric claimId={`world.${world.id}.radius`} label="RADIUS" value={world.radius} compare={`${world.radiusEarth.toFixed(world.radiusEarth < 10 ? 2 : 1)}× Earth`} />
        <Metric claimId={`world.${world.id}.gravity`} label="GRAVITY" value={world.gravity} compare={`${world.gravityEarth.toFixed(world.gravityEarth < 10 ? 2 : 1)}× Earth`} />
        <Metric claimId={`world.${world.id}.day`} label="DAY" value={world.day} />
        <Metric claimId={`world.${world.id}.year`} label="YEAR" value={world.year} />
        <Metric claimId={`world.${world.id}.distance`} label="FROM SUN" value={world.distance} />
        <Metric claimId={`world.${world.id}.moons`} label="MOONS" value={world.moons} />
      </section>
      <section className="fact-strip">
        {world.facts.map((fact,index) => <div key={fact.label}><ConfidenceMark level={claimsForContext({kind:'world',id:world.id,index})[0]?.confidence ?? fact.confidence} compact /><span>{fact.label}</span><strong>{fact.value}</strong><SourceInspector context={{kind:'world',id:world.id,index}} label={`Evidence: ${fact.label}`} /></div>)}
      </section>
    </div>
  );
}

function Interior({ world }: { world: World }) {
  const layers = world.layers;
  return (
    <div className="interior-view">
      <div className="cutaway-wrap" aria-label={`Modeled interior layers of ${world.name}`}>
        <div className="cutaway" style={{ '--shell': world.color } as React.CSSProperties}>
          {layers.map((layer, i) => (
            <span key={layer.name} style={{ background: layer.color, inset: `${i * (42 / Math.max(1, layers.length - 1))}%` }} />
          ))}
          <i className="cut-line" />
        </div>
        <p>RELATIVE LAYERS · NOT TO SCALE</p>
      </div>
      <div className="layers-list">
        <div className="eyebrow-row"><span>WHAT IT’S MADE OF</span><span className="model-note">MODEL + MEASUREMENT</span></div>
        {layers.map((layer, i) => (
          <article key={layer.name}>
            <span className="layer-number">0{i + 1}</span>
            <i style={{ background: layer.color }} />
            <div><h3>{layer.name}</h3><p>{layer.note}</p></div>
            <ConfidenceMark level={layer.confidence} compact /><SourceInspector context={{kind:'layer',id:world.id,index:i}} label={`Evidence: ${layer.name}`} />
          </article>
        ))}
        <p className="model-caveat">Interior boundaries are simplified. We infer deep structure from gravity, magnetic fields, seismology where available, equations of state, and formation models—not from direct photographs.</p>
      </div>
    </div>
  );
}

function Environment({ world }: { world: World }) {
  const noSurface = world.surface.startsWith('No solid') || world.surface.startsWith('No accessible');
  return (
    <div className="environment-view">
      <div className={`horizon horizon-${world.id}`}><span /><div className="horizon-copy"><b>{noSurface ? 'DESCENDING' : 'AT THE SURFACE'}</b><strong>{world.temperature}</strong><em>{world.pressure}</em></div></div>
      <div className="environment-notes">
        <article><span>01</span><div><b>ATMOSPHERE / EXTERIOR</b><p>{world.atmosphere}</p></div></article>
        <article><span>02</span><div><b>{noSurface ? 'WHY YOU CANNOT LAND' : 'GROUND'}</b><p>{world.surface}</p></div></article>
        <article><span>03</span><div><b>WEATHER & MOTION</b><p>{world.weather}</p></div></article>
        <article className="oddity"><span>!</span><div><b>THE STRANGE PART</b><p>{world.oddity}</p></div></article>
      </div>
    </div>
  );
}

function SystemMap({ current, onSelect, onClose }: { current: World; onSelect: (id: string) => void; onClose: () => void }) {
  return (
    <AccessibleDialog className="modal system-modal" label="Solar System map" onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close system map">CLOSE ×</button>
      <div className="map-heading"><span>SYSTEM MAP</span><h2>One star. Eight worlds.</h2><p>Orbital spacing and body sizes are compressed for exploration. Distances below are real average orbital distances.</p></div>
      <div className="system-map">
        <div className="map-sun" />
        {worlds.slice(1).map((world, i) => (
          <button key={world.id} className={`map-orbit ${current.id === world.id ? 'active' : ''}`} style={{ '--orbit': i } as React.CSSProperties} onClick={() => onSelect(world.id)} aria-label={`Travel to ${world.name}`}>
            <span className="orbit-line" /><i style={{ background: world.color }} /><b>{world.name}</b><em>{world.distance}</em>
          </button>
        ))}
      </div>
      <div className="scale-note"><span>EXPLORATION SCALE</span><p>A true-scale view would make most worlds microscopic and leave immense empty gaps. This map preserves order and relative context without pretending the spacing is literal.</p></div>
    </AccessibleDialog>
  );
}

function ComparePanel({ world, onClose }: { world: World; onClose: () => void }) {
  const earth = worlds.find((item) => item.id === 'earth')!;
  const bars = [
    ['Radius', world.radiusEarth, 1], ['Mass', Number.parseFloat(world.mass.replaceAll(',', '')), 1], ['Gravity', world.gravityEarth, 1],
  ] as const;
  return (
    <AccessibleDialog className="modal compare-modal" label={`${world.name} compared with Earth`} onClose={onClose}>
      <button className="modal-close" onClick={onClose}>CLOSE ×</button>
      <div className="compare-heading"><span>EARTH REFERENCE</span><h2>{world.name} <i>vs</i> Earth</h2></div>
      <div className="compare-worlds">
        <div><PlanetVisual world={world} small /><strong>{world.name}</strong><span>{world.kind}</span></div>
        <b>:</b>
        <div><PlanetVisual world={earth} small /><strong>Earth</strong><span>Reference world</span></div>
      </div>
      <div className="bar-compare">
        {bars.map(([label, a, b]) => {
          const max = Math.max(a, b, 1);
          return <div key={label}><span>{label}</span><div><i style={{ width: `${Math.max(3, a / max * 100)}%`, background: world.color }} /><em>{a.toLocaleString()}×</em></div><div><i style={{ width: `${Math.max(3, b / max * 100)}%`, background: earth.color }} /><em>1×</em></div></div>;
        })}
      </div>
      <div className="weight-card"><span>IF YOU WEIGH 180 LB ON EARTH</span><strong>{Math.round(180 * world.gravityEarth).toLocaleString()} lb</strong><p>Scale reading based on surface/cloud-top gravity—not mass or the experience of standing there.</p></div>
    </AccessibleDialog>
  );
}

function CatalogPanel({ open, selectedId, onSelect, onTravel, onClose }: { open: boolean; selectedId: string; onSelect: (id: string) => void; onTravel: (object: CatalogObject) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [distanceLimit,setDistanceLimit] = useState(100);
  const [spectral,setSpectral] = useState('ALL');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalogObjects.filter((object) => (category === 'ALL' || object.category === category || (category === 'PLANETARY SYSTEM' && object.hasPlanets) || (category === 'MULTIPLES' && object.architecture !== 'single' && Boolean(object.architecture))) && object.distanceLightYears <= distanceLimit && (spectral === 'ALL' || object.spectralGroup === spectral) && (!normalized || `${object.name} ${object.designation} ${object.type}`.toLowerCase().includes(normalized)));
  }, [category, query, distanceLimit, spectral]);
  const selected = filtered.find((object) => object.id === selectedId) ?? filtered[0];

  return (
    <aside className={`catalog-panel ${open ? 'open' : ''}`} aria-hidden={!open} inert={!open} aria-label="Helios object catalog">
      <div className="catalog-heading"><span>CATALOG MODE</span><button onClick={onClose}>RETURN TO EXPLORE ×</button><strong>Real places.<br />One universe.</strong><p>Search the bounded scientific catalog, inspect an object, then continue through the same live spatial scene.</p></div>
      <label className="catalog-search"><span>SEARCH OBJECTS</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Proxima, Sirius, planet…" autoComplete="off" /></label>
      <div className="catalog-filters" aria-label="Catalog categories">{(['ALL', 'STAR', 'PLANET', 'PLANETARY SYSTEM', 'MULTIPLES', 'STELLAR REMNANT', 'BROWN DWARF'] as const).map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="catalog-refine"><label>RANGE <select aria-label="Catalog distance" value={distanceLimit} onChange={event=>setDistanceLimit(Number(event.target.value))}><option value={10}>WITHIN 10 LY</option><option value={20}>WITHIN 20 LY</option><option value={100}>ALL NEARBY</option></select></label><label>SPECTRUM <select aria-label="Spectral group" value={spectral} onChange={event=>setSpectral(event.target.value)}>{['ALL','A','F','G','K','M','D','L','T','Y'].map(group=><option key={group}>{group}</option>)}</select></label><span>{filtered.length} OBJECTS</span></div>
      <div className="catalog-results" aria-label="Scientific objects">
        {filtered.map((object) => <button key={object.id} aria-pressed={selected?.id === object.id} className={selected?.id === object.id ? 'active' : ''} onClick={() => onSelect(object.id)}><i /><span><strong>{object.name}</strong><em>{object.category} · {object.distanceLightYears.toFixed(2)} LY</em></span><b>↗</b></button>)}
        {!filtered.length && <p>No objects match this search.</p>}
      </div>
      {selected && <section className="catalog-detail" aria-label={`${selected.name} catalog detail`}>
        <span>{selected.category}</span><strong>{selected.name}</strong><h3>{selected.type}</h3><p>{selected.designation}</p>
        <dl><div><dt>DISTANCE FROM OUR SUN</dt><dd>{selected.distanceLightYears.toFixed(2)} light-years</dd></div><div><dt>POSITION POLICY</dt><dd>{selected.id === 'sol' ? 'Heliocentric origin' : 'ICRS · epoch 2026.81 linear motion'}</dd></div><div><dt>PROVENANCE</dt><dd>{selected.provenance}</dd></div></dl>
        {selected.category === 'STELLAR REMNANT' && <p className="catalog-object-science">A white dwarf is an exposed stellar core: roughly planet-sized in physical radius, supported by electron degeneracy, with extreme density. Render size and brightness are exaggerated for approach; spectral type is cataloged. No accretion disk is invented.</p>}
        {selected.category === 'BROWN DWARF' && <p className="catalog-object-science">A cool substellar object below sustained hydrogen fusion. Its spectral class is cataloged; the dim warm rendering is illustrative and does not imply a resolved visible-light photograph.</p>}
        <a className="catalog-source" href={getStellarObject(selected.id)?.astrometry?.sourceUrl ?? getExoplanet(selected.id)?.provenance.sourceUrl ?? 'https://science.nasa.gov/sun/'} target="_blank" rel="noreferrer">OPEN SOURCE RECORD ↗</a>
        <SourceInspector context={selected.id === 'sol' ? {kind:'world',id:'sun'} : {kind:selected.category === 'PLANET' ? 'exoplanet' : 'stellar',id:selected.id}} label="Catalog evidence and dates" />
        <button className="catalog-travel" onClick={() => onTravel(selected)}>{selected.id === 'sol' ? 'RETURN HOME' : 'TAKE ME THERE'} <span>→</span></button>
      </section>}
    </aside>
  );
}

export default function Home() {
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality | 'AUTO'>('AUTO');
  const [eventPreview, setEventPreview] = useState(0);
  const [pauseAnimations, setPauseAnimations] = useState(false);
  const [auroraPreview, setAuroraPreview] = useState(false);
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('EXPLORE');
  const [selectedCatalogId, setSelectedCatalogId] = useState('proxima-centauri');
  const [selectedId, setSelectedId] = useState('earth');
  const [view, setView] = useState<ViewMode>('overview');
  const [travelTo, setTravelTo] = useState<World | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [educationTarget, setEducationTarget] = useState<EducationTarget | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedStellarId, setSelectedStellarId] = useState<string | null>(null);
  const [arrivedStellarId, setArrivedStellarId] = useState<string | null>(null);
  const [selectedExoplanetId, setSelectedExoplanetId] = useState<string | null>(null);
  const [focusedExoplanetId, setFocusedExoplanetId] = useState<string | null>(null);
  const [selectedSystemObjectId, setSelectedSystemObjectId] = useState<string | null>(null);
  const [focusedSystemObjectId, setFocusedSystemObjectId] = useState<string | null>(null);
  const [stellarTravel, setStellarTravel] = useState<StellarTravelState | null>(null);
  const [interiorMode, setInteriorMode] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);
  const [minimalUi, setMinimalUi] = useState(false);
  const [following, setFollowing] = useState(true);
  const [quickTravelOpen, setQuickTravelOpen] = useState(false);
  const [spatialScale, setSpatialScale] = useState<CosmicScale>('SYSTEM');
  const [focusRequest, setFocusRequest] = useState({ targetId: null as string | null, sequence: 0 });
  const [stellarTravelRequest, setStellarTravelRequest] = useState<StellarTravelRequest>({ targetId: null, sourceId: null, distanceLightYears: 0, sequence: 0 });
  const [exoplanetFocusRequest, setExoplanetFocusRequest] = useState<ExoplanetFocusRequest>({ targetId: null, sequence: 0 });
  const [systemObjectFocusRequest, setSystemObjectFocusRequest] = useState<SystemObjectFocusRequest>({ targetId: null, sequence: 0 });
  const arrivalSelectionRef = useRef<ArrivalSelection | null>(null);
  const world = useMemo(() => worlds.find((item) => item.id === selectedId)!, [selectedId]);
  const selectedStellarObject = useMemo(() => selectedStellarId ? getStellarObject(selectedStellarId) ?? null : null, [selectedStellarId]);
  const selectedStellarSystem = selectedStellarObject ? getStellarSystem(selectedStellarObject.systemId) : null;
  const selectedExoplanet = useMemo(() => selectedExoplanetId ? getExoplanet(selectedExoplanetId) ?? null : null, [selectedExoplanetId]);
  const selectedSystemObject = useMemo(() => selectedSystemObjectId ? getStellarObject(selectedSystemObjectId) ?? null : null, [selectedSystemObjectId]);
  const arrivedStellarObject = useMemo(() => arrivedStellarId ? getStellarObject(arrivedStellarId) ?? null : null, [arrivedStellarId]);
  const destinationPlanets = useMemo(() => arrivedStellarId ? exoplanetsForHost(arrivedStellarId) : [], [arrivedStellarId]);
  const destinationSystem = useMemo(() => getDestinationSystemByAnchor(arrivedStellarId) ?? null, [arrivedStellarId]);
  const selectedDestinationBody = destinationSystem?.bodies.find((body) => body.objectId === selectedSystemObjectId) ?? null;
  const selectedDestinationOrbit = destinationSystem?.orbits.find((orbit) => orbit.bodyId === selectedDestinationBody?.id) ?? null;
  const travellingStellarObject = stellarTravel ? getStellarObject(stellarTravel.targetId) ?? null : null;

  const travelToWorld = useCallback((id: string) => {
    const next = worlds.find((item) => item.id === id)!;
    setSelectedId(id);
    setSelectedStellarId(null);
    setArrivedStellarId(null);
    setSelectedExoplanetId(null);
    setFocusedExoplanetId(null);
    setSelectedSystemObjectId(null);
    setFocusedSystemObjectId(null);
    setStellarTravel(null);
    arrivalSelectionRef.current = null;
    setStellarTravelRequest((current) => ({ targetId: null, sourceId: null, distanceLightYears: 0, sequence: current.sequence + 1 }));
    setExoplanetFocusRequest((current) => ({ targetId: null, sequence: current.sequence + 1 }));
    setSystemObjectFocusRequest((current) => ({ targetId: null, sequence: current.sequence + 1 }));
    setView('overview');
    setDetailOpen(false);
    setFocusedId(null);
    setInteriorMode(false);
    setActiveLayer(0);
    setFollowing(true);
    setMapOpen(false);
    setCompareOpen(false);
    setQuickTravelOpen(false);
    setExperienceMode('EXPLORE');
    setTravelTo(next);
    setFocusRequest((current) => ({ targetId: id, sequence: current.sequence + 1 }));
  }, []);

  const returnToSystem = useCallback(() => {
    setDetailOpen(false);
    setFocusedId(null);
    setInteriorMode(false);
    setFollowing(true);
    setCompareOpen(false);
    setTravelTo(null);
    setSelectedStellarId(null);
    setArrivedStellarId(null);
    setSelectedExoplanetId(null);
    setFocusedExoplanetId(null);
    setSelectedSystemObjectId(null);
    setFocusedSystemObjectId(null);
    setStellarTravel(null);
    arrivalSelectionRef.current = null;
    setStellarTravelRequest((current) => ({ targetId: null, sourceId: null, distanceLightYears: 0, sequence: current.sequence + 1 }));
    setExoplanetFocusRequest((current) => ({ targetId: null, sequence: current.sequence + 1 }));
    setSystemObjectFocusRequest((current) => ({ targetId: null, sequence: current.sequence + 1 }));
    setFocusRequest((current) => ({ targetId: null, sequence: current.sequence + 1 }));
    setExperienceMode('EXPLORE');
  }, []);

  const handleArrival = useCallback((id: string | null) => {
    setTravelTo(null);
    setFocusedId(id);
  }, []);

  const selectStellarObject = useCallback((id: string) => {
    setSelectedStellarId(id);
    setSelectedExoplanetId(null);
    setFocusedExoplanetId(null);
    setSelectedSystemObjectId(null);
    setFocusedSystemObjectId(null);
    setDetailOpen(false);
    setCompareOpen(false);
    setDataOpen(false);
    setQuickTravelOpen(false);
  }, []);

  const applyArrivalSelection = useCallback((selection: ArrivalSelection) => {
    setSelectedStellarId(selection.kind === 'STELLAR' ? selection.id : null);
    setSelectedExoplanetId(selection.kind === 'EXOPLANET' ? selection.id : null);
    setFocusedExoplanetId(null);
    setSelectedSystemObjectId(selection.kind === 'SYSTEM_OBJECT' ? selection.id : null);
    setFocusedSystemObjectId(null);
  }, []);

  const travelToStellarObject = useCallback((targetId: string, selection: ArrivalSelection = { kind: 'STELLAR', id: targetId }) => {
    const target = getStellarObject(targetId);
    if (!target || target.id === 'sol') { returnToSystem(); return; }
    if (arrivedStellarId === targetId) {
      applyArrivalSelection(selection);
      setExperienceMode('EXPLORE');
      return;
    }
    const sourceId = arrivedStellarId ?? 'sol';
    const catalogDistance = separationLightYears(sourceId, targetId);
    arrivalSelectionRef.current = selection;
    setSelectedStellarId(targetId);
    setArrivedStellarId(null);
    setSelectedExoplanetId(null);
    setFocusedExoplanetId(null);
    setSelectedSystemObjectId(null);
    setFocusedSystemObjectId(null);
    setFocusedId(null);
    setStellarTravel({ sourceId, targetId, progress: 0, totalLightYears: catalogDistance, remainingLightYears: catalogDistance, status: 'traveling' });
    setStellarTravelRequest((current) => ({ targetId, sourceId, distanceLightYears: catalogDistance, sequence: current.sequence + 1 }));
    setExperienceMode('EXPLORE');
    setQuickTravelOpen(false);
  }, [applyArrivalSelection, arrivedStellarId, returnToSystem]);

  const beginStellarTravel = useCallback(() => {
    if (!selectedStellarObject) return;
    travelToStellarObject(selectedStellarObject.id);
  }, [selectedStellarObject, travelToStellarObject]);

  const handleCatalogTravel = useCallback((object: CatalogObject) => {
    setSelectedCatalogId(object.id);
    if (object.id === 'sol') { returnToSystem(); return; }
    travelToStellarObject(object.travelAnchorId, object.arrivalSelection);
  }, [returnToSystem, travelToStellarObject]);

  const handleStellarTravelProgress = useCallback((targetId: string, progress: number, remainingLightYears: number) => {
    setStellarTravel((current) => current?.targetId === targetId ? { ...current, progress, remainingLightYears } : current);
  }, []);

  const handleStellarArrival = useCallback((targetId: string) => {
    setArrivedStellarId(targetId);
    setStellarTravel((current) => current?.targetId === targetId ? { ...current, progress: 1, remainingLightYears: 0, status: 'arrived' } : current);
    const intendedSelection = arrivalSelectionRef.current ?? { kind: 'STELLAR' as const, id: targetId };
    arrivalSelectionRef.current = null;
    applyArrivalSelection(intendedSelection);
  }, [applyArrivalSelection]);

  const selectExoplanet = useCallback((id: string) => {
    setSelectedExoplanetId(id);
    setFocusedExoplanetId(null);
    setSelectedSystemObjectId(null);
    setFocusedSystemObjectId(null);
  }, []);

  const selectSystemObject = useCallback((id: string) => {
    setSelectedSystemObjectId(id);
    setFocusedSystemObjectId(null);
    setSelectedExoplanetId(null);
    setFocusedExoplanetId(null);
  }, []);

  const approachExoplanet = useCallback(() => {
    if (!selectedExoplanet) return;
    setExoplanetFocusRequest((current) => ({ targetId: selectedExoplanet.id, sequence: current.sequence + 1 }));
  }, [selectedExoplanet]);

  const returnToDestinationSystem = useCallback(() => {
    setSelectedStellarId(arrivedStellarId);
    setSelectedExoplanetId(null);
    setFocusedExoplanetId(null);
    setSelectedSystemObjectId(null);
    setFocusedSystemObjectId(null);
    setExoplanetFocusRequest((current) => ({ targetId: null, sequence: current.sequence + 1 }));
    setSystemObjectFocusRequest((current) => ({ targetId: null, sequence: current.sequence + 1 }));
  }, [arrivedStellarId]);

  const handleExoplanetArrival = useCallback((targetId: string) => {
    setFocusedExoplanetId(targetId);
  }, []);

  const approachSystemObject = useCallback(() => {
    if (!selectedSystemObject) return;
    setSystemObjectFocusRequest((current) => ({ targetId: selectedSystemObject.id, sequence: current.sequence + 1 }));
  }, [selectedSystemObject]);

  const handleSystemObjectArrival = useCallback((targetId: string) => {
    setFocusedSystemObjectId(targetId);
  }, []);

  const leaveDestinationSystem = useCallback(() => {
    setArrivedStellarId(null);
    setSelectedExoplanetId(null);
    setFocusedExoplanetId(null);
    setSelectedSystemObjectId(null);
    setFocusedSystemObjectId(null);
    setStellarTravel(null);
  }, []);

  const refocusWorld = useCallback(() => {
    setFollowing(true);
    setFocusRequest((current) => ({ targetId: selectedId, sequence: current.sequence + 1 }));
  }, [selectedId]);

  const toggleMinimalUi = useCallback(() => {
    setMinimalUi((open) => {
      if (!open) {
        setDetailOpen(false);
        setCompareOpen(false);
        setDataOpen(false);
        setQuickTravelOpen(false);
      }
      return !open;
    });
  }, []);

  useEffect(() => {
    if (stellarTravel?.status !== 'arrived') return;
    const timer = window.setTimeout(() => setStellarTravel(null), 1400);
    return () => window.clearTimeout(timer);
  }, [stellarTravel?.status]);

  const navigateEducation = useCallback((target: EducationTarget) => {
    setMinimalUi(false); setInteriorMode(false); setDetailOpen(false); setDataOpen(false); setCompareOpen(false);
    setEducationTarget(target);
    if (target.kind === 'home') { returnToSystem(); setEducationTarget(null); }
    else if (target.kind === 'world') {
      if (focusedId === target.id) {
        if (target.layerIndex !== undefined) { setInteriorMode(true); setActiveLayer(target.layerIndex); }
        if (target.compare) setCompareOpen(true);
        setEducationTarget(null);
      } else travelToWorld(target.id);
    }
    else if (target.kind === 'stellar') { travelToStellarObject(target.id); setEducationTarget(null); }
    else {
      const planet = getExoplanet(target.id);
      if (planet) travelToStellarObject(planet.hostStarId, {kind:'EXOPLANET',id:planet.id});
    }
  }, [returnToSystem, travelToWorld, travelToStellarObject, focusedId]);
  useEffect(() => {
    if (!educationTarget) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
    if (educationTarget.kind === 'world' && focusedId === educationTarget.id) {
      if (educationTarget.layerIndex !== undefined) { setInteriorMode(true); setActiveLayer(educationTarget.layerIndex); }
      if (educationTarget.compare) setCompareOpen(true);
      setEducationTarget(null);
    } else if (educationTarget.kind === 'exoplanet') {
      const planet = getExoplanet(educationTarget.id);
      if (planet && arrivedStellarId === planet.hostStarId && selectedExoplanetId === planet.id) {
        setExoplanetFocusRequest(current => ({targetId:planet.id,sequence:current.sequence + 1}));
        setEducationTarget(null);
      }
    }
    });
    return () => { cancelled = true; };
  }, [educationTarget, focusedId, arrivedStellarId, selectedExoplanetId]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input,textarea,select,button,[contenteditable="true"],.education-panel,dialog')) return;
      if (event.key === 'Escape') {
        if (experienceMode === 'CATALOG') { setExperienceMode('EXPLORE'); return; }
        if (stellarTravel) { returnToSystem(); return; }
        if (selectedExoplanetId || focusedExoplanetId || selectedSystemObjectId || focusedSystemObjectId) { returnToDestinationSystem(); return; }
        if (dataOpen) { setDataOpen(false); return; }
        if (compareOpen) { setCompareOpen(false); return; }
        if (detailOpen) { setDetailOpen(false); return; }
        if (interiorMode) { setInteriorMode(false); return; }
        if (focusedId) { returnToSystem(); return; }
        if (selectedStellarId) { setSelectedStellarId(null); return; }
        if (arrivedStellarId) { leaveDestinationSystem(); return; }
        if (quickTravelOpen) { setQuickTravelOpen(false); return; }
        if (minimalUi) { setMinimalUi(false); return; }
      }
      if (event.key.toLowerCase() === 'i' && focusedId) { setDetailOpen((open) => !open); return; }
      if (event.key.toLowerCase() === 'x' && focusedId) { setDetailOpen(false); setInteriorMode((open) => { if (!open) setActiveLayer(world.layers.length - 1); return !open; }); return; }
      if (event.key.toLowerCase() === 'm') { toggleMinimalUi(); return; }
      if (spatialScale === 'LOCAL_STELLAR' || spatialScale === 'STELLAR_SYSTEM') return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const index = worlds.findIndex((item) => item.id === selectedId);
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      travelToWorld(worlds[(index + delta + worlds.length) % worlds.length].id);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [arrivedStellarId, compareOpen, dataOpen, detailOpen, experienceMode, focusedExoplanetId, focusedId, focusedSystemObjectId, interiorMode, leaveDestinationSystem, minimalUi, quickTravelOpen, returnToDestinationSystem, returnToSystem, selectedExoplanetId, selectedId, selectedStellarId, selectedSystemObjectId, spatialScale, stellarTravel, toggleMinimalUi, travelToWorld, world.layers.length]);

  return (
    <main className={`app-shell mode-${experienceMode.toLowerCase()} world-${world.id} ${minimalUi ? 'minimal-ui' : ''} ${educationOpen ? 'education-active' : ''} ${interiorMode ? 'interior-active' : ''} ${stellarTravel?.status === 'traveling' ? 'interstellar-active' : ''}`} style={{ '--world': world.color, '--accent': world.accent } as React.CSSProperties}>
      <header className="explore-hud">
        <button className="brand" onClick={returnToSystem}><i />HELIOS <span>LIVE COSMIC ATLAS</span></button>
        <div className="explore-location"><span>{arrivedStellarObject ? 'DESTINATION FRAME' : spatialScale.replace('_', ' ')}</span><strong>{selectedSystemObject?.name ?? selectedExoplanet?.name ?? arrivedStellarObject?.name ?? selectedStellarObject?.name ?? (focusedId ? world.name : 'Home [Our Sun]')}</strong></div>
        <nav><button className={educationOpen ? 'active' : ''} aria-expanded={educationOpen} onClick={() => { setEducationOpen(open => !open); setMinimalUi(false); setExperienceMode('EXPLORE'); setDataOpen(false); }}>EDUCATION</button><label className="quality-picker" title="Graphics quality"><select aria-label="Graphics quality" value={graphicsQuality} onChange={event => setGraphicsQuality(event.target.value as GraphicsQuality | 'AUTO')}>{['AUTO','ULTRA','HIGH','BALANCED'].map(tier => <option key={tier}>{tier}</option>)}</select></label><button className={experienceMode === 'CATALOG' ? 'active' : ''} onClick={() => setExperienceMode('CATALOG')}>CATALOG</button><button onClick={() => setQuickTravelOpen((open) => !open)}>WORLDS</button><button onClick={() => setDataOpen(true)}>SCIENCE</button><button aria-pressed={pauseAnimations} onClick={() => setPauseAnimations(value => !value)}>{pauseAnimations ? 'RESUME MOTION' : 'PAUSE MOTION'}</button><button onClick={toggleMinimalUi}>HIDE HUD</button></nav>
      </header>

      {minimalUi && <><button className="restore-ui" onClick={toggleMinimalUi}>HELIOS · RESTORE HUD</button><div className="minimal-context"><span>{arrivedStellarObject ? `DESTINATION · ${arrivedStellarObject.name.toUpperCase()}` : 'EXPLORE MODE'}</span><strong>{selectedSystemObject?.name.toUpperCase() ?? selectedExoplanet?.name.toUpperCase() ?? selectedStellarObject?.name.toUpperCase() ?? (focusedId ? world.name.toUpperCase() : spatialScale.replace('_', ' '))}</strong></div></>}

      <section className={`space-stage ${detailOpen ? 'detail-active' : ''}`}>
        <SolarSystemScene pauseAnimations={pauseAnimations} graphicsQuality={graphicsQuality} eventPreview={eventPreview} auroraPreview={auroraPreview && focusedId === 'earth' && !interiorMode} selectedId={selectedId} selectedStellarId={selectedStellarId} selectedExoplanetId={selectedExoplanetId} selectedSystemObjectId={selectedSystemObjectId} arrivedStellarId={arrivedStellarId} focusRequest={focusRequest} stellarTravelRequest={stellarTravelRequest} exoplanetFocusRequest={exoplanetFocusRequest} systemObjectFocusRequest={systemObjectFocusRequest} interiorMode={interiorMode} activeLayer={activeLayer} following={following} onSelect={travelToWorld} onSelectStellar={selectStellarObject} onSelectExoplanet={selectExoplanet} onSelectSystemObject={selectSystemObject} onArrive={handleArrival} onStellarTravelProgress={handleStellarTravelProgress} onStellarArrive={handleStellarArrival} onExoplanetArrive={handleExoplanetArrival} onSystemObjectArrive={handleSystemObjectArrival} onScaleChange={setSpatialScale} />

        <div className={`system-intro ${focusedId || travelTo || spatialScale === 'LOCAL_STELLAR' || spatialScale === 'STELLAR_SYSTEM' || arrivedStellarId ? 'hidden' : ''}`}>
          <p>YOU ARE HERE · HOME [OUR SUN]</p>
          <h1>A navigable model<br />of our home system.</h1>
          <span>Drag to look around. Scroll to move through space. Select a world directly to travel.</span>
          <div><b>8</b><em>PLANETS</em><b>1</b><em>STAR</em><b>30.1 AU</b><em>TO NEPTUNE</em></div>
        </div>

        {spatialScale === 'LOCAL_STELLAR' && !selectedStellarObject && <section className="local-stellar-intro" aria-label="Local stellar navigation">
          <span>LOCAL STELLAR SPACE · ICRS</span>
          <strong>A neighborhood of real worlds.</strong>
          <p>{localStellarObjects.length} local anchors · {stellarObjects.length} catalog objects. Every bright selectable marker is a real cataloged object at an astrometry-derived 3D direction. Drag to look; use W/A/S/D and Q/E to drift.</p>
        </section>}

        {(spatialScale === 'LOCAL_STELLAR' || spatialScale === 'STELLAR_SYSTEM') && selectedStellarObject && !selectedExoplanet && !selectedSystemObject && <section className="stellar-object-dock" aria-label={`${selectedStellarObject.name} stellar selection`}>
          <div><span>{arrivedStellarId === selectedStellarObject.id ? 'ARRIVED · ' : ''}{selectedStellarSystem?.architecture.toUpperCase()} SYSTEM · {selectedStellarObject.spectralType}</span><strong>{selectedStellarObject.name}</strong><em>{distanceLightYears(selectedStellarObject).toFixed(2)} LIGHT-YEARS FROM OUR SUN</em></div>
          <div className="stellar-object-actions">{selectedStellarObject.id !== 'sol' && arrivedStellarId !== selectedStellarObject.id && stellarTravel?.status !== 'traveling' && <button className="travel-star" onClick={beginStellarTravel}>TAKE ME THERE</button>}{arrivedStellarId === selectedStellarObject.id && <><button onClick={()=>{setSelectedSystemObjectId(selectedStellarObject.id);setSelectedStellarId(null);}}>INSPECT STAR</button><button onClick={leaveDestinationSystem}>LEAVE SYSTEM</button></>}<button onClick={() => setSelectedStellarId(null)}>RELEASE</button><button onClick={returnToSystem}>HOME</button></div>
          <p>{selectedStellarObject.stellarType} · {selectedStellarObject.designation} · POSITION MEASURED · {STELLAR_EPOCH_POLICY.frame} {STELLAR_EPOCH_POLICY.referenceEpoch} → {STELLAR_EPOCH_POLICY.displayEpoch} LINEAR MOTION · APPEARANCE ILLUSTRATIVE{destinationPlanets.length ? ` · ${destinationPlanets.length} CONFIRMED PLANETS` : ''}</p>
        </section>}

        {destinationSystem && !selectedExoplanet && !selectedSystemObject && <section className="destination-system-intro" aria-label={`${destinationSystem.name} destination system`}>
          <span>{destinationSystem.name.toUpperCase()} · {destinationSystem.kind.replaceAll('_', ' ')}</span>
          <strong>{destinationSystem.headline}</strong>
          <p>{destinationSystem.guidance}</p>
        </section>}

        {selectedExoplanet && <section className="stellar-object-dock exoplanet-object-dock" aria-label={`${selectedExoplanet.name} exoplanet selection`}>
          <div className="exoplanet-heading"><span>{selectedExoplanet.status} · {selectedExoplanet.discoveryMethod.toUpperCase()} · {selectedExoplanet.discoveryYear}</span><strong>{selectedExoplanet.name}</strong><em>{selectedExoplanet.likelyClass}</em></div>
          <div className="stellar-object-actions">{focusedExoplanetId !== selectedExoplanet.id && <button className="travel-star" onClick={approachExoplanet}>APPROACH</button>}<button onClick={returnToDestinationSystem}>BACK TO SYSTEM</button><button onClick={returnToSystem}>HOME</button></div>
          <dl className="exoplanet-metrics">
            <div><dt>ORBIT</dt><dd>{selectedExoplanet.semiMajorAxisAU} AU <ConfidenceMark level="measured" compact /></dd></div>
            <div><dt>PERIOD</dt><dd>{selectedExoplanet.orbitalPeriodDays} DAYS <ConfidenceMark level="measured" compact /></dd></div>
            <div><dt>{selectedExoplanet.massProvenance === 'MASS' ? 'DYNAMICAL MASS' : 'MINIMUM MASS'}</dt><dd>{selectedExoplanet.massEarth ?? selectedExoplanet.minimumMassEarth} M⊕ <ConfidenceMark level="inferred" compact /></dd></div>
            <div><dt>MODELED RADIUS</dt><dd>{selectedExoplanet.radiusEarth} R⊕ <ConfidenceMark level={selectedExoplanet.radiusConfidence} compact /></dd></div>
            <div><dt>EQUILIBRIUM TEMP.</dt><dd>{selectedExoplanet.equilibriumTemperatureK === null ? 'UNKNOWN' : `${selectedExoplanet.equilibriumTemperatureK} K`} <ConfidenceMark level={selectedExoplanet.equilibriumTemperatureK === null ? 'unknown' : selectedExoplanet.temperatureConfidence} compact /></dd></div>
          </dl>
          <SourceInspector context={{kind:'exoplanet',id:selectedExoplanet.id}} label="Evidence for planet properties" />
          <p>{selectedExoplanet.visualNote} · APPEARANCE <ConfidenceMark level={selectedExoplanet.appearanceConfidence} compact /> · NASA EXOPLANET ARCHIVE PSCOMPPARS</p>
        </section>}

        {selectedSystemObject && <section className="stellar-object-dock system-member-dock" aria-label={`${selectedSystemObject.name} system-member selection`}>
          <div><span>{selectedSystemObject.objectClass.replace('_', ' ')} · {selectedSystemObject.spectralType}</span><strong>{selectedSystemObject.name}</strong><em>{selectedSystemObject.designation}</em></div>
          <div className="stellar-object-actions">{focusedSystemObjectId !== selectedSystemObject.id && <button className="travel-star" onClick={approachSystemObject}>APPROACH</button>}<button onClick={returnToDestinationSystem}>BACK TO SYSTEM</button><button onClick={returnToSystem}>HOME</button></div>
          <dl className="system-member-metrics"><div><dt>OBJECT CLASS</dt><dd>{selectedSystemObject.stellarType}</dd></div><div><dt>SYSTEM</dt><dd>{destinationSystem?.name}</dd></div>{selectedDestinationOrbit && <div><dt>RELATIVE ORBIT</dt><dd>{selectedDestinationOrbit.scientific.semiMajorAxis} {selectedDestinationOrbit.scientific.unit} · ~{selectedDestinationOrbit.scientific.period} {selectedDestinationOrbit.scientific.periodUnit.toUpperCase()}{selectedDestinationOrbit.scientific.period === 1 ? '' : 'S'} <ConfidenceMark level="measured" compact /></dd></div>}</dl>
          <SourceInspector context={{kind:'stellar',id:selectedSystemObject.id}} label="Stellar evidence and dates" /><p>SIMBAD CATALOG OBJECT · SYSTEM GEOMETRY ILLUSTRATIVE UNLESS AN ORBIT IS CITED · APPEARANCE ILLUSTRATIVE</p>
        </section>}

        {focusedId && !travelTo && <section className="object-dock" aria-label={`${world.name} exploration controls`}>
          <div><span>{world.index} · {world.kind}</span><strong>{world.name}</strong><em>{world.distance} FROM OUR SUN</em></div>
          <div className="object-actions">
            <button onClick={() => { setInteriorMode(false); setDetailOpen(true); }}>INFO <kbd>I</kbd></button>
            <button className={interiorMode ? 'active' : ''} aria-pressed={interiorMode} onClick={() => { setDetailOpen(false); setAuroraPreview(false); setInteriorMode((open) => { if (!open) setActiveLayer(world.layers.length - 1); return !open; }); }}>INTERIOR <kbd>X</kbd></button>
            <button className={!following ? 'active' : ''} aria-pressed={!following} onClick={() => following ? setFollowing(false) : refocusWorld()}>{following ? 'RELEASE' : 'REFOCUS'}</button>
            <button onClick={() => setDataOpen(true)}>SCIENCE</button>
            {world.id === 'earth' && <button aria-label="Strong aurora preview" aria-pressed={auroraPreview} className={auroraPreview ? 'active' : ''} onClick={() => { setInteriorMode(false); setDetailOpen(false); setFollowing(true); setAuroraPreview(value=>!value); }}>{auroraPreview ? 'AURORA ON' : 'AURORA'}</button>}
            <button onClick={returnToSystem}>SYSTEM</button>
          </div>
          <p>{world.id === 'sun' ? 'ULTRAVIOLET · FALSE COLOR · ACCELERATED PLASMA & ERUPTIVE LOOPS · ILLUSTRATIVE, NOT LIVE' : world.id === 'earth' && auroraPreview ? 'STRONG AURORA PREVIEW · ILLUSTRATIVE · STAYS ON UNTIL SWITCHED OFF · DRAG TO ORBIT' : following ? 'FOLLOW MODE · drag to circle · scroll to approach · release for WASD / Q E drift' : 'FREE DRIFT · WASD to move · Q E vertical · Shift accelerates · re-focus anytime'}</p>
        </section>}

        {focusedId && !following && !travelTo && <div className="drift-status"><i /><span>FREE DRIFT</span><strong>{world.name} released</strong><em>WASD · Q/E vertical · Shift accelerate</em></div>}

        {focusedId && interiorMode && <aside className="interior-inspector" aria-label={`${world.name} 3D interior layers`}>
          <div><span>{world.id === 'sun' ? 'STELLAR ENERGY REGIONS · HELIOPHYSICS MODEL' : world.kind.toLowerCase().includes('gas giant') ? 'PRESSURE DESCENT · MODEL-DEPENDENT' : world.kind.toLowerCase().includes('ice giant') ? 'VOLATILE-RICH INTERIOR · MODEL-DEPENDENT' : `3D CUTAWAY · ${world.id === 'earth' ? 'STRONGLY CONSTRAINED' : 'MODEL-DEPENDENT'}`}</span><strong>{world.name} interior</strong><p>{world.id === 'sun' ? 'Translucent plasma regions represent energy transport, not solid shells. Orbit and approach the luminous model.' : world.kind.toLowerCase().includes('gas giant') ? 'There is no ground boundary. Translucent volumes represent increasing pressure, density, and changing hydrogen states with depth.' : world.kind.toLowerCase().includes('ice giant') ? 'The translucent deep region is a hot high-pressure fluid rich in water, ammonia, and methane components—not ordinary frozen ice.' : 'Relative regions are simplified and not to scale. Rotate and zoom the cutaway exactly as you would the exterior.'}</p></div>
          <div className="interior-layer-buttons">{world.layers.map((layer, index) => <button key={layer.name} className={activeLayer === index ? 'active' : ''} aria-pressed={activeLayer === index} onClick={() => setActiveLayer(index)}><i style={{ background: layer.color }} /><span>{layer.name}</span><ConfidenceMark level={layer.confidence} compact /></button>)}</div>
          <SourceInspector context={{kind:'layer',id:world.id,index:activeLayer}} label="Evidence for selected interior region" /><article className="active-layer-note"><span>{world.layers[activeLayer]?.confidence.toUpperCase()}</span><strong>{world.layers[activeLayer]?.name}</strong><p>{world.layers[activeLayer]?.note}</p></article>
          <p className="interior-truth">{world.id === 'earth' ? 'Earth’s major boundaries are constrained primarily by seismic waves, gravity, geomagnetism, and mineral physics.' : world.id === 'sun' ? 'Solar regions are constrained by helioseismology, neutrinos, spectroscopy, and stellar physics; this is not a solid cross-section.' : 'Deep structure is inferred from gravity, magnetic fields, spacecraft observations, high-pressure physics, and formation models—not direct photographs.'}</p>
          <button className="exit-interior" onClick={() => setInteriorMode(false)}>RESTORE EXTERIOR</button>
        </aside>}

        <aside className={`knowledge-drawer ${detailOpen ? 'open' : ''}`} aria-hidden={!detailOpen || minimalUi} inert={!detailOpen || minimalUi} aria-label={`${world.name} information`}>
          <button className="drawer-back" onClick={() => setDetailOpen(false)}>← CLOSE INFORMATION</button>
          <div className="world-heading">
            <p><span>{world.index}</span>{world.kind}</p>
            <h1>{world.name}</h1>
            <h2>{world.tagline}</h2>
          </div>
          <div className="drawer-actions"><button onClick={() => setCompareOpen(true)}>COMPARE WITH EARTH</button><button onClick={() => { setDetailOpen(false); setActiveLayer(world.layers.length - 1); setInteriorMode(true); }}>OPEN 3D INTERIOR</button><span>{world.visualLabel}</span></div>
          <div className="view-tabs" aria-label="Information views">
            {(['overview', 'interior', 'environment'] as ViewMode[]).map((tab) => <button key={tab} className={view === tab ? 'active' : ''} onClick={() => setView(tab)} aria-pressed={view === tab}>{tab}</button>)}
          </div>
          <div className="view-content" key={`${world.id}-${view}`}>
            {view === 'overview' && <Overview world={world} />}
            {view === 'interior' && <Interior world={world} />}
            {view === 'environment' && <Environment world={world} />}
          </div>
        </aside>
      </section>

      <footer className={`world-rail quick-rail ${quickTravelOpen ? 'open' : ''}`} inert={!quickTravelOpen || minimalUi} aria-label="Accessible quick travel">
        <button className="rail-arrow" onClick={() => { const i = worlds.indexOf(world); travelToWorld(worlds[(i - 1 + worlds.length) % worlds.length].id); }} aria-label="Previous world">←</button>
        <div className="rail-worlds">{worlds.map((item) => <button key={item.id} aria-label={`Travel to ${item.name}`} onClick={() => travelToWorld(item.id)} className={item.id === selectedId ? 'active' : ''}><i style={{ background: item.color, transform: `scale(${Math.min(1.4, .65 + item.scale / 5)})` }} /><span>{item.name}</span><em>{item.distance}</em></button>)}</div>
        <button className="rail-arrow" onClick={() => { const i = worlds.indexOf(world); travelToWorld(worlds[(i + 1) % worlds.length].id); }} aria-label="Next world">→</button>
      </footer>

      {stellarTravel && travellingStellarObject && <div className={`travel-telemetry ${stellarTravel.status}`} role="status" aria-live="polite">
        <span>{stellarTravel.status === 'arrived' ? 'LOCAL FRAME ACQUIRED' : 'INTERSTELLAR NAVIGATION · VISUAL MODEL'}</span>
        <div><strong>{stellarTravel.status === 'arrived' ? travellingStellarObject.name : `${stellarTravel.remainingLightYears.toFixed(2)} ly`}</strong><em>{getStellarObject(stellarTravel.sourceId ?? 'sol')?.name ?? 'Home [Our Sun]'} → {travellingStellarObject.name}</em></div>
        <p>{stellarTravel.status === 'arrived' ? `${getStellarSystem(travellingStellarObject.systemId)?.name.toUpperCase()} · DESTINATION GEOMETRY LIVE` : `${stellarTravel.totalLightYears.toFixed(2)} LY MODEL LEG · REMAINING DISTANCE DERIVED FROM THE ACTIVE RENDER PATH · 8.4 SEC VISUALIZATION`}</p>
      </div>}
      {educationOpen && <EducationPanel onClose={() => { setEducationOpen(false); setEducationTarget(null); }} onNavigate={navigateEducation} observed={{worldId:focusedId,layerIndex:interiorMode ? activeLayer : null,stellarId:arrivedStellarId,exoplanetId:focusedExoplanetId,compareOpen,interiorMode}} />}
      <CatalogPanel open={experienceMode === 'CATALOG'} selectedId={selectedCatalogId} onSelect={setSelectedCatalogId} onTravel={handleCatalogTravel} onClose={() => setExperienceMode('EXPLORE')} />
      {travelTo && <div className="spatial-travel"><span>TRAVELLING THROUGH SYSTEM SPACE</span><strong>{travelTo.name}</strong><em>{travelTo.distance} REAL MEAN ORBIT · 2.1 SEC VISUALIZED TRAVEL</em><div><i /></div></div>}
      {mapOpen && <SystemMap current={world} onSelect={travelToWorld} onClose={() => setMapOpen(false)} />}
      {compareOpen && <ComparePanel world={world} onClose={() => setCompareOpen(false)} />}
      {dataOpen && <AccessibleDialog className="modal science-modal" label="Scientific evidence and visualization limits" onClose={() => setDataOpen(false)}><button className="modal-close" onClick={() => setDataOpen(false)}>CLOSE ×</button><span className="science-kicker">EPISTEMIC KEY</span><p className="science-lead">{focusedId ? `${world.name}: J2000 pole, ${getBodyOrientation(world.id)?.obliquityDeg}° obliquity; visual spin accelerated 1080×. Phase and cutaway geometry are illustrative.` : 'Scientific positions and distances remain separate from compressed display spacing and exaggerated sizes.'}</p><button className="science-preview" onClick={() => { if (focusedId === 'earth') { setInteriorMode(false); setAuroraPreview(true); } else setEventPreview(n => n + 1); setDataOpen(false); }}>{focusedId === 'earth' ? 'SHOW STRONG EARTH AURORA' : 'PREVIEW ILLUSTRATIVE SOLAR ACTIVITY'}</button><h2>What do we actually know?</h2><p className="science-lead">The interface separates observation from model, open questions, and artwork. A polished picture should never become a false claim.</p><div className="confidence-guide">{(['measured', 'inferred', 'uncertain', 'unknown', 'illustrative'] as Confidence[]).map((level) => <div key={level}><ConfidenceMark level={level} /><p>{confidenceCopy[level]}</p></div>)}</div><SourceInspector context={selectedExoplanetId ? {kind:'exoplanet',id:selectedExoplanetId} : selectedStellarId ? {kind:'stellar',id:selectedStellarId} : {kind:'world',id:world.id}} label="Evidence for the selected object" /><div className="sources"><h3>PRIMARY REFERENCES</h3><a href="https://science.nasa.gov/solar-system/" target="_blank" rel="noreferrer">NASA Solar System Exploration ↗</a><a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank" rel="noreferrer">NASA Planetary Fact Sheet ↗</a><a href="https://science.nasa.gov/sun/" target="_blank" rel="noreferrer">NASA Sun Science ↗</a><a href="https://simbad.cds.unistra.fr/simbad/" target="_blank" rel="noreferrer">SIMBAD Astronomical Database ↗</a><a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noreferrer">NASA Exoplanet Archive ↗</a><a href="https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/" target="_blank" rel="noreferrer">NASA Hubble · Sirius A/B ↗</a><a href="https://crf.usno.navy.mil/data_products/WDS/orb6/orb6.html" target="_blank" rel="noreferrer">USNO Visual Binary Orbit Catalog ↗</a><p>Stellar directions propagate ICRS J2000.0 catalog coordinates to fixed Julian epoch 2026.81 with linear tangent proper motion. Radial velocity is applied when cataloged; missing velocities are held at zero. Binary orbit acceleration is omitted. Scientific coordinates remain separate from compressed, floating-origin render coordinates. Values are rounded for comprehension, and time-sensitive catalogs may change.</p></div></AccessibleDialog>}
    </main>
  );
}
