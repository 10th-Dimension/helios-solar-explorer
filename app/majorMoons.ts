/** Rounded agency summaries, not osculating elements or live ephemerides. */
export const majorMoons = [
  {
    id: 'moon',
    name: 'Moon',
    parent: 'earth',
    radiusKm: 1740,
    distanceKm: 384400,
    periodDays: 27,
    evidence:
      'Measured, rounded NASA summary. Synchronous rotation; orbital and phase-cycle periods differ.',
    source: 'https://science.nasa.gov/moon/facts/',
    retrieved: '2026-11-03',
  },
  {
    id: 'europa',
    name: 'Europa',
    parent: 'jupiter',
    radiusKm: 1550,
    distanceKm: 671000,
    periodDays: 3.5,
    evidence:
      'Radius calculated from NASA’s rounded 3,100 km equatorial diameter. Icy surface observed; a subsurface saltwater ocean is inferred.',
    source:
      'https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/',
    retrieved: '2026-11-03',
  },
  {
    id: 'titan',
    name: 'Titan',
    parent: 'saturn',
    radiusKm: 2575,
    distanceKm: 1200000,
    periodDays: 15 + 22 / 24,
    evidence:
      'Rounded NASA summary. Dense atmosphere and surface methane/ethane liquids; a subsurface ocean is inferred.',
    source: 'https://science.nasa.gov/saturn/moons/titan/facts/',
    retrieved: '2026-11-03',
  },
  {
    id: 'enceladus',
    name: 'Enceladus',
    parent: 'saturn',
    radiusKm: 250,
    distanceKm: 238000,
    periodDays: 32.9 / 24,
    evidence:
      'Radius calculated as half NASA’s rounded 500 km diameter. Plumes are observed; a global subsurface ocean is inferred.',
    source: 'https://science.nasa.gov/saturn/moons/enceladus/',
    retrieved: '2026-11-03',
  },
] as const;
export function moonSizeRatio(
  first: (typeof majorMoons)[number],
  second: (typeof majorMoons)[number],
) {
  return first.radiusKm === null || second.radiusKm === null
    ? null
    : first.radiusKm / second.radiusKm;
}
