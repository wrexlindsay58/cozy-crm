import { picksFromAssessment, catalogItem } from "./seed-03";
import type { OptCard, PayOffer } from "./types";
import { buildOption, defaultPicks, itemBySku, resolvePicks, unitFor, type CatalogKind } from "@/features/catalog/store";
import { activePayMethods } from "@/features/money-settings/store";

export type OptLine = {
  sku: string;
  label: string;
  unit: number;
  qty: number;
  on: boolean;
  adder?: boolean;
  kind?: CatalogKind;
  picks?: Record<string, string>;
  pct?: number;
  rebate?: boolean;
  rebateWhen?: "pos" | "after";
  appliesTo?: string;
  id?: string;
};

export function lineFromSku(sku: string, seed?: Record<string, string>): OptLine | null {
  const item = itemBySku(sku);
  if (!item) return null;
  const picks = resolvePicks(item, seed ?? defaultPicks(item));
  return {
    id: item.sku,
    sku: item.sku,
    label: item.label,
    unit: unitFor(item, picks),
    qty: 1,
    on: true,
    adder: item.kind === "adder",
    kind: item.kind,
    picks,
    pct: item.pct,
    rebate: item.rebate,
    rebateWhen: item.rebate ? (item.rebateWhen ?? "after") : undefined,
  };
}

export function linesFrom(skus: string[], leadId?: string): OptLine[] {
  return buildOption(skus)
    .map((l) => {
      const line = lineFromSku(l.sku, leadId ? picksFromAssessment(l.sku, leadId) : undefined);
      if (!line) return null;
      const item = itemBySku(l.sku);
      return item?.kind === "adder" && item.parent ? { ...line, id: `${line.sku}@${item.parent}`, sku: `${line.sku}@${item.parent}`, appliesTo: item.parent } : line;
    })
    .filter(Boolean) as OptLine[];
}

export function lineKey(line: OptLine) {
  return line.id || line.sku;
}

export function isProductLine(line: OptLine) {
  return line.kind !== "adder" && line.kind !== "discount" && !line.adder;
}

export function lineAmount(line: OptLine) {
  const item = catalogItem(line.sku);
  const unit = item ? unitFor(item, line.picks) : line.unit;
  if (line.kind === "discount" && line.pct) return 0;
  return unit * line.qty;
}

export function isRebateLine(line: OptLine) {
  return Boolean(line.rebate || catalogItem(line.sku)?.rebate);
}

export function takenOff(line: OptLine, base: number) {
  if (line.pct) return Math.round(Math.max(0, base) * (line.pct / 100));
  return Math.abs(lineAmount(line));
}

export function rebateWhen(line: OptLine): "pos" | "after" {
  return line.rebateWhen ?? catalogItem(line.sku)?.rebateWhen ?? "after";
}

export function optionRollup(opt: OptCard) {
  let sub = 0;
  let discount = 0;
  for (const product of opt.lines.filter(isProductLine)) {
    const kids = opt.lines.filter((l) => l.appliesTo === lineKey(product));
    let net = lineAmount(product);
    net += kids.filter((l) => l.kind === "adder" || l.adder).reduce((sum, l) => sum + lineAmount(l), 0);
    for (const d of kids.filter((l) => l.kind === "discount" && !isRebateLine(l))) {
      const cut = takenOff(d, net);
      discount += cut;
      net -= cut;
    }
    sub += Math.max(0, net);
  }
  sub += opt.lines.filter((l) => (l.kind === "adder" || l.adder) && !l.appliesTo).reduce((sum, l) => sum + lineAmount(l), 0);
  for (const d of opt.lines.filter((l) => l.kind === "discount" && !l.appliesTo && !isRebateLine(l))) {
    const cut = takenOff(d, sub);
    discount += cut;
    sub -= cut;
  }
  let total = Math.max(0, sub);
  let pos = 0;
  let after = 0;
  for (const r of opt.lines.filter(isRebateLine)) {
    const cut = takenOff(r, rebateWhen(r) === "pos" ? total : sub);
    if (rebateWhen(r) === "pos") {
      pos += cut;
      total = Math.max(0, total - cut);
    } else after += cut;
  }
  return { discount, pos, after, total, later: Math.max(0, total - after) };
}

export function defaultOffers(oppId: string): PayOffer[] {
  const methods = activePayMethods().filter((m) => m.kind === "cash" || m.kind === "card" || m.name === "GoodLeap");
  return methods.map((m) => ({
    id: `${oppId}-${m.id}`,
    kind: m.kind,
    methodId: m.id,
    financer: m.kind === "finance" ? m.name : undefined,
    terms: m.kind === "finance" ? [] : m.terms,
    pickedPlans: [],
  }));
}
