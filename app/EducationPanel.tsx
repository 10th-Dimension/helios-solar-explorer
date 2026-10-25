'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SourceInspector } from './SourceInspector';
import {
  EDUCATION_STORAGE_KEY, currentEducationStage, educationReducer, educationResumeLabel, educationTargetLabel,
  getEducationLesson, initialEducationSession, lessons, parseEducationSession, stageCanAdvance,
  type EducationAction, type EducationObserved, type EducationSession, type EducationTarget,
} from './education';

export type EducationPanelProps = {
  onClose: () => void;
  onNavigate: (target: EducationTarget) => void;
  observed?: EducationObserved;
};

export function EducationPanel({ onClose, onNavigate, observed }: EducationPanelProps) {
  const [session, setSession] = useState<EducationSession>(initialEducationSession);
  const [sceneView, setSceneView] = useState(false);
  const sceneToggleRef = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const dispatch = useCallback((action: EducationAction) => {
    if (['start', 'next', 'back', 'resume', 'library', 'clear'].includes(action.type)) setSceneView(false);
    setSession(current => educationReducer(current, action));
  }, []);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Defer the browser-only storage read until after the first client paint.
    // Cancellation prevents reopening a panel from receiving an old hydration task.
    const timer = window.setTimeout(() => {
      try { setSession(parseEducationSession(window.localStorage.getItem(EDUCATION_STORAGE_KEY))); }
      catch { setStorageAvailable(false); }
      setLoaded(true);
    }, 0);
    return () => { window.clearTimeout(timer); if (restoreFocusRef.current?.isConnected) restoreFocusRef.current.focus(); };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(session)); }
    catch { queueMicrotask(() => setStorageAvailable(false)); }
  }, [loaded, session]);

  const lesson = getEducationLesson(session.lessonId);
  const stage = currentEducationStage(session);
  const stageId = stage?.id;
  const observedWorld = observed?.worldId;
  const observedLayer = observed?.layerIndex;
  const observedStellar = observed?.stellarId;
  const observedPlanet = observed?.exoplanetId;
  const observedComparison = observed?.compareOpen;
  const observedInterior = observed?.interiorMode;
  const hasObservation = observed !== undefined;

  useEffect(() => {
    if (!loaded || !hasObservation) return;
    let cancelled = false;
    // The scene reports arrival asynchronously; acknowledge once per changed
    // observation rather than during render or on each animation frame.
    queueMicrotask(() => { if (!cancelled) dispatch({ type: 'observe', observed: { worldId: observedWorld ?? null, layerIndex: observedLayer ?? null, stellarId: observedStellar ?? null, exoplanetId: observedPlanet ?? null, compareOpen: observedComparison ?? false, interiorMode: observedInterior ?? false } }); });
    return () => { cancelled = true; };
  }, [loaded, hasObservation, stageId, session.status, observedWorld, observedLayer, observedStellar, observedPlanet, observedComparison, observedInterior, dispatch]);

  useEffect(() => { if (loaded && !sceneView) { headingRef.current?.focus({preventScroll:true}); readingRef.current?.scrollTo({top:0}); } }, [loaded, sceneView, session.lessonId, session.stageIndex, session.status]);
  useEffect(() => { if (confirmClear) deleteButtonRef.current?.focus(); }, [confirmClear]);
  useEffect(() => { if (pendingLessonId) startButtonRef.current?.focus(); }, [pendingLessonId]);

  useEffect(() => { if (sceneView) sceneToggleRef.current?.focus(); }, [sceneView]);

  const closeAndSave = useCallback(() => {
    const paused = educationReducer(session, { type: 'pause' });
    try { window.localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(paused)); }
    catch { /* The in-memory session remains usable until this panel closes. */ }
    onClose();
  }, [onClose, session]);

  const interactionDone = Boolean(stage && (session.observedStageIds.includes(stage.id) || session.alternativeStageIds.includes(stage.id)));
  const selectedAnswer = stage ? session.answers[stage.id] : undefined;
  const correct = Boolean(stage?.question && selectedAnswer === stage.question.correctOptionId);
  const showLibrary = session.status === 'library' || !lesson;
  const requestStart = (lessonId: string) => {
    const hasProgress = session.observedStageIds.length > 0 || session.alternativeStageIds.length > 0 || Object.keys(session.answers).length > 0;
    if (lesson && hasProgress && !session.attemptCompleted) setPendingLessonId(lessonId);
    else dispatch({ type: 'start', lessonId });
  };

  return (
    <aside className="education-panel" aria-label="Education Mode" data-view={showLibrary ? 'library' : sceneView ? 'scene' : 'lesson'} data-education-panel="true" onKeyDown={event => {
      event.stopPropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        if (pendingLessonId) { setPendingLessonId(null); headingRef.current?.focus(); }
        else if (confirmClear) { setConfirmClear(false); headingRef.current?.focus(); }
        else if (sceneView) setSceneView(false);
        else closeAndSave();
      }
    }}>
      <header className="education-header">
        <div><span>HELIOS · EDUCATION</span><h2 ref={showLibrary || session.status !== 'active' ? headingRef : undefined} tabIndex={-1}>{showLibrary ? 'Learn by exploring' : session.status === 'completed' ? 'Lesson complete' : lesson.title}</h2></div>
        <div className="education-header-actions">{!showLibrary && session.status === 'active' && <button type="button" ref={sceneToggleRef} aria-expanded={!sceneView} aria-controls="education-reading" onClick={() => setSceneView(value => !value)}>{sceneView ? 'Read lesson' : 'View scene'}</button>}<button type="button" onClick={closeAndSave} aria-label="Pause education and return to free exploration">Exit ×</button></div>
      </header>

      <div id="education-reading" className="education-reading" ref={readingRef} hidden={sceneView} inert={sceneView}>
      {!loaded ? <p role="status">Loading local lesson progress…</p> : showLibrary ? (
        <div className="education-library">
          <div className="education-welcome"><span className="education-eyebrow">YOUR CLASSROOM. THE COSMOS.</span><p>Explore a question.<br />Discover the evidence.</p><div>Four guided journeys through the same living universe. Choose a lesson, explore its 3D scene, then check what you have learned.</div></div><div className="education-resource-links"><a href="https://github.com/10th-Dimension/helios-solar-explorer/blob/main/docs/education/TEACHER_GUIDE.md" target="_blank" rel="noreferrer">Teacher guide & answer key ↗</a><a href="https://github.com/10th-Dimension/helios-solar-explorer/blob/main/docs/education/STUDENT_GUIDE.md" target="_blank" rel="noreferrer">Student guide ↗</a></div>
          <p className="education-storage-note">{storageAvailable ? 'Progress stays only in this browser. No account, name or student tracking is required.' : 'Browser storage is unavailable. You can finish a lesson now, but closing this panel may lose progress.'}</p>
          {lesson && <button type="button" className="education-resume" onClick={() => { setPendingLessonId(null); dispatch({ type: 'resume' }); }}>{educationResumeLabel(session)}</button>}
          {pendingLessonId && <section className="education-clear-confirm" aria-label="Confirm changing lesson"><p>Start {getEducationLesson(pendingLessonId)?.title}? This restarts the current unfinished lesson progress. Previously completed lessons stay marked complete.</p><button type="button" ref={startButtonRef} onClick={() => { dispatch({ type: 'start', lessonId: pendingLessonId }); setPendingLessonId(null); }}>Start and replace current progress</button><button type="button" onClick={() => { setPendingLessonId(null); headingRef.current?.focus(); }}>Keep current lesson</button></section>}
          <div className="education-lesson-list">
            {lessons.map((item, lessonIndex) => <article className="education-lesson-card" key={item.id}>
              <div><span>0{lessonIndex + 1} · {item.stages.length} STAGES{session.completedLessonIds.includes(item.id) ? ' · COMPLETED' : ''}</span><h3>{item.title}</h3></div>
              <p>{item.description}</p><small>{item.level}</small>
              <details><summary>Learning objectives</summary><ul>{item.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul></details>
              <button type="button" onClick={() => requestStart(item.id)}>{session.completedLessonIds.includes(item.id) || session.lessonId === item.id ? 'Restart lesson' : 'Start lesson'}: {item.title}</button>
            </article>)}
          </div>
          <details className="education-guidance"><summary>First visit? Controls and alternatives</summary><p>Drag to orbit; scroll or pinch to approach. Use the lesson’s scene button to travel. An interior stage opens the existing cutaway. Use its labeled layers to inspect a region. Keyboard and screen-reader users can complete every stage through the written alternative and knowledge checks below. Escape pauses and exits Education.</p><p>Scene colors, body sizes, spacing and travel times are teaching transforms. Inspect the scientific evidence whenever a claim needs context.</p></details>
          {!confirmClear ? <button type="button" className="education-clear" onClick={() => setConfirmClear(true)}>Delete saved lesson progress</button> : <div className="education-clear-confirm"><p>Delete lesson progress from this browser?</p><button type="button" ref={deleteButtonRef} onClick={() => { try { window.localStorage.removeItem(EDUCATION_STORAGE_KEY); } catch { /* No storage is also safe. */ } dispatch({ type: 'clear' }); setConfirmClear(false); headingRef.current?.focus(); }}>Delete progress</button><button type="button" onClick={() => { setConfirmClear(false); headingRef.current?.focus(); }}>Keep progress</button></div>}
        </div>
      ) : session.status === 'paused' ? (
        <section className="education-paused"><h3>Paused at stage {session.stageIndex + 1}</h3><p>The scene remains available. Resume when you are ready; your lesson does not depend on where the camera currently points.</p><button type="button" onClick={() => dispatch({ type: 'resume' })}>Resume lesson</button><button type="button" onClick={() => dispatch({ type: 'library' })}>Choose a lesson</button></section>
      ) : session.status === 'completed' ? (
        <section className="education-complete" role="status"><h3>{lesson.title}</h3><p>You completed {lesson.stages.length} stages and their knowledge checks.</p><p>{session.alternativeStageIds.length ? `You used the written alternative in ${session.alternativeStageIds.length} stage${session.alternativeStageIds.length === 1 ? '' : 's'}. It teaches the same concepts without requiring the canvas.` : 'You completed the scene interactions for this journey.'}</p><ul>{lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul><button type="button" onClick={() => dispatch({ type: 'library' })}>Choose another lesson</button><button type="button" onClick={() => dispatch({ type: 'start', lessonId: lesson.id })}>Restart this lesson</button><button type="button" onClick={closeAndSave}>Continue free exploration</button></section>
      ) : stage ? (
        <section className="education-stage" aria-labelledby="education-stage-title">
          <div className="education-progress"><label htmlFor="education-stage-progress">Stage {session.stageIndex + 1} of {lesson.stages.length}</label><progress id="education-stage-progress" max={lesson.stages.length} value={session.stageIndex + 1} /></div>
          <h3 id="education-stage-title" ref={headingRef} tabIndex={-1}>{stage.title}</h3>
          <p className="education-instruction">{stage.instruction}</p>
          <button type="button" className="education-travel" onClick={() => { onNavigate(stage.target); if (window.matchMedia('(max-width: 900px)').matches && !(stage.target.kind === 'world' && stage.target.compare)) setSceneView(true); }}>{educationTargetLabel(stage.target)} ↗</button>
          <p>{stage.explanation}</p>
          <SourceInspector claimIds={stage.claimIds} label="Scientific evidence for this stage" />
          <p className="education-interaction" role="status">{interactionDone ? session.alternativeStageIds.includes(stage.id) ? 'Written alternative recorded for this stage.' : 'Scene interaction reached.' : 'Visit the scene target, or use the written alternative, before continuing.'}</p>
          <details key={stage.id} className="education-alternative"><summary>Read a nonvisual alternative</summary><p>{stage.accessibleAlternative}</p><button type="button" onClick={() => dispatch({ type: 'alternative' })} disabled={session.alternativeStageIds.includes(stage.id)}>Use this alternative for this stage</button></details>
          {stage.question && <fieldset className="education-question"><legend>{stage.question.prompt}</legend>{stage.question.options.map(option => <label key={option.id}><input type="radio" name={stage.question!.id} value={option.id} checked={selectedAnswer === option.id} onChange={() => dispatch({ type: 'answer', optionId: option.id })} /><span>{option.label}</span></label>)}{selectedAnswer && <div className={`education-feedback ${correct ? 'correct' : 'retry'}`} role="status"><strong>{correct ? 'Correct.' : 'Try another answer.'}</strong><p>{stage.question.explanation}</p></div>}</fieldset>}

        </section>
      ) : null}
      </div>
      {!sceneView && !showLibrary && session.status === 'active' && stage && lesson && <footer className="education-footer">
        <div className="education-actions"><button type="button" disabled={session.stageIndex === 0} onClick={() => dispatch({type:'back'})}>Previous</button><button type="button" className="education-next" disabled={!stageCanAdvance(session)} onClick={() => dispatch({type:'next'})}>{session.stageIndex === lesson.stages.length - 1 ? 'Complete lesson' : 'Next stage →'}</button></div>
        {!stageCanAdvance(session) && <p className="education-next-hint">{!interactionDone ? 'Explore the scene or record the written alternative to continue.' : 'Choose the correct answer above to continue.'}</p>}
        <div className="education-secondary-actions"><button type="button" onClick={() => dispatch({type:'pause'})}>Pause lesson</button><button type="button" onClick={() => dispatch({type:'library'})}>Lesson library</button><span>{session.stageIndex + 1} / {lesson.stages.length}</span></div>
      </footer>}
    </aside>
  );
}

export default EducationPanel;
