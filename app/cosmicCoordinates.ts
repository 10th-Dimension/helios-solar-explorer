export const FLOATING_ORIGIN_POLICY = {
  strategy: 'DOMAIN_ROOT_REBASE',
  thresholdRenderUnits: 720,
  scientificCoordinatesImmutable: true,
  explanation: 'When an interstellar arrival would leave the camera far from the numeric origin, Helios translates the shared render-domain root and camera together. Catalog coordinates remain immutable; only the disposable Three.js render frame is rebased.',
} as const;

export type RenderPoint = { x: number; y: number; z: number };

export function shouldRebaseRenderOrigin(point: RenderPoint) {
  return Math.hypot(point.x, point.y, point.z) >= FLOATING_ORIGIN_POLICY.thresholdRenderUnits;
}
