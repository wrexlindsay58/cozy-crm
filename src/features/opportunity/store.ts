import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { defaultSkus, PRICEBOOK } from "@/lib/pricebook";
import { buildOption, itemBySku } from "@/features/catalog/store";
import { getDealerFeePct } from "@/features/money-settings/store";
import { money, opportunities } from "@/lib/crm-data";

export type OptLine = { sku: string; label: string; unit: number; qty: number; on: boolean; adder?: boolean };
export type OptCard = { id: string; name: string; lines: OptLine[] };
export type DocStub = {
  id: string;
  kind: "proposal" | "agreement";
  status: string;
  at: string;
  totals?: { id: string; name: string; amount: number }[];
};
export type GoodLeapStatus = "Not run" | "Pre-qualified" | "Sent" | "Approved" | "Declined";
export type Proposal = {
  oppId: string;
  personId: string;
  closer: string;
  products: string[];
  options: OptCard[];
  accepted?: string;
  pay: "cash" | "12mo" | "goodleap";
  goodleapTerm: "10yr" | "12yr";
  goodleapStatus: GoodLeapStatus;
  proposalStatus: "Draft" | "Generated" | "Sent";
  signStatus: string;
  documents: DocStub[];
};

function linesFrom(skus: string[]): OptLine[] {
  return buildOption(skus).map((l) => ({ sku: l.sku, label: l.label, unit: l.sell, qty: 1, on: l.on, adder: l.source !== "selected" }));
}
function lineFromSku(sku: string): OptLine | null {
  const item = itemBySku(sku);
  if (!item) return null;
  return { sku: item.sku, label: item.label, unit: item.sell, qty: 1, on: true, adder: item.kind === "adder" };
}
function seedFor(oppId: string, personId: string, closer: string, product: string): Proposal {
  const products = defaultSkus(product);
  const a = linesFrom(products);
  return {
    oppId,
    personId,
    closer,
    products,
    options: [
      { id: "A", name: "Recommended", lines: a },
      { id: "B", name: "Good / better", lines: a.map((l) => ({ ...l })) },
      { id: "C", name: "Good", lines: a.map((l) => ({ ...l })) },
    ],
    pay: "cash",
    goodleapTerm: "10yr",
    goodleapStatus: "Not run",
    proposalStatus: "Draft",
    signStatus: "—",
    documents: [],
  };
}
let proposals: Record<string, Proposal> = Object.fromEntries(opportunities.map((o) => [o.id, seedFor(o.id, o.leadId, o.closer, o.product)]));
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function snap() {
  return proposals;
}
export function useProposal(oppId: string) {
  const all = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snap,
    snap,
  );
  return all[oppId];
}
export function optionTotal(opt: OptCard) {
  return opt.lines.reduce((sum, l) => sum + l.unit * l.qty, 0);
}
export function dealerFee(total: number) {
  return Math.round(total * (getDealerFeePct() / 100));
}
export function demoMonthly(total: number, months: number) {
  return Math.round(total / months);
}
export function toggleProduct(oppId: string, sku: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const present = p.products.includes(sku) || p.options.some((o) => o.lines.some((l) => l.sku === sku));
  if (present) {
    proposals = {
      ...proposals,
      [oppId]: {
        ...p,
        products: p.products.filter((s) => s !== sku),
        options: p.options.map((o) => ({ ...o, lines: o.lines.filter((l) => l.sku !== sku) })),
      },
    };
  } else {
    const extra = lineFromSku(sku);
    const adders = linesFrom([...p.products, sku]).filter((l) => l.sku === sku || (l.adder && !p.products.includes(l.sku)));
    const incoming = extra ? [extra, ...adders.filter((l) => l.sku !== sku)] : adders;
    proposals = {
      ...proposals,
      [oppId]: {
        ...p,
        products: [...p.products, sku],
        options: p.options.map((o) => {
          const have = new Set(o.lines.map((l) => l.sku));
          return { ...o, lines: [...o.lines, ...incoming.filter((l) => !have.has(l.sku)).map((l) => ({ ...l }))] };
        }),
      },
    };
  }
  emit();
}
export function addLine(oppId: string, optId: string, sku: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const line = lineFromSku(sku);
  if (!line) return;
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => {
        if (o.id !== optId || o.lines.some((l) => l.sku === sku)) return o;
        return { ...o, lines: [...o.lines, line] };
      }),
    },
  };
  emit();
}
export function removeLine(oppId: string, optId: string, sku: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => (o.id === optId ? { ...o, lines: o.lines.filter((l) => l.sku !== sku) } : o)),
    },
  };
  emit();
}
export function addOption(oppId: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const letters = "ABCDEFGH";
  const id = letters[p.options.length] ?? `O${p.options.length + 1}`;
  const src = p.options[0];
  const next: OptCard = { id, name: `Option ${id}`, lines: src ? src.lines.map((l) => ({ ...l })) : linesFrom(p.products) };
  proposals = { ...proposals, [oppId]: { ...p, options: [...p.options, next] } };
  emit();
}
export function removeOption(oppId: string, optId: string) {
  const p = proposals[oppId];
  if (!p || p.accepted || p.options.length < 2) return;
  proposals = { ...proposals, [oppId]: { ...p, options: p.options.filter((o) => o.id !== optId) } };
  emit();
}
export function renameOption(oppId: string, optId: string, name: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  proposals = { ...proposals, [oppId]: { ...p, options: p.options.map((o) => (o.id === optId ? { ...o, name } : o)) } };
  emit();
}
export function toggleLine(oppId: string, optId: string, sku: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => (o.id === optId ? { ...o, lines: o.lines.map((l) => (l.sku === sku ? { ...l, on: !l.on } : l)) } : o)),
    },
  };
  emit();
}
export function setQty(oppId: string, optId: string, sku: string, qty: number) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const next = Math.max(1, Math.min(9, qty));
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => (o.id === optId ? { ...o, lines: o.lines.map((l) => (l.sku === sku ? { ...l, qty: next } : l)) } : o)),
    },
  };
  emit();
}
export function acceptOption(oppId: string, optId: string) {
  const p = proposals[oppId];
  if (!p) return;
  const opt = p.options.find((o) => o.id === optId);
  if (!opt) return;
  proposals = { ...proposals, [oppId]: { ...p, accepted: optId } };
  addHistory(p.personId, p.closer, `Accepted ${opt.name} at ${money(optionTotal(opt))}.`);
  emit();
}
export function setPay(oppId: string, pay: Proposal["pay"]) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, pay } };
  emit();
}
export function setGoodLeapTerm(oppId: string, term: Proposal["goodleapTerm"]) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, goodleapTerm: term } };
  emit();
}
export function applyGoodLeap(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, goodleapStatus: "Sent", pay: "goodleap" } };
  addHistory(p.personId, p.closer, "GoodLeap apply — status Sent.");
  emit();
}
export function generateProposal(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  const doc: DocStub = {
    id: `D-${p.documents.length + 1}`,
    kind: "proposal",
    status: "Generated",
    at: new Date().toISOString(),
    totals: p.options.map((o) => ({ id: o.id, name: o.name, amount: optionTotal(o) })),
  };
  proposals = {
    ...proposals,
    [oppId]: { ...p, proposalStatus: "Generated", documents: [doc, ...p.documents] },
  };
  addHistory(p.personId, p.closer, `Proposal generated. ${p.options.map((o) => `${o.name} ${money(optionTotal(o))}`).join(" · ")}.`);
  emit();
}
export function sendProposal(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  const latest = p.documents.find((d) => d.kind === "proposal");
  const docs = latest
    ? p.documents.map((d) => (d.id === latest.id ? { ...d, status: "Sent" } : d))
    : [{ id: `D-${p.documents.length + 1}`, kind: "proposal" as const, status: "Sent", at: new Date().toISOString(), totals: p.options.map((o) => ({ id: o.id, name: o.name, amount: optionTotal(o) })) }, ...p.documents];
  proposals = { ...proposals, [oppId]: { ...p, proposalStatus: "Sent", documents: docs } };
  addHistory(p.personId, p.closer, "Proposal sent.");
  emit();
}
export function sendToSign(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      signStatus: "Sent",
      documents: [{ id: `D-${p.documents.length + 1}`, kind: "agreement", status: "Sent", at: new Date().toISOString() }, ...p.documents],
    },
  };
  addHistory(p.personId, p.closer, "Agreement sent to sign.");
  emit();
}
export { PRICEBOOK };
