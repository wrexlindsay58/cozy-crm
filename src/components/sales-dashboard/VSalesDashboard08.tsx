import { tip } from "./bits-01";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "@/lib/crm-data";

export function VSalesDashboard08({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { moneyBars, t } = bag;
  return (
    <>
<section className="rounded-md bg-card p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-[13px] font-bold">{t.barTitle}</h3>
          <ul className="flex gap-4 text-[12px]">
            <li className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-muted" /> This period
            </li>
            <li className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-line-strong" /> {t.vs}
            </li>
          </ul>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={t.bars} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="4 8" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-faint)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tip} formatter={(v: number) => (moneyBars ? money(v) : v)} />
              <Line type="monotone" dataKey="prior" stroke="var(--color-line-strong)" strokeWidth={2} dot={false} isAnimationActive={false} activeDot={{ r: 4, fill: "var(--color-line-strong)", stroke: "var(--color-card)", strokeWidth: 2 }} />
              <Line
                type="monotone"
                dataKey="now"
                stroke="var(--color-muted)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-muted)", strokeWidth: 0 }}
                isAnimationActive={false}
                activeDot={{ r: 6, fill: "var(--color-navy)", stroke: "var(--color-card)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
