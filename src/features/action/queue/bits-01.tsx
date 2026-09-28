import type { SelectHTMLAttributes } from "react";
import { Ban, ChevronDown, Circle, CircleAlert, CircleCheck, Clock, Pause } from "lucide-react";
import type { ActionKind } from "@/features/action/types";
import { WORK_STATUSES } from "@/lib/chrome";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

export type KindFilter = "all" | ActionKind;

export type TalkLane = "customer" | "internal" | "notes" | "tags" | "actions" | "history" | "media" | "form" | "book" | "details";

export type SortKey = "past" | "due" | "newest" | "house" | "owner" | "kind";

export type Remembered = { query: string; kind: KindFilter; status: string; sort: SortKey; office: string };

export const remembered: Remembered = { query: "", kind: "all", status: "all", sort: "past", office: "all" };

export const KINDS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ticket", label: "Tickets" },
  { id: "task", label: "Tasks" },
  { id: "request", label: "Requests" },
];

export const STATUS_OPTS: { id: string; label: string }[] = [
  { id: "all", label: "Any" },
  ...WORK_STATUSES.map((s) => ({ id: s, label: s })),
];

export const SORT_OPTS: { id: SortKey; label: string }[] = [
  { id: "past", label: "Past due" },
  { id: "due", label: "Due" },
  { id: "newest", label: "Newest" },
  { id: "house", label: "House" },
  { id: "owner", label: "Owner" },
  { id: "kind", label: "Kind" },
];

export function CountStrip({
  counts,
  status,
  onStatus,
}: {
  counts: { past: number; soon: number; open: number; complete: number; pause: number; cancel: number };
  status: string;
  onStatus: (v: string) => void;
}) {
  const chips = [
    { id: "Past Due", n: counts.past, label: "Past due", Icon: CircleAlert, ink: "text-stop" },
    { id: "Due Soon", n: counts.soon, label: "Due soon", Icon: Clock, ink: "text-watch" },
    { id: "Open", n: counts.open, label: "Open", Icon: Circle, ink: "text-navy" },
    { id: "Complete", n: counts.complete, label: "Complete", Icon: CircleCheck, ink: "text-go" },
    { id: "Pause", n: counts.pause, label: "Paused", Icon: Pause, ink: "text-muted" },
    { id: "Cancel", n: counts.cancel, label: "Canceled", Icon: Ban, ink: "text-muted" },
  ];
  return (
    <div className="@container flex w-full gap-1">
      {chips.map((c) => {
        const on = status === c.id;
        const Icon = c.Icon;
        return (
          <Tip key={c.id} label={`${c.n} ${c.label.toLowerCase()}`} on className="min-w-0 flex-1">
            <button
              type="button"
              aria-label={`${c.n} ${c.label}`}
              onClick={() => onStatus(on ? "all" : c.id)}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-1.5 rounded-md border px-2 text-[13px] font-semibold",
                on ? "border-navy bg-navy text-card" : "border-line",
              )}
            >
              <Icon className={cn("size-4 shrink-0", on ? "text-card" : c.ink)} />
              <span className="hidden truncate @min-[40rem]:inline">{c.label}</span>
              <span className="tabular-nums">{c.n}</span>
            </button>
          </Tip>
        );
      })}
    </div>
  );
}

export function SelectField({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select
        {...props}
        className="h-11 w-full appearance-none rounded-md border border-line bg-card py-0 pr-10 pl-3 text-sm focus:border-navy"
      />
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
    </span>
  );
}

export function CatChip({ cat }: { cat?: string }) {
  if (!cat) return null;
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-page px-1.5 text-[11px] font-semibold text-navy">
      {cat}
    </span>
  );
}
