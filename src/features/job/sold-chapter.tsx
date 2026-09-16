import { useState } from "react";
import { Pencil } from "lucide-react";
import { addScopeMedia, patchScope, setSoldNotes, togglePromise, type JobFile } from "./store";
import { MEDIA_CATS, type MediaCat } from "./types";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

const KIND = { product: "Product", adder: "Adder", promise: "Promise" } as const;

export function SoldChapter({ job }: { job: JobFile }) {
  const [edit, setEdit] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const total = job.scope.reduce((s, r) => s + r.amount, 0);

  return (
    <section className="rounded-md border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">What we sold</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">{job.soldNotes || "No job notes."}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-extrabold tabular-nums">{money(total)}</p>
          <button type="button" aria-label="Edit scope" onClick={() => setEdit((v) => !v)} className="grid size-9 place-items-center rounded-md border border-line">
            <Pencil className="size-4" />
          </button>
        </div>
      </div>
      {edit ? (
        <textarea value={job.soldNotes} onChange={(e) => setSoldNotes(job.jobId, e.target.value)} rows={2} className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm" />
      ) : null}
      <ul className="mt-4 divide-y divide-line">
        {job.scope.map((s) => (
          <li key={s.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {s.label}
                  <span className="ml-2 text-[11px] font-bold tracking-wide text-muted uppercase">{KIND[s.kind]}</span>
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {s.kind === "promise" ? (s.owner ? `Office · ${s.owner}` : "Office") : `Qty ${s.qty}${s.estHours ? ` · ${s.estHours}h est` : ""}`}
                </p>
              </div>
              {s.amount ? <span className="text-[12px] tabular-nums text-muted">{money(s.amount)}</span> : null}
            </div>
            <p className="mt-2 text-sm">{s.notes || "—"}</p>
            {s.kind === "promise" ? (
              <button type="button" onClick={() => togglePromise(job.jobId, s.id)} className={cn("mt-2 h-8 rounded-md px-3 text-[12px] font-semibold", s.promiseDone ? "bg-navy text-card" : "border border-line")}>
                {s.promiseDone ? "Done" : "Mark done"}
              </button>
            ) : null}
            {edit && s.kind !== "promise" ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input value={s.qty || ""} inputMode="numeric" onChange={(e) => patchScope(job.jobId, s.id, { qty: Number(e.target.value) || 0 })} className="h-10 rounded-md border border-line px-3 text-sm" />
                <textarea value={s.notes} onChange={(e) => patchScope(job.jobId, s.id, { notes: e.target.value })} rows={2} className="rounded-md border border-line px-3 py-2 text-sm sm:col-span-2" />
              </div>
            ) : null}
            {s.kind === "product" ? (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1.5">
                  {s.media.map((m) => (
                    <button key={m.id} type="button" onClick={() => setOpen(m.id)} className="relative h-12 w-12 overflow-hidden rounded-md border border-line">
                      {m.kind === "photo" ? <img src={m.url} alt="" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-[9px] font-bold">{m.cat.slice(0, 3)}</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {MEDIA_CATS.map((cat) => (
                    <label key={cat} className="inline-flex h-7 cursor-pointer items-center rounded-md border border-line px-2 text-[11px] font-semibold">
                      + {cat}
                      <input
                        type="file"
                        accept="image/*,video/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) addScopeMedia(job.jobId, s.id, f, cat as MediaCat);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {open ? (
        <button type="button" className="fixed inset-0 z-50 grid place-items-center bg-navy/70 p-6" onClick={() => setOpen(null)}>
          <img src={job.scope.flatMap((s) => s.media).find((m) => m.id === open)?.url} alt="" className="max-h-[90vh] max-w-full rounded-md" />
        </button>
      ) : null}
    </section>
  );
}
