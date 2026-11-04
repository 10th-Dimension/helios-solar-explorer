import assert from 'node:assert/strict';
import { catalogPage } from '../app/catalogWindow.ts';
import { checkedStellarEpoch, motionAvailability } from '../app/epochPolicy.ts';
import { SIRIUS_FIT, siriusRelativeAtBesselianEpoch, julianToBesselianEpoch, siriusRenderPosition } from '../app/siriusOrbit.ts';
import { majorMoons, moonSizeRatio } from '../app/majorMoons.ts';
import { getStellarObject, propagatedStellarPosition, separationLightYears } from '../app/stellar.ts';
import { placeStellarLabels } from '../app/stellarLabels.ts';
import { ringRayAttenuation, hostLambert } from '../app/lightingGeometry.ts';
import { checkedObservation,playbackStep } from '../app/observedWeather.ts';
import { GpuTiming } from '../app/gpuTiming.ts';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {scholarlyReference,formatCatalogError} from '../app/catalogEvidence.ts';
const entries=Array.from({length:10003},(_,id)=>({id}));
const ids=[];for(let p=0;p<catalogPage(entries,0).pages;p++){const result=catalogPage(entries,p);assert.ok(result.items.length<=24);ids.push(...result.items.map(x=>x.id));}
assert.deepEqual(ids,entries.map(x=>x.id));assert.equal(catalogPage([],8).page,0);assert.equal(catalogPage(entries,Infinity).page,0);assert.equal(catalogPage(entries,-4).page,0);assert.equal(catalogPage(entries,999999).page,416);assert.throws(()=>catalogPage(entries,0,0));
console.log('Roadmap catalog: 10,003 entries reachable exactly once; page bounds and empty states pass.');
for(const epoch of [1900,2000,2026.81,2100])assert.equal(checkedStellarEpoch(epoch),epoch);
for(const invalid of [NaN,Infinity,1899,2100.01])assert.throws(()=>checkedStellarEpoch(invalid));
assert.deepEqual(motionAvailability({properMotionRaCosDecMasYr:0,properMotionDecMasYr:null,radialVelocityKmS:0}),{raMotion:true,decMotion:false,radialMotion:true,covariance:null});
assert.deepEqual(motionAvailability(null),{raMotion:false,decMotion:false,radialMotion:false,covariance:null});
console.log('Epoch bounds and measured zero versus missing motion/covariance pass.');
assert.notDeepEqual(propagatedStellarPosition(getStellarObject('barnards-star'),2000),propagatedStellarPosition(getStellarObject('barnards-star'),2050));
assert.equal(separationLightYears('sirius-a','sirius-a',2100),0);
assert.equal(majorMoons.length,4);assert.equal(new Set(majorMoons.map(m=>m.id)).size,4);
assert.equal(moonSizeRatio(majorMoons[0],majorMoons[0]),1);
for(const m of majorMoons){assert.match(m.source,/^https:\/\/science.nasa.gov\//);assert.ok(m.radiusKm>0&&m.distanceKm>0&&m.periodDays>0);}
for(const [year,rho,pa,rhoError,paError] of [[1997.2137,3.6811,191.864,.0040,.065],[1997.3782,3.7229,188.996,.0047,.076],[2010.6697,9.0224,88.952,.0029,.019],[2011.7484,9.3956,85.938,.0029,.018],[2014.2455,10.1454,79.850,.0028,.016],[2016.6361,10.6983,74.645,.0028,.016]]){
 const p=siriusRelativeAtBesselianEpoch(year);
 assert.ok(Math.abs(p.separationArcsec-rho)<4*rhoError,`HST separation at ${year}: ${p.separationArcsec}`);
 assert.ok(Math.abs(p.positionAngleDeg-pa)<4*paError,`HST PA at ${year}: ${p.positionAngleDeg}`);
}
const p=siriusRelativeAtBesselianEpoch(2000),again=siriusRelativeAtBesselianEpoch(2000+SIRIUS_FIT.period);
assert.ok(Math.abs(p.eastArcsec-again.eastArcsec)<1e-10);assert.ok(Math.abs(p.northArcsec-again.northArcsec)<1e-10);
assert.ok(Math.abs(julianToBesselianEpoch(2000)-2000.001277513665)<1e-9);
assert.ok(siriusRenderPosition(2050).every(Number.isFinite));assert.equal(SIRIUS_FIT.covariance,null);
assert.throws(()=>siriusRelativeAtBesselianEpoch(NaN));
const dense=Array.from({length:1000},(_,i)=>({id:String(i),name:'Catalog '+i,x:20+(i%30)*30,y:30+Math.floor(i/30)*22,depth:.5,priority:i===53?1000:1,forced:i===53}));
const labels=placeStellarLabels(dense,1200,900);assert.equal(labels.length,1000);assert.equal(labels[0].id,'53');
assert.deepEqual(labels,placeStellarLabels([...dense].reverse(),1200,900));assert.deepEqual(placeStellarLabels(dense,NaN,50),[]);
console.log('Moon provenance, dynamic epoch distances, 1,000 stable labels and six independent HST epochs pass.');
assert.equal(hostLambert([1,0,0],[0,0,0],[10,0,0]),1);
assert.equal(hostLambert([1,0,0],[0,0,0],[-10,0,0]),0);
// Surface point above the equator; host ray crosses the 1.46–1.73 R band.
assert.ok(Math.abs(ringRayAttenuation([0,1,0],[3.2,-1,0],[0,0,0],[0,1,0],1)-.32)<1e-12);
assert.equal(ringRayAttenuation([0,1,0],[0,10,0],[0,0,0],[0,1,0],1),1,'Ring behind ray');
assert.equal(ringRayAttenuation([0,1,0],[10,1,0],[0,0,0],[0,1,0],1),1,'Parallel ray');
assert.equal(ringRayAttenuation([0,1,0],[3.5,-1,0],[0,0,0],[0,1,0],1),1,'Cassini-like display gap is not opaque');
const shift=[9100,-1500,77],move=v=>v.map((n,i)=>n+shift[i]);
assert.equal(ringRayAttenuation(move([0,1,0]),move([3.2,-1,0]),move([0,0,0]),[0,1,0],1),ringRayAttenuation([0,1,0],[3.2,-1,0],[0,0,0],[0,1,0],1));
assert.throws(()=>ringRayAttenuation([0,1,0],[1,1,0],[0,0,0],[0,1,0],0));
console.log('Host day/night, annulus/gap/parallel-ray shadows and floating-origin invariance pass.');
const weather=JSON.parse(await readFile(new URL('../data/observed-weather.json',import.meta.url),'utf8'));
assert.equal(weather.sourceId,13);assert.equal(weather.frames.length,4);assert.equal(new Set(weather.frames.map(f=>f.imageId)).size,4);
for(const f of weather.frames){assert.ok(checkedObservation(f));const bytes=await readFile(new URL('../public'+f.image,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);assert.equal(bytes.readUInt32BE(16),512);assert.equal(bytes.readUInt32BE(20),512);}
assert.equal(checkedObservation({...weather.frames[0],observedAt:'2024-05-11T00:00:00Z'}),false);
assert.equal(checkedObservation({...weather.frames[0],image:null,status:'gap'}),false);
assert.equal(playbackStep(3,4),3);assert.equal(playbackStep(0,4),1);
let created=0,deleted=0,available=false,disjoint=false,lost=false;
const gl={QUERY_RESULT_AVAILABLE:1,QUERY_RESULT:2,getExtension:()=>({TIME_ELAPSED_EXT:3,GPU_DISJOINT_EXT:4}),getParameter:()=>disjoint,isContextLost:()=>lost,createQuery:()=>({id:++created}),deleteQuery:()=>deleted++,beginQuery:()=>{},endQuery:()=>{},getQueryParameter:(q,key)=>key===1?available:2000000};
const timing=new GpuTiming(gl);assert.equal(timing.milliseconds,null);assert.equal(timing.begin(),true);timing.end();assert.equal(timing.begin(),false,'Do not pile up queries while pending');available=true;timing.poll();assert.equal(timing.milliseconds,2);assert.equal(deleted,1);
timing.begin();timing.end();disjoint=true;timing.poll();assert.equal(timing.milliseconds,null);assert.equal(deleted,2);assert.equal(timing.begin(),false,'Do not issue a GPU query while disjoint');disjoint=false;timing.begin();timing.end();timing.dispose();assert.equal(deleted,3);
const unsupported=new GpuTiming({...gl,getExtension:()=>null});assert.equal(unsupported.begin(),false);assert.equal(unsupported.milliseconds,null);
console.log('Four hashed observed frames, gap rejection, bounded playback and nonblocking/disjoint GPU-query cleanup pass.');
const hosts=JSON.parse(await readFile(new URL('../data/nearby-hosts-roadmap.json',import.meta.url),'utf8'));
assert.deepEqual([...new Set(hosts.rows.map(r=>r.hostname))].sort(),['GJ 1132','TRAPPIST-1']);
assert.equal(hosts.rows.filter(r=>r.hostname==='TRAPPIST-1'&&r.pl_controv_flag===0).length,7);
assert.equal(new Set(hosts.rows.map(r=>r.pl_name)).size,hosts.rows.length);
for(const r of hosts.rows){assert.ok(r.sy_dist>0);assert.ok(r.pl_orbper>0);assert.ok(scholarlyReference(r.pl_orbper_reflink));}
assert.equal(scholarlyReference('<a href=javascript:alert(1)>x</a>'),null);
assert.equal(scholarlyReference('<a href=https://evil.example/x>untrusted</a>'),null);
assert.match(formatCatalogError(0,null,null,'days'),/^0 days.*unavailable$/);
assert.equal(formatCatalogError(null,0,0,'AU'),'Not cataloged');
console.log('Additional NASA system rows, noncontroversial filtering, nullable uncertainties and safe reference links pass.');
