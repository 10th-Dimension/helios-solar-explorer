import { worlds, type Confidence } from './worlds.ts';
import { stellarObjects, distanceLightYears, STELLAR_EPOCH_POLICY } from './stellar.ts';
import { exoplanets } from './exoplanets.ts';
import { nearbyCatalog } from './nearbyCatalog.ts';

export type EvidenceContext = { kind: 'world' | 'layer' | 'stellar' | 'exoplanet'; id: string; index?: number };
export type VerificationStatus = 'source-reviewed' | 'snapshot-matched' | 'review-needed' | 'illustrative';
export type ScientificSource = {
  id: string; title: string; organization: string; url: string;
  publishedOn: string | null; observedOn: string | null;
  retrievedOn: string | null; checkedOn: string | null; scope: string;
};
export type ScientificClaim = {
  id: string; title: string; value: string | number | null; unit?: string;
  confidence: Confidence; sourceIds: string[]; verification: VerificationStatus;
  verifiedOn: string | null; limitations: string[]; context?: EvidenceContext; field?: string;
};
export const SCIENCE_REVIEW_DATE = '2026-10-24';
export const confidenceExplanations: Record<Confidence, string> = {
  measured: 'Obtained from observations or directly constrained by measurements. Measurement does not mean perfect or uncertainty-free.',
  inferred: 'Estimated from observations using a physical or statistical model; the inaccessible object or region was not directly sampled.',
  uncertain: 'Evidence or interpretation is incomplete, disputed, or not decisive.',
  unknown: 'The included observations do not supply this property. Unknown is not zero.',
  illustrative: 'A teaching or navigation representation. Its appearance, scale, timing or geometry is not an observation.',
};
export const verificationExplanations: Record<VerificationStatus, string> = {
  'source-reviewed': 'The cited source was inspected for this stated concept during this review. This is not independent experimental confirmation.',
  'snapshot-matched': 'The application value is checked against the preserved source snapshot, not a live catalog refresh.',
  'review-needed': 'A source or historical record is provided, but this exact claim still needs a focused verification or reconciliation.',
  illustrative: 'The claim explains a deliberate visualization transformation rather than an observed value.',
};

const sourceList: ScientificSource[] = [];
function source(id: string, title: string, organization: string, url: string, options: Partial<Omit<ScientificSource, 'id' | 'title' | 'organization' | 'url'>> = {}) {
  const record: ScientificSource = { id, title, organization, url, publishedOn: null, observedOn: null, retrievedOn: null, checkedOn: null, scope: 'Reference candidate; exact legacy values require review.', ...options };
  sourceList.push(record);
  return id;
}
const reviewed = { retrievedOn: SCIENCE_REVIEW_DATE, checkedOn: SCIENCE_REVIEW_DATE };
for (const world of worlds) {
  source('nasa.' + world.id, 'NASA ' + world.name + ' facts', 'NASA Science',
    'https://science.nasa.gov/' + world.id + '/facts/',
    { ...reviewed, scope: 'Conceptual structure, surface and atmosphere reference. Numeric legacy fields are not all individually reverified.' });
}
source('nasa.solar-system', 'Solar System facts', 'NASA Science', 'https://science.nasa.gov/solar-system/facts/', { ...reviewed, scope: 'The Sun, eight planets and basic Solar System organization.' });
source('nasa.juno', 'Juno scientific discoveries', 'NASA Science', 'https://science.nasa.gov/mission/juno/', { ...reviewed, scope: 'Gravity-constrained dilute core and metallic hydrogen interpretation; no conventional landing surface.' });
source('nasa.cosmic-distances', 'Cosmic distances', 'NASA Science', 'https://science.nasa.gov/universe/cosmic-distances/', { ...reviewed, scope: 'Astronomical units and light-years as distance units.' });
source('nasa.stars', 'Stars in an exoplanet world', 'NASA Science', 'https://science.nasa.gov/exoplanets/stars/', { ...reviewed, scope: 'Stellar properties and classification; individual catalog spectral classes remain snapshot records.' });
source('archive.composite', 'About the composite parameter table', 'NASA Exoplanet Archive / Caltech-IPAC', 'https://exoplanetarchive.ipac.caltech.edu/docs/pscp_about.html', { ...reviewed, scope: 'Mixed-source composite rows and mass-radius calculated values.' });
source('archive.columns', 'PS/PSCompPars column definitions', 'NASA Exoplanet Archive / Caltech-IPAC', 'https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html', { ...reviewed, scope: 'Units, parameter references, mass versus minimum-mass provenance, and controversy flags.' });
source('nasa.detection', 'Exoplanet detection methods', 'NASA Science', 'https://science.nasa.gov/exoplanets/how-we-find-and-characterize/', { ...reviewed, scope: 'Indirect detection does not imply resolved surface imaging.' });
source('nasa.mercury-core', 'MESSENGER constraints on Mercury core', 'NASA', 'https://www.nasa.gov/solar-system/messenger-provides-new-look-at-mercurys-surprising-core-and-landscape-curiosities/', { ...reviewed, scope: 'Historical inferred core extent of about 85% of radius and partly liquid core.' });
source('nasa.mars-insight', 'InSight reveals the deep interior of Mars', 'NASA/JPL-Caltech', 'https://www.nasa.gov/centers-and-facilities/jpl/nasas-insight-reveals-the-deep-interior-of-mars/', { ...reviewed, publishedOn: '2021-07-22', scope: 'Seismic constraints on crust, mantle and molten core; later model refinements remain possible.' });
source('nasa.cassini-rings', 'Cassini frequently asked questions', 'NASA Science', 'https://science.nasa.gov/mission/cassini/faq/', { ...reviewed, scope: 'Ring particles primarily water ice mixed with dust and rock.' });
source('jpl.physical-parameters', 'Planetary physical parameters and definitions', 'NASA/JPL Solar System Dynamics', 'https://ssd.jpl.nasa.gov/planets/phys_par.html', { ...reviewed, scope: 'Mean versus equatorial radii, masses, sidereal periods and derived equatorial gravity, with parameter bibliography. Rounded legacy matches are identified per claim.' });
source('nasa.fact-sheet-2025', 'Planetary Fact Sheet — Metric', 'NASA Goddard / NSSDCA', 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', { ...reviewed, scope: 'Table says last updated 2025-03-18. Its moon totals are historical; it defines different gravity/radius conventions from some JPL columns.' });
source('helios.transforms', 'Helios science and rendering contract', 'Helios project', 'https://github.com/10th-Dimension/helios-solar-explorer/blob/main/docs/SCIENCE.md', { scope: 'Application-specific transforms, confidence and limitations, not external scientific evidence.' });
source('snapshot.simbad', 'Preserved SIMBAD query response', 'CDS/SIMBAD; snapshot preserved by Helios', 'https://github.com/10th-Dimension/helios-solar-explorer/blob/main/data/simbad-snapshot.json', { retrievedOn: '2026-10-23', scope: 'ICRS/J2000 astrometry and original bibliography; not a live census.' });
source('snapshot.archive', 'Preserved PSCompPars query response', 'NASA Exoplanet Archive; snapshot preserved by Helios', 'https://github.com/10th-Dimension/helios-solar-explorer/blob/main/data/archive-snapshot.json', { retrievedOn: '2026-10-23', scope: 'Expanded planet rows, parameter references, and excluded controversial rows. Original Proxima rows are not in this expansion response.' });

const claims: ScientificClaim[] = [];
function add(claim: ScientificClaim) { claims.push(claim); }
function educational(id: string, title: string, value: string, confidence: Confidence, sourceIds: string[], limitations: string[] = []) {
  add({ id, title, value, confidence, sourceIds, verification: 'source-reviewed', verifiedOn: SCIENCE_REVIEW_DATE, limitations });
}
educational('edu.solar-structure', 'Our Solar System', 'The Solar System contains the Sun and eight planets. The four inner planets are rocky; Jupiter and Saturn are gas giants, and Uranus and Neptune are ice giants. Gravity governs their orbital motion.', 'inferred', ['nasa.solar-system', 'nasa.jupiter', 'nasa.uranus'], ['The scene compresses spacing, exaggerates body sizes, and does not show current orbital phases.']);
educational('edu.sun-energy', 'Energy inside the Sun', 'Fusion in the core releases energy. Radiation transports energy through the radiative region; convection carries it through the outer interior. The Sun is plasma, not a solid object.', 'inferred', ['nasa.sun'], ['Core structure and temperature are constrained through models and observations; the cutaway is not a photograph.']);
educational('edu.planet-interiors', 'How we infer interiors', 'Earth has a solid inner core, liquid outer core, rocky mantle and thin crust. Juno gravity data constrains Jupiter’s deep structure. Ice-giant interiors remain model-dependent and have no conventional solid landing surface.', 'inferred', ['nasa.earth', 'nasa.juno', 'nasa.neptune', 'nasa.uranus'], ['The same confidence should not be assigned to every layer. Displayed boundaries are pedagogical.']);
educational('edu.exoplanets', 'Detection is not a surface photograph', 'An exoplanet orbits a star outside our Solar System. A radial-velocity signal measures changes in stellar motion; a transit measures dimming. Confirmation of a planet does not establish its surface, atmosphere or habitability.', 'inferred', ['nasa.detection', 'archive.composite'], ['The included confirmed population is a bounded historical snapshot. Planet status can be revised.']);
educational('edu.light-year', 'A light-year measures distance', 'A light-year is the distance light travels in one year, approximately 9.46 trillion kilometers. It is a unit of length, not an age or a travel duration for the Helios camera.', 'measured', ['nasa.cosmic-distances'], ['The approximation uses vacuum light speed and a conventional year.']);
educational('edu.stellar-types', 'Stars have different classifications', 'Stellar spectra encode temperature and physical properties. A spectral classification is evidence about the star, while the size and glow of a point in Helios are navigation illustrations.', 'inferred', ['nasa.stars'], ['A catalog color or class is not a resolved photograph of the stellar surface.']);
educational('edu.mass-radius', 'Mass is not radius', 'Radial velocity alone constrains a planet’s minimum mass because the orbital inclination may be unknown. A composite archive can include radii calculated from a mass-radius model; these are not transit measurements.', 'inferred', ['archive.columns', 'archive.composite'], ['Some planets have true-mass estimates from additional constraints; use each record’s provenance.']);

const numericalFields = ['radius', 'mass', 'gravity', 'temperature', 'day', 'year', 'distance', 'moons'] as const;
const explanations = ['pressure', 'atmosphere', 'surface', 'weather', 'oddity'] as const;
const checkedSurface = new Set(['sun', 'earth', 'jupiter', 'saturn', 'uranus', 'neptune']);
const physicalReview: Record<string, readonly string[]> = {
  mercury: ['mass', 'gravity'], venus: ['radius', 'mass', 'gravity'],
  earth: ['radius', 'mass'], mars: ['radius', 'mass', 'gravity'],
  jupiter: ['radius', 'mass', 'gravity'], saturn: ['radius', 'mass', 'gravity'],
  uranus: ['radius', 'mass'], neptune: ['radius', 'mass', 'gravity'],
};
for (const world of worlds) {
  for (const field of numericalFields) {
    const checked = physicalReview[world.id]?.includes(field) ?? false;
    add({ id: 'world.' + world.id + '.' + field, title: world.name + ': ' + field, value: world[field],
      confidence: field === 'moons' && world.id === 'sun' ? 'illustrative' : field === 'mass' || field === 'gravity' || world.id === 'sun' && field === 'year' ? 'inferred' : 'measured',
      sourceIds: [checked ? 'jpl.physical-parameters' : 'nasa.' + world.id], verification: checked ? 'source-reviewed' : 'review-needed', verifiedOn: checked ? SCIENCE_REVIEW_DATE : null,
      context: { kind: 'world', id: world.id }, field,
      limitations: [checked ? field === 'radius' ? 'Rounded mean (volume-equivalent) radius, not equatorial radius. The rendered sphere is not a measured shape model.'
        : field === 'mass' ? 'Rounded ratio derived using Earth as the reference mass; reported precision is intentionally limited.'
        : 'Derived equatorial gravitational acceleration. Effective gravity including rotation and other source conventions can differ.'
        : field === 'moons' ? 'Legacy count is not a live count. Giant-planet moon totals require a dated current census; no source response for these totals was preserved.'
        : field === 'temperature' ? 'Legacy approximation: pressure level, averaging interval and reference epoch matter. It is not a live temperature measurement.'
        : field === 'radius' ? 'Mean, equatorial and polar radius differ. This rounded legacy value is retained; a future correction must identify the definition and source.'
        : 'Rounded legacy summary retained. This exact value was not independently remeasured or completely reconciled in the education review.'] });
  }
  for (const field of explanations) {
    const isSurface = field === 'surface';
    add({ id: 'world.' + world.id + '.' + field, title: world.name + ': ' + field, value: world[field],
      confidence: field === 'weather' && world.id === 'venus' ? 'uncertain'
        : isSurface && ['earth', 'mercury', 'mars'].includes(world.id) ? 'measured' : 'inferred',
      sourceIds: ['nasa.' + world.id], verification: isSurface && checkedSurface.has(world.id) ? 'source-reviewed' : 'review-needed',
      verifiedOn: isSurface && checkedSurface.has(world.id) ? SCIENCE_REVIEW_DATE : null,
      context: { kind: 'world', id: world.id }, field,
      limitations: ['This section can combine observations and interpretation. It is not a blanket measured label for the whole Planet Story.'] });
  }
  world.facts.forEach((fact, index) => {
    const uncertain = fact.confidence === 'uncertain' || fact.confidence === 'unknown' || /uncertain/i.test(fact.value);
    const reviewedFact = world.id === 'sun' && index === 2 || world.id === 'mercury' && index === 2 || world.id === 'saturn' && index === 1 || world.id === 'uranus' && index === 0;
    add({ id: 'world.' + world.id + '.fact.' + index, title: world.name + ': ' + fact.label, value: fact.confidence === 'unknown' ? null : fact.value,
      confidence: /uncertain/i.test(fact.value) ? 'uncertain' : fact.confidence,
      sourceIds: [world.id === 'mercury' && index === 2 ? 'nasa.mercury-core' : world.id === 'saturn' && index === 1 ? 'nasa.cassini-rings' : 'nasa.' + world.id],
      verification: reviewedFact ? 'source-reviewed' : 'review-needed', verifiedOn: reviewedFact ? SCIENCE_REVIEW_DATE : null,
      context: { kind: 'world', id: world.id, index }, field: 'fact',
      limitations: uncertain ? ['This uncertainty is retained; a citation does not turn an unknown or disputed property into a measured one.'] : ['Legacy source wording and rounding are preserved. Confidence describes this fact, not the entire object.'] });
  });
  world.layers.forEach((layer, index) => {
    add({ id: 'layer.' + world.id + '.' + index, title: world.name + ': ' + layer.name, value: layer.note,
      confidence: layer.confidence, sourceIds: [world.id === 'jupiter' ? 'nasa.juno' : world.id === 'mars' ? 'nasa.mars-insight' : 'nasa.' + world.id],
      verification: 'source-reviewed', verifiedOn: SCIENCE_REVIEW_DATE,
      context: { kind: 'layer', id: world.id, index },
      limitations: ['The layer description is a simplified interpretation. Its displayed shape, radius, thickness and boundary are illustrative, even when composition or existence is measurement-constrained.',
        ['uranus', 'neptune', 'venus'].includes(world.id) ? 'Deep interior composition, phase and exact boundaries remain especially model-dependent.' : 'Inaccessible interiors are constrained indirectly, not directly photographed.'] });
    add({ id: 'layer.' + world.id + '.' + index + '.geometry', title: 'Cutaway geometry: ' + layer.name, value: 'Simplified boundary and teaching scale',
      confidence: 'illustrative', sourceIds: ['helios.transforms'], verification: 'illustrative', verifiedOn: null,
      context: { kind: 'layer', id: world.id, index }, limitations: ['Do not infer a measured boundary or a physically possible descent from this mesh.'] });
  });
}

for (const star of stellarObjects) {
  const a = star.astrometry;
  if (!a) continue;
  const id = source('simbad.' + star.id, a.sourceLabel, 'CDS/SIMBAD', a.sourceUrl, { retrievedOn: a.queriedOn, scope: 'Record identity, source position and parallax; linked bibliography belongs to the catalog epoch, not this app release.' });
  const expansionRow = nearbyCatalog.some(row => row.id === star.id);
  add({ id: 'stellar.' + star.id + '.astrometry', title: star.name + ': source position', value: 'RA ' + a.rightAscensionDeg + '°, Dec ' + a.declinationDeg + '°; parallax ' + a.parallaxMas + ' mas',
    confidence: 'measured', sourceIds: [id, ...(expansionRow ? ['snapshot.simbad'] : [])], verification: expansionRow ? 'snapshot-matched' : 'review-needed',
    verifiedOn: null, context: { kind: 'stellar', id: star.id },
    limitations: ['Source frame is ' + a.frame + ' at ' + a.coordinateEpoch + '. The displayed epoch ' + STELLAR_EPOCH_POLICY.displayEpoch + ' uses a linear approximation, not a live ephemeris.',
      'Original baseline rows predate the expansion response and are retained separately; not every baseline coordinate is duplicated in that response.'] });
  add({ id: 'stellar.' + star.id + '.distance', title: star.name + ': derived distance', value: distanceLightYears(star), unit: 'light-year', confidence: 'inferred',
    sourceIds: [id, 'nasa.cosmic-distances'], verification: expansionRow ? 'snapshot-matched' : 'review-needed', verifiedOn: null, context: { kind: 'stellar', id: star.id },
    limitations: ['Derived from inverse parallax. Display rounding and source uncertainty matter; no Bayesian distance inference is performed.'] });
  if (a.radialVelocityKmS == null) add({ id: 'stellar.' + star.id + '.radial-velocity', title: star.name + ': radial velocity', value: null, unit: 'km/s',
    confidence: 'unknown', sourceIds: [id, ...(expansionRow ? ['snapshot.simbad'] : [])], verification: expansionRow ? 'snapshot-matched' : 'review-needed', verifiedOn: null, context: { kind: 'stellar', id: star.id },
    limitations: ['Missing velocity is held at zero for the display calculation. Zero is a fallback, not a measurement.'] });
}

for (const planet of exoplanets) {
  const id = source('archive.' + planet.id, planet.name + ' archive overview', 'NASA Exoplanet Archive / Caltech-IPAC', planet.provenance.sourceUrl,
    { retrievedOn: planet.provenance.queriedOn, scope: 'Historical planet identity and parameters. Follow per-parameter references in the preserved snapshot.' });
  const original = planet.hostStarId === 'proxima-centauri';
  const limitations = ['Confirmed status is the included historical record, not a live revalidation.', 'PSCompPars combines sources and can calculate missing parameters.'];
  add({ id: 'exoplanet.' + planet.id + '.status', title: planet.name + ': catalog status', value: planet.status, confidence: 'inferred',
    sourceIds: [id, 'archive.composite', ...(original ? [] : ['snapshot.archive'])], verification: original ? 'review-needed' : 'snapshot-matched', verifiedOn: null,
    context: { kind: 'exoplanet', id: planet.id }, limitations: [...limitations, ...(original ? ['Original Proxima rows are not in the expanded raw response; original discovery-year and parameter values require a separately preserved reconciliation.'] : [])] });
  const mass = planet.massEarth ?? planet.minimumMassEarth;
  const minimum = planet.massProvenance !== 'MASS';
  add({ id: 'exoplanet.' + planet.id + '.mass', title: planet.name + ': ' + (minimum ? 'minimum mass' : 'mass estimate'), value: mass, unit: 'Earth masses',
    confidence: mass == null ? 'unknown' : 'inferred', sourceIds: [id, 'archive.columns', ...(original ? [] : ['snapshot.archive'])],
    verification: original ? 'review-needed' : 'snapshot-matched', verifiedOn: null, context: { kind: 'exoplanet', id: planet.id },
    limitations: [minimum ? 'Radial velocity alone gives mass × sin(inclination), a lower bound on true mass.' : 'Archive provenance says Mass; do not relabel it as minimum mass.', ...limitations] });
  add({ id: 'exoplanet.' + planet.id + '.radius', title: planet.name + ': modeled radius', value: planet.radiusEarth, unit: 'Earth radii', confidence: 'inferred',
    sourceIds: [id, 'archive.composite', ...(original ? [] : ['snapshot.archive'])], verification: original ? 'review-needed' : 'snapshot-matched', verifiedOn: null,
    context: { kind: 'exoplanet', id: planet.id }, limitations: ['This radius is inferred/calculated, not an observed surface size or transit radius.', ...limitations] });
  add({ id: 'exoplanet.' + planet.id + '.temperature', title: planet.name + ': equilibrium temperature', value: planet.equilibriumTemperatureK, unit: 'K',
    confidence: planet.equilibriumTemperatureK == null ? 'unknown' : 'inferred', sourceIds: [id, 'archive.columns'], verification: original ? 'review-needed' : 'snapshot-matched', verifiedOn: null,
    context: { kind: 'exoplanet', id: planet.id }, limitations: ['An equilibrium-model temperature is not a measured ground temperature or a finding of habitability.'] });
  add({ id: 'exoplanet.' + planet.id + '.appearance', title: planet.name + ': appearance', value: planet.visualNote, confidence: 'illustrative',
    sourceIds: ['helios.transforms'], verification: 'illustrative', verifiedOn: null, context: { kind: 'exoplanet', id: planet.id },
    limitations: ['No observed continents, oceans, vegetation, life, weather or surface colors are asserted.'] });
}

export const scientificSources: Record<string, ScientificSource> = Object.fromEntries(sourceList.map(item => [item.id, item]));
export const claimRegistry: ScientificClaim[] = claims;
export const claimsById: Record<string, ScientificClaim> = Object.fromEntries(claims.map(claim => [claim.id, claim]));
export function claimById(id: string) { return claimsById[id]; }
export function claimsForContext(context: EvidenceContext): ScientificClaim[] {
  return claims.filter(claim => claim.context?.kind === context.kind && claim.context.id === context.id &&
    (context.index === undefined || claim.context.index === context.index));
}

/** Runtime-safe graph checks also exercised adversarially in the science suite. */
export function validateScienceGraph(items: readonly ScientificClaim[] = claimRegistry, references: Record<string, ScientificSource> = scientificSources): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const confidence = new Set(Object.keys(confidenceExplanations));
  const status = new Set(Object.keys(verificationExplanations));
  const validDate = (date: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > SCIENCE_REVIEW_DATE) return false;
    const parsed = new Date(date + 'T00:00:00Z');
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  };
  for (const item of items) {
    if (!item.id || ids.has(item.id)) errors.push('Duplicate or empty claim identifier: ' + item.id);
    ids.add(item.id);
    if (!confidence.has(item.confidence)) errors.push(item.id + ': invalid confidence');
    if (!status.has(item.verification)) errors.push(item.id + ': invalid verification');
    if (!item.sourceIds.length) errors.push(item.id + ': missing citation');
    for (const id of item.sourceIds) if (!references[id]) errors.push(item.id + ': broken source ' + id);
    if (item.confidence === 'unknown' && item.value !== null) errors.push(item.id + ': unknown must retain null');
    if (item.value === null && item.confidence !== 'unknown') errors.push(item.id + ': missing value must be unknown');
    if (typeof item.value === 'number' && (!Number.isFinite(item.value) || !item.unit)) errors.push(item.id + ': numeric value requires finite quantity and unit');
    if (item.verification === 'source-reviewed' && (!item.verifiedOn || !item.sourceIds.some(id => references[id]?.checkedOn))) errors.push(item.id + ': source review requires a review date and checked source');
    if (item.verifiedOn && !validDate(item.verifiedOn)) errors.push(item.id + ': invalid verification date');
  }
  for (const [id, reference] of Object.entries(references)) {
    if (id !== reference.id || !reference.organization || !reference.scope) errors.push(id + ': invalid source metadata');
    try { if (new URL(reference.url).protocol !== 'https:') errors.push(id + ': source must use HTTPS'); } catch { errors.push(id + ': invalid source URL'); }
    for (const date of [reference.publishedOn, reference.observedOn, reference.retrievedOn, reference.checkedOn]) {
      if (date !== null && !validDate(date)) errors.push(id + ': invalid source date');
    }
  }
  return errors;
}

