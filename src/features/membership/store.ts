import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { actingName, canOverrideFee } from "@/features/staff/store";
import { createBook, patchBook, removeBook } from "@/features/book/store";
import { addHrs } from "@/features/book/time";
import { getBrand } from "@/features/brand/store";
import { planById, termPrice } from "./catalog";
import { isoDay, parseDay, plusDays, rateAfterTerm, renewalOpen, NOTICE_DAYS } from "./renew";
import type { CancelRecord, CardOnFile, LedgerRow, MemberAgreement, MemberOrigin, MemberStatus, MemberVisit, MembershipFile, PayMode, PlanChange, PlanFunding, TermYears, VisitPart, VisitRepair } from "./types";
import { memberAgreement } from "./agreement";

function pretty(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function plusYears(from: Date, years: number) {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + years);
  return pretty(d);
}

function plusMonth(from: Date) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return pretty(d);
}

function openingRow(file: MembershipFile): LedgerRow {
  const held = file.pay === "prepaid" && (file.funding === "job" || file.funding === "loan");
  return {
    id: `${file.id}-1`,
    at: file.start,
    amount: file.termPrice,
    status: held ? "Held" : "Open",
    note: held
      ? file.funding === "loan"
        ? "Included in the loan. Not job revenue."
        : "Collected with the job. Not job revenue."
      : file.pay === "prepaid"
        ? "Prepaid on the membership."
        : "Monthly bill.",
  };
}

function readyAgreement(file: MembershipFile): MemberAgreement {
  if (file.agreement?.status === "Signed") return file.agreement;
  return { status: "Ready", at: "", signer: "", body: memberAgreement(file, getBrand().name) };
}

let seq = 105;
let files: MembershipFile[] = ([
  {
    id: "M-101",
    personId: "L-4761",
    name: "The Whitakers",
    address: "11820 E Shea Blvd",
    city: "Scottsdale, AZ",
    office: "Scottsdale",
    owner: "Dana Ortiz",
    planId: "comfort",
    planName: "Comfort",
    years: 3,
    pay: "prepaid",
    termPrice: 936,
    continueMonthly: 39,
    visitsPerYear: 2,
    status: "Active",
    startedFrom: "account",
    funding: "membership",
    start: "Mar 1, 2026",
    end: "Mar 1, 2029",
    nextBill: "",
  },
  {
    id: "M-102",
    personId: "L-4788",
    name: "Ben & Alyssa Cho",
    address: "9812 N 90th St",
    city: "Scottsdale, AZ",
    office: "Scottsdale",
    owner: "Dana Ortiz",
    planId: "comfort-plus",
    planName: "Comfort Plus",
    years: 1,
    pay: "billed",
    termPrice: 54,
    continueMonthly: 59,
    visitsPerYear: 2,
    status: "Active",
    startedFrom: "job",
    funding: "membership",
    start: "Sep 22, 2026",
    end: "Sep 22, 2027",
    nextBill: "Oct 22, 2026",
  },
  {
    id: "M-103",
    personId: "L-4819",
    name: "Todd & Kim Hale",
    address: "7721 E Via de Ventura",
    city: "Scottsdale, AZ",
    office: "Scottsdale",
    owner: "Dana Ortiz",
    planId: "comfort",
    planName: "Comfort",
    years: 5,
    pay: "prepaid",
    termPrice: 1500,
    continueMonthly: 39,
    visitsPerYear: 2,
    status: "Offered",
    startedFrom: "opportunity",
    funding: "loan",
    oppId: "O-1182",
    start: "Sep 26, 2026",
    end: "Sep 26, 2031",
    nextBill: "",
  },
  {
    id: "M-104",
    personId: "L-4726",
    name: "Paul & Diane Kerr",
    address: "6402 E Thunderbird Rd",
    city: "Scottsdale, AZ",
    office: "Scottsdale",
    owner: "Dana Ortiz",
    planId: "comfort",
    planName: "Comfort",
    years: 1,
    pay: "billed",
    termPrice: 32,
    continueMonthly: 39,
    visitsPerYear: 2,
    status: "Active",
    startedFrom: "account",
    funding: "membership",
    start: "Dec 1, 2025",
    end: "Dec 1, 2026",
    nextBill: "Oct 1, 2026",
  },
] as Array<Omit<MembershipFile, "included" | "repairDiscount">>).map((seed) => {
  const file = { ...seed, included: planById(seed.planId).included, repairDiscount: planById(seed.planId).repairDiscount };
  if (file.id === "M-101") {
    return {
      ...file,
      agreement: { status: "Signed" as const, at: file.start, signer: "Ann Whitaker", body: memberAgreement(file, getBrand().name) },
      card: { brand: "Visa" as const, last4: "4242", exp: "08/28", name: "Ann Whitaker" },
      ledger: [{ id: "M-101-1", at: "Mar 1, 2026", amount: 936, status: "Paid" as const, note: "Prepaid on the membership." }],
      visits: [
        {
          id: "V-101",
          on: "2026-06-12",
          tech: "Luis Cruz",
          did: "Changed the filter. Checked the charge and the drain.",
          parts: [{ id: "VP-101", name: "20x25x1 filter", qty: 1 }],
          checks: [
            { id: "VC-101", label: "Filter", done: true },
            { id: "VC-102", label: "System check", done: true },
            { id: "VC-103", label: "Drain", done: true },
          ],
          customerNote: "Upstairs is fine. The hall bath is slow to cool.",
          serviceNote: "Charge is in range. Drain was clear.",
          failing: "Hall bath supply is weak. Not failed yet.",
          repairs: [],
          status: "Done",
          postedBy: "Luis Cruz",
          postedAt: "Jun 12, 2026",
        },
      ],
    };
  }
  if (file.id === "M-102") {
    return {
      ...file,
      agreement: { status: "Signed" as const, at: file.start, signer: "Alyssa Cho", body: memberAgreement(file, getBrand().name) },
      card: { brand: "Mastercard" as const, last4: "5512", exp: "02/27", name: "Alyssa Cho" },
      ledger: [
        { id: "M-102-1", at: "Sep 22, 2026", amount: 54, status: "Paid" as const, note: "September." },
        { id: "M-102-2", at: "Oct 22, 2026", amount: 54, status: "Open" as const, note: "October." },
      ],
    };
  }
  if (file.id === "M-104") {
    return {
      ...file,
      agreement: { status: "Signed" as const, at: file.start, signer: "Diane Kerr", body: memberAgreement(file, getBrand().name) },
      card: { brand: "Visa" as const, last4: "1881", exp: "11/27", name: "Diane Kerr" },
      ledger: [
        { id: "M-104-1", at: "Sep 1, 2026", amount: 32, status: "Paid" as const, note: "September." },
        { id: "M-104-2", at: "Oct 1, 2026", amount: 32, status: "Open" as const, note: "October." },
      ],
    };
  }
  return {
    ...file,
    agreement: readyAgreement(file),
    ledger: [{ id: "M-103-1", at: file.start, amount: file.termPrice, status: "Held" as const, note: "Included in the loan. Not job revenue." }],
  };
});

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snap() {
  return files;
}

export function membershipFiles() {
  return files;
}

export function useMemberships() {
  return useSyncExternalStore(subscribe, snap, snap);
}

export function useMembership(id: string) {
  return useMemberships().find((m) => m.id === id);
}

export function membershipFor(personId: string) {
  return files.find((m) => m.personId === personId);
}

export function useMembershipFor(personId: string) {
  return useMemberships().find((m) => m.personId === personId);
}

export function listMemberships() {
  return files;
}

export function startMembership(input: {
  personId: string;
  name: string;
  address: string;
  city: string;
  office: string;
  owner: string;
  planId: string;
  years: TermYears;
  pay: PayMode;
  from: MemberOrigin;
}): MembershipFile {
  const existing = membershipFor(input.personId);
  if (existing) {
    if (existing.agreement) return existing;
    const next = { ...existing, agreement: readyAgreement(existing) };
    files = files.map((m) => (m.id === existing.id ? next : m));
    emit();
    return next;
  }
  const plan = planById(input.planId);
  const price = termPrice(plan, input.years);
  const now = new Date();
  const file: MembershipFile = {
    id: `M-${seq++}`,
    personId: input.personId,
    name: input.name,
    address: input.address,
    city: input.city,
    office: input.office,
    owner: input.owner,
    planId: plan.id,
    planName: plan.name,
    years: input.years,
    pay: input.pay,
    termPrice: input.pay === "prepaid" ? price.prepaid : price.monthly,
    continueMonthly: plan.continueMonthly,
    visitsPerYear: plan.visitsPerYear,
    included: plan.included,
    repairDiscount: plan.repairDiscount,
    status: "Offered",
    startedFrom: input.from,
    funding: "membership",
    start: pretty(now),
    end: plusYears(now, input.years),
    nextBill: input.pay === "billed" ? plusMonth(now) : "",
    agreement: { status: "Ready", at: "", signer: "", body: "" },
    ledger: [],
  };
  file.agreement = readyAgreement(file);
  file.ledger = [openingRow(file)];
  files = [file, ...files];
  emit();
  const how = input.pay === "prepaid" ? "prepaid" : "billed monthly";
  addHistory(input.personId, actingName(), `Started ${plan.name}, ${input.years} years, ${how}. Price is locked on the membership.`);
  return file;
}

export function placeOffer(input: {
  personId: string;
  name: string;
  address: string;
  city: string;
  office: string;
  owner: string;
  planId: string;
  planName: string;
  years: TermYears;
  pay: PayMode;
  termPrice: number;
  continueMonthly: number;
  visitsPerYear: number;
  funding: PlanFunding;
  oppId: string;
  sign?: { signer: string; company: string };
}): MembershipFile | "locked" {
  const existing = membershipFor(input.personId);
  if (existing?.status === "Active" && existing.oppId !== input.oppId) return "locked";
  const now = new Date();
  const base: MembershipFile = {
    ...(existing ?? {
      id: `M-${seq++}`,
      personId: input.personId,
      name: input.name,
      address: input.address,
      city: input.city,
      office: input.office,
      owner: input.owner,
      start: pretty(now),
      end: plusYears(now, input.years),
      nextBill: "",
      startedFrom: "opportunity" as const,
      included: planById(input.planId).included,
      repairDiscount: planById(input.planId).repairDiscount,
    }),
    planId: input.planId,
    planName: input.planName,
    years: input.years,
    pay: input.pay,
    termPrice: input.termPrice,
    continueMonthly: input.continueMonthly,
    visitsPerYear: input.visitsPerYear,
    funding: input.pay === "billed" ? "membership" : input.funding,
    oppId: input.oppId,
    status: input.sign && (input.pay === "billed" || input.funding === "membership") ? "Active" : input.sign ? "Offered" : existing?.status === "Active" ? "Active" : "Offered",
    end: existing && existing.years === input.years ? existing.end : plusYears(now, input.years),
    nextBill: input.pay === "billed" ? plusMonth(now) : "",
  };
  if (input.sign) {
    base.agreement = {
      status: "Signed",
      at: pretty(now),
      signer: input.sign.signer,
      body: memberAgreement({ ...base, name: input.name, start: base.start }, input.sign.company),
    };
  } else if (existing?.agreement?.status === "Signed") {
    base.agreement = existing.agreement;
  } else {
    base.agreement = readyAgreement({ ...base, name: input.name });
  }
  const sameMoney = existing && existing.termPrice === base.termPrice && existing.pay === base.pay && existing.funding === base.funding && existing.ledger?.length;
  base.ledger = sameMoney ? existing.ledger : [openingRow(base)];
  base.card = existing?.card;
  base.planFee = sameMoney ? existing.planFee : 0;
  files = existing ? files.map((m) => (m.id === existing.id ? base : m)) : [base, ...files];
  emit();
  return base;
}

function patchFile(id: string, fn: (file: MembershipFile) => MembershipFile) {
  const cur = files.find((m) => m.id === id);
  if (!cur) return;
  files = files.map((m) => (m.id === id ? fn(cur) : m));
  emit();
  return files.find((m) => m.id === id);
}

export function saveCard(id: string, card: CardOnFile) {
  const last4 = card.last4.trim();
  const exp = card.exp.trim();
  const name = card.name.trim();
  if (!/^\d{4}$/.test(last4)) return "last4";
  if (card.brand !== "ACH" && !/^\d{2}\/\d{2}$/.test(exp)) return "exp";
  if (!name) return "name";
  const file = files.find((m) => m.id === id);
  if (!file) return "missing";
  patchFile(id, (m) => ({ ...m, card: { brand: card.brand, last4, exp: card.brand === "ACH" ? "" : exp, name } }));
  addHistory(file.personId, actingName(), `Card on file ${card.brand} ${last4}.`);
  return "ok";
}

export function postCardPayment(
  id: string,
  rowId: string,
  slip: { brand: string; last4: string; exp: string; name: string; vaultId?: string; receipt: string; rail?: "stripe" | "goodleap" },
) {
  const file = files.find((m) => m.id === id);
  const open = file?.ledger?.find((row) => row.id === rowId && row.status === "Open");
  if (!file || !open || !slip.last4) return;
  const at = pretty(new Date());
  const label = open.note.replace(/\.$/, "").split(".")[0] || "Invoice";
  patchFile(id, (m) => ({
    ...m,
    status: m.agreement?.status === "Signed" && (m.pay === "billed" || m.funding === "membership") ? "Active" : m.status,
    card: { brand: (slip.brand || "Visa") as CardOnFile["brand"], last4: slip.last4, exp: slip.exp, name: slip.name, vaultId: slip.vaultId, rail: slip.rail ?? "stripe" },
    ledger: m.ledger?.map((row) =>
      row.id === open.id ? { ...row, status: "Paid" as const, at, note: `${row.note} ${slip.brand} ····${slip.last4}. ${slip.receipt}.` } : row,
    ),
  }));
  addHistory(file.personId, actingName(), `Charged ${label} for ${open.amount} on ${slip.brand} ····${slip.last4}. Receipt ${slip.receipt}.`);
}

export function failPayment(id: string, rowId: string, how: "Card declined" | "NSF") {
  const file = files.find((m) => m.id === id);
  const open = file?.ledger?.find((row) => row.id === rowId && row.status === "Open");
  if (!file || !open) return;
  const at = pretty(new Date());
  const retryOn = pretty(plusDays(new Date(), 3));
  const label = open.note.replace(/\.$/, "").split(".")[0] || "Invoice";
  patchFile(id, (m) => ({
    ...m,
    retryOn,
    ledger: m.ledger?.map((row) => (row.id === open.id ? { ...row, status: "Failed" as const, at, note: `${label}. ${how}.` } : row)),
  }));
  addHistory(file.personId, actingName(), `${label} failed. ${how}. It comes back ${retryOn}.`);
}

function planInvoice(row: LedgerRow) {
  return !row.note.startsWith("Repair") && !row.note.startsWith("Refund");
}

function invoiceDue(row: LedgerRow, now = new Date()) {
  if (row.status === "Failed") return true;
  if (row.status !== "Open") return false;
  const due = parseDay(row.at);
  return !due || due <= now;
}

export function billOpen(file: MembershipFile) {
  return (file.ledger ?? []).some((row) => planInvoice(row) && invoiceDue(row));
}

export function rollBills(id: string) {
  const file = files.find((m) => m.id === id);
  if (!file || (file.status !== "Active" && file.status !== "Continued")) return;
  const monthly = file.pay === "billed" || file.status === "Continued";
  if (monthly && file.nextBill) {
    let due = parseDay(file.nextBill);
    let guard = 0;
    while (due && due <= new Date() && guard < 18) {
      guard += 1;
      const stamp = pretty(due);
      const current = files.find((m) => m.id === id);
      const already = (current?.ledger ?? []).some((row) => planInvoice(row) && row.at === stamp);
      const amount = current?.status === "Continued" ? current.continueMonthly : current?.termPrice ?? file.termPrice;
      const next = plusMonth(due);
      if (!already && current) {
        const note = `${due.toLocaleDateString("en-US", { month: "long" })}.`;
        patchFile(id, (m) => ({
          ...m,
          nextBill: next,
          ledger: [...(m.ledger ?? []), { id: `${m.id}-bill-${stamp.replace(/\W/g, "")}`, at: stamp, amount, status: "Open" as const, note }],
        }));
        addHistory(file.personId, actingName(), `${note.replace(".", "")} posted. ${amount}.`);
      } else {
        patchFile(id, (m) => ({ ...m, nextBill: next }));
      }
      due = parseDay(next);
    }
  }
  const waiting = files.find((m) => m.id === id);
  const retry = waiting?.retryOn ? parseDay(waiting.retryOn) : null;
  if (!waiting || !retry || retry > new Date()) return;
  const failed = [...(waiting.ledger ?? [])].reverse().find((row) => row.status === "Failed" && planInvoice(row));
  if (!failed || (waiting.ledger ?? []).some((row) => row.status === "Open" && row.note === "Retry.")) {
    patchFile(id, (m) => ({ ...m, retryOn: "" }));
    return;
  }
  patchFile(id, (m) => ({
    ...m,
    retryOn: "",
    ledger: [...(m.ledger ?? []), { id: `${m.id}-retry-${Date.now()}`, at: pretty(new Date()), amount: failed.amount, status: "Open" as const, note: "Retry." }],
  }));
  addHistory(file.personId, actingName(), "The failed card is back. The invoice is open again.");
}

export function fundHeld(id: string) {
  const file = files.find((m) => m.id === id);
  if (!file?.ledger?.some((row) => row.status === "Held")) return;
  const at = pretty(new Date());
  patchFile(id, (m) => ({
    ...m,
    status: m.agreement?.status === "Signed" ? "Active" : "Offered",
    ledger: m.ledger?.map((row) => (row.status === "Held" ? { ...row, status: "Paid" as const, at, note: `${row.note} Funded. Still not job revenue.` } : row)),
  }));
  addHistory(file.personId, actingName(), file.funding === "loan" ? "Loan funded the membership. Not job revenue." : "Job collected the membership. Not job revenue.");
}

export function setPlanFee(personId: string, fee: number) {
  const file = membershipFor(personId);
  if (!file || file.planFee === fee) return;
  files = files.map((m) => (m.personId === personId ? { ...m, planFee: fee } : m));
  emit();
}

export function acceptMembership(id: string, signer: string, company: string) {
  const file = files.find((m) => m.id === id);
  const name = signer.trim();
  if (!file || file.agreement?.status === "Signed" || !name) return;
  const next: MembershipFile = {
    ...file,
    status: file.pay === "billed" || file.funding === "membership" ? "Active" : "Offered",
    agreement: {
      status: "Signed",
      at: pretty(new Date()),
      signer: name,
      body: file.agreement?.body || memberAgreement(file, company),
    },
  };
  files = files.map((m) => (m.id === id ? next : m));
  emit();
  addHistory(file.personId, actingName(), `Signed the ${file.planName} membership agreement.`);
  return next;
}

export function memberTone(status: MemberStatus): "navy" | "up" | "muted" {
  if (status === "Active") return "up";
  if (status === "Continued") return "navy";
  return "muted";
}

export function priceLabel(file: Pick<MembershipFile, "pay" | "termPrice" | "years">, money: (n: number) => string) {
  if (file.pay === "prepaid") return `${money(file.termPrice)} prepaid`;
  return `${money(file.termPrice)}/mo`;
}

export function scheduleNotice(id: string, amount: number, startsOn: string) {
  const file = files.find((m) => m.id === id);
  const start = parseDay(startsOn);
  const earliest = plusDays(new Date(), NOTICE_DAYS);
  if (!file || file.status === "Offered" || file.status === "Canceled") return "closed";
  if (!canOverrideFee()) return "admin";
  if (!Number.isFinite(amount) || amount < 0) return "amount";
  if (!start || start < earliest) return "early";
  patchFile(id, (m) => ({ ...m, notice: { amount, toldOn: pretty(new Date()), startsOn: isoDay(start) } }));
  addHistory(file.personId, actingName(), `Told them the continue rate becomes ${amount} on ${pretty(start)}. The term price does not change.`);
  return "ok";
}

export function applyDueNotice(id: string) {
  const file = files.find((m) => m.id === id);
  const starts = file?.notice ? parseDay(file.notice.startsOn) : null;
  if (!file?.notice || !starts || starts > new Date()) return;
  const amount = file.notice.amount;
  patchFile(id, (m) => ({ ...m, continueMonthly: amount, notice: undefined }));
  addHistory(file.personId, actingName(), `Continue rate is now ${amount}. The term price was not changed.`);
}

export function settleTerm(id: string) {
  const file = files.find((m) => m.id === id);
  const end = file ? parseDay(file.end) : null;
  if (!file || !end || file.status !== "Active" || file.renewal?.status === "Locked" || new Date() <= end) return;
  const amount = rateAfterTerm(file);
  const rowId = `${file.id}-continue`;
  patchFile(id, (m) => ({
    ...m,
    status: "Continued",
    pay: "billed",
    funding: "membership",
    continueMonthly: amount,
    nextBill: pretty(new Date()),
    ledger: (m.ledger ?? []).some((row) => row.id === rowId)
      ? m.ledger
      : [...(m.ledger ?? []), { id: rowId, at: pretty(end), amount, status: "Open" as const, note: "Continued after the term. Not a new term." }],
  }));
  addHistory(file.personId, actingName(), `The term ended. Service continues at ${amount} a month until they cancel or lock a new term.`);
}

export function passRenewal(id: string) {
  const file = files.find((m) => m.id === id);
  if (!file || !renewalOpen(file)) return;
  const at = pretty(new Date());
  patchFile(id, (m) => ({
    ...m,
    renewal: {
      years: m.years,
      pay: m.pay,
      termPrice: m.termPrice,
      continueMonthly: rateAfterTerm(m),
      status: "Passed",
      at,
    },
  }));
  addHistory(file.personId, actingName(), `Passed on a new term. After ${file.end}, service continues at ${rateAfterTerm(file)} a month unless they lock one.`);
}

export function lockRenewal(id: string, years: TermYears, pay: PayMode) {
  const file = files.find((m) => m.id === id);
  if (!file || !renewalOpen(file) || file.agreement?.status !== "Signed") return "closed";
  const plan = planById(file.planId);
  const price = termPrice(plan, years);
  const termPriceAmount = pay === "prepaid" ? price.prepaid : price.monthly;
  const start = parseDay(file.end) ?? new Date();
  const at = pretty(new Date());
  patchFile(id, (m) => ({
    ...m,
    status: "Active",
    years,
    pay,
    termPrice: termPriceAmount,
    continueMonthly: plan.continueMonthly,
    funding: "membership",
    end: plusYears(start, years),
    nextBill: pay === "billed" ? pretty(start) : "",
    notice: undefined,
    renewal: { years, pay, termPrice: termPriceAmount, continueMonthly: plan.continueMonthly, status: "Locked", at },
    ledger: [
      ...(m.ledger ?? []),
      {
        id: `${m.id}-renew-${Date.now()}`,
        at,
        amount: termPriceAmount,
        status: "Open" as const,
        note: pay === "prepaid" ? "Renewal. Prepaid on the membership. Not job revenue." : "Renewal. First month of the new term.",
      },
    ],
  }));
  addHistory(file.personId, actingName(), `Locked a ${years}-year renewal at ${termPriceAmount}. The old agreement stays on the file.`);
  return "ok";
}

function mapVisit(id: string, visitId: string, fn: (visit: MemberVisit) => MemberVisit) {
  const file = files.find((m) => m.id === id);
  if (!file) return;
  patchFile(id, (m) => ({ ...m, visits: (m.visits ?? []).map((visit) => (visit.id === visitId ? fn(visit) : visit)) }));
}

export function addVisit(id: string, tech: string) {
  const file = files.find((m) => m.id === id);
  if (!file || (file.status !== "Active" && file.status !== "Continued")) return;
  const visit: MemberVisit = {
    id: `V-${Date.now()}`,
    on: new Date().toISOString().slice(0, 10),
    tech,
    did: "",
    checks: (file.included ?? []).map((label, index) => ({ id: `VC-${Date.now()}-${index}`, label, done: false })),
    parts: [],
    customerNote: "",
    serviceNote: "",
    failing: "",
    repairs: [],
    status: "Open",
  };
  patchFile(id, (m) => ({ ...m, visits: [visit, ...(m.visits ?? [])] }));
  addHistory(file.personId, actingName(), `Opened a membership visit${tech ? ` for ${tech}` : ""}.`);
}

export function bookMembershipVisit(id: string, input: { on: string; time: string; tech: string }) {
  const file = files.find((m) => m.id === id);
  const tech = input.tech.trim();
  if (!file || (file.status !== "Active" && file.status !== "Continued")) return "closed";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.on) || !/^\d{2}:\d{2}$/.test(input.time) || !tech) return "missing";
  const start = `${input.on}T${input.time}`;
  const visitId = `V-${Date.now()}`;
  const resourceId = tech.toLowerCase().split(" ")[0] ?? "";
  const booked = createBook({
    type: "Membership",
    title: file.name.replace(/^The\s+/i, ""),
    personId: file.personId,
    href: `/memberships/${file.id}`,
    resourceId,
    techId: resourceId,
    start,
    end: addHrs(start, 1),
    city: file.city,
    notes: file.included.length ? file.included.join(", ") : "Membership visit",
    setBy: actingName(),
    scope: file.planName,
    office: /dallas|fort worth/i.test(file.office + file.city) ? "DFW" : "PHX",
    status: "Confirmed",
    source: "visit",
    sourceId: visitId,
  });
  const visit: MemberVisit = {
    id: visitId,
    on: input.on,
    time: input.time,
    tech,
    did: "",
    checks: (file.included ?? []).map((label, index) => ({ id: `VC-${Date.now()}-${index}`, label, done: false })),
    parts: [],
    customerNote: "",
    serviceNote: "",
    failing: "",
    repairs: [],
    status: "Set",
    bookId: booked.id,
  };
  patchFile(id, (m) => ({ ...m, visits: [visit, ...(m.visits ?? [])] }));
  addHistory(file.personId, actingName(), `Booked a membership visit for ${tech} on ${input.on} at ${input.time}.`);
  return "ok";
}

function visitEditable(visit?: MemberVisit) {
  return visit?.status === "Set" || visit?.status === "Open";
}

function techColumn(name: string) {
  return name.trim().toLowerCase().split(" ")[0] ?? "";
}

function syncVisitBook(visit: MemberVisit, done: boolean) {
  if (!visit.bookId || !/^\d{4}-\d{2}-\d{2}$/.test(visit.on) || !/^\d{2}:\d{2}$/.test(visit.time ?? "")) return;
  const start = `${visit.on}T${visit.time}`;
  const resourceId = techColumn(visit.tech);
  patchBook(visit.bookId, { start, end: addHrs(start, 1), resourceId, techId: resourceId, status: done ? "Done" : "Confirmed" });
}

export function postVisit(id: string, visitId: string) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  if (!file || !visit || !visitEditable(visit)) return "closed";
  if (!visit.on) return "date";
  if (!visit.tech.trim()) return "tech";
  const at = pretty(new Date());
  const by = actingName();
  mapVisit(id, visitId, (row) => ({ ...row, status: "Done", postedAt: at, postedBy: by }));
  if (visit.bookId) patchBook(visit.bookId, { status: "Done" });
  addHistory(file.personId, by, `Posted the membership visit for ${visit.tech} on ${visit.on}.`);
  return "ok";
}

export function amendVisit(
  id: string,
  visitId: string,
  why: string,
  patch: Partial<Pick<MemberVisit, "on" | "time" | "tech" | "did" | "customerNote" | "serviceNote" | "failing" | "checks" | "parts" | "repairs">>,
) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  const reason = why.trim();
  if (!file || !visit || visitEditable(visit)) return "open";
  if (!canOverrideFee()) return "admin";
  if (!reason) return "why";
  const on = (patch.on ?? visit.on).trim();
  const tech = (patch.tech ?? visit.tech).trim();
  if (!on || !tech) return "missing";
  const repairs = (patch.repairs ?? visit.repairs).map((repair) => {
    const prev = visit.repairs.find((row) => row.id === repair.id);
    return prev?.status === "Paid" ? prev : repair;
  });
  const next: MemberVisit = {
    ...visit,
    ...patch,
    on,
    tech,
    repairs,
    status: "Done",
    edits: [...(visit.edits ?? []), { at: pretty(new Date()), by: actingName(), why: reason }],
  };
  mapVisit(id, visitId, () => next);
  if (next.bookId) syncVisitBook(next, true);
  addHistory(file.personId, actingName(), `Changed the posted visit on ${on}. ${reason}`);
  return "ok";
}

export function patchVisit(id: string, visitId: string, patch: Partial<Pick<MemberVisit, "on" | "tech" | "time" | "did" | "customerNote" | "serviceNote" | "failing">>) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  if (!visit || !visitEditable(visit)) return;
  const next = { ...visit, ...patch };
  mapVisit(id, visitId, (row) => ({ ...row, ...patch }));
  if (visit.bookId && (patch.on !== undefined || patch.tech !== undefined || patch.time !== undefined)) syncVisitBook(next, false);
}

export function patchVisitCheck(id: string, visitId: string, checkId: string, done: boolean) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    checks: (row.checks ?? []).map((check) => (check.id === checkId ? { ...check, done } : check)),
  }));
}

export function setRepairCovered(id: string, visitId: string, repairId: string, covered: boolean) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    repairs: row.repairs.map((repair) => (repair.id === repairId && repair.status === "Open" ? { ...repair, covered } : repair)),
  }));
}

export function memberPrice(amount: number, discount: number) {
  const pct = Math.min(100, Math.max(0, discount || 0));
  return Math.round(amount * (100 - pct)) / 100;
}

export function dropVisit(id: string, visitId: string) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  if (!file || !visit || !visitEditable(visit) || visit.repairs.some((repair) => repair.status === "Paid")) return;
  if (visit.bookId) removeBook(visit.bookId);
  patchFile(id, (m) => ({ ...m, visits: (m.visits ?? []).filter((row) => row.id !== visitId) }));
  addHistory(file.personId, actingName(), "Removed a membership visit.");
}

export function addVisitPart(id: string, visitId: string) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  const part: VisitPart = { id: `VP-${Date.now()}`, name: "", qty: 1 };
  mapVisit(id, visitId, (row) => ({ ...row, parts: [...row.parts, part] }));
}

export function patchVisitPart(id: string, visitId: string, partId: string, patch: Partial<Pick<VisitPart, "name" | "qty">>) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    parts: row.parts.map((part) => (part.id === partId ? { ...part, ...patch } : part)),
  }));
}

export function dropVisitPart(id: string, visitId: string, partId: string) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({ ...row, parts: row.parts.filter((part) => part.id !== partId) }));
}

export function addVisitRepair(id: string, visitId: string) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  const repair: VisitRepair = { id: `VR-${Date.now()}`, name: "", amount: 0, status: "Open" };
  mapVisit(id, visitId, (row) => ({ ...row, repairs: [...row.repairs, repair] }));
}

export function patchVisitRepair(id: string, visitId: string, repairId: string, patch: Partial<Pick<VisitRepair, "name" | "amount">>) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    repairs: row.repairs.map((repair) => (repair.id === repairId && repair.status === "Open" ? { ...repair, ...patch } : repair)),
  }));
}

export function dropVisitRepair(id: string, visitId: string, repairId: string) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    repairs: row.repairs.filter((repair) => repair.id !== repairId || repair.status === "Paid"),
  }));
}

export function payVisitRepair(
  id: string,
  visitId: string,
  repairId: string,
  slip: { brand: string; last4: string; receipt: string },
) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  const repair = visit?.repairs.find((row) => row.id === repairId);
  if (!file || !visit || !repair || repair.status === "Paid" || repair.covered || repair.amount <= 0 || !slip.last4) return;
  const at = pretty(new Date());
  const amount = memberPrice(repair.amount, file.repairDiscount);
  patchFile(id, (m) => ({
    ...m,
    visits: (m.visits ?? []).map((row) =>
      row.id === visitId
        ? {
            ...row,
            repairs: row.repairs.map((item) =>
              item.id === repairId ? { ...item, status: "Paid" as const, receipt: slip.receipt, last4: slip.last4 } : item,
            ),
          }
        : row,
    ),
    ledger: [
      ...(m.ledger ?? []),
      {
        id: `${repairId}-pay`,
        at,
        amount,
        status: "Paid" as const,
        note: `Repair. ${repair.name || "Visit repair"}. ${file.repairDiscount ? `Member price, ${file.repairDiscount}% off.` : "No member discount."} ${slip.brand} ····${slip.last4}. ${slip.receipt}. Not plan dues.`,
      },
    ],
  }));
  addHistory(file.personId, actingName(), `${visit.tech || "Tech"} charged ${amount} for ${repair.name || "a repair"} on the membership visit. Receipt ${slip.receipt}.`);
}

export function amountLeft(file: MembershipFile) {
  if (file.pay === "prepaid") {
    const start = parseDay(file.start);
    const end = parseDay(file.end);
    if (!start || !end) return 0;
    const total = end.getTime() - start.getTime();
    const left = end.getTime() - Date.now();
    if (total <= 0 || left <= 0) return 0;
    return Math.round((file.termPrice * left) / total);
  }
  return (file.ledger ?? []).filter((row) => row.status === "Open" && !row.note.startsWith("Repair")).reduce((sum, row) => sum + row.amount, 0);
}

function pushChange(file: MembershipFile, change: PlanChange) {
  return [...(file.changes ?? []), change];
}

export function transferMembership(id: string, address: string, city: string, note: string) {
  const file = files.find((m) => m.id === id);
  const why = note.trim();
  if (!canOverrideFee()) return "admin";
  if (!file || file.status === "Canceled" || file.status === "Offered") return "closed";
  if (!address.trim() || !city.trim() || !why) return "missing";
  const at = pretty(new Date());
  const by = actingName();
  patchFile(id, (m) => ({
    ...m,
    address: address.trim(),
    city: city.trim(),
    changes: pushChange(m, { id: `CH-${Date.now()}`, at, by, kind: "transfer", from: `${m.address}, ${m.city}`, to: `${address.trim()}, ${city.trim()}`, note: why }),
  }));
  addHistory(file.personId, by, `Transferred the membership to ${address.trim()}, ${city.trim()}. ${why}`);
  return "ok";
}

export function changeMembershipPlan(id: string, planId: string) {
  const file = files.find((m) => m.id === id);
  if (!canOverrideFee()) return "admin";
  if (!file || file.status === "Canceled" || file.status === "Offered") return "closed";
  const plan = planById(planId);
  if (!plan || plan.id === file.planId) return "same";
  const price = termPrice(plan, file.years);
  const nextPrice = file.pay === "prepaid" ? price.prepaid : price.monthly;
  const kind = nextPrice > file.termPrice ? "upgrade" : "downgrade";
  const at = pretty(new Date());
  const by = actingName();
  const gap = file.pay === "prepaid" && kind === "upgrade" ? nextPrice - file.termPrice : 0;
  patchFile(id, (m) => ({
    ...m,
    planId: plan.id,
    planName: plan.name,
    termPrice: nextPrice,
    continueMonthly: plan.continueMonthly,
    visitsPerYear: plan.visitsPerYear,
    included: plan.included,
    repairDiscount: plan.repairDiscount,
    changes: pushChange(m, {
      id: `CH-${Date.now()}`,
      at,
      by,
      kind,
      from: `${m.planName} · ${m.termPrice}`,
      to: `${plan.name} · ${nextPrice}`,
      note: kind === "downgrade" ? "No automatic refund." : gap ? `Difference ${gap} is open on the ledger.` : "The next bill uses this price. A bill already open stays as it was.",
    }),
    ledger: gap
      ? [...(m.ledger ?? []), { id: `CH-pay-${Date.now()}`, at, amount: gap, status: "Open" as const, note: "Plan change. Difference. Not a refund." }]
      : m.ledger,
  }));
  addHistory(file.personId, by, `${kind === "upgrade" ? "Upgraded" : "Downgraded"} the membership from ${file.planName} to ${plan.name}.`);
  return "ok";
}

export function cancelMembership(id: string, reason: string, refund: CancelRecord["refund"], partial = 0) {
  const file = files.find((m) => m.id === id);
  const why = reason.trim();
  if (!canOverrideFee()) return "admin";
  if (!file || file.status === "Canceled") return "closed";
  if (!why) return "reason";
  const left = amountLeft(file);
  const amount = refund === "none" ? 0 : refund === "full" ? left : Math.round(partial);
  if (refund === "partial" && amount <= 0) return "amount";
  const at = pretty(new Date());
  const by = actingName();
  patchFile(id, (m) => ({
    ...m,
    status: "Canceled",
    nextBill: "",
    cancel: { at, by, reason: why, refund, amount },
    ledger:
      amount > 0
        ? [...(m.ledger ?? []), { id: `${m.id}-refund`, at, amount, status: "Paid" as const, note: `Refund. ${why}` }]
        : m.ledger,
  }));
  addHistory(file.personId, by, `Canceled the membership. ${why} ${amount > 0 ? `Refund ${amount}.` : "No refund."}`);
  return "ok";
}

export function replaceCard(
  id: string,
  slip: { brand: string; last4: string; exp: string; name: string; vaultId?: string; rail?: "stripe" | "goodleap" },
) {
  const file = files.find((m) => m.id === id);
  if (!file || !slip.last4) return;
  patchFile(id, (m) => ({
    ...m,
    card: { brand: (slip.brand || "Visa") as CardOnFile["brand"], last4: slip.last4, exp: slip.exp, name: slip.name, vaultId: slip.vaultId, rail: slip.rail ?? "stripe" },
  }));
  addHistory(file.personId, actingName(), `Replaced the card on file. ${slip.brand} ····${slip.last4}. The open invoice was not charged.`);
}

export function saveAch(id: string, input: { bank: string; last4: string; name: string }) {
  const file = files.find((m) => m.id === id);
  const last4 = input.last4.replace(/\D/g, "");
  if (!file || !input.bank.trim() || !input.name.trim() || !/^\d{4}$/.test(last4)) return "missing";
  patchFile(id, (m) => ({
    ...m,
    card: { brand: "ACH", last4, exp: "", name: input.name.trim(), bank: input.bank.trim() },
  }));
  addHistory(file.personId, actingName(), `Billing is now ACH ····${last4}. The full account number is not stored.`);
  return "ok";
}
