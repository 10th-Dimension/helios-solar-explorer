import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import {checkedObservation,playbackStep} from '../app/observedWeather.ts';
import {claimsForContext,claimsById,confidenceExplanations,scientificSources,verificationExplanations} from '../app/science.ts';
import {localStellarObjects} from '../app/stellar.ts';
const archive=JSON.parse(readFileSync(new URL('../data/observed-weather.json',import.meta.url),'utf8'));
function harness(filename,name,dependencies={}){
 const src=readFileSync(new URL(`../app/${filename}`,import.meta.url),'utf8');
 const file=ts.createSourceFile(filename,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const declaration=file.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(declaration);
 let hook=0,serial=0;const state=[],effects=[],pending=[],timers=new Map(),intervals=new Map();
 const media=new EventTarget();media.matches=false;const document=new EventTarget();document.hidden=false;
 const dataset={renderer:'Fixture renderer (not hardware)',frameMeanCpuMs:'1.00',gpuTiming:'Unavailable',frameWorstIntervalMs:'16.7',geometries:'12',textures:'4',drawCalls:'9',sampleFrames:'120'};
 document.querySelector=selector=>selector==='.solar-scene'?{dataset}:null;
 const window={matchMedia:()=>media,setTimeout:fn=>{const id=++serial;timers.set(id,fn);return id;},setInterval:fn=>{const id=++serial;intervals.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),clearInterval:id=>intervals.delete(id)};
 const image=()=>null;
 const ctx=vm.createContext({exports:{},require:()=>jsx,window,document,clearTimeout:window.clearTimeout,clearInterval:window.clearInterval,Image:image,Date,
  useState(initial){const i=hook++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return[state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;}];},
  useEffect(fn,deps){pending.push({fn,deps});},...dependencies});
 vm.runInContext(ts.transpileModule(declaration.getText(file),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,ctx);
 return{state,media,document,timers,intervals,image,render(props){hook=0;pending.length=0;const tree=ctx[name](props);pending.forEach((item,i)=>{if(!effects[i]||!item.deps.every((v,j)=>Object.is(v,effects[i].deps[j]))){effects[i]?.cleanup?.();effects[i]={deps:item.deps,cleanup:item.fn()};}});return tree;},tick(){const next=timers.entries().next().value;assert.ok(next,'A timer is scheduled');timers.delete(next[0]);next[1]();},sample(){for(const fn of [...intervals.values()])fn();}};
}
function nodes(n,predicate,out=[]){if(!n||typeof n!=='object')return out;if(Array.isArray(n)){for(const c of n)nodes(c,predicate,out);return out;}if(predicate(n))out.push(n);nodes(n.props?.children,predicate,out);return out;}
function text(n){return n==null||typeof n==='boolean'?'':Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n.props?.children):String(n);}
const button=(tree,label)=>nodes(tree,n=>n.type==='button'&&text(n)===label)[0];
const weather=()=>harness('WeatherPlayback.tsx','WeatherPlayback',{archive,checkedObservation,playbackStep});
const w=weather();let tree=w.render();assert.equal(button(tree,'Previous observation').props.disabled,true);
button(tree,'Play observations').props.onClick();tree=w.render();w.tick();tree=w.render();assert.equal(w.state[0],1,'Playback advances to next real recorded frame');
button(tree,'Pause playback').props.onClick();tree=w.render();assert.equal(w.timers.size,0,'Pause cancels the timer');
const slider=nodes(tree,n=>n.type==='input')[0];slider.props.onChange({target:{value:'3'}});tree=w.render();assert.equal(w.state[0],3);assert.equal(button(tree,'Next observation').props.disabled,true);
button(tree,'Previous observation').props.onClick();tree=w.render();assert.equal(w.state[0],2);button(tree,'Next observation').props.onClick();tree=w.render();assert.equal(w.state[0],3);
button(tree,'Play observations').props.onClick();tree=w.render();assert.equal(w.state[0],0,'Replay at the end restarts at first observation');
for(let frame=0;frame<4;frame++){w.tick();tree=w.render();}assert.equal(w.state[0],3);assert.equal(w.state[1],false,'Playback stops at the last frame');
nodes(tree,n=>n.type===w.image)[0].props.onError();tree=w.render();assert.equal(nodes(tree,n=>n.type===w.image).length,0);assert.match(text(tree),/Observation unavailable/);
for(const condition of ['reduce','hidden','change']){
 const h=weather();let t=h.render();button(t,'Play observations').props.onClick();t=h.render();
 if(condition==='reduce'){h.media.matches=true;h.tick();}
 else if(condition==='hidden'){h.document.hidden=true;h.document.dispatchEvent(new Event('visibilitychange'));}
 else{h.media.matches=true;h.media.dispatchEvent(new Event('change'));}
 t=h.render();assert.equal(h.state[0],0);assert.equal(h.state[1],false,condition+' must stop playback without fabricated frames');
}
console.log('Production weather controls: play/pause/replay, previous/next bounds, scrub, missing image, hidden document and reduced-motion stop pass with controlled time/media.');

let inspected=0,links=0;
for(const claim of Object.values(claimsById)){
 const h=harness('SourceInspector.tsx','SourceInspector',{claimsForContext,claimsById,confidenceExplanations,scientificSources,verificationExplanations});
 let t=h.render({claimIds:[claim.id]});assert.equal(nodes(t,n=>n.type==='article').length,0);
 const detail={open:true};t.props.onToggle({target:detail,currentTarget:detail});t=h.render({claimIds:[claim.id]});
 assert.equal(nodes(t,n=>n.type==='h4').map(text)[0],claim.title);if(claim.value===null)assert.match(text(t),/Unknown [—-] not supplied/);
 const refs=nodes(t,n=>n.type==='a');for(const ref of refs){assert.match(ref.props.href,/^https:\/\//);assert.equal(ref.props.target,'_blank');assert.match(ref.props.rel,/noopener/);}links+=refs.length;
 t.props.onToggle({target:{open:false},currentTarget:detail});t=h.render({claimIds:[claim.id]});assert.equal(nodes(t,n=>n.type==='article').length,1,'Nested disclosure must not collapse the parent inspector');
 detail.open=false;t.props.onToggle({target:detail,currentTarget:detail});t=h.render({claimIds:[claim.id]});assert.equal(nodes(t,n=>n.type==='article').length,0);inspected++;
}
console.log(`Production evidence disclosure: all ${inspected} claim rows open/close without nested-toggle corruption; ${links} rendered reference links have safe destinations/targets. Remote page availability is not asserted.`);

const perf=harness('PerformancePanel.tsx','PerformancePanel');tree=perf.render();button(tree,'Record local resources').props.onClick();tree=perf.render();for(let i=0;i<305;i++)perf.sample();tree=perf.render();assert.equal(perf.state[2].length,300);
button(tree,'Stop local resource recording').props.onClick();tree=perf.render();perf.sample();tree=perf.render();assert.equal(perf.state[2].length,300);button(tree,'Clear local samples').props.onClick();tree=perf.render();assert.equal(perf.state[2].length,0);assert.match(text(tree),/Unavailable/);
console.log('Production performance controls: record/stop/clear, 300-sample bound and honest unavailable GPU timing pass with fixture measurements.');

if(process.argv[2]){
 const results=JSON.parse(readFileSync(process.argv[2],'utf8'));const expected=localStellarObjects.filter(o=>o.id!=='sol');assert.equal(results.nearbySystemButtons.length,expected.length);
 for(let i=0;i<expected.length;i++){assert.equal(results.nearbySystemButtons[i].target,expected[i].id);assert.ok(results.nearbySystemButtons[i].summary.startsWith(expected[i].name));}
 assert.equal(new Set(results.nearbySystemButtons.map(r=>r.target)).size,expected.length);
 console.log(`Browser fixture readback: all ${expected.length} nearby-system buttons select the exact corresponding catalog ID/name; no duplicate/fallback target.`);
}
