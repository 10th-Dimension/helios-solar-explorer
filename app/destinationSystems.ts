import { exoplanets } from './exoplanets.ts';
import { getStellarObject, getStellarSystem, localStellarObjects, stellarObjects } from './stellar.ts';
import type { Confidence } from './worlds';

export type DestinationSystemKind = 'PLANETARY_SYSTEM' | 'BINARY_STELLAR_SYSTEM' | 'SINGLE_OBJECT' | 'MULTIPLE_STELLAR_SYSTEM';
export type DestinationBodyKind = 'CATALOG_STAR' | 'EXOPLANET' | 'WHITE_DWARF' | 'BROWN_DWARF';

export type DestinationBodyRecord = {
  id: string;
  kind: DestinationBodyKind;
  objectId: string;
  role: 'ANCHOR' | 'ORBITER' | 'COMPANION';
  selectable: boolean;
  render: {
    position: readonly [number, number, number];
    radius: number;
    color: string;
    accent: string;
  };
};

export type DestinationOrbitRecord = {
  id: string;
  bodyId: string;
  scientific: {
    semiMajorAxis: number;
    unit: 'AU';
    period: number;
    periodUnit: 'day' | 'year';
    confidence: Extract<Confidence, 'measured'>;
  };
  render: {
    radius: number;
    inclinationDeg: number;
    phaseRad: number;
  };
};

export type DestinationSystemRecord = {
  id: string;
  stellarSystemId: string;
  anchorObjectId: string;
  name: string;
  kind: DestinationSystemKind;
  headline: string;
  guidance: string;
  orientation: readonly [number, number, number];
  arrivalStandOff: number;
  coordinatePolicy: {
    scientificFrame: 'ANCHOR_RELATIVE';
    scientificDistanceUnit: 'AU';
    renderTransform: 'DESTINATION_COMPRESSED';
    phasePolicy: 'ILLUSTRATIVE_FIXED_PHASE';
  };
  bodies: DestinationBodyRecord[];
  orbits: DestinationOrbitRecord[];
  provenance: Array<{
    label: string;
    url: string;
    supports: string;
    queriedOn: string;
  }>;
};

const proximaPlanets = exoplanets.filter((planet) => planet.hostStarId === 'proxima-centauri');

export const destinationSystems: DestinationSystemRecord[] = [
  {
    id: 'proxima-centauri-destination',
    stellarSystemId: 'alpha-centauri-system',
    anchorObjectId: 'proxima-centauri',
    name: 'Proxima Centauri',
    kind: 'PLANETARY_SYSTEM',
    headline: 'Two confirmed worlds.',
    guidance: 'Select either confirmed planet in 3D. Candidate Proxima c remains deliberately excluded.',
    orientation: [.08, -.18, 0],
    arrivalStandOff: 105,
    coordinatePolicy: { scientificFrame: 'ANCHOR_RELATIVE', scientificDistanceUnit: 'AU', renderTransform: 'DESTINATION_COMPRESSED', phasePolicy: 'ILLUSTRATIVE_FIXED_PHASE' },
    bodies: [
      { id: 'proxima-centauri-host', kind: 'CATALOG_STAR', objectId: 'proxima-centauri', role: 'ANCHOR', selectable: true, render: { position: [0, 0, 0], radius: 4.5, color: '#ff8b6b', accent: '#ffb18f' } },
      ...proximaPlanets.map((planet) => ({
        id: `${planet.id}-destination-body`, kind: 'EXOPLANET' as const, objectId: planet.id, role: 'ORBITER' as const, selectable: true,
        render: { position: [Math.cos(planet.phase) * planet.renderOrbit, Math.sin(planet.phase) * Math.sin(planet.inclination * Math.PI / 180) * planet.renderOrbit, Math.sin(planet.phase) * planet.renderOrbit] as const, radius: planet.renderRadius, color: planet.color, accent: planet.accent },
      })),
    ],
    orbits: proximaPlanets.map((planet) => ({
      id: `${planet.id}-orbit`, bodyId: `${planet.id}-destination-body`,
      scientific: { semiMajorAxis: planet.semiMajorAxisAU, unit: 'AU', period: planet.orbitalPeriodDays, periodUnit: 'day', confidence: 'measured' },
      render: { radius: planet.renderOrbit, inclinationDeg: planet.inclination, phaseRad: planet.phase },
    })),
    provenance: [{ label: 'NASA Exoplanet Archive · Planetary Systems Composite Parameters', url: 'https://exoplanetarchive.ipac.caltech.edu/', supports: 'Confirmed planets and measured orbital parameters', queriedOn: '2026-08-24' }],
  },
  {
    id: 'sirius-destination',
    stellarSystemId: 'sirius-system',
    anchorObjectId: 'sirius-a',
    name: 'Sirius',
    kind: 'BINARY_STELLAR_SYSTEM',
    headline: 'A star and its stellar remnant.',
    guidance: 'Inspect Sirius B, the white-dwarf companion. The displayed orbital phase is illustrative; the measured scale and period remain labeled separately.',
    orientation: [-.16, .32, .08],
    arrivalStandOff: 116,
    coordinatePolicy: { scientificFrame: 'ANCHOR_RELATIVE', scientificDistanceUnit: 'AU', renderTransform: 'DESTINATION_COMPRESSED', phasePolicy: 'ILLUSTRATIVE_FIXED_PHASE' },
    bodies: [
      { id: 'sirius-a-host', kind: 'CATALOG_STAR', objectId: 'sirius-a', role: 'ANCHOR', selectable: true, render: { position: [0, 0, 0], radius: 6.2, color: '#c9dcff', accent: '#edf5ff' } },
      { id: 'sirius-b-companion', kind: 'WHITE_DWARF', objectId: 'sirius-b', role: 'COMPANION', selectable: true, render: { position: [25.5, 5.2, 22.1], radius: 1.05, color: '#e6f0ff', accent: '#ffffff' } },
    ],
    orbits: [{
      id: 'sirius-relative-orbit', bodyId: 'sirius-b-companion',
      scientific: { semiMajorAxis: 19.7, unit: 'AU', period: 50, periodUnit: 'year', confidence: 'measured' },
      render: { radius: 34, inclinationDeg: 49, phaseRad: .72 },
    }],
    provenance: [
      { label: 'NASA Hubble · The Dog Star, Sirius, and its Tiny Companion', url: 'https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/', supports: 'Sirius B classification, approximately 50-year period, and 19.7 AU relative semimajor axis', queriedOn: '2026-08-24' },
      { label: 'USNO · Sixth Catalog of Orbits of Visual Binary Stars', url: 'https://crf.usno.navy.mil/data_products/WDS/orb6/orb6.html', supports: 'Authoritative visual-binary orbit catalog and orbital-element conventions', queriedOn: '2026-08-24' },
    ],
  },
];

for (const anchor of localStellarObjects.filter(object => object.id !== 'sol')) {
  if (destinationSystems.some(system => system.anchorObjectId === anchor.id)) continue;
  const planets = exoplanets.filter(planet => planet.hostStarId === anchor.id);
  const companions = stellarObjects.filter(object => object.systemId === anchor.systemId && object.id !== anchor.id && !object.renderAtLocalScale);
  const bodies: DestinationBodyRecord[] = [{ id: anchor.id + '-host', kind: anchor.objectClass === 'STAR' ? 'CATALOG_STAR' : anchor.objectClass, objectId: anchor.id, role: 'ANCHOR', selectable: true, render: { position: [0,0,0], radius: anchor.objectClass === 'WHITE_DWARF' ? .9 : anchor.objectClass === 'BROWN_DWARF' ? 2 : 4.5, color: anchor.visual.color, accent: anchor.visual.color } }];
  for (const planet of planets) bodies.push({ id: planet.id + '-body', kind: 'EXOPLANET', objectId: planet.id, role: 'ORBITER', selectable: true, render: { position: [Math.cos(planet.phase)*planet.renderOrbit, Math.sin(planet.phase)*Math.sin(planet.inclination*Math.PI/180)*planet.renderOrbit, Math.sin(planet.phase)*planet.renderOrbit], radius:planet.renderRadius,color:planet.color,accent:planet.accent } });
  // Companion separations here are a schematic local layout, never invented orbital elements.
  companions.forEach((companion,index) => bodies.push({ id:companion.id+'-companion',kind:companion.objectClass === 'STAR' ? 'CATALOG_STAR' : companion.objectClass,objectId:companion.id,role:'COMPANION',selectable:true,render:{position:[27+index*21,4,-19-index*7],radius:companion.objectClass === 'WHITE_DWARF' ? .75 : companion.objectClass === 'BROWN_DWARF' ? 1.4 : 2.6,color:companion.visual.color,accent:companion.visual.color} }));
  destinationSystems.push({
    id:anchor.id+'-destination', stellarSystemId:anchor.systemId, anchorObjectId:anchor.id, name:anchor.name,
    kind:planets.length ? 'PLANETARY_SYSTEM' : companions.length ? 'MULTIPLE_STELLAR_SYSTEM' : 'SINGLE_OBJECT',
    headline:planets.length ? planets.length+' confirmed '+(planets.length === 1 ? 'world.' : 'worlds.') : companions.length ? 'A real stellar family.' : anchor.objectClass === 'WHITE_DWARF' ? 'The exposed remnant of a star.' : 'A nearby point of light, made spatial.',
    guidance:planets.length ? 'Select a confirmed world. Surface, atmosphere, orbital plane and phase are unknown or illustrative.' : companions.length ? 'Select a companion. The system layout is schematic; no orbital solution is implied.' : 'No confirmed planetary geometry is included in this curated snapshot. Absence here is not proof that planets do not exist.',
    orientation:[.08,.2,0],arrivalStandOff:Math.max(85,planets.length*18+30),
    coordinatePolicy:{scientificFrame:'ANCHOR_RELATIVE',scientificDistanceUnit:'AU',renderTransform:'DESTINATION_COMPRESSED',phasePolicy:'ILLUSTRATIVE_FIXED_PHASE'},bodies,
    orbits:planets.map(planet=>({id:planet.id+'-orbit',bodyId:planet.id+'-body',scientific:{semiMajorAxis:planet.semiMajorAxisAU,unit:'AU',period:planet.orbitalPeriodDays,periodUnit:'day',confidence:'measured'},render:{radius:planet.renderOrbit,inclinationDeg:planet.inclination,phaseRad:planet.phase}})),
    provenance:[{label:anchor.astrometry?.sourceLabel ?? 'SIMBAD',url:anchor.astrometry?.sourceUrl ?? 'https://simbad.cds.unistra.fr/',supports:'Catalog identity, position and spectral class; companion visual layout is illustrative',queriedOn:'2026-10-23'},...(planets.length ? [{label:'NASA Exoplanet Archive PSCompPars',url:'https://exoplanetarchive.ipac.caltech.edu/',supports:'Noncontroversial confirmed-planet rows and orbital parameters',queriedOn:'2026-10-23'}] : [])],
  });
}

export function getDestinationSystemByAnchor(anchorObjectId: string | null) {
  return destinationSystems.find((system) => system.anchorObjectId === anchorObjectId);
}

export function getDestinationSystem(id: string) {
  return destinationSystems.find((system) => system.id === id);
}

export function getDestinationBody(objectId: string) {
  for (const system of destinationSystems) {
    const body = system.bodies.find((candidate) => candidate.objectId === objectId);
    if (body) return { system, body };
  }
  return undefined;
}

export function validateDestinationReferences() {
  return destinationSystems.every((destination) => {
    const system = getStellarSystem(destination.stellarSystemId);
    const anchor = getStellarObject(destination.anchorObjectId);
    return Boolean(system && anchor && destination.bodies.every((body) => body.kind === 'EXOPLANET' ? exoplanets.some((planet) => planet.id === body.objectId) : Boolean(getStellarObject(body.objectId))));
  });
}
