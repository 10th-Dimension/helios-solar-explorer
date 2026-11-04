'use client';
import { useState } from 'react';
import { WeatherPlayback } from './WeatherPlayback';
import { PerformancePanel } from './PerformancePanel';
import { NearbyArchive } from './NearbyArchive';
import {
  SIRIUS_FIT,
  siriusRelativeAtBesselianEpoch,
  julianToBesselianEpoch,
} from './siriusOrbit';
import { majorMoons, moonSizeRatio } from './majorMoons';
import { EPOCH_LIMITS, motionAvailability } from './epochPolicy';
import { localStellarObjects, stellarObjects, stellarSystems } from './stellar';
import { getDestinationSystemByAnchor } from './destinationSystems';

type Props = {
  epoch: number;
  busy: boolean;
  sceneUnavailable?: boolean;
  onEpoch: (value: number) => void;
  onWorld: (id: string) => void;
  onStar: (id: string) => void;
};
export function ScienceTools({
  epoch,
  busy,
  onEpoch,
  onWorld,
  onStar,
  sceneUnavailable = false,
}: Props) {
  const [tab, setTab] = useState('Epoch & evidence');
  const [draft, setDraft] = useState(String(epoch));
  const [starId, setStarId] = useState('barnards-star');
  const [moonId, setMoonId] = useState('moon');
  const [comparisonId, setComparisonId] = useState('titan');
  const [answer, setAnswer] = useState('');
  const star = stellarObjects.find((o) => o.id === starId)!;
  const motion = motionAvailability(star.astrometry);
  const moon = majorMoons.find((o) => o.id === moonId)!;
  const comparison = majorMoons.find((o) => o.id === comparisonId)!;
  const ratio = moonSizeRatio(moon, comparison);
  const orbit = siriusRelativeAtBesselianEpoch(julianToBesselianEpoch(epoch));
  const valid =
    Number.isFinite(Number(draft)) &&
    draft.trim() !== '' &&
    Number(draft) >= EPOCH_LIMITS.min &&
    Number(draft) <= EPOCH_LIMITS.max;
  return (
    <section className="science-tools" aria-label="Science workbench">
      <h2>Science workbench</h2>
      <div
        className="science-tool-tabs"
        role="group"
        aria-label="Science tools"
      >
        {[
          'Epoch & evidence',
          'Major moons',
          'Nearby systems',
          'Sirius orbit',
          'Observed weather',
          'Try a prediction',
          'Performance',
        ].map((name) => (
          <button
            key={name}
            aria-pressed={tab === name}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {tab === 'Observed weather' && <WeatherPlayback />}
      {tab === 'Performance' && <PerformancePanel />}
      {tab === 'Epoch & evidence' && (
        <div>
          <h3>Move the catalog through time</h3>
          <p>
            ICRS heliocentric positions, linear space motion from J2000.0.
            Julian epoch is a year coordinate, not a UTC observation timestamp.
            This is not a full ephemeris.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (valid && !busy) onEpoch(Number(draft));
            }}
          >
            <label>
              Julian epoch{' '}
              <input
                type="number"
                min={1900}
                max={2100}
                step="any"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </label>
            <button disabled={!valid || busy}>Apply and return home</button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft('2026.81');
                onEpoch(2026.81);
              }}
            >
              Reset epoch
            </button>
          </form>
          <p role="status">
            Scene epoch: {epoch}.{' '}
            {busy
              ? 'Finish travel before changing epoch.'
              : 'Applying returns to the home frame to prevent stale travel targets.'}
          </p>
          <label>
            Inspect motion{' '}
            <select value={starId} onChange={(e) => setStarId(e.target.value)}>
              {stellarObjects
                .filter((o) => o.astrometry)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
            </select>
          </label>
          <dl>
            <div>
              <dt>RA proper motion</dt>
              <dd>
                {motion.raMotion
                  ? `${star.astrometry?.properMotionRaCosDecMasYr} mas/year`
                  : 'Unknown; held fixed'}
              </dd>
            </div>
            <div>
              <dt>Dec proper motion</dt>
              <dd>
                {motion.decMotion
                  ? `${star.astrometry?.properMotionDecMasYr} mas/year`
                  : 'Unknown; held fixed'}
              </dd>
            </div>
            <div>
              <dt>Radial velocity</dt>
              <dd>
                {motion.radialMotion
                  ? `${star.astrometry?.radialVelocityKmS} km/s`
                  : 'Unknown; zero used for propagation only'}
              </dd>
            </div>
          </dl>
          <p>
            No full astrometric covariance is stored. No uncertainty envelope or
            exact future-position precision is asserted. Linear error grows away
            from the reference epoch; binary accelerations are excluded here.
          </p>
          <a href={star.astrometry?.sourceUrl} target="_blank" rel="noreferrer">
            Open catalog source
          </a>
        </div>
      )}
      {tab === 'Major moons' && (
        <div>
          <h3>Four sourced moon records</h3>
          <label>
            Moon{' '}
            <select value={moonId} onChange={(e) => setMoonId(e.target.value)}>
              {majorMoons.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <p>{moon.evidence}</p>
          <dl>
            <div>
              <dt>Radius (rounded)</dt>
              <dd>
                {moon.radiusKm === null
                  ? 'Not included'
                  : `${moon.radiusKm.toLocaleString()} km`}
              </dd>
            </div>
            <div>
              <dt>Distance from parent (rounded)</dt>
              <dd>
                {moon.distanceKm === null
                  ? 'Not included'
                  : `${moon.distanceKm.toLocaleString()} km`}
              </dd>
            </div>
            <div>
              <dt>Orbital period (rounded)</dt>
              <dd>
                {moon.periodDays === null
                  ? 'Not included'
                  : `${Number(moon.periodDays.toPrecision(3))} days`}
              </dd>
            </div>
          </dl>
          <p>
            Reference facts only: no current moon position, orbital phase or
            measured interior boundaries are invented.
          </p>
          <a href={moon.source} target="_blank" rel="noreferrer">
            NASA source · retrieved {moon.retrieved}
          </a>
          <button onClick={() => onWorld(moon.parent)}>
            Visit parent planet
          </button>
          <label>
            Compare radius with{' '}
            <select
              value={comparisonId}
              onChange={(e) => setComparisonId(e.target.value)}
            >
              {majorMoons.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <p role="status">
            {ratio === null
              ? 'Comparison unavailable: a radius is missing.'
              : `${moon.name} has about ${ratio.toFixed(2)}× the radius of ${comparison.name}; calculated from the rounded source values.`}
          </p>
        </div>
      )}
      {tab === 'Nearby systems' && (
        <div>
          {sceneUnavailable && (
            <p role="status">
              3D travel is unavailable. Catalog evidence and written lessons
              remain available.
            </p>
          )}
          <NearbyArchive />
          <h3>Explore cataloged families</h3>
          <p>
            {stellarSystems.length} curated system records; not a
            volume-complete census. A missing planet here is not evidence that
            none exists. Positions, companion layouts and planet phases have
            separate evidence policies.
          </p>
          <div className="science-system-list">
            {localStellarObjects
              .filter((o) => o.id !== 'sol')
              .map((o) => {
                const system = getDestinationSystemByAnchor(o.id);
                return (
                  <details key={o.id}>
                    <summary>
                      {o.name} · {system?.kind.replaceAll('_', ' ')}
                    </summary>
                    <p>{system?.guidance}</p>
                    <p>
                      {system?.bodies.length} displayed bodies; known catalog
                      identity does not imply measured surfaces or a complete
                      orbital solution.
                    </p>
                    <a
                      href={o.astrometry?.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Catalog evidence
                    </a>
                    <button
                      disabled={sceneUnavailable}
                      onClick={() => {
                        if (!sceneUnavailable) onStar(o.id);
                      }}
                    >
                      Travel to system
                    </button>
                  </details>
                );
              })}
          </div>
        </div>
      )}
      {tab === 'Sirius orbit' && (
        <div>
          {sceneUnavailable && (
            <p role="status">
              3D travel is unavailable. The calculated orbit and its published
              evidence remain available.
            </p>
          )}
          <h3>A fit, not a photograph</h3>
          <p>
            Bond et al. (2017), relative B−A visual orbit, J2000 north/east. The
            shared Julian epoch converts to Besselian year using the
            conventional epoch definitions; no UTC-date or light-time ephemeris
            is claimed.
          </p>
          <dl>
            <div>
              <dt>Epoch</dt>
              <dd>B{julianToBesselianEpoch(epoch).toFixed(4)}</dd>
            </div>
            <div>
              <dt>Calculated separation</dt>
              <dd>{orbit.separationArcsec.toFixed(3)} arcsec</dd>
            </div>
            <div>
              <dt>Calculated position angle</dt>
              <dd>{orbit.positionAngleDeg.toFixed(2)}° east of north</dd>
            </div>
          </dl>
          <svg
            viewBox="-70 -70 140 140"
            role="img"
            aria-label="Projected Sirius B relative orbit, east left and north up"
          >
            <path
              d={
                Array.from({ length: 161 }, (_, n) => {
                  const p = siriusRelativeAtBesselianEpoch(
                    2000 + (n / 160) * SIRIUS_FIT.period,
                  );
                  return `${n ? 'L' : 'M'}${-p.eastArcsec * 4},${-p.northArcsec * 4}`;
                }).join(' ') + ' Z'
              }
              fill="none"
              stroke="#a3bfe8"
              strokeWidth=".5"
            />
            <circle r="1.2" fill="#fff" />
            <circle
              cx={-orbit.eastArcsec * 4}
              cy={-orbit.northArcsec * 4}
              r="1.4"
              fill="#ffca83"
            />
            <text x="-64" y="-58" fontSize="4" fill="#fff">
              N ↑ E ← · calculated sky projection
            </text>
          </svg>
          <p>
            Period {SIRIUS_FIT.period} ± {SIRIUS_FIT.errors.period} years;
            angular semimajor axis {SIRIUS_FIT.semiMajorArcsec} ±{' '}
            {SIRIUS_FIT.errors.semiMajorArcsec} arcsec. Reported scalar
            parameter errors do not supply the full covariance. No uncertainty
            envelope, depth sign or absolute barycentric motion is invented.
          </p>
          <a href={SIRIUS_FIT.source} target="_blank" rel="noreferrer">
            Published elements and HST observations
          </a>
          <button
            disabled={sceneUnavailable}
            onClick={() => {
              if (!sceneUnavailable) onStar('sirius-a');
            }}
          >
            Visit fitted Sirius system
          </button>
        </div>
      )}
      {tab === 'Try a prediction' && (
        <div>
          <h3>Predict → inspect → explain</h3>
          <p>
            Why can a star move across the sky even when its distance barely
            changes?
          </p>
          <label>
            Your prediction{' '}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Keep a short observation note…"
            />
          </label>
          <p>
            Try Barnard’s Star at Julian epochs 2000 and 2050. Inspect both
            proper-motion components and radial velocity. Angular drift and
            line-of-sight motion are different measurements.
          </p>
          <details>
            <summary>Compare with the explanation</summary>
            <p>
              Proper motion changes direction in the tangent plane. Radial
              velocity changes line-of-sight distance. Unknown motion is not
              measured zero. The linear model cannot predict a binary orbit or
              provide a confidence region without covariance.
            </p>
          </details>
          <p>
            Notes stay in this open workbench only; no account, grading or
            transmission.
          </p>
        </div>
      )}
    </section>
  );
}
