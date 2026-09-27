import { cn } from "@/lib/cn";
import type { Mark } from "@/lib/sales-data";

export type Drill = "appointments" | "leads" | "opportunities" | "projects" | "sold";

export type MixView = "dollars" | "qty";

export type RankBy = "overall" | "sold" | "qty" | "close" | "nsa" | "avg";

export function markClass(m?: Mark) {
  if (m === "go") return "text-go";
  if (m === "watch") return "text-watch";
  if (m === "stop") return "text-stop";
  return "";
}

export function changePct(now: number, prior: number, invert = false) {
  if (!prior) return null;
  const raw = invert ? (prior - now) / prior : (now - prior) / prior;
  return Math.round(raw * 100);
}

export function periodMark(now: number, prior: number, invert = false): Mark | undefined {
  const pct = changePct(now, prior, invert);
  if (pct == null || pct === 0) return undefined;
  if (pct >= 10) return "go";
  if (pct <= -5) return "stop";
  if (pct < 0) return "watch";
  return undefined;
}

export function numClass(now: number, prior: number, target?: number, invert = false) {
  const above = target != null && target > 0 && (invert ? now < target : now > target);
  if (above) return "text-go";
  return markClass(periodMark(now, prior, invert)) || "text-navy";
}

export function deltaPct(now: number, was: number) {
  if (!was) return null;
  return Math.round(((now - was) / was) * 100);
}

export function pipMark(now: number, yest: number, invert = false): Mark | undefined {
  const pct = changePct(now, yest, invert);
  if (pct == null || pct === 0) return undefined;
  if (pct >= 5) return "go";
  if (pct <= -5) return "stop";
  if (pct < 0) return "watch";
  return undefined;
}

export function Pip({ now, yest, invert }: { now: number; yest: number; invert?: boolean }) {
  const mark = pipMark(now, yest, invert);
  const fill = mark === "go" ? "var(--color-go)" : mark === "stop" ? "var(--color-stop)" : mark === "watch" ? "var(--color-watch)" : "var(--color-navy)";
  const label = now === yest ? "Even" : (invert ? now < yest : now > yest) ? "Ahead" : "Behind";
  if (now === yest) return <i className="inline-block size-1.5 rounded-full bg-idle" title={label} />;
  return (
    <svg viewBox="0 0 10 10" className="size-2.5 shrink-0" aria-label={label}>
      {(invert ? now < yest : now > yest) ? <path d="M5 1.5 9 8.5H1Z" fill={fill} /> : <path d="M5 8.5 9 1.5H1Z" fill={fill} />}
    </svg>
  );
}

export function Delta({ now, was, invert }: { now: number; was: number; invert?: boolean }) {
  const n = deltaPct(now, was);
  if (n == null) return null;
  const mark = periodMark(now, was, invert);
  return (
    <span className={cn("text-[13px] font-semibold tabular-nums", markClass(mark) || "text-navy")}>
      {n > 0 ? "+" : ""}
      {n}%
    </span>
  );
}

export const tip = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-line)",
    borderRadius: 6,
    fontSize: 12,
    color: "var(--color-ink)",
    boxShadow: "0 8px 20px rgba(11,58,77,0.08)",
  },
  labelStyle: { fontWeight: 700, marginBottom: 2 },
  itemStyle: { fontSize: 12 },
  cursor: false as const,
  offset: 18,
  animationDuration: 0,
  wrapperStyle: { pointerEvents: "none" as const, transition: "none" },
};
