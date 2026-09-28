import { ChevronDown } from "lucide-react";
import { ActBar } from "@/components/act-bar";
import { BackLink } from "@/components/ui-bits";
import { cn } from "@/lib/cn";
import { DndPick } from "@/features/lead/dnd-pick";
import type { Lead, Tone } from "@/lib/crm-data";
import type { RecordAct, RecordKind } from "../types";
import { setHeadOpen, useHeadOpen } from "../head-open";
import { KIND_LABEL, KIND_BACK, PlaceLine, StageChip } from "./part-01";

export function TitleRow({
  kind,
  title,
  subtitle,
  addresses,
  stage,
  stageTone = "navy",
  dndLabel,
  moneyLabel,
  code,
  acts,
  onText,
  onStage,
  stageOptions,
  lead,
}: {
  kind: RecordKind;
  title: string;
  subtitle: string;
  addresses?: string[];
  stage: string;
  stageTone?: Tone;
  dndLabel?: string;
  moneyLabel?: string;
  code?: string;
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
            <p className="inline-flex h-8 shrink-0 items-center self-center rounded-md bg-navy px-2 text-sm font-extrabold tabular-nums tracking-tight text-card md:h-10 md:self-auto md:px-3 md:text-lg">
              {moneyLabel}
            </p>
            <span className="hidden h-10 w-px shrink-0 bg-line md:block" aria-hidden />
          </>
        ) : null}
        <ActBar
          iconsOnly
          className="act-spread"
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

  function chevron() {
    return (
      <button
        type="button"
        className={cn("relative -mr-2 grid h-8 w-8 shrink-0 place-items-center text-muted", !open && "-ml-[3px]")}
        aria-expanded={open}
        aria-label={open ? "Collapse header" : "Expand header"}
        onClick={toggleHead}
      >
        <ChevronDown className={cn("size-4", open && "rotate-180")} />
      </button>
    );
  }

  return (
    <header className={cn("border-b border-line bg-card px-3 md:px-5 md:py-2.5", open ? "py-2" : "py-1")}>
      {open ? (
        <div className="mb-1 flex items-center md:hidden">
          <BackLink to={KIND_BACK[kind].to} label={KIND_BACK[kind].long ?? KIND_BACK[kind].label} className="-ml-0.5" />
          <span className="ml-auto">{chevron()}</span>
        </div>
      ) : null}
      <p className={cn("text-[11px] font-bold tracking-[0.14em] text-muted uppercase", !open && "max-md:hidden")}>
        <span className={cn(open && "max-md:hidden")}>{KIND_LABEL[kind]}</span>
        {code ? <span className="font-semibold tracking-normal text-navy normal-case max-md:ml-0 md:ml-2">{code}</span> : null}
      </p>

      <div className="flex items-center gap-1.5 md:hidden">
        {open ? null : <BackLink to={KIND_BACK[kind].to} label={KIND_BACK[kind].label} className="-ml-0.5" />}
        <h1 className={cn("min-w-0 truncate font-extrabold tracking-tight", open ? "text-lg" : "flex-1 text-base")}>{title}</h1>
        <div className={cn("flex shrink-0 items-center gap-1.5", open && "ml-auto")}>{pills()}</div>
        {open ? null : chevron()}
      </div>
      {open ? (
        <div className="mt-1 md:hidden">
          <PlaceLine lines={addresses?.length ? addresses : [subtitle]} className="text-[13px] text-muted" />
          <div className={cn("head-acts act-sm mt-2.5", moneyLabel && "has-money")}>{actions()}</div>
        </div>
      ) : null}

      <div className="mt-1 hidden items-start justify-between gap-2 md:flex">
        <div className="min-w-0">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
            {pills()}
          </div>
          <PlaceLine lines={addresses?.length ? addresses : [subtitle]} className="mt-0.5 text-sm text-muted" />
        </div>
        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 overflow-x-auto">{actions()}</div>
      </div>
    </header>
  );
}
