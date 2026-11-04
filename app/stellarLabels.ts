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
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 32 || height < 32) return [];
  const margin = 8;
  const ordered = [...candidates]
    .filter(candidate => [candidate.x,candidate.y,candidate.depth,candidate.priority].every(Number.isFinite))
    .filter((candidate) => candidate.depth > -1 && candidate.depth < 1)
    .filter((candidate) => candidate.x >= margin && candidate.x <= width - margin && candidate.y >= margin && candidate.y <= height - margin)
    .sort((a, b) => Number(Boolean(b.forced)) - Number(Boolean(a.forced)) || b.priority - a.priority || a.depth - b.depth || a.id.localeCompare(b.id));
  const placed: PlacedStellarLabel[] = [];
  const cells = new Map<string, Set<PlacedStellarLabel>>();
  const cellKeys = (x:number,y:number,w:number) => {
    const keys:string[]=[];
    for(let cx=Math.floor((x-3)/96);cx<=Math.floor((x+w+3)/96);cx++)
      for(let cy=Math.floor((y-LABEL_HEIGHT)/32);cy<=Math.floor((y+LABEL_HEIGHT)/32);cy++) keys.push(`${cx}:${cy}`);
    return keys;
  };
  for (const candidate of ordered) {
    const labelWidth = Math.min(width - margin * 2, Math.ceil(candidate.name.length * 4.9 + 12));
    const anchorX = Math.round(candidate.x), anchorY = Math.round(candidate.y);
    let best = { x: anchorX, y: anchorY, score: Infinity };
    // Relocate crowded names instead of withholding discoverable objects.
    slots: for (let row = 0; row <= 18; row++) for (const side of [1,-1]) {
      const offset = row === 0 ? 0 : Math.ceil(row / 2) * LABEL_HEIGHT * (row % 2 ? -1 : 1);
      const x = Math.round(Math.max(margin, Math.min(width - margin - labelWidth, side > 0 ? anchorX + 9 : anchorX - labelWidth - 9)));
      const y = Math.round(Math.max(margin + LABEL_HEIGHT/2, Math.min(height - margin - LABEL_HEIGHT/2, anchorY + offset)));
      const neighbors = new Set<PlacedStellarLabel>();
      for(const key of cellKeys(x,y,labelWidth)) for(const label of cells.get(key)??[]) neighbors.add(label);
      const overlap = [...neighbors].reduce((sum,label) => sum + Math.max(0,Math.min(x+labelWidth,label.x+label.width)-Math.max(x,label.x)+3) * Math.max(0,LABEL_HEIGHT-Math.abs(y-label.y)),0);
      const score = overlap * 100 + Math.abs(offset) + (side < 0 ? 5 : 0);
      if (score < best.score) best = { x,y,score };
      if (overlap === 0) break slots;
    }
    const label={ ...candidate, x:best.x, y:best.y, anchorX, anchorY, width:labelWidth };
    placed.push(label);
    for(const key of cellKeys(label.x,label.y,label.width)) {
      if(!cells.has(key)) cells.set(key,new Set());
      cells.get(key)!.add(label);
    }
  }

  return placed;
}
