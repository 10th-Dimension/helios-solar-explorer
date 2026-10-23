// A renderer input, not a forecast. Live observations can later supply the same envelope.
export type AstronomicalEvent = { kind: 'AURORAL_OVAL' | 'SOLAR_ACTIVE_REGION'; confidence: 'illustrative'; intensity: number; cycle: number };
export const EVENT_POLICY = { timing: 'PROCEDURAL_ILLUSTRATIVE', maximumSolarRegions: 1, maximumAuroralOvals: 2, liveData: false } as const;
export function astronomicalEvent(kind: AstronomicalEvent['kind'], seconds: number, seed: number, preview = false): AstronomicalEvent {
  const period = kind === 'AURORAL_OVAL' ? 113 : 67;
  const cycle = Math.floor((seconds + seed) / period);
  const phase = ((seconds + seed) % period) / period;
  const activeFraction = kind === 'AURORAL_OVAL' ? .3 : .22;
  const envelope = phase < activeFraction ? Math.pow(Math.sin(Math.PI * phase / activeFraction), 2) : 0;
  return { kind, confidence: 'illustrative', intensity: preview ? .9 : envelope * (.5 + .4 * Math.abs(Math.sin(cycle * 2.39 + seed))), cycle };
}
