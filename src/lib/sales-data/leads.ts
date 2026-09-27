import type { SalesBoard } from "./types";

export function sourceMix(t: SalesBoard) {
  const rows = [
    { name: "Canvass", lw: 34, sw: 26, fill: "var(--color-navy)" },
    { name: "Google", lw: 24, sw: 22, fill: "var(--color-navy-2)" },
    { name: "Website", lw: 18, sw: 16, fill: "var(--color-muted)" },
    { name: "Referral", lw: 14, sw: 24, fill: "var(--color-idle)" },
    { name: "Partner", lw: 10, sw: 12, fill: "var(--color-faint)" },
  ];
  const lw = rows.reduce((s, r) => s + r.lw, 0);
  const sw = rows.reduce((s, r) => s + r.sw, 0);
  return rows.map((r) => ({
    name: r.name,
    leads: Math.round((t.leads * r.lw) / lw),
    sold: Math.round((t.sold * r.sw) / sw),
    fill: r.fill,
  }));
}
