import { Check } from "lucide-react";
import { addScopeMedia, patchQcCheck, patchQcFact, type JobFile } from "../store";
import { catFromTag, type ScopeLine } from "../types";
import { cn } from "@/lib/cn";
import { JobCard } from "../job-card";
import { FillField, FillRow, FILL_IN } from "../fill-row";
import { MediaStrip } from "../media-strip";
import { QC, catOf, QcToggle, QcMark, QcFollowUp } from "./part-01";

export function QcCard({ job, line }: { job: JobFile; line: ScopeLine }) {
  const pack = QC[catOf(line)];
  if (!pack) return null;
  const facts = job.testOut.facts ?? {};
  const checks = job.testOut.checks ?? {};
  const result = job.testOut.results?.[line.id];
  return (
    <JobCard kicker="Quality" title={`${pack.title} · ${line.label}`} aside={<QcMark job={job} id={line.id} />} actions={<QcToggle job={job} id={line.id} />} done={result === "pass" || (result === "fail" && Boolean(job.testOut.fixes?.[line.id]?.correctedByQc))}>
      <FillRow min="7rem">
        {pack.fields.map((f) => (
          <FillField key={f.key} label={f.label}>
            <input value={facts[`${line.id}:${f.key}`] ?? ""} onChange={(e) => patchQcFact(job.jobId, `${line.id}:${f.key}`, e.target.value)} className={FILL_IN} />
          </FillField>
        ))}
      </FillRow>
      <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {pack.checks.map((c) => {
          const key = `${line.id}:${c}`;
          return (
            <li key={c}>
              <button type="button" onClick={() => patchQcCheck(job.jobId, key, !checks[key])} className="flex h-10 w-full items-center gap-2 text-left text-sm">
                <span className={cn("grid size-5 place-items-center rounded-sm border", checks[key] ? "border-navy bg-navy text-card" : "border-line")}>{checks[key] ? <Check className="size-3.5" strokeWidth={2.5} /> : null}</span>
                {c}
              </button>
            </li>
          );
        })}
      </ul>
      <MediaStrip
        files={line.media}
        onAdd={(f, meta) => addScopeMedia(job.jobId, line.id, f, catFromTag(meta.tag), { caption: meta.caption, purpose: meta.tag, name: meta.name })}
        label="QC photos and video"
      />
      <QcFollowUp job={job} id={line.id} />
    </JobCard>
  );
}
