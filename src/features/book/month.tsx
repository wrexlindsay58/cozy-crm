import { cn } from "@/lib/cn";
import { monthGrid } from "./time";
import { TYPE_TONE } from "./tone";
import type { BookEvent } from "./types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthGrid({
  events,
  selectedDay,
  onDay,
  onEvent,
}: {
  events: BookEvent[];
  selectedDay: number;
  onDay: (d: number) => void;
  onEvent: (id: string) => void;
}) {
  const cells = monthGrid();
  const weeks = cells.length / 7;
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 md:p-4">
      <div className="grid shrink-0 grid-cols-7 text-center text-[11px] font-bold tracking-wide text-muted uppercase max-md:text-[10px] max-md:tracking-normal">
        {DAYS.map((d) => (
          <span key={d} className="py-1 max-md:px-0">
            {d.slice(0, 1)}
            <span className="max-md:hidden">{d.slice(1)}</span>
          </span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 gap-1" style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="min-h-0" />;
          const marks = events.filter((e) => Number(e.start.slice(8, 10)) === d);
          const on = d === selectedDay;
          return (
            <div
              key={d}
              onClick={() => onDay(d)}
              className={cn("flex min-h-0 cursor-pointer flex-col overflow-hidden rounded-md p-1 md:p-2", on ? "bg-navy text-card" : "border border-line bg-card")}
            >
              <span className="shrink-0 text-left text-[13px] font-bold">{d}</span>
              <div className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
                {marks.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEvent(m.id);
                    }}
                    className={cn("block w-full truncate rounded-sm px-1 text-left text-[11px] leading-5", on ? "bg-card/20 text-card" : "text-ink")}
                    style={on ? undefined : { background: TYPE_TONE[m.type]?.bg }}
                  >
                    {m.title.split(" ")[0]} · {m.type}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}