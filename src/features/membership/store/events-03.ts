import { membershipFor, pretty, plusYears, plusMonth, openingRow } from "./events";
import { take_seq, write_files, files, emit } from "./core";
import { readyAgreement } from "./seed";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { planById, termPrice } from "../catalog";
import { parseDay } from "../renew";
import type { LedgerRow, MembershipFile, PayMode, PlanFunding, TermYears } from "../types";
import { memberAgreement } from "../agreement";

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
      id: `M-${take_seq()}`,
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
  write_files(existing ? files.map((m) => (m.id === existing.id ? base : m)) : [base, ...files]);
  emit();
  return base;
}

export function patchFile(id: string, fn: (file: MembershipFile) => MembershipFile) {
  const cur = files.find((m) => m.id === id);
  if (!cur) return;
  write_files(files.map((m) => (m.id === id ? fn(cur) : m)));
  emit();
  return files.find((m) => m.id === id);
}

export function invoiceDue(row: LedgerRow, now = new Date()) {
  if (row.status === "Failed") return true;
  if (row.status !== "Open") return false;
  const due = parseDay(row.at);
  return !due || due <= now;
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
  write_files(files.map((m) => (m.id === id ? next : m)));
  emit();
  addHistory(file.personId, actingName(), `Signed the ${file.planName} membership agreement.`);
  return next;
}

export function techColumn(name: string) {
  return name.trim().toLowerCase().split(" ")[0] ?? "";
}
