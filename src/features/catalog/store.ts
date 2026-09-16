import { useSyncExternalStore } from "react";

export type ChoicePick = { id: string; label: string; sell?: number; delta?: number };
export type ProductChoice = { id: string; label: string; picks: ChoicePick[] };
export type CatalogKind = "product" | "adder" | "discount";
export type CatalogItem = {
  sku: string;
  label: string;
  sell: number;
  cost: number;
  kind: CatalogKind;
  parent?: string;
  active: boolean;
  pct?: number;
  choices?: ProductChoice[];
};
export type OptionRule = { id: string; whenSku: string; offerSku: string; defaultOn: boolean };
export type Catalog = { items: CatalogItem[]; rules: OptionRule[] };
export type PreviewLine = { sku: string; label: string; sell: number; on: boolean; source: "selected" | "rule" | "parent-adder" };

const seed: Catalog = {
  items: [
    {
      sku: "attic-r49",
      label: "Attic insulation",
      sell: 8900,
      cost: 2100,
      kind: "product",
      active: true,
      choices: [
        {
          id: "depth",
          label: "Depth",
          picks: [
            { id: "r30", label: "R-30", sell: 6200 },
            { id: "r38", label: "R-38", sell: 7500 },
            { id: "r49", label: "R-49", sell: 8900 },
            { id: "r60", label: "R-60", sell: 10400 },
          ],
        },
      ],
    },
    { sku: "removal", label: "Insulation removal", sell: 2400, cost: 780, kind: "product", active: true },
    { sku: "air-seal", label: "Air sealing", sell: 3200, cost: 640, kind: "product", active: true },
    {
      sku: "aeroseal",
      label: "Duct sealing",
      sell: 5400,
      cost: 1900,
      kind: "product",
      active: true,
      choices: [
        {
          id: "method",
          label: "Method",
          picks: [
            { id: "hand", label: "Hand seal", sell: 2800 },
            { id: "aero", label: "Aeroseal", sell: 5400 },
            { id: "boots", label: "Spray foam boots", sell: 3600 },
          ],
        },
      ],
    },
    {
      sku: "hvac",
      label: "HVAC replacement",
      sell: 18600,
      cost: 9800,
      kind: "product",
      active: true,
      choices: [
        {
          id: "type",
          label: "Type",
          picks: [
            { id: "split", label: "Split", delta: 0 },
            { id: "pkg", label: "Package", delta: 800 },
            { id: "hp", label: "Heat pump", delta: 2400 },
          ],
        },
        {
          id: "ton",
          label: "Tonnage",
          picks: [
            { id: "2", label: "2 ton", delta: -2800 },
            { id: "2.5", label: "2.5 ton", delta: -1800 },
            { id: "3", label: "3 ton", delta: -900 },
            { id: "3.5", label: "3.5 ton", delta: -400 },
            { id: "4", label: "4 ton", delta: 0 },
            { id: "5", label: "5 ton", delta: 2400 },
          ],
        },
        {
          id: "brand",
          label: "Brand",
          picks: [
            { id: "goodman", label: "Goodman", delta: 0 },
            { id: "carrier", label: "Carrier", delta: 1800 },
            { id: "trane", label: "Trane", delta: 2200 },
            { id: "lennox", label: "Lennox", delta: 1600 },
          ],
        },
      ],
    },
    { sku: "ducts", label: "New ducts", sell: 4200, cost: 1600, kind: "adder", parent: "hvac", active: true },
    { sku: "pad", label: "New pad", sell: 450, cost: 120, kind: "adder", parent: "hvac", active: true },
    { sku: "disconnect", label: "Disconnect / whip", sell: 280, cost: 70, kind: "adder", parent: "hvac", active: true },
    { sku: "baffles", label: "Baffles", sell: 380, cost: 90, kind: "adder", parent: "attic-r49", active: true },
    {
      sku: "windows",
      label: "Windows",
      sell: 14800,
      cost: 7200,
      kind: "product",
      active: true,
      choices: [
        {
          id: "type",
          label: "Type",
          picks: [
            { id: "dual", label: "Dual pane vinyl", sell: 14800 },
            { id: "triple", label: "Triple pane", sell: 18600 },
            { id: "retro", label: "Retrofit", sell: 12200 },
          ],
        },
      ],
    },
    { sku: "disc-vet", label: "Veteran", sell: -500, cost: 0, kind: "discount", active: true },
    { sku: "disc-aps", label: "APS rebate", sell: -300, cost: 0, kind: "discount", active: true },
    { sku: "disc-oncor", label: "Oncor rebate", sell: -400, cost: 0, kind: "discount", active: true },
    { sku: "disc-10", label: "10% off", sell: 0, cost: 0, kind: "discount", pct: 10, active: true },
  ],
  rules: [
    { id: "R-1", whenSku: "hvac", offerSku: "ducts", defaultOn: true },
    { id: "R-2", whenSku: "attic-r49", offerSku: "removal", defaultOn: false },
    { id: "R-3", whenSku: "attic-r49", offerSku: "air-seal", defaultOn: true },
  ],
};

let catalog: Catalog = { items: seed.items.map((i) => ({ ...i, choices: i.choices?.map((c) => ({ ...c, picks: c.picks.map((p) => ({ ...p })) })) })), rules: seed.rules.map((r) => ({ ...r })) };
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useCatalog() {
  useSyncExternalStore(subscribe, () => catalog, () => catalog);
  return catalog;
}
export function getCatalog() {
  return catalog;
}
export function productsOf(c: Catalog = catalog) {
  return c.items.filter((i) => i.kind === "product" && i.active);
}
export function addersOf(c: Catalog = catalog) {
  return c.items.filter((i) => i.kind === "adder" && i.active);
}
export function discountsOf(c: Catalog = catalog) {
  return c.items.filter((i) => i.kind === "discount" && i.active);
}
export function itemBySku(sku: string, c: Catalog = catalog) {
  return c.items.find((i) => i.sku === sku);
}
export function defaultPicks(item: CatalogItem): Record<string, string> {
  const out: Record<string, string> = {};
  for (const ch of item.choices ?? []) {
    const preferred =
      item.sku === "attic-r49" ? ch.picks.find((p) => p.id === "r49") :
      item.sku === "hvac" && ch.id === "ton" ? ch.picks.find((p) => p.id === "4") :
      item.sku === "aeroseal" ? ch.picks.find((p) => p.id === "aero") :
      undefined;
    out[ch.id] = (preferred ?? ch.picks[0])?.id ?? "";
  }
  return out;
}
export function unitFor(item: CatalogItem, picks?: Record<string, string>) {
  let unit = item.sell;
  for (const ch of item.choices ?? []) {
    const pid = picks?.[ch.id];
    const pick = ch.picks.find((p) => p.id === pid) ?? ch.picks[0];
    if (!pick) continue;
    if (pick.sell != null) unit = pick.sell;
    if (pick.delta) unit += pick.delta;
  }
  return unit;
}
export function buildOption(selected: string[], c: Catalog = catalog): PreviewLine[] {
  const set = new Set(selected);
  const lines: PreviewLine[] = [];
  for (const sku of selected) {
    const item = itemBySku(sku, c);
    if (!item || !item.active) continue;
    lines.push({ sku, label: item.label, sell: unitFor(item, defaultPicks(item)), on: true, source: "selected" });
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
export function optionTotal(lines: PreviewLine[]) {
  return lines.reduce((s, l) => s + (l.on ? l.sell : 0), 0);
}
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
