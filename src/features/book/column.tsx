import type { DragEvent } from "react";
import { EventChip } from "./chip";
import { driveLegs } from "./drive";
import { pack, packStyle } from "./layout";
import type { Resource } from "./roster";
import { hourOf } from "./time";
import { assignedIds, type BookEvent as E } from "./types";

export function DayColumn({
  u,
  day,
  events,
  row,
  startH,
  hours,
  selectedId,
  onSelect,
  onSlot,
  onDropHour,
}: {
  u: Resource;
  day: string;
  events: E[];
  row: number;
  startH: number;
  hours: number[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSlot: (resourceId: string, start: string) => void;
  onDropHour: (resourceId: string, hour: number, ev: DragEvent) => void;
}) {
  const mine = events.filter((e) => assignedIds(e).includes(u.id) && e.start.slice(0, 10) === day);
  const legs = driveLegs(mine);
  return (
    <div className="relative z-0 isolate overflow-hidden border-r border-line bg-page">
      {hours.map((h, i) => (
        <button
          key={h}
          type="button"
          onClick={() => onSlot(u.id, `${day}T${String(h).padStart(2, "0")}:00`)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onDropHour(u.id, h, e);
          }}
          className="absolute inset-x-0 border-b border-line/80"
          style={{ top: i * row, height: row }}
          aria-label={`${u.name} ${h}`}
        />
      ))}
      {legs.map((leg) => {
        const top = (hourOf(leg.start) - startH) * row + 2;
        if (top < 0) return null;
        const height = Math.max(22, (leg.minutes / 60) * row - 4);
        return (
          <div key={leg.id} className="absolute right-1 left-1 z-0 flex flex-col overflow-hidden rounded-md border border-line bg-white px-1.5 pt-0.5" style={{ top, height }}>
            <p className="shrink-0 text-[12px] font-semibold leading-4 text-navy">Drive</p>
            <div className="min-h-0 flex-1 overflow-hidden">
              <p className="truncate text-[10px] leading-4 text-muted">
                {leg.minutes} min · {leg.miles} mi
              </p>
            </div>
          </div>
        );
      })}
      {pack(mine).map((p) => {
        const top = Math.max(0, (hourOf(p.e.start) - startH) * row + 2);
        const hrs = Math.max(0.45, hourOf(p.e.end) - hourOf(p.e.start));
        return (
          <div key={p.e.id} style={packStyle(p, top, hrs * row - 4)}>
            <EventChip e={p.e} selected={selectedId === p.e.id} thin={p.cols >= 3 || hrs * row < 40} drag onClick={() => onSelect(p.e.id)} />
          </div>
        );
      })}
    </div>
  );
}
