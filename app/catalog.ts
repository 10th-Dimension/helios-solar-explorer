import { exoplanets } from './exoplanets.ts';
import { distanceLightYears, getStellarObject, localStellarObjects, getStellarSystem, stellarObjects } from './stellar.ts';

export type CatalogObject = {
  id: string;
  name: string;
  category: 'STAR' | 'PLANET' | 'STELLAR REMNANT' | 'BROWN DWARF';
  architecture?: string;
  hasPlanets?: boolean;
  spectralGroup?: string;
  type: string;
  designation: string;
  distanceLightYears: number;
  travelAnchorId: string;
  arrivalSelection: { kind: 'STELLAR' | 'EXOPLANET' | 'SYSTEM_OBJECT'; id: string };
  provenance: string;
};

const stellarCatalog: CatalogObject[] = localStellarObjects.map((object) => ({
  id: object.id,
  name: object.name,
  category: object.objectClass === 'WHITE_DWARF' ? 'STELLAR REMNANT' : object.objectClass === 'BROWN_DWARF' ? 'BROWN DWARF' : 'STAR',
  architecture: getStellarSystem(object.systemId)?.architecture,
  hasPlanets: exoplanets.some(planet=>planet.hostStarId === object.id),
  spectralGroup: object.spectralType.replace(/^[a-z]+/,'').slice(0,1),
  type: `${object.stellarType} · ${object.spectralType}`,
  designation: object.designation,
  distanceLightYears: distanceLightYears(object),
  travelAnchorId: object.id,
  arrivalSelection: { kind: 'STELLAR', id: object.id },
  provenance: object.astrometry?.sourceLabel ?? 'Helios solar reference frame',
}));

const exoplanetCatalog: CatalogObject[] = exoplanets.map((planet) => {
  const host = getStellarObject(planet.hostStarId)!;
  return {
    id: planet.id,
    name: planet.name,
    category: 'PLANET',
    type: `${planet.likelyClass} · ${planet.status.toLowerCase()}`,
    designation: `Orbits ${host.name} · ${planet.semiMajorAxisAU} AU`,
    distanceLightYears: distanceLightYears(host),
    travelAnchorId: host.id,
    arrivalSelection: { kind: 'EXOPLANET', id: planet.id },
    provenance: `${planet.provenance.catalog} · ${planet.provenance.table}`,
  };
});

const companions: CatalogObject[] = stellarObjects.filter(object=>!object.renderAtLocalScale).flatMap(object=>{
  const system = getStellarSystem(object.systemId);
  const anchor = system?.primaryId;
  if (!anchor) return [];
  return [{id:object.id,name:object.name,category:object.objectClass==='WHITE_DWARF'?'STELLAR REMNANT':object.objectClass==='BROWN_DWARF'?'BROWN DWARF':'STAR',type:object.stellarType+' · '+object.spectralType,designation:object.designation,distanceLightYears:distanceLightYears(object),travelAnchorId:anchor,arrivalSelection:{kind:'SYSTEM_OBJECT',id:object.id},provenance:object.astrometry?.sourceLabel??'SIMBAD',architecture:system.architecture}];
});
export const catalogObjects: CatalogObject[] = [...stellarCatalog,...companions,...exoplanetCatalog].sort((a,b)=>a.distanceLightYears-b.distanceLightYears||a.name.localeCompare(b.name));
