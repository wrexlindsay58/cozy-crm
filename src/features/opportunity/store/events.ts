import type { Proposal, PayOffer } from "./types";
import { optionTotal } from "./options";
import { offerMethod, payAmount } from "./pricing";
import { useProposals } from "./present";
import { extraOpps, proposals, write_proposals, emit, write_extraOpps } from "./core";
import { seedFor } from "./seed-02";
import { rebateWhen, type OptLine } from "./seed";
import type { FinancePlan } from "@/features/money-settings/store";
import { opportunities, type Opportunity } from "@/lib/crm-data";

/** The list shows one number: the accepted option if they bought one, otherwise the recommended option. The other options stay on the proposal. */
export function listedQuote(proposal: Proposal | undefined, fallback: number) {
  const options = proposal?.options ?? [];
  const sold = proposal?.accepted ? options.find((o) => o.id === proposal.accepted) : undefined;
  const recommended = options.find((o) => o.id === "A") ?? options[0];
  const picked = sold ?? recommended;
  if (!picked) return { amount: fallback, label: "No options yet", count: options.length };
  return {
    amount: optionTotal(picked),
    label: sold ? `Sold · ${picked.name}` : picked.name,
    count: options.length,
  };
}

export function methodPlans(offer: PayOffer): FinancePlan[] {
  return offerMethod(offer)?.plans ?? [];
}

export function bundledDue(proposal: Proposal, install: number, offer: PayOffer, plan?: { months: number; apr: number }) {
  const member = proposal.memberOffer;
  const ride = Boolean(member && member.pay === "prepaid" && (member.funding === "job" || member.funding === "loan"));
  const installDue = payAmount(proposal, install, offer, plan);
  const planDue = ride && member ? payAmount(proposal, member.termPrice, offer, plan) : 0;
  return {
    ride,
    install,
    installDue,
    plan: ride && member ? member.termPrice : 0,
    planDue,
    due: installDue + planDue,
    installFee: installDue - install,
    planFee: planDue - (ride && member ? member.termPrice : 0),
  };
}

export function useOpportunityList() {
  useProposals();
  return [...opportunities, ...extraOpps];
}

export function ensureOpportunity(lead: { id: string; name: string; product: string; value: number; closer: string; office: string }): Opportunity {
  const found = [...opportunities, ...extraOpps].find((o) => o.leadId === lead.id);
  if (found) {
    if (!proposals[found.id]) {
      write_proposals({ ...proposals, [found.id]: seedFor(found.id, lead.id, lead.closer, lead.product || "Scope", found.stage) });
      emit();
    }
    return found;
  }
  const row: Opportunity = {
    id: `O-${1200 + extraOpps.length}`,
    leadId: lead.id,
    name: lead.name,
    product: lead.product || "Scope",
    stage: "Proposal out",
    tone: "navy",
    amount: lead.value,
    closer: lead.closer,
    office: lead.office,
    updated: "Today",
    closeBy: "Open",
  };
  write_extraOpps([...extraOpps, row]);
  write_proposals({ ...proposals, [row.id]: seedFor(row.id, lead.id, lead.closer, row.product, row.stage) });
  emit();
  return row;
}

export function demoMonthly(total: number, months: number) {
  return Math.round(total / months);
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
  write_proposals({
    ...proposals,
    [oppId]: { ...p, options: p.options.map((o) => (o.id === optId ? { ...o, lines: [...o.lines, line] } : o)) },
  });
  emit();
}
