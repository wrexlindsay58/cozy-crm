import { completeAssessment, startAssessment } from "@/features/assessment/store";
import { openAccountForJob } from "@/features/account/store";
import { openSoldJob, setJobAccount } from "@/features/job/store";
import { ensureOpportunity, optionTotal, type Proposal } from "@/features/opportunity/store";
import type { Lead } from "@/lib/crm-data";
import { accounts } from "@/lib/crm-data";
import { enterFlow } from "./door";

export function advanceToAssessment(lead: Lead) {
  const next = startAssessment({
    leadId: lead.id,
    name: lead.name,
    address: lead.address,
    closer: lead.closer,
    property: {
      yearBuilt: lead.yearBuilt ?? "",
      sqft: lead.sqft ?? "",
      stories: lead.stories ?? "",
      hoa: lead.hoa === "Yes" ? "Yes" : lead.hoa ?? "",
      access: lead.access ?? "",
      utility: lead.utility ?? "",
      bothHome: lead.bothHome ? "Yes" : "",
    },
  });
  enterFlow(lead.id, "assessment", next.id);
  return next;
}

export function advanceToOpportunity(lead: Lead, assessmentId: string) {
  const opp = ensureOpportunity(lead);
  completeAssessment(assessmentId, opp.id);
  enterFlow(lead.id, "opportunity", opp.id);
  return opp;
}

export function advanceToJob(proposal: Proposal, lead?: Lead) {
  const sold = proposal.options.find((opt) => opt.id === proposal.accepted);
  const account = accounts.find((a) => a.name === lead?.name);
  const job = openSoldJob({
    leadId: proposal.personId,
    personId: proposal.personId,
    name: lead?.name ?? "Job",
    product: sold?.name || lead?.product || proposal.products[0] || "Sold scope",
    closer: proposal.closer,
    sold: sold ? optionTotal(sold) : 0,
    accountId: account?.id,
  });
  enterFlow(proposal.personId, "job", job.jobId);
  return job;
}

export function advanceToAccount(job: { jobId: string; leadId: string; personId: string; name: string; closer: string; pm: string; sold: number; accountId: string }, lead?: Lead) {
  const flowId = lead?.id || job.leadId || job.personId;
  const account = openAccountForJob({
    leadId: flowId,
    name: lead?.name || job.name,
    city: lead?.city || "",
    owner: job.closer || job.pm,
    amount: job.sold,
    existingId: job.accountId,
  });
  setJobAccount(job.jobId, account.id);
  enterFlow(flowId || account.id, "account", account.id);
  return account;
}
