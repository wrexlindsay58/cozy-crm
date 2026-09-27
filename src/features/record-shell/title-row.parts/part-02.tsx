import { Link } from "@tanstack/react-router";
import { ActBar } from "@/components/act-bar";
import { BackLink } from "@/components/ui-bits";
import { DndPick } from "@/features/lead/dnd-pick";
import type { Lead, Tone } from "@/lib/crm-data";
import type { RecordAct, RecordKind, RecordLink } from "../types";
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
      <div className="flex items-center gap-3">
        {moneyLabel ? (
          <>
            <p className="inline-flex h-9 shrink-0 items-center rounded-md bg-navy px-3 text-base font-extrabold tabular-nums tracking-tight text-card md:h-10 md:text-lg">
              {moneyLabel}
            </p>
            <span className="h-9 w-px shrink-0 bg-line md:h-10" aria-hidden />
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
    <header className="border-b border-line bg-card px-4 py-2.5 md:px-5">
      <BackLink to={KIND_BACK[kind].to} label={KIND_BACK[kind].label} />
      <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        {KIND_LABEL[kind]}
        {related?.map((r) => (
          <Link key={r.href} to={r.href} className="ml-2 font-semibold tracking-normal text-navy normal-case">
            {r.label}
          </Link>
        ))}
      </p>

      <div className="mt-1 md:hidden">
        <div className="flex items-center gap-2">
          <h1 className="min-w-0 truncate text-xl font-extrabold tracking-tight">{title}</h1>
          <div className="flex shrink-0 items-center gap-1.5">{pills()}</div>
        </div>
        <p className="mt-0.5 min-w-0 text-sm text-muted break-words">{subtitle}</p>
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">{actions()}</div>
      </div>

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
