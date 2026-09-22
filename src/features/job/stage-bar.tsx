import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Flag,
  HardHat,
  Package,
  Ruler,
  Wrench,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { scrollFileSection } from "@/features/record-shell/file-sections";
import { HOLDS, setHoldNote, toggleHold, type Hold, type JobFile } from "./store";
import { sectionDoneAt, sectionTone } from "./done";

const FLOW: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "sold", label: "Sold", Icon: BadgeCheck },
  { id: "survey", label: "Site survey", Icon: Ruler },
  { id: "ready", label: "Materials", Icon: Package },
  { id: "crew", label: "Crews", Icon: HardHat },
  { id: "run", label: "Production", Icon: Wrench },
  { id: "money", label: "Money", Icon: CircleDollarSign },
  { id: "close", label: "Closeout", Icon: Flag },
  { id: "book", label: "Book", Icon: CalendarDays },
];

export function JobSticky({ job }: { job: JobFile }) {
  return (
    <div className="min-w-0">
      {job.cancelled ? (
        <p className="border-b border-line bg-alert-bg px-3 py-2 text-[12px] font-semibold text-alert">
          Cancelled{job.cancelWhy ? ` · ${job.cancelWhy}` : ""}{job.cancelledAt ? ` · ${job.cancelledAt}` : ""}
        </p>
      ) : null}
      <StageBar job={job} compact />
      <HoldsBar job={job} />
    </div>
  );
}

export function StageBar({ job, compact = false }: { job: JobFile; compact?: boolean }) {
  const nextId = FLOW.find((s) => sectionTone(job, s.id) !== "done")?.id;
  return (
    <section className={compact ? "min-w-0 bg-card px-3 py-2.5" : "min-w-0 rounded-md border border-line bg-card p-4"}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Job workflow</p>
        <p className="truncate text-[10px] font-semibold text-muted">{job.stage}</p>
      </div>
      <ol className="mt-1.5 flex w-full min-w-0 items-center">
        {FLOW.map((s, idx) => {
          const tone = sectionTone(job, s.id);
          const Icon = s.Icon;
          const next = s.id === nextId;
          const when = sectionDoneAt(job, s.id);
          const tip = [
            s.label,
            next ? "Next" : tone === "done" ? "Complete" : tone === "open" ? "Started" : "",
            when,
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={s.id} className="flex min-w-0 flex-1 items-center">
              <Tip label={tip} on className="w-full min-w-0">
                <button
                  type="button"
                  aria-label={tip}
                  onClick={() => scrollFileSection(s.id)}
                  className={cn(
                    "relative flex h-9 w-full min-w-0 items-center justify-center rounded-md",
                    next ? "bg-navy text-card" : tone === "idle" ? "text-muted" : "text-navy",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {tone === "done" ? (
                    <Check className="absolute top-1 right-0 size-2.5 text-up sm:right-1" strokeWidth={3} />
                  ) : null}
                </button>
              </Tip>
              {idx < FLOW.length - 1 ? (
                <span className={cn("mx-0.5 h-px w-1.5 shrink-0 sm:w-2.5", tone === "done" || tone === "open" ? "bg-navy/40" : "bg-line")} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function HoldsBar({ job }: { job: JobFile }) {
  const holdCount = job.holds.length;
  return (
    <section className="min-w-0 border-t border-line bg-card px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Holds</p>
        <p className="text-[10px] font-semibold text-muted">{holdCount ? `${holdCount} on` : "None"}</p>
      </div>
      <div className="mt-1.5 flex min-w-0 flex-nowrap gap-1">
        {HOLDS.map((h) => {
          const row = job.holds.find((x) => x.kind === h);
          return (
            <button
              key={h}
              type="button"
              title={h}
              onClick={() => toggleHold(job.jobId, h as Hold)}
              className={cn(
                "h-8 min-w-0 flex-1 truncate rounded-md px-1 text-[11px] font-semibold capitalize",
                row ? "bg-alert/15 text-alert" : "border border-line text-muted",
              )}
            >
              {h}
            </button>
          );
        })}
      </div>
      {job.holds.length ? (
        <ul className="mt-2 space-y-2">
          {job.holds.map((h) => (
            <li key={h.kind}>
              <label className="block text-[11px] font-bold tracking-wide text-muted uppercase">
                {h.kind} · {h.at}
                <textarea
                  value={h.note}
                  onChange={(e) => setHoldNote(job.jobId, h.kind, e.target.value)}
                  rows={2}
                  placeholder="What’s blocking. Who we wait on. When it frees."
                  className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm font-normal normal-case tracking-normal"
                />
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}