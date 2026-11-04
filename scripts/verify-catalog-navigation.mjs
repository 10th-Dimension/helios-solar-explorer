import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { catalogObjects } from '../app/catalog.ts';
import { catalogPage } from '../app/catalogWindow.ts';
import {getStellarObject,getStellarSystem} from '../app/stellar.ts';
import {exoplanets} from '../app/exoplanets.ts';

// Run the actual production CatalogPanel and its handlers with controlled hooks.
// CSS contract checks below guard the known zero-height regression; rendered
// wheel/keyboard/touch behavior is verified separately in the browser.
const source = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const file = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const panel = file.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === 'CatalogPanel');
assert.ok(panel);
const state = []; let hook = 0, selectedId = 'proxima-centauri', traveled, closed = 0;
const context = vm.createContext({
  exports: {}, require: name => { assert.equal(name, 'react/jsx-runtime'); return jsx; },
  useState(initial) { const i = hook++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; },
  useMemo: fn => fn(), catalogObjects, catalogPage,
  useRef: () => ({current:null}), useEffect() {},
  getStellarObject: () => null, getExoplanet: () => null, SourceInspector: () => null,
});
vm.runInContext(ts.transpileModule(panel.getText(file), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, context);
function render(open = true, sceneUnavailable = false) {
  hook = 0;
  return context.CatalogPanel({ open, epoch: 2026.81, selectedId, sceneUnavailable, onSelect: id => { selectedId = id; }, onTravel: object => { traveled = object; }, onClose() {closed++;} });
}
function nodes(element, predicate, out = []) {
  if (!element || typeof element !== 'object') return out;
  if (Array.isArray(element)) { for (const child of element) nodes(child, predicate, out); return out; }
  if (predicate(element)) out.push(element);
  nodes(element.props?.children, predicate, out); return out;
}
const byClass = (tree, name) => nodes(tree, n => n.props?.className === name)[0];
const text = n => n == null || typeof n === 'boolean' ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.props?.children) : String(n);
let tree = render();
assert.equal(tree.props.tabIndex, 0, 'Open catalog is keyboard-scroll focusable');
assert.equal(render(false).props.tabIndex, -1);
for (const key of ['Escape','ArrowLeft','ArrowRight','ArrowDown','PageDown','Tab','w']) {
  let stopped = false, prevented = false;
  tree.props.onKeyDown({key, stopPropagation(){stopped=true;}, preventDefault(){prevented=true;}});
  assert.equal(stopped,true, `${key} cannot reach scene controls`);
  assert.equal(prevented,key==='Escape', 'Native scroll, typing and focus navigation remain available');
}
assert.equal(closed,1,'Escape closes the catalog regardless of descendant focus');
const filters = byClass(tree, 'catalog-filters');
nodes(filters, n => n.type === 'button').find(n => text(n) === 'PLANETARY SYSTEM').props.onClick();
tree = render();
const hosts = catalogObjects.filter(o => o.hasPlanets && o.distanceLightYears <= 100);
assert.equal(hosts.length, 9);
assert.equal(byClass(tree, 'catalog-pagination'), undefined, 'One page must not imply more entries behind disabled Next');
assert.equal(text(byClass(tree, 'catalog-page-summary')), 'All 9 objects are on this page.');
for (const object of hosts) {
  const row = nodes(byClass(tree, 'catalog-results'), n => n.type === 'button').find(n => text(n).includes(object.name));
  assert.ok(row, `${object.name} is rendered`); row.props.onClick(); tree = render();
  assert.equal(selectedId, object.id);
  assert.equal(byClass(tree, 'catalog-detail').props['aria-label'], `${object.name} catalog detail`);
  byClass(tree, 'catalog-travel').props.onClick();
  assert.equal(traveled.id, object.id); assert.equal(traveled.travelAnchorId, object.travelAnchorId);
  assert.deepEqual(traveled.arrivalSelection, object.arrivalSelection);
}
nodes(byClass(tree, 'catalog-filters'), n => n.type === 'button').find(n => text(n) === 'ALL').props.onClick();
tree = render(); const nav = byClass(tree, 'catalog-pagination');
assert.ok(nav); const next = nodes(nav, n => n.type === 'button').find(n => text(n) === 'Next');
assert.equal(next.props.disabled, false); next.props.onClick(); tree = render();
assert.equal(nodes(byClass(tree, 'catalog-results'), n => n.type === 'button')[0].props['aria-pressed'], true);
nodes(tree, n => n.type === 'input')[0].props.onChange({ target: { value: 'no-such-object-zz' } }); tree = render();
assert.equal(byClass(tree, 'catalog-travel'), undefined, 'Empty search cannot travel to a stale selection');
assert.match(text(byClass(tree, 'catalog-results')), /No objects match/);
assert.match(text(byClass(tree, 'catalog-page-summary')), /All 0 objects/);
nodes(tree,n=>n.type==='input')[0].props.onChange({target:{value:''}});tree=render();
const visited=[];
for(let pageIndex=0;pageIndex<catalogPage(catalogObjects,0).pages;pageIndex++){
  const expected=catalogPage(catalogObjects,pageIndex).items;
  for(const object of expected){
    const row=nodes(byClass(tree,'catalog-results'),n=>n.type==='button').find(n=>text(n).startsWith(object.name+object.category));
    assert.ok(row,`${object.name} is reachable on its page`);row.props.onClick();tree=render();
    assert.equal(byClass(tree,'catalog-detail').props['aria-label'],`${object.name} catalog detail`);
    byClass(tree,'catalog-travel').props.onClick();assert.equal(traveled.id,object.id);visited.push(object.id);
  }
  if(pageIndex+1<catalogPage(catalogObjects,0).pages){nodes(byClass(tree,'catalog-pagination'),n=>n.type==='button').find(n=>text(n)==='Next').props.onClick();tree=render();}
}
assert.deepEqual(visited,catalogObjects.map(o=>o.id),'Every real catalog row selects and submits its own target exactly once');
nodes(byClass(tree,'catalog-filters'),n=>n.type==='button').find(n=>text(n)==='PLANET').props.onClick();tree=render();
nodes(tree,n=>n.type==='select').find(n=>n.props['aria-label'].includes('spectral')||n.props['aria-label'].includes('Spectral')).props.onChange({target:{value:'M'}});tree=render();
const expectedMPlanets=exoplanets.filter(p=>getStellarObject(p.hostStarId).spectralType.replace(/^[a-z]+/,'').startsWith('M'));
assert.equal(nodes(byClass(tree,'catalog-results'),n=>n.type==='button').length,expectedMPlanets.length,'Planet spectrum filtering must use the real host class, not silently omit every planet');
const hostIds=new Set(exoplanets.map(p=>p.hostStarId));
const originalObject=object=>getStellarObject(object.category==='PLANET'?exoplanets.find(p=>p.id===object.id).hostStarId:object.id);
const categoryMatch=(object,category)=>{
 if(category==='ALL')return true;
 if(category==='PLANETARY SYSTEM')return hostIds.has(object.id);
 if(category==='MULTIPLES'){const star=getStellarObject(object.id);return Boolean(star&&getStellarSystem(star.systemId)?.architecture!=='single');}
 return object.category===category;
};
let filterCases=0;
for(const category of ['ALL','STAR','PLANET','PLANETARY SYSTEM','MULTIPLES','STELLAR REMNANT','BROWN DWARF']){
 nodes(byClass(tree,'catalog-filters'),n=>n.type==='button').find(n=>text(n)===category).props.onClick();tree=render();
 for(const distance of [10,20,100])for(const group of ['ALL','A','F','G','K','M','D','L','T','Y']){
  nodes(tree,n=>n.type==='select').find(n=>n.props['aria-label']==='Catalog distance').props.onChange({target:{value:String(distance)}});tree=render();
  nodes(tree,n=>n.type==='select').find(n=>n.props['aria-label'].includes('spectral')||n.props['aria-label'].includes('Spectral')).props.onChange({target:{value:group}});tree=render();
  const expected=catalogObjects.filter(o=>categoryMatch(o,category)&&o.distanceLightYears<=distance&&(group==='ALL'||originalObject(o).spectralType.replace(/^[a-z]+/,'').startsWith(group)));
  const rows=nodes(byClass(tree,'catalog-results'),n=>n.type==='button');assert.equal(rows.length,Math.min(24,expected.length),`${category}/${distance}/${group} result count`);
  assert.equal(nodes(byClass(tree,'catalog-refine'),n=>n.type==='span').map(text)[0],`${expected.length} OBJECTS`);
  for(let i=0;i<rows.length;i++)assert.ok(text(rows[i]).startsWith(expected[i].name+expected[i].category));
  filterCases++;
 }
}

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const panelCss = css.match(/^\.catalog-panel \{([^}]+)\}/m)?.[1];
const resultsCss = css.match(/^\.catalog-results \{([^}]+)\}/m)?.[1];
assert.ok(panelCss); assert.ok(resultsCss);
assert.match(panelCss, /grid-auto-rows:max-content/);
assert.match(panelCss, /overflow-y:auto/);
assert.match(panelCss, /touch-action:pan-y pinch-zoom/);
assert.doesNotMatch(panelCss, /grid-template-rows|overflow:hidden/);
assert.match(resultsCss, /overflow:visible/);
function findNode(node, predicate) {
  if (predicate(node)) return node;
  let found; ts.forEachChild(node, child => { found ??= findNode(child, predicate); }); return found;
}
const header = findNode(file, n => ts.isJsxOpeningElement(n) && n.tagName.getText(file) === 'header');
for (const minimalUi of [false,true]) for (const experienceMode of ['EXPLORE','CATALOG']) {
  for (const attributeName of ['inert','aria-hidden']) {
    const attribute = header.attributes.properties.find(p => p.name?.getText(file) === attributeName);
    assert.ok(attribute, 'Hidden toolbar must leave the focus/accessibility tree');
    assert.equal(vm.runInNewContext(attribute.initializer.expression.getText(file), {minimalUi,experienceMode}), minimalUi || experienceMode === 'CATALOG');
  }
}
state[0]='';state[1]='ALL';state[2]=100;state[3]='ALL';
for(let i=0;i<catalogObjects.length;i++){
 const object=catalogObjects[i];state[4]=Math.floor(i/24);selectedId=object.id;tree=render(true,true);
 const action=byClass(tree,'catalog-travel');assert.ok(action);
 assert.equal(byClass(tree,'catalog-detail').props['aria-label'],`${object.name} catalog detail`,'Fallback retains the actual selected catalog information');
 assert.equal(action.props.disabled,object.id!=='sol');traveled=null;action.props.onClick();
 assert.equal(traveled?.id??null,object.id==='sol'?'sol':null,'Disabled travel is also guarded against programmatic invocation');
 if(object.id!=='sol')assert.match(text(tree),/3D travel is unavailable/);
}
console.log('No-3D Catalog: all107 records remain inspectable;106 non-home travel actions are disabled and guarded; Home stays available.');
console.log('Catalog: actual production selection/travel handlers reach all 9 hosts; pagination, empty search, focus and single-scroll layout contracts pass. Browser geometry/input checks remain separate.');
console.log(`All ${visited.length} actual catalog entries across all pages select/inspect/travel with correct identity in production component tests.`);
console.log(`${filterCases} category/distance/star-or-host spectrum combinations match the original stellar/exoplanet data, including companions and23M-host planets.`);
