import type { ChoicePick, CatalogItem, PreviewLine } from "./part-01";

export const __rows1 = [
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
];

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

export function optionTotal(lines: PreviewLine[]) {
  return lines.reduce((s, l) => s + (l.on ? l.sell : 0), 0);
}
