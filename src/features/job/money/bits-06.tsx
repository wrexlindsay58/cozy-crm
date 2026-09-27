import { pct } from "./bits-01";
import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { addCostHit, removeCostHit } from "../store";
import type { JobFile } from "../store";
import { SALES_FAULTS } from "../types";
import type { SalesFault } from "../types";
import { FILL_IN } from "../fill-row";

export function TrueDiscountHits({ job, readOnly = false }: { job: JobFile; readOnly?: boolean }) {
  const listed = job.scope.filter((s) => s.kind === "discount" || s.amount < 0);
  const sales = (job.costHits ?? []).filter((h) => h.kind === "sales");
  const [reason, setReason] = useState<SalesFault>(SALES_FAULTS[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="mt-4">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Sales misses</p>
      <p className="mt-0.5 text-[12px] text-muted">Misquotes, mismeasures, missed adders, free promises. Not used qty or supplier price.</p>
      <ul className="mt-2 divide-y divide-line">
        {listed.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span>Listed discount · {s.label}</span>
            <span className="font-semibold tabular-nums text-alert">{money(Math.abs(s.amount))}</span>
          </li>
        ))}
        {sales.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span>
              {h.reason}
              {h.note ? ` · ${h.note}` : ""}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-semibold tabular-nums text-alert">{money(h.amount)}</span>
              {readOnly ? null : (
              <button type="button" aria-label="Remove" className="grid size-8 place-items-center rounded-md text-muted hover:text-alert" onClick={() => removeCostHit(job.jobId, h.id)}>
                <Trash2 className="size-4" />
              </button>
              )}
            </span>
          </li>
        ))}
        {!listed.length && !sales.length ? <li className="py-1.5 text-sm text-muted">None on this file.</li> : null}
      </ul>
      {readOnly ? null : (
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,1.2fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          addCostHit(job.jobId, "sales", reason, Number(amount) || 0, note);
          setAmount("");
          setNote("");
        }}
      >
        <select value={reason} onChange={(e) => setReason(e.target.value as SalesFault)} className={FILL_IN}>
          {SALES_FAULTS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="$" className={FILL_IN} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className={FILL_IN} />
        <button type="submit" className="h-10 rounded-md bg-navy px-3 text-[12px] font-semibold text-card">
          Add
        </button>
      </form>
      )}
    </div>
  );
}

export function Fold({
  label,
  value,
  of,
  nest,
  tone,
  alert,
  children,
}: {
  label: string;
  value: number;
  of: number;
  nest?: boolean;
  tone?: "cost";
  alert?: boolean;
  children?: ReactNode;
}) {
  const [on, setOn] = useState(false);
  const red = tone === "cost" || alert;
  return (
    <div>
      <button type="button" onClick={() => setOn((v) => !v)} className={cn("flex w-full min-w-0 items-center gap-2 py-1.5 text-left", nest ? "text-[13px]" : "text-sm")}>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", on && "rotate-180")} />
        <span className={cn("min-w-0 flex-1 truncate font-semibold", red && "text-alert")}>{label}</span>
        <span className={cn("w-10 shrink-0 text-right text-[11px] font-semibold", red ? "text-alert/70" : "text-muted")}>{pct(value, of)}</span>
        <span className={cn("min-w-[5.5rem] shrink-0 text-right font-extrabold tabular-nums", red ? "text-alert" : "text-ink")}>{money(value)}</span>
      </button>
      {on ? <div className="ml-6">{children}</div> : null}
    </div>
  );
}
