import { assessmentForLead } from "@/features/assessment/store";
import { accounts, opportunities, projects } from "@/lib/crm-data";

export function pipelineOf(leadId: string | undefined, name: string) {
  const account = accounts.find((a) => a.name === name);
  const job = account ? projects.find((p) => p.accountId === account.id && p.status !== "Closed") : undefined;
  const opp = leadId ? opportunities.find((o) => o.leadId === leadId) : undefined;
  const assess = leadId ? assessmentForLead(leadId) : undefined;
  if (job) return { label: "Job", href: `/projects/${job.id}` };
  if (account) return { label: "Account", href: `/accounts/${account.id}` };
  if (opp && /^Won/.test(opp.stage)) return { label: "Opportunity", href: `/opportunities/${opp.id}` };
  if (assess) return { label: "Assessment", href: `/assessments/${assess.id}` };
  if (opp) return { label: "Opportunity", href: `/opportunities/${opp.id}` };
  if (leadId) return { label: "Lead", href: `/leads/${leadId}` };
  return { label: "Contact", href: "#" };
}
