export type EntityKind = 'star' | 'planet' | 'moon' | 'dwarf-planet';

export type SpatialEntity = {
  id: string;
  kind: EntityKind;
  parentSystem: string;
  hostStar?: string;
  actualOrbitAU: number;
  renderOrbit: number;
  renderRadius: number;
  phase: number;
  inclination: number;
  confirmed: boolean;
};

export type StarSystem = {
  id: string;
  name: string;
  coordinateDomain: 'planetary' | 'system' | 'stellar';
  visualizationTransform: 'compressed-system-v1';
  entities: SpatialEntity[];
};

// Scientific values and transformed render coordinates remain deliberately separate.
// `actualOrbitAU` is informational truth; `renderOrbit` is a navigation coordinate.
export const solarSystem: StarSystem = {
  id: 'sol',
  name: 'Solar System',
  coordinateDomain: 'system',
  visualizationTransform: 'compressed-system-v1',
  entities: [
    { id: 'sun', kind: 'star', parentSystem: 'sol', actualOrbitAU: 0, renderOrbit: 0, renderRadius: 6, phase: 0, inclination: 0, confirmed: true },
    { id: 'mercury', kind: 'planet', parentSystem: 'sol', hostStar: 'sun', actualOrbitAU: .387, renderOrbit: 12, renderRadius: 1.1, phase: .25, inclination: 7, confirmed: true },
    { id: 'venus', kind: 'planet', parentSystem: 'sol', hostStar: 'sun', actualOrbitAU: .723, renderOrbit: 17, renderRadius: 1.55, phase: 1.5, inclination: 3.4, confirmed: true },
    { id: 'earth', kind: 'planet', parentSystem: 'sol', hostStar: 'sun', actualOrbitAU: 1, renderOrbit: 23, renderRadius: 1.65, phase: 2.55, inclination: 0, confirmed: true },
    { id: 'mars', kind: 'planet', parentSystem: 'sol', hostStar: 'sun', actualOrbitAU: 1.524, renderOrbit: 29, renderRadius: 1.35, phase: 4.2, inclination: 1.85, confirmed: true },
    { id: 'jupiter', kind: 'planet', parentSystem: 'sol', hostStar: 'sun', actualOrbitAU: 5.203, renderOrbit: 40, renderRadius: 4.6, phase: 5.25, inclination: 1.3, confirmed: true },
    { id: 'saturn', kind: 'planet', parentSystem: 'sol', hostStar: 'sun', actualOrbitAU: 9.537, renderOrbit: 54, renderRadius: 4.1, phase: 2.15, inclination: 2.49, confirmed: true },
    { id: 'uranus', kind: 'planet', parentSystem: 'sol', hostStar: 'sun', actualOrbitAU: 19.191, renderOrbit: 69, renderRadius: 2.8, phase: 3.5, inclination: .77, confirmed: true },
    { id: 'neptune', kind: 'planet', parentSystem: 'sol', hostStar: 'sun', actualOrbitAU: 30.069, renderOrbit: 86, renderRadius: 2.75, phase: .8, inclination: 1.77, confirmed: true },
  ],
};
