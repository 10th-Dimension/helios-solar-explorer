import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import * as education from '../app/education.ts';
import {SIRIUS_FIT,siriusRelativeAtBesselianEpoch,julianToBesselianEpoch} from '../app/siriusOrbit.ts';
import {majorMoons,moonSizeRatio} from '../app/majorMoons.ts';
import {EPOCH_LIMITS,motionAvailability} from '../app/epochPolicy.ts';
import {localStellarObjects,stellarObjects,stellarSystems} from '../app/stellar.ts';
import {getDestinationSystemByAnchor} from '../app/destinationSystems.ts';

// Production JSX/functions with controlled React hooks. This verifies fallback
// decisions and outcome gates; a real no-WebGL browser check remains separate.
function harness(file,name,globals={}){
 const ast=ts.createSourceFile(file,readFileSync(new URL('../app/'+file,import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(fn);
 const states=[];let hook=0;
 const context=vm.createContext({...globals,exports:{},require:n=>{assert.equal(n,'react/jsx-runtime');return jsx;},
  useState(initial){const i=hook++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return [states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];},
  useRef:()=>({current:null}),useEffect(){},useCallback:fn=>fn,queueMicrotask:fn=>fn(),
  window:{matchMedia:()=>({matches:true})},SourceInspector:()=>null,EducationResizeHandle:()=>null,
  WeatherPlayback:()=>null,PerformancePanel:()=>null,NearbyArchive:()=>null});
 vm.runInContext(ts.transpileModule(fn.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 return {states,render(props){hook=0;return context.exports[name](props);}};
}
function nodes(n,p,out=[]){if(!n||typeof n!=='object')return out;if(Array.isArray(n)){for(const c of n)nodes(c,p,out);return out;}if(p(n))out.push(n);nodes(n.props?.children,p,out);return out;}
const text=n=>n==null||typeof n==='boolean'?'':Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n.props?.children):String(n);
const button=(tree,label)=>nodes(tree,n=>n.type==='button'&&text(n)===label)[0];
let stages=0;
for(const lesson of education.lessons)for(let index=0;index<lesson.stages.length;index++){
 const stage=lesson.stages[index],h=harness('EducationPanel.tsx','EducationPanel',education),calls=[];
 const props={onClose(){},onNavigate:t=>calls.push(t),onResize(){},sceneUnavailable:true};
 h.render(props);h.states[0]={...education.educationReducer(education.initialEducationSession(),{type:'start',lessonId:lesson.id}),stageIndex:index};
 h.states[1]=true;h.states[2]=true; // failure while mobile scene view was selected
 let tree=h.render(props);
 assert.equal(tree.props['data-view'],'lesson','Renderer failure cannot leave the lesson hidden behind scene view');
 assert.equal(nodes(tree,n=>n.props?.id==='education-reading')[0].props.hidden,false);
 const travel=nodes(tree,n=>n.props?.className==='education-travel');
 assert.equal(travel.length,stage.target.kind==='home'?1:0,'Only Home remains a real no-3D navigation action');
 const alternative=nodes(tree,n=>n.props?.className==='education-alternative')[0];assert.equal(alternative.props.open,true);
 assert.ok(text(alternative).includes(stage.accessibleAlternative),'Preserve full actual teaching text');
 assert.equal(h.states[0].observedStageIds.length,0);assert.equal(h.states[0].alternativeStageIds.length,0,'Reading alone is not completion');
 button(tree,'Use this alternative for this stage').props.onClick();tree=h.render(props);
 assert.deepEqual(Array.from(h.states[0].alternativeStageIds),[stage.id]);assert.equal(h.states[0].observedStageIds.length,0);
 if(stage.question){const option=nodes(tree,n=>n.type==='input'&&n.props.value===stage.question.correctOptionId)[0];option.props.onChange();tree=h.render(props);}
 assert.equal(education.stageCanAdvance(h.states[0]),true,'Written route plus knowledge check remains usable');
 const next=nodes(tree,n=>n.type==='button'&&/^(Next stage|Complete lesson)/.test(text(n)))[0];assert.equal(next.props.disabled,false);next.props.onClick();
 assert.equal(h.states[0].stageIndex,index===lesson.stages.length-1?index:index+1);assert.equal(calls.length,0);
 // Same production button still forwards its exact target when rendering exists.
 h.states[0]={...education.educationReducer(education.initialEducationSession(),{type:'start',lessonId:lesson.id}),stageIndex:index};h.states[1]=false;
 tree=h.render({...props,sceneUnavailable:false});const normal=nodes(tree,n=>n.props?.className==='education-travel')[0];assert.ok(normal);normal.props.onClick();
 assert.equal(calls.length,1);assert.deepEqual(calls[0],stage.target);assert.equal(h.states[0].observedStageIds.length,0,'Submitting a request is not arriving');stages++;
}
const scienceGlobals={SIRIUS_FIT,siriusRelativeAtBesselianEpoch,julianToBesselianEpoch,majorMoons,moonSizeRatio,EPOCH_LIMITS,motionAvailability,localStellarObjects,stellarObjects,stellarSystems,getDestinationSystemByAnchor};
const science=harness('ScienceTools.tsx','ScienceTools',scienceGlobals),calls=[];
const props={epoch:2026.81,busy:false,onEpoch(){},onWorld(){},onStar:id=>calls.push(id),sceneUnavailable:true};
science.render(props);
for(const tab of ['Nearby systems','Sirius orbit']){
 calls.length=0;
 science.states[0]=tab;let tree=science.render(props);
 const travel=nodes(tree,n=>n.type==='button'&&/^(Travel to system|Visit fitted Sirius system)$/.test(text(n)));
 assert.equal(travel.length,tab==='Nearby systems'?64:1);
 for(const node of travel){assert.equal(node.props.disabled,true);node.props.onClick();}assert.equal(calls.length,0);
 tree=science.render({...props,sceneUnavailable:false});
 for(const node of nodes(tree,n=>n.type==='button'&&/^(Travel to system|Visit fitted Sirius system)$/.test(text(n)))){assert.equal(node.props.disabled,false);node.props.onClick();}
 assert.equal(calls.length,tab==='Nearby systems'?64:1);
}
console.log(`No-3D production UI: all ${stages} lesson stages retain full written alternatives, explicit completion and question gates; no fake scene visits; normal target actions preserved. All64 Science system buttons and Sirius action are disabled/guarded only when 3D is unavailable.`);
