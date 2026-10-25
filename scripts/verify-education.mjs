import assert from 'node:assert/strict';
import { worlds } from '../app/worlds.ts';
import { stellarObjects } from '../app/stellar.ts';
import { exoplanets } from '../app/exoplanets.ts';
import { claimById } from '../app/science.ts';
import {
  EDUCATION_CONTENT_VERSION, currentEducationStage, educationReducer,
  getEducationLesson, initialEducationSession, lessons, parseEducationSession,
  stageCanAdvance, targetObserved,
} from '../app/education.ts';

const ids = new Set();
const questionIds = new Set();
assert.ok(lessons.length >= 4, 'At least four complete lessons must exist');
for (const lesson of lessons) {
  assert.ok(!ids.has(lesson.id), `Duplicate lesson identifier ${lesson.id}`); ids.add(lesson.id);
  assert.ok(lesson.description && lesson.level && lesson.objectives.length >= 3);
  assert.ok(lesson.stages.length >= 4);
  for (const stage of lesson.stages) {
    assert.ok(!ids.has(stage.id), `Duplicate stage identifier ${stage.id}`); ids.add(stage.id);
    for (const field of ['title', 'instruction', 'explanation', 'accessibleAlternative']) assert.ok(stage[field]?.length > 8, `${stage.id}: missing ${field}`);
    assert.ok(stage.claimIds.length > 0, `${stage.id}: no scientific references`);
    for (const claimId of stage.claimIds) assert.ok(claimById(claimId), `${stage.id}: missing claim ${claimId}`);
    const { target } = stage;
    if (target.kind === 'world') {
      const world = worlds.find(w => w.id === target.id); assert.ok(world, `${stage.id}: unknown world`);
      if (target.layerIndex !== undefined) assert.ok(Number.isInteger(target.layerIndex) && world.layers[target.layerIndex], `${stage.id}: invalid layer`);
    } else if (target.kind === 'stellar') assert.ok(stellarObjects.some(s => s.id === target.id), `${stage.id}: unknown star`);
    else if (target.kind === 'exoplanet') assert.ok(exoplanets.some(p => p.id === target.id && p.status === 'CONFIRMED'), `${stage.id}: unknown/unconfirmed planet`);
    else assert.equal(target.kind, 'home');
    if (stage.question) {
      const q = stage.question;
      assert.ok(!questionIds.has(q.id), `Duplicate question ${q.id}`); questionIds.add(q.id);
      assert.ok(q.prompt && q.explanation && q.options.length >= 2);
      assert.equal(new Set(q.options.map(o => o.id)).size, q.options.length);
      assert.equal(q.options.filter(o => o.id === q.correctOptionId).length, 1);
    }
  }
}
assert.deepEqual(new Set(getEducationLesson('our-solar-system').stages.map(s => s.target.id)), new Set(worlds.map(w => w.id)), 'Solar System lesson visits the Sun and all eight planets');

const blank = { worldId: null, layerIndex: null, stellarId: null, exoplanetId: null, compareOpen: false, interiorMode: false };
const observeTarget = target => target.kind === 'home' ? blank : target.kind === 'world' ? { ...blank, worldId: target.id, layerIndex: target.layerIndex ?? null, interiorMode: target.layerIndex !== undefined, compareOpen: Boolean(target.compare) } : target.kind === 'stellar' ? { ...blank, stellarId: target.id } : { ...blank, exoplanetId: target.id };

assert.equal(targetObserved({ kind: 'world', id: 'sun', layerIndex: 0 }, { ...blank, worldId: 'sun', layerIndex: 0 }), false, 'A layer cannot be reached while exterior mode is active');
assert.equal(targetObserved({ kind: 'world', id: 'neptune', compare: true }, { ...blank, worldId: 'neptune' }), false, 'Comparison must actually be open');
assert.equal(targetObserved({ kind: 'stellar', id: 'proxima-centauri' }, { ...blank, stellarId: 'proxima-centauri', exoplanetId: 'proxima-centauri-b' }), false, 'A focused planet is not the host-system stage');
assert.equal(targetObserved({ kind: 'home' }, { ...blank, stellarId: 'proxima-centauri' }), false);
assert.equal(targetObserved({ kind: 'home' }), false, 'No observation is not evidence of Home arrival');

let session = initialEducationSession();
assert.strictEqual(educationReducer(session, { type: 'start', lessonId: 'invented-system' }), session, 'Unknown lessons are refused');
session = educationReducer(session, { type: 'start', lessonId: lessons[0].id });
assert.equal(stageCanAdvance(session), false);
assert.strictEqual(educationReducer(session, { type: 'next' }), session, 'Next cannot skip an interaction or quiz');
assert.strictEqual(educationReducer(session, { type: 'answer', optionId: 'invented-answer' }), session);
session = educationReducer(session, { type: 'observe', observed: { ...blank, worldId: 'neptune' } });
assert.deepEqual(session.observedStageIds, [], 'Wrong destination cannot satisfy the current stage');
const first = currentEducationStage(session);
session = educationReducer(session, { type: 'answer', optionId: first.question.options.find(o => o.id !== first.question.correctOptionId).id });
session = educationReducer(session, { type: 'alternative' });
assert.equal(stageCanAdvance(session), false, 'Written alternative does not waive a wrong answer');
session = educationReducer(session, { type: 'answer', optionId: first.question.correctOptionId });
assert.equal(stageCanAdvance(session), true);
session = educationReducer(session, { type: 'pause' });
assert.equal(session.status, 'paused');
assert.strictEqual(educationReducer(session, { type: 'next' }), session, 'Paused lessons do not advance');
session = parseEducationSession(JSON.stringify(session));
assert.equal(session.status, 'paused');
assert.ok(session.alternativeStageIds.includes(first.id));
session = educationReducer(session, { type: 'resume' });
session = educationReducer(session, { type: 'next' });
assert.equal(session.stageIndex, 1);
session = educationReducer(session, { type: 'back' });
assert.equal(session.stageIndex, 0);

// Every stage must be finishable both through real observations and the text route.
for (const mode of ['scene', 'alternative']) {
  for (const lesson of lessons) {
    let state = educationReducer(initialEducationSession(), { type: 'start', lessonId: lesson.id });
    for (const stage of lesson.stages) {
      assert.equal(currentEducationStage(state).id, stage.id);
      state = educationReducer(state, mode === 'scene' ? { type: 'observe', observed: observeTarget(stage.target) } : { type: 'alternative' });
      if (stage.question) {
        state = educationReducer(state, { type: 'answer', optionId: stage.question.correctOptionId });
      }
      assert.equal(stageCanAdvance(state), true, `${mode}/${stage.id} cannot advance`);
      state = educationReducer(state, { type: 'next' });
    }
    assert.equal(state.status, 'completed', `${mode}/${lesson.id} incomplete`);
    assert.ok(state.completedLessonIds.includes(lesson.id));
    assert.equal(parseEducationSession(JSON.stringify(state)).status, 'completed');
    const restarted = educationReducer(state, { type: 'start', lessonId: lesson.id });
    assert.equal(restarted.stageIndex, 0); assert.deepEqual(restarted.answers, {}); assert.deepEqual(restarted.observedStageIds, []);
    assert.deepEqual(educationReducer(state, { type: 'clear' }), initialEducationSession());
  }
}

for (const raw of [null, '', '{broken', 'null', '[]', 'x'.repeat(50001), JSON.stringify({ version: 'stale', lessonId: lessons[0].id }), JSON.stringify({ version: EDUCATION_CONTENT_VERSION, lessonId: lessons[0].id, stageIndex: 900 })]) assert.deepEqual(parseEducationSession(raw), initialEducationSession());
const hostile = parseEducationSession(JSON.stringify({ version: EDUCATION_CONTENT_VERSION, lessonId: lessons[0].id, stageIndex: 0, status: 'completed', observedStageIds: ['bogus'], alternativeStageIds: [42], answers: { [first.id]: 'bogus' }, completedLessonIds: ['bogus'] }));
assert.equal(hostile.status, 'paused', 'Forged completed state is not accepted without stage evidence');
assert.deepEqual(hostile.answers, {}); assert.deepEqual(hostile.observedStageIds, []); assert.deepEqual(hostile.completedLessonIds, []);

console.log(`Verified ${lessons.length} complete lesson definitions, ${ids.size - lessons.length} stages, ${questionIds.size} sourced questions, actual target/layer references, observed interaction gates, all scene/text completion paths, wrong-answer retry, pause/resume/restart and bounded malformed/stale storage handling.`);
