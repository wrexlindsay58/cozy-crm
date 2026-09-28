import { useEffect, useRef, type DragEvent } from "react";
import { DayColumn } from "./column";
import { loadHours } from "./store";
import { TODAY, toIso } from "./time";
import { UnassignedQueue } from "./queue";
import { assignedIds, type BookEvent as E } from "./types";
import { hoursFor, type Resource } from "./roster";

const ROW = 52;
const PHONE_ROW = 48;
const COL_MIN = "10rem";
const PHONE_COL = "7.25rem";

function phoenixHour() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h + m / 60;
}

export function ResourceBoard({
  day,
  resources,
  events,
  selectedId,
  onSelect,
  onSlot,
  onMove,
  phone,
}: {
  day: string;
  resources: Resource[];
  events: E[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSlot: (resourceId: string, start: string) => void;
  onMove: (id: string, resourceId: string, start: string) => void;
  phone?: boolean;
}) {
  const hours = hoursFor(resources.length ? resources : [{ kind: "closer" } as Resource]);
  const row = phone ? PHONE_ROW : ROW;
  const colMin = phone ? PHONE_COL : COL_MIN;
  const height = hours.length * row;
  const startH = hours[0] ?? 7;
  const cols = resources;
  const gutter = phone ? "calc(2.25rem - 3px)" : "3rem";
  const namesWidth = `max(100%, calc(${cols.length} * ${colMin}))`;
  const minWidth = `max(100%, calc(${gutter} + ${cols.length} * ${colMin}))`;
  const gridCols = `${gutter} repeat(${cols.length}, minmax(${colMin}, 1fr))`;
  const namesCols = `repeat(${cols.length}, minmax(${colMin}, 1fr))`;
  const nowTop = day === toIso(TODAY).slice(0, 10) ? phoenixHour() : null;
  const bodyRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    const names = namesRef.current;
    if (!body || !names) return;
    const pane = body;
    const strip = names;
    let frame = 0;
    let x = 0;
    function onScroll() {
      x = pane.scrollLeft;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        strip.style.transform = `translate3d(${-x}px,0,0)`;
      });
    }
    pane.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      pane.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [cols.length, minWidth]);

  function drop(resourceId: string, hour: number, ev: DragEvent) {
    const id = ev.dataTransfer.getData("text/book-id");
    if (!id) return;
    const start = `${day}T${String(Math.floor(hour)).padStart(2, "0")}:00`;
    onMove(id, resourceId, start);
  }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 overflow-hidden border-b border-line bg-card">
        <div className="shrink-0 border-r border-line bg-card" style={{ width: gutter }} />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div ref={namesRef} className="grid h-12 will-change-transform" style={{ minWidth: namesWidth, gridTemplateColumns: namesCols }}>
            {cols.map((u) => {
              const load = loadHours(events, u.id, day);
              const count = events.filter((e) => assignedIds(e).includes(u.id) && e.start.slice(0, 10) === day).length;
              return (
                <div key={u.id || "none"} className="flex flex-col justify-center border-r border-line px-2">
                  <div className="flex min-w-0 items-baseline gap-1">
                    <p className="min-w-0 flex-1 truncate text-[12px] font-semibold">{u.name}</p>
                    <p className="shrink-0 text-[11px] font-bold tabular-nums">{count}</p>
                  </div>
                  <p className="text-[10px] text-muted">{load ? `${load.toFixed(1)}h` : "Open"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        ref={bodyRef}
        className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
      >
        <div
          className="relative grid min-w-full"
          style={{
            minWidth,
            gridTemplateColumns: gridCols,
            gridTemplateRows: `${height}px`,
          }}
        >
          {nowTop != null && nowTop >= startH && nowTop < startH + hours.length ? (
            <div className="pointer-events-none absolute right-0 left-0 z-20 h-0.5 bg-navy" style={{ top: (nowTop - startH) * row }} />
          ) : null}
          <div className="sticky left-0 z-10 border-r border-line bg-card">
            <div className="relative" style={{ height }}>
              {hours.map((h, i) => (
                <div key={h} className="absolute inset-x-0 border-b border-line px-1 text-right text-[10px] font-bold text-muted" style={{ top: i * row, height: row }}>
                  {h === 12 ? "12" : h > 12 ? `${h - 12}p` : `${h}a`}
                </div>
              ))}
            </div>
          </div>
          {cols.map((u) => (
            <DayColumn key={u.id || "none"} u={u} day={day} events={events} row={row} startH={startH} hours={hours} selectedId={selectedId} onSelect={onSelect} onSlot={onSlot} onDropHour={drop} />
          ))}
        </div>
      </div>
      </div>
      {phone ? <UnassignedQueue day={day} events={events} resources={resources} selectedId={selectedId} onSelect={onSelect} onMove={onMove} phone /> : null}
    </div>
  );
}
