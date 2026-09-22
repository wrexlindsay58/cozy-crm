import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Fixed layout rule: fields fill the section. Grow with the pane. Never a leftover gap on the right. */
export const FILL_IN =
  "h-10 w-full min-w-0 rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal focus:border-navy focus:outline-none";
export const FILL_IN_ERR =
  "h-10 w-full min-w-0 rounded-md border border-alert bg-card px-2 text-sm font-semibold normal-case tracking-normal focus:border-alert focus:outline-none";
export const SEC_HEAD = "text-xs font-bold tracking-wide text-muted uppercase";

export function FillRow({
  children,
  min = "8rem",
}: {
  children: ReactNode;
  min?: string;
}) {
  return (
    <div
      className="grid w-full min-w-0 gap-2"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}), 1fr))` }}
    >
      {children}
    </div>
  );
}

export function FillField({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase", className)}>
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
