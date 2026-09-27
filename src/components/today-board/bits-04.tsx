import { markClass } from "./bits-01";
import { MiniDonut } from "./bits-03";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import type { Mark, Split } from "@/features/today/live";

export function CountShare({ n, total, tone }: { n: number; total: number; tone?: string }) {
  const pct = total ? Math.round((n / total) * 100) : 0;
  return (
    <span className="flex shrink-0 items-baseline justify-end gap-6 tabular-nums">
      <span className={cn("font-semibold", tone)}>{n}</span>
      <span className="w-10 text-right font-normal text-muted">{pct}%</span>
    </span>
  );
}

export function Story({
  title,
  value,
  hint,
  rows,
  note,
  mark,
}: {
  title: string;
  value: string;
  hint: string;
  rows: Split[];
  note?: string;
  mark?: Mark;
}) {
  return (
    <div className="flex min-w-0 flex-col bg-card px-5 py-4">
      <p className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">{title}</p>
      <div className="mt-3 flex min-w-0 items-center gap-4">
        <MiniDonut rows={rows} />
        <div className="min-w-0 flex-1">
          <Tip label={hint} on>
            <p className={cn("type-metric min-w-0", markClass(mark))}>{value}</p>
          </Tip>
          <ul className="mt-2 space-y-1">
            {rows.map((r) => {
              const total = rows.reduce((s, row) => s + row.n, 0);
              return (
                <li key={r.label} className="flex items-baseline justify-between gap-2 text-[12px]">
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
                    <i className="size-1.5 shrink-0 rounded-full" style={{ background: r.tone }} />
                    {r.label}
                  </span>
                  <CountShare n={r.n} total={total} tone={r.mark ? markClass(r.mark) : ""} />
                </li>
              );
            })}
          </ul>
          {note ? <p className="mt-2 truncate text-[12px] text-muted">{note}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function FillMeter({ now, max, hint }: { now: number; max: number; hint: string }) {
  const pct = max ? Math.round((now / max) * 100) : 0;
  return (
    <Tip label={hint} on className="mt-3 block w-full">
      <span className="flex w-full items-center gap-2">
        <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-page">
          <i className="block h-full rounded-full bg-navy" style={{ width: `${pct ? Math.max(pct, 6) : 0}%` }} />
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-muted">{pct}%</span>
      </span>
    </Tip>
  );
}

export function SplitMix({ rows }: { rows: Split[] }) {
  const total = rows.reduce((s, r) => s + r.n, 0) || 1;
  return (
    <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-page">
      {rows.map((r) => (
        <i key={r.label} className="h-full" style={{ width: `${(r.n / total) * 100}%`, background: r.tone }} />
      ))}
    </div>
  );
}
