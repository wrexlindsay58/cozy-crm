import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { ActBar } from "@/components/act-bar";
import { BackLink } from "@/components/ui-bits";
import { cn } from "@/lib/cn";
import { DndPick } from "@/features/lead/dnd-pick";
import type { Lead, Tone } from "@/lib/crm-data";
import type { RecordAct, RecordKind, RecordLink } from "../types";
import { setHeadOpen, useHeadOpen } from "../head-open";
import { KIND_LABEL, KIND_BACK, StageChip } from "./part-01";

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
  stageOptions,
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
  stageOptions?: { label: string; tone: Tone }[];
  lead?: Lead;
}) {
  const open = useHeadOpen();
  function toggleHead() {
    setHeadOpen(!open);
  }
  function pills() {
    return (
      <>
        <StageChip label={stage} tone={stageTone} onStage={onStage} options={stageOptions} />
        {lead ? <DndPick lead={lead} compact /> : dndLabel ? <StageChip label={dndLabel} tone="alert" /> : null}
      </>
    );
  }
  function actions() {
    return (
      <div className="flex w-full min-w-0 flex-col items-stretch gap-1.5 md:w-auto md:flex-row md:items-center md:justify-end md:gap-3">
        {moneyLabel ? (
          <>
            <p className="inline-flex h-9 shrink-0 items-center self-start rounded-md bg-navy px-3 text-base font-extrabold tabular-nums tracking-tight text-card md:h-10 md:self-auto md:text-lg">
              {moneyLabel}
            </p>
            <span className="hidden h-10 w-px shrink-0 bg-line md:block" aria-hidden />
          </>
        ) : null}
        <ActBar
          iconsOnly
          items={acts.map((act) => ({
            label: act.label,
            variant: act.opens === "thread" ? "navy" : "line",
            onClick: act.onClick ?? (act.opens === "thread" ? onText : undefined),
            menu: act.menu,
          }))}
        />
      </div>
    );
  }

  return (
    <header className={cn("border-b border-line bg-card px-1 md:px-5 md:py-2.5", open ? "py-2.5" : "py-1")}>
      {open ? <BackLink to={KIND_BACK[kind].to} label={KIND_BACK[kind].label} /> : null}
      <p className={cn("text-[11px] font-bold tracking-[0.14em] text-muted uppercase", !open && "max-md:hidden")}>
        {KIND_LABEL[kind]}
        {related?.map((r) => (
          <Link key={r.href} to={r.href} className="ml-2 font-semibold tracking-normal text-navy normal-case">
            {r.label}
          </Link>
        ))}
      </p>

      <div className="flex items-center gap-1.5 md:hidden">
        {open ? null : <BackLink to={KIND_BACK[kind].to} label={KIND_BACK[kind].label} />}
        <h1 className={cn("min-w-0 truncate font-extrabold tracking-tight", open ? "text-xl" : "flex-1 text-base")}>{title}</h1>
        <div className="flex shrink-0 items-center gap-1.5">{pills()}</div>
        <button
          type="button"
          className="ml-auto grid h-8 w-6 shrink-0 place-items-center text-muted"
          aria-expanded={open}
          aria-label={open ? "Collapse header" : "Expand header"}
          onClick={toggleHead}
        >
          <ChevronDown className={cn("size-4", open && "rotate-180")} />
        </button>
      </div>
      {open ? (
        <div className="mt-0.5 md:hidden">
          <p className="min-w-0 text-sm text-muted break-words">{subtitle}</p>
          <div className="mt-2">{actions()}</div>
        </div>
      ) : null}

      <div className="mt-1 hidden items-start justify-between gap-2 md:flex">
        <div className="min-w-0">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
            {pills()}
          </div>
          <p className="mt-0.5 min-w-0 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 overflow-x-auto">{actions()}</div>
      </div>
    </header>
  );
}
