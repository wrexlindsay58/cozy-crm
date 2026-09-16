import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { defaultSkus } from "@/lib/pricebook";
import { buildOption, defaultPicks, itemBySku, unitFor, type CatalogKind } from "@/features/catalog/store";
import { PACKAGES, type PackageId } from "./packages";
import { getDealerFeePct } from "@/features/money-settings/store";
import { money, opportunities } from "@/lib/crm-data";

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
};
export type OptCard = { id: string; name: string; lines: OptLine[] };
export type DocStub = {
  id: string;
  kind: "proposal" | "agreement";
  status: string;
  at: string;
  totals?: { id: string; name: string; amount: number }[];
};
export type GoodLeapStatus = "Not run" | "Pre-qualified" | "Sent" | "Approved" | "Declined";
export type PayKind = "cash" | "card" | "finance";
export type PayOffer = {
  id: string;
  kind: PayKind;
  financer?: string;
  terms: number[];
};
export type PayPick = { offerId: string; term?: number };
export type Proposal = {
  oppId: string;
  personId: string;
  closer: string;
  products: string[];
  options: OptCard[];
  accepted?: string;
  pay: "cash" | "12mo" | "goodleap";
  payOffers: PayOffer[];
  payPick?: PayPick;
  goodleapTerm: "10yr" | "12yr";
  goodleapStatus: GoodLeapStatus;
  proposalStatus: "Draft" | "Generated" | "Sent";
  signStatus: string;
  documents: DocStub[];
};

function lineFromSku(sku: string): OptLine | null {
  const item = itemBySku(sku);
  if (!item) return null;
  const picks = defaultPicks(item);
  return {
    sku: item.sku,
    label: item.label,
    unit: unitFor(item, picks),
    qty: 1,
    on: true,
    adder: item.kind === "adder",
    kind: item.kind,
    picks,
    pct: item.pct,
  };
}
function linesFrom(skus: string[]): OptLine[] {
  return buildOption(skus).map((l) => lineFromSku(l.sku)).filter(Boolean) as OptLine[];
}
export function lineAmount(line: OptLine) {
  const item = itemBySku(line.sku);
  const unit = item ? unitFor(item, line.picks) : line.unit;
  if (line.kind === "discount" && line.pct) return 0;
  return unit * line.qty;
}
export function optionTotal(opt: OptCard) {
  const goods = opt.lines.filter((l) => l.kind !== "discount");
  let sub = goods.reduce((sum, l) => sum + lineAmount(l), 0);
  for (const d of opt.lines.filter((l) => l.kind === "discount")) {
    if (d.pct) sub -= Math.round(sub * (d.pct / 100));
    else sub += d.unit * d.qty;
  }
  return Math.max(0, sub);
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
    payOffers: [],
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
export function addCustom(oppId: string, optId: string, input: { label: string; unit: number; kind: "adder" | "discount"; pct?: number }) {
  const p = proposals[oppId];
  if (!p || p.accepted || !input.label.trim()) return;
  const line: OptLine = {
    sku: `${input.kind}-${Date.now()}`,
    label: input.label.trim(),
    unit: input.kind === "discount" && !input.pct ? -Math.abs(input.unit) : input.unit,
    qty: 1,
    on: true,
    adder: input.kind === "adder",
    kind: input.kind,
    pct: input.pct,
  };
  proposals = {
    ...proposals,
    [oppId]: { ...p, options: p.options.map((o) => (o.id === optId ? { ...o, lines: [...o.lines, line] } : o)) },
  };
  emit();
}
export function setPick(oppId: string, optId: string, sku: string, choiceId: string, pickId: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) =>
        o.id !== optId
          ? o
          : {
              ...o,
              lines: o.lines.map((l) => {
                if (l.sku !== sku) return l;
                const picks = { ...l.picks, [choiceId]: pickId };
                const item = itemBySku(sku);
                return { ...l, picks, unit: item ? unitFor(item, picks) : l.unit };
              }),
            },
      ),
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
export function addOption(oppId: string, pkg?: PackageId) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const letters = "ABCDEFGH";
  const id = letters[p.options.length] ?? `O${p.options.length + 1}`;
  const pack = pkg ? PACKAGES.find((x) => x.id === pkg) : undefined;
  const lines = pack ? linesFrom([...pack.skus]) : [];
  const next: OptCard = { id, name: pack?.label ?? `Option ${id}`, lines };
  proposals = { ...proposals, [oppId]: { ...p, options: [...p.options, next] } };
  emit();
}
export function applyPackage(oppId: string, optId: string, pkg: PackageId) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const pack = PACKAGES.find((x) => x.id === pkg);
  if (!pack) return;
  const lines = linesFrom([...pack.skus]);
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => (o.id === optId ? { ...o, name: pack.label, lines } : o)),
    },
  };
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
  const next = Math.max(1, Math.min(99, qty));
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
export function unacceptOption(oppId: string) {
  const p = proposals[oppId];
  if (!p || !p.accepted) return;
  proposals = { ...proposals, [oppId]: { ...p, accepted: undefined, signStatus: "—" } };
  addHistory(p.personId, p.closer, "Undid the accepted option.");
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
export function addPayOffer(oppId: string, kind: PayKind) {
  const p = proposals[oppId];
  if (!p) return;
  if (kind !== "finance" && p.payOffers.some((o) => o.kind === kind)) return;
  const offer: PayOffer = { id: `PAY-${Date.now()}`, kind, financer: kind === "finance" ? "GoodLeap" : undefined, terms: kind === "finance" ? [120] : [] };
  const payPick = p.payPick ?? { offerId: offer.id, term: offer.terms[0] };
  proposals = { ...proposals, [oppId]: { ...p, payOffers: [...p.payOffers, offer], payPick } };
  emit();
}
export function removePayOffer(oppId: string, id: string) {
  const p = proposals[oppId];
  if (!p) return;
  const payOffers = p.payOffers.filter((o) => o.id !== id);
  const payPick = p.payPick?.offerId === id ? (payOffers[0] ? { offerId: payOffers[0].id, term: payOffers[0].terms[0] } : undefined) : p.payPick;
  proposals = { ...proposals, [oppId]: { ...p, payOffers, payPick } };
  emit();
}
export function setPayPick(oppId: string, offerId: string, term?: number) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, payPick: { offerId, term } } };
  emit();
}
export function setPayFinancer(oppId: string, id: string, financer: string) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, payOffers: p.payOffers.map((o) => (o.id === id ? { ...o, financer } : o)) } };
  emit();
}
export function togglePayTerm(oppId: string, id: string, months: number) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      payOffers: p.payOffers.map((o) => {
        if (o.id !== id) return o;
        const on = o.terms.includes(months);
        return { ...o, terms: on ? o.terms.filter((t) => t !== months) : [...o.terms, months].sort((a, b) => a - b) };
      }),
    },
  };
  emit();
}
export function generateProposal(oppId: string) {
  const p = proposals[oppId];
  if (!p) return false;
  if (!p.payOffers.length) return false;
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
  return true;
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
export function requestDeposit(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  addHistory(p.personId, p.closer, "Deposit requested on the card.");
  emit();
}

