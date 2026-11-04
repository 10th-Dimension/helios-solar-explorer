/** Upstream reference strings are data. Never render their HTML as executable markup. */
export function scholarlyReference(value: string | null) {
  const raw = value?.match(/href=["']?([^\s"'>]+)/)?.[1];
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && url.hostname === 'ui.adsabs.harvard.edu'
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function formatCatalogError(
  value: number | null,
  plus: number | null,
  minus: number | null,
  unit: string,
) {
  if (value === null) return 'Not cataloged';
  return `${value} ${unit}${plus === null || minus === null ? ' · reported uncertainty unavailable' : ` (+${Math.abs(plus)} / −${Math.abs(minus)})`}`;
}
