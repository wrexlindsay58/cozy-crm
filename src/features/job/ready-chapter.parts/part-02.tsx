import { useState } from "react";
import { Plus } from "lucide-react";
import { addBom, addScopeMedia, orderBom, patchBom, type JobFile } from "../store";
import { profileById } from "../profiles";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { JobCard } from "../job-card";
import { FillField, FillRow, FILL_IN } from "../fill-row";
import { MediaStrip } from "../media-strip";
import { bomAssumed, bomOrderedCost, catFromTag, isAccepted, type BomLine, type ScopeLine } from "../types";
import { Check } from "./part-03";

export function MaterialsCard({ job, line }: { job: JobFile; line: ScopeLine }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [cost, setCost] = useState("");
  const [track, setTrack] = useState<"bulk" | "unit">("bulk");
  const p = profileById(line.categoryId);
  const ordered = line.bom.length > 0 && line.bom.every((b) => b.ordered);

  return (
    <JobCard
      kicker="Materials"
      title={line.label}
      done={ordered && line.bom.length > 0}
      actions={
        line.bom.length ? (
          <button type="button" disabled={!isAccepted(job) || ordered} className={cn("h-8 rounded-md px-3 text-[12px] font-semibold disabled:opacity-40", ordered ? "border border-line text-muted" : "bg-navy text-card")} onClick={() => orderBom(job.jobId, line.id)}>
            {ordered ? "Ordered" : "Order"}
          </button>
        ) : null
      }
    >
      {line.bom.length ? (
        <ul className="divide-y divide-line">
          {line.bom.map((b) => (
            <BomRow key={b.id} job={job} line={line} bom={b} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No materials on this line yet.</p>
      )}

      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          addBom(job.jobId, line.id, name, Number(qty) || 0, Number(cost) || 0, p?.supplier ?? "", track);
          setName("");
          setQty("1");
          setCost("");
        }}
      >
        <FillRow min="6.5rem">
          <FillField label="Add material" className="sm:col-span-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Part" className={FILL_IN} />
          </FillField>
          <FillField label="Qty">
            <input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" className={FILL_IN} />
          </FillField>
          <FillField label="$/ea">
            <input value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" className={FILL_IN} />
          </FillField>
          <FillField label="Track">
            <select value={track} onChange={(e) => setTrack(e.target.value as "bulk" | "unit")} className={FILL_IN}>
              <option value="bulk">Bulk</option>
              <option value="unit">Unit</option>
            </select>
          </FillField>
          <div className="flex items-end">
            <button type="submit" aria-label="Add material" className="grid h-10 w-full place-items-center rounded-md bg-navy text-card">
              <Plus className="size-4" />
            </button>
          </div>
        </FillRow>
      </form>

      <MediaStrip files={line.media.filter((m) => m.cat !== "Design")} onAdd={(f, meta) => addScopeMedia(job.jobId, line.id, f, catFromTag(meta.tag), { caption: meta.caption, purpose: meta.tag, name: meta.name })} label="Delivery and material photos" />
    </JobCard>
  );
}

function BomRow({ job, line, bom }: { job: JobFile; line: ScopeLine; bom: BomLine }) {
  const assumed = bomAssumed(bom);
  const orderedCost = bomOrderedCost(bom);
  const delta = bom.ordered ? orderedCost - assumed : 0;
  const variance = !bom.ordered ? null : delta > 0 ? "Over" : delta < 0 ? "Under" : "Match";
  const track = bom.track ?? (bom.unitCost >= 200 ? "unit" : "bulk");
  const bits = [
    track === "unit" ? "Unit" : "Bulk",
    bom.ordered ? "Ordered" : "Open",
    bom.received ? "In" : "",
    bom.ready ? "Ready" : "",
  ].filter(Boolean);

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold">
          {bom.name}
          <span className="ml-2 text-[11px] font-normal text-muted">{bits.join(" · ")}</span>
        </p>
        {variance ? (
          <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase", variance === "Over" ? "bg-alert-bg text-alert" : variance === "Under" ? "bg-up-bg text-up" : "bg-info-bg text-navy")}>
            {variance} {delta ? money(Math.abs(delta)) : ""}
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <FillRow min="6.5rem">
          <FillField label="Assumed qty">
            <input value={bom.estQty || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { estQty: Number(e.target.value) || 0 })} className={FILL_IN} />
          </FillField>
          <FillField label="Assumed $">
            <input value={bom.unitCost || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { unitCost: Number(e.target.value) || 0 })} className={FILL_IN} />
          </FillField>
          <FillField label="Paid $">
            <input value={(bom.actualUnitCost ?? (bom.ordered ? bom.unitCost : 0)) || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { actualUnitCost: Number(e.target.value) || 0 })} className={FILL_IN} />
          </FillField>
          <div className="flex items-end gap-3 pb-1">
            <Check label="In" on={Boolean(bom.received)} onClick={() => patchBom(job.jobId, line.id, bom.id, { received: !bom.received })} />
            <Check label="Ready" on={Boolean(bom.ready)} onClick={() => patchBom(job.jobId, line.id, bom.id, { ready: !bom.ready })} />
          </div>
        </FillRow>
      </div>
      {bom.ordered || bom.usedQty > 0 ? (
        <div className="mt-2">
          <FillRow min="6.5rem">
            <FillField label="Return">
              <input value={bom.returnQty || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { returnQty: Number(e.target.value) || 0 })} className={FILL_IN} />
            </FillField>
            <FillField label="Keep">
              <input value={bom.warehouseQty || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { warehouseQty: Number(e.target.value) || 0 })} className={FILL_IN} />
            </FillField>
            <FillField label="Back to us">
              <p className="flex h-10 items-center text-sm font-semibold tabular-nums">{money(bom.returnCredit || 0)}</p>
            </FillField>
          </FillRow>
        </div>
      ) : null}
    </li>
  );
}
