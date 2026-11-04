'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import archive from '../data/observed-weather.json';
import { checkedObservation, playbackStep } from './observedWeather';
export function WeatherPlayback() {
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [failed, setFailed] = useState('');
  const frame = archive.frames[index],
    valid = checkedObservation(frame),
    isFailed = failed === frame.image;
  useEffect(() => {
    if (!playing) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => {
      if (document.hidden || preference.matches) setPlaying(false);
    };
    document.addEventListener('visibilitychange', stop);
    preference.addEventListener('change', stop);
    const timer = window.setTimeout(() => {
      if (
        preference.matches ||
        document.hidden ||
        index === archive.frames.length - 1
      )
        setPlaying(false);
      else setIndex(playbackStep(index, archive.frames.length));
    }, 1200);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', stop);
      preference.removeEventListener('change', stop);
    };
  }, [playing, index]);
  return (
    <div className="weather-playback">
      <h3>{archive.title}</h3>
      <p>
        Observed image playback · {archive.credit}. False color, not
        visible-light appearance. Image-plane observations are separate from
        procedural 3D activity and are not an auroral forecast.
      </p>
      <figure>
        {valid && !isFailed ? (
          <Image
            unoptimized
            width={512}
            height={512}
            src={frame.image!}
            alt={`Observed SDO/AIA 304 angstrom solar disk at ${frame.observedAt}; false-color ultraviolet image`}
            onError={() => {
              setFailed(frame.image!);
              setPlaying(false);
            }}
          />
        ) : (
          <div className="observation-gap" role="status">
            Observation unavailable. No synthetic replacement is shown.
          </div>
        )}
        <figcaption>
          <time dateTime={frame.observedAt}>
            {frame.observedAt.replace('T', ' ').replace('Z', ' UTC')}
          </time>{' '}
          · frame {index + 1}/{archive.frames.length}
        </figcaption>
      </figure>
      <div role="group" aria-label="Observed weather playback controls">
        <button
          disabled={index === 0}
          onClick={() => {
            setPlaying(false);
            setIndex((i) => i - 1);
          }}
        >
          Previous observation
        </button>
        <button
          aria-pressed={playing}
          onClick={() => {
            if (index === archive.frames.length - 1) setIndex(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? 'Pause playback' : 'Play observations'}
        </button>
        <button
          disabled={index === archive.frames.length - 1}
          onClick={() => {
            setPlaying(false);
            setIndex((i) => i + 1);
          }}
        >
          Next observation
        </button>
      </div>
      <label>
        Observation frame{' '}
        <input
          aria-label="Observation frame"
          type="range"
          min="0"
          max={archive.frames.length - 1}
          value={index}
          onChange={(e) => {
            setPlaying(false);
            setIndex(Number(e.target.value));
          }}
        />
      </label>
      <p>
        {archive.samplePolicy} Playback uses 1.2 seconds per displayed frame; no
        intermediate observations or interpolated imagery are fabricated.
        Reduced motion uses manual stepping.
      </p>
      <details>
        <summary>Observation provenance and limits</summary>
        <p>
          Requested time: {frame.requestedAt}; actual offset:{' '}
          {frame.offsetSeconds}s. Archive image ID: {frame.imageId}. Instrument
          header QUALITY={frame.quality}; the raw flag is retained but not
          interpreted here. These compressed visualization products are not a
          calibrated intensity-analysis dataset.
        </p>
        <p>
          {archive.coordinateFrame}. Retrieved {archive.retrievedAt}. This
          bounded episode supplies no claim about full-disk depth, solar-wind
          arrival or geomagnetic response.
        </p>
        <a href={frame.metadataUrl} target="_blank" rel="noreferrer">
          Image metadata
        </a>
        <a href={frame.headerUrl} target="_blank" rel="noreferrer">
          Instrument header
        </a>
      </details>
    </div>
  );
}
