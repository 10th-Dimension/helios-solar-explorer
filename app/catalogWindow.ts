/** Bounded DOM pages; the scientific catalog and sky anchors are never pruned. */
export const CATALOG_PAGE_SIZE = 24;
export function catalogPage<T>(
  items: readonly T[],
  requestedPage: number,
  size = CATALOG_PAGE_SIZE,
) {
  if (!Number.isSafeInteger(size) || size < 1 || size > 100)
    throw new Error('Invalid catalog page size');
  const pages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.max(
    0,
    Math.min(
      pages - 1,
      Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 0,
    ),
  );
  return {
    page,
    pages,
    total: items.length,
    start: page * size,
    items: items.slice(page * size, (page + 1) * size),
  };
}
