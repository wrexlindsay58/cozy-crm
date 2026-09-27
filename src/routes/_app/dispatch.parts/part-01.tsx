import { useEffect, useState, type DragEvent } from "react";
import type { MapView, StreetPath } from "@/components/dispatch-map";
import { TODAY, addHrs, hourOf, toIso } from "@/features/book/time";
import { familyOf, type BookEvent } from "@/features/book/types";
import { moveBook } from "@/features/book/store";
import type { Resource, ResourceKind } from "@/features/book/roster";
import { geoOf, isField, pingOf, routeColor } from "@/features/dispatch/geo";
import { fetchPath, mins, optimizeStops } from "@/features/dispatch/osrm";
import { useDispatchPage } from "./part-02";
import { DispatchPageView5 } from "./part-05";

export const VIEWS: { id: MapView; label: string }[] = [
  { id: "base", label: "Base" },
  { id: "aerial", label: "Aerial" },
  { id: "3d", label: "3D" },
];

export function initials(name: string) {
  const p = name.replace(/^Crew \d+ — /, "").split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}

export function familyOk(type: BookEvent["type"], kind: ResourceKind) {
  const f = familyOf(type);
  if (f === "sales") return kind === "closer" || kind === "setter";
  if (f === "production") return kind === "crew";
  return true;
}

export function clockHour(cursor: Date) {
  const a = toIso(cursor).slice(0, 10);
  const b = toIso(TODAY).slice(0, 10);
  if (a === b) return 18;
  if (a < b) return 22;
  return 6;
}

export function active(e: BookEvent) {
  return e.status !== "Done" && e.status !== "No-sit" && e.status !== "No-show";
}

export function behind(list: BookEvent[], hour: number) {
  return list.some((e) => active(e) && hourOf(e.start) < hour);
}

export async function packRoute(resource: Resource, list: BookEvent[], day: string) {
  let cursor = resource.kind === "crew" ? 7 : 8;
  const ping = pingOf(resource);
  for (let i = 0; i < list.length; i += 1) {
    const e = list[i];
    const hrs = Math.max(0.5, (new Date(e.end).getTime() - new Date(e.start).getTime()) / 36e5);
    const start = addHrs(`${day}T00:00`, cursor);
    moveBook(e.id, start, addHrs(start, hrs), resource.id);
    const next = list[i + 1];
    if (!next) continue;
    const path = await fetchPath([geoOf(e), geoOf(next)], clockHour(new Date(day)));
    cursor = hourOf(addHrs(start, hrs)) + (path ? path.seconds / 3600 : 0.25);
  }
  if (!list.length) return;
  const first = await fetchPath([ping, geoOf(list[0])], 18);
  if (first && list[0]) {
    const e = list[0];
    const hrs = Math.max(0.5, (new Date(e.end).getTime() - new Date(e.start).getTime()) / 36e5);
    const startH = (resource.kind === "crew" ? 7 : 8) + first.seconds / 3600;
    const start = addHrs(`${day}T00:00`, startH);
    moveBook(e.id, start, addHrs(start, hrs), resource.id);
  }
}

export function useStreetPaths(people: Resource[], jobs: BookEvent[]) {
  const [paths, setPaths] = useState<StreetPath[]>([]);
  const [drive, setDrive] = useState<Record<string, { mins: number; miles: number }>>({});
  const peopleKey = people.map((p) => p.id).join(",");
  const sig = jobs.map((j) => `${j.id}:${j.resourceId}:${j.start}`).join("|");
  useEffect(() => {
    let dead = false;
    const fallback: StreetPath[] = [];
    for (const u of people) {
      const list = jobs.filter((j) => j.resourceId === u.id && isField(j)).sort((a, b) => a.start.localeCompare(b.start));
      if (!list.length) continue;
      const pts = [pingOf(u), ...list.map(geoOf)];
      fallback.push({ unitId: u.id, color: routeColor(u.id), coords: pts.map((p) => [p.lng, p.lat]) });
    }
    setPaths(fallback);
    (async () => {
      const next: StreetPath[] = [];
      const d: Record<string, { mins: number; miles: number }> = {};
      await Promise.all(
        people.map(async (u) => {
          const list = jobs.filter((j) => j.resourceId === u.id && isField(j)).sort((a, b) => a.start.localeCompare(b.start));
          if (!list.length) return;
          const path = await fetchPath([pingOf(u), ...list.map(geoOf)], 18);
          if (!path || dead) return;
          next.push({ unitId: u.id, color: routeColor(u.id), coords: path.coords });
          d[u.id] = { mins: mins(path.seconds), miles: path.miles };
        }),
      );
      if (!dead && next.length) {
        setPaths(next);
        setDrive(d);
      }
    })();
    return () => {
      dead = true;
    };
    // people/jobs captured when keys change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peopleKey, sig]);
  return { paths, drive };
}

export function DispatchPage() {
  const { dayJobs, events, selected, selectedStops, dayKey, toId, here, view, setView, office, setOffice, roster, setSelectedId, setSelectedStopId, setDrawer, setSheet, cursor, showAll, setShowAll, open, hour, drive, live, lateCount, stopCount, peoplePins, houses, paths, selectedStopId, drawer, sheet, street, sendTo, setToId, others, pick, pickStop } = useDispatchPage();


  function dropOnUnit(unitId: string, e: DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/stop") || e.dataTransfer.getData("text/book-id");
    const row = dayJobs.find((x) => x.id === id) ?? events.find((x) => x.id === id);
    if (!row) return;
    moveBook(id, row.start, row.end, unitId);
  }

  async function optimize() {
    if (!selected) return;
    const list = selectedStops.filter(active);
    const ids = await optimizeStops(pingOf(selected), list.map((e) => ({ id: e.id, ...geoOf(e) })));
    const ordered = (ids ?? list.map((e) => e.id)).map((id) => list.find((e) => e.id === id)).filter(Boolean) as BookEvent[];
    await packRoute(selected, ordered, dayKey);
  }

  function sendRest(toId: string) {
    const to = here.find((u) => u.id === toId);
    if (!selected || !to) return;
    selectedStops.filter(active).forEach((s) => moveBook(s.id, s.start, s.end, toId));
  }

  return (
    <DispatchPageView5 bag={{ view, setView, office, setOffice, roster, setSelectedId, setSelectedStopId, setDrawer, setSheet, cursor, showAll, setShowAll, open, pickStop, here, dayJobs, hour, selected, pick, dropOnUnit, drive, live, lateCount, stopCount, peoplePins, houses, paths, selectedStopId, drawer, sheet, selectedStops, street, sendTo, setToId, others, sendRest, optimize }} />
  );
}
