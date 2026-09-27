import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { Tip } from "@/components/tip";
import type { Mark, Trend } from "@/features/today/live";

export function markClass(m?: Mark) {
  if (m === "go") return "text-go";
  if (m === "watch") return "text-watch";
  if (m === "stop") return "text-stop";
  return "";
}

export function pipMark(now: number, yest: number): Mark | undefined {
  if (now === yest) return undefined;
  if (now > yest) return "go";
  if (now <= yest * 0.8) return "stop";
  return "watch";
}

export function vsTip(t: Pick<Trend, "now" | "yest" | "goal" | "money">) {
  const fmt = (n: number) => (t.money ? money(n) : String(n));
  const vs = t.now === t.yest ? "Even with yesterday" : t.now > t.yest ? `Up vs yesterday (${fmt(t.yest)})` : `Down vs yesterday (${fmt(t.yest)})`;
  return t.goal ? `${vs} · goal ${fmt(t.goal)}` : vs;
}

export function Pip({ now, yest }: { now: number; yest: number }) {
  const mark = pipMark(now, yest);
  const fill = mark === "go" ? "var(--color-go)" : mark === "stop" ? "var(--color-stop)" : mark === "watch" ? "var(--color-watch)" : "var(--color-idle)";
  if (now === yest) return <i className="inline-block size-1.5 rounded-full bg-idle" />;
  return (
    <svg viewBox="0 0 10 10" className="size-2.5 shrink-0" aria-hidden>
      {now > yest ? <path d="M5 1.5 9 8.5H1Z" fill={fill} /> : <path d="M5 8.5 9 1.5H1Z" fill={fill} />}
    </svg>
  );
}

export function Delta({ now, yest, money: isMoney }: Pick<Trend, "now" | "yest" | "money">) {
  const d = now - yest;
  if (!d) return null;
  const fmt = isMoney ? money(Math.abs(d)) : String(Math.abs(d));
  return (
    <span className={cn("text-[12px] font-semibold tabular-nums", markClass(pipMark(now, yest)))}>
      {d > 0 ? "+" : "−"}
      {fmt}
    </span>
  );
}

export function TrendMark({ trend }: { trend: Trend }) {
  return (
    <Tip label={vsTip(trend)} on>
      <span className="inline-flex items-center gap-1.5">
        <Pip now={trend.now} yest={trend.yest} />
        <Delta {...trend} />
      </span>
    </Tip>
  );
}

export function Pace({
  trend,
  ink,
  pct,
  className,
}: {
  trend: Trend;
  ink?: boolean;
  pct?: boolean;
  className?: string;
}) {
  if (!trend.goal) return null;
  const fill = Math.min(100, Math.round((trend.now / trend.goal) * 100));
  const label = trend.money ? money(trend.goal) : pct ? `${trend.goal}%` : String(trend.goal);
  return (
      <Tip label={`${fill}% of ${label}`} on className={cn("w-full", className)}>
      <span className="flex w-full min-w-0 items-center gap-2">
        <span className={cn("h-1 min-w-0 flex-1 overflow-hidden rounded-full", ink ? "bg-card/20" : "bg-page")}>
          <i className={cn("block h-full rounded-full", ink ? "bg-card" : "bg-navy")} style={{ width: `${fill ? Math.max(fill, 4) : 0}%` }} />
        </span>
        <span className={cn("shrink-0 text-[11px] font-semibold tabular-nums", ink ? "text-card/65" : "text-muted")}>{label}</span>
      </span>
    </Tip>
  );
}
