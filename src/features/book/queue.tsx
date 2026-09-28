import { useLayoutEffect, useRef, useState, type DragEvent } from "react";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { hourOf } from "./time";
import { assignedIds, type BookEvent as E } from "./types";
import type { Resource } from "./roster";
import { QueueCard, clockNow, looseOn, share } from "./queue-bits";

export function UnassignedQueue({
  day,
  events,
  resources = [],
  selectedId,
  onSelect,
  onMove,
  phone,
}: {
  day: string;
  events: E[];
  resources?: Resource[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, resourceId: string, start: string) => void;
  phone?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const now = clockNow();
  const dayEvents = events.filter((e) => e.start.slice(0, 10) === day && e.type !== "Block" && e.type !== "Time-off" && e.type !== "Office");
  const loose = looseOn(events, day).slice().sort((a, b) => a.start.localeCompare(b.start));
  const live = dayEvents.filter((e) => assignedIds(e).length > 0 && hourOf(e.start) <= now && hourOf(e.end) > now).sort((a, b) => a.start.localeCompare(b.start));
  const route = dayEvents.filter((e) => e.status === "Dispatched" && hourOf(e.start) > now).sort((a, b) => a.start.localeCompare(b.start));
  const groups = [
    { id: "open", title: "Unassigned", items: loose, assign: true },
    { id: "now", title: "Happening now", items: live, assign: false },
    { id: "route", title: "In Route", items: route, assign: false },
  ].filter((g) => g.items.length > 0);
  const badge = groups.reduce((n, g) => n + g.items.length, 0);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [heights, setHeights] = useState<number[] | null>(null);
  const stackKey = groups.map((g) => `${g.id}:${g.items.map((e) => e.id).join(",")}`).join("|");

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    function measure() {
      const box = panelRef.current;
      if (!box) return;
      const contents = groups.map((_, i) => (bodyRefs.current[i]?.scrollHeight ?? 0) + 33);
      const next = share(box.clientHeight, contents);
      const used = next.reduce((sum, n) => sum + n, 0);
      if (next.length && box.clientHeight - used > 1) next[next.length - 1] += box.clientHeight - used;
      setHeights((prev) => (prev && prev.length === next.length && prev.every((n, i) => Math.abs(n - next[i]) < 1) ? prev : next));
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    return () => ro.disconnect();
  }, [stackKey, phone]);

  function take(ev: DragEvent) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/book-id");
    const hit = events.find((e) => e.id === id);
    if (hit) onMove(id, "", hit.start);
  }

  const list = (
    <div ref={panelRef} className="flex min-h-0 flex-1 flex-col bg-card" onDragOver={(e) => e.preventDefault()} onDrop={take}>
      {groups.map((g, i) => (
        <section
          key={g.id}
          style={heights?.[i] ? { height: heights[i], flex: "none" } : undefined}
          className="flex min-h-0 shrink-0 flex-col overflow-hidden border-b border-line last:border-b-0"
        >
          <div className="flex h-8 shrink-0 items-center gap-2 border-b border-line px-2">
            <p className="truncate text-[12px] font-bold">{g.title}</p>
            <span className="grid h-5 min-w-5 place-items-center rounded-md bg-navy px-1 text-[11px] font-bold text-card">{g.items.length}</span>
            {phone && i === 0 ? (
              <button type="button" aria-label="Close" className="ml-auto grid size-7 place-items-center" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <div data-cards className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain">
            <div ref={(node) => { bodyRefs.current[i] = node; }} className="flex flex-col gap-1.5 p-1.5">
            {g.items.map((e) => (
              <QueueCard key={e.id} e={e} selected={selectedId === e.id} drag={!phone && g.assign} assign={Boolean(phone && g.assign)} people={resources} onMove={onMove} onSelect={() => onSelect(e.id)} />
            ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );

  if (!phone) return <aside className="absolute inset-y-0 right-0 flex w-64 flex-col overflow-hidden border-l border-line bg-card">{list}</aside>;

  return (
    <>
      <button
        type="button"
        aria-label="Unassigned"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("absolute top-16 z-40 flex w-7 flex-col items-center gap-0.5 rounded-l-md bg-navy py-2 text-card shadow-sm", open ? "right-64" : "right-0")}
      >
        <ChevronLeft className={cn("size-3.5", open && "rotate-180")} />
        <span className="text-[11px] font-bold tabular-nums">{badge}</span>
      </button>
      {open ? <aside className="fixed top-14 right-0 bottom-0 z-40 flex w-64 flex-col overflow-hidden overscroll-contain border-l border-line bg-card shadow-sm">{list}</aside> : null}
    </>
  );
}
