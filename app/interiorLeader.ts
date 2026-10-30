export type LeaderRect = { left: number; top: number; right: number; bottom: number };

// Coordinates are relative to the scene, after projecting the selected region.
export function interiorLeaderPath(point: { x: number; y: number; z: number }, note: LeaderRect, viewport: { width: number; height: number }) {
  if (![point.x, point.y, point.z, note.left, note.top, note.right, note.bottom, viewport.width, viewport.height].every(Number.isFinite)
    || point.z < -1 || point.z > 1 || viewport.width <= 0 || viewport.height <= 0
    || point.x < 0 || point.x > viewport.width || point.y < 0 || point.y > viewport.height
    || note.right <= note.left || note.bottom <= note.top
    || note.right <= 0 || note.left >= viewport.width || note.bottom <= 0 || note.top >= viewport.height) return null;
  if (point.x >= note.left && point.x <= note.right && point.y >= note.top && point.y <= note.bottom) return null;
  const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
  const start = { x: clamp(point.x, note.left, note.right), y: clamp(point.y, note.top, note.bottom) };
  const horizontal = point.x > note.right || point.x < note.left;
  if (horizontal) start.y = (note.top + note.bottom) / 2;
  else start.x = (note.left + note.right) / 2;
  const bend = horizontal
    ? { x: start.x + Math.sign(point.x - start.x) * Math.min(28, Math.abs(point.x - start.x) / 2), y: start.y }
    : { x: start.x, y: start.y + Math.sign(point.y - start.y) * Math.min(20, Math.abs(point.y - start.y) / 2) };
  return { path: `M ${start.x} ${start.y} L ${bend.x} ${bend.y} L ${point.x} ${point.y}`, x: point.x, y: point.y };
}
