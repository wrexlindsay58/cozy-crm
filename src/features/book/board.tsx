import { useEffect, useRef, type DragEvent } from "react";
import { EventChip } from "./chip";
import { pack, packStyle } from "./layout";
import { hoursFor, type Resource } from "./roster";
import { loadHours } from "./store";
import { hourOf } from "./time";
import { assignedIds, type BookEvent as E } from "./types";

const ROW = 52;
const COL = "minmax(10rem, 1fr)";

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
  const height = hours.length * ROW;
  const startH = hours[0] ?? 7;
  const cols = [{ id: "", name: "Unassigned", kind: "office" as const, office: "PHX" as const, role: "Office" }, ...resources];
  const gutter = phone ? "2.25rem" : "3rem";
  const namesWidth = `max(100%, calc(${cols.length} * 10rem))`;
  const minWidth = `max(100%, calc(${gutter} + ${cols.length} * 10rem))`;
  const gridCols = `${gutter} repeat(${cols.length}, ${COL})`;
  const namesCols = `repeat(${cols.length}, ${COL})`;
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 overflow-hidden border-b border-line bg-card">
        <div className="shrink-0 border-r border-line bg-card" style={{ width: gutter }} />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div ref={namesRef} className="grid h-12 will-change-transform" style={{ minWidth: namesWidth, gridTemplateColumns: namesCols }}>
            {cols.map((u) => {
              const load = loadHours(events, u.id, day);
              return (
                <div key={u.id || "none"} className="flex flex-col justify-center border-r border-line px-2">
                  <p className="truncate text-[12px] font-semibold">{u.name}</p>
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
          className="grid min-w-full"
          style={{
            minWidth,
            gridTemplateColumns: gridCols,
            gridTemplateRows: `${height}px`,
          }}
        >
          <div className="sticky left-0 z-10 border-r border-line bg-card">
            <div className="relative" style={{ height }}>
              {hours.map((h, i) => (
                <div key={h} className="absolute inset-x-0 border-b border-line px-1 text-right text-[10px] font-bold text-muted" style={{ top: i * ROW, height: ROW }}>
                  {h === 12 ? "12" : h > 12 ? `${h - 12}p` : `${h}a`}
                </div>
              ))}
            </div>
          </div>
          {cols.map((u) => {
            const mine = events.filter((e) => assignedIds(e).includes(u.id) && e.start.slice(0, 10) === day);
            return (
              <div key={u.id || "none"} className="relative z-0 isolate overflow-hidden border-r border-line bg-page">
                {hours.map((h, i) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onSlot(u.id, `${day}T${String(h).padStart(2, "0")}:00`)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      drop(u.id, h, e);
                    }}
                    className="absolute inset-x-0 border-b border-line/80"
                    style={{ top: i * ROW, height: ROW }}
                    aria-label={`${u.name} ${h}`}
                  />
                ))}
                {pack(mine).map((p) => {
                  const top = Math.max(0, (hourOf(p.e.start) - startH) * ROW + 2);
                  const hrs = Math.max(0.45, hourOf(p.e.end) - hourOf(p.e.start));
                  return (
                    <div key={p.e.id} style={packStyle(p, top, hrs * ROW - 4)}>
                      <EventChip e={p.e} selected={selectedId === p.e.id} thin={p.cols >= 3 || hrs * ROW < 40} drag={!phone} onClick={() => onSelect(p.e.id)} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
