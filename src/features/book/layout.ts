import type { CSSProperties } from "react";
import type { BookEvent } from "./types";

export type Packed = { e: BookEvent; col: number; cols: number };

function clash(a: BookEvent, b: BookEvent) {
  return a.id !== b.id && a.start < b.end && b.start < a.end;
}

/** Side-by-side columns for overlapping events. Google Calendar packing. */
export function pack(events: BookEvent[]): Packed[] {
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.id.localeCompare(b.id));
  const colEnd: string[] = [];
  const placed: { e: BookEvent; col: number }[] = [];
  for (const e of sorted) {
    let col = colEnd.findIndex((end) => end <= e.start);
    if (col < 0) {
      col = colEnd.length;
      colEnd.push(e.end);
    } else colEnd[col] = e.end;
    placed.push({ e, col });
  }
  return placed.map((p) => {
    const group = placed.filter((q) => q.e.id === p.e.id || clash(p.e, q.e));
    const cols = Math.max(1, ...group.map((g) => g.col + 1));
    return { e: p.e, col: p.col, cols };
  });
}

export function packStyle(p: Packed, top: number, height: number): CSSProperties {
  const gap = 2;
  const width = `calc(${100 / p.cols}% - ${gap * 2}px)`;
  const left = `calc(${(p.col / p.cols) * 100}% + ${gap}px)`;
  return { top, height: Math.max(height, 22), left, width, position: "absolute" as const, zIndex: 10 + p.col };
}
