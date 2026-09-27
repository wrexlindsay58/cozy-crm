import { MixView, tip } from "./bits-01";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { Tip } from "@/components/tip";

export function Spark({ data, moneyBars }: { data: { label: string; now: number; prior: number }[]; moneyBars: boolean }) {
  return (
    <div className="mt-auto h-16 pt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
          <Tooltip {...tip} formatter={(v: number) => (moneyBars ? money(v) : v)} />
          <Line type="monotone" dataKey="prior" stroke="var(--color-line-strong)" strokeWidth={1.5} dot={false} activeDot={false} isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="now"
            stroke="var(--color-muted)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: "var(--color-navy)", stroke: "var(--color-card)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TargetBar({ now, target }: { now: number; target: number }) {
  const cap = Math.max(target, now, 1) * 1.15;
  const nowPct = Math.min(100, (now / cap) * 100);
  const goalPct = Math.min(98, Math.max(2, (target / cap) * 100));
  const ofTarget = target ? Math.round((now / target) * 100) : 0;
  return (
    <div className="mt-auto flex h-16 flex-col justify-end gap-1.5 pt-3">
      <p className="flex items-baseline justify-between gap-2 text-[11px]">
        <span>
          <span className="font-semibold tabular-nums">{ofTarget}%</span>
          <span className="text-muted"> of target</span>
        </span>
        <span className="font-semibold tabular-nums">{money(target)}</span>
      </p>
      <span className="relative block h-2 w-full rounded-full bg-page">
        <i className="absolute inset-y-0 left-0 rounded-full bg-navy" style={{ width: `${nowPct}%` }} />
        <i className="absolute top-[-4px] h-4 w-0.5 rounded-full bg-muted" style={{ left: `${goalPct}%` }} />
      </span>
    </div>
  );
}

export function avgComm(truePct: number) {
  const cut = Math.ceil((truePct / 2.5) * 10) / 10;
  return Math.max(0, Math.round((20 - cut) * 10) / 10);
}

export function Medal({ place }: { place: number }) {
  if (place > 3) return <span className="w-5 text-center text-[13px] font-bold text-muted">{place}</span>;
  const fill = place === 1 ? "#C4A35A" : place === 2 ? "#8AA0AB" : "#A67C52";
  return (
    <span className="inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-card" style={{ background: fill }} aria-label={`${place}`}>
      {place}
    </span>
  );
}

export function MixTabs({ value, onChange }: { value: MixView; onChange: (v: MixView) => void }) {
  return (
    <div className="flex rounded-md bg-page p-0.5">
      <Tip label="Dollars" on>
        <button
          type="button"
          aria-label="Dollars"
          onClick={() => onChange("dollars")}
          className={cn("grid size-7 place-items-center rounded-sm text-[12px] font-semibold", value === "dollars" ? "bg-card text-ink" : "text-muted")}
        >
          $
        </button>
      </Tip>
      <Tip label="Quantity" on>
        <button
          type="button"
          aria-label="Quantity"
          onClick={() => onChange("qty")}
          className={cn("grid size-7 place-items-center rounded-sm", value === "qty" ? "bg-card text-ink" : "text-muted")}
        >
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
            <path fill="currentColor" d="M3 2.5h2.2V4.7H3zm4.2 0H13v2.2H7.2zM3 6.9h2.2v2.2H3zm4.2 0H13v2.2H7.2zM3 11.3h2.2v2.2H3zm4.2 0H13v2.2H7.2z" />
          </svg>
        </button>
      </Tip>
    </div>
  );
}
