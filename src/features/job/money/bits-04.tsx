import { CommRow } from "./bits-05";
import { useState } from "react";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { namesIn } from "@/features/staff/store";
import { addCommission, tally } from "../store";
import type { JobFile } from "../store";
import { trueDiscount } from "../types";
import { JobCard } from "../job-card";

export function CommissionCard({ job }: { job: JobFile }) {
  const closers = namesIn("Closer", "Owner");
  const setters = namesIn("Setter");
  const people = [...new Set([...closers, ...setters, job.closer])];
  const td = trueDiscount(job);
  const t = tally(job);
  const canPay = t.collect === 0;
  const [triedPay, setTriedPay] = useState(false);
  const rows = job.commissions?.length
    ? job.commissions
    : [{ id: "CM-seed", who: job.closer, role: "Closer" as const, pct: td.rate, paid: false }];
  const closerN = Math.max(1, rows.filter((c) => c.role !== "Setter").length);

  return (
    <JobCard
      kicker="Commission"
      title={`${td.rate}% after true discount · ${money(t.commission)}${canPay ? "" : " · holds until collected"}`}
      actions={
        <div className="flex gap-1">
          <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addCommission(job.jobId, "Split")}>
            Split
          </button>
          <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addCommission(job.jobId, "Setter")}>
            Setter
          </button>
        </div>
      }
    >
      <p className="mb-3 text-[12px] text-muted">
        0% true discount is 20%. Every 2.5% they give away costs 1% of commission. Field extras do not hit this. Payable only when the job is collected in full.
      </p>
      {!canPay ? (
        <p className={cn("mb-3 text-[12px] font-semibold", triedPay ? "text-alert" : "text-muted")}>
          Left to collect {money(t.collect)}. Commission stays open until that’s $0.
        </p>
      ) : null}
      <ul className="space-y-2">
        {rows.map((c) => (
          <CommRow
            key={c.id}
            job={job}
            row={c}
            people={c.role === "Setter" ? (setters.length ? setters : people) : closers.length ? closers : people}
            amount={c.role === "Setter" ? Math.round(td.base * (c.pct / 100)) : Math.round((td.base * td.rate) / 100 / closerN)}
            closerRate={td.rate}
            canPay={canPay}
            onBlockedPay={() => setTriedPay(true)}
          />
        ))}
      </ul>
    </JobCard>
  );
}
