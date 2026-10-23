/** Frame-rate-independent wheel easing; total delta is conserved, with a bounded per-frame step. */
export function smoothWheelStep(pending: number, seconds: number) {
  if (!Number.isFinite(pending) || !Number.isFinite(seconds) || seconds <= 0) return { applied:0, pending:Number.isFinite(pending) ? pending : 0 };
  const eased = pending * (1 - Math.exp(-14 * Math.min(seconds,.1)));
  const applied = Math.max(-180,Math.min(180,Math.abs(pending)<.05 ? pending : eased));
  return { applied, pending:pending-applied };
}
