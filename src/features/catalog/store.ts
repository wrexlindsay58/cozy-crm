import { useSyncExternalStore } from "react";

export type CatalogItem = { sku: string; label: string; sell: number; cost: number; kind: "product" | "adder"; parent?: string; active: boolean };
export type OptionRule = { id: string; whenSku: string; offerSku: string; defaultOn: boolean };
export type Catalog = { items: CatalogItem[]; rules: OptionRule[] };
export type PreviewLine = { sku: string; label: string; sell: number; on: boolean; source: "selected" | "rule" | "parent-adder" };

const seed: Catalog = {
  items: [
    { sku: "attic-r49", label: "Attic R-49", sell: 8900, cost: 2100, kind: "product", active: true },
    { sku: "removal", label: "Insulation removal", sell: 2400, cost: 780, kind: "product", active: true },
    { sku: "air-seal", label: "Air sealing", sell: 3200, cost: 640, kind: "product", active: true },
    { sku: "aeroseal", label: "Aeroseal", sell: 5400, cost: 1900, kind: "product", active: true },
    { sku: "hvac", label: "HVAC replacement", sell: 18600, cost: 9800, kind: "product", active: true },
    { sku: "ducts", label: "Ducts", sell: 4200, cost: 1600, kind: "adder", parent: "hvac", active: true },
    { sku: "windows", label: "Windows", sell: 14800, cost: 7200, kind: "product", active: true },
  ],
  rules: [
    { id: "R-1", whenSku: "hvac", offerSku: "ducts", defaultOn: true },
    { id: "R-2", whenSku: "attic-r49", offerSku: "removal", defaultOn: false },
    { id: "R-3", whenSku: "attic-r49", offerSku: "air-seal", defaultOn: true },
  ],
};

let catalog: Catalog = { items: seed.items.map((i) => ({ ...i })), rules: seed.rules.map((r) => ({ ...r })) };
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }
export function useCatalog() { useSyncExternalStore(subscribe, () => catalog, () => catalog); return catalog; }
export function getCatalog() { return catalog; }
export function productsOf(c: Catalog = catalog) { return c.items.filter((i) => i.kind === "product" && i.active); }
export function itemBySku(sku: string, c: Catalog = catalog) { return c.items.find((i) => i.sku === sku); }
export function buildOption(selected: string[], c: Catalog = catalog): PreviewLine[] {
  const set = new Set(selected);
  const lines: PreviewLine[] = [];
  for (const sku of selected) {
    const item = itemBySku(sku, c);
    if (!item || !item.active) continue;
    lines.push({ sku, label: item.label, sell: item.sell, on: true, source: "selected" });
  }
  for (const item of c.items) {
    if (!item.active) continue;
    if (item.kind === "adder" && item.parent && set.has(item.parent) && !lines.some((l) => l.sku === item.sku)) {
      lines.push({ sku: item.sku, label: item.label, sell: item.sell, on: true, source: "parent-adder" });
    }
  }
  for (const rule of c.rules) {
    if (!set.has(rule.whenSku)) continue;
    const offer = itemBySku(rule.offerSku, c);
    if (!offer || !offer.active) continue;
    if (lines.some((l) => l.sku === offer.sku)) continue;
    lines.push({ sku: offer.sku, label: offer.label, sell: offer.sell, on: rule.defaultOn, source: "rule" });
  }
  return lines;
}
export function optionTotal(lines: PreviewLine[]) { return lines.reduce((s, l) => s + (l.on ? l.sell : 0), 0); }
export function upsertItem(item: CatalogItem) {
  const sku = item.sku.trim().toLowerCase().replace(/\s+/g, "-");
  if (!sku || !item.label.trim()) return;
  const next = { ...item, sku };
  catalog = { ...catalog, items: catalog.items.some((i) => i.sku === sku) ? catalog.items.map((i) => (i.sku === sku ? next : i)) : [...catalog.items, next] };
  emit();
}
export function patchItem(sku: string, patch: Partial<CatalogItem>) {
  catalog = { ...catalog, items: catalog.items.map((i) => (i.sku === sku ? { ...i, ...patch } : i)) };
  emit();
}
export function addRule(whenSku: string, offerSku: string, defaultOn: boolean) {
  if (!whenSku || !offerSku || whenSku === offerSku) return;
  if (catalog.rules.some((r) => r.whenSku === whenSku && r.offerSku === offerSku)) return;
  catalog = { ...catalog, rules: [...catalog.rules, { id: `R-${catalog.rules.length + 1}`, whenSku, offerSku, defaultOn }] };
  emit();
}
export function removeRule(id: string) {
  catalog = { ...catalog, rules: catalog.rules.filter((r) => r.id !== id) };
  emit();
}
