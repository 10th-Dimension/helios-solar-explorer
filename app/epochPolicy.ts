export const EPOCH_LIMITS = { min: 1900, max: 2100, default: 2026.81 } as const;
/** Julian year; this does not silently interpret a UTC calendar date as an epoch. */
export function checkedStellarEpoch(value: number) {
  if (
    !Number.isFinite(value) ||
    value < EPOCH_LIMITS.min ||
    value > EPOCH_LIMITS.max
  )
    throw new Error('Choose a Julian epoch between 1900 and 2100.');
  return value;
}
export function motionAvailability(
  astrometry: {
    properMotionRaCosDecMasYr?: number | null;
    properMotionDecMasYr?: number | null;
    radialVelocityKmS?: number | null;
  } | null,
) {
  return {
    raMotion: Number.isFinite(astrometry?.properMotionRaCosDecMasYr),
    decMotion: Number.isFinite(astrometry?.properMotionDecMasYr),
    radialMotion: Number.isFinite(astrometry?.radialVelocityKmS),
    covariance: null,
  };
}
