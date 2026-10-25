import { worlds } from './worlds.ts';

export type EducationTarget =
  | { kind: 'world'; id: string; layerIndex?: number; compare?: boolean }
  | { kind: 'stellar'; id: string }
  | { kind: 'exoplanet'; id: string }
  | { kind: 'home' };

export type EducationObserved = {
  worldId: string | null;
  layerIndex: number | null;
  stellarId: string | null;
  exoplanetId: string | null;
  compareOpen: boolean;
  interiorMode: boolean;
};

export type EducationQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
};

export type EducationStage = {
  id: string;
  title: string;
  target: EducationTarget;
  instruction: string;
  explanation: string;
  accessibleAlternative: string;
  claimIds: string[];
  question?: EducationQuestion;
};

export type EducationLesson = {
  id: string;
  title: string;
  description: string;
  level: string;
  objectives: string[];
  stages: EducationStage[];
};

const question = (id: string, prompt: string, options: string[], correctIndex: number, explanation: string): EducationQuestion => ({
  id, prompt, options: options.map((label, index) => ({ id: `${id}-${index}`, label })), correctOptionId: `${id}-${correctIndex}`, explanation,
});

const planetExplanations: Record<string, string> = {
  sun: 'The Sun is a star. Its gravity dominates the Solar System and keeps the planets in orbit. Fusion in its core supplies the energy that eventually escapes as sunlight. Gravity is attraction between masses, not a force that stops at a planet’s surface.',
  mercury: 'Mercury is the innermost planet and a terrestrial world: a planet with a rocky exterior. Its very thin exosphere does little to redistribute heat. Closeness to the Sun alone does not determine a planet’s surface temperature.',
  venus: 'Venus is a rocky planet wrapped in a dense carbon-dioxide atmosphere. Its strong greenhouse effect makes its surface hotter than Mercury’s despite being farther from the Sun. Atmospheric conditions matter as well as distance.',
  earth: 'Earth is our comparison world: its radius is defined as one Earth radius in this atlas. Liquid water, a rocky surface and an atmosphere make it different from the giant planets. The displayed sizes and orbital spacing are transformed so you can navigate, rather than shown at one physical scale.',
  mars: 'Mars is a terrestrial planet with a thin atmosphere and a cold, rocky surface. Landforms and minerals preserve evidence of earlier liquid water. Those observations do not demonstrate that life existed there.',
  jupiter: 'Jupiter is a gas giant composed mainly of hydrogen and helium. Its visible bands are clouds, not ground. Increasing pressure leads into deep fluid layers, so a conventional solid landing surface is not available.',
  saturn: 'Saturn is also a gas giant. Its rings consist of many orbiting particles, mostly water ice, rather than a rigid disk. Planet, rings and moons are held in orbital motion by gravity.',
  uranus: 'Uranus is an ice giant. Here “ice” describes compounds such as water, ammonia and methane in planetary formation and interior models; it does not mean the planet is a cold ball of familiar solid ice. Its deep interior is hot and under high pressure.',
  neptune: 'Neptune is the outermost of the eight planets in this lesson and another ice giant. Its atmosphere covers a deep, high-pressure interior. A larger displayed orbit indicates ordering here; use the AU facts for scientific distances rather than measuring pixels.',
};

const solarSystemStages: EducationStage[] = worlds.map((world) => ({
  id: `system-${world.id}`,
  title: world.id === 'sun' ? 'Start at Home' : `Meet ${world.name}`,
  target: { kind: 'world', id: world.id },
  instruction: `Travel to ${world.name}. Orbit or approach it, then compare what you see with the explanation.`,
  explanation: planetExplanations[world.id],
  accessibleAlternative: `${world.name} is listed as ${world.kind}. Its source record gives a radius of ${world.radius} and a distance of ${world.distance}. ${planetExplanations[world.id]} The 3D rendering is illustrative; these written values are available without seeing the canvas.`,
  claimIds: ['edu.solar-structure'],
  question: world.id === 'sun' ? question('system-gravity', 'Why do the planets orbit the Sun?', ['The Sun’s gravity attracts them while they move through space.', 'The glowing solar surface pushes them along.', 'There is no gravity beyond Earth.'], 0, 'Gravity acts between masses throughout the system. An orbit combines gravitational attraction with a body’s motion.')
    : world.id === 'earth' ? question('system-scale', 'How should you find a scientific distance in Helios?', ['Measure the separation between objects on the screen.', 'Read the AU or light-year value and its provenance.', 'Assume all planets have the same separation.'], 1, 'Display spacing and body sizes are transformed for navigation. Scientific AU and light-year records are kept separate from render coordinates.')
    : world.id === 'jupiter' ? question('system-giants', 'What are Jupiter’s visible bands?', ['A solid striped crust.', 'Clouds above a deep fluid planet.', 'Rings painted onto a rocky surface.'], 1, 'Jupiter’s bands are atmospheric clouds. Its hydrogen–helium atmosphere transitions into deep fluid layers with increasing pressure.')
    : world.id === 'neptune' ? question('system-families', 'Which grouping matches the planets in this lesson?', ['Four terrestrial planets, two gas giants and two ice giants.', 'Eight rocky planets.', 'Two terrestrial planets and six stars.'], 0, 'Mercury, Venus, Earth and Mars are terrestrial. Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants.')
    : undefined,
}));

export const lessons: EducationLesson[] = [
  {
    id: 'our-solar-system', title: 'Our Solar System', description: 'Visit the Sun and all eight planets. Learn what the picture shows and what the scientific values mean.', level: 'Beginner · no prior astronomy required',
    objectives: ['Identify the Sun and eight planets in orbital order.', 'Distinguish terrestrial planets, gas giants and ice giants.', 'Explain gravity and the difference between scientific distances and display spacing.'],
    stages: solarSystemStages,
  },
  {
    id: 'inside-the-sun', title: 'Inside the Sun', description: 'Use the existing cutaway to follow energy from fusion to escaping sunlight.', level: 'Beginner · introduces plasma and energy transport',
    objectives: ['Locate the core, radiative zone, convective zone and visible atmosphere.', 'Distinguish fusion, radiative transport and convection.', 'Explain why interior structure is modeled rather than photographed.'],
    stages: [
      { id: 'sun-core', title: 'Energy begins in the core', target: { kind: 'world', id: 'sun', layerIndex: 0 }, instruction: 'Open the Sun’s interior and select Core.', explanation: 'Hydrogen nuclei fuse into helium in the core. A small difference in mass is released as energy. This is nuclear fusion, not ordinary chemical burning. The core’s properties are inferred from models constrained by observations such as solar oscillations and neutrinos.', accessibleAlternative: 'The innermost region in the cutaway is Core, labeled inferred. It represents the fusion region. No camera has photographed a cross-section through the Sun; this is a teaching model with simplified boundaries.', claimIds: ['edu.sun-energy'], question: question('sun-fusion', 'What powers the Sun?', ['Chemical flames using oxygen.', 'Hydrogen fusion in the core.', 'Heat reflected from Earth.'], 1, 'Fusion changes hydrogen nuclei into helium and releases energy. Ordinary chemical burning cannot explain the Sun’s sustained energy output.') },
      { id: 'sun-radiative', title: 'Energy through radiation', target: { kind: 'world', id: 'sun', layerIndex: 1 }, instruction: 'Select the Radiative zone in the Sun’s cutaway.', explanation: 'In the radiative region, energy is transported mainly through radiation interacting with matter. This is not a clear window through which one photon travels straight from core to surface.', accessibleAlternative: 'The cutaway places Radiative zone outside Core and inside Convective zone. Its confidence is inferred. Radiation transports energy through repeated interactions with the plasma.', claimIds: ['edu.sun-energy'], question: question('sun-radiation', 'What is the main energy-transport process in this region?', ['Radiation interacting with matter.', 'A rocky conveyor belt.', 'A direct empty-space tunnel to the surface.'], 0, 'Radiation carries energy through this region, with many interactions. The neat boundary and colors are explanatory graphics.') },
      { id: 'sun-convective', title: 'Plasma rises and sinks', target: { kind: 'world', id: 'sun', layerIndex: 2 }, instruction: 'Select the Convective zone.', explanation: 'Convection transports energy through the motion of material: hotter plasma rises and cooler plasma sinks. Plasma is ionized material containing charged particles. The Sun does not have a conventional solid ground surface.', accessibleAlternative: 'Convective zone is the third region from the center. It is labeled inferred. Rising and sinking plasma is the key process; visible solar granulation is related to convection near the photosphere.', claimIds: ['edu.sun-energy'], question: question('sun-convection', 'What moves energy by convection?', ['Motion of hotter and cooler plasma.', 'Solid stone plates sliding on a crust.', 'Sunlight reflecting between planets.'], 0, 'Convection is energy transport by bulk material motion. Solar plasma rises, cools near the outer regions, and sinks.') },
      { id: 'sun-photosphere', title: 'The light we can observe', target: { kind: 'world', id: 'sun', layerIndex: 3 }, instruction: 'Select Photosphere + atmosphere, then compare its evidence with the interior regions.', explanation: 'The photosphere is the visible-light layer from which much of the sunlight escapes. The atmosphere extends beyond it. This combined teaching region includes observable features, while its cutaway shape remains illustrative. Helios’s orange exterior is an ultraviolet-inspired false-color visualization with accelerated activity, not the Sun’s literal visible-light color or a live feed.', accessibleAlternative: 'The outermost cutaway entry is Photosphere + atmosphere. The record includes measured observations of outer solar features, but the combined shell, colors and dimensions in this model are illustrative. The deep regions remain inferred.', claimIds: ['edu.sun-energy'], question: question('sun-evidence', 'Which description treats the cutaway evidence correctly?', ['Every layer is a direct photograph.', 'Outer observations and constrained interior models support different kinds of claims.', 'The model proves there is a solid shell.'], 1, 'Solar observations constrain the model, but they do not turn the interior cutaway into a photograph. Confidence applies to particular claims, not every pixel of a combined region.') },
    ],
  },
  {
    id: 'inside-the-planets', title: 'Inside the Planets', description: 'Compare rocky, gas-giant and ice-giant interiors, and examine how we know about inaccessible regions.', level: 'Beginner · introduces scientific inference',
    objectives: ['Compare Earth’s rocky mantle with giant-planet fluid regions.', 'Explain how indirect observations constrain interior models.', 'Separate measured properties from inferred boundaries and unknown structure.'],
    stages: [
      { id: 'planets-earth-mantle', title: 'Earth’s rocky mantle', target: { kind: 'world', id: 'earth', layerIndex: 2 }, instruction: 'Travel to Earth, open the interior and select Mantle.', explanation: 'Earth’s mantle is mainly silicate rock. It can flow slowly over geological time without being an ocean of ordinary liquid magma. Seismic waves, mass, gravity and laboratory physics help constrain the inaccessible deep interior.', accessibleAlternative: 'Earth’s cutaway lists Inner core, Outer core, Mantle and Crust + oceans. Mantle is an inferred deep-region model described as slow-flowing silicate rock. The layer’s size and color are simplified teaching choices.', claimIds: ['edu.planet-interiors'], question: question('planets-mantle', 'How do scientists investigate most of Earth’s mantle?', ['By photographing the entire mantle directly.', 'Through evidence such as seismic waves and physical models.', 'By assuming every planet has Earth’s layers.'], 1, 'Indirect observations such as seismic-wave behavior constrain models. Inferred does not mean arbitrary; it means the claim depends on a reasoned model of the evidence.') },
      { id: 'planets-jupiter-metal', title: 'Hydrogen under pressure', target: { kind: 'world', id: 'jupiter', layerIndex: 1 }, instruction: 'Travel to Jupiter, open its interior and select Metallic hydrogen.', explanation: 'At enormous pressure, hydrogen can become an electrically conducting fluid. “Metallic” describes this behavior; it does not mean a shell of ordinary solid metal. Jupiter’s interior structure is inferred from gravity, magnetic-field, composition and physical-model constraints.', accessibleAlternative: 'Jupiter’s Metallic hydrogen entry is labeled inferred and described as conducting fluid under immense pressure. The visible cloud atmosphere lies outside it. There is no conventional solid landing surface in this giant-planet model.', claimIds: ['edu.planet-interiors'], question: question('planets-metallic', 'What does metallic hydrogen mean here?', ['A conventional solid metal floor.', 'Hydrogen behaving as an electrically conducting fluid at high pressure.', 'A directly photographed iron layer.'], 1, 'Metallic hydrogen refers to conducting behavior under extreme conditions. The atlas does not establish a solid place to land or a directly observed layer boundary.') },
      { id: 'planets-neptune-fluid', title: 'What an ice giant contains', target: { kind: 'world', id: 'neptune', layerIndex: 1 }, instruction: 'Travel to Neptune, open its interior and select Volatile-rich interior.', explanation: 'Models of Neptune include a hot, compressed interior rich in compounds such as water, ammonia and methane. Its exact composition and internal structure remain uncertain. “Ice giant” does not imply accessible frozen ground or a measured internal ocean.', accessibleAlternative: 'Neptune’s three entries are Rocky core model, Volatile-rich interior and H/He atmosphere. The deep two regions are inferred. The inner cutaway is a pedagogical model; exact boundaries and phases are not direct observations.', claimIds: ['edu.planet-interiors'], question: question('planets-ice', 'Which statement is supported?', ['Neptune is a familiar frozen ice ball with a solid surface.', 'Its deep interior is modeled as hot, high-pressure material, with uncertainties.', 'Its interior has been photographed by a probe.'], 1, 'The name reflects a class of planets and important compounds, not a literal frozen surface. Deep structure is constrained through models and limited observations.') },
      { id: 'planets-radius-compare', title: 'Compare without guessing from pixels', target: { kind: 'world', id: 'neptune', compare: true }, instruction: 'Use the Earth comparison for Neptune and inspect the radius values.', explanation: `The included records give Earth a radius of ${worlds.find(w => w.id === 'earth')!.radius} and Neptune ${worlds.find(w => w.id === 'neptune')!.radius}. Neptune’s radius is about ${worlds.find(w => w.id === 'neptune')!.radiusEarth} Earth radii. Use these values rather than the transformed scene sizes. A radius ratio is not the same as a mass ratio.`, accessibleAlternative: `Written comparison: Earth radius ${worlds.find(w => w.id === 'earth')!.radius}, Neptune radius ${worlds.find(w => w.id === 'neptune')!.radius}, Neptune/Earth radius ratio ${worlds.find(w => w.id === 'neptune')!.radiusEarth}. These values come from the included world records, while render sizes are independently chosen for navigation.`, claimIds: ['edu.solar-structure', 'edu.planet-interiors'], question: question('planets-comparison', 'What does a radius comparison tell you?', ['The same ratio automatically applies to mass.', 'How the measured/model-adopted sizes compare, independently of display scaling.', 'Which planet has a solid surface.'], 1, 'Radius compares size. Mass also depends on density and structure, and the atlas’s render scale is a separate transformation.') },
    ],
  },
  {
    id: 'beyond-our-solar-system', title: 'Beyond Our Solar System', description: 'Travel to a cataloged nearby star and a confirmed exoplanet, then return Home with a clearer sense of evidence.', level: 'Beginner · introduces light-years and planet detection',
    objectives: ['Use a light-year as a distance unit.', 'Recognize stellar classifications and snapshot-based positions.', 'Distinguish planet confirmation, inferred size and unknown appearance.'],
    stages: [
      { id: 'beyond-proxima', title: 'A nearby stellar neighbor', target: { kind: 'stellar', id: 'proxima-centauri' }, instruction: 'Travel to Proxima Centauri in the same scene and inspect its catalog information.', explanation: 'A light-year is the distance light travels in one year, not a measure of time. Proxima Centauri is classified as an M-type red dwarf. Stellar classifications describe properties of stars; the displayed star sizes and colors are interpretations. Helios uses a dated catalog snapshot and a disclosed fixed-epoch motion approximation rather than live positions.', accessibleAlternative: 'Proxima Centauri’s catalog entry is an M-type red dwarf with catalog-backed astrometry. Its distance is derived from source parallax. Positions originate in ICRS J2000 and are propagated with the atlas’s fixed-epoch linear model; the background star field has no catalog identities.', claimIds: ['edu.light-year', 'edu.stellar-types'], question: question('beyond-light-year', 'What is a light-year?', ['The age of a star.', 'A unit of distance.', 'A unit of mass.'], 1, 'It is the distance light travels in one year. A distant object’s light also takes time to arrive, but the unit itself expresses distance.') },
      { id: 'beyond-proxima-b', title: 'A planet around another star', target: { kind: 'exoplanet', id: 'proxima-centauri-b' }, instruction: 'Approach Proxima Centauri b and inspect its evidence.', explanation: 'An exoplanet is a planet outside our Solar System. Proxima Centauri b is included as confirmed in the preserved NASA Exoplanet Archive snapshot. Its radial-velocity detection uses the star’s motion along our line of sight. The planet’s model radius and rendered appearance are not direct surface measurements.', accessibleAlternative: 'The preserved record for Proxima Centauri b labels discovery by radial velocity, radius inferred and appearance illustrative. The atlas does not claim observed continents, oceans, life or a measured atmosphere. Confirmation concerns evidence for a planet; it does not mean a surface photograph exists.', claimIds: ['edu.exoplanets', 'edu.mass-radius'], question: question('beyond-confirmed', 'Does “confirmed exoplanet” mean its surface has been photographed?', ['Yes, the render is the photograph.', 'No, detection can establish a planet while its surface remains unknown.', 'Yes, all confirmed planets have measured oceans.'], 1, 'Confirmation and surface knowledge are different questions. Radial-velocity observations can establish a planet and constrain a minimum or dynamical mass without showing its surface.') },
      { id: 'beyond-detection', title: 'Read a detection without overclaiming', target: { kind: 'stellar', id: 'proxima-centauri' }, instruction: 'Return to the Proxima system view and compare the host star with its planet record.', explanation: 'A radial-velocity signal measures changes in a star’s motion along the line of sight. Depending on the available orbital information, a planet’s reported mass can be a minimum mass rather than its true mass. A radius calculated from other parameters is inferred. A missing value must remain unknown rather than being silently replaced with zero.', accessibleAlternative: 'Read the records as separate claims: catalog position from astrometry, planet detection from observations and analysis, minimum/dynamical mass according to provenance, model-derived radius as inferred, and visual appearance as illustrative. The evidence category of one claim does not transfer to every other claim.', claimIds: ['edu.exoplanets', 'edu.mass-radius'], question: question('beyond-inference', 'How should an inferred radius be described?', ['As a direct measurement of the surface.', 'As a model-dependent estimate with its source and limitations.', 'As exact because the planet is confirmed.'], 1, 'A calculated or modeled radius should retain inferred confidence. Confirmation of a planet does not remove uncertainty in each individual property.') },
      { id: 'beyond-home', title: 'Return Home', target: { kind: 'home' }, instruction: 'Return to the Solar System overview. Ordinary exploration will remain available when you exit.', explanation: 'You have traveled between real catalog-backed destinations without replacing the universe or its renderer. Remember the distinction between astronomical records, modeled properties and illustrative presentation. Keep asking what was observed, what was inferred and what remains unknown.', accessibleAlternative: 'Home is the Solar System reference frame. Leaving Education restores ordinary exploration controls; the written lessons and source disclosures remain available whenever you return. This text route provides the same conceptual recap without depending on the visual journey.', claimIds: ['edu.exoplanets'], question: question('beyond-summary', 'Which habit makes an astronomical visualization scientifically useful?', ['Treat every rendered detail as directly observed.', 'Inspect the source, confidence and limitations of each claim.', 'Assume missing information means a measured zero.'], 1, 'Useful visualizations separate records from models and appearance. Source and confidence information help you interpret what the picture can and cannot establish.') },
    ],
  },
];

export const EDUCATION_STORAGE_KEY = 'helios.education.progress.v1';
export const EDUCATION_CONTENT_VERSION = 'education-1.0.0-rc.1';

export type EducationSession = {
  version: typeof EDUCATION_CONTENT_VERSION;
  lessonId: string | null;
  stageIndex: number;
  status: 'library' | 'active' | 'paused' | 'completed';
  attemptCompleted: boolean;
  observedStageIds: string[];
  alternativeStageIds: string[];
  answers: Record<string, string>;
  completedLessonIds: string[];
};

export function initialEducationSession(): EducationSession {
  return { version: EDUCATION_CONTENT_VERSION, lessonId: null, stageIndex: 0, status: 'library', attemptCompleted: false, observedStageIds: [], alternativeStageIds: [], answers: {}, completedLessonIds: [] };
}

export function getEducationLesson(id: string | null) { return lessons.find(lesson => lesson.id === id); }
export function currentEducationStage(session: EducationSession) { return getEducationLesson(session.lessonId)?.stages[session.stageIndex]; }
export function educationResumeLabel(session: EducationSession) {
  const lesson = getEducationLesson(session.lessonId);
  return lesson ? session.attemptCompleted ? `Review completion: ${lesson.title}` : `Resume ${lesson.title} · stage ${session.stageIndex + 1}` : null;
}
export function targetObserved(target: EducationTarget, observed?: EducationObserved) {
  if (!observed) return false;
  if (target.kind === 'home') return !observed.worldId && !observed.stellarId && !observed.exoplanetId && !observed.interiorMode;
  if (target.kind === 'stellar') return observed.stellarId === target.id && !observed.exoplanetId;
  if (target.kind === 'exoplanet') return observed.exoplanetId === target.id;
  return observed.worldId === target.id
    && (target.layerIndex === undefined || (observed.interiorMode && observed.layerIndex === target.layerIndex))
    && (!target.compare || observed.compareOpen);
}
export function stageCanAdvance(session: EducationSession) {
  const stage = currentEducationStage(session);
  return Boolean(stage && (session.observedStageIds.includes(stage.id) || session.alternativeStageIds.includes(stage.id))
    && (!stage.question || stage.question.options.some(option => option.id === session.answers[stage.id])));
}

export type EducationAction =
  | { type: 'start'; lessonId: string }
  | { type: 'observe'; observed: EducationObserved }
  | { type: 'alternative' }
  | { type: 'answer'; optionId: string }
  | { type: 'next' | 'back' | 'pause' | 'resume' | 'library' | 'clear' | 'retry-question' | 'retake-questions' };

export function educationReducer(session: EducationSession, action: EducationAction): EducationSession {
  if (action.type === 'clear') return initialEducationSession();
  if (action.type === 'start') {
    if (!getEducationLesson(action.lessonId)) return session;
    return { ...initialEducationSession(), lessonId: action.lessonId, status: 'active', completedLessonIds: session.completedLessonIds };
  }
  if (action.type === 'pause') return session.lessonId && session.status === 'active' ? { ...session, status: 'paused' } : session;
  if (action.type === 'resume') return session.lessonId ? { ...session, status: session.attemptCompleted ? 'completed' : 'active' } : session;
  if (action.type === 'library') return { ...session, status: 'library' };
  if (action.type === 'retake-questions' && getEducationLesson(session.lessonId)) return { ...session, answers: {}, stageIndex: 0, status: 'active', attemptCompleted: false };
  if (session.status !== 'active') return session;
  const lesson = getEducationLesson(session.lessonId);
  const stage = currentEducationStage(session);
  if (!lesson || !stage) return initialEducationSession();
  if (action.type === 'retry-question') {
    const answers = { ...session.answers };
    delete answers[stage.id];
    return { ...session, answers, attemptCompleted: false };
  }
  if (action.type === 'observe' && targetObserved(stage.target, action.observed) && !session.observedStageIds.includes(stage.id)) return { ...session, observedStageIds: [...session.observedStageIds, stage.id] };
  if (action.type === 'alternative' && !session.alternativeStageIds.includes(stage.id)) return { ...session, alternativeStageIds: [...session.alternativeStageIds, stage.id] };
  if (action.type === 'answer' && stage.question?.options.some(option => option.id === action.optionId)) return { ...session, answers: { ...session.answers, [stage.id]: action.optionId } };
  if (action.type === 'back' && session.stageIndex > 0) return { ...session, stageIndex: session.stageIndex - 1 };
  if (action.type === 'next' && stageCanAdvance(session)) {
    if (session.stageIndex < lesson.stages.length - 1) return { ...session, stageIndex: session.stageIndex + 1 };
    return { ...session, status: 'completed', attemptCompleted: true, completedLessonIds: [...new Set([...session.completedLessonIds, lesson.id])] };
  }
  return session;
}

/** Untrusted browser storage is bounded, versioned and reconstructed, never spread into state. */
export function parseEducationSession(raw: string | null): EducationSession {
  if (!raw || raw.length > 50000) return initialEducationSession();
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== EDUCATION_CONTENT_VERSION) return initialEducationSession();
    const lesson = getEducationLesson(typeof value.lessonId === 'string' ? value.lessonId : null);
    const completedLessonIds: string[] = Array.isArray(value.completedLessonIds) ? [...new Set<string>((value.completedLessonIds as unknown[]).filter((id): id is string => typeof id === 'string' && Boolean(getEducationLesson(id))))] : [];
    if (!lesson) return { ...initialEducationSession(), completedLessonIds };
    if (!Number.isInteger(value.stageIndex) || value.stageIndex < 0 || value.stageIndex >= lesson.stages.length) return { ...initialEducationSession(), completedLessonIds };
    const stageIds = new Set(lesson.stages.map(stage => stage.id));
    const list = (input: unknown): string[] => Array.isArray(input) ? [...new Set<string>((input as unknown[]).filter((id): id is string => typeof id === 'string' && stageIds.has(id)))] : [];
    const answers: Record<string, string> = {};
    if (value.answers && typeof value.answers === 'object') for (const stage of lesson.stages) {
      const answer: unknown = value.answers[stage.id];
      if (typeof answer === 'string' && stage.question?.options.some(option => option.id === answer)) answers[stage.id] = answer;
    }
    const session: EducationSession = { version: EDUCATION_CONTENT_VERSION, lessonId: lesson.id, stageIndex: value.stageIndex, status: ['library', 'active', 'paused', 'completed'].includes(value.status) ? value.status : 'paused', attemptCompleted: false, observedStageIds: list(value.observedStageIds), alternativeStageIds: list(value.alternativeStageIds), answers, completedLessonIds };
    // A corrupt/stale completed flag cannot manufacture completion without all evidence.
    const allDone = lesson.stages.every(stage => (session.observedStageIds.includes(stage.id) || session.alternativeStageIds.includes(stage.id)) && (!stage.question || stage.question.options.some(option => option.id === answers[stage.id])));
    // Current-attempt completion is distinct from a historical lesson marker.
    // Migrate an older library snapshot only when every stage still has evidence.
    session.attemptCompleted = allDone && session.stageIndex === lesson.stages.length - 1
      && (value.attemptCompleted === true || value.status === 'completed' || (value.attemptCompleted === undefined && value.status === 'library'));
    if (session.status === 'completed' && !allDone) session.status = 'paused';
    return session;
  } catch { return initialEducationSession(); }
}

export function educationTargetLabel(target: EducationTarget) {
  if (target.kind === 'home') return 'Return Home';
  if (target.kind === 'stellar') return 'Travel to Proxima Centauri';
  if (target.kind === 'exoplanet') return 'Approach Proxima Centauri b';
  const world = worlds.find(world => world.id === target.id);
  if (!world) return 'Visit scene target';
  return target.layerIndex !== undefined ? `Inspect ${world.name}: ${world.layers[target.layerIndex]?.name ?? 'interior'}` : target.compare ? `Compare ${world.name} with Earth` : `Travel to ${world.name}`;
}
