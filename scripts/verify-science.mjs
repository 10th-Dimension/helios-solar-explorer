import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { claimRegistry, claimsById, claimsForContext, scientificSources, validateScienceGraph } from '../app/science.ts';
import { worlds } from '../app/worlds.ts';
import { stellarObjects, localStellarObjects, distanceLightYears } from '../app/stellar.ts';
import { nearbyCatalog, NEARBY_CATALOG_SNAPSHOT } from '../app/nearbyCatalog.ts';
import { exoplanets } from '../app/exoplanets.ts';
import { exoplanetExpansion } from '../app/exoplanetExpansion.ts';
import { destinationSystems } from '../app/destinationSystems.ts';

assert.deepEqual(validateScienceGraph(), []);
const seed = structuredClone(claimsById['edu.sun-energy']);
for (const [change, pattern] of [
  [{sourceIds:['missing.evidence']}, /broken source/],
  [{sourceIds:[]}, /missing citation/],
  [{confidence:'certain'}, /invalid confidence/],
  [{verification:'verified-forever'}, /invalid verification/],
  [{confidence:'unknown',value:0}, /unknown must retain null/],
  [{confidence:'inferred',value:null}, /missing value must be unknown/],
  [{value:Infinity,unit:'K'}, /finite quantity/],
  [{verifiedOn:'2099-01-01'}, /invalid verification date/],
  [{verifiedOn:'2025-02-30'}, /invalid verification date/],
]) {
  assert.match(validateScienceGraph([{...seed,...change}]).join(';'), pattern);
}
assert.match(validateScienceGraph([seed,seed]).join(';'), /Duplicate/);
const badSources=structuredClone(scientificSources);
badSources['nasa.sun'].url='javascript:alert(1)';
assert.match(validateScienceGraph([seed],badSources).join(';'),/HTTPS/);
assert.equal(new Set([...stellarObjects,...exoplanets].map(row=>row.id)).size,stellarObjects.length+exoplanets.length);

for (const world of worlds) {
  const claims=claimsForContext({kind:'world',id:world.id});
  assert.ok(claims.length >= world.facts.length+8);
  assert.equal(claims.filter(c=>c.field==='radius').length,1);
  assert.equal(claimsById['world.'+world.id+'.moons'].verification,'review-needed');
  assert.ok(world.radiusEarth > 0 && world.radiusEarth < 200);
  assert.ok(world.gravityEarth > 0 && world.gravityEarth < 40);
  const radiusKm=Number(world.radius.replace(/[^0-9.]/g,''));
  assert.ok(radiusKm > 1000 && radiusKm < 1000000);
  // The inherited Sun ratio (109.2) differs by ~0.098 from its stated km radius
  // divided by 6371. Retain and flag that legacy approximation in the audit;
  // other planets must stay within 0.01 Earth radii of their displayed km value.
  assert.ok(Math.abs(radiusKm/6371-world.radiusEarth) < (world.id==='sun' ? .15 : .01),world.id+': km/Earth-radius unit mismatch');
  world.facts.forEach((fact,index)=>{
    const factClaims=claimsForContext({kind:'world',id:world.id,index});
    assert.equal(factClaims.length,1);
    if(fact.confidence==='unknown') assert.equal(factClaims[0].value,null);
  });
  world.layers.forEach((_,index)=>{
    const layers=claimsForContext({kind:'layer',id:world.id,index});
    assert.equal(layers.length,2);
    assert.ok(layers.some(c=>c.confidence==='illustrative' && c.id.endsWith('.geometry')));
  });
}
assert.equal(claimsById['world.mars.fact.1'].confidence,'uncertain','Uncertain brine wording cannot acquire a blanket inferred label.');
assert.equal(claimsById['world.jupiter.fact.1'].value,null,'An unknown core boundary is not a measured zero.');

const rawData={};
for(const [name,expected] of [
 ['simbad-snapshot','7b6567631d33266c873a0e73b717869f7147e52793ea19de74d2af780fab52a3'],
 ['archive-snapshot','06fd71130655dd88d9bc6e53b8c88b531ca262e68338e054eb5b3c6b251c7d81']
]) {
 const bytes=await readFile(new URL('../data/'+name+'.json',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),expected,'Raw scientific snapshot must not change silently: '+name);
 rawData[name]=JSON.parse(bytes);
}
const simbad=rawData['simbad-snapshot'], archive=rawData['archive-snapshot'];
assert.equal(stellarObjects.length,nearbyCatalog.length+NEARBY_CATALOG_SNAPSHOT.preservedBaselineCount);
assert.equal(nearbyCatalog.length,simbad.expansionObjectCount);
assert.equal(destinationSystems.length,localStellarObjects.length-1);
assert.equal(archive.result.filter(row=>row.pl_controv_flag===0).length,exoplanetExpansion.length);
for(const planet of exoplanetExpansion) {
 const raw=archive.result.find(row=>row.pl_name===decodeURIComponent(planet.provenance.sourceUrl.split('/').at(-1)));
 assert.ok(raw && raw.pl_controv_flag===0,planet.id+': unsupported confirmed planet');
 assert.equal(planet.orbitalPeriodDays,raw.pl_orbper);
 assert.equal(planet.semiMajorAxisAU,raw.pl_orbsmax);
 assert.equal(planet.massEarth,raw.pl_bmasse);
 assert.equal(planet.radiusEarth,raw.pl_rade);
 assert.match(raw.pl_rade_reflink,/CALCULATED_VALUE/);
 assert.equal(claimsById['exoplanet.'+planet.id+'.radius'].confidence,'inferred');
 assert.equal(planet.massProvenance,raw.pl_bmassprov==='Msini'?'MINIMUM_MASS':'MASS');
 if(planet.massProvenance==='MINIMUM_MASS') assert.equal(planet.minimumMassEarth,planet.massEarth);
 else assert.equal(planet.minimumMassEarth,null);
}
for(const planet of exoplanets) {
 assert.ok(planet.orbitalPeriodDays > 0 && planet.orbitalPeriodDays < 100000);
 assert.ok(planet.semiMajorAxisAU > 0 && planet.semiMajorAxisAU < 100);
 assert.ok(planet.radiusEarth > 0 && planet.radiusEarth < 30);
 assert.equal(claimsById['exoplanet.'+planet.id+'.appearance'].confidence,'illustrative');
 if(planet.equilibriumTemperatureK===null) assert.equal(claimsById['exoplanet.'+planet.id+'.temperature'].confidence,'unknown');
 if(planet.hostStarId==='proxima-centauri') assert.equal(claimsById['exoplanet.'+planet.id+'.status'].verification,'review-needed');
}
assert.ok(!exoplanets.some(p=>p.hostStarId==='tau-ceti' || p.id==='proxima-centauri-c'));
for(const star of stellarObjects.filter(s=>s.astrometry)) {
 const a=star.astrometry;
 assert.ok(a.parallaxMas > 0 && a.parallaxMas < 2000);
 assert.ok(a.rightAscensionDeg>=0 && a.rightAscensionDeg<360);
 assert.ok(a.declinationDeg>=-90 && a.declinationDeg<=90);
 assert.ok(Number.isFinite(distanceLightYears(star)) && distanceLightYears(star)>0);
 if(a.radialVelocityKmS==null) {
  const velocity=claimsById['stellar.'+star.id+'.radial-velocity'];
  assert.equal(velocity.value,null);
  assert.equal(velocity.confidence,'unknown');
 }
}
console.log(JSON.stringify({claims:claimRegistry.length,sources:Object.keys(scientificSources).length,worlds:worlds.length,stellarObjects:stellarObjects.length,anchors:localStellarObjects.length,exoplanets:exoplanets.length,exoplanetHosts:new Set(exoplanets.map(p=>p.hostStarId)).size,rawSnapshotsUnchanged:true,adversarialGraphCases:11,sourceReviewIsNotLiveRevalidation:true},null,2));

