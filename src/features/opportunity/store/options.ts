import { lineKey, optionRollup, lineFromSku, linesFrom, isProductLine, type OptLine } from "./seed";
import type { OptCard } from "./types";
import { proposals, write_proposals, emit } from "./core";
import { picksFromAssessment, catalogItem } from "./seed-03";
import { itemBySku, resolvePicks, unitFor } from "@/features/catalog/store";

export function nextLineId(lines: OptLine[], sku: string) {
  const ids = new Set(lines.map(lineKey));
  if (!ids.has(sku)) return sku;
  let n = 2;
  while (ids.has(`${sku}-${n}`)) n += 1;
  return `${sku}-${n}`;
}

export function optionTotal(opt: OptCard) {
  return optionRollup(opt).total;
}

export function toggleProduct(oppId: string, sku: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const present = p.products.includes(sku) || p.options.some((o) => o.lines.some((l) => l.sku === sku));
  if (present) {
    write_proposals({
      ...proposals,
      [oppId]: {
        ...p,
        products: p.products.filter((s) => s !== sku),
        options: p.options.map((o) => {
          const drop = new Set(o.lines.filter((l) => l.sku === sku).map(lineKey));
          return { ...o, lines: o.lines.filter((l) => l.sku !== sku && !drop.has(l.appliesTo ?? "")) };
        }),
      },
    });
  } else {
    const extra = lineFromSku(sku);
    const adders = linesFrom([...p.products, sku], p.personId).filter((l) => l.sku === sku || (l.adder && !p.products.includes(l.sku)));
    const incoming = extra ? [extra, ...adders.filter((l) => l.sku !== sku)] : adders;
    write_proposals({
      ...proposals,
      [oppId]: {
        ...p,
        products: [...p.products, sku],
        options: p.options.map((o) => {
          const have = new Set(o.lines.map((l) => l.sku));
          return { ...o, lines: [...o.lines, ...incoming.filter((l) => !have.has(l.sku)).map((l) => ({ ...l }))] };
        }),
      },
    });
  }
  emit();
}

export function addLine(oppId: string, optId: string, sku: string, appliesTo?: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const line = lineFromSku(sku, picksFromAssessment(sku, p.personId));
  if (!line) return;
  write_proposals({
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => {
        if (o.id !== optId) return o;
        const id = appliesTo ? `${sku}@${appliesTo}` : nextLineId(o.lines, sku);
        if (o.lines.some((l) => lineKey(l) === id)) return o;
        let picks = line.picks;
        let unit = line.unit;
        if (!appliesTo && sku === "ducts" && o.lines.some((l) => l.sku === "ducts" && isProductLine(l))) {
          const item = itemBySku("ducts");
          if (item) {
            const used = new Set(o.lines.filter((l) => l.sku === "ducts" && isProductLine(l)).map((l) => l.picks?.scope));
            const scope = !used.has("supply") ? "supply" : !used.has("return") ? "return" : "supply";
            picks = resolvePicks(item, { ...line.picks, scope });
            unit = unitFor(item, picks);
          }
        }
        const placed: OptLine = { ...line, id, sku: appliesTo ? id : line.sku, appliesTo, picks, unit };
        return { ...o, lines: [...o.lines, placed] };
      }),
    },
  });
  emit();
}

export function setPick(oppId: string, optId: string, sku: string, choiceId: string, pickId: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  write_proposals({
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) =>
        o.id !== optId
          ? o
          : {
              ...o,
              lines: o.lines.map((l) => {
                if (lineKey(l) !== sku) return l;
                const item = catalogItem(l.sku);
                const picks = item ? resolvePicks(item, { ...l.picks, [choiceId]: pickId }) : { ...l.picks, [choiceId]: pickId };
                return { ...l, picks, unit: item ? unitFor(item, picks) : l.unit };
              }),
            },
      ),
    },
  });
  emit();
}

export function removeLine(oppId: string, optId: string, sku: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  write_proposals({
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => (o.id === optId ? { ...o, lines: o.lines.filter((l) => lineKey(l) !== sku && l.appliesTo !== sku) } : o)),
    },
  });
  emit();
}
