import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { defaultSkus } from "@/lib/pricebook";
import { buildOption, defaultPicks, itemBySku, pickFits, resolvePicks, unitFor, type CatalogKind } from "@/features/catalog/store";
import { assessmentForLead } from "@/features/assessment/store";
import { PACKAGES, type PackageId } from "./packages";
import { activePayMethods, getDealerFeePct, payMethod, type FinancePlan } from "@/features/money-settings/store";
import { canOverrideFee, feeApprover } from "@/features/staff/store";
import { createAction, deleteAction, patchAction } from "@/features/ops/store";
import { money, opportunities, leads } from "@/lib/crm-data";
import { sendMessage } from "@/features/thread/store";
import { agreementDocument, agreementPage, fingerprint } from "./agreement";
import { getBrand } from "@/features/brand/store";
import { picksOn } from "./proposal-copy";

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
  rebate?: boolean;
  rebateWhen?: "pos" | "after";
  appliesTo?: string;
  id?: string;
};
export type OptCard = { id: string; name: string; lines: OptLine[] };
export type DocStub = {
  id: string;
  kind: "proposal" | "agreement";
  status: string;
  at: string;
  totals?: { id: string; name: string; amount: number }[];
  fileName?: string;
  fileUrl?: string;
};
export type GoodLeapStatus = "Not run" | "Pre-qualified" | "Sent" | "Approved" | "Declined";
export type PayKind = "cash" | "card" | "ach" | "finance";
export type FeeAsk = { pct: number; reason: string; actionId: string; months?: number; apr?: number };
export type PlanFee = { months: number; apr: number; pct: number };
export type PayOffer = {
  id: string;
  kind: PayKind;
  methodId?: string;
  financer?: string;
  terms: number[];
  pickedPlans?: { months: number; apr: number }[];
  feeOverride?: number;
  planFees?: PlanFee[];
  feeAsk?: FeeAsk;
};
export type PayPick = { offerId: string; term?: number; apr?: number };
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
  matchHighFee?: boolean;
  agreement?: Agreement;
  agreements?: Agreement[];
};

export type SignEvent = {
  at: string;
  kind: "prepared" | "sent" | "opened" | "read" | "consented" | "signed" | "voided";
  who: string;
  detail: string;
};

export type Agreement = {
  id: string;
  token: string;
  status: "Ready" | "Sent" | "Opened" | "Partial" | "Signed" | "Void";
  kind?: "original" | "change";
  optionId: string;
  optionName: string;
  price: number;
  paySummary: string;
  included: string[];
  address: string;
  customer: string;
  email: string;
  company: string;
  license: string;
  body: string;
  hash: string;
  html?: string;
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
  signedAt?: string;
  method?: "in-home" | "email";
  signerName?: string;
  signature?: string;
  witness?: string;
  coSigner?: { name: string; email: string; signedAt?: string; signature?: string; method?: "in-home" | "email" };
  events: SignEvent[];
  fileName?: string;
  fileUrl?: string;
};

function lineFromSku(sku: string, seed?: Record<string, string>): OptLine | null {
  const item = itemBySku(sku);
  if (!item) return null;
  const picks = resolvePicks(item, seed ?? defaultPicks(item));
  return {
    id: item.sku,
    sku: item.sku,
    label: item.label,
    unit: unitFor(item, picks),
    qty: 1,
    on: true,
    adder: item.kind === "adder",
    kind: item.kind,
    picks,
    pct: item.pct,
    rebate: item.rebate,
    rebateWhen: item.rebate ? (item.rebateWhen ?? "after") : undefined,
  };
}
function linesFrom(skus: string[], leadId?: string): OptLine[] {
  return buildOption(skus)
    .map((l) => {
      const line = lineFromSku(l.sku, leadId ? picksFromAssessment(l.sku, leadId) : undefined);
      if (!line) return null;
      const item = itemBySku(l.sku);
      return item?.kind === "adder" && item.parent ? { ...line, id: `${line.sku}@${item.parent}`, sku: `${line.sku}@${item.parent}`, appliesTo: item.parent } : line;
    })
    .filter(Boolean) as OptLine[];
}
export function lineKey(line: OptLine) {
  return line.id || line.sku;
}

function nextLineId(lines: OptLine[], sku: string) {
  const ids = new Set(lines.map(lineKey));
  if (!ids.has(sku)) return sku;
  let n = 2;
  while (ids.has(`${sku}-${n}`)) n += 1;
  return `${sku}-${n}`;
}
export function isProductLine(line: OptLine) {
  return line.kind !== "adder" && line.kind !== "discount" && !line.adder;
}

export function lineAmount(line: OptLine) {
  const item = catalogItem(line.sku);
  const unit = item ? unitFor(item, line.picks) : line.unit;
  if (line.kind === "discount" && line.pct) return 0;
  return unit * line.qty;
}

function isRebateLine(line: OptLine) {
  return Boolean(line.rebate || catalogItem(line.sku)?.rebate);
}

function takenOff(line: OptLine, base: number) {
  if (line.pct) return Math.round(Math.max(0, base) * (line.pct / 100));
  return Math.abs(lineAmount(line));
}

function rebateWhen(line: OptLine): "pos" | "after" {
  return line.rebateWhen ?? catalogItem(line.sku)?.rebateWhen ?? "after";
}

export function optionRollup(opt: OptCard) {
  let sub = 0;
  let discount = 0;
  for (const product of opt.lines.filter(isProductLine)) {
    const kids = opt.lines.filter((l) => l.appliesTo === lineKey(product));
    let net = lineAmount(product);
    net += kids.filter((l) => l.kind === "adder" || l.adder).reduce((sum, l) => sum + lineAmount(l), 0);
    for (const d of kids.filter((l) => l.kind === "discount" && !isRebateLine(l))) {
      const cut = takenOff(d, net);
      discount += cut;
      net -= cut;
    }
    sub += Math.max(0, net);
  }
  sub += opt.lines.filter((l) => (l.kind === "adder" || l.adder) && !l.appliesTo).reduce((sum, l) => sum + lineAmount(l), 0);
  for (const d of opt.lines.filter((l) => l.kind === "discount" && !l.appliesTo && !isRebateLine(l))) {
    const cut = takenOff(d, sub);
    discount += cut;
    sub -= cut;
  }
  let total = Math.max(0, sub);
  let pos = 0;
  let after = 0;
  for (const r of opt.lines.filter(isRebateLine)) {
    const cut = takenOff(r, rebateWhen(r) === "pos" ? total : sub);
    if (rebateWhen(r) === "pos") {
      pos += cut;
      total = Math.max(0, total - cut);
    } else after += cut;
  }
  return { discount, pos, after, total, later: Math.max(0, total - after) };
}

export function optionTotal(opt: OptCard) {
  return optionRollup(opt).total;
}
function defaultOffers(oppId: string): PayOffer[] {
  const methods = activePayMethods().filter((m) => m.kind === "cash" || m.kind === "card" || m.name === "GoodLeap");
  return methods.map((m) => ({
    id: `${oppId}-${m.id}`,
    kind: m.kind,
    methodId: m.id,
    financer: m.kind === "finance" ? m.name : undefined,
    terms: m.kind === "finance" ? [] : m.terms,
    pickedPlans: [],
  }));
}

export function offerMethod(offer: PayOffer) {
  return (offer.methodId && payMethod(offer.methodId)) || (offer.financer && payMethod(offer.financer)) || activePayMethods().find((m) => m.kind === offer.kind && m.kind !== "finance");
}

export function methodPlans(offer: PayOffer): FinancePlan[] {
  return offerMethod(offer)?.plans ?? [];
}

export function offerPlans(offer: PayOffer): FinancePlan[] {
  const plans = methodPlans(offer);
  const picked = offer.pickedPlans ?? [];
  return plans.filter((p) => picked.some((s) => s.months === p.months && s.apr === p.apr));
}

export function bookFee(offer: PayOffer, plan?: { months: number; apr: number }) {
  if (plan) {
    const hit = offerMethod(offer)?.plans?.find((p) => p.months === plan.months && p.apr === plan.apr);
    if (hit) return hit.feePct;
  }
  return offerMethod(offer)?.feePct ?? 0;
}

export function chargedFee(offer: PayOffer, plan?: { months: number; apr: number }) {
  if (plan) {
    const over = offer.planFees?.find((p) => p.months === plan.months && p.apr === plan.apr);
    if (over) return over.pct;
    return bookFee(offer, plan);
  }
  return offer.feeOverride ?? bookFee(offer);
}

export function priceWithFee(total: number, offer: PayOffer, plan?: { months: number; apr: number }) {
  return Math.round(total * (1 + chargedFee(offer, plan) / 100));
}

export function feeCeiling(proposal: Proposal) {
  let max = 0;
  for (const offer of proposal.payOffers) {
    if (offer.kind === "finance") {
      for (const plan of offerPlans(offer)) max = Math.max(max, chargedFee(offer, plan));
    } else max = Math.max(max, chargedFee(offer));
  }
  return max;
}

export function payAmount(proposal: Proposal, total: number, offer: PayOffer, plan?: { months: number; apr: number }) {
  const fee = proposal.matchHighFee ? feeCeiling(proposal) : chargedFee(offer, plan);
  return Math.round(total * (1 + fee / 100));
}

export function setMatchHighFee(oppId: string, on: boolean) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, matchHighFee: on } };
  emit();
}

export function financeMonthly(principal: number, apr: number, months: number) {
  if (months <= 0) return 0;
  if (!apr) return Math.round(principal / months);
  const r = apr / 100 / 12;
  const pow = (1 + r) ** months;
  return Math.round((principal * r * pow) / (pow - 1));
}

export function payLabel(offer: PayOffer) {
  if (offer.kind === "cash") return "Cash";
  if (offer.kind === "card") return "Card";
  if (offer.kind === "ach") return "ACH";
  return offer.financer || "Financing";
}

function seedFor(oppId: string, personId: string, closer: string, product: string, stage: string): Proposal {
  const products = defaultSkus(product);
  const a = linesFrom(products, personId);
  const lead = leads.find((l) => l.id === personId);
  const won = /^Won/.test(stage);
  const cash = /cash/i.test(lead?.finance ?? "") || /cash/i.test(lead?.notes ?? "");
  const payOffers = defaultOffers(oppId).map((o) =>
    won && !cash && o.kind === "finance" ? { ...o, terms: [120], pickedPlans: [{ months: 120, apr: 6.99 }] } : o,
  );
  const financeId = payOffers.find((o) => o.kind === "finance")?.id ?? payOffers[0].id;
  const cashId = payOffers.find((o) => o.kind === "cash")?.id ?? payOffers[0].id;
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
    accepted: won ? "A" : undefined,
    pay: cash ? "cash" : "goodleap",
    payOffers,
    payPick: won ? (cash ? { offerId: cashId } : { offerId: financeId, term: 120, apr: 6.99 }) : undefined,
    goodleapTerm: "10yr",
    goodleapStatus: won && !cash ? "Approved" : "Not run",
    proposalStatus: won ? "Sent" : "Draft",
    signStatus: won ? "Signed" : "—",
    documents: [],
  };
}

function attachSigned(p: Proposal): Proposal {
  if (p.signStatus !== "Signed" || !p.accepted) return p;
  const lead = leads.find((l) => l.id === p.personId);
  const opt = p.options.find((o) => o.id === p.accepted);
  if (!lead || !opt) return p;
  const brand = getBrand();
  const roll = optionRollup(opt);
  const lines = opt.lines.filter((l) => isProductLine(l) || l.kind === "adder" || l.adder);
  const preparedOn = "September 12, 2026";
  const doc = agreementDocument({
    company: brand.name,
    tagline: brand.tagline,
    phone: brand.phone,
    companyEmail: brand.email,
    web: brand.web,
    license: brand.license,
    city: brand.city,
    logoUrl: brand.logo,
    navy: brand.navy,
    red: brand.red,
    ink: brand.ink,
    paper: brand.paper,
    fontHead: brand.fontHead,
    fontSub: brand.fontSub,
    fontBody: brand.fontBody,
    customer: lead.name,
    email: lead.email,
    address: `${lead.address}, ${lead.city}`,
    optionName: opt.name,
    price: money(roll.total),
    paySummary: payLabel(p.payOffers.find((o) => o.id === p.payPick?.offerId) ?? p.payOffers[0]),
    included: lines.map((l) => ({ label: l.qty > 1 ? `${l.label} × ${l.qty}` : l.label, detail: picksOn(l) })),
    discount: money(roll.discount),
    rebateAtSale: money(roll.pos),
    rebateAfter: money(roll.after),
    prepared: preparedOn,
  });
  const agreement: Agreement = {
    id: `AG-${p.oppId}`,
    token: `seed-${p.oppId}`,
    status: "Signed",
    kind: "original",
    optionId: opt.id,
    optionName: opt.name,
    price: roll.total,
    paySummary: payLabel(p.payOffers.find((o) => o.id === p.payPick?.offerId) ?? p.payOffers[0]),
    included: lines.map((l) => l.label),
    address: `${lead.address}, ${lead.city}`,
    customer: lead.name,
    email: lead.email,
    company: brand.name,
    license: brand.license,
    body: doc.text,
    html: doc.html,
    hash: fingerprint(doc.text),
    createdAt: "2026-09-12T16:00:00.000Z",
    signedAt: "2026-09-12T16:40:00.000Z",
    method: "in-home",
    signerName: lead.name,
    witness: p.closer,
    coSigner: lead.secondaryName ? { name: lead.secondaryName, email: lead.secondaryEmail ?? "", signedAt: "2026-09-12T16:42:00.000Z", method: "in-home" } : undefined,
    events: [stamp("prepared", p.closer, "Agreement prepared."), stamp("signed", lead.name, "Signed in the home.")],
  };
  const file = agreementFile(agreement);
  agreement.fileName = file.fileName;
  agreement.fileUrl = file.fileUrl;
  return {
    ...p,
    agreement,
    agreements: [agreement],
    documents: [{ id: agreement.id, kind: "agreement", status: "Signed", at: agreement.signedAt ?? "", fileName: file.fileName, fileUrl: file.fileUrl }],
  };
}

let proposals: Record<string, Proposal> = Object.fromEntries(
  opportunities.map((o) => [o.id, attachSigned(seedFor(o.id, o.leadId, o.closer, o.product, o.stage))]),
);
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function snap() {
  return proposals;
}
export function useProposals() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snap,
    snap,
  );
}
export function useProposal(oppId: string) {
  return useProposals()[oppId];
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
        options: p.options.map((o) => {
          const drop = new Set(o.lines.filter((l) => l.sku === sku).map(lineKey));
          return { ...o, lines: o.lines.filter((l) => l.sku !== sku && !drop.has(l.appliesTo ?? "")) };
        }),
      },
    };
  } else {
    const extra = lineFromSku(sku);
    const adders = linesFrom([...p.products, sku], p.personId).filter((l) => l.sku === sku || (l.adder && !p.products.includes(l.sku)));
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
function catalogItem(sku: string) {
  return itemBySku(sku) ?? itemBySku(sku.split("@")[0] ?? sku);
}

function picksFromAssessment(sku: string, leadId: string) {
  if (sku === "hvac") return hvacFromAssessment(leadId);
  const assess = assessmentForLead(leadId);
  if (!assess) return undefined;
  if (sku === "removal") {
    const fields = assess.packets.find((p) => p.id === "attic")?.fields ?? {};
    const type = (fields["Insulation type"] ?? "").toLowerCase();
    const depth = Number(fields["Depth (in)"]);
    let existing = "cellulose";
    if (type.includes("spray")) existing = "foam";
    else if (type.includes("batt")) existing = "batt";
    else if (type.includes("fiberglass")) existing = "fiberglass";
    else if (type.includes("none")) existing = "none";
    let band = "mid";
    if (fields["Depth (in)"] && !Number.isNaN(depth)) {
      if (depth < 4) band = "shallow";
      else if (depth <= 7) band = "mid";
      else if (depth <= 12) band = "deep";
      else band = "heavy";
    }
    return { existing, depth: band };
  }
  if (sku === "ducts") {
    const fields = assess.packets.find((p) => p.id === "ducts")?.fields ?? {};
    const mat = (fields["Material"] ?? "").toLowerCase();
    const r = fields["Duct insulation (R)"] ?? "";
    let material = "flex";
    if (mat.includes("metal")) material = "metal";
    else if (mat.includes("board")) material = "board";
    return { material, wrap: r.includes("8") ? "r8" : "r6" };
  }
  return undefined;
}

function hvacFromAssessment(leadId: string) {
  const fields = assessmentForLead(leadId)?.packets.find((p) => p.id === "hvac")?.fields;
  if (!fields) return undefined;
  const system = fields["System type"];
  const ton = fields["Tonnage"];
  if (!system && !ton) return undefined;
  let type = "split";
  let fuel = "gas";
  if (system === "Package") type = "package";
  else if (system === "Mini-split") {
    type = "mini";
    fuel = "hp";
  } else if (system === "Heat pump") fuel = "hp";
  else if (system === "Dual fuel") fuel = "dual";
  const brand = (fields["Brand"] ?? "").toLowerCase();
  const seed = { type, fuel, ...(ton ? { size: ton } : {}) };
  const item = itemBySku("hvac");
  if (!item || !brand) return seed;
  const resolved = resolvePicks(item, seed);
  const match = item.choices?.find((c) => c.id === "equip")?.picks.find((p) => pickFits(p, resolved) && p.label.toLowerCase().includes(brand));
  return match ? { ...resolved, equip: match.id } : resolved;
}

export function addLine(oppId: string, optId: string, sku: string, appliesTo?: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const line = lineFromSku(sku, picksFromAssessment(sku, p.personId));
  if (!line) return;
  proposals = {
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
  };
  emit();
}
export function addCustom(oppId: string, optId: string, input: { label: string; unit: number; kind: "adder" | "discount"; pct?: number; appliesTo?: string; rebate?: boolean; rebateWhen?: "pos" | "after" }) {
  const p = proposals[oppId];
  if (!p || p.accepted || !input.label.trim()) return;
  const id = `${input.kind}-${Date.now()}`;
  const line: OptLine = {
    sku: id,
    id,
    label: input.label.trim(),
    unit: input.kind === "discount" && !input.pct ? -Math.abs(input.unit) : input.unit,
    qty: 1,
    on: true,
    adder: input.kind === "adder",
    kind: input.kind,
    pct: input.pct,
    rebate: input.rebate,
    rebateWhen: input.rebate ? (input.rebateWhen ?? "after") : undefined,
    appliesTo: input.appliesTo,
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
                if (lineKey(l) !== sku) return l;
                const item = catalogItem(l.sku);
                const picks = item ? resolvePicks(item, { ...l.picks, [choiceId]: pickId }) : { ...l.picks, [choiceId]: pickId };
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
      options: p.options.map((o) => (o.id === optId ? { ...o, lines: o.lines.filter((l) => lineKey(l) !== sku && l.appliesTo !== sku) } : o)),
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
      options: p.options.map((o) => (o.id === optId ? { ...o, lines: o.lines.map((l) => (lineKey(l) === sku ? { ...l, qty: next } : l)) } : o)),
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
  const agreement = p.agreement && p.agreement.status !== "Void" ? voided(p.agreement, p.closer, "The accepted option was taken back.") : p.agreement;
  proposals = { ...proposals, [oppId]: agreement ? withAgreement(p, agreement, { accepted: undefined, signStatus: agreement.status === "Void" ? "Void" : "—" }) : { ...p, accepted: undefined, signStatus: "—" } };
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
export function addPayOffer(oppId: string, methodId: string) {
  const p = proposals[oppId];
  const method = payMethod(methodId);
  if (!p || !method || !method.active) return;
  if (p.payOffers.some((o) => o.methodId === method.id || (o.kind === method.kind && o.financer === (method.kind === "finance" ? method.name : undefined) && o.kind !== "finance"))) return;
  if (p.payOffers.some((o) => o.kind !== "finance" && o.kind === method.kind)) return;
  const offer: PayOffer = {
    id: `PAY-${Date.now()}`,
    kind: method.kind,
    methodId: method.id,
    financer: method.kind === "finance" ? method.name : undefined,
    terms: method.kind === "finance" ? [] : method.terms,
    pickedPlans: [],
  };
  const payPick = p.payPick ?? { offerId: offer.id, term: offer.terms[0] };
  proposals = { ...proposals, [oppId]: { ...p, payOffers: [...p.payOffers, offer], payPick } };
  emit();
}
export function removePayOffer(oppId: string, id: string) {
  const p = proposals[oppId];
  if (!p) return;
  const gone = p.payOffers.find((o) => o.id === id);
  if (gone?.feeAsk) deleteAction(gone.feeAsk.actionId);
  const payOffers = p.payOffers.filter((o) => o.id !== id);
  const payPick = p.payPick?.offerId === id ? (payOffers[0] ? { offerId: payOffers[0].id, term: payOffers[0].terms[0] } : undefined) : p.payPick;
  proposals = { ...proposals, [oppId]: { ...p, payOffers, payPick } };
  emit();
}
export function setPayPick(oppId: string, offerId: string, term?: number, apr?: number) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, payPick: { offerId, term, apr } } };
  emit();
}
export function setPayFinancer(oppId: string, id: string, financer: string) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, payOffers: p.payOffers.map((o) => (o.id === id ? { ...o, financer } : o)) } };
  emit();
}
export function togglePayPlan(oppId: string, id: string, months: number, apr: number) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = {
    ...proposals,
    [oppId]: {
      ...p,
      payOffers: p.payOffers.map((o) => {
        if (o.id !== id) return o;
        const allowed = methodPlans(o);
        if (!allowed.some((plan) => plan.months === months && plan.apr === apr)) return o;
        const on = (o.pickedPlans ?? []).some((plan) => plan.months === months && plan.apr === apr);
        const pickedPlans = on ? (o.pickedPlans ?? []).filter((plan) => plan.months !== months || plan.apr !== apr) : [...(o.pickedPlans ?? []), { months, apr }];
        pickedPlans.sort((a, b) => a.months - b.months || a.apr - b.apr);
        return { ...o, pickedPlans, terms: [...new Set(pickedPlans.map((plan) => plan.months))] };
      }),
    },
  };
  emit();
}

function writeOffers(oppId: string, offers: PayOffer[]) {
  const p = proposals[oppId];
  if (!p) return;
  proposals = { ...proposals, [oppId]: { ...p, payOffers: offers } };
  emit();
}

function applyFee(offer: PayOffer, pct: number, plan?: { months: number; apr: number }) {
  if (!plan) return { ...offer, feeOverride: pct, feeAsk: undefined };
  const rest = (offer.planFees ?? []).filter((p) => p.months !== plan.months || p.apr !== plan.apr);
  return { ...offer, planFees: [...rest, { ...plan, pct }], feeAsk: undefined };
}

export function askFeeOverride(oppId: string, offerId: string, pct: number, reason: string, plan?: { months: number; apr: number }) {
  const p = proposals[oppId];
  const offer = p?.payOffers.find((o) => o.id === offerId);
  const clean = reason.trim();
  if (!p || !offer || !clean) return;
  const next = Math.max(0, Math.min(40, pct));
  const name = payLabel(offer);
  const which = plan ? ` ${plan.months % 12 === 0 ? `${plan.months / 12} yr` : `${plan.months} mo`} ${plan.apr}%` : "";
  const title = `Fee override: ${name}${which} ${bookFee(offer, plan)}% to ${next}%`;
  if (canOverrideFee()) {
    if (offer.feeAsk) deleteAction(offer.feeAsk.actionId);
    writeOffers(oppId, p.payOffers.map((o) => (o.id === offerId ? applyFee(o, next, plan) : o)));
    return;
  }
  const ask = { pct: next, reason: clean, actionId: offer.feeAsk?.actionId ?? "", months: plan?.months, apr: plan?.apr };
  if (offer.feeAsk) {
    patchAction(offer.feeAsk.actionId, { title, description: clean });
    writeOffers(oppId, p.payOffers.map((o) => (o.id === offerId ? { ...o, feeAsk: { ...ask, actionId: offer.feeAsk!.actionId } } : o)));
    return;
  }
  const row = createAction({
    kind: "request",
    personId: p.personId,
    title,
    owner: feeApprover(),
    description: clean,
    category: "Payment",
  });
  if (!row) return;
  writeOffers(oppId, p.payOffers.map((o) => (o.id === offerId ? { ...o, feeAsk: { ...ask, actionId: row.id } } : o)));
}

export function settleFeeOverride(oppId: string, offerId: string, decision: "approve" | "deny", pct?: number) {
  const p = proposals[oppId];
  const offer = p?.payOffers.find((o) => o.id === offerId);
  if (!p || !offer?.feeAsk || !canOverrideFee()) return;
  deleteAction(offer.feeAsk.actionId);
  const ask = offer.feeAsk;
  const plan = ask.months != null && ask.apr != null ? { months: ask.months, apr: ask.apr } : undefined;
  writeOffers(
    oppId,
    p.payOffers.map((o) => {
      if (o.id !== offerId) return o;
      if (decision === "deny") return { ...o, feeAsk: undefined };
      return applyFee(o, Math.max(0, Math.min(40, pct ?? ask.pct)), plan);
    }),
  );
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

function esc(value: string) {
  return value.replace(/&/g, "&" + "amp;").replace(/</g, "&" + "lt;").replace(/>/g, "&" + "gt;");
}

function agreementFile(agreement: Agreement) {
  const primary = `<p>${esc(agreement.signerName ?? "")} · ${agreement.signedAt ?? ""}</p><p>${agreement.method === "in-home" ? "Signed in person" : "Signed from email"}${agreement.witness ? ` · Witness ${esc(agreement.witness)}` : ""}</p>${agreement.signature ? `<img alt="Primary signature" src="${agreement.signature}" style="height:88px;margin-top:8px;background:#fff">` : ""}`;
  const co = agreement.coSigner?.signature
    ? `<p style="margin-top:16px">${esc(agreement.coSigner.name)} · ${agreement.coSigner.signedAt ?? ""}</p><p>Co-signer · ${agreement.coSigner.method === "in-home" ? "Signed in person" : "Signed from email"}</p><img alt="Co-signer signature" src="${agreement.coSigner.signature}" style="height:88px;margin-top:8px;background:#fff">`
    : "";
  const signature = `<section class="ag-sign">${primary}${co}<p>Record ${agreement.hash}</p></section>`;
  const page = agreementPage(agreement.html || `<pre>${esc(agreement.body)}</pre>`, signature);
  return { fileName: `${agreement.id}.html`, fileUrl: `data:text/html;charset=utf-8,${encodeURIComponent(page)}` };
}

function stamp(kind: SignEvent["kind"], who: string, detail: string): SignEvent {
  return { at: new Date().toISOString(), kind, who, detail };
}

function voided(agreement: Agreement, who: string, detail: string): Agreement {
  return { ...agreement, status: "Void", events: [...agreement.events, stamp("voided", who, detail)] };
}

function withAgreement(p: Proposal, agreement: Agreement, extra: Partial<Proposal> = {}): Proposal {
  const agreements = [...(p.agreements ?? []).filter((a) => a.id !== agreement.id), agreement];
  return { ...p, ...extra, agreement, agreements };
}

export function startAgreement(
  oppId: string,
  input: {
    optionId: string;
    paySummary: string;
    address: string;
    customer: string;
    email: string;
    company: string;
    license: string;
    coSigner?: { name: string; email: string };
    kind?: "original" | "change";
  },
) {
  const p = proposals[oppId];
  if (!p) return;
  if (p.agreement?.status === "Signed" && input.kind !== "change") return;
  if (input.kind === "change" && p.agreement?.status !== "Signed") return;
  const opt = p.options.find((o) => o.id === input.optionId);
  if (!opt) return;
  const roll = optionRollup(opt);
  const lines = opt.lines.filter((l) => isProductLine(l) || l.kind === "adder" || l.adder);
  const included = lines.map((l) => l.label);
  const brand = getBrand();
  const preparedOn = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const doc = agreementDocument({
    company: brand.name || input.company,
    tagline: brand.tagline,
    phone: brand.phone,
    companyEmail: brand.email,
    web: brand.web,
    license: brand.license || input.license,
    city: brand.city,
    logoUrl: brand.logo,
    navy: brand.navy,
    red: brand.red,
    ink: brand.ink,
    paper: brand.paper,
    fontHead: brand.fontHead,
    fontSub: brand.fontSub,
    fontBody: brand.fontBody,
    customer: input.customer,
    email: input.email,
    address: input.address,
    optionName: opt.name,
    price: money(roll.total),
    paySummary: input.paySummary,
    included: lines.map((l) => ({ label: l.qty > 1 ? `${l.label} × ${l.qty}` : l.label, detail: picksOn(l) })),
    discount: money(roll.discount),
    rebateAtSale: money(roll.pos),
    rebateAfter: money(roll.after),
    prepared: preparedOn,
  });
  const agreement: Agreement = {
    id: input.kind === "change" ? `CO-${(p.agreements?.length ?? 0) + 1}` : `AG-${p.documents.length + 1}`,
    token: crypto.randomUUID(),
    status: "Ready",
    kind: input.kind ?? "original",
    optionId: opt.id,
    optionName: opt.name,
    price: roll.total,
    paySummary: input.paySummary,
    included,
    address: input.address,
    customer: input.customer,
    email: input.email,
    company: brand.name || input.company,
    license: brand.license || input.license,
    body: doc.text,
    html: doc.html,
    hash: fingerprint(doc.text),
    createdAt: new Date().toISOString(),
    coSigner: input.coSigner?.name ? { name: input.coSigner.name, email: input.coSigner.email } : undefined,
    events: [stamp("prepared", p.closer, input.kind === "change" ? "Change order prepared. The original agreement stays on file." : "Agreement prepared for signature.")],
  };
  proposals = { ...proposals, [oppId]: withAgreement(p, agreement, { signStatus: input.kind === "change" ? "Change order" : "Ready" }) };
  emit();
}

export function sendAgreementEmail(oppId: string, origin: string) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.status === "Signed" || agreement.status === "Void") return;
  const url = `${origin}/proposal/${oppId}?sign=${agreement.token}`;
  sendMessage(
    p.personId,
    `${agreement.customer}, your agreement for ${agreement.optionName} is ready to read and sign.\n${url}\nRead it through before you sign. A copy comes back to this email after you sign.`,
    "email",
    { subject: `Sign your ${agreement.company} agreement` },
  );
  proposals = {
    ...proposals,
    [oppId]: withAgreement(p, { ...agreement, status: "Sent", sentAt: new Date().toISOString(), events: [...agreement.events, stamp("sent", p.closer, `Emailed to ${agreement.email}.`)] }, { signStatus: "Sent" }),
  };
  addHistory(p.personId, p.closer, `Agreement emailed to ${agreement.email}.`);
  emit();
}

export function emailCoSigner(oppId: string, origin: string) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.status !== "Partial" || !agreement.coSigner?.email) return;
  const url = `${origin}/proposal/${oppId}?sign=${agreement.token}`;
  sendMessage(
    p.personId,
    `${agreement.coSigner.name}, ${agreement.signerName} signed ${agreement.optionName}. Read it, then add your signature.\n${url}`,
    "email",
    { subject: `Your signature is next: ${agreement.optionName}` },
  );
  proposals = {
    ...proposals,
    [oppId]: withAgreement(p, { ...agreement, events: [...agreement.events, stamp("sent", p.closer, `Emailed to co-signer ${agreement.coSigner.email}.`)] }),
  };
  addHistory(p.personId, p.closer, `Co-signer email sent to ${agreement.coSigner.email}.`);
  emit();
}

export function markAgreementOpened(oppId: string, token: string) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.token !== token || agreement.status === "Signed" || agreement.status === "Void" || agreement.status === "Partial" || agreement.openedAt) return;
  proposals = {
    ...proposals,
    [oppId]: withAgreement(p, { ...agreement, status: "Opened", openedAt: new Date().toISOString(), events: [...agreement.events, stamp("opened", agreement.customer, "Opened the agreement.")] }),
  };
  emit();
}

export function noteAgreementRead(oppId: string, token: string) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.token !== token || agreement.events.some((e) => e.kind === "read")) return;
  proposals = { ...proposals, [oppId]: withAgreement(p, { ...agreement, events: [...agreement.events, stamp("read", agreement.customer, "Scrolled through the agreement.")] }) };
  emit();
}

export function signAgreement(
  oppId: string,
  input: { token?: string; name: string; signature: string; method: "in-home" | "email"; witness?: string; role?: "primary" | "co"; origin?: string },
) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.status === "Signed" || agreement.status === "Void") return false;
  if (input.method === "email" && input.token !== agreement.token) return false;
  const name = input.name.trim();
  if (name.length < 3 || !input.signature.startsWith("data:image")) return false;
  const signedAt = new Date().toISOString();
  const role = input.role ?? (agreement.status === "Partial" ? "co" : "primary");
  if (role === "co") {
    if (!agreement.coSigner || !agreement.signerName) return false;
    const coSigner = { ...agreement.coSigner, name, signedAt, signature: input.signature, method: input.method };
    const next: Agreement = {
      ...agreement,
      status: "Signed",
      coSigner,
      signedAt,
      events: [...agreement.events, stamp("signed", name, `Co-signer signed ${agreement.optionName}. Record ${agreement.hash}.`)],
    };
    const file = agreementFile(next);
    next.fileName = file.fileName;
    next.fileUrl = file.fileUrl;
    proposals = {
      ...proposals,
      [oppId]: withAgreement(p, next, {
        accepted: agreement.optionId,
        signStatus: "Signed",
        documents: [{ id: agreement.id, kind: "agreement" as const, status: "Signed", at: signedAt, fileName: file.fileName, fileUrl: file.fileUrl }, ...p.documents],
      }),
    };
    sendMessage(p.personId, `${agreement.signerName} and ${name} signed ${agreement.optionName}. Record ${agreement.hash}. The signed file is attached.`, "email", {
      subject: `Signed copy: ${agreement.optionName}`,
      files: [{ name: file.fileName, kind: "file", src: file.fileUrl }],
    });
    addHistory(p.personId, name, `Co-signer signed. ${agreement.hash}.`);
    emit();
    return "done" as const;
  }
  const who = input.method === "in-home" ? `${name}, witnessed by ${input.witness || p.closer}` : name;
  if (agreement.coSigner) {
    const next: Agreement = {
      ...agreement,
      status: "Partial",
      method: input.method,
      signerName: name,
      signature: input.signature,
      witness: input.method === "in-home" ? input.witness || p.closer : undefined,
      signedAt,
      events: [...agreement.events, stamp("signed", who, "Primary signed. Waiting on the co-signer.")],
    };
    proposals = { ...proposals, [oppId]: withAgreement(p, next, { accepted: agreement.optionId, signStatus: "Waiting on co-signer" }) };
    if (input.method === "email" && input.origin) emailCoSigner(oppId, input.origin);
    addHistory(p.personId, name, "Primary signed. Co-signer is next.");
    emit();
    return "partial" as const;
  }
  const next: Agreement = {
    ...agreement,
    status: "Signed",
    method: input.method,
    signerName: name,
    signature: input.signature,
    witness: input.method === "in-home" ? input.witness || p.closer : undefined,
    signedAt,
    events: [
      ...agreement.events,
      stamp("consented", name, "Agreed to electronic records and intended to sign."),
      stamp("signed", who, `Signed ${agreement.optionName}. Record ${agreement.hash}.`),
    ],
  };
  const file = agreementFile(next);
  next.fileName = file.fileName;
  next.fileUrl = file.fileUrl;
  proposals = {
    ...proposals,
    [oppId]: withAgreement(p, next, {
      accepted: agreement.optionId,
      signStatus: "Signed",
      documents: [{ id: agreement.id, kind: "agreement" as const, status: "Signed", at: signedAt, fileName: file.fileName, fileUrl: file.fileUrl }, ...p.documents],
    }),
  };
  sendMessage(p.personId, `${name} signed ${agreement.optionName} for ${money(agreement.price)} on ${signedAt}. Record ${agreement.hash}. The signed file is attached.`, "email", {
    subject: `Signed copy: ${agreement.optionName}`,
    files: [{ name: file.fileName, kind: "file", src: file.fileUrl }],
  });
  addHistory(p.personId, name, `Signed the agreement in ${input.method === "in-home" ? "the home" : "email"}. ${agreement.hash}.`);
  emit();
  return "done" as const;
}

export function requestDeposit(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  addHistory(p.personId, p.closer, "Deposit requested on the card.");
  emit();
}

