import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ActBar } from "@/components/act-bar";
import { Float } from "@/components/float";
import { DndPick } from "@/features/lead/dnd-pick";
import { cn } from "@/lib/cn";
import type { Lead, Tone } from "@/lib/crm-data";
import { LEAD_STATUSES, stageWash } from "@/lib/lead-status";
import type { RecordAct, RecordKind, RecordLink } from "./types";

const KIND_LABEL: Record<RecordKind, string> = {
  lead: "Lead",
  assessment: "Assessment",
  opportunity: "Opportunity",
  job: "Job",
  account: "Account",
  action: "Action",
  ticket: "Ticket",
  task: "Task",
  request: "Request",
};

function StageChip({
  label,
  tone,
  onStage,
}: {
  label: string;
  tone: Tone;
  onStage?: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const wash = stageWash(tone);
  if (!onStage) {
    return (
      <span className={cn("inline-flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-bold tracking-wide uppercase", wash)}>
        {label}
      </span>
    );
  }
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Disposition"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
        className={cn("inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase", wash)}
      >
        {label}
        <ChevronDown className="size-3" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {LEAD_STATUSES.map((s) => (
            <button
              key={s.label}
              type="button"
              className={cn("block w-full min-w-44 px-3 py-2 text-left text-sm hover:bg-page", s.label === label && "font-semibold")}
              onClick={() => {
                onStage(s.label);
                setOpen(false);
              }}
            >
              <span className={cn("mr-2 inline-block size-2 rounded-full", stageWash(s.tone))} />
              {s.label}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}

export function TitleRow({
  kind,
  title,
  subtitle,
  stage,
  stageTone = "navy",
  dndLabel,
  moneyLabel,
  related,
  acts,
  onText,
  onStage,
  lead,
}: {
  kind: RecordKind;
  title: string;
  subtitle: string;
  stage: string;
  stageTone?: Tone;
  dndLabel?: string;
  moneyLabel?: string;
  related?: RecordLink[];
  acts: RecordAct[];
  onText: () => void;
  onStage?: (status: string) => void;
  lead?: Lead;
}) {
  function pills() {
    return (
      <>
        <StageChip label={stage} tone={stageTone} onStage={onStage} />
        {lead ? <DndPick lead={lead} compact /> : dndLabel ? <StageChip label={dndLabel} tone="alert" /> : null}
      </>
    );
  }
  function actions() {
    return (
      <>
        {moneyLabel ? <p className="mr-1 shrink-0 text-sm font-extrabold tabular-nums">{moneyLabel}</p> : null}
        <ActBar
          iconsOnly
          items={acts.map((act) => ({
            label: act.label,
            variant: act.opens === "thread" ? "navy" : "line",
            onClick: act.onClick ?? (act.opens === "thread" ? onText : undefined),
            menu: act.menu,
          }))}
        />
      </>
    );
  }

  return (
    <header className="border-b border-line bg-card px-4 py-2.5 md:px-5">
      <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        {KIND_LABEL[kind]}
        {related?.map((r) => (
          <a key={r.href} href={r.href} className="ml-2 font-semibold tracking-normal text-navy normal-case">
            {r.label}
          </a>
        ))}
      </p>

      <div className="mt-1 md:hidden">
        <h1 className="text-xl font-extrabold tracking-tight break-words">{title}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">{pills()}</div>
        <p className="mt-0.5 min-w-0 text-sm text-muted break-words">{subtitle}</p>
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">{actions()}</div>
      </div>

      <div className="mt-1 hidden flex-wrap items-start justify-between gap-2 md:flex">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
            {pills()}
          </div>
          <p className="mt-0.5 min-w-0 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">{actions()}</div>
      </div>
    </header>
  );
}
