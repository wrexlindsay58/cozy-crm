import { PopPie, MixTrack } from "./bits-02";
import { MixTabs } from "./bits-03";
import { mixValue, mixLabel } from "./bits-04";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";

export function VSalesDashboard07({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { pay, payHover, payView, setPayHover, setPayView, setSourceView, sourceMax, sourceRows, sourceView, t } = bag;
  return (
    <>
<section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-2">
        <article className="flex h-full flex-col bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[13px] font-bold">Payment</h3>
              <p className="text-[12px] text-muted">Cash includes check. Mixed deals are split.</p>
            </div>
            <MixTabs value={payView} onChange={setPayView} />
          </div>
          <div className="flex flex-1 items-center gap-5">
            <div className="relative size-44 shrink-0 sm:size-52">
              <PopPie
                data={pay}
                dataKey={payView === "dollars" ? "amount" : "qty"}
                inner="52%"
                outer="84%"
                active={payHover}
                onActive={setPayHover}
                formatter={(v) => (payView === "dollars" ? money(v) : v)}
              />
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5 text-[12px]">
              {pay.map((p, i) => (
                <li
                  key={p.name}
                  className={cn("-mx-1 flex items-center justify-between gap-3 rounded-sm px-1 py-0.5", payHover === i && "bg-page")}
                  onMouseEnter={() => setPayHover(i)}
                  onMouseLeave={() => setPayHover(undefined)}
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <i className="size-2.5 shrink-0 rounded-sm" style={{ background: p.fill }} />
                    <span className="truncate">{p.name}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums">
                    <span className="text-right font-semibold">{mixLabel(payView, p.amount, p.qty)}</span>
                    <span className="w-10 text-right text-muted">{t.deals ? Math.round((p.qty / t.deals) * 100) : 0}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </article>
        <article className="bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[13px] font-bold">Lead source</h3>
              <p className="text-[12px] text-muted">Share of leads and sold</p>
            </div>
            <MixTabs value={sourceView} onChange={setSourceView} />
          </div>
          <ul className="space-y-2.5 hover:[&>li]:opacity-40 hover:[&>li:hover]:opacity-100">
            {sourceRows.map((s) => {
              const v = mixValue(sourceView, s.amount, s.qty);
              const leadPct = t.leads ? Math.round((s.leads / t.leads) * 100) : 0;
              const soldPct = t.sold ? Math.round((s.sold / t.sold) * 100) : 0;
              return (
                <li key={s.name} className="group transition-opacity duration-150">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <i className="size-2.5 rounded-sm" style={{ background: s.fill }} />
                      {s.name}
                    </span>
                    <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums text-muted">
                      <span className="text-right">{mixLabel(sourceView, s.amount, s.qty)}</span>
                      <span className="w-10 text-right">{sourceView === "dollars" ? `${soldPct}%` : `${leadPct}%`}</span>
                    </span>
                  </div>
                  <MixTrack pct={(v / sourceMax) * 100} fill={s.fill} />
                </li>
              );
            })}
          </ul>
        </article>
      </section>
    </>
  );
}
