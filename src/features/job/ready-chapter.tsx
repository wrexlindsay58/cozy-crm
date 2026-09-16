import { useState } from "react";
import { orderBom, patchBom, patchPermit, setPlan, signPre, togglePre, type JobFile } from "./store";
import { profileById } from "./profiles";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import type { PlanStatus } from "./types";

const PLANS: PlanStatus[] = ["Draft", "Sent", "Approved", "Released"];

export function ReadyChapter({ job }: { job: JobFile }) {
  const [who, setWho] = useState("");
  const products = job.scope.filter((s) => s.kind === "product");
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Pre-install</h2>
        <ul>
          {job.preCheck.items.map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => togglePre(job.jobId, i.id)} className="flex h-10 w-full items-center gap-2 text-left text-sm">
                <span className={cn("grid size-5 place-items-center rounded-sm border", i.on ? "border-navy bg-navy text-card" : "border-line")}>{i.on ? "✓" : ""}</span>
                {i.label}
              </button>
            </li>
          ))}
        </ul>
        {job.preCheck.signedAt ? (
          <p className="mt-2 text-sm font-semibold text-up">
            Signed {job.preCheck.signedBy} · {job.preCheck.signedAt}
          </p>
        ) : (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              signPre(job.jobId, who);
            }}
          >
            <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Homeowner" className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
            <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
              Sign
            </button>
          </form>
        )}
      </section>

      {products.map((s) => {
        const p = profileById(s.categoryId);
        if (!p) return null;
        const showPlan = p.needsPlan;
        const showPermit = p.needsPermit;
        const showBom = s.bom.length > 0;
        if (!showPlan && !showPermit && !showBom) return null;
        return (
          <section key={s.id} className="rounded-md border border-line bg-card p-5">
            <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">{s.label}</h2>
            <p className="mt-0.5 text-[12px] text-muted">{p.supplier || "No supplier"}</p>
            {showPlan ? (
              <div className="mt-3">
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{p.planCustomerApproval ? "Design" : "Layout"}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {PLANS.map((st) => (
                    <button key={st} type="button" onClick={() => setPlan(job.jobId, s.id, st)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", (s.plan?.status ?? "Draft") === st ? "bg-navy text-card" : "border border-line")}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {showPermit ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <input value={job.permit.number} onChange={(e) => patchPermit(job.jobId, { number: e.target.value })} placeholder="Permit #" className="h-10 rounded-md border border-line px-3 text-sm" />
                <input value={job.permit.city} onChange={(e) => patchPermit(job.jobId, { city: e.target.value })} placeholder="City" className="h-10 rounded-md border border-line px-3 text-sm" />
                <select value={job.permit.result} onChange={(e) => patchPermit(job.jobId, { result: e.target.value as typeof job.permit.result })} className="h-10 rounded-md border border-line px-2 text-sm">
                  {["None", "Scheduled", "Pass", "Fail"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            ) : null}
            {showBom ? (
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Materials · {p.supplier}</p>
                  <button type="button" className="h-8 rounded-md bg-navy px-3 text-[12px] font-semibold text-card" onClick={() => orderBom(job.jobId, s.id)}>
                    Order
                  </button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] font-bold tracking-wide text-muted uppercase">
                    <tr>
                      <th className="pb-1 font-bold">Part</th>
                      <th className="pb-1 font-bold">Est</th>
                      <th className="pb-1 font-bold">Used</th>
                      <th className="pb-1 font-bold">$</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.bom.map((b) => (
                      <tr key={b.id} className="border-t border-line">
                        <td className="py-2">{b.name}</td>
                        <td className="py-2 tabular-nums">{b.estQty}</td>
                        <td className="py-2">
                          <input value={b.usedQty || ""} inputMode="numeric" onChange={(e) => patchBom(job.jobId, s.id, b.id, { usedQty: Number(e.target.value) || 0 })} className="h-8 w-16 rounded-md border border-line px-2 text-sm" />
                        </td>
                        <td className="py-2 tabular-nums text-muted">{money((b.usedQty || b.estQty) * b.unitCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
