import { useState } from "react";
import { flagLine, resolveDiscrepancy, reviewLine, signCo, type JobFile } from "../store";
import { money } from "@/lib/crm-data";
import { isAccepted, type ScopeLine } from "../types";
import { cn } from "@/lib/cn";

export function DealLine({ job, line }: { job: JobFile; line: Pick<ScopeLine, "id" | "label" | "kind" | "amount" | "qty" | "notes"> }) {
  const file = job.acceptance;
  const locked = isAccepted(job);
  const reviewed = file?.reviewed.includes(line.id);
  const disc = file?.discrepancies.find((d) => d.lineId === line.id);
  const [open, setOpen] = useState(false);
  const [what, setWhat] = useState("");
  const [how, setHow] = useState<"clarified" | "as-is" | "co">("clarified");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const co = job.changeOrders.find((c) => c.id === disc?.coId);
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{line.label}</p>
          <p className="type-meta mt-0.5">{line.qty ? `Qty ${line.qty}` : "No quantity"}{line.notes ? ` · ${line.notes}` : ""}</p>
          {line.kind === "promise" && !line.amount ? <p className="mt-1 text-sm font-semibold text-alert">Unpriced promise. This hits commission.</p> : null}
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums">{line.amount ? money(line.amount) : "—"}</p>
      </div>
      {reviewed && !disc ? <p className="type-meta mt-2">Reviewed</p> : null}
      {disc ? (
        <div className="mt-2 rounded-md border border-line px-3 py-2">
          <p className="text-sm">{disc.what}</p>
          {disc.how === "open" && !locked ? (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {(["clarified", "as-is", "co"] as const).map((id) => (
                  <button key={id} type="button" onClick={() => setHow(id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", how === id ? "bg-navy text-card" : "border border-line")}>
                    {id === "clarified" ? "Rep clarified" : id === "as-is" ? "Keep it" : "Change order"}
                  </button>
                ))}
              </div>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={how === "co" ? "What changes" : how === "as-is" ? "Why we are keeping it" : "What the rep said"} className="h-10 w-full rounded-md border border-line px-3 text-sm" />
              {how === "co" ? <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Amount" className="h-10 w-32 rounded-md border border-line px-3 text-sm" /> : null}
              <button type="button" onClick={() => resolveDiscrepancy(job.jobId, disc.id, how, note, Number(amount) || 0)} className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">Save</button>
            </div>
          ) : (
            <p className="type-meta mt-1">
              {disc.how === "clarified" ? "Clarified" : disc.how === "as-is" ? "Kept" : co?.signed ? "Change order signed" : "Change order waiting on a signature"}
              {disc.note ? ` · ${disc.note}` : ""}
            </p>
          )}
          {disc.how === "co" && co && !co.signed && !locked ? (
            <button type="button" onClick={() => signCo(job.jobId, co.id)} className="mt-2 h-9 rounded-md border border-line px-3 text-sm font-semibold">Customer signed</button>
          ) : null}
        </div>
      ) : null}
      {!locked && !reviewed && !disc ? (
        open ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="What is wrong" className="h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm" />
            <button type="button" onClick={() => { flagLine(job.jobId, line.id, what); setOpen(false); }} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">Add</button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => reviewLine(job.jobId, line.id)} className="h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold">Looks right</button>
            <button type="button" onClick={() => setOpen(true)} className="h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold">Something's off</button>
          </div>
        )
      ) : null}
    </li>
  );
}
