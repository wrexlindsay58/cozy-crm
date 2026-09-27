import { addDays, isoFromDateHour, labelTime, toIso } from "../time";
import type { BookEvent } from "../types";
import { DaySpanView } from "./part-02";

export function DaySpan({
  start,
  days,
  hours,
  events,
  selectedId,
  onSelect,
  onSlot,
  onMove,
  phone,
}: {
  start: Date;
  days: number;
  hours: number[];
  events: BookEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSlot: (resourceId: string, start: string) => void;
  onMove: (id: string, resourceId: string, start: string) => void;
  phone?: boolean;
}) {
  const cols = Array.from({ length: days }, (_, i) => addDays(start, i));
  if (phone && days > 3) {
    return (
      <div className="min-h-0 flex-1 overflow-auto bg-card">
        {cols.map((d) => {
          const key = toIso(d).slice(0, 10);
          const mine = events
            .filter((e) => e.start.slice(0, 10) === key)
            .slice()
            .sort((a, b) => a.start.localeCompare(b.start));
          return (
            <section key={key} className="border-b border-line">
              <header className="sticky top-0 z-10 flex items-baseline gap-2 border-b border-line bg-card px-3 py-2">
                <p className="text-sm font-bold">{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
                <p className="text-[13px] text-muted">
                  {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </header>
              {mine.length === 0 ? (
                <button
                  type="button"
                  className="block w-full px-3 py-3 text-left text-sm text-muted"
                  onClick={() => onSlot("", isoFromDateHour(d, hours[0] ?? 8))}
                >
                  Open
                </button>
              ) : (
                <ul>
                  {mine.map((e) => (
                    <li key={e.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        onClick={() => onSelect(e.id)}
                        className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
                      >
                        <span className="w-14 shrink-0 text-[12px] font-semibold tabular-nums text-muted">
                          {labelTime(e.start)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{e.blank ? e.title || "Open slot" : e.title}</span>
                          <span className="mt-0.5 block truncate text-[12px] text-muted">
                            {e.type}
                            {e.city ? ` · ${e.city}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    );
  }

  const startH = hours[0] ?? 7;
  const span = Math.max(1, hours.length);
  const gutter = phone ? "2.25rem" : "3rem";
  const colsTemplate = `${gutter} repeat(${cols.length}, minmax(0, 1fr))`;

  return (
    <DaySpanView bag={{ colsTemplate, cols, hours, span, events, onSlot, onMove, startH, selectedId, onSelect }} />
  );
}
