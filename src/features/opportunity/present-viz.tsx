import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StepRail({ i, n }: { i: number; n: number }) {
  return (
    <ol className="hidden items-center gap-1.5 sm:flex" aria-hidden>
      {Array.from({ length: n }, (_, k) => (
        <li key={k} className={cn("h-1.5 rounded-full", k === i ? "w-6 bg-[var(--p-navy)]" : k < i ? "w-1.5 bg-[var(--p-navy)]/40" : "w-1.5 bg-[var(--p-trim)]")} />
      ))}
    </ol>
  );
}

export function BarRow({ label, value, max, tone = "navy" }: { label: string; value: number; max: number; tone?: "navy" | "gray" | "red" }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const fill = tone === "red" ? "bg-[var(--p-red)]" : tone === "gray" ? "bg-[var(--p-trim)]" : "bg-[var(--p-navy)]";
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-[12px]">
        <span className="text-[var(--p-gray)]">{label}</span>
        <span className="font-semibold tabular-nums text-[var(--p-navy)]">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--p-trim)]/50">
        <div className={cn("h-full rounded-full", fill)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function MoneyBars({ rows, picked }: { rows: { id: string; name: string; amount: number }[]; picked?: string }) {
  const max = Math.max(...rows.map((r) => r.amount), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = Math.round((r.amount / max) * 100);
        const on = r.id === picked;
        return (
          <li key={r.id}>
            <div className="mb-1 flex justify-between gap-2 text-[12px]">
              <span className={on ? "font-semibold text-[var(--p-navy)]" : "text-[var(--p-gray)]"}>{r.name}</span>
              <span className="font-extrabold tabular-nums text-[var(--p-navy)]">{r.amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</span>
            </div>
            <div className="h-8 overflow-hidden rounded-sm bg-[var(--p-trim)]/35">
              <div className={cn("h-full", on ? "bg-[var(--p-navy)]" : "bg-[var(--p-trim)]")} style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-sm border border-[var(--p-trim)] bg-white p-5", className)}>{children}</div>;
}
