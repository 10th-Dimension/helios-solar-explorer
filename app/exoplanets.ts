import { exoplanetExpansion } from './exoplanetExpansion.ts';
import type { Confidence } from './worlds';

export type ExoplanetRecord = {
  id: string;
  name: string;
  hostStarId: string;
  status: 'CONFIRMED';
  discoveryMethod: 'Radial Velocity';
  discoveryYear: number;
  orbitalPeriodDays: number;
  semiMajorAxisAU: number;
  minimumMassEarth: number | null;
  massEarth?: number;
  massProvenance?: 'MINIMUM_MASS' | 'MASS';
  radiusEarth: number;
  radiusConfidence: Extract<Confidence, 'inferred'>;
  equilibriumTemperatureK: number | null;
  temperatureConfidence: Extract<Confidence, 'inferred'>;
  renderOrbit: number;
  renderRadius: number;
  phase: number;
  inclination: number;
  color: string;
  accent: string;
  likelyClass: string;
  appearanceConfidence: Extract<Confidence, 'illustrative'>;
  visualNote: string;
  provenance: {
    catalog: 'NASA Exoplanet Archive';
    table: 'Planetary Systems Composite Parameters (PSCompPars)';
    queriedOn: string;
    sourceUrl: string;
  };
};

const archiveOverview = 'https://exoplanetarchive.ipac.caltech.edu/overview/Proxima';

// The archive's current PSCompPars table returns only these two confirmed planets for
// hostname `Proxima Cen`. Proxima c is deliberately absent; it remains a candidate.
export const exoplanets: ExoplanetRecord[] = [
  {
    id: 'proxima-centauri-d',
    name: 'Proxima Centauri d',
    hostStarId: 'proxima-centauri',
    status: 'CONFIRMED',
    discoveryMethod: 'Radial Velocity',
    discoveryYear: 2025,
    orbitalPeriodDays: 5.12338,
    semiMajorAxisAU: .02881,
    minimumMassEarth: .26,
    radiusEarth: .692,
    radiusConfidence: 'inferred',
    equilibriumTemperatureK: 282,
    temperatureConfidence: 'inferred',
    renderOrbit: 17,
    renderRadius: .72,
    phase: 1.14,
    inclination: 2.1,
    color: '#8e6a59',
    accent: '#d9a57f',
    likelyClass: 'Sub-Earth mass planet · likely rocky',
    appearanceConfidence: 'illustrative',
    visualNote: 'No direct image or measured surface exists. Helios renders a constrained rocky interpretation from minimum mass, modeled radius, irradiation, and orbital context.',
    provenance: { catalog: 'NASA Exoplanet Archive', table: 'Planetary Systems Composite Parameters (PSCompPars)', queriedOn: '2026-08-23', sourceUrl: archiveOverview },
  },
  {
    id: 'proxima-centauri-b',
    name: 'Proxima Centauri b',
    hostStarId: 'proxima-centauri',
    status: 'CONFIRMED',
    discoveryMethod: 'Radial Velocity',
    discoveryYear: 2016,
    orbitalPeriodDays: 11.18465,
    semiMajorAxisAU: .04848,
    minimumMassEarth: 1.055,
    radiusEarth: 1.02,
    radiusConfidence: 'inferred',
    equilibriumTemperatureK: 218,
    temperatureConfidence: 'inferred',
    renderOrbit: 27,
    renderRadius: 1.08,
    phase: 4.26,
    inclination: -.8,
    color: '#596b62',
    accent: '#a4b9a5',
    likelyClass: 'Earth-mass planet · likely rocky',
    appearanceConfidence: 'illustrative',
    visualNote: 'No direct image, measured atmosphere, continents, oceans, or surface color exist. Helios renders a deliberately ambiguous rocky interpretation.',
    provenance: { catalog: 'NASA Exoplanet Archive', table: 'Planetary Systems Composite Parameters (PSCompPars)', queriedOn: '2026-08-23', sourceUrl: archiveOverview },
  },
];

exoplanets.push(...exoplanetExpansion.map(planet => ({ ...planet })));

export function exoplanetsForHost(hostStarId: string) {
  return exoplanets.filter((planet) => planet.hostStarId === hostStarId);
}

export function getExoplanet(id: string) {
  return exoplanets.find((planet) => planet.id === id);
}

