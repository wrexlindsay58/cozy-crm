import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { signInventory, toggleInventory, type JobFile } from "./store";
import { isAccepted, type CrewAssign } from "./types";
import { prepClear } from "./prep";
import { actingName } from "@/features/staff/store";
import { SignPad } from "@/features/opportunity/sign-pad";
import { JobCard } from "./job-card";
import { cn } from "@/lib/cn";

export function inventoryLines(job: JobFile, assign: CrewAssign) {
  return assign.scopes.flatMap((id) => {
    const scope = job.scope.find((s) => s.id === id);
    if (!scope || scope.kind === "promise") return [];
    if (scope.bom.length) return scope.bom.map((b) => ({ id: b.id, name: b.name, qty: `${b.estQty} ${b.unit}` }));
    return [{ id: `scope-${scope.id}`, name: scope.label, qty: scope.qty ? String(scope.qty) : "" }];
  });
}

function labelDay(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "No date";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function InventoryChapter({ job }: { job: JobFile }) {
  const house = job.assignments.filter((a) => a.kind === "internal");
  const subs = job.assignments.filter((a) => a.kind === "sub");
  const open = !isAccepted(job);
  return (
    <div className="space-y-2">
      {open ? <p className="rounded-md border border-line bg-card px-4 py-3 text-sm">Acceptance is still open. The truck does not get loaded until the office accepts the job.</p> : null}
      {house.length === 0 ? <JobCard kicker="Inventory" title="No in-house crew on this job" /> : null}
      {house.map((assign) => (
        <LoadCard key={assign.id} job={job} assign={assign} locked={open} />
      ))}
      {subs.length ? (
        <JobCard kicker="Subs" title="No crew-lead sign-off">
          <p className="text-sm">A sub does not sign the load. The project manager confirms their material is on site in Prep.</p>
        </JobCard>
      ) : null}
    </div>
  );
}

function LoadCard({ job, assign, locked }: { job: JobFile; assign: CrewAssign; locked: boolean }) {
  const lines = inventoryLines(job, assign);
  const checked = new Set(assign.inventory?.checked ?? []);
  const signed = Boolean(assign.inventory?.signedAt);
  const clear = prepClear(job, assign.day);
  const ready = clear && lines.length > 0 && lines.every((line) => checked.has(line.id));
  const [open, setOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const who = assign.kind === "sub" ? assign.company || assign.crew : assign.crew;
  return (
    <JobCard kicker="Inventory" title={`${who} · ${labelDay(assign.day)}`} done={signed} aside={signed ? assign.inventory?.signedBy : clear ? "Prep clear" : "Prep open"}>
      {!clear ? <p className="mb-2 text-sm text-alert">Prep for this day is still open. The load stays locked.</p> : null}
      {lines.length === 0 ? <p className="text-sm text-muted">No materials on this install yet.</p> : (
        <ul className="divide-y divide-line">
          {lines.map((line) => {
            const on = checked.has(line.id);
            return (
              <li key={line.id}>
                <button type="button" disabled={locked || signed || !clear} onClick={() => toggleInventory(job.jobId, assign.id, line.id)} className="flex h-10 w-full items-center gap-3 text-left disabled:cursor-default">
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-sm border", on ? "border-navy bg-navy text-card" : "border-line")}>{on ? <Check className="size-3.5" strokeWidth={2.5} /> : null}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{line.name}</span>
                  {on && assign.inventory?.checkedBy?.[line.id] ? <span className="shrink-0 text-[12px] text-muted">{assign.inventory.checkedBy[line.id]}</span> : null}
                  {line.qty ? <span className="shrink-0 text-[12px] text-muted">{line.qty}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {signed ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-up">Signed by {assign.inventory?.signedBy}</p>
          <p className="type-meta mt-1">{assign.inventory?.signedAt}</p>
          {assign.inventory?.signature ? <img src={assign.inventory.signature} alt="" className="mt-2 h-14 rounded-md border border-line bg-white" /> : null}
        </div>
      ) : (
        <button type="button" disabled={!ready || locked} className="mt-3 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40" onClick={() => setOpen(true)}>
          Crew lead sign-off
        </button>
      )}
      {open ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-md bg-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Inventory</p>
                <h2 className="mt-1 text-lg font-semibold">Crew lead sign-off</h2>
              </div>
              <button type="button" aria-label="Close" className="grid size-10 place-items-center text-muted" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-3 text-sm">The load on the truck matches this list.</p>
            <p className="mt-3 text-sm font-semibold">{actingName()}</p>
            <div className="mt-3">
              <SignPad onChange={setSignature} />
            </div>
            <button
              type="button"
              disabled={!signature}
              className="mt-4 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40"
              onClick={() => {
                if (!signature) return;
                signInventory(job.jobId, assign.id, signature);
                setOpen(false);
              }}
            >
              Sign
            </button>
          </div>
        </div>,
        document.body,
      ) : null}
    </JobCard>
  );
}
