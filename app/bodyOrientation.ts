/**
 * Frozen IAU J2000 body poles, not a current-date attitude ephemeris.
 * Values evaluate NASA/JPL NAIF pck00011.tpc at T=d=0, INCLUDING periodic
 * pole terms for Mars, Jupiter and Neptune. Rotation uses the signed secular
 * prime-meridian rate Wdot from that kernel; libration is intentionally omitted.
 *
 * Frame boundary: the Solar System overview's XZ plane represents the mean
 * J2000 ecliptic, with +Y its north pole and +X the J2000 equinox. This helper
 * first rotates ICRS equatorial coordinates into that ecliptic and then uses
 * the right-handed Three.js mapping [Xecl, Zecl, -Yecl]. Nearby-star ICRS
 * navigation coordinates have their own render transform and must NOT use
 * this body-attitude helper or inherit these pole rotations.
 *
 * Put the planet surface, its clouds, equatorial ring and aurora geometry
 * inside a group oriented from local +Y to northPoleRender. Rotate their local
 * Y angle by visualRadiansPerSecond * elapsed. DO NOT also apply the quoted
 * obliquityDeg: that is an informational angle relative to each body's own
 * orbital normal; northPoleRender already encodes the full ecliptic attitude.
 *
 * Venus and Uranus retain IAU north poles and NEGATIVE spin. Flipping their
 * axes to the angular-momentum south poles and also using negative spin would
 * reverse them twice. A ring's plane is unchanged by the pole-sign choice.
 */
export type OrientedBodyId = 'sun' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
export type Vector3Tuple = readonly [number, number, number];

export const BODY_ORIENTATION_SOURCE = 'https://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/pck00011.tpc';
export const BODY_OBLIQUITY_SOURCE = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/';
export const J2000_OBLIQUITY_DEG = 23.439291111;
// Shared 1080x spin time compression; model time advances 0.3 h per real second.
// It preserves relative periods and direction, but is not tied to orbital phase.
export const BODY_SPIN_TIME_ACCELERATION = 1080;

export interface BodyOrientation {
  id: OrientedBodyId;
  epoch: 'J2000.0';
  poleRA: number;
  poleDec: number;
  /** Signed hours around the IAU north pole; derived from secular Wdot. */
  siderealHours: number;
  /** Informational spin obliquity TO THE BODY'S OWN ORBIT, not an Euler angle. */
  obliquityDeg: number;
  northPoleRender: Vector3Tuple;
  visualRadiansPerSecond: number;
  source: string;
  obliquitySource: string;
}

/** ICRS RA/Dec degrees -> mean J2000 ecliptic -> right-handed +Y-up tuple. */
export function icrsPoleToEclipticRender(poleRA: number, poleDec: number): Vector3Tuple {
  const rad = Math.PI / 180;
  const ra = poleRA * rad;
  const dec = poleDec * rad;
  const eps = J2000_OBLIQUITY_DEG * rad;
  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.cos(dec) * Math.sin(ra);
  const z = Math.sin(dec);
  return [x, -Math.sin(eps) * y + Math.cos(eps) * z, -Math.cos(eps) * y - Math.sin(eps) * z];
}

function record(id: OrientedBodyId, poleRA: number, poleDec: number, wDegreesPerDay: number, obliquityDeg: number): BodyOrientation {
  const siderealHours = 8640 / wDegreesPerDay;
  return {
    id, epoch: 'J2000.0', poleRA, poleDec, siderealHours, obliquityDeg,
    northPoleRender: icrsPoleToEclipticRender(poleRA, poleDec),
    visualRadiansPerSecond: Math.PI * 2 / (siderealHours * 3600) * BODY_SPIN_TIME_ACCELERATION,
    source: BODY_ORIENTATION_SOURCE,
    obliquitySource: id === 'sun' ? BODY_ORIENTATION_SOURCE : BODY_OBLIQUITY_SOURCE,
  };
}

export const BODY_ORIENTATIONS: Readonly<Record<OrientedBodyId, BodyOrientation>> = {
  // Sun obliquity is to the ecliptic; Sun has no heliocentric orbital plane.
  sun: record('sun', 286.13, 63.87, 14.1844, 7.251726806),
  mercury: record('mercury', 281.0103, 61.4155, 6.1385108, 0.034),
  venus: record('venus', 272.76, 67.16, -1.4813688, 177.4),
  earth: record('earth', 0, 90, 360.9856235, J2000_OBLIQUITY_DEG),
  mars: record('mars', 317.680854407, 52.886439275, 350.891982443297, 25.2),
  jupiter: record('jupiter', 268.057204043, 64.495809953, 870.536, 3.1),
  saturn: record('saturn', 40.589, 83.537, 810.7939024, 26.7),
  uranus: record('uranus', 257.311, -15.175, -501.1600928, 97.8),
  neptune: record('neptune', 299.333738959, 42.950359022, 541.1397757, 28.3),
};

export function getBodyOrientation(id: string): BodyOrientation | undefined {
  return BODY_ORIENTATIONS[id as OrientedBodyId];
}
