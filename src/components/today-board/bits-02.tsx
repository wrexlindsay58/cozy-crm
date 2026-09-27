import { money } from "@/lib/crm-data";
import { Tip } from "@/components/tip";
import type { Split } from "@/features/today/live";
import { useState } from "react";

export function GoalLine({ now, goal, hint }: { now: number; goal: number; hint: string }) {
  const cap = Math.max(goal * 1.4, now, 1);
  const nowPct = Math.min(100, (now / cap) * 100);
  const goalPct = Math.min(100, (goal / cap) * 100);
  return (
    <Tip label={hint} on className="mt-4 block w-full">
      <span className="relative block h-2 w-full rounded-full bg-page">
        <i className="absolute inset-y-0 left-0 rounded-full bg-navy" style={{ width: `${nowPct}%` }} />
        <i className="absolute top-[-4px] h-[16px] w-0.5 rounded-full bg-ink" style={{ left: `${goalPct}%` }} />
      </span>
      <span className="relative mt-1.5 block h-4 w-full text-[11px] tabular-nums text-muted">
        <span className="absolute -translate-x-1/2" style={{ left: `${goalPct}%` }}>
          Goal {goal}%
        </span>
      </span>
    </Tip>
  );
}

export function Ring({ pct, label }: { pct: number; label: string }) {
  const r = 15.9155;
  const c = 100;
  const dash = Math.min(100, Math.max(0, pct));
  const [hot, setHot] = useState(false);
  const w = hot ? 3.5 : 2.75;
  return (
    <Tip label={label} on className="relative z-10 size-12 shrink-0 cursor-pointer">
      <svg
        viewBox="0 0 36 36"
        className="size-12 -rotate-90"
        aria-hidden
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
      >
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-page)" strokeWidth={w} />
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-navy)" strokeWidth={w} strokeDasharray={`${dash} ${c}`} />
      </svg>
    </Tip>
  );
}

export function MktSources({ rows }: { rows: Split[] }) {
  const top = [...rows].sort((a, b) => b.n - a.n).slice(0, 3);
  const max = Math.max(...top.map((r) => r.n), 1);
  return (
    <ul className="space-y-1.5">
      {top.map((r) => (
        <li key={r.label}>
          <Tip label={`${r.label} ${money(r.n)} · ${r.pct}% of ad sales`} on className="flex w-full">
            <span className="flex w-full items-center gap-2">
              <span className="w-16 shrink-0 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">{r.label}</span>
              <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-page">
                <i className="block h-full rounded-sm bg-navy" style={{ width: `${r.n ? Math.max(8, Math.round((r.n / max) * 100)) : 0}%` }} />
              </span>
              <span className="w-16 shrink-0 whitespace-nowrap text-right text-[12px] font-semibold tabular-nums">{money(r.n)}</span>
            </span>
          </Tip>
        </li>
      ))}
    </ul>
  );
}
