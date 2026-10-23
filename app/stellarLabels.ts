export type StellarLabelCandidate = {
  id: string;
  name: string;
  x: number;
  y: number;
  depth: number;
  priority: number;
  forced?: boolean;
};

export type PlacedStellarLabel = StellarLabelCandidate & { anchorX: number; anchorY: number; width: number };

const LABEL_HEIGHT = 14;

export function placeStellarLabels(candidates: StellarLabelCandidate[], width: number, height: number) {
  const margin = 8;
  const ordered = [...candidates]
    .filter((candidate) => candidate.depth > -1 && candidate.depth < 1)
    .filter((candidate) => candidate.x >= margin && candidate.x <= width - margin && candidate.y >= margin && candidate.y <= height - margin)
    .sort((a, b) => Number(Boolean(b.forced)) - Number(Boolean(a.forced)) || b.priority - a.priority || a.depth - b.depth || a.id.localeCompare(b.id));
  const placed: PlacedStellarLabel[] = [];
  for (const candidate of ordered) {
    const labelWidth = Math.min(width - margin * 2, Math.ceil(candidate.name.length * 4.9 + 12));
    const anchorX = Math.round(candidate.x), anchorY = Math.round(candidate.y);
    let best = { x: anchorX, y: anchorY, score: Infinity };
    // Relocate crowded names instead of withholding discoverable objects.
    slots: for (let row = 0; row <= 18; row++) for (const side of [1,-1]) {
      const offset = row === 0 ? 0 : Math.ceil(row / 2) * LABEL_HEIGHT * (row % 2 ? -1 : 1);
      const x = Math.round(Math.max(margin, Math.min(width - margin - labelWidth, side > 0 ? anchorX + 9 : anchorX - labelWidth - 9)));
      const y = Math.round(Math.max(margin + LABEL_HEIGHT/2, Math.min(height - margin - LABEL_HEIGHT/2, anchorY + offset)));
      const overlap = placed.reduce((sum,label) => sum + Math.max(0,Math.min(x+labelWidth,label.x+label.width)-Math.max(x,label.x)+3) * Math.max(0,LABEL_HEIGHT-Math.abs(y-label.y)),0);
      const score = overlap * 100 + Math.abs(offset) + (side < 0 ? 5 : 0);
      if (score < best.score) best = { x,y,score };
      if (overlap === 0) break slots;
    }
    placed.push({ ...candidate, x:best.x, y:best.y, anchorX, anchorY, width:labelWidth });
  }

  return placed;
}
