/** Keep a useful scene viewport and a readable lesson, including after window resize. */
export const EDUCATION_WIDTH_KEY = 'helios.education.width.v1';
export function educationWidthBounds(viewport: number) {
  const safeViewport = Number.isFinite(viewport) ? Math.max(901, viewport) : 1280;
  return { min: 380, max: Math.min(960, safeViewport - 400) };
}
export function clampEducationWidth(width: number, viewport: number) {
  const {min,max} = educationWidthBounds(viewport);
  return Math.round(Math.min(max, Math.max(min, Number.isFinite(width) ? width : 620)));
}
export function parseEducationWidth(raw: string | null) {
  if (!raw || raw.length > 12) return 620;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 380 && value <= 960 ? value : 620;
}
