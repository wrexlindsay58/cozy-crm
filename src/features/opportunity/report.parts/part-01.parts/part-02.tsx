import type { CostSlice } from "@/features/assessment/figures";
import { money } from "@/lib/crm-data";

export function CostDonut({ slices }: { slices: CostSlice[] }) {
  const mids = slices.map((slice) => (slice.low + slice.high) / 2);
  const total = mids.reduce((sum, n) => sum + n, 0) || 1;
  const radius = 42;
  const turn = 2 * Math.PI * radius;
  let offset = 0;
  const biggest = Math.max(...mids);
  return (
    <div className="relative mx-auto mt-2 size-44">
      <svg viewBox="0 0 120 120" className="size-full">
        {mids.map((mid, index) => {
          const length = (mid / total) * turn;
          const node = (
            <circle
              key={slices[index].id}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              strokeDasharray={`${length} ${turn - length}`}
              strokeDashoffset={-offset}
              className={mid === biggest ? "text-alert" : "text-[var(--cozy)]"}
              opacity={mid === biggest ? 1 : 0.28 + (index % 3) * 0.18}
              transform="rotate(-90 60 60)"
            />
          );
          offset += length;
          return node;
        })}
      </svg>
      <p className="absolute inset-0 grid place-content-center text-center">
        <span className="text-sm font-semibold">{money(Math.round(total))}</span>
        <span className="text-[10px] text-muted">/ month</span>
      </p>
    </div>
  );
}
