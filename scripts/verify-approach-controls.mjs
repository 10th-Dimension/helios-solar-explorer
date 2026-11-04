import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import {exoplanets} from '../app/exoplanets.ts';
import {stellarObjects, localStellarObjects, getStellarObject, getStellarSystem, separationLightYears} from '../app/stellar.ts';
import {worlds} from '../app/worlds.ts';

const source=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
const file=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function find(node,predicate,out=[]){if(predicate(node))out.push(node);ts.forEachChild(node,c=>{find(c,predicate,out);});return out;}
function compile(text){return ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;}
const context=vm.createContext({sceneUnavailable:false,minimalUi:false,experienceMode:'EXPLORE',exports:{},require:name=>{assert.equal(name,'react/jsx-runtime');return jsx;},ConfidenceMark:()=>null,SourceInspector:()=>null});
function expression(node){assert.ok(node);return vm.runInContext(`{${compile(`(${node.getText(file)})`)}}`,context);}
for(const name of find(file,n=>ts.isIdentifier(n)&&/^set[A-Z]/.test(n.text)).map(n=>n.text)){
  const key=name[3].toLowerCase()+name.slice(4); context[name]=value=>{context[key]=typeof value==='function'?value(context[key]):value;};
}
context.destinationInfoToggleRef={current:{focus(){context.focusRestored=true;}}};
for(const name of ['closeDestinationInformation','returnToDestinationSystem','handleDestinationKeyDown','selectExoplanet','selectSystemObject','applyArrivalSelection','approachExoplanet','approachSystemObject','handleExoplanetArrival','handleSystemObjectArrival']){
  const variable=find(file,n=>ts.isVariableDeclaration(n)&&n.name.getText(file)===name)[0];
  context[name]=expression(variable.initializer.arguments[0]);
}
const sections=find(file,n=>ts.isJsxElement(n)&&n.openingElement.tagName.getText(file)==='section');
function section(className){return sections.find(n=>n.openingElement.attributes.properties.some(p=>p.name?.getText(file)==='className'&&p.initializer?.text?.includes(className)));}
function nodes(n,predicate,out=[]){if(!n||typeof n!=='object')return out;if(Array.isArray(n)){for(const c of n)nodes(c,predicate,out);return out;}if(predicate(n))out.push(n);nodes(n.props?.children,predicate,out);return out;}
function text(n){return n==null||typeof n==='boolean'?'':Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n.props?.children):String(n);}
const render=type=>expression(section(type));
const button=(tree,label)=>nodes(tree,n=>n.type==='button'&&text(n)===label)[0];
const info=tree=>nodes(tree,n=>n.props?.className==='destination-information')[0];
let cases=0;
for(const [type,objects] of [['exoplanet-object-dock',exoplanets],['system-member-dock',stellarObjects.filter(o=>o.id!=='sol')]])for(const object of objects){
  const planet=type==='exoplanet-object-dock';
  const anchor=planet?object.hostStarId:getStellarSystem(object.systemId)?.primaryId??object.id;
  Object.assign(context,{selectedExoplanet:planet?object:null,selectedSystemObject:planet?null:object,
    selectedExoplanetId:planet?object.id:null,selectedSystemObjectId:planet?null:object.id,
    focusedExoplanetId:planet?object.id:null,focusedSystemObjectId:planet?null:object.id,
    arrivedStellarId:anchor,destinationSystem:{name:'Test system'},selectedDestinationOrbit:null,
    destinationInfoOpen:true,exoplanetFocusRequest:{targetId:planet?object.id:null,sequence:5},
    systemObjectFocusRequest:{targetId:planet?null:object.id,sequence:7},focusRestored:false,
    returnToSystem(){context.homeCalled=true;},homeCalled:false});
  const preserved=()=>JSON.stringify({selectedExoplanetId:context.selectedExoplanetId,selectedSystemObjectId:context.selectedSystemObjectId,focusedExoplanetId:context.focusedExoplanetId,focusedSystemObjectId:context.focusedSystemObjectId,arrivedStellarId:context.arrivedStellarId,exoplanetFocusRequest:context.exoplanetFocusRequest,systemObjectFocusRequest:context.systemObjectFocusRequest});
  for(let cycle=0;cycle<3;cycle++){
    let tree=render(type); assert.ok(info(tree)); const before=preserved();
    const close=button(tree,'CLOSE ×');assert.ok(close,object.name+' has a visible Close');assert.equal(close.props['aria-expanded'],true);
    close.props.onClick(); tree=render(type);
    assert.equal(info(tree),undefined);assert.equal(preserved(),before,'Closing info must not change selection, focus, host or camera request');assert.equal(context.focusRestored,true);
    const open=button(tree,'INFO');assert.ok(open);assert.equal(open.props['aria-expanded'],false);open.props.onClick();assert.ok(info(render(type)));
  }
  // Escape inside expanded evidence closes info first, then a second Escape
  // deliberately returns to the host system (distinct from closing info).
  let stopped=false,prevented=false; const before=preserved();
  context.handleDestinationKeyDown({key:'Escape',stopPropagation(){stopped=true;},preventDefault(){prevented=true;}});
  assert.ok(stopped&&prevented);assert.equal(context.destinationInfoOpen,false);assert.equal(preserved(),before);
  context.handleDestinationKeyDown({key:'Escape',stopPropagation(){},preventDefault(){}});
  assert.equal(context.selectedExoplanetId,null);assert.equal(context.selectedSystemObjectId,null);assert.equal(context.arrivedStellarId,anchor);assert.equal(context.exoplanetFocusRequest.targetId,null);assert.equal(context.systemObjectFocusRequest.targetId,null);
  context.applyArrivalSelection({kind:planet?'EXOPLANET':'SYSTEM_OBJECT',id:object.id});
  assert.equal(context.destinationInfoOpen,true,'A newly selected/arrived object opens its own information');
  button(render(type),'APPROACH').props.onClick();
  assert.equal((planet?context.exoplanetFocusRequest:context.systemObjectFocusRequest).targetId,object.id);
  (planet?context.handleExoplanetArrival:context.handleSystemObjectArrival)(object.id);
  assert.equal(button(render(type),'APPROACH'),undefined,'An arrived object must not offer another approach');
  button(render(type),'BACK TO SYSTEM').props.onClick();
  assert.equal(context.selectedExoplanetId,null);assert.equal(context.selectedSystemObjectId,null);assert.equal(context.arrivedStellarId,anchor);
  context.applyArrivalSelection({kind:planet?'EXOPLANET':'SYSTEM_OBJECT',id:object.id});
  button(render(type),'HOME').props.onClick();assert.equal(context.homeCalled,true);
  cases++;
}
for(const world of worlds){
  Object.assign(context,{focusedId:world.id,selectedId:world.id,detailOpen:true,interiorMode:true});
  for(const className of ['drawer-back','exit-interior']){
    const element=find(file,n=>ts.isJsxElement(n)&&n.openingElement.tagName.getText(file)==='button'&&n.openingElement.attributes.properties.some(p=>p.name?.getText(file)==='className'&&p.initializer?.text===className))[0];
    const onClick=element.openingElement.attributes.properties.find(p=>p.name?.getText(file)==='onClick');expression(onClick.initializer.expression)();
    assert.equal(context.focusedId,world.id);assert.equal(context.selectedId,world.id);
  }
  assert.equal(context.detailOpen,false);assert.equal(context.interiorMode,false);
}
console.log(`Approach controls: ${cases} catalog planet/star/member records × 3 close/reopen cycles preserve the current approach; scoped Escape, return-to-system and Home wiring pass. Solar information and interior close preserve all ${worlds.length} worlds. These production-handler tests do not replace rendered browser QA.`);
const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
assert.match(css,/\.space-stage\s*\{\s*height:100dvh;\s*overflow:clip;/,'Non-scrolling scene must not be a hidden scroll container; expanded evidence scrolls only its own panels');
Object.assign(context,{worlds,getStellarObject,separationLightYears,stellarEpoch:2026.81,sceneUnavailable:false,arrivalSelectionRef:{current:null},focusRequest:{targetId:null,sequence:0},stellarTravelRequest:{targetId:null,sequence:0},exoplanetFocusRequest:{targetId:null,sequence:0},systemObjectFocusRequest:{targetId:null,sequence:0}});
for(const name of ['returnToSystem','selectStellarObject','travelToStellarObject','beginStellarTravel','leaveDestinationSystem','refocusWorld']){
 const v=find(file,n=>ts.isVariableDeclaration(n)&&n.name.getText(file)===name)[0];context[name]=expression(v.initializer.arguments[0]);
}
const sceneSource=readFileSync(new URL('../app/SolarSystemScene.tsx',import.meta.url),'utf8');
const sceneFile=ts.createSourceFile('SolarSystemScene.tsx',sceneSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const labelButton=find(sceneFile,n=>ts.isJsxElement(n)&&n.openingElement.tagName.getText(sceneFile)==='button'&&n.openingElement.attributes.properties.some(p=>p.name?.getText(sceneFile)==='aria-label'&&p.initializer.getText(sceneFile).includes('Select ${label.name}')))[0];
const labelAction=labelButton.openingElement.attributes.properties.find(p=>p.name?.getText(sceneFile)==='onClick').initializer.expression;
context.onSelectStellarRef={current:context.selectStellarObject};
for(const target of localStellarObjects.filter(o=>o.id!=='sol')){
 Object.assign(context,{label:target,selectedStellarObject:target,arrivedStellarId:null,selectedExoplanetId:'old-planet',selectedSystemObjectId:'old-member'});
 vm.runInContext(`{${compile(`(${labelAction.getText(sceneFile)})`)}}`,context)();
 assert.equal(context.selectedStellarId,target.id);assert.equal(context.selectedExoplanetId,null);assert.equal(context.selectedSystemObjectId,null);
 context.beginStellarTravel();assert.equal(context.stellarTravelRequest.targetId,target.id);assert.ok(context.stellarTravel.totalLightYears>0);assert.equal(context.stellarTravel.status,'traveling');
 context.arrivedStellarId=target.id;context.leaveDestinationSystem();assert.equal(context.arrivedStellarId,null);
 context.returnToSystem();assert.equal(context.selectedStellarId,null);assert.equal(context.stellarTravelRequest.targetId,null);assert.equal(context.exoplanetFocusRequest.targetId,null);
}
const worldSection=sections.find(n=>n.openingElement.attributes.properties.some(p=>p.name?.getText(file)==='className'&&p.initializer?.text==='object-dock'));
for(const world of worlds){
 Object.assign(context,{world,selectedId:world.id,focusedId:world.id,following:true,interiorMode:false,detailOpen:false,dataOpen:false,auroraPreview:false,canReadWorld:true});
 let t=expression(worldSection);
 nodes(t,n=>n.type==='button'&&text(n).startsWith('INFO'))[0].props.onClick();assert.equal(context.detailOpen,true);assert.equal(context.interiorMode,false);
 nodes(t,n=>n.type==='button'&&text(n).startsWith('INTERIOR'))[0].props.onClick();assert.equal(context.detailOpen,false);assert.equal(context.interiorMode,true);assert.equal(context.activeLayer,world.layers.length-1);
 button(t,'RELEASE').props.onClick();assert.equal(context.following,false);t=expression(worldSection);button(t,'REFOCUS').props.onClick();assert.equal(context.following,true);assert.equal(context.focusRequest.targetId,world.id);
 button(t,'SCIENCE').props.onClick();assert.equal(context.dataOpen,true);
 const aurora=nodes(t,n=>n.type==='button'&&n.props['aria-label']==='Strong aurora preview')[0];assert.equal(Boolean(aurora),world.id==='earth');if(aurora){aurora.props.onClick();assert.equal(context.auroraPreview,true);assert.equal(context.interiorMode,false);aurora.props.onClick();assert.equal(context.auroraPreview,false);}
 button(t,'SYSTEM').props.onClick();assert.equal(context.focusedId,null);assert.equal(context.focusRequest.targetId,null);
}
console.log('Production label select/travel/leave/home contracts pass for all64 distant anchors; all9 world INFO/interior/release/refocus/science/system controls and Earth-only aurora toggle preserve intended state. Rendered coverage remains separately recorded.');
