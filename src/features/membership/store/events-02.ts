import { membershipFor, pretty, plusYears, plusMonth, openingRow } from "./events";
import { readyAgreement } from "./seed";
import { write_files, files, emit, take_seq } from "./core";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { planById, termPrice } from "../catalog";
import type { MemberOrigin, MembershipFile, PayMode, TermYears } from "../types";

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
    write_files(files.map((m) => (m.id === existing.id ? next : m)));
    emit();
    return next;
  }
  const plan = planById(input.planId);
  const price = termPrice(plan, input.years);
  const now = new Date();
  const file: MembershipFile = {
    id: `M-${take_seq()}`,
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
  write_files([file, ...files]);
  emit();
  const how = input.pay === "prepaid" ? "prepaid" : "billed monthly";
  addHistory(input.personId, actingName(), `Started ${plan.name}, ${input.years} years, ${how}. Price is locked on the membership.`);
  return file;
}
