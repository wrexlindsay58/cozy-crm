import { SelectPick } from "./bits-07";
import { Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { patchCommission, removeCommission } from "../store";
import type { JobFile } from "../store";
import type { CommShare } from "../types";
import { Tip } from "@/components/tip";

export function CommRow({
  job,
  row,
  people,
  amount,
  closerRate,
  canPay,
  onBlockedPay,
}: {
  job: JobFile;
  row: CommShare;
  people: string[];
  amount: number;
  closerRate: number;
  canPay: boolean;
  onBlockedPay: () => void;
}) {
  const names = people.includes(row.who) ? people : [row.who, ...people];
  const locked = row.role !== "Setter";
  return (
    <li className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem_4.5rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1.4fr)_7rem_5.5rem_4.5rem_auto]">
      <SelectPick value={row.who} onChange={(e) => patchCommission(job.jobId, row.id, { who: e.target.value })}>
        {names.map((n) => (
          <option key={n}>{n}</option>
        ))}
      </SelectPick>
      <SelectPick
        className="hidden sm:block"
        value={row.role}
        onChange={(e) => patchCommission(job.jobId, row.id, { role: e.target.value as CommShare["role"] })}
      >
        <option>Closer</option>
        <option>Split</option>
        <option>Setter</option>
      </SelectPick>
      <label className="relative">
        <input
          value={locked ? closerRate : row.pct || ""}
          inputMode="decimal"
          readOnly={locked}
          onChange={(e) => {
            if (locked) return;
            patchCommission(job.jobId, row.id, { pct: Number(e.target.value) || 0 });
          }}
          className={cn("h-10 w-full rounded-md border border-line pr-6 pl-2 text-sm tabular-nums", locked && "bg-page text-muted")}
        />
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[11px] text-muted">%</span>
      </label>
      <span className="text-right text-sm font-semibold tabular-nums">{money(amount)}</span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (!row.paid && !canPay) {
              onBlockedPay();
              return;
            }
            patchCommission(job.jobId, row.id, { paid: !row.paid });
          }}
          className={cn("h-8 rounded-md px-2 text-[11px] font-semibold", row.paid ? "bg-up-bg text-up" : !canPay ? "border border-line text-muted" : "border border-line text-muted")}
        >
          {row.paid ? "Paid" : canPay ? "Open" : "Hold"}
        </button>
        {job.commissions && job.commissions.length > 1 ? (
          <Tip label="Remove" on>
            <button type="button" aria-label="Remove commission" className="grid size-8 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeCommission(job.jobId, row.id)}>
              <Trash2 className="size-4" />
            </button>
          </Tip>
        ) : null}
      </span>
    </li>
  );
}
