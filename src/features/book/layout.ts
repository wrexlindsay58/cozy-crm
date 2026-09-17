import type { CSSProperties } from "react";
import type { BookEvent } from "./types";

export type Packed = { e: BookEvent; col: number };

function duration(e: BookEvent) {
  return new Date(e.end).getTime() - new Date(e.start).getTime();
}

/** Google-style cascade: longer events sit full-width in back, overlaps indent on top. */
export function pack(events: BookEvent[]): Packed[] {
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start) || duration(b) - duration(a) || a.id.localeCompare(b.id));
  const colEnd: string[] = [];
  const placed: Packed[] = [];
  for (const e of sorted) {
    let col = colEnd.findIndex((end) => end <= e.start);
    if (col < 0) {
      col = colEnd.length;
      colEnd.push(e.end);
    } else colEnd[col] = e.end;
    placed.push({ e, col });
  }
  return placed;
}

export function packStyle(p: Packed, top: number, height: number): CSSProperties {
  const indent = Math.min(p.col * 14, 84);
  return {
    top,
    height: Math.max(height, 22),
    left: indent + 2,
    width: `calc(100% - ${indent + 4}px)`,
    position: "absolute",
    zIndex: 1 + p.col,
  };
}
