import { nearbyCatalog, baselineMotion } from './nearbyCatalog.ts';
import type { Confidence } from './worlds';

export type CosmicObjectClass =
  | 'STAR_SYSTEM'
  | 'STAR'
  | 'PLANET'
  | 'MOON'
  | 'DWARF_PLANET'
  | 'BROWN_DWARF'
  | 'WHITE_DWARF'
  | 'NEUTRON_STAR'
  | 'BLACK_HOLE'
  | 'NEBULA'
  | 'CLUSTER';

export type StellarSystemArchitecture = 'single' | 'binary' | 'multiple';

export type StellarSystemRecord = {
  id: string;
  name: string;
  objectClass: 'STAR_SYSTEM';
  architecture: StellarSystemArchitecture;
  memberIds: string[];
  primaryId: string;
};

export type StellarAstrometry = {
  frame: 'ICRS';
  coordinateEpoch: 'J2000.0';
  rightAscensionDeg: number;
  declinationDeg: number;
  parallaxMas: number;
  positionConfidence: Extract<Confidence, 'measured'>;
  sourceLabel: string;
  sourceUrl: string;
  queriedOn: string;
  properMotionRaCosDecMasYr?: number | null;
  properMotionDecMasYr?: number | null;
  radialVelocityKmS?: number | null;
  motionSourceUrl?: string;
  motionQueriedOn?: string;
};

export const STELLAR_EPOCH_POLICY = {
  frame: 'ICRS',
  referenceEpoch: 'J2000.0',
  positionMode: 'LINEAR_SPACE_MOTION',
  displayEpoch: 2026.81,
  properMotionMode: 'TANGENT_VECTOR_PROPAGATION',
  radialVelocityMode: 'USE_WHEN_AVAILABLE_OTHERWISE_ZERO',
  explanation: 'ICRS J2000 catalog positions propagate to fixed Julian epoch 2026.81 using tangent proper motion and radial velocity when available. Missing radial velocity is held at zero, missing proper motion is held at reference direction. Binary orbital accelerations and uncertainties are not propagated; this is a local linear model, not an ephemeris.',
} as const;

export type StellarObjectRecord = {
  id: string;
  systemId: string;
  objectClass: 'STAR' | 'WHITE_DWARF' | 'BROWN_DWARF';
  name: string;
  designation: string;
  spectralType: string;
  stellarType: string;
  astrometry: StellarAstrometry | null;
  renderAtLocalScale: boolean;
  visual: {
    color: string;
    coreScale: number;
    glowScale: number;
    appearanceConfidence: Extract<Confidence, 'illustrative'>;
  };
};

export type ScientificStellarPosition = {
  frame: 'ICRS_HELIOCENTRIC_CARTESIAN';
  unit: 'light-year';
  x: number;
  y: number;
  z: number;
};

export type StellarRenderPosition = {
  transform: 'local-stellar-compressed-v1';
  unit: 'helios-render-unit';
  x: number;
  y: number;
  z: number;
};

export const PARSEC_TO_LIGHT_YEARS = 3.26156;
export const STELLAR_RENDER_UNITS_PER_LIGHT_YEAR = 148;

const simbad = (identifier: string) =>
  `https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=${encodeURIComponent(identifier)}`;

export const stellarSystems: StellarSystemRecord[] = [
  { id: 'sol-system', name: 'Solar System', objectClass: 'STAR_SYSTEM', architecture: 'single', memberIds: ['sol'], primaryId: 'sol' },
  { id: 'alpha-centauri-system', name: 'Alpha Centauri system', objectClass: 'STAR_SYSTEM', architecture: 'multiple', memberIds: ['alpha-centauri-a', 'alpha-centauri-b', 'proxima-centauri'], primaryId: 'alpha-centauri-a' },
  { id: 'barnards-star-system', name: "Barnard's Star system", objectClass: 'STAR_SYSTEM', architecture: 'single', memberIds: ['barnards-star'], primaryId: 'barnards-star' },
  { id: 'wolf-359-system', name: 'Wolf 359 system', objectClass: 'STAR_SYSTEM', architecture: 'single', memberIds: ['wolf-359'], primaryId: 'wolf-359' },
  { id: 'lalande-21185-system', name: 'Lalande 21185 system', objectClass: 'STAR_SYSTEM', architecture: 'single', memberIds: ['lalande-21185'], primaryId: 'lalande-21185' },
  { id: 'sirius-system', name: 'Sirius system', objectClass: 'STAR_SYSTEM', architecture: 'binary', memberIds: ['sirius-a', 'sirius-b'], primaryId: 'sirius-a' },
];

export const stellarObjects: StellarObjectRecord[] = [
  {
    id: 'sol', systemId: 'sol-system', objectClass: 'STAR', name: 'Home [Our Sun]', designation: 'Sol · The Sun', spectralType: 'G2V', stellarType: 'G-type main-sequence star', astrometry: null, renderAtLocalScale: true,
    visual: { color: '#ffd38c', coreScale: 1, glowScale: 1, appearanceConfidence: 'illustrative' },
  },
  {
    id: 'alpha-centauri-a', systemId: 'alpha-centauri-system', objectClass: 'STAR', name: 'Alpha Centauri A', designation: 'α Centauri A', spectralType: 'G2V', stellarType: 'G-type main-sequence star',
    astrometry: { frame: 'ICRS', coordinateEpoch: 'J2000.0', rightAscensionDeg: 219.90205833170774, declinationDeg: -60.83399268831004, parallaxMas: 742.12, positionConfidence: 'measured', sourceLabel: 'SIMBAD basic data · α Centauri A', sourceUrl: simbad('* alf Cen A'), queriedOn: '2026-08-23' },
    renderAtLocalScale: true,
    visual: { color: '#fff1c7', coreScale: 1.12, glowScale: 1.12, appearanceConfidence: 'illustrative' },
  },
  {
    id: 'alpha-centauri-b', systemId: 'alpha-centauri-system', objectClass: 'STAR', name: 'Alpha Centauri B', designation: 'α Centauri B', spectralType: 'K1V', stellarType: 'K-type main-sequence star',
    astrometry: { frame: 'ICRS', coordinateEpoch: 'J2000.0', rightAscensionDeg: 219.89609628987276, declinationDeg: -60.83752756558407, parallaxMas: 742.12, positionConfidence: 'measured', sourceLabel: 'SIMBAD basic data · α Centauri B', sourceUrl: simbad('* alf Cen B'), queriedOn: '2026-08-23' },
    renderAtLocalScale: false,
    visual: { color: '#ffd39b', coreScale: .88, glowScale: .9, appearanceConfidence: 'illustrative' },
  },
  {
    id: 'proxima-centauri', systemId: 'alpha-centauri-system', objectClass: 'STAR', name: 'Proxima Centauri', designation: 'α Centauri C · GJ 551', spectralType: 'M5.5Ve', stellarType: 'M-type red dwarf',
    astrometry: { frame: 'ICRS', coordinateEpoch: 'J2000.0', rightAscensionDeg: 217.42894222160578, declinationDeg: -62.67949018907555, parallaxMas: 768.0665, positionConfidence: 'measured', sourceLabel: 'SIMBAD basic data · Proxima Centauri · Gaia DR3 5853498713190525696', sourceUrl: simbad('Proxima Centauri'), queriedOn: '2026-08-23' },
    renderAtLocalScale: true,
    visual: { color: '#ff8b6b', coreScale: .72, glowScale: .82, appearanceConfidence: 'illustrative' },
  },
  {
    id: 'barnards-star', systemId: 'barnards-star-system', objectClass: 'STAR', name: "Barnard's Star", designation: 'GJ 699', spectralType: 'M4V', stellarType: 'M-type red dwarf',
    astrometry: { frame: 'ICRS', coordinateEpoch: 'J2000.0', rightAscensionDeg: 269.4520769586187, declinationDeg: 4.693364966576667, parallaxMas: 546.9759, positionConfidence: 'measured', sourceLabel: "SIMBAD basic data · Barnard's Star · Gaia DR3 4472832130942575872", sourceUrl: simbad("Barnard's Star"), queriedOn: '2026-08-23' },
    renderAtLocalScale: true,
    visual: { color: '#ff9875', coreScale: .76, glowScale: .86, appearanceConfidence: 'illustrative' },
  },
  {
    id: 'wolf-359', systemId: 'wolf-359-system', objectClass: 'STAR', name: 'Wolf 359', designation: 'GJ 406 · CN Leonis', spectralType: 'dM6', stellarType: 'M-type red dwarf',
    astrometry: { frame: 'ICRS', coordinateEpoch: 'J2000.0', rightAscensionDeg: 164.1205036259475, declinationDeg: 7.014723134801666, parallaxMas: 415.1794, positionConfidence: 'measured', sourceLabel: 'SIMBAD basic data · Wolf 359 · Gaia DR3 3864972938605115520', sourceUrl: simbad('Wolf 359'), queriedOn: '2026-08-23' },
    renderAtLocalScale: true,
    visual: { color: '#ff8069', coreScale: .66, glowScale: .78, appearanceConfidence: 'illustrative' },
  },
  {
    id: 'lalande-21185', systemId: 'lalande-21185-system', objectClass: 'STAR', name: 'Lalande 21185', designation: 'GJ 411 · HD 95735', spectralType: 'M2+V', stellarType: 'M-type red dwarf',
    astrometry: { frame: 'ICRS', coordinateEpoch: 'J2000.0', rightAscensionDeg: 165.8341450816425, declinationDeg: 35.96988227279361, parallaxMas: 392.7529, positionConfidence: 'measured', sourceLabel: 'SIMBAD basic data · Lalande 21185 · Gaia DR3 762815470562110464', sourceUrl: simbad('Lalande 21185'), queriedOn: '2026-08-23' },
    renderAtLocalScale: true,
    visual: { color: '#ffa17c', coreScale: .82, glowScale: .9, appearanceConfidence: 'illustrative' },
  },
  {
    id: 'sirius-a', systemId: 'sirius-system', objectClass: 'STAR', name: 'Sirius A', designation: 'α Canis Majoris A', spectralType: 'A0mA1Va', stellarType: 'A-type main-sequence star',
    astrometry: { frame: 'ICRS', coordinateEpoch: 'J2000.0', rightAscensionDeg: 101.28715533333335, declinationDeg: -16.71611586111111, parallaxMas: 379.21, positionConfidence: 'measured', sourceLabel: 'SIMBAD basic data · Sirius A', sourceUrl: simbad('Sirius'), queriedOn: '2026-08-23' },
    renderAtLocalScale: true,
    visual: { color: '#c9dcff', coreScale: 1.45, glowScale: 1.42, appearanceConfidence: 'illustrative' },
  },
  {
    id: 'sirius-b', systemId: 'sirius-system', objectClass: 'WHITE_DWARF', name: 'Sirius B', designation: 'α Canis Majoris B', spectralType: 'DA1.9', stellarType: 'White dwarf stellar remnant',
    astrometry: { frame: 'ICRS', coordinateEpoch: 'J2000.0', rightAscensionDeg: 101.28876746876543, declinationDeg: -16.716867983351943, parallaxMas: 374.4896, positionConfidence: 'measured', sourceLabel: 'SIMBAD basic data · Sirius B', sourceUrl: simbad('* alf CMa B'), queriedOn: '2026-08-23' },
    renderAtLocalScale: false,
    visual: { color: '#dce9ff', coreScale: .35, glowScale: .62, appearanceConfidence: 'illustrative' },
  },
];

// Preserve the original scientific records; supplement their motion from the cited snapshot.
for (const object of stellarObjects) {
  const motion = baselineMotion[object.id as keyof typeof baselineMotion];
  if (object.astrometry && motion) Object.assign(object.astrometry, {
    properMotionRaCosDecMasYr: motion.properMotionRaCosDecMasYr,
    properMotionDecMasYr: motion.properMotionDecMasYr,
    radialVelocityKmS: motion.radialVelocityKmS,
    motionSourceUrl: motion.sourceUrl, motionQueriedOn: motion.queriedOn,
  });
}
for (const row of nearbyCatalog) {
  const spectral = row.spectralType.replace(/^[a-z]+/, '');
  const white = row.objectClass === 'WHITE_DWARF';
  const brown = row.objectClass === 'BROWN_DWARF';
  stellarObjects.push({ ...row, visual: {
    color: white ? '#dbe6f3' : brown ? '#a9695d' : spectral.startsWith('M') ? '#ffac8b' : spectral.startsWith('K') ? '#ffe0ad' : spectral.startsWith('G') ? '#fff4d9' : '#d6e6ff',
    coreScale: white ? .38 : brown ? .38 : spectral.startsWith('M') ? .65 : 1.05,
    glowScale: white ? .48 : brown ? .45 : .85, appearanceConfidence: 'illustrative',
  } });
}
for (const row of nearbyCatalog) {
  if (stellarSystems.some(system => system.id === row.systemId)) continue;
  const members = stellarObjects.filter(object => object.systemId === row.systemId);
  const primary = members.find(object => object.renderAtLocalScale) ?? members[0];
  const unresolved = nearbyCatalog.some(member => member.systemId === row.systemId && member.componentPolicy === 'UNRESOLVED_SOURCE_ANCHOR');
  stellarSystems.push({ id: row.systemId, name: primary.name + ' system', objectClass: 'STAR_SYSTEM', architecture: members.length > 2 || (members.length > 1 && unresolved) ? 'multiple' : members.length === 2 || unresolved ? 'binary' : 'single', primaryId: primary.id, memberIds: members.map(member => member.id) });
}

export function distanceLightYears(object: StellarObjectRecord) {
  if (!object.astrometry) return 0;
  return PARSEC_TO_LIGHT_YEARS * (1000 / object.astrometry.parallaxMas);
}

// Scientific frame: heliocentric ICRS Cartesian coordinates in light-years.
// +X points to RA 0h / Dec 0°, +Y to RA 6h / Dec 0°, and +Z to the north celestial pole.
export function toScientificStellarPosition(object: StellarObjectRecord): ScientificStellarPosition {
  if (!object.astrometry) return { frame: 'ICRS_HELIOCENTRIC_CARTESIAN', unit: 'light-year', x: 0, y: 0, z: 0 };
  const distance = distanceLightYears(object);
  const rightAscension = object.astrometry.rightAscensionDeg * Math.PI / 180;
  const declination = object.astrometry.declinationDeg * Math.PI / 180;
  const cosDeclination = Math.cos(declination);
  return {
    frame: 'ICRS_HELIOCENTRIC_CARTESIAN',
    unit: 'light-year',
    x: distance * cosDeclination * Math.cos(rightAscension),
    y: distance * cosDeclination * Math.sin(rightAscension),
    z: distance * Math.sin(declination),
  };
}

// A derived scientific position at a reproducible display epoch. Source coordinates are never overwritten.
export function propagatedStellarPosition(object: StellarObjectRecord, epoch = STELLAR_EPOCH_POLICY.displayEpoch): ScientificStellarPosition {
  const p = toScientificStellarPosition(object);
  const a = object.astrometry;
  if (!a) return p;
  const years = epoch - 2000;
  const ra = a.rightAscensionDeg * Math.PI / 180, dec = a.declinationDeg * Math.PI / 180;
  const radiansPerMas = Math.PI / (180 * 3600000);
  const distance = distanceLightYears(object);
  const pmRa = (a.properMotionRaCosDecMasYr ?? 0) * radiansPerMas;
  const pmDec = (a.properMotionDecMasYr ?? 0) * radiansPerMas;
  const rv = (a.radialVelocityKmS ?? 0) * 31557600 / 9.4607304725808e12;
  const radial = [Math.cos(dec)*Math.cos(ra), Math.cos(dec)*Math.sin(ra), Math.sin(dec)];
  const east = [-Math.sin(ra), Math.cos(ra), 0];
  const north = [-Math.sin(dec)*Math.cos(ra), -Math.sin(dec)*Math.sin(ra), Math.cos(dec)];
  const velocity = radial.map((v, i) => v*rv + distance*(east[i]*pmRa+north[i]*pmDec));
  return { ...p, x:p.x+velocity[0]*years, y:p.y+velocity[1]*years, z:p.z+velocity[2]*years };
}

// Local atlas remains a right-handed ICRS frame. Body attitudes use their separately documented ecliptic frame.
export function toStellarRenderPosition(object: StellarObjectRecord): StellarRenderPosition {
  const scientific = propagatedStellarPosition(object);
  return { transform: 'local-stellar-compressed-v1', unit: 'helios-render-unit',
    x: scientific.x * STELLAR_RENDER_UNITS_PER_LIGHT_YEAR,
    y: scientific.z * STELLAR_RENDER_UNITS_PER_LIGHT_YEAR,
    z: -scientific.y * STELLAR_RENDER_UNITS_PER_LIGHT_YEAR };
}

export function separationLightYears(fromId: string | null, toId: string) {
  const to = getStellarObject(toId);
  if (!to) return 0;
  const destination = propagatedStellarPosition(to);
  if (!fromId || fromId === 'sol') return Math.hypot(destination.x, destination.y, destination.z);
  const from = getStellarObject(fromId);
  if (!from) return Math.hypot(destination.x, destination.y, destination.z);
  const origin = propagatedStellarPosition(from);
  return Math.hypot(destination.x - origin.x, destination.y - origin.y, destination.z - origin.z);
}

export function getStellarObject(id: string) {
  return stellarObjects.find((object) => object.id === id);
}

export function getStellarSystem(id: string) {
  return stellarSystems.find((system) => system.id === id);
}

export const localStellarObjects = stellarObjects.filter((object) => object.renderAtLocalScale);
