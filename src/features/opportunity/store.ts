import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { defaultSkus, lineFor, PRICEBOOK } from "@/lib/pricebook";
import { buildOption } from "@/features/catalog/store";
import { getDealerFeePct } from "@/features/money-settings/store";
import { money, opportunities } from "@/lib/crm-data";

export type OptLine = { sku: string; label: string; unit: number; qty: number; on: boolean; adder?: boolean };
export type OptCard = { id: "A" | "B" | "C"; name: string; lines: OptLine[] };
export type DocStub = { id: string; kind: "proposal" | "agreement"; status: string; at: string };
export type GoodLeapStatus = "Not run" | "Pre-qualified" | "Sent" | "Approved" | "Declined";
export type Proposal = {
  oppId: string;
  personId: string;
  closer: string;
  products: string[];
  options: OptCard[];
  accepted?: "A" | "B" | "C";
  pay: "cash" | "12mo" | "goodleap";
  goodleapTerm: "10yr" | "12yr";
  goodleapStatus: GoodLeapStatus;
  proposalStatus: "Draft" | "Sent";
  signStatus: string;
  documents: DocStub[];
};

function linesFrom(skus: string[]): OptLine[] {
  return buildOption(skus).map((l) => ({ sku: l.sku, label: l.label, unit: l.sell, qty: 1, on: l.on, adder: l.source !== "selected" }));
}
function seedFor(oppId: string, personId: string, closer: string, product: string): Proposal {
  const products = defaultSkus(product);
  const a = linesFrom(products);
  return {
    oppId, personId, closer, products,
    options: [
      { id: "A", name: "Recommended", lines: a },
      { id: "B", name: "Option B", lines: a.map((l) => ({ ...l })) },
      { id: "C", name: "Option C", lines: a.map((l) => ({ ...l })) },
    ],
    pay: "cash", goodleapTerm: "10yr", goodleapStatus: "Not run", proposalStatus: "Draft", signStatus: "—", documents: [],
  };
}
let proposals: Record<string, Proposal> = Object.fromEntries(opportunities.map((o) => [o.id, seedFor(o.id, o.leadId, o.closer, o.product)]));
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function snap() { return proposals; }
export function useProposal(oppId: string) {
  const all = useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, snap, snap);
  return all[oppId];
}
export function optionTotal(opt: OptCard) { return opt.lines.reduce((sum, l) => sum + (l.on ? l.unit * l.qty : 0), 0); }
export function dealerFee(total: number) { return Math.round(total * (getDealerFeePct() / 100)); }
export function demoMonthly(total: number, months: number) { return Math.round(total / months); }
export function toggleProduct(oppId: string, sku: string) {
  const p = proposals[oppId]; if (!p) return;
  const products = p.products.includes(sku) ? p.products.filter((s) => s !== sku) : [...p.products, sku];
  proposals = { ...proposals, [oppId]: { ...p, products, options: p.options.map((o) => (o.id === "A" ? { ...o, lines: linesFrom(products) } : o)) } };
  emit();
}
export function toggleLine(oppId: string, optId: OptCard["id"], sku: string) {
  const p = proposals[oppId]; if (!p || p.accepted) return;
  proposals = { ...proposals, [oppId]: { ...p, options: p.options.map((o) => o.id === optId ? { ...o, lines: o.lines.map((l) => (l.sku === sku ? { ...l, on: !l.on } : l)) } : o) } };
  emit();
}
export function setQty(oppId: string, optId: OptCard["id"], sku: string, qty: number) {
  const p = proposals[oppId]; if (!p || p.accepted) return;
  const next = Math.max(1, Math.min(9, qty));
  proposals = { ...proposals, [oppId]: { ...p, options: p.options.map((o) => o.id === optId ? { ...o, lines: o.lines.map((l) => (l.sku === sku ? { ...l, qty: next } : l)) } : o) } };
  emit();
}
export function acceptOption(oppId: string, optId: OptCard["id"]) {
  const p = proposals[oppId]; if (!p) return;
  const opt = p.options.find((o) => o.id === optId); if (!opt) return;
  proposals = { ...proposals, [oppId]: { ...p, accepted: optId } };
  addHistory(p.personId, p.closer, `Accepted option ${optId} at ${money(optionTotal(opt))}.`);
  emit();
}
export function setPay(oppId: string, pay: Proposal["pay"]) {
  const p = proposals[oppId]; if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, pay } }; emit();
}
export function setGoodLeapTerm(oppId: string, term: Proposal["goodleapTerm"]) {
  const p = proposals[oppId]; if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, goodleapTerm: term } }; emit();
}
export function applyGoodLeap(oppId: string) {
  const p = proposals[oppId]; if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, goodleapStatus: "Sent", pay: "goodleap" } };
  addHistory(p.personId, p.closer, "GoodLeap demo apply — status Sent."); emit();
}
export function sendProposal(oppId: string) {
  const p = proposals[oppId]; if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, proposalStatus: "Sent", documents: [{ id: `D-${p.documents.length + 1}`, kind: "proposal", status: "Sent", at: new Date().toISOString() }, ...p.documents] } };
  addHistory(p.personId, p.closer, "Proposal sent."); emit();
}
export function sendToSign(oppId: string) {
  const p = proposals[oppId]; if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, signStatus: "Sent", documents: [{ id: `D-${p.documents.length + 1}`, kind: "agreement", status: "Sent", at: new Date().toISOString() }, ...p.documents] } };
  addHistory(p.personId, p.closer, "Agreement sent to sign."); emit();
}
export { PRICEBOOK, lineFor };
