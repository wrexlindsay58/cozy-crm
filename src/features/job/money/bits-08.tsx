import { money } from "@/lib/crm-data";
import type { JobFile } from "../store";
import { JobCard } from "../job-card";

export function CoCard({
  kicker,
  title,
  empty,
  rows,
  onAdd,
  locked,
  onSign,
  signLabel,
  signedLabel,
}: {
  kicker: string;
  title: string;
  empty: string;
  rows: JobFile["changeOrders"];
  onAdd: () => void;
  locked?: boolean;
  onSign: (id: string) => void;
  signLabel: string;
  signedLabel: string;
}) {
  return (
    <JobCard
      kicker={kicker}
      title={title}
      actions={
        <button type="button" disabled={locked} className="h-8 rounded-md border border-line px-3 text-xs font-semibold disabled:opacity-40" onClick={onAdd}>
          Add
        </button>
      }
    >
      {rows.length === 0 ? <p className="text-sm text-muted">{empty}</p> : null}
      <ul className="space-y-2 text-sm">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2">
            <span>
              {c.why} · {money(c.amount)}
            </span>
            {c.signed ? (
              <span className="text-[12px] text-up">{signedLabel}</span>
            ) : (
              <button type="button" className="text-xs font-semibold text-navy" onClick={() => onSign(c.id)}>
                {signLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </JobCard>
  );
}
