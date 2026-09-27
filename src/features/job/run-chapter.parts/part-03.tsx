import { useState } from "react";
import { addCostHit, removeCostHit, type JobFile } from "../store";
import { FIELD_EXTRAS, type FieldExtra } from "../types";
import { money } from "@/lib/crm-data";
import { Trash2 } from "lucide-react";
import { JobCard } from "../job-card";
import { FILL_IN } from "../fill-row";

export function FieldExtras({ job, locked }: { job: JobFile; locked?: boolean }) {
  const rows = (job.costHits ?? []).filter((h) => h.kind === "field");
  const [reason, setReason] = useState<FieldExtra>(FIELD_EXTRAS[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  return (
    <JobCard kicker="Field extras" title="Does not hit closer commission">
      <p className="text-[12px] text-muted">Step-throughs, material runs, install issues, extra on site, wrong equipment. Sales is not punished for these.</p>
      {rows.length ? (
        <ul className="mt-3 divide-y divide-line">
          {rows.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span>
                {h.reason}
                {h.note ? ` · ${h.note}` : ""}
                <span className="ml-2 text-[11px] text-muted">{h.at}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-semibold tabular-nums">{money(h.amount)}</span>
                <button type="button" aria-label="Remove" className="grid size-8 place-items-center rounded-md text-muted hover:text-alert" onClick={() => removeCostHit(job.jobId, h.id)}>
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,1.2fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          addCostHit(job.jobId, "field", reason, Number(amount) || 0, note);
          setAmount("");
          setNote("");
        }}
      >
        <select disabled={locked} value={reason} onChange={(e) => setReason(e.target.value as FieldExtra)} className={FILL_IN}>
          {FIELD_EXTRAS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="$" className={FILL_IN} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className={FILL_IN} />
        <button type="submit" disabled={locked} className="h-10 rounded-md bg-navy px-3 text-[12px] font-semibold text-card disabled:opacity-40">
          Add
        </button>
      </form>
    </JobCard>
  );
}
