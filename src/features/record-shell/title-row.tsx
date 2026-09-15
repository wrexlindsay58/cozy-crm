import { useState } from "react";
import { cn } from "@/lib/cn";
import type { RecordAct, RecordKind, RecordLink } from "./types";

const KIND_LABEL: Record<RecordKind, string> = {
  lead: "Lead",
  assessment: "Assessment",
  opportunity: "Opportunity",
  job: "Job",
  account: "Account",
};

export function TitleRow({
  kind,
  title,
  subtitle,
  stage,
  moneyLabel,
  related,
  acts,
  onText,
}: {
  kind: RecordKind;
  title: string;
  subtitle: string;
  stage: string;
  moneyLabel?: string;
  related?: RecordLink[];
  acts: RecordAct[];
  onText: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="border-b border-line bg-card px-4 py-3 md:px-5">
      <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        {KIND_LABEL[kind]}
        {related?.map((r) => (
          <a key={r.href} href={r.href} className="ml-2 font-semibold tracking-normal text-navy normal-case">
            {r.label}
          </a>
        ))}
      </p>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{stage}</p>
          {moneyLabel ? <p className="text-lg font-extrabold tabular-nums">{moneyLabel}</p> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {acts.map((act) => {
          if (act.menu) {
            const open = openMenu === act.label;
            return (
              <div key={act.label} className="relative">
                <button type="button" onClick={() => setOpenMenu(open ? null : act.label)} className="h-9 rounded-md border border-line bg-card px-3 text-sm font-semibold hover:border-navy">
                  {act.label}
                </button>
                {open ? (
                  <div className="absolute top-10 left-0 z-20 min-w-40 rounded-md border border-line bg-card py-1 shadow-sm">
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
              <button key={act.label} type="button" onClick={onText} className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">
                {act.label}
              </button>
            );
          }
          if (act.onClick) {
            return (
              <button key={act.label} type="button" onClick={act.onClick} className="h-9 rounded-md border border-line px-3 text-sm font-semibold hover:border-navy">
                {act.label}
              </button>
            );
          }
          if (act.href) {
            return (
              <a key={act.label} href={act.href} className="grid h-9 place-items-center rounded-md border border-line px-3 text-sm font-semibold hover:border-navy">
                {act.label}
              </a>
            );
          }
          return (
            <button key={act.label} type="button" className="h-9 rounded-md border border-line px-3 text-sm font-semibold hover:border-navy">
              {act.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
