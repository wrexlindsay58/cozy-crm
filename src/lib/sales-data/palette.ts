import type { Mark, Split } from "./types";

export const STEEL = "var(--color-idle)";
export const WASH = "var(--color-line-strong)";
export const MID = "var(--color-muted)";
export const LIVE = "var(--color-navy)";

export function pack(rows: { label: string; n: number; tone: string; mark?: Mark }[]): Split[] {
  const total = rows.reduce((s, r) => s + r.n, 0);
  return rows.map((r) => ({ ...r, pct: total ? Math.round((r.n / total) * 100) : 0 }));
}
