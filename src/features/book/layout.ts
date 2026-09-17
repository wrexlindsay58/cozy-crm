import type { CSSProperties } from "react";
import type { BookEvent } from "./types";

export type Packed = { e: BookEvent; col: number; cols: number; span: number };

function duration(e: BookEvent) {
  return new Date(e.end).getTime() - new Date(e.start).getTime();
}
function clash(a: BookEvent, b: BookEvent) {
  return a.id !== b.id && a.start < b.end && b.start < a.end;
}

/** Google week view: columns, reuse empty lanes, grow right if the whole block is free. */
export function pack(events: BookEvent[]): Packed[] {
  if (!events.length) return [];
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start) || duration(b) - duration(a) || a.id.localeCompare(b.id));
  const colEnd: string[] = [];
  const placed: { e: BookEvent; col: number }[] = [];
  for (const e of sorted) {
    let col = 0;
    for (; col < colEnd.length; col += 1) {
      if (colEnd[col] <= e.start) break;
    }
    if (col === colEnd.length) colEnd.push(e.end);
    else colEnd[col] = e.end;
    placed.push({ e, col });
  }

  const parent = placed.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  placed.forEach((p, i) => {
    placed.forEach((q, j) => {
      if (j > i && clash(p.e, q.e)) {
        const a = find(i);
        const b = find(j);
        if (a !== b) parent[a] = b;
      }
    });
  });
  const width = new Map<number, number>();
  placed.forEach((p, i) => {
    const r = find(i);
    width.set(r, Math.max(width.get(r) ?? 0, p.col + 1));
  });

  return placed.map((p, i) => {
    const cols = width.get(find(i)) ?? 1;
    let span = 1;
    while (p.col + span < cols) {
      const lane = p.col + span;
      if (placed.some((q, j) => j !== i && q.col === lane && clash(p.e, q.e))) break;
      span += 1;
    }
    return { e: p.e, col: p.col, cols, span };
  });
}

export function packStyle(p: Packed, top: number, height: number): CSSProperties {
  const gap = 3;
  return {
    top,
    height: Math.max(height, 24),
    left: `calc(${(p.col / p.cols) * 100}% + ${gap}px)`,
    width: `calc(${(p.span / p.cols) * 100}% - ${gap * 2}px)`,
    position: "absolute",
    zIndex: 1,
  };
}
