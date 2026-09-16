import { useState } from "react";
import { Pencil } from "lucide-react";
import { addScopeMedia, patchScope, setSoldNotes, type JobFile } from "./store";
import { MEDIA_CATS, type MediaCat } from "./types";
import { money } from "@/lib/crm-data";

export function ScopeCard({ job }: { job: JobFile }) {
  const [edit, setEdit] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const total = job.scope.reduce((s, r) => s + r.amount, 0);
  const shot = job.scope.flatMap((s) => s.media).find((m) => m.id === open);

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Sold scope</h2>
          <p className="mt-1 text-sm text-muted">{job.soldNotes || "No job notes."}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-extrabold tabular-nums">{money(total)}</p>
          <button type="button" aria-label="Edit scope" onClick={() => setEdit((v) => !v)} className="grid size-9 place-items-center rounded-md border border-line">
            <Pencil className="size-4" />
          </button>
        </div>
      </div>
      {edit ? (
        <textarea value={job.soldNotes} onChange={(e) => setSoldNotes(job.jobId, e.target.value)} rows={2} className="mb-3 w-full rounded-md border border-line px-3 py-2 text-sm" placeholder="What was sold. Access. Anything the crew has to know." />
      ) : null}
      <ul className="space-y-3">
        {job.scope.map((s) => (
          <li key={s.id} className="rounded-md border border-line p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  Qty {s.qty}
                  {s.asBuiltQty != null && s.asBuiltQty !== s.qty ? ` · as-built ${s.asBuiltQty}` : ""}
                  {s.estHours ? ` · ${s.estHours}h est` : ""}
                </p>
              </div>
              <span className="text-[12px] tabular-nums text-muted">{money(s.amount)}</span>
            </div>
            <p className="mt-2 text-sm">{s.notes || "—"}</p>
            {edit ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                  Qty
                  <input value={s.qty || ""} inputMode="numeric" onChange={(e) => patchScope(job.jobId, s.id, { qty: Number(e.target.value) || 0 })} className="mt-1 h-10 w-full rounded-md border border-line px-3 text-sm font-semibold normal-case tracking-normal" />
                </label>
                <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                  As-built
                  <input value={s.asBuiltQty ?? ""} inputMode="numeric" onChange={(e) => patchScope(job.jobId, s.id, { asBuiltQty: Number(e.target.value) || 0 })} className="mt-1 h-10 w-full rounded-md border border-line px-3 text-sm font-semibold normal-case tracking-normal" />
                </label>
                <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                  Est hours
                  <input value={s.estHours || ""} inputMode="numeric" onChange={(e) => patchScope(job.jobId, s.id, { estHours: Number(e.target.value) || 0 })} className="mt-1 h-10 w-full rounded-md border border-line px-3 text-sm font-semibold normal-case tracking-normal" />
                </label>
                <label className="sm:col-span-3 text-[11px] font-bold tracking-wide text-muted uppercase">
                  Notes
                  <textarea value={s.notes} onChange={(e) => patchScope(job.jobId, s.id, { notes: e.target.value })} rows={2} className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm font-normal normal-case tracking-normal" />
                </label>
              </div>
            ) : null}
            <div className="mt-3">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Media</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {s.media.map((m) => (
                  <button key={m.id} type="button" onClick={() => setOpen(m.id)} className="relative h-14 w-14 overflow-hidden rounded-md border border-line">
                    {m.kind === "photo" ? <img src={m.url} alt={m.name} className="size-full object-cover" /> : <span className="grid size-full place-items-center text-[10px] font-bold">{m.cat.slice(0, 3)}</span>}
                    <span className="absolute bottom-0 inset-x-0 bg-navy/80 px-0.5 text-[9px] font-bold text-card">{m.cat}</span>
                  </button>
                ))}
              </div>
              {MEDIA_CATS.map((cat) => (
                <label key={cat} className="mt-1 mr-2 inline-flex h-8 cursor-pointer items-center rounded-md border border-line px-2 text-[11px] font-semibold">
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
          </li>
        ))}
      </ul>
      {shot ? (
        <button type="button" className="fixed inset-0 z-50 grid place-items-center bg-navy/70 p-6" onClick={() => setOpen(null)}>
          {shot.kind === "photo" ? <img src={shot.url} alt={shot.name} className="max-h-[90vh] max-w-full rounded-md" /> : <p className="rounded-md bg-card px-4 py-3 text-sm">{shot.name}</p>}
        </button>
      ) : null}
    </section>
  );
}
