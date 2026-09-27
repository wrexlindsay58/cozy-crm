import { Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { crewOf, membersOf, PAY_KINDS, SHOP_CREWS, useStaff } from "@/features/staff/store";
import { addLaborer, crewsOnJob, patchLabor, removeLabor, tally } from "../store";
import type { JobFile } from "../store";
import { PROCESSES } from "../types";
import type { LaborKind } from "../types";
import { JobCard } from "../job-card";
import { FillField, FILL_IN } from "../fill-row";

export function LaborCard({ job }: { job: JobFile }) {
  useStaff();
  const t = tally(job);
  const rows = job.laborLines ?? [];
  const crews = [...new Set([...crewsOnJob(job), ...SHOP_CREWS.map((c) => c.name)])];
  const services = [...new Set([...PROCESSES, ...job.scope.filter((s) => s.kind === "product").map((s) => s.label)])];

  return (
    <JobCard
      kicker="Labor"
      title={`${rows.length || "No"} posted · ${money(t.labor)}`}
      actions={
        <button type="button" aria-label="Add laborer" className="grid size-8 place-items-center rounded-md bg-navy text-card" onClick={() => addLaborer(job.jobId)}>
          <Plus className="size-4" />
        </button>
      }
    >
      {rows.length ? (
        <ul className="divide-y divide-line">
          {rows.map((l) => {
            const amt = l.actual ?? (l.kind === "Piece" ? l.rate : Math.round(l.qty * l.rate));
            const crew = l.crew || crewOf(l.who) || crews[0];
            const techs = membersOf(crew);
            const whoOpts = techs.includes(l.who) ? techs : [...techs, l.who];
            return (
              <li key={l.id} className="flex min-w-0 items-end gap-2 py-2">
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  <FillField label="Who">
                    <select
                      value={crew}
                      onChange={(e) => patchLabor(job.jobId, l.id, { crew: e.target.value })}
                      className={FILL_IN}
                    >
                      {crews.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </FillField>
                  <FillField label="Tech">
                    <select value={l.who} onChange={(e) => patchLabor(job.jobId, l.id, { who: e.target.value, crew })} className={FILL_IN}>
                      {whoOpts.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </FillField>
                  <FillField label="Type">
                    <select value={l.kind} onChange={(e) => patchLabor(job.jobId, l.id, { kind: e.target.value as LaborKind })} className={FILL_IN}>
                      {PAY_KINDS.map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  </FillField>
                  {l.kind === "Piece" ? (
                    <FillField label="Service">
                      <select value={l.service ?? ""} onChange={(e) => patchLabor(job.jobId, l.id, { service: e.target.value })} className={FILL_IN}>
                        {services.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </FillField>
                  ) : (
                    <FillField label={l.kind === "Hourly" ? "Hours" : "Days"}>
                      <input value={l.qty || ""} inputMode="decimal" onChange={(e) => patchLabor(job.jobId, l.id, { qty: Number(e.target.value) || 0 })} className={FILL_IN} />
                    </FillField>
                  )}
                  <FillField label="Rate">
                    <input value={l.rate || ""} inputMode="decimal" onChange={(e) => patchLabor(job.jobId, l.id, { rate: Number(e.target.value) || 0 })} className={FILL_IN} />
                  </FillField>
                  <FillField label="Actual">
                    <input value={l.actual ?? amt} inputMode="decimal" onChange={(e) => patchLabor(job.jobId, l.id, { actual: Number(e.target.value) || 0 })} className={FILL_IN} />
                  </FillField>
                </div>
                <button type="button" aria-label="Remove" className="mb-0 grid size-10 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeLabor(job.jobId, l.id)}>
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted">Crew on the job shows here with their rate. Plus adds another tech.</p>
      )}
    </JobCard>
  );
}
