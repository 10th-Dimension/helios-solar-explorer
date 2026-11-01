import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { worlds } from '../app/worlds.ts';

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
    experienceMode: 'EXPLORE', arrivalSelectionRef: { current: null },
    stellarTravelRequest: { sequence: 0 }, exoplanetFocusRequest: { sequence: 0 },
    systemObjectFocusRequest: { sequence: 0 }, focusRequest: { sequence: 0 },
  });
  for (const name of ['closeEducation', 'travelToWorld', 'handleArrival', 'navigateEducation', 'toggleMinimalUi']) {
    const declaration = variable(page, name);
    if (declaration) context[name] = expression(declaration.initializer.arguments[0], page, context);
  }
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
  const down = expression(variable(scene, 'onKeyDown').initializer, scene, context);
  const up = expression(variable(scene, 'onKeyUp').initializer, scene, context);
  const frame = () => vm.runInContext(compile(movementStatements.map(node => node.getText(scene)).join('\n')), context);
  return { context, down, up, frame };
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
