import type { DragEvent } from "react";
import { cn } from "@/lib/cn";
import { labelTime } from "./time";
import { TYPE_TONE } from "./tone";
import { assignedIds, type BookEvent as E } from "./types";
import { canTake } from "./allow";
import type { Resource } from "./roster";

export function looseOn(events: E[], day: string) {
  return events.filter((e) => e.start.slice(0, 10) === day && assignedIds(e).length === 0);
}

export function share(total: number, contents: number[]) {
  if (!contents.length || total <= 0) return contents;
  const sum = contents.reduce((a, b) => a + b, 0);
  if (sum <= total) {
    const extra = (total - sum) / contents.length;
    return contents.map((n) => n + extra);
  }
  const locked = contents.map(() => false);
  const out = contents.slice();
  for (let pass = 0; pass < contents.length; pass += 1) {
    const free = out.map((_, i) => i).filter((i) => !locked[i]);
    const used = out.reduce((a, n, i) => a + (locked[i] ? n : 0), 0);
    const room = (total - used) / free.length;
    const fit = free.filter((i) => contents[i] <= room + 1);
    if (!fit.length) {
      free.forEach((i) => {
        out[i] = room;
      });
      break;
    }
    fit.forEach((i) => {
      locked[i] = true;
      out[i] = contents[i];
    });
  }
  return out;
}

export function clockNow() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h + m / 60;
}

export function QueueCard({ e, selected, drag, assign, onSelect, people, onMove }: { e: E; selected: boolean; drag: boolean; assign: boolean; onSelect: () => void; people: Resource[]; onMove: (id: string, resourceId: string, start: string) => void }) {
  const name = e.blank ? e.title || "Open slot" : e.title;
  const tone = TYPE_TONE[e.type] ?? TYPE_TONE.Office;
  return (
    <button
      type="button"
      draggable={drag}
      onDragStart={(ev: DragEvent) => {
        ev.dataTransfer.setData("text/book-id", e.id);
        ev.dataTransfer.effectAllowed = "move";
      }}
      onClick={onSelect}
      style={selected ? undefined : { background: tone.bg, borderColor: tone.bar }}
      className={cn("w-full rounded-md border px-2.5 py-2 text-left", selected && "border-navy bg-navy text-card")}
    >
      <span className="block truncate text-[13px] font-semibold">{name}</span>
      <span className={cn("block text-[11px] font-semibold tabular-nums", selected ? "text-card/80" : "text-navy")}>
        {labelTime(e.start)} – {labelTime(e.end)}
      </span>
      {e.notes ? <span className={cn("mt-0.5 block truncate text-[11px]", selected ? "text-card/70" : "text-muted")}>{e.notes}</span> : null}
      {assign ? (
        <span className="mt-1.5 flex gap-1 overflow-x-auto">
          {people.filter((r) => canTake(e.type, r)).slice(0, 8).map((r) => (
            <button
              key={r.id}
              type="button"
              className="h-7 shrink-0 rounded-md border border-line bg-card px-2 text-[11px] font-semibold text-navy"
              onClick={(ev) => {
                ev.stopPropagation();
                onMove(e.id, r.id, e.start);
              }}
            >
              {r.name.split("—")[0].trim().split(" ")[0]}
            </button>
          ))}
        </span>
      ) : null}
    </button>
  );
}
