import { useSyncExternalStore } from "react";
import { __rows1 } from "../part-02";
import { __rows2 } from "../part-03";

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

const __rows0 = [
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
];

const __bag0 = {
items: [...__rows0, ...__rows1, ...__rows2],
};

const __bag1 = {
rules: [
    { id: "R-1", whenSku: "hvac", offerSku: "ducts", defaultOn: true },
    { id: "R-2", whenSku: "attic-r49", offerSku: "removal", defaultOn: false },
    { id: "R-3", whenSku: "attic-r49", offerSku: "air-seal", defaultOn: true },
  ],
};

const seed = { ...__bag0, ...__bag1 } as Catalog;

export let catalog: Catalog = { items: seed.items.map((i) => ({ ...i, choices: i.choices?.map((c) => ({ ...c, picks: c.picks.map((p) => ({ ...p })) })) })), rules: seed.rules.map((r) => ({ ...r })) };

const listeners = new Set<() => void>();

export function emit() {
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

export function write_catalog(__v: any) { catalog = __v; }
