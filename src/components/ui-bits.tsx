import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/crm-data";

export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold whitespace-nowrap",
        tone === "up" && "bg-up-bg text-up",
        tone === "alert" && "bg-alert/10 text-alert",
        tone === "navy" && "bg-navy text-card",
        tone === "muted" && "bg-page text-muted",
      )}
    >
      {label}
    </span>
  );
}

export function PageHeader({
  kicker,
  title,
  count,
  actions,
}: {
  kicker?: string;
  title: string;
  count?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? (
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">{kicker}</p>
        ) : null}
        <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
          {title}
          {count ? <span className="ml-2 text-sm font-semibold text-muted">{count}</span> : null}
        </h1>
      </div>
      {actions}
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-full px-3 text-xs font-semibold",
        active ? "bg-navy text-card" : "border border-line bg-card text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-card px-4 py-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}
