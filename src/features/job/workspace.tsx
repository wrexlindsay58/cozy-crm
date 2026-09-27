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
import { useProposals } from "@/features/opportunity/store";
import { advanceToAccount } from "@/features/flow/advance";
import { FileSections } from "@/features/record-shell/file-sections";
import { type Lead } from "@/lib/crm-data";

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
  const proposals = useProposals();
  const person = lead?.id ?? job.leadId;
  const proposal = Object.values(proposals).find((p) => p.personId === person);
  const signed = signedProposals(person, proposals);
  const navigate = useNavigate();
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
          const next = advanceToAccount(job, lead);
          void navigate({ to: "/accounts/$accountId", params: { accountId: next.id } });
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
        sec("book", "Book", <BookWidget leadId={lead?.id || job.leadId || job.personId} defaultCloser={job.closer} defaultKind="Install" pipeline="Job" />),
      ]}
    />
  );
}
