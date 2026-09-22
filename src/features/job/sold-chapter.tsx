import { useState } from "react";
import { Pencil } from "lucide-react";
import { addScopeMedia, patchScope, setSoldNotes, togglePromise, type JobFile } from "./store";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { MediaStrip } from "./media-strip";
import { catFromTag } from "./types";

const KIND = { product: "Product", adder: "Adder", discount: "Discount", promise: "Promise" } as const;

export function SoldChapter({ job }: { job: JobFile }) {
  const [edit, setEdit] = useState(false);
  const [noteEdit, setNoteEdit] = useState(false);
  const total = job.scope.reduce((s, r) => s + r.amount, 0);
  const counts = `${job.scope.filter((s) => s.kind === "product").length} products · ${job.scope.filter((s) => s.kind === "adder").length} adders · ${job.scope.filter((s) => s.kind === "discount").length} discounts · ${job.scope.filter((s) => s.kind === "promise").length} promises`;
  const products = job.scope.filter((s) => s.kind === "product");

  return (
    <div className="space-y-3">
      <JobCard
        kicker="Job notes"
        title={job.soldNotes ? undefined : "Nothing on the file yet"}
        actions={
          <button type="button" aria-label="Edit notes" onClick={() => setNoteEdit((v) => !v)} className={cn("grid size-8 place-items-center rounded-md", noteEdit ? "bg-navy text-card" : "text-muted hover:bg-page hover:text-navy")}>
            <Pencil className="size-4" />
          </button>
        }
      >
        {noteEdit ? (
          <textarea value={job.soldNotes} onChange={(e) => setSoldNotes(job.jobId, e.target.value)} rows={3} className="w-full rounded-md border border-line px-3 py-2 text-sm" />
        ) : (
          <p className="text-sm leading-relaxed">{job.soldNotes || "No job notes."}</p>
        )}
      </JobCard>

      <JobCard
        kicker="Sold"
        title={counts}
        done={job.scope.some((s) => s.kind === "product")}
        aside={<span className="text-lg font-extrabold tabular-nums tracking-tight text-navy md:text-xl">{money(total)}</span>}
        actions={
          <button type="button" aria-label="Edit scope" onClick={() => setEdit((v) => !v)} className={cn("grid size-8 place-items-center rounded-md", edit ? "bg-navy text-card" : "text-muted hover:bg-page hover:text-navy")}>
            <Pencil className="size-4" />
          </button>
        }
      >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] font-bold tracking-wide text-muted uppercase">
              <th className="pb-2 font-bold">Line</th>
              <th className="pb-2 font-bold">Kind</th>
              <th className="pb-2 font-bold">Qty / hours</th>
              <th className="pb-2 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {job.scope.map((s) => (
              <tr key={s.id} className="border-t border-line align-top">
                <td className="py-3 pr-3">
                  <p className="font-semibold">{s.label}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{s.notes || "—"}</p>
                  {s.kind === "promise" ? (
                    <button type="button" onClick={() => togglePromise(job.jobId, s.id)} className={cn("mt-2 h-8 rounded-md px-3 text-[12px] font-semibold", s.promiseDone ? "bg-navy text-card" : "border border-line")}>
                      {s.promiseDone ? "Done" : "Mark done"}
                    </button>
                  ) : null}
                  {edit && s.kind !== "promise" ? (
                    <textarea value={s.notes} onChange={(e) => patchScope(job.jobId, s.id, { notes: e.target.value })} rows={2} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
                  ) : null}
                </td>
                <td className="py-3 pr-3 text-[12px] text-muted">{KIND[s.kind]}</td>
                <td className="py-3 pr-3 text-[12px] text-muted">
                  {s.kind === "promise" ? (s.owner ? `Office · ${s.owner}` : "Office") : edit ? (
                    <input value={s.qty || ""} inputMode="numeric" onChange={(e) => patchScope(job.jobId, s.id, { qty: Number(e.target.value) || 0 })} className="h-9 w-16 rounded-md border border-line px-2 text-sm" />
                  ) : (
                    `${s.qty}${s.estHours ? ` · ${s.estHours}h` : ""}`
                  )}
                </td>
                <td className="py-3 text-right tabular-nums">{s.amount ? money(s.amount) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.map((s) => (
        <div key={s.id} className="mt-4 w-full min-w-0">
          <MediaStrip
            files={s.media}
            label={`${s.label} photos`}
            onAdd={(f, meta) => addScopeMedia(job.jobId, s.id, f, catFromTag(meta.tag), { caption: meta.caption, purpose: meta.tag, name: meta.name })}
          />
        </div>
      ))}
    </JobCard>
    </div>
  );
}
