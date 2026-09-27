import { useMemo, useState } from "react";
import type { MapView } from "@/components/dispatch-map";
import { cn } from "@/lib/cn";
import { HEX } from "@/lib/tokens";
import { useBookDay } from "@/features/book/day";
import { toIso } from "@/features/book/time";
import type { BookEvent } from "@/features/book/types";
import { moveBook, useBook } from "@/features/book/store";
import { rollsOn } from "@/features/job/prep";
import { useJobs } from "@/features/job/store";
import { useRoster, type Resource } from "@/features/book/roster";
import { geoOf, isField, pingOf, pinColor } from "@/features/dispatch/geo";
import { initials, clockHour, behind, useStreetPaths } from "./part-01";

export function useDispatchPage() {
  const jobs = useJobs();
  const events = useBook().filter((e) => rollsOn(e.jobId ? jobs[e.jobId] : undefined, e.start.slice(0, 10)));
  const roster = useRoster();
  const cursor = useBookDay();
  const dayKey = toIso(cursor).slice(0, 10);
  const hour = clockHour(cursor);
  const [office, setOffice] = useState<"all" | "PHX" | "DFW">("PHX");
  const [view, setView] = useState<MapView>("base");
  const [selectedId, setSelectedId] = useState<string | null>("marco");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(true);
  const [sheet, setSheet] = useState<"peek" | "open">("peek");
  const [showAll, setShowAll] = useState(true);
  const [toId, setToId] = useState("");
  const here = useMemo(() => roster.filter((r) => office === "all" || r.office === office), [roster, office]);
  const dayJobs = useMemo(
    () => events.filter((e) => e.start.slice(0, 10) === dayKey && (office === "all" || e.office === office) && isField(e)),
    [events, dayKey, office],
  );
  const open = dayJobs.filter((e) => !e.resourceId);
  const selected = selectedId == null ? null : here.find((u) => u.id === selectedId) ?? here[0] ?? null;
  const selectedStops = selected ? dayJobs.filter((e) => e.resourceId === selected.id).sort((a, b) => a.start.localeCompare(b.start)) : [];
  const selectedStop = dayJobs.find((s) => s.id === selectedStopId) ?? selectedStops[0] ?? null;
  const live = here.filter((u) => dayJobs.some((e) => e.resourceId === u.id && e.status === "Dispatched")).length;
  const lateCount = here.filter((u) => behind(dayJobs.filter((e) => e.resourceId === u.id), hour)).length;
  const stopCount = dayJobs.filter((e) => e.resourceId).length;
  const { paths, drive } = useStreetPaths(here, dayJobs);
  const others = selected ? here.filter((u) => u.id !== selected.id) : [];
  const sendTo = others.some((u) => u.id === toId) ? toId : others[0]?.id ?? "";
  const peoplePins = useMemo(
    () =>
      here.map((u) => {
        const mine = dayJobs.filter((e) => e.resourceId === u.id);
        const ping = pingOf(u);
        return {
          id: u.id,
          name: u.name,
          initials: initials(u.name),
          lat: ping.lat,
          lng: ping.lng,
          color: HEX.navy,
          late: behind(mine, hour),
        };
      }),
    [here, dayJobs, hour],
  );
  const houses = useMemo(
    () =>
      dayJobs.filter(isField).map((e) => {
        const g = geoOf(e);
        return { id: e.id, resourceId: e.resourceId, lat: g.lat, lng: g.lng, label: e.title, color: pinColor(e) };
      }),
    [dayJobs],
  );
  const street = selectedStop ? { ...geoOf(selectedStop), name: selectedStop.title, city: selectedStop.city } : selected ? { ...pingOf(selected), name: selected.name, city: "" } : null;
  function pick(id: string) {
    setSelectedId(id);
    setSelectedStopId(null);
    setDrawer(true);
    setShowAll(false);
    setSheet("peek");
  }
  function pickStop(resourceId: string, stopId: string) {
    if (resourceId) setSelectedId(resourceId);
    setSelectedStopId(stopId);
    setDrawer(true);
    setShowAll(false);
    setSheet("peek");
  }
  return { dayJobs, events, selected, selectedStops, dayKey, toId, here, view, setView, office, setOffice, roster, setSelectedId, setSelectedStopId, setDrawer, setSheet, cursor, showAll, setShowAll, open, hour, drive, live, lateCount, stopCount, peoplePins, houses, paths, selectedStopId, drawer, sheet, street, sendTo, setToId, others, pick, pickStop };
}

export function StopRow({
  s,
  n,
  people,
  activeId,
  warn,
  onPick,
}: {
  s: BookEvent;
  n: number;
  people: Resource[];
  activeId: boolean;
  warn: boolean;
  onPick: () => void;
}) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/stop", s.id);
        e.dataTransfer.setData("text/book-id", s.id);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const from = e.dataTransfer.getData("text/stop") || e.dataTransfer.getData("text/book-id");
        if (!from || from === s.id) return;
        const src = { start: s.start, end: s.end };
        moveBook(from, src.start, src.end, s.resourceId);
      }}
    >
      <div className={cn("flex gap-2 py-2", activeId ? "bg-page" : "")}>
        <button type="button" onClick={onPick} className="min-w-0 flex-1 text-left">
          <p className="text-[13px] font-semibold">
            {n}. {s.title}
          </p>
          <p className="text-[11px] text-muted">
            {s.type} · {s.city} · {s.status}
          </p>
          {warn ? <p className="text-[11px] font-semibold text-watch">Wrong crew type</p> : null}
        </button>
        <select
          aria-label="Hand off"
          className="h-8 max-w-28 self-center rounded-md border border-line bg-card text-[11px] font-semibold"
          value={s.resourceId}
          onChange={(e) => moveBook(s.id, s.start, s.end, e.target.value)}
        >
          <option value="">Open</option>
          {people.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name.replace(/^Crew \d+ — /, "").split(" ")[0]}
            </option>
          ))}
        </select>
      </div>
      {s.href ? (
        <a href={s.href} className="mb-2 block text-[11px] font-semibold text-navy">
          Open file
        </a>
      ) : null}
    </li>
  );
}
