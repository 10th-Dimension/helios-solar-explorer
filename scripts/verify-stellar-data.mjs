import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Optional project override lets this same verification run from an external review directory.
const project = process.env.HELIOS_PROJECT_ROOT
  ? pathToFileURL(resolve(process.env.HELIOS_PROJECT_ROOT) + '/')
  : new URL('../', import.meta.url);
const moduleAt = name => import(new URL(`app/${name}.ts`, project));
const [stellar, planetsModule, destinationsModule, nearby, expansion, coordinates, labelsModule, orientation, events, quality, catalog] = await Promise.all([
  moduleAt('stellar'), moduleAt('exoplanets'), moduleAt('destinationSystems'), moduleAt('nearbyCatalog'),
  moduleAt('exoplanetExpansion'), moduleAt('cosmicCoordinates'), moduleAt('stellarLabels'),
  moduleAt('bodyOrientation'), moduleAt('astronomicalEvents'), moduleAt('graphicsQuality'), moduleAt('catalog'),
]);
const { stellarObjects, stellarSystems, localStellarObjects, distanceLightYears, toScientificStellarPosition,
  propagatedStellarPosition, toStellarRenderPosition, separationLightYears, getStellarObject,
  STELLAR_EPOCH_POLICY, STELLAR_RENDER_UNITS_PER_LIGHT_YEAR, PARSEC_TO_LIGHT_YEARS } = stellar;
const { exoplanets, exoplanetsForHost } = planetsModule;
const { destinationSystems, getDestinationSystemByAnchor, getDestinationBody, validateDestinationReferences } = destinationsModule;
const { nearbyCatalog, baselineMotion } = nearby;
const { exoplanetExpansion } = expansion;
const [simbadSnapshot, archiveSnapshot] = await Promise.all(['simbad-snapshot.json', 'archive-snapshot.json'].map(async name => JSON.parse(await readFile(new URL(`data/${name}`, project), 'utf8'))));
const finite = point => ['x','y','z'].every(axis => Number.isFinite(point[axis]));
const norm = point => Math.hypot(point.x, point.y, point.z);
const close = (actual, expected, tolerance = 1e-10, message = '') => assert(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
const closePoint = (actual, expected, tolerance = 1e-10, message = '') => {
  for (const axis of ['x','y','z']) close(actual[axis], expected[axis], tolerance, `${message} ${axis}`);
};
const normalized = value => value.replace(/\s+/g, ' ').trim();
const snapshotColumns = simbadSnapshot.result.metadata.map(column => column.name);
const sourceRows = simbadSnapshot.result.data.map(row => Object.fromEntries(snapshotColumns.map((name,index) => [name,row[index]])));
const simbadSources = new Map(sourceRows.map(row => [normalized(row.main_id), row]));
const knownIds = new Set(stellarObjects.map(object => object.id));
const sourceScience = JSON.stringify(nearbyCatalog);
const runtimeScience = JSON.stringify(stellarObjects.map(object => object.astrometry));

assert.equal(stellarObjects.length, 83, 'The curated snapshot must retain original nine plus 74 additional catalog sources.');
assert.equal(localStellarObjects.length, 65, 'The bounded atlas must render 65 local anchors, with companion source rows cataloged separately.');
assert.equal(knownIds.size, stellarObjects.length, 'Stellar IDs must be unique.');
assert.equal(new Set(stellarSystems.map(system => system.id)).size, stellarSystems.length);
assert.equal(stellarObjects.filter(object => object.objectClass === 'WHITE_DWARF').length, 5);
assert.equal(stellarObjects.filter(object => object.objectClass === 'BROWN_DWARF').length, 11);
for (const system of stellarSystems) {
  assert(system.memberIds.length > 0);
  assert(system.memberIds.includes(system.primaryId), `${system.id}: missing primary`);
  assert.equal(new Set(system.memberIds).size, system.memberIds.length);
  for (const member of system.memberIds) {
    assert(knownIds.has(member), `${system.id}: unknown member ${member}`);
    assert.equal(getStellarObject(member).systemId, system.id);
  }
}
for (const systemId of new Set(nearbyCatalog.map(object => object.systemId))) {
  assert.equal(nearbyCatalog.filter(object => object.systemId === systemId && object.renderAtLocalScale).length, 1, `${systemId}: one local anchor per added system`);
}
assert.equal(stellarSystems.find(system => system.id === 'alpha-centauri-system').architecture, 'multiple');
assert.equal(stellarSystems.find(system => system.id === 'sirius-system').architecture, 'binary');
assert.equal(stellarSystems.find(system => system.id === 'epsilon-indi-system').architecture, 'multiple', 'Epsilon Indi includes A plus unresolved Ba/Bb.');
assert.equal(stellarSystems.find(system => system.id === 'gj-229-system').architecture, 'multiple', 'GJ229 includes A plus unresolved Ba/Bb.');

// Baseline science is a regression boundary, not a replacement with a newer catalog solution.
const baselineExpected = {
  'alpha-centauri-a': [219.90205833170774,-60.83399268831004,742.12],
  'alpha-centauri-b': [219.89609628987276,-60.83752756558407,742.12],
  'proxima-centauri': [217.42894222160578,-62.67949018907555,768.0665],
  'barnards-star': [269.4520769586187,4.693364966576667,546.9759],
  'wolf-359': [164.1205036259475,7.014723134801666,415.1794],
  'lalande-21185': [165.8341450816425,35.96988227279361,392.7529],
  'sirius-a': [101.28715533333335,-16.71611586111111,379.21],
  'sirius-b': [101.28876746876543,-16.716867983351943,374.4896],
};
assert.equal(getStellarObject('sol').astrometry, null);
for (const [id,expected] of Object.entries(baselineExpected)) {
  const source = getStellarObject(id).astrometry;
  assert.deepEqual([source.rightAscensionDeg,source.declinationDeg,source.parallaxMas], expected, `${id}: protected original coordinates`);
  assert.equal(source.queriedOn, '2026-08-23', `${id}: original source date must survive a motion supplement`);
  const motion = baselineMotion[id];
  assert(motion, id);
  for (const field of ['properMotionRaCosDecMasYr','properMotionDecMasYr','radialVelocityKmS']) assert.equal(source[field], motion[field]);
}
assert.equal(new Set(nearbyCatalog.map(object => object.designation)).size, nearbyCatalog.length);
for (const added of nearbyCatalog) {
  assert(!Object.hasOwn(baselineExpected, added.id), 'No expansion record may replace a protected id.');
  const raw = simbadSources.get(added.designation);
  assert(raw, `SIMBAD snapshot lacks ${added.designation}`);
  const runtime = getStellarObject(added.id);
  assert(runtime, added.id);
  for (const [field,rawField] of Object.entries({rightAscensionDeg:'ra',declinationDeg:'dec',parallaxMas:'plx_value',properMotionRaCosDecMasYr:'pmra',properMotionDecMasYr:'pmdec',radialVelocityKmS:'rvz_radvel'})) {
    assert.equal(added.astrometry[field], raw[rawField], `${added.id}: source ${field}`);
    assert.equal(runtime.astrometry[field], raw[rawField], `${added.id}: runtime ${field}`);
  }
  assert.equal(added.spectralType, raw.sp_type || 'Not cataloged');
  assert.equal(added.sourceObjectType, raw.otype);
  if (raw.otype === 'WD*') assert.equal(added.objectClass, 'WHITE_DWARF');
  if (raw.otype === 'BD*') assert.equal(added.objectClass, 'BROWN_DWARF');
}

assert.equal(STELLAR_EPOCH_POLICY.positionMode, 'LINEAR_SPACE_MOTION');
assert.equal(STELLAR_EPOCH_POLICY.properMotionMode, 'TANGENT_VECTOR_PROPAGATION');
assert(STELLAR_EPOCH_POLICY.displayEpoch > 2000 && Number.isFinite(STELLAR_EPOCH_POLICY.displayEpoch));
for (const object of stellarObjects) {
  const reference = toScientificStellarPosition(object);
  const propagated = propagatedStellarPosition(object);
  const render = toStellarRenderPosition(object);
  assert(finite(reference) && finite(propagated) && finite(render), `${object.id}: finite transforms`);
  close(norm(reference), distanceLightYears(object), 1e-9, `${object.id}: parallax distance`);
  closePoint(propagatedStellarPosition(object, 2000), reference, 1e-12, `${object.id}: source epoch identity`);
  close(render.x, propagated.x * STELLAR_RENDER_UNITS_PER_LIGHT_YEAR, 1e-9);
  close(render.y, propagated.z * STELLAR_RENDER_UNITS_PER_LIGHT_YEAR, 1e-9);
  close(render.z, -propagated.y * STELLAR_RENDER_UNITS_PER_LIGHT_YEAR, 1e-9);
  if (object.astrometry) {
    assert.equal(object.astrometry.frame,'ICRS');
    assert.equal(object.astrometry.coordinateEpoch,'J2000.0');
    assert(object.astrometry.parallaxMas > 0);
    assert.match(object.astrometry.sourceUrl,/^https:\/\/simbad\.cds\.unistra\.fr\//);
  }
}

// Independent analytic tests of tangent vectors and physical velocity units.
const synthetic = (ra,dec,pmra=0,pmdec=0,rv=null) => ({
  ...getStellarObject('barnards-star'), id:'analytic-source', astrometry:{
    ...getStellarObject('barnards-star').astrometry, rightAscensionDeg:ra, declinationDeg:dec,
    parallaxMas:1000, properMotionRaCosDecMasYr:pmra, properMotionDecMasYr:pmdec, radialVelocityKmS:rv,
  },
});
const radPerMas = Math.PI/(180*3600000);
const tangential = PARSEC_TO_LIGHT_YEARS * 1000 * radPerMas;
closePoint(propagatedStellarPosition(synthetic(0,0,1000,0),2001), {x:PARSEC_TO_LIGHT_YEARS,y:tangential,z:0},1e-12,'Eastward motion at equator');
closePoint(propagatedStellarPosition(synthetic(90,0,1000,0),2001), {x:-tangential,y:PARSEC_TO_LIGHT_YEARS,z:0},1e-12,'Eastward motion at RA90');
closePoint(propagatedStellarPosition(synthetic(0,0,0,1000),2001), {x:PARSEC_TO_LIGHT_YEARS,y:0,z:tangential},1e-12,'Northward motion');
closePoint(propagatedStellarPosition(synthetic(0,60,1000,0),2001), {x:PARSEC_TO_LIGHT_YEARS*.5,y:tangential,z:PARSEC_TO_LIGHT_YEARS*Math.sqrt(3)/2},1e-12,'pmRA already contains cos(dec)');
closePoint(propagatedStellarPosition(synthetic(0,90,1000,1000),2001), {x:-tangential,y:tangential,z:PARSEC_TO_LIGHT_YEARS},1e-12,'Pole-safe tangent basis');
const oneKmSYear = 1 / 299792.458;
closePoint(propagatedStellarPosition(synthetic(0,0,0,0,1),2001), {x:PARSEC_TO_LIGHT_YEARS+oneKmSYear,y:0,z:0},1e-12,'1km/s conversion');
closePoint(propagatedStellarPosition(synthetic(0,0,0,0,-10),2001), {x:PARSEC_TO_LIGHT_YEARS-10*oneKmSYear,y:0,z:0},1e-12,'Approaching RV sign');
closePoint(propagatedStellarPosition(synthetic(0,0,1000,0,null),2001), propagatedStellarPosition(synthetic(0,0,1000,0,0),2001),1e-12,'Missing RV holds radial component without NaN');
const missingMotion = synthetic(0,0,null,null,null);
closePoint(propagatedStellarPosition(missingMotion,2026.81),toScientificStellarPosition(missingMotion),1e-12,'Missing motion holds reference');
const backwards = propagatedStellarPosition(synthetic(0,0,1000,0),1999);
close(backwards.y,-tangential,1e-12,'Reverse-time propagation');
assert(norm(propagatedStellarPosition(getStellarObject('barnards-star'))) < distanceLightYears(getStellarObject('barnards-star')), 'Barnard negative RV approaches Sol over this short epoch offset.');
close(separationLightYears('gj-876','epsilon-eridani'),separationLightYears('epsilon-eridani','gj-876'),1e-12,'Symmetric source-target travel distance');
close(separationLightYears('sol','barnards-star'),norm(propagatedStellarPosition(getStellarObject('barnards-star'))),1e-12,'Travel distance uses display epoch');
assert.equal(JSON.stringify(nearbyCatalog),sourceScience,'Propagation must not mutate immutable source snapshots.');
assert.equal(JSON.stringify(stellarObjects.map(object=>object.astrometry)),runtimeScience,'Transforms must not mutate runtime source astrometry.');

assert.equal(exoplanets.length,24,'Protected two Proxima planets plus22 expanded planets.');
assert.equal(new Set(exoplanets.map(planet=>planet.id)).size,exoplanets.length);
assert.equal(exoplanetsForHost('proxima-centauri').length,2);
assert(!exoplanets.some(planet=>planet.id==='proxima-centauri-c'));
assert(!exoplanets.some(planet=>planet.hostStarId==='tau-ceti'),'Controversial Tau Ceti rows must not be promoted.');
const expectedProxima = {
  'proxima-centauri-d':[2025,5.12338,.02881,.26,.692,282],
  'proxima-centauri-b':[2016,11.18465,.04848,1.055,1.02,218],
};
for(const [id,expected] of Object.entries(expectedProxima)){
  const planet=exoplanets.find(row=>row.id===id);
  assert.deepEqual([planet.discoveryYear,planet.orbitalPeriodDays,planet.semiMajorAxisAU,planet.minimumMassEarth,planet.radiusEarth,planet.equilibriumTemperatureK],expected,id);
  assert.equal(planet.provenance.queriedOn,'2026-08-23');
}
for(const planet of exoplanets){
  assert.equal(planet.status,'CONFIRMED');
  assert(knownIds.has(planet.hostStarId));
  assert(planet.orbitalPeriodDays>0 && planet.semiMajorAxisAU>0);
  assert((planet.massEarth??planet.minimumMassEarth)>0);
  assert(planet.renderOrbit>0 && planet.renderRadius>0);
  assert.notEqual(planet.renderOrbit,planet.semiMajorAxisAU);
  assert.equal(planet.appearanceConfidence,'illustrative');
  assert.match(planet.provenance.sourceUrl,/^https:\/\/exoplanetarchive\.ipac\.caltech\.edu\//);
}
assert.equal(new Set(exoplanetExpansion.map(planet=>planet.hostStarId)).size,8);
assert.deepEqual(archiveSnapshot.excludedControversial.slice().sort(),['tau Cet f','tau Cet g','tau Cet h']);
for(const planet of exoplanetExpansion){
  const rawName=decodeURIComponent(planet.provenance.sourceUrl.split('/').at(-1));
  const raw=archiveSnapshot.result.find(row=>row.pl_name===rawName);
  assert(raw,planet.id);
  assert.equal(raw.pl_controv_flag,0);
  assert.equal(planet.orbitalPeriodDays,raw.pl_orbper);
  assert.equal(planet.semiMajorAxisAU,raw.pl_orbsmax);
  assert.equal(planet.massEarth,raw.pl_bmasse);
  assert.equal(planet.radiusEarth,raw.pl_rade);
  assert.equal(planet.equilibriumTemperatureK,raw.pl_eqt);
  assert.equal(planet.radiusConfidence,'inferred');
  assert.match(raw.pl_rade_reflink,/CALCULATED_VALUE/);
  assert.equal(planet.massProvenance,raw.pl_bmassprov==='Msini'?'MINIMUM_MASS':'MASS');
  assert.equal(planet.minimumMassEarth,raw.pl_bmassprov==='Msini'?raw.pl_bmasse:null);
}

assert.equal(validateDestinationReferences(),true);
assert.equal(destinationSystems.length,localStellarObjects.length-1,'Every non-Sol local anchor is a navigable destination.');
assert.equal(new Set(destinationSystems.map(system=>system.id)).size,destinationSystems.length);
for(const destination of destinationSystems){
  const objectIds=new Set(destination.bodies.map(body=>body.objectId));
  assert(objectIds.has(destination.anchorObjectId));
  assert.equal(destination.bodies.filter(body=>body.role==='ANCHOR').length,1);
  for(const orbit of destination.orbits){
    assert(destination.bodies.some(body=>body.id===orbit.bodyId),'Orbit references known body');
    assert(orbit.scientific.semiMajorAxis>0 && orbit.scientific.period>0);
    assert.notEqual(orbit.scientific.semiMajorAxis,orbit.render.radius);
    if(destination.kind!=='PLANETARY_SYSTEM') assert.equal(destination.anchorObjectId,'sirius-a','New schematic companions must not invent orbital solutions.');
  }
}
for(const planet of exoplanets){
  const destination=getDestinationSystemByAnchor(planet.hostStarId);
  assert.equal(destination.kind,'PLANETARY_SYSTEM');
  const body=destination.bodies.find(row=>row.objectId===planet.id);
  assert(body?.selectable);
  const orbit=destination.orbits.find(row=>row.bodyId===body.id);
  assert.equal(orbit.scientific.semiMajorAxis,planet.semiMajorAxisAU);
  assert.equal(orbit.scientific.period,planet.orbitalPeriodDays);
}
const sirius=getDestinationSystemByAnchor('sirius-a');
assert.equal(sirius.kind,'BINARY_STELLAR_SYSTEM');
assert(sirius.bodies.some(body=>body.objectId==='sirius-b'&&body.kind==='WHITE_DWARF'&&body.selectable));
assert.equal(sirius.orbits[0].scientific.semiMajorAxis,19.7);
assert.equal(sirius.orbits[0].scientific.period,50);
assert.equal(sirius.orbits[0].render.radius,34);

const {catalogObjects}=catalog;
assert.equal(catalogObjects.length,stellarObjects.length+exoplanets.length,'Catalog must include every selected source and every confirmed planet exactly once.');
assert.equal(new Set(catalogObjects.map(row=>row.id)).size,catalogObjects.length);
for(const entry of catalogObjects){
  assert(knownIds.has(entry.travelAnchorId));
  if(entry.id!=='sol')assert(getDestinationSystemByAnchor(entry.travelAnchorId));
  if(entry.arrivalSelection.kind==='SYSTEM_OBJECT')assert(getDestinationBody(entry.arrivalSelection.id)?.body.selectable);
  const object=getStellarObject(entry.id);
  if(object)close(entry.distanceLightYears,distanceLightYears(object),1e-12,`${entry.id}: catalog source parallax distance`);
}

assert.equal(coordinates.FLOATING_ORIGIN_POLICY.scientificCoordinatesImmutable,true);
assert.equal(coordinates.shouldRebaseRenderOrigin({x:coordinates.FLOATING_ORIGIN_POLICY.thresholdRenderUnits,y:0,z:0}),true);
assert.equal(coordinates.shouldRebaseRenderOrigin({x:10,y:10,z:10}),false);
const labelCandidates=[{id:'a',name:'A',x:100,y:100,depth:0,priority:10},{id:'b',name:'B',x:104,y:103,depth:.1,priority:9},{id:'selected',name:'Selected',x:108,y:106,depth:.2,priority:1000,forced:true},{id:'c',name:'C',x:300,y:200,depth:.1,priority:5},{id:'behind',name:'Behind',x:400,y:250,depth:1.1,priority:9999}];
assert.deepEqual(labelsModule.placeStellarLabels(labelCandidates,600,400).map(row=>row.id),['selected','a','b','c']);
assert.deepEqual(labelsModule.placeStellarLabels(labelCandidates.slice().reverse(),600,400),labelsModule.placeStellarLabels(labelCandidates,600,400),'Input ordering cannot change stable label placement.');
const denseLabels=Array.from({length:65},(_,i)=>({id:`star-${i}`,name:`Star ${i}`,x:100+(i%13)*26,y:100+Math.floor(i/13)*25,depth:.5,priority:1}));
for(const viewport of [[1440,900],[390,844]]) {
  const visible=denseLabels.filter(c=>c.x<=viewport[0]-8);
  const placed=labelsModule.placeStellarLabels(visible,...viewport);
  assert.equal(placed.length,visible.length,'Every visible star must retain its name, without a desktop/mobile label cap.');
  for(const label of placed) { assert(label.x>=8&&label.x+label.width<=viewport[0]-8); assert.equal(label.anchorX,Math.round(visible.find(c=>c.id===label.id).x)); }
}

assert.equal(Object.keys(orientation.BODY_ORIENTATIONS).length,9);
const earth=orientation.getBodyOrientation('earth');
close(Math.hypot(...earth.northPoleRender),1,1e-12);
close(earth.northPoleRender[1],Math.cos(orientation.J2000_OBLIQUITY_DEG*Math.PI/180),1e-12,'Earth pole transformed through ecliptic obliquity');
assert.equal(orientation.getBodyOrientation('venus').visualRadiansPerSecond<0,true,'Venus retrograde spin');
assert.equal(orientation.getBodyOrientation('uranus').visualRadiansPerSecond<0,true,'Uranus retrograde spin');
assert(orientation.getBodyOrientation('uranus').northPoleRender[1]>0,'IAU Uranus north pole must not be flipped and retrograde spin applied twice.');
assert(orientation.getBodyOrientation('venus').northPoleRender[1]>0,'IAU Venus north pole must not be double-flipped.');
for(const body of Object.values(orientation.BODY_ORIENTATIONS)){
  close(Math.hypot(...body.northPoleRender),1,1e-10,body.id);
  close(Math.sign(body.visualRadiansPerSecond),Math.sign(body.siderealHours),0,body.id);
  close(Math.abs(body.visualRadiansPerSecond*body.siderealHours*3600),Math.PI*2*orientation.BODY_SPIN_TIME_ACCELERATION,1e-7,body.id);
  assert.match(body.source,/^https:\/\/naif\.jpl\.nasa\.gov\//);
}
assert.equal(events.EVENT_POLICY.liveData,false);
assert.equal(events.EVENT_POLICY.timing,'PROCEDURAL_ILLUSTRATIVE');
for(const kind of ['AURORAL_OVAL','SOLAR_ACTIVE_REGION']){
  let quiet=0,active=0;
  for(let seconds=0;seconds<400;seconds++){
    const event=events.astronomicalEvent(kind,seconds,7);
    assert.deepEqual(event,events.astronomicalEvent(kind,seconds,7));
    assert.equal(event.confidence,'illustrative');
    assert(event.intensity>=0 && event.intensity<=.9 && Number.isFinite(event.intensity));
    if(event.intensity===0)quiet++;else active++;
  }
  assert(quiet>active && active>0,'Events have bounded active intervals and quiet periods.');
  close(events.astronomicalEvent(kind,0,7,true).intensity,.9,1e-12,'Deterministic QA preview');
}
assert.equal(quality.automaticGraphicsQuality(390,16),'BALANCED');
assert.equal(quality.automaticGraphicsQuality(1440,8),'ULTRA');
assert.equal(quality.automaticGraphicsQuality(1440,4),'HIGH');
for(const key of ['pixelRatio','sphereSegments','starCount','atmosphereDetail','ringSegments']){
  assert(quality.GRAPHICS_PROFILES.ULTRA[key]>quality.GRAPHICS_PROFILES.HIGH[key]);
  assert(quality.GRAPHICS_PROFILES.HIGH[key]>quality.GRAPHICS_PROFILES.BALANCED[key]);
}

console.log(`Verified ${stellarObjects.length} catalog sources, ${localStellarObjects.length} local anchors, ${destinationSystems.length} generic destinations, ${exoplanets.length} confirmed planets, immutable source snapshots, analytic space-motion cases, companion navigation, preserved Proxima/baseline coordinates, mass/radius provenance, body attitudes, deterministic events, graphics tiers, floating origin and label collisions.`);
