import { tip } from "./bits-01";
import { popBar, MixTrack } from "./bits-02";
import { MixTabs } from "./bits-03";
import { mixValue, mixLabel } from "./bits-04";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { Bar, BarChart, Cell as RCell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";

export function VSalesDashboard06({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { officeHover, officeView, offices, productView, products, setOfficeHover, setOfficeView, setOpen, setProductView, t } = bag;
  return (
    <>
<section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-2">
        <article className="bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-bold">Product</h3>
            <MixTabs value={productView} onChange={setProductView} />
          </div>
          <div className="space-y-2 hover:[&>button]:opacity-40 hover:[&>button:hover]:opacity-100">
            {products.map((p) => {
              const max = Math.max(...products.map((x) => mixValue(productView, x.amount, x.qty)), 1);
              const v = mixValue(productView, p.amount, p.qty);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setOpen("sold")}
                  className="group grid w-full grid-cols-[minmax(4.5rem,7.5rem)_minmax(3rem,1fr)_auto] items-center gap-2 text-left text-[13px] transition-opacity duration-150"
                >
                  <span className="truncate">{p.name}</span>
                  <span>
                    <MixTrack pct={(v / max) * 100} />
                  </span>
                  <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums">
                    <span className="text-right font-bold">{mixLabel(productView, p.amount, p.qty)}</span>
                    <span className="hidden w-10 text-right font-normal text-muted md:inline">
                      {productView === "qty"
                        ? `${t.deals ? Math.round((p.qty / t.deals) * 100) : 0}%`
                        : `${t.sold ? Math.round((p.amount / t.sold) * 100) : 0}%`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </article>
        <article className="bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-bold">Office</h3>
            <MixTabs value={officeView} onChange={setOfficeView} />
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={offices.map((o) => ({
                  name: o.short,
                  value: mixValue(officeView, o.amount, o.qty),
                  fill: o.fill,
                }))}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
                onMouseMove={(state) => {
                  const i = state?.activeTooltipIndex;
                  setOfficeHover(typeof i === "number" ? i : undefined);
                }}
                onMouseLeave={() => setOfficeHover(undefined)}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-faint)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  {...tip}
                  cursor={{ fill: "var(--color-page)", opacity: 0.65 }}
                  formatter={(v: number) => (officeView === "dollars" ? money(v) : v)}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} cursor="pointer" activeBar={popBar} isAnimationActive={false}>
                  {offices.map((o, i) => (
                    <RCell key={o.name} fill={o.fill} opacity={officeHover == null || officeHover === i ? 1 : 0.32} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-[12px]">
            {offices.map((o, i) => (
              <li
                key={o.name}
                className={cn("-mx-1 flex items-center justify-between gap-2 rounded-sm px-1 py-0.5", officeHover === i && "bg-page")}
                onMouseEnter={() => setOfficeHover(i)}
                onMouseLeave={() => setOfficeHover(undefined)}
              >
                <span className="inline-flex items-center gap-1.5">
                  <i className="size-2 rounded-sm" style={{ background: o.fill }} />
                  {o.short}
                </span>
                <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums">
                  <span className="text-right">{mixLabel(officeView, o.amount, o.qty)}</span>
                  <span className="w-10 text-right text-muted">{t.sold ? Math.round((o.amount / t.sold) * 100) : 0}%</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
