import type { SalesBoard } from "./types";

export function payMix(t: SalesBoard) {
  const splits: { methods: ("Financing" | "Cash" | "Card" | "ACH")[]; w: number }[] = [
    { methods: ["Financing"], w: 18 },
    { methods: ["Cash"], w: 10 },
    { methods: ["Cash", "Financing"], w: 22 },
    { methods: ["Card"], w: 7 },
    { methods: ["Card", "Financing"], w: 16 },
    { methods: ["ACH"], w: 5 },
    { methods: ["ACH", "Financing"], w: 22 },
  ];
  const weight: Record<string, number> = { Financing: 0, Cash: 0, Card: 0, ACH: 0 };
  for (const row of splits) {
    const share = row.w / row.methods.length;
    for (const method of row.methods) weight[method] += share;
  }
  const fill: Record<string, string> = {
    Financing: "var(--color-navy)",
    Cash: "var(--color-navy-2)",
    Card: "var(--color-muted)",
    ACH: "var(--color-idle)",
  };
  const names = ["Financing", "Cash", "Card", "ACH"] as const;
  const total = names.reduce((s, name) => s + weight[name], 0) || 1;
  return names.map((name) => ({
    name,
    amount: Math.round((t.sold * weight[name]) / total),
    qty: Math.max(0, Math.round((t.deals * weight[name]) / total)),
    fill: fill[name],
  }));
}
