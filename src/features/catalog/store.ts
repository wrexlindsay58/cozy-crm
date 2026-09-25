import { useSyncExternalStore } from "react";

export type ChoicePick = { id: string; label: string; sell?: number; delta?: number; when?: Record<string, string[]> };
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
  rebate?: boolean;
  rebateWhen?: "pos" | "after";
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
            { id: "r30", label: "R-30 cellulose", sell: 6200 },
            { id: "r38", label: "R-38 cellulose", sell: 7500 },
            { id: "r49", label: "R-49 cellulose", sell: 8900 },
            { id: "r49fg", label: "R-49 fiberglass", sell: 9400 },
            { id: "r60", label: "R-60 cellulose", sell: 10400 },
          ],
        },
      ],
    },
    {
      sku: "removal",
      label: "Insulation removal",
      sell: 2400,
      cost: 780,
      kind: "product",
      active: true,
      choices: [
        {
          id: "existing",
          label: "Existing insulation",
          picks: [
            { id: "cellulose", label: "Blown cellulose", sell: 2400 },
            { id: "fiberglass", label: "Blown fiberglass", sell: 2200 },
            { id: "batt", label: "Batts", sell: 2000 },
            { id: "foam", label: "Spray foam", sell: 4200 },
            { id: "none", label: "None", sell: 0 },
          ],
        },
        {
          id: "depth",
          label: "Existing depth",
          picks: [
            { id: "shallow", label: "Under 4 in", delta: -600 },
            { id: "mid", label: "4–7 in", delta: 0 },
            { id: "deep", label: "8–12 in", delta: 800 },
            { id: "heavy", label: "Over 12 in", delta: 1600 },
          ],
        },
      ],
    },
    {
      sku: "air-seal",
      label: "Air sealing",
      sell: 3200,
      cost: 640,
      kind: "product",
      active: true,
      choices: [
        {
          id: "scope",
          label: "Scope",
          picks: [
            { id: "tops", label: "Top plates", sell: 1800 },
            { id: "cans", label: "Top plates and can lights", sell: 3200 },
            { id: "full", label: "Full attic plane", sell: 4600 },
          ],
        },
      ],
    },
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
          label: "System type",
          picks: [
            { id: "split", label: "Split" },
            { id: "package", label: "Package" },
            { id: "mini", label: "Minisplit" },
          ],
        },
        {
          id: "fuel",
          label: "Fuel",
          picks: [
            { id: "gas", label: "Gas", when: { type: ["split", "package"] } },
            { id: "hp", label: "Heat pump", when: { type: ["split", "package", "mini"] } },
            { id: "dual", label: "Dual fuel", when: { type: ["split", "package"] } },
          ],
        },
        {
          id: "size",
          label: "Size",
          picks: [
            { id: "1", label: "1 ton", delta: -4200 },
            { id: "1.5", label: "1.5 ton", delta: -3400 },
            { id: "2", label: "2 ton", delta: -2800 },
            { id: "2.5", label: "2.5 ton", delta: -1800 },
            { id: "3", label: "3 ton", delta: -900 },
            { id: "3.5", label: "3.5 ton", delta: -400 },
            { id: "4", label: "4 ton", delta: 0 },
            { id: "5", label: "5 ton", delta: 2400 },
          ],
        },
        {
          id: "equip",
          label: "Equipment",
          picks: [
            { id: "g14", label: "Goodman, 14.3 SEER2, single stage", sell: 14800, when: { type: ["split"], fuel: ["gas"], size: ["1.5", "2", "2.5", "3", "3.5", "4", "5"] } },
            { id: "g15", label: "Goodman, 15.2 SEER2, single stage", sell: 16800, when: { type: ["split"], fuel: ["gas"], size: ["1.5", "2", "2.5", "3", "3.5", "4", "5"] } },
            { id: "c16", label: "Carrier, 16 SEER2, two stage", sell: 18600, when: { type: ["split"], fuel: ["gas"], size: ["2", "2.5", "3", "3.5", "4", "5"] } },
            { id: "c18", label: "Carrier, 18 SEER2, variable", sell: 22800, when: { type: ["split"], fuel: ["gas"], size: ["2", "3", "4", "5"] } },
            { id: "thp16", label: "Trane, 16 SEER2, two stage", sell: 21400, when: { type: ["split"], fuel: ["hp"], size: ["1.5", "2", "2.5", "3", "3.5", "4", "5"] } },
            { id: "thp18", label: "Trane, 18 SEER2, variable", sell: 24800, when: { type: ["split"], fuel: ["hp"], size: ["2", "3", "4", "5"] } },
            { id: "df16", label: "Carrier, 16 SEER2, two stage", sell: 23600, when: { type: ["split"], fuel: ["dual"], size: ["2", "2.5", "3", "3.5", "4", "5"] } },
            { id: "df18", label: "Carrier, 18 SEER2, variable", sell: 26800, when: { type: ["split"], fuel: ["dual"], size: ["2", "3", "4", "5"] } },
            { id: "pg14", label: "14.3 SEER2, single stage", sell: 16200, when: { type: ["package"], fuel: ["gas"], size: ["2", "2.5", "3", "3.5", "4", "5"] } },
            { id: "pg16", label: "16 SEER2, two stage", sell: 19400, when: { type: ["package"], fuel: ["gas"], size: ["2.5", "3", "3.5", "4", "5"] } },
            { id: "php16", label: "16 SEER2, two stage", sell: 20400, when: { type: ["package"], fuel: ["hp"], size: ["2", "2.5", "3", "3.5", "4", "5"] } },
            { id: "php18", label: "18 SEER2, variable", sell: 24200, when: { type: ["package"], fuel: ["hp"], size: ["2", "3", "4", "5"] } },
            { id: "pd16", label: "16 SEER2, two stage", sell: 21800, when: { type: ["package"], fuel: ["dual"], size: ["3", "3.5", "4", "5"] } },
            { id: "mz20", label: "Single zone, 20 SEER2, variable", sell: 11600, when: { type: ["mini"], fuel: ["hp"], size: ["1", "1.5", "2", "2.5", "3"] } },
            { id: "mm18", label: "Multi zone, 18 SEER2", sell: 15600, when: { type: ["mini"], fuel: ["hp"], size: ["2", "2.5", "3", "4"] } },
          ],
        },
      ],
    },
    {
      sku: "ducts",
      label: "New ducts",
      sell: 4200,
      cost: 1600,
      kind: "product",
      active: true,
      choices: [
        {
          id: "scope",
          label: "Scope",
          picks: [
            { id: "supply", label: "Supply runs", sell: 2800 },
            { id: "return", label: "Return", sell: 1800 },
            { id: "full", label: "Full system", sell: 4200 },
          ],
        },
        {
          id: "material",
          label: "Material",
          picks: [
            { id: "flex", label: "Flex", delta: 0 },
            { id: "board", label: "Duct board", delta: 600 },
            { id: "metal", label: "Metal trunk", delta: 1800 },
          ],
        },
        {
          id: "wrap",
          label: "New insulation",
          picks: [
            { id: "r6", label: "R-6", delta: 0 },
            { id: "r8", label: "R-8", delta: 400 },
          ],
        },
      ],
    },
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
            { id: "dual", label: "Dual pane vinyl, single hung", sell: 14800 },
            { id: "dual-slider", label: "Dual pane vinyl, slider", sell: 14200 },
            { id: "triple", label: "Triple pane, single hung", sell: 18600 },
            { id: "retro", label: "Retrofit insert", sell: 12200 },
          ],
        },
      ],
    },
    { sku: "disc-vet", label: "Veteran", sell: -500, cost: 0, kind: "discount", active: true },
    { sku: "disc-aps", label: "APS rebate", sell: -300, cost: 0, kind: "discount", rebate: true, rebateWhen: "after", active: true },
    { sku: "disc-oncor", label: "Oncor rebate", sell: -400, cost: 0, kind: "discount", rebate: true, rebateWhen: "after", active: true },
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
  return c.items.filter((i) => i.kind === "discount" && !i.rebate && i.active);
}
export function rebatesOf(c: Catalog = catalog) {
  return c.items.filter((i) => i.kind === "discount" && i.rebate && i.active);
}
export function itemBySku(sku: string, c: Catalog = catalog) {
  return c.items.find((i) => i.sku === sku);
}
export function defaultPicks(item: CatalogItem): Record<string, string> {
  const out: Record<string, string> = {};
  for (const ch of item.choices ?? []) {
    const preferred =
      item.sku === "attic-r49" ? ch.picks.find((p) => p.id === "r49") :
      item.sku === "hvac" && ch.id === "type" ? ch.picks.find((p) => p.id === "split") :
      item.sku === "hvac" && ch.id === "fuel" ? ch.picks.find((p) => p.id === "gas") :
      item.sku === "hvac" && ch.id === "size" ? ch.picks.find((p) => p.id === "4") :
      item.sku === "removal" && ch.id === "existing" ? ch.picks.find((p) => p.id === "cellulose") :
      item.sku === "removal" && ch.id === "depth" ? ch.picks.find((p) => p.id === "mid") :
      item.sku === "ducts" && ch.id === "scope" ? ch.picks.find((p) => p.id === "full") :
      item.sku === "ducts" && ch.id === "material" ? ch.picks.find((p) => p.id === "flex") :
      item.sku === "ducts" && ch.id === "wrap" ? ch.picks.find((p) => p.id === "r6") :
      item.sku === "aeroseal" ? ch.picks.find((p) => p.id === "aero") :
      undefined;
    out[ch.id] = (preferred ?? ch.picks[0])?.id ?? "";
  }
  return out;
}
export function pickFits(pick: ChoicePick, picks: Record<string, string>) {
  if (!pick.when) return true;
  return Object.entries(pick.when).every(([key, ids]) => ids.includes(picks[key] ?? ""));
}

export function resolvePicks(item: CatalogItem, picks?: Record<string, string>) {
  const out: Record<string, string> = { ...(picks ?? defaultPicks(item)) };
  for (const ch of item.choices ?? []) {
    const allowed = ch.picks.filter((p) => pickFits(p, out));
    if (!allowed.some((p) => p.id === out[ch.id])) out[ch.id] = allowed[0]?.id ?? "";
  }
  return out;
}

export function unitFor(item: CatalogItem, picks?: Record<string, string>) {
  const chosen = resolvePicks(item, picks);
  let unit = item.sell;
  for (const ch of item.choices ?? []) {
    const pick = ch.picks.find((p) => p.id === chosen[ch.id]);
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
