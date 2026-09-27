import type { Account, Lead, Opportunity, Project } from "@/lib/crm-data";
import type { MembershipFile, MemberStatus, PayMode, PlanFunding, TermYears } from "@/features/membership/types";
import { STREETS, person, leadOf, STAGES, JOBS } from "./part-01";

/** Extra open opportunities. Combined with the open originals this clears 20. */
const opportunityBuilt = Array.from({ length: 15 }, (_, i) => {
  const p = person(70 + i);
  const lead = leadOf(p, `L-62${String(i + 1).padStart(2, "0")}`, "Proposal", "navy", "Decision");
  const stage = STAGES[i % STAGES.length];
  const opp: Opportunity = {
    id: `O-70${String(i + 1).padStart(2, "0")}`,
    leadId: lead.id,
    name: p.name,
    product: p.product,
    stage: stage.stage,
    tone: stage.tone,
    amount: p.value,
    closer: p.closer,
    office: p.office,
    updated: "Sep 20",
    closeBy: `Oct ${3 + (i % 18)}`,
  };
  return { opp, lead };
});

export const rosterOpportunities: Opportunity[] = opportunityBuilt.map((row) => row.opp);

export const rosterOpportunityLeads: Lead[] = opportunityBuilt.map((row) => row.lead);

/** Extra open jobs. Combined with the open originals this clears 20. */
export const rosterProjects: Project[] = Array.from({ length: 15 }, (_, i) => {
  const p = person(90 + i);
  const status = JOBS[i % JOBS.length];
  return {
    id: `P-50${String(i + 1).padStart(2, "0")}`,
    accountId: `A-50${String(i + 1).padStart(2, "0")}`,
    name: `${p.name.split(" ")[0]}, ${p.product.split(" ")[0].toLowerCase()}`,
    product: p.product,
    status,
    tone: status === "On hold" ? "alert" : status === "In progress" ? "up" : "navy",
    amount: p.value,
    office: p.office,
    pm: i % 2 === 0 ? "Tasha Reed" : "Evan Cole",
    install: status === "On hold" ? "Hold" : `Oct ${2 + (i % 20)}`,
  };
});

export const rosterProjectLeads: Lead[] = Array.from({ length: 15 }, (_, i) => leadOf(person(90 + i), `L-63${String(i + 1).padStart(2, "0")}`, "Won", "up", "In production"));

export const rosterProjectAccounts: Account[] = Array.from({ length: 15 }, (_, i) => {
  const p = person(90 + i);
  return { id: `A-50${String(i + 1).padStart(2, "0")}`, name: p.name, type: "New", city: p.city, owner: p.closer, jobs: 1, lifetime: p.value, last: "Sep 18" };
});

/** Extra accounts that stay on the account list. Combined with the originals this clears 40. */
export const rosterAccounts: Account[] = Array.from({ length: 37 }, (_, i) => {
  const p = person(110 + i);
  return {
    id: `A-70${String(i + 1).padStart(2, "0")}`,
    name: p.name,
    type: i % 2 === 0 ? "Repeat" : "New",
    city: p.city,
    owner: p.closer,
    jobs: 1 + (i % 3),
    lifetime: p.value * (1 + (i % 3)),
    last: "Sep 12",
  };
});

export const rosterAccountLeads: Lead[] = Array.from({ length: 37 }, (_, i) => leadOf(person(110 + i), `L-64${String(i + 1).padStart(2, "0")}`, "Won", "up", "Account"));

type MemberSeed = Omit<MembershipFile, "included" | "repairDiscount">;

const PLANS = [
  { planId: "comfort", planName: "Comfort", termPrice: 32, continueMonthly: 39, visitsPerYear: 2 },
  { planId: "comfort-plus", planName: "Comfort Plus", termPrice: 54, continueMonthly: 59, visitsPerYear: 2 },
];

/** Sixteen more memberships. Combined with the original four this clears 20. */
export const rosterMemberships: MemberSeed[] = Array.from({ length: 16 }, (_, i) => {
  const p = person(150 + i);
  const plan = PLANS[i % PLANS.length];
  const years = ([1, 3, 5] as TermYears[])[i % 3];
  const pay: PayMode = i % 2 === 0 ? "billed" : "prepaid";
  const status: MemberStatus = i % 7 === 0 ? "Offered" : "Active";
  const funding: PlanFunding = pay === "prepaid" && status === "Offered" ? "loan" : "membership";
  return {
    id: `M-${110 + i}`,
    personId: `L-65${String(i + 1).padStart(2, "0")}`,
    name: p.name,
    address: `${1400 + i * 13} ${STREETS[i % STREETS.length]}`,
    city: p.city,
    office: p.office,
    owner: p.closer,
    planId: plan.planId,
    planName: plan.planName,
    years,
    pay,
    termPrice: pay === "prepaid" ? plan.termPrice * 12 * (years / 1) : plan.termPrice,
    continueMonthly: plan.continueMonthly,
    visitsPerYear: plan.visitsPerYear,
    status,
    startedFrom: "account",
    funding,
    start: "Mar 1, 2026",
    end: `Mar 1, ${2026 + years}`,
    nextBill: pay === "billed" ? "Oct 1, 2026" : "",
  };
});

export const rosterMembershipLeads: Lead[] = Array.from({ length: 16 }, (_, i) => leadOf(person(150 + i), `L-65${String(i + 1).padStart(2, "0")}`, "Won", "up", "Membership"));
