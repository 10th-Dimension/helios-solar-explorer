import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getEventListeners } from 'node:events';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { worlds } from '../app/worlds.ts';
import { localStellarObjects, distanceLightYears } from '../app/stellar.ts';
import { getDestinationSystemByAnchor } from '../app/destinationSystems.ts';
import { shouldRebaseRenderOrigin } from '../app/cosmicCoordinates.ts';

// Exercise the real controller callbacks and drift block without a WebGL/DOM
// dependency. These controlled event/effect tests do not replace browser checks.
function source(file) {
  return ts.createSourceFile(file, readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}
function findAll(node, predicate, result = []) {
  if (predicate(node)) result.push(node);
  ts.forEachChild(node, child => { findAll(child, predicate, result); });
  return result;
}
function compile(text) {
  return ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
}
function expression(node, file, context) {
  assert.ok(node, 'Expected source expression');
  return vm.runInContext(compile(`(${node.getText(file)})`), context);
}
function variable(file, name) {
  return findAll(file, node => ts.isVariableDeclaration(node) && node.name.getText(file) === name)[0];
}
function attribute(element, name) {
  return element.attributes.properties.find(prop => prop.name?.getText() === name).initializer.expression;
}

const page = source('app/page.tsx');
const effect = findAll(page, node => ts.isCallExpression(node) && node.expression.getText(page) === 'useEffect'
  && node.arguments[1]?.getText(page).includes('educationTarget'))[0];
assert.ok(effect, 'Find the pending Education arrival effect');
function pageController() {
  const microtasks = [];
  const context = vm.createContext({ worlds, queueMicrotask: callback => microtasks.push(callback) });
  for (const setter of findAll(page, node => ts.isIdentifier(node) && /^set[A-Z]/.test(node.text))) {
    const key = setter.text[3].toLowerCase() + setter.text.slice(4);
    context[setter.text] = value => { context[key] = typeof value === 'function' ? value(context[key]) : value; };
  }
  Object.assign(context, {
    focusedId: null, arrivedStellarId: null, selectedExoplanetId: null,
    educationOpen: true, educationTarget: null, interiorMode: false,
    activeLayer: 0, compareOpen: false, minimalUi: false, quickTravelOpen: false,
    sceneUnavailable: false, travelTo: null, detailOpen: false, spatialScale: 'SYSTEM',
    experienceMode: 'EXPLORE', arrivalSelectionRef: { current: null },
    stellarTravelRequest: { sequence: 0 }, exoplanetFocusRequest: { sequence: 0 },
    systemObjectFocusRequest: { sequence: 0 }, focusRequest: { sequence: 0 },
  });
  for (const name of ['closeEducation', 'travelToWorld', 'handleArrival', 'navigateEducation', 'toggleMinimalUi', 'handleSceneUnavailable', 'returnToSystem']) {
    const declaration = variable(page, name);
    if (declaration) context[name] = expression(declaration.initializer.arguments[0], page, context);
  }
  const readable = variable(page, 'canReadWorld');
  if (readable) Object.defineProperty(context, 'canReadWorld', { get: () => expression(readable.initializer, page, context) });
  let previousDependencies, cleanup;
  const renderEffect = () => {
    const dependencies = expression(effect.arguments[1], page, context);
    if (previousDependencies && dependencies.every((value, index) => Object.is(value, previousDependencies[index]))) return;
    cleanup?.();
    previousDependencies = dependencies;
    // Capture each render's values, as a React effect closure does.
    const names = ['educationOpen', 'educationTarget', 'focusedId', 'arrivedStellarId', 'selectedExoplanetId'];
    const callback = vm.runInContext(compile(`((${names.join(',')}) => (${effect.arguments[0].getText(page)}))(${names.join(',')})`), context);
    cleanup = callback();
  };
  return { context, renderEffect, flush: () => { while (microtasks.length) microtasks.shift()(); } };
}
function headerClick(label, context) {
  const button = findAll(page, node => ts.isJsxElement(node) && node.openingElement.tagName.getText(page) === 'button'
    && node.children.some(child => ts.isJsxText(child) && child.text.trim() === label))[0];
  assert.ok(button, `Find ${label} button`);
  expression(attribute(button.openingElement, 'onClick'), page, context)();
}

await test('Dismissal cancels pending interior and comparison actions', async t => {
  for (const target of [{ kind: 'world', id: 'earth', layerIndex: 2 }, { kind: 'world', id: 'neptune', compare: true }]) {
    for (const dismiss of ['CATALOG', 'WORLDS', 'HIDE HUD', 'EDUCATION', 'Exit']) {
      await t.test(`${target.id}: ${dismiss}`, () => {
        const { context, renderEffect, flush } = pageController();
        context.navigateEducation(target);
        renderEffect(); flush();
        if (dismiss === 'Exit') {
          const panel = findAll(page, node => ts.isJsxSelfClosingElement(node) && node.tagName.getText(page) === 'EducationPanel')[0];
          expression(attribute(panel, 'onClose'), page, context)();
        } else headerClick(dismiss, context);
        renderEffect(); flush();
        context.handleArrival(target.id);
        renderEffect(); flush();
        assert.equal(context.educationOpen, false);
        assert.equal(context.interiorMode, false, 'Dismissed lesson must not open an interior');
        assert.equal(context.compareOpen, false, 'Dismissed lesson must not open a comparison');
        assert.equal(context.educationTarget, null, 'Dismissal invalidates the pending target');
        if (dismiss === 'CATALOG') assert.equal(context.experienceMode, 'CATALOG');
      });
    }
  }
});
await test('Open Education still applies targets only after matching arrival', () => {
  for (const target of [{ kind: 'world', id: 'earth', layerIndex: 2 }, { kind: 'world', id: 'neptune', compare: true }]) {
    const { context, renderEffect, flush } = pageController();
    context.navigateEducation(target);
    renderEffect(); flush();
    assert.equal(context.interiorMode, false);
    assert.equal(context.compareOpen, false);
    context.handleArrival('mars'); renderEffect(); flush();
    assert.equal(context.educationTarget, target);
    context.handleArrival(target.id); renderEffect(); flush();
    assert.equal(context.educationTarget, null);
    assert.equal(context.interiorMode, target.layerIndex !== undefined);
    if (target.layerIndex !== undefined) assert.equal(context.activeLayer, target.layerIndex);
    assert.equal(context.compareOpen, Boolean(target.compare));
  }
});
await test('Closed Education ignores stale targets and cancels queued arrival effects', () => {
  const { context, renderEffect, flush } = pageController();
  context.educationTarget = { kind: 'world', id: 'earth', layerIndex: 2 };
  context.focusedId = 'earth';
  renderEffect(); // Queue a matching arrival; closure still sees the open panel.
  context.educationOpen = false;
  renderEffect(); // Changing open state must clean up the old effect.
  flush();
  assert.equal(context.interiorMode, false);
  assert.equal(context.compareOpen, false);
});

const scene = source('app/SolarSystemScene.tsx');
const render = variable(scene, 'render').initializer;
const movementStatements = render.body.statements.filter(statement => ts.isIfStatement(statement)
  && (statement.expression.getText(scene).includes('pressed.size') || statement.getText(scene).includes('pressed.clear()')));
assert.ok(movementStatements.length, 'Find the actual frame movement path');
class Element {
  constructor(tag, parent = null) { this.tag = tag; this.parent = parent; }
  matches(selector) { return selector.split(',').some(part => part.trim() === this.tag); }
  closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector) ?? null; }
}
function sceneController() {
  const camera = new THREE.PerspectiveCamera(); camera.position.set(0, 0, 100);
  const context = vm.createContext({
    THREE, camera, HTMLElement: Element, modal: null, pressed: new Set(), delta: 1 / 60,
    controls: { target: new THREE.Vector3() }, followingRef: { current: true },
    runtime: { transition: null, stellarTravel: null, focusedId: null, cosmicScale: 'STELLAR_SYSTEM' },
  });
  context.document = { querySelector: selector => selector === 'dialog[open]' ? context.modal : null };
  const events = new EventTarget();
  context.window = events;
  const eventNames = ['keydown', 'keyup', 'blur'];
  const registrations = findAll(scene, node => ts.isCallExpression(node) && node.expression.getText(scene) === 'window.addEventListener'
    && eventNames.includes(node.arguments[0]?.text));
  for (const call of registrations) {
    const name = call.arguments[1].getText(scene);
    context[name] = expression(variable(scene, name).initializer, scene, context);
    expression(call, scene, context);
  }
  const cleanup = () => {
    for (const call of findAll(scene, node => ts.isCallExpression(node) && node.expression.getText(scene) === 'window.removeEventListener'
      && eventNames.includes(node.arguments[0]?.text))) expression(call, scene, context);
    for (const name of eventNames) assert.equal(getEventListeners(events, name).length, 0, `Clean up ${name} listener`);
  };
  const down = expression(variable(scene, 'onKeyDown').initializer, scene, context);
  const up = expression(variable(scene, 'onKeyUp').initializer, scene, context);
  const frame = () => vm.runInContext(compile(movementStatements.map(node => node.getText(scene)).join('\n')), context);
  return { context, down, up, frame, events, cleanup };
}
await test('Modal summaries/links, editable descendants and prevented keys do not drift', () => {
  for (const target of [new Element('summary', new Element('dialog')), new Element('a', new Element('dialog')),
    new Element('span', new Element('button')), new Element('span', new Element('[contenteditable="true"]'))]) {
    const { context, down, frame } = sceneController();
    down({ key: 'w', target, defaultPrevented: false }); frame();
    assert.equal(context.pressed.size, 0, `${target.tag} must not seed movement`);
    assert.equal(context.camera.position.z, 100);
    assert.equal(context.controls.target.lengthSq(), 0);
  }
  const { context, down, frame } = sceneController();
  down({ key: 'w', target: new Element('canvas'), defaultPrevented: true }); frame();
  assert.equal(context.pressed.size, 0);
  assert.equal(context.camera.position.z, 100);
});
await test('An open dialog stops held movement; fresh scene input works after closing', () => {
  const { context, down, up, frame } = sceneController();
  const canvas = new Element('canvas');
  down({ key: 'w', target: canvas, defaultPrevented: false }); frame();
  assert.ok(context.camera.position.z < 100, 'Ordinary scene movement still works');
  const before = context.camera.position.clone(), targetBefore = context.controls.target.clone();
  context.modal = new Element('dialog');
  frame();
  assert.equal(context.camera.position.distanceTo(before), 0, 'Held key cannot move behind a modal');
  assert.equal(context.controls.target.distanceTo(targetBefore), 0);
  assert.equal(context.pressed.size, 0);
  down({ key: 'w', target: canvas, defaultPrevented: false });
  assert.equal(context.pressed.size, 0, 'Global modal guard also covers events outside the dialog');
  up({ key: 'w' });
  context.modal = null; frame();
  assert.equal(context.camera.position.distanceTo(before), 0, 'Closing the modal must not resume old movement');
  down({ key: 'w', target: canvas, defaultPrevented: false }); frame();
  assert.ok(context.camera.position.distanceTo(before) > 0);
  up({ key: 'w' });
  assert.equal(context.pressed.size, 0);
});

const sceneEffects = findAll(scene, node => ts.isCallExpression(node) && node.expression.getText(scene) === 'useEffect');
const initialization = sceneEffects.find(node => node.arguments[0].getText(scene).includes('new THREE.WebGLRenderer'));
function failRenderer(context) {
  const timers = new Map();
  let timerId = 0;
  const sceneElement = findAll(page, node => ts.isJsxSelfClosingElement(node) && node.tagName.getText(page) === 'SolarSystemScene')[0];
  const notification = sceneElement.attributes.properties.find(prop => prop.name?.getText(page) === 'onUnavailable');
  const sceneContext = vm.createContext({
    hostRef: { current: {} }, runtimeRef: { current: null },
    THREE: { WebGLRenderer: class { constructor() { throw new Error('Controlled WebGL initialization failure'); } } },
    setWebglError: value => { sceneContext.webglError = value; },
    onUnavailableRef: { current: notification ? expression(notification.initializer.expression, page, context) : () => {} },
    window: { setTimeout: callback => { timers.set(++timerId, callback); return timerId; }, clearTimeout: id => timers.delete(id) },
  });
  const cleanup = expression(initialization.arguments[0], scene, sceneContext)();
  return { sceneContext, cleanup, flush: () => { for (const callback of timers.values()) callback(); timers.clear(); } };
}
const dock = findAll(page, node => ts.isBinaryExpression(node) && ts.isJsxElement(node.right)
  && node.right.openingElement.attributes.properties.some(prop => prop.name?.getText(page) === 'className' && prop.initializer?.getText(page) === '"object-dock"'))[0];
const dockVisible = context => Boolean(expression(dock.left, page, context));
await test('Failed renderer recovers world information without fabricating a scene arrival', async t => {
  for (const pending of [false, true]) await t.test(pending ? 'failure after travel request' : 'failure before travel request', () => {
    const { context, renderEffect, flush } = pageController();
    if (pending) context.travelToWorld('earth');
    const failure = failRenderer(context); failure.flush();
    assert.equal(failure.sceneContext.webglError, true);
    assert.equal(failure.sceneContext.runtimeRef.current, null);
    if (!pending) context.travelToWorld('earth');
    console.log('Renderer failure state:', { pending, travelTo: context.travelTo?.id ?? null, focusedId: context.focusedId, detailOpen: context.detailOpen });
    assert.equal(context.travelTo, null, 'No renderer means no pending visual travel');
    assert.equal(context.detailOpen, true, 'Information opens on the selected world');
    assert.equal(context.selectedId, 'earth');
    assert.equal(context.focusedId, null, 'Reading a world is not a scene arrival');
    assert.equal(dockVisible(context), true, 'INFO remains available after closing the drawer');
    context.detailOpen = false; headerClick('INFO', context);
    assert.equal(context.detailOpen, true);
    context.travelToWorld('neptune');
    assert.equal(context.selectedId, 'neptune');
    assert.equal(context.travelTo, null); assert.equal(context.focusedId, null);
    assert.equal(context.detailOpen, true);
    context.educationOpen = true; context.navigateEducation({ kind: 'world', id: 'earth', layerIndex: 2 });
    // Reading information must not satisfy a lesson's scene-interaction gate.
    renderEffect(); flush();
    assert.equal(context.interiorMode, false);
    assert.equal(context.educationTarget.id, 'earth');
    let focused = false;
    const focusNode = findAll(page, node => ts.isJsxOpeningElement(node)
      && node.attributes.properties.some(prop => prop.name?.getText(page) === 'ref' && prop.initializer?.getText(page) === '{informationHeadingRef}'))[0];
    assert.ok(focusNode);
    const focusTarget = new Element(focusNode.tagName.getText(page));
    context.informationHeadingRef = { current: { focus() { focused = true; } } };
    const focusEffect = findAll(page, node => ts.isCallExpression(node) && node.expression.getText(page) === 'useEffect' && node.arguments[0].getText(page).includes('informationHeadingRef.current?.focus'))[0];
    assert.ok(focusEffect);
    expression(focusEffect.arguments[0], page, context)();
    assert.equal(focused, true, 'Move focus out of the now-inert travel rail into readable information');
    context.HTMLElement = Element;
    const keyboard = expression(variable(page, 'handleKey').initializer, page, context);
    context.experienceMode = 'EXPLORE';
    keyboard({ key: 'Escape', target: focusTarget }); assert.equal(context.detailOpen, false, 'Escape dismisses information from its autofocus target');
    keyboard({ key: 'i', target: focusTarget }); assert.equal(context.detailOpen, true, 'I works from the same focused element');
    context.detailOpen = false;
    keyboard({ key: 'i', target: null }); assert.equal(context.detailOpen, true, 'I reopens fallback information');
    keyboard({ key: 'x', target: null }); assert.equal(context.interiorMode, false, 'X cannot open a missing 3D interior');
    failure.cleanup();
  });
});
await test('Failure notification respects Home and cancellation; ordinary travel still requires arrival', () => {
  const { context } = pageController();
  context.travelToWorld('earth');
  assert.notEqual(context.travelTo, null); assert.equal(context.detailOpen, false); assert.equal(dockVisible(context), false);
  context.handleArrival('earth');
  assert.equal(context.travelTo, null); assert.equal(dockVisible(context), true);
  context.returnToSystem();
  const failure = failRenderer(context); failure.cleanup(); failure.flush();
  assert.equal(context.sceneUnavailable, false, 'Cancelled initialization must not notify the parent');
  const nextFailure = failRenderer(context); nextFailure.flush();
  assert.equal(context.sceneUnavailable, true);
  assert.equal(context.detailOpen, false, 'Home must not open the last selected world');
  assert.equal(dockVisible(context), false);
  nextFailure.cleanup();
});

await test('Stellar departure clears local focus through travel and arrival', () => {
  const target = localStellarObjects.find(object => object.id === 'barnards-star');
  const startTravel = sceneEffects.find(node => node.arguments[1]?.getText(scene) === '[stellarTravelRequest]');
  const travelFrame = render.body.statements.find(node => ts.isIfStatement(node) && node.expression.getText(scene) === 'runtime?.stellarTravel');
  const scale = variable(scene, 'scale');
  assert.ok(startTravel); assert.ok(travelFrame); assert.ok(scale);
  for (const prior of ['exoplanet', 'system-object']) {
    const camera = new THREE.PerspectiveCamera(); camera.position.set(0, 0, 100);
    const controls = { target: new THREE.Vector3(), enabled: true };
    const group = new THREE.Group(); group.position.set(500, 0, 0);
    const runtime = { camera, controls, stellarGroups: new Map([[target.id, group]]),
      focusedId: null, focusedExoplanetId: prior === 'exoplanet' ? 'proxima-centauri-b' : null,
      focusedSystemObjectId: prior === 'system-object' ? 'sirius-b' : null,
      transition: { targetId: 'old-target', targetDomain: prior }, stellarTravel: null,
      renderOriginOffset: new THREE.Vector3(), cosmicRoot: new THREE.Group() };
    const context = vm.createContext({ THREE, camera, controls, runtime, runtimeRef: { current: runtime },
      stellarTravelRequest: { targetId: target.id, distanceLightYears: 4 }, localStellarObjects, distanceLightYears,
      getDestinationSystemByAnchor, shouldRebaseRenderOrigin, easeInOutCubic: value => value,
      arrivedStellarRef: { current: null }, pauseAnimationsRef: { current: false }, activeFocus: null, distance: 100,
      window: { matchMedia: () => ({ matches: false }) }, performance: { now: () => 0 },
      onStellarTravelProgressRef: { current() {} },
      onStellarArriveRef: { current: id => { context.arrivedStellarRef.current = id; } },
    });
    expression(startTravel.arguments[0], scene, context)();
    assert.equal(runtime.transition, null, 'Departure cancels an old approach');
    assert.equal(expression(scale.initializer, scene, context), 'LOCAL_STELLAR');
    context.now = runtime.stellarTravel.duration / 2;
    vm.runInContext(compile(travelFrame.getText(scene)), context);
    assert.notEqual(runtime.stellarTravel, null);
    context.now = runtime.stellarTravel.duration;
    vm.runInContext(compile(travelFrame.getText(scene)), context);
    assert.equal(runtime.stellarTravel, null);
    assert.equal(context.arrivedStellarRef.current, target.id);
    console.log('Stellar arrival state:', { prior, focusedExoplanetId: runtime.focusedExoplanetId, focusedSystemObjectId: runtime.focusedSystemObjectId, scale: expression(scale.initializer, scene, context) });
    assert.equal(runtime.focusedExoplanetId, null, 'Departure releases an inspected planet');
    assert.equal(runtime.focusedSystemObjectId, null, 'Departure releases a local system body');
    assert.equal(expression(scale.initializer, scene, context), 'STELLAR_SYSTEM', 'Arrival cannot retain the old planetary scale');
  }
});
await test('Window blur releases every movement key and Shift even when keyup is lost', () => {
  for (const key of ['w', 'a', 's', 'd', 'q', 'e']) {
    const { context, frame, events, cleanup } = sceneController();
    const dispatch = (type, key) => { const event = new Event(type); Object.defineProperty(event, 'key', { value: key }); events.dispatchEvent(event); };
    dispatch('keydown', key); dispatch('keydown', 'Shift'); frame();
    assert.ok(context.camera.position.distanceTo(new THREE.Vector3(0, 0, 100)) > 0);
    events.dispatchEvent(new Event('blur')); // No keyup: released in another window.
    const position = context.camera.position.clone(), target = context.controls.target.clone();
    frame(); events.dispatchEvent(new Event('focus')); frame();
    console.log('Blur state:', { key, heldKeys: [...context.pressed], driftAfterBlur: context.camera.position.distanceTo(position) });
    assert.equal(context.pressed.size, 0, 'Blur clears the lost key and acceleration modifier');
    assert.equal(context.camera.position.distanceTo(position), 0, 'No background/resumed drift');
    assert.equal(context.controls.target.distanceTo(target), 0);
    dispatch('keydown', key); frame();
    assert.ok(context.camera.position.distanceTo(position) > 0, 'Fresh input after focus still moves');
    dispatch('keyup', key); assert.equal(context.pressed.size, 0);
    cleanup(); dispatch('keydown', key);
    assert.equal(context.pressed.size, 0, 'Unmount removes input listeners');
  }
});
