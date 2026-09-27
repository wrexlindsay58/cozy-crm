import { Trash2 } from "lucide-react";
import { addSurveyMedia, patchJobSurvey, patchSurveyFact, removeJobSurvey, setSurveyDone } from "../store";
import { cn } from "@/lib/cn";
import { JobCard } from "../job-card";
import { FillField, FillRow, FILL_IN } from "../fill-row";
import { MediaStrip } from "../media-strip";
import { catFromTag, type SurveyKind } from "../types";
import { HVAC_FIELDS, KINDS } from "./part-01";
import { SurveyCardView, SurveyCardView2, SurveyCardView3 } from "./part-03";

export function SurveyCardView4(props: { bag: { skip: any; label: any; done: any; extra: any; kind: any; job: any; id: any; hvac: any; facts: any; ducts: any; rooms: any; media: any; plan: any; planFile: any; skipOpen: any; why: any; setWhy: any; setSkipOpen: any } }) {
  const { skip, label, done, extra, kind, job, id, hvac, facts, ducts, rooms, media, plan, planFile, skipOpen, why, setWhy, setSkipOpen } = props.bag;
  return (
    <JobCard
      kicker="Site survey"
      title={skip ? `${label} · Skipped` : label}
      done={done}
      actions={
        <div className="flex items-center gap-2">
          {extra ? (
            <select
              value={kind}
              aria-label="Survey type"
              onChange={(e) => {
                const next = e.target.value as SurveyKind;
                const nextLabel = KINDS.find((k) => k.id === next)?.label ?? "Site survey";
                patchJobSurvey(job.jobId, id, { kind: next, label: nextLabel });
              }}
              className="h-8 rounded-md border border-line px-2 text-[12px] font-semibold"
            >
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          ) : null}
          {!skip ? (
            <button type="button" onClick={() => setSurveyDone(job.jobId, id, !done)} className={cn("h-8 rounded-md px-3 text-[12px] font-semibold", done ? "bg-navy text-card" : "border border-line")}>
              {done ? "Done" : "Mark done"}
            </button>
          ) : null}
          {extra ? (
            <button type="button" aria-label="Delete survey" className="grid size-8 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeJobSurvey(job.jobId, id)}>
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      }
    >
      {skip ? <p className="mb-3 text-sm text-muted">Skipped · {skip}</p> : null}
      {hvac ? (
        <FillRow>
          {HVAC_FIELDS.map((f) => (
            <FillField key={f.key} label={f.label}>
              {f.options.length ? (
                <select value={facts[f.key] ?? ""} onChange={(e) => patchSurveyFact(job.jobId, id, f.key, e.target.value)} className={FILL_IN}>
                  <option value="">Select</option>
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input value={facts[f.key] ?? ""} onChange={(e) => patchSurveyFact(job.jobId, id, f.key, e.target.value)} placeholder={f.key === "placement" ? "Pad, closet, attic" : "Sides and overhead"} className={FILL_IN} />
              )}
            </FillField>
          ))}
        </FillRow>
      ) : null}

      {ducts ? (
        <SurveyCardView bag={{ rooms, job, id }} />
      ) : null}

      {!hvac && !ducts ? (
        <FillField label="Notes">
          <input value={facts.notes ?? ""} onChange={(e) => patchSurveyFact(job.jobId, id, "notes", e.target.value)} className={FILL_IN} />
        </FillField>
      ) : null}

      <MediaStrip files={media} onAdd={(f, meta) => addSurveyMedia(job.jobId, id, f, { caption: meta.caption, purpose: meta.tag, name: meta.name, cat: catFromTag(meta.tag) })} label="Survey photos and video" />

      {plan ? (
        <SurveyCardView3 bag={{ job, id, planFile }} />
      ) : null}

      {!extra && !skip ? (
        skipOpen ? (
          <SurveyCardView2 bag={{ job, id, why, setWhy, setSkipOpen }} />
        ) : (
          <button type="button" className="mt-3 text-[12px] font-semibold text-muted hover:text-navy" onClick={() => setSkipOpen(true)}>
            Skip this survey
          </button>
        )
      ) : null}
    </JobCard>
  );
}
