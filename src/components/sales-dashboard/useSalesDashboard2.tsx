import { CLOSE_RATE } from "./bits-04";
import { useSalesDashboard1 } from "./useSalesDashboard1";
import { useMemo } from "react";

export function useSalesDashboard2(bag: ReturnType<typeof useSalesDashboard1>) {
  const { rankBy, t, leftover, lost } = bag;
const board = useMemo(() => {
    const rows = t.closers.map((p) => {
      const rate = CLOSE_RATE[p.name] ?? 0.38;
      const runs = p.count ? Math.max(p.count, Math.round(p.count / rate)) : Math.max(4, Math.round(t.runs / Math.max(t.closers.length, 1)));
      const close = runs ? Math.round((p.count / runs) * 100) : 0;
      const avg = p.count ? Math.round(p.amount / p.count) : 0;
      const nsaVal = runs ? Math.round(p.amount / runs) : 0;
      return { ...p, runs, close, avg, nsa: nsaVal };
    });
    const span = (get: (r: (typeof rows)[number]) => number) => {
      const vals = rows.map(get);
      const max = Math.max(...vals, 1);
      const min = Math.min(...vals, 0);
      const d = max - min || 1;
      return (v: number) => (v - min) / d;
    };
    const sSold = span((r) => r.amount);
    const sQty = span((r) => r.count);
    const sClose = span((r) => r.close);
    const sNsa = span((r) => r.nsa);
    const sAvg = span((r) => r.avg);
    return rows
      .map((r) => ({
        ...r,
        overall: (sSold(r.amount) + sQty(r.count) + sClose(r.close) + sNsa(r.nsa) + sAvg(r.avg)) / 5,
      }))
      .sort((a, b) => {
        if (rankBy === "sold") return b.amount - a.amount;
        if (rankBy === "qty") return b.count - a.count;
        if (rankBy === "close") return b.close - a.close;
        if (rankBy === "nsa") return b.nsa - a.nsa;
        if (rankBy === "avg") return b.avg - a.avg;
        return b.overall - a.overall;
      });
  }, [t, rankBy]);

const closeParts = [
    { name: "Sold", amount: t.deals, fill: "var(--color-navy)" },
    { name: "Didn't close", amount: lost, fill: "var(--color-idle)" },
    { name: "Still out", amount: leftover, fill: "var(--color-line-strong)" },
  ];
  return { ...bag, board, closeParts };
}
