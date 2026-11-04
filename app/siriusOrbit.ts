/** Bond et al. 2017, Tables 2/4. Relative B−A, J2000 north/east sky plane. */
export const SIRIUS_FIT = {
  period: 50.1284,
  semiMajorArcsec: 7.4957,
  inclinationDeg: 136.336,
  nodeDeg: 45.4,
  periastronYear: 1994.5715,
  eccentricity: 0.59142,
  periastronDeg: 149.161,
  errors: {
    period: 0.0043,
    semiMajorArcsec: 0.0025,
    inclinationDeg: 0.04,
    nodeDeg: 0.071,
    periastronYear: 0.0058,
    eccentricity: 0.00037,
    periastronDeg: 0.075,
  },
  source: 'https://arxiv.org/html/1703.10625v1',
  frame: 'J2000 north/east',
  epochConvention: 'Besselian year',
  covariance: null,
} as const;
/** Definitions matching ERFA/SOFA epb: epoch labels, not a UTC→TT conversion. */
export function julianToBesselianEpoch(julianYear: number) {
  if (!Number.isFinite(julianYear))
    throw new Error('Finite Julian epoch required');
  const jd = 2451545 + (julianYear - 2000) * 365.25;
  return 1900 + (jd - 2415020.31352) / 365.242198781;
}
export function siriusRelativeAtBesselianEpoch(year: number) {
  if (!Number.isFinite(year) || year < 1800 || year > 2200)
    throw new Error('Sirius fit display limited to Besselian years 1800–2200');
  const f = SIRIUS_FIT,
    rad = Math.PI / 180;
  const mean = (((year - f.periastronYear) / f.period) % 1) * 2 * Math.PI;
  let E = mean;
  for (let n = 0; n < 24; n++) {
    const d =
      (E - f.eccentricity * Math.sin(E) - mean) /
      (1 - f.eccentricity * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-13) break;
  }
  const x = Math.cos(E) - f.eccentricity,
    y = Math.sqrt(1 - f.eccentricity * f.eccentricity) * Math.sin(E);
  const O = f.nodeDeg * rad,
    w = f.periastronDeg * rad,
    i = f.inclinationDeg * rad;
  const north =
    f.semiMajorArcsec *
    ((Math.cos(O) * Math.cos(w) - Math.sin(O) * Math.sin(w) * Math.cos(i)) * x +
      (-Math.cos(O) * Math.sin(w) - Math.sin(O) * Math.cos(w) * Math.cos(i)) *
        y);
  const east =
    f.semiMajorArcsec *
    ((Math.sin(O) * Math.cos(w) + Math.cos(O) * Math.sin(w) * Math.cos(i)) * x +
      (-Math.sin(O) * Math.sin(w) + Math.cos(O) * Math.cos(w) * Math.cos(i)) *
        y);
  return {
    northArcsec: north,
    eastArcsec: east,
    separationArcsec: Math.hypot(north, east),
    positionAngleDeg: (Math.atan2(east, north) / rad + 360) % 360,
  };
}
/** A projected fit in the actual ICRS tangent plane, NOT an invented 3D depth/barycenter. */
export function siriusRenderPosition(
  julianEpoch: number,
): [number, number, number] {
  const p = siriusRelativeAtBesselianEpoch(julianToBesselianEpoch(julianEpoch));
  const ra = (101.28715533333335 * Math.PI) / 180,
    dec = (-16.71611586111111 * Math.PI) / 180,
    s = 34 / SIRIUS_FIT.semiMajorArcsec;
  return [
    s *
      (-Math.sin(ra) * p.eastArcsec -
        Math.sin(dec) * Math.cos(ra) * p.northArcsec),
    s * Math.cos(dec) * p.northArcsec,
    s *
      (-Math.cos(ra) * p.eastArcsec +
        Math.sin(dec) * Math.sin(ra) * p.northArcsec),
  ];
}
