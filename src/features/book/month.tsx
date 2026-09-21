import { cn } from "@/lib/cn";
import { monthGrid } from "./time";
import { TYPE_TONE } from "./tone";
import type { BookEvent } from "./types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthGrid({
  events,
  selectedDay,
  onDay,
}: {
  events: BookEvent[];
  selectedDay: number;
  onDay: (d: number) => void;
}) {
  const cells = monthGrid();
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">
      <div className="grid grid-cols-7 text-center text-[11px] font-bold tracking-wide text-muted uppercase max-md:text-[10px] max-md:tracking-normal">
        {DAYS.map((d) => (
          <span key={d} className="py-1 max-md:px-0">
            {d.slice(0, 1)}
            <span className="max-md:hidden">{d.slice(1)}</span>
          </span>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="min-h-20 max-md:min-h-14" />;
          const marks = events.filter((e) => Number(e.start.slice(8, 10)) === d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => onDay(d)}
              className={cn("min-h-20 rounded-md p-2 text-left max-md:min-h-14 max-md:p-1", d === selectedDay ? "bg-navy text-card" : "bg-card border border-line")}
            >
              <span className="text-[13px] font-bold">{d}</span>
              <div className="mt-1 space-y-0.5 max-md:mt-1 max-md:flex max-md:flex-wrap max-md:gap-0.5 max-md:space-y-0">
                {marks.slice(0, 3).map((m) => (
                  <p
                    key={m.id}
                    className={cn("truncate rounded-sm px-1 text-[11px] leading-5 max-md:hidden", d === selectedDay ? "bg-card/20 text-card" : "text-ink")}
                    style={d === selectedDay ? undefined : { background: TYPE_TONE[m.type]?.bg }}
                  >
                    {m.title.split(" ")[0]} · {m.type}
                  </p>
                ))}
                {marks.slice(0, 4).map((m) => (
                  <i
                    key={`dot-${m.id}`}
                    className="hidden size-1.5 rounded-full max-md:inline-block"
                    style={{ background: d === selectedDay ? "var(--color-card)" : TYPE_TONE[m.type]?.bar ?? "var(--color-navy)" }}
                    aria-hidden
                  />
                ))}
                {marks.length > 3 ? <p className="text-[11px] opacity-70 max-md:hidden">+{marks.length - 3}</p> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
