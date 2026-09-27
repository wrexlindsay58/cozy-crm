import { markClass, TrendMark, Pace } from "./bits-01";
import { Ring } from "./bits-02";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import type { Mark, Split, Trend } from "@/features/today/live";
import { useState } from "react";
import type { ReactNode } from "react";

export function MiniDonut({ rows }: { rows: Split[] }) {
  const [over, setOver] = useState<string | null>(null);
  const total = Math.max(
    rows.reduce((s, r) => s + r.n, 0),
    1,
  );
  const R = 13;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segs = rows
    .filter((r) => r.n)
    .map((r) => {
      const len = (r.n / total) * C;
      const row = { ...r, len, offset };
      offset += len;
      return row;
    });
  const hit = rows.find((r) => r.label === over);
  const tip = hit ? `${hit.label} ${hit.n} · ${hit.pct}%` : rows.map((r) => `${r.label} ${r.n}`).join(" · ");
  return (
    <Tip label={tip} on className="relative z-10 block size-[4.75rem] cursor-pointer">
      <svg viewBox="0 0 36 36" className="size-[4.75rem] -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={R} fill="transparent" />
        <circle cx="18" cy="18" r={R} fill="none" stroke="var(--color-page)" strokeWidth="4.5" />
        {segs.map((r) => (
          <circle
            key={r.label}
            cx="18"
            cy="18"
            r={R}
            fill="none"
            stroke={r.tone}
            strokeWidth={over === r.label ? 5.5 : 4.5}
            strokeOpacity={over && over !== r.label ? 0.35 : 1}
            strokeDasharray={`${r.len} ${C - r.len}`}
            strokeDashoffset={-r.offset}
            pointerEvents="stroke"
            onMouseEnter={() => setOver(r.label)}
            onMouseLeave={() => setOver(null)}
          />
        ))}
      </svg>
    </Tip>
  );
}

export function Cell({
  label,
  value,
  trend,
  mark,
  ring,
  hint,
  pct,
  sub,
  split,
  spark,
  meta,
  big,
  className,
}: {
  label: ReactNode;
  value: string;
  trend: Trend;
  mark?: Mark;
  ring?: boolean;
  hint: string;
  pct?: boolean;
  sub?: string;
  split?: Split[];
  spark?: ReactNode;
  meta?: string;
  big?: boolean;
  className?: string;
}) {
  const ringFill = ring ? Math.min(100, Math.max(0, trend.now)) : undefined;
  return (
    <div className={cn("grid h-full grid-rows-[auto_1fr_auto] bg-card px-5 py-6 max-md:px-3 max-md:py-4", className)}>
      <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">
        {label}
        <TrendMark trend={trend} />
      </p>
      <div className={cn("flex items-center justify-between gap-2", big && "max-md:mt-2")}>
        <div className="relative min-w-0">
          <Tip label={hint} on className="flex w-full">
            <p className={cn("type-hero whitespace-nowrap", big && "type-hero-lg", markClass(mark))}>{value}</p>
          </Tip>
          {meta ? <p className="absolute top-full left-0 mt-2 whitespace-nowrap text-[12px] tabular-nums text-muted">{meta}</p> : null}
        </div>
        {ringFill != null ? <Ring pct={ringFill} label={`${trend.now}% · goal ${trend.goal}%`} /> : null}
        {split && ringFill == null ? <MiniDonut rows={split} /> : null}
        {spark && ringFill == null && !split ? <span className="shrink-0">{spark}</span> : null}
      </div>
      <div className={cn("pt-4", big && "max-md:pt-2")}>
        {sub ? <p className="whitespace-nowrap text-[11px] font-semibold tabular-nums text-muted">{sub}</p> : <Pace trend={trend} pct={pct} />}
      </div>
    </div>
  );
}
