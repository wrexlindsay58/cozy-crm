import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { JobChapter } from "./flow";
import { SurveyChapter } from "./ready-chapter";
import { JobSticky } from "./stage-bar";
import type { JobFile } from "./store";
import { CHAPTERS, type Chapter } from "./types";
import { sectionDone, sectionDoneAt, sectionStarted } from "./done";
import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { AssessSnap } from "@/features/opportunity/assess-snap";
import { AgreementPanel, signedProposals } from "@/features/opportunity/agreement-panel";
import { OppSnap } from "@/features/opportunity/opp-snap";
import { PayTiles } from "@/features/opportunity/pay-tiles";
import { ProposalPanel } from "@/features/opportunity/proposal-panel";
import { useProposal, useProposals } from "@/features/opportunity/store";
import { FileSections } from "@/features/record-shell/file-sections";
import { opportunities, accounts, type Lead } from "@/lib/crm-data";

const CHAP_LABEL: Record<Chapter, string> = {
  sold: "Acceptance",
  ready: "Materials",
  crew: "Crews",
  prep: "Prep",
  inventory: "Inventory",
  run: "Installation",
  quality: "Quality",
  money: "Money",
  close: "Closeout",
};

export function JobWorkspace({ job, lead }: { job: JobFile; lead?: Lead; focus?: "co" | "invoice" | null }) {
  const opp = opportunities.find((o) => o.leadId === lead?.id) ?? opportunities.find((o) => o.leadId === job.leadId) ?? opportunities.find((o) => o.product === job.product);
  const proposal = useProposal(opp?.id ?? "");
  const signed = signedProposals(lead?.id ?? job.leadId, useProposals());
  const navigate = useNavigate();
  const account = accounts.find((a) => a.id === job.accountId) ?? accounts.find((a) => a.name === (lead?.name ?? job.name));
  function sec(id: string, label: string, node: ReactNode, done = sectionDone(job, id)) {
    return { id, label, done, started: sectionStarted(job, id), doneAt: sectionDoneAt(job, id), node };
  }
  return (
    <FileSections
      start="sold"
      banner={<JobSticky job={job} />}
      advance={{
        pipeline: "Account",
        onContinue: () => {
          if (account) void navigate({ to: "/accounts/$accountId", params: { accountId: account.id } });
        },
      }}
      sections={[
        sec("contact", "Contact", lead ? <LeadCard lead={lead} locked /> : null, true),
        sec("assess", "Assessment", lead ? <AssessSnap leadId={lead.id} /> : null, true),
        ...(proposal
          ? [
              sec("options", "Scope", <OppSnap oppId={proposal.oppId} />, true),
              sec("pay", "Payment", <PayTiles proposal={proposal} />, true),
              sec("proposal", "Proposal", <ProposalPanel proposal={proposal} />, true),
            ]
          : []),
        ...signed.map((row) => sec(`agreement-${row.oppId}`, "Agreement", <AgreementPanel proposal={row} fileOnly />, true)),
        ...CHAPTERS.flatMap((c) => {
          const chap = sec(c, CHAP_LABEL[c], <JobChapter job={job} chap={c} />);
          if (c === "ready") return [sec("survey", "Site survey", <SurveyChapter job={job} lead={lead} />), chap];
          return [chap];
        }),
        sec("book", "Book", lead ? <BookWidget leadId={lead.id} defaultCloser={job.closer} defaultKind="Install" /> : null),
      ]}
    />
  );
}
