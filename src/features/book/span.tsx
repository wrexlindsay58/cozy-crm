import { EventChip } from "./chip";
import { pack } from "./layout";
import { addDays, hourOf, isoFromDateHour, labelTime, toIso } from "./time";
import type { BookEvent } from "./types";

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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card">
      <div className="grid h-12 shrink-0" style={{ gridTemplateColumns: colsTemplate }}>
        <div className="border-r border-b border-line bg-card" />
        {cols.map((d) => (
          <div key={toIso(d).slice(0, 10)} className="flex min-w-0 flex-col justify-center border-r border-b border-line bg-card px-2">
            <p className="truncate text-[12px] font-semibold">{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
            <p className="text-[11px] text-muted">{d.getDate()}</p>
          </div>
        ))}
      </div>
      <div className="grid min-h-0 min-w-0 flex-1" style={{ gridTemplateColumns: colsTemplate }}>
        <div className="relative border-r border-line bg-card">
          {hours.map((h, i) => (
            <div
              key={h}
              className="absolute inset-x-0 border-b border-line px-1 text-right text-[10px] font-bold text-muted"
              style={{ top: `${(i / span) * 100}%`, height: `${100 / span}%` }}
            >
              {h === 12 ? "12" : h > 12 ? `${h - 12}p` : `${h}a`}
            </div>
          ))}
        </div>
        {cols.map((d) => {
          const key = toIso(d).slice(0, 10);
          const mine = events.filter((e) => e.start.slice(0, 10) === key);
          return (
            <div key={key} className="relative z-0 isolate min-w-0 overflow-hidden border-r border-line bg-page">
              {hours.map((h, i) => (
                <button
                  key={h}
                  type="button"
                  className="absolute inset-x-0 border-b border-line/80"
                  style={{ top: `${(i / span) * 100}%`, height: `${100 / span}%` }}
                  onClick={() => onSlot("", isoFromDateHour(d, h))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/book-id");
                    if (id) onMove(id, "", isoFromDateHour(d, h));
                  }}
                  aria-label={key}
                />
              ))}
              {pack(mine).map((p) => {
                const hrs = Math.max(0.45, hourOf(p.e.end) - hourOf(p.e.start));
                const shift = p.cols > 1 ? (p.col / p.cols) * 46 : 0;
                return (
                  <div
                    key={p.e.id}
                    className="absolute"
                    style={{
                      top: `${((hourOf(p.e.start) - startH) / span) * 100}%`,
                      height: `${(hrs / span) * 100}%`,
                      left: `calc(${shift}% + 2px)`,
                      width: `calc(${100 - shift}% - 4px)`,
                      zIndex: 1 + p.col,
                    }}
                  >
                    <EventChip e={p.e} selected={selectedId === p.e.id} thin={p.cols >= 3 || hrs < 1} onClick={() => onSelect(p.e.id)} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
