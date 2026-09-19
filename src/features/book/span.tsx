import { EventChip } from "./chip";
import { pack, packStyle } from "./layout";
import { addDays, hourOf, isoFromDateHour, toIso } from "./time";
import type { BookEvent } from "./types";

const ROW = 48;

export function DaySpan({
  start,
  days,
  hours,
  events,
  selectedId,
  onSelect,
  onSlot,
  onMove,
}: {
  start: Date;
  days: number;
  hours: number[];
  events: BookEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSlot: (resourceId: string, start: string) => void;
  onMove: (id: string, resourceId: string, start: string) => void;
}) {
  const startH = hours[0] ?? 7;
  const height = hours.length * ROW;
  const cols = Array.from({ length: days }, (_, i) => addDays(start, i));

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div
        className="min-w-full"
        style={{
          display: "grid",
          minWidth: `max(100%, calc(3rem + ${cols.length} * 12rem))`,
          gridTemplateColumns: `3rem repeat(${cols.length}, minmax(12rem, 1fr))`,
          gridTemplateRows: `3rem ${height}px`,
        }}
      >
        <div className="sticky top-0 left-0 z-50 border-b border-r border-line bg-card" />
        {cols.map((d) => (
          <div key={toIso(d).slice(0, 10)} className="sticky top-0 z-40 flex flex-col justify-center border-b border-r border-line bg-card px-2">
            <p className="text-[12px] font-semibold">{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
            <p className="text-[11px] text-muted">{d.getDate()}</p>
          </div>
        ))}
        <div className="sticky left-0 z-30 border-r border-line bg-card">
          <div className="relative" style={{ height }}>
            {hours.map((h, i) => (
              <div key={h} className="absolute inset-x-0 border-b border-line px-1 text-right text-[10px] font-bold text-muted" style={{ top: i * ROW, height: ROW }}>
                {h === 12 ? "12" : h > 12 ? `${h - 12}p` : `${h}a`}
              </div>
            ))}
          </div>
        </div>
        {cols.map((d) => {
          const key = toIso(d).slice(0, 10);
          const mine = events.filter((e) => e.start.slice(0, 10) === key);
          return (
            <div key={key} className="relative z-0 isolate overflow-hidden border-r border-line bg-page">
              {hours.map((h, i) => (
                <button
                  key={h}
                  type="button"
                  className="absolute inset-x-0 border-b border-line/80"
                  style={{ top: i * ROW, height: ROW }}
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
                const top = Math.max(0, (hourOf(p.e.start) - startH) * ROW + 2);
                const hrs = Math.max(0.45, hourOf(p.e.end) - hourOf(p.e.start));
                return (
                  <div key={p.e.id} style={packStyle(p, top, hrs * ROW - 4)}>
                    <EventChip e={p.e} selected={selectedId === p.e.id} thin={p.cols >= 3 || hrs * ROW < 40} onClick={() => onSelect(p.e.id)} />
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
