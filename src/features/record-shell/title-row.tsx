import { ActBar } from "@/components/act-bar";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/crm-data";
import type { RecordAct, RecordKind, RecordLink } from "./types";

const KIND_LABEL: Record<RecordKind, string> = {
  lead: "Lead",
  assessment: "Assessment",
  opportunity: "Opportunity",
  job: "Job",
  account: "Account",
};

function StageChip({ label, tone }: { label: string; tone: Tone }) {
  const wash =
    tone === "alert" ? "bg-alert-bg text-alert" : tone === "up" ? "bg-up-bg text-up" : tone === "muted" ? "bg-page text-muted" : "bg-info-bg text-navy";
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-bold tracking-wide uppercase", wash)}>
      {label}
    </span>
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
}) {
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
      <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
            <StageChip label={stage} tone={stageTone} />
            {dndLabel ? <StageChip label={dndLabel} tone="alert" /> : null}
          </div>
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">
          {moneyLabel ? <p className="mr-1 text-sm font-extrabold tabular-nums">{moneyLabel}</p> : null}
          <ActBar
            items={acts.map((act) => ({
              label: act.label,
              variant: act.opens === "thread" ? "navy" : "line",
              onClick: act.opens === "thread" ? onText : act.onClick,
              menu: act.menu,
            }))}
          />
        </div>
      </div>
    </header>
  );
}
