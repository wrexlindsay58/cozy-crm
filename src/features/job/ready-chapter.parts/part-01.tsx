import { useState } from "react";
import { Plus } from "lucide-react";
import { addJobSurvey, patchPermit, type JobFile } from "../store";
import { profileById, useProdProfiles } from "../profiles";
import type { Lead } from "@/lib/crm-data";
import { JobCard } from "../job-card";
import { FillField, FillRow, FILL_IN } from "../fill-row";
import { isAccepted, type JobSurvey, type SurveyKind } from "../types";
import { BookWidget } from "@/features/lead/book-widget";
import { MaterialsCard } from "./part-02";
import { SurveyCardView4 } from "./part-04";

export const HVAC_FIELDS = [
  { key: "size", label: "Size", options: ["2 ton", "2.5 ton", "3 ton", "3.5 ton", "4 ton", "5 ton"] },
  { key: "type", label: "Type", options: ["Split", "Package", "Heat pump", "Gas furnace"] },
  { key: "placement", label: "Placement", options: [] },
  { key: "clearance", label: "Clearance", options: [] },
];

export const KINDS: { id: SurveyKind; label: string }[] = [
  { id: "hvac", label: "HVAC" },
  { id: "ducts", label: "Ducts" },
  { id: "attic", label: "Attic" },
  { id: "windows", label: "Windows" },
  { id: "other", label: "Other" },
];

export function ReadyChapter({ job }: { job: JobFile }) {
  const lines = job.scope.filter((s) => s.kind === "product" || s.kind === "adder");
  const open = !isAccepted(job);
  return (
    <div className="space-y-3">
      {open ? <p className="rounded-md border border-line bg-card px-4 py-3 text-sm">Acceptance is still open. Nothing gets ordered until the office accepts the job.</p> : null}

      {lines.map((s) => (
        <MaterialsCard key={s.id} job={job} line={s} />
      ))}
    </div>
  );
}

export function SurveyChapter({ job, lead }: { job: JobFile; lead?: Lead }) {
  useProdProfiles();
  const products = job.scope.filter((s) => s.kind === "product" || s.kind === "adder");
  const fromSold = products.filter((s) => s.surveyOn || profileById(s.categoryId)?.needsSurvey);
  const extras = job.surveys ?? [];
  return (
    <div className="space-y-3">
      {lead ? <BookWidget leadId={lead.id} defaultCloser={job.pm} defaultKind="Site survey" pipeline="Job" /> : null}
      {job.permit.number || products.some((s) => profileById(s.categoryId)?.needsPermit) ? (
        <JobCard kicker="Permit" title={job.permit.number || "Not pulled"} done={job.permit.result === "Pass"}>
          <FillRow>
            <FillField label="Permit #">
              <input value={job.permit.number} onChange={(e) => patchPermit(job.jobId, { number: e.target.value })} className={FILL_IN} />
            </FillField>
            <FillField label="City">
              <input value={job.permit.city} onChange={(e) => patchPermit(job.jobId, { city: e.target.value })} className={FILL_IN} />
            </FillField>
            <FillField label="Inspection">
              <select value={job.permit.result} onChange={(e) => patchPermit(job.jobId, { result: e.target.value as typeof job.permit.result })} className={FILL_IN}>
                {["None", "Scheduled", "Pass", "Fail"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </FillField>
          </FillRow>
        </JobCard>
      ) : null}
      <div className="flex items-center justify-end">
        <button type="button" aria-label="Add survey" className="grid size-8 place-items-center rounded-md bg-navy text-card hover:opacity-90" onClick={() => addJobSurvey(job.jobId)}>
          <Plus className="size-4" />
        </button>
      </div>

      {fromSold.map((s) => (
        <SurveyCard
          key={s.id}
          job={job}
          id={s.id}
          label={s.label}
          kind={(profileById(s.categoryId)?.id as SurveyKind) || kindOf(s.categoryId)}
          done={Boolean(s.surveyDone || s.surveySkip)}
          skip={s.surveySkip}
          facts={s.surveyFacts ?? {}}
          rooms={s.surveyRooms ?? []}
          media={s.media}
          plan={Boolean(profileById(s.categoryId)?.needsPlan)}
          planFile={s.plan?.file?.name ?? s.media.find((m) => m.cat === "Design")?.name}
        />
      ))}
      {extras.map((s) => (
        <SurveyCard
          key={s.id}
          job={job}
          id={s.id}
          label={s.label}
          kind={s.kind}
          done={Boolean(s.surveyDone)}
          facts={s.surveyFacts ?? {}}
          rooms={s.surveyRooms ?? []}
          media={s.media}
          extra
        />
      ))}
    </div>
  );
}

function kindOf(id: string): SurveyKind {
  if (id === "hvac" || id === "ducts" || id === "attic" || id === "windows") return id;
  return "other";
}

function SurveyCard({
  job,
  id,
  label,
  kind,
  done,
  skip,
  facts,
  rooms,
  media,
  plan,
  planFile,
  extra,
}: {
  job: JobFile;
  id: string;
  label: string;
  kind: SurveyKind;
  done: boolean;
  skip?: string;
  facts: Record<string, string>;
  rooms: JobSurvey["surveyRooms"];
  media: JobSurvey["media"];
  plan?: boolean;
  planFile?: string;
  extra?: boolean;
}) {
  const [why, setWhy] = useState("");
  const [skipOpen, setSkipOpen] = useState(false);
  const hvac = kind === "hvac";
  const ducts = kind === "ducts";
  return (
    <SurveyCardView4 bag={{ skip, label, done, extra, kind, job, id, hvac, facts, ducts, rooms, media, plan, planFile, skipOpen, why, setWhy, setSkipOpen }} />
  );
}
