import { itemBySku } from "@/features/catalog/store";
import type { OptCard, OptLine } from "./store";

export function picksOn(line: OptLine) {
  const item = itemBySku(line.sku);
  if (!item?.choices?.length) return "";
  return item.choices
    .map((c) => c.picks.find((p) => p.id === line.picks?.[c.id])?.label)
    .filter(Boolean)
    .join(" · ");
}

export function scopeLines(opt: OptCard) {
  return opt.lines
    .filter((l) => l.kind !== "discount")
    .map((l) => {
      const sub = picksOn(l);
      const qty = l.qty > 1 ? ` × ${l.qty}` : "";
      return `${l.label}${sub ? ` (${sub})` : ""}${qty}`;
    });
}

export const TERM_LABEL: Record<number, string> = { 60: "5 yr", 120: "10 yr", 144: "12 yr", 180: "15 yr", 240: "20 yr" };
