import { catalog, emit, type CatalogItem, type Catalog, type PreviewLine, write_catalog } from "./part-01";
import { defaultPicks, unitFor } from "./part-02";

export function rebatesOf(c: Catalog = catalog) {
  return c.items.filter((i) => i.kind === "discount" && i.rebate && i.active);
}

export function itemBySku(sku: string, c: Catalog = catalog) {
  return c.items.find((i) => i.sku === sku);
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

export function upsertItem(item: CatalogItem) {
  const sku = item.sku.trim().toLowerCase().replace(/\s+/g, "-");
  if (!sku || !item.label.trim()) return;
  const next = { ...item, sku };
  write_catalog({ ...catalog, items: catalog.items.some((i) => i.sku === sku) ? catalog.items.map((i) => (i.sku === sku ? next : i)) : [...catalog.items, next] });
  emit();
}

export function patchItem(sku: string, patch: Partial<CatalogItem>) {
  write_catalog({ ...catalog, items: catalog.items.map((i) => (i.sku === sku ? { ...i, ...patch } : i)) });
  emit();
}

export function addRule(whenSku: string, offerSku: string, defaultOn: boolean) {
  if (!whenSku || !offerSku || whenSku === offerSku) return;
  if (catalog.rules.some((r) => r.whenSku === whenSku && r.offerSku === offerSku)) return;
  write_catalog({ ...catalog, rules: [...catalog.rules, { id: `R-${catalog.rules.length + 1}`, whenSku, offerSku, defaultOn }] });
  emit();
}

export function removeRule(id: string) {
  write_catalog({ ...catalog, rules: catalog.rules.filter((r) => r.id !== id) });
  emit();
}
