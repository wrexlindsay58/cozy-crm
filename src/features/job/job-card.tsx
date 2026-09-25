import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function JobCard({
  kicker,
  title,
  aside,
  actions,
  done,
  children,
}: {
  kicker: string;
  title?: string;
  aside?: ReactNode;
  actions?: ReactNode;
  done?: boolean;
  children?: ReactNode;
}) {
  const headline = title || kicker;
  const eyebrow = title ? kicker : null;
  return (
    <section className={cn("rounded-md border bg-card", done ? "border-navy/35" : "border-line")}>
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          {eyebrow ? <p className="type-meta">{eyebrow}</p> : null}
          <p className={cn("flex items-center gap-1.5 text-[15px] font-semibold", eyebrow && "mt-0.5")}>
            {done ? <Check className="size-3.5 shrink-0 text-up" strokeWidth={2.5} /> : null}
            {headline}
            {done ? <span className="text-[10px] font-bold tracking-wide text-up uppercase">Complete</span> : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {aside ? <div className="shrink-0 text-right text-[11px] font-semibold tabular-nums text-muted">{aside}</div> : null}
          {actions}
        </div>
      </header>
      {children ? <div className="px-4 py-3">{children}</div> : null}
    </section>
  );
}
