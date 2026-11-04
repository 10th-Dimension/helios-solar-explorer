/** Display bands and opacity are artistic parameters, NOT visible optical-depth measurements. */
export const SATURN_DISPLAY_BANDS = [
  [1.31, 1.43, 0.2],
  [1.46, 1.73, 0.68],
  [1.77, 1.88, 0.48],
  [1.94, 2.18, 0.58],
  [2.23, 2.29, 0.2],
] as const;
type V = readonly [number, number, number];
const dot = (a: V, b: V) => a.reduce((s, v, i) => s + v * b[i], 0);
/** Ray from a surface point toward its host; ring frame must share the same world coordinates. */
export function ringRayAttenuation(
  point: V,
  light: V,
  center: V,
  normal: V,
  radius: number,
) {
  if (
    ![...point, ...light, ...center, ...normal, radius].every(
      Number.isFinite,
    ) ||
    radius <= 0
  )
    throw new Error('Finite ring geometry required');
  const ray = light.map((v, i) => v - point[i]) as unknown as V;
  const denom = dot(ray, normal);
  if (Math.abs(denom) < 1e-9) return 1;
  const delta = center.map((v, i) => v - point[i]) as unknown as V,
    t = dot(delta, normal) / denom;
  if (t <= 0 || t >= 1) return 1;
  const rho =
    Math.hypot(...point.map((v, i) => v + t * ray[i] - center[i])) / radius;
  const band = SATURN_DISPLAY_BANDS.find(
    ([inner, outer]) => rho >= inner && rho <= outer,
  );
  return band ? 1 - band[2] : 1;
}
export function hostLambert(normal: V, point: V, host: V) {
  const d = host.map((v, i) => v - point[i]) as unknown as V,
    n = Math.hypot(...normal),
    l = Math.hypot(...d);
  return n && l ? Math.max(0, dot(normal, d) / (n * l)) : 0;
}
