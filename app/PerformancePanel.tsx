'use client';
import { useEffect, useState } from 'react';
type Sample = {
  time: string;
  renderer: string;
  cpu: string;
  gpu: string;
  interval: string;
  geometries: string;
  textures: string;
  draws: string;
  frames: string;
};
export function PerformancePanel() {
  const [sample, setSample] = useState<Sample | null>(null),
    [recording, setRecording] = useState(false),
    [samples, setSamples] = useState<Sample[]>([]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const node = document.querySelector<HTMLElement>('.solar-scene');
      if (!node) return;
      const d = node.dataset,
        row = {
          time: new Date().toISOString(),
          renderer: d.renderer ?? 'Unavailable',
          cpu: d.frameMeanCpuMs ?? 'Unavailable',
          gpu: d.gpuTiming ?? 'Unavailable',
          interval: d.frameWorstIntervalMs ?? 'Unavailable',
          geometries: d.geometries ?? 'Unavailable',
          textures: d.textures ?? 'Unavailable',
          draws: d.drawCalls ?? 'Unavailable',
          frames: d.sampleFrames ?? 'Unavailable',
        };
      setSample(row);
      if (recording) setSamples((old) => [...old, row].slice(-300));
    }, 1000);
    return () => clearInterval(timer);
  }, [recording]);
  return (
    <div>
      <h3>Measure this browser</h3>
      <p>
        No target-hardware benchmark has been assumed. These are measurements of
        the current browser and view; developer mode, hidden tabs, display
        refresh rate and instrumentation can affect them.
      </p>
      <dl>
        <div>
          <dt>Frame CPU submission work</dt>
          <dd>{sample?.cpu ?? 'Waiting'} ms</dd>
        </div>
        <div>
          <dt>Sampled GPU render time</dt>
          <dd>{sample?.gpu ?? 'Waiting'} ms</dd>
        </div>
        <div>
          <dt>Worst frame interval (last window)</dt>
          <dd>{sample?.interval ?? 'Waiting'} ms</dd>
        </div>
        <div>
          <dt>Geometries / textures / draw calls</dt>
          <dd>
            {sample?.geometries ?? '—'} / {sample?.textures ?? '—'} /{' '}
            {sample?.draws ?? '—'}
          </dd>
        </div>
      </dl>
      <p>
        Renderer: {sample?.renderer ?? 'Waiting'}. GPU timing is nonblocking and
        omitted when unsupported or disjoint. CPU work is not GPU time, and
        geometry/texture counts are not VRAM bytes.
      </p>
      <button aria-pressed={recording} onClick={() => setRecording((p) => !p)}>
        {recording ? 'Stop local resource recording' : 'Record local resources'}
      </button>
      <button onClick={() => setSamples([])}>Clear local samples</button>
      <p>
        {samples.length} retained samples (latest 300 only); no telemetry is
        uploaded.
      </p>
      {samples.length > 0 && (
        <details>
          <summary>Recorded resource range</summary>
          <p>
            {samples[0].time} → {samples[samples.length - 1].time}
          </p>
          <p>
            Geometry {samples[0].geometries} →{' '}
            {samples[samples.length - 1].geometries}; textures{' '}
            {samples[0].textures} → {samples[samples.length - 1].textures}. A
            stable count alone does not rule out every leak.
          </p>
        </details>
      )}
      <p>
        Texture streaming is deferred until measured memory or catalog demand
        warrants it. Existing quality tiers remain available; no automatic
        optimization has been justified by these counters alone.
      </p>
    </div>
  );
}
