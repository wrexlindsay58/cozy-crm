import { useState } from "react";
import { Calendar, MessageSquare, Phone, Plus } from "lucide-react";
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

const ACT_ICON: Record<string, typeof Phone> = {
  Call: Phone,
  Text: MessageSquare,
  Book: Calendar,
  Create: Plus,
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {moneyLabel ? <p className="mr-1 text-sm font-extrabold tabular-nums">{moneyLabel}</p> : null}
          {acts.map((act) => {
            const Icon = ACT_ICON[act.label];
            const inner = (
              <>
                {Icon ? <Icon className="size-4" /> : null}
                {act.label}
              </>
            );
            const cls = "inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold";
            if (act.menu) {
              const open = openMenu === act.label;
              return (
                <div key={act.label} className="relative">
                  <button type="button" onClick={() => setOpenMenu(open ? null : act.label)} className={cn(cls, "border border-line bg-card hover:border-navy")}>
                    {inner}
                  </button>
                  {open ? (
                    <div className="absolute top-11 right-0 z-20 min-w-40 rounded-md border border-line bg-card py-1 shadow-sm">
                      {act.menu.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                          onClick={() => {
                            item.onClick?.();
                            setOpenMenu(null);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }
            if (act.opens === "thread") {
              return (
                <button key={act.label} type="button" onClick={onText} className={cn(cls, "bg-navy text-card")}>
                  {inner}
                </button>
              );
            }
            if (act.onClick) {
              return (
                <button key={act.label} type="button" onClick={act.onClick} className={cn(cls, "border border-line hover:border-navy")}>
                  {inner}
                </button>
              );
            }
            if (act.href) {
              return (
                <a key={act.label} href={act.href} className={cn(cls, "border border-line hover:border-navy")}>
                  {inner}
                </a>
              );
            }
            return (
              <button key={act.label} type="button" className={cn(cls, "border border-line hover:border-navy")}>
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
