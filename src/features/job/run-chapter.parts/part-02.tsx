import { useState } from "react";
import { addChangeOrder, addFieldIssue, patchBom, type JobFile } from "../store";
import { ISSUE_TYPES, type FieldIssue } from "../types";
import { inventoryLines } from "../inventory-chapter";
import { cn } from "@/lib/cn";
import { JobCard } from "../job-card";
import { FillField, FillRow, FILL_IN } from "../fill-row";

export function Brought({ job, locked }: { job: JobFile; locked?: boolean }) {
  const loads = job.assignments.filter((a) => a.kind === "internal" && a.inventory?.signedAt);
  return (
    <JobCard kicker="Used" title="Brought is the signed load" done={loads.length > 0}>
      {loads.length === 0 ? <p className="text-sm text-muted">No signed load yet. Inventory has to be signed before used quantity is entered.</p> : null}
      {loads.map((assign) => (
        <div key={assign.id} className="mt-3 first:mt-0">
          <p className="text-sm font-semibold">{assign.crew}</p>
          <ul className="mt-1 divide-y divide-line">
            {inventoryLines(job, assign).map((line) => {
              const scope = job.scope.find((s) => s.bom.some((b) => b.id === line.id));
              const bom = scope?.bom.find((b) => b.id === line.id);
              if (!scope || !bom) return <li key={line.id} className="py-2 text-sm">{line.name}</li>;
              const brought = bom.orderQty ?? bom.estQty;
              const used = bom.usedQty || 0;
              return (
                <li key={line.id} className="py-2">
                  <FillRow min="6.5rem">
                    <FillField label={bom.name}>
                      <p className="flex h-10 items-center text-sm">Brought {brought} {bom.unit}</p>
                    </FillField>
                    <FillField label="Used">
                      <input disabled={locked} value={used || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, scope.id, bom.id, { usedQty: Number(e.target.value) || 0 })} className={FILL_IN} />
                    </FillField>
                    <FillField label="Left">
                      <p className="flex h-10 items-center text-sm tabular-nums">{Math.max(0, brought - used)} {bom.unit}</p>
                    </FillField>
                  </FillRow>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </JobCard>
  );
}

export function Issues({ job, locked }: { job: JobFile; locked?: boolean }) {
  const [type, setType] = useState<FieldIssue["type"]>(ISSUE_TYPES[0]);
  const [note, setNote] = useState("");
  const [miss, setMiss] = useState(false);
  return (
    <JobCard kicker="Issues" title="What happened on site">
      {(job.issues ?? []).length ? (
        <ul className="mb-3 divide-y divide-line">
          {(job.issues ?? []).map((row) => (
            <li key={row.id} className="py-2 text-sm">
              <span className="font-semibold">{row.type}</span> · {row.note}
              <span className="type-meta"> · {row.by}{row.at ? ` · ${row.at}` : ""}</span>
            </li>
          ))}
        </ul>
      ) : <p className="mb-3 text-sm text-muted">None logged.</p>}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (locked || !note.trim()) {
            setMiss(true);
            return;
          }
          addFieldIssue(job.jobId, type, note);
          setNote("");
          setMiss(false);
        }}
      >
        <select disabled={locked} value={type} onChange={(e) => setType(e.target.value as FieldIssue["type"])} className={cn(FILL_IN, "w-40")}>
          {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input value={note} disabled={locked} onChange={(e) => setNote(e.target.value)} placeholder="What happened" className={cn(FILL_IN, "min-w-0 flex-1", miss && !note.trim() && "border-alert")} />
        <button type="submit" disabled={locked} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40">Add</button>
      </form>
      {miss && !note.trim() ? <p className="mt-2 text-[12px] font-semibold text-alert">Say what happened.</p> : null}
    </JobCard>
  );
}

export function FieldChange({ job, locked }: { job: JobFile; locked?: boolean }) {
  const [why, setWhy] = useState("");
  const [amount, setAmount] = useState("");
  const [miss, setMiss] = useState(false);
  const open = job.changeOrders.filter((c) => c.lane === "install");
  const badWhy = miss && !why.trim();
  const badAmt = miss && !(Number(amount) > 0);
  return (
    <JobCard kicker="Change order" title="More work the customer agreed to">
      <p className="text-sm text-muted">This starts the change order. It is not signed on this tab.</p>
      {open.length ? (
        <ul className="mt-2 divide-y divide-line">
          {open.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span>{c.why}</span>
              <span className="text-[12px] font-semibold">{c.signed ? "Signed" : "Waiting on signature"}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (locked || !why.trim() || !(Number(amount) > 0)) {
            setMiss(true);
            return;
          }
          addChangeOrder(job.jobId, why, Number(amount), 0);
          setWhy("");
          setAmount("");
          setMiss(false);
        }}
      >
        <input disabled={locked} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="What was added" className={cn(FILL_IN, "min-w-0 flex-1", badWhy && "border-alert")} />
        <input disabled={locked} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="$" className={cn(FILL_IN, "w-28", badAmt && "border-alert")} />
        <button type="submit" disabled={locked} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40">Start</button>
      </form>
      {badWhy || badAmt ? <p className="mt-2 text-[12px] font-semibold text-alert">Need what was added, and an amount.</p> : null}
    </JobCard>
  );
}
