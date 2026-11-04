export type ObservationFrame = {
  requestedAt: string;
  observedAt: string;
  imageId: string;
  offsetSeconds: number;
  image: string | null;
  status: string;
  quality?: string;
  metadataUrl: string;
  headerUrl?: string;
  sha256?: string;
};
export function checkedObservation(
  frame: ObservationFrame,
  maxOffsetSeconds = 60,
) {
  const requested = Date.parse(frame.requestedAt),
    observed = Date.parse(frame.observedAt);
  return (
    Number.isFinite(requested) &&
    Number.isFinite(observed) &&
    Math.abs(observed - requested) <= maxOffsetSeconds * 1000 &&
    frame.status === 'observed' &&
    Boolean(frame.image?.startsWith('/observations/'))
  );
}
export function playbackStep(index: number, length: number) {
  return Math.min(Math.max(0, length - 1), Math.max(0, index) + 1);
}
