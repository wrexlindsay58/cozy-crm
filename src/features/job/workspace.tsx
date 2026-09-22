import type { ReactNode } from "react";
import { JobChapter } from "./flow";
import { SurveyChapter } from "./ready-chapter";
import { JobSticky } from "./stage-bar";
import type { JobFile } from "./store";
import { CHAPTERS, type Chapter } from "./types";
import { sectionDone, sectionDoneAt, sectionStarted } from "./done";
import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { AssessSnap } from "@/features/opportunity/assess-snap";
import { OppSnap } from "@/features/opportunity/opp-snap";
import { FileSections } from "@/features/record-shell/file-sections";
import { opportunities } from "@/lib/crm-data";
import type { Lead } from "@/lib/crm-data";

const CHAP_LABEL: Record<Chapter, string> = {
  sold: "Sold",
  ready: "Materials",
  crew: "Crews",
  run: "Production",
  money: "Money",
  close: "Closeout",
};

export function JobWorkspace({ job, lead }: { job: JobFile; lead?: Lead; focus?: "co" | "invoice" | null }) {
  const opp = opportunities.find((o) => o.leadId === lead?.id) ?? opportunities.find((o) => o.product === job.product);
  function sec(id: string, label: string, node: ReactNode) {
    return { id, label, done: sectionDone(job, id), started: sectionStarted(job, id), doneAt: sectionDoneAt(job, id), node };
  }
  return (
    <FileSections
      start="sold"
      banner={<JobSticky job={job} />}
      sections={[
        sec("contact", "Contact", lead ? <LeadCard lead={lead} locked /> : null),
        sec("assess", "Assessment", lead ? <AssessSnap leadId={lead.id} /> : null),
        sec("opp", "Opportunity", opp ? <OppSnap oppId={opp.id} /> : null),
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