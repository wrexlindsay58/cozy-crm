import { useEffect, useMemo, useState, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react";
import { DispatchMap, streetViewSrc, type MapView, type StreetPath } from "@/components/dispatch-map";
import { cn } from "@/lib/cn";
import { HEX } from "@/lib/tokens";
import { PageTitle } from "@/components/ui-bits";
import { BookPick } from "@/features/book/pick";
import { setBookDay, shiftBookDay, useBookDay } from "@/features/book/day";
import { TODAY, addHrs, hourOf, toIso } from "@/features/book/time";
import { familyOf, type BookEvent } from "@/features/book/types";
import { moveBook, useBook } from "@/features/book/store";
import { rollsOn } from "@/features/job/prep";
import { useJobs } from "@/features/job/store";
import { useRoster, type Resource, type ResourceKind } from "@/features/book/roster";
import { geoOf, isField, phoneOf, pingOf, pinColor, routeColor } from "@/features/dispatch/geo";
import { fetchPath, mins, optimizeStops } from "@/features/dispatch/osrm";

export const Route = createFileRoute("/_app/dispatch")({
  component: DispatchPage,
});

const VIEWS: { id: MapView; label: string }[] = [
  { id: "base", label: "Base" },
  { id: "aerial", label: "Aerial" },
  { id: "3d", label: "3D" },
];

function initials(name: string) {
  const p = name.replace(/^Crew \d+ — /, "").split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}

function familyOk(type: BookEvent["type"], kind: ResourceKind) {
  const f = familyOf(type);
  if (f === "sales") return kind === "closer" || kind === "setter";
  if (f === "production") return kind === "crew";
  return true;
}

function clockHour(cursor: Date) {
  const a = toIso(cursor).slice(0, 10);
  const b = toIso(TODAY).slice(0, 10);
  if (a === b) return 18;
  if (a < b) return 22;
  return 6;
}

function active(e: BookEvent) {
  return e.status !== "Done" && e.status !== "No-sit" && e.status !== "No-show";
}

function behind(list: BookEvent[], hour: number) {
  return list.some((e) => active(e) && hourOf(e.start) < hour);
}

async function packRoute(resource: Resource, list: BookEvent[], day: string) {
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

function useStreetPaths(people: Resource[], jobs: BookEvent[]) {
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

function DispatchPage() {
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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden overscroll-none bg-page">
      <header className="shrink-0 border-b border-line bg-card px-3 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold tracking-tight">Map</h1>
          <div className="ml-auto flex rounded-md bg-page p-0.5">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" className={cn("h-8 px-2.5 text-[13px] font-semibold", view === v.id ? "bg-navy text-card" : "text-muted")} onClick={() => setView(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-nowrap items-center gap-1.5 overflow-x-auto">
          <BookPick
            value={office}
            onChange={(v) => {
              setOffice(v);
              const first = roster.find((u) => v === "all" || u.office === v)?.id ?? null;
              setSelectedId(first);
              setSelectedStopId(null);
              setDrawer(true);
              setSheet("peek");
            }}
            items={[
              { id: "all", label: "All markets" },
              { id: "PHX", label: "Phoenix" },
              { id: "DFW", label: "Dallas" },
            ]}
          />
          <button type="button" aria-label="Previous day" className="grid size-8 shrink-0 place-items-center rounded-md border border-line" onClick={() => shiftBookDay(-1)}>
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
            Today
          </button>
          <button type="button" aria-label="Next day" className="grid size-8 shrink-0 place-items-center rounded-md border border-line" onClick={() => shiftBookDay(1)}>
            <ChevronRight className="size-4" />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          <button
            type="button"
            className={cn("h-8 shrink-0 rounded-md border px-2.5 text-xs font-semibold", showAll ? "border-navy bg-navy text-card" : "border-line")}
            onClick={() => setShowAll(true)}
          >
            All routes
          </button>
        </div>
      </header>

      <header className="hidden min-h-14 shrink-0 items-center gap-2 overflow-x-auto border-b border-line bg-card px-4 md:flex">
        <PageTitle
          title="Map"
          flush
          actions={
            <>
              <div className="flex rounded-md bg-page p-0.5">
                {VIEWS.map((v) => (
                  <button key={v.id} type="button" className={cn("h-8 px-2.5 text-[13px] font-semibold", view === v.id ? "bg-navy text-card" : "text-muted")} onClick={() => setView(v.id)}>
                    {v.label}
                  </button>
                ))}
              </div>
              <BookPick
                value={office}
                onChange={(v) => {
                  setOffice(v);
                  const first = roster.find((u) => v === "all" || u.office === v)?.id ?? null;
                  setSelectedId(first);
                  setSelectedStopId(null);
                  setDrawer(true);
                }}
                items={[
                  { id: "all", label: "All markets" },
                  { id: "PHX", label: "Phoenix" },
                  { id: "DFW", label: "Dallas" },
                ]}
              />
            </>
          }
        />
      </header>

      <div className="hidden shrink-0 flex-nowrap items-center gap-2 overflow-x-auto border-b border-line bg-card px-4 py-2 md:flex">
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => shiftBookDay(-1)}>
          Prev
        </button>
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
          Today
        </button>
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => shiftBookDay(1)}>
          Next
        </button>
        <p className="shrink-0 text-sm font-semibold">{cursor.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        <button
          type="button"
          className={cn("ml-auto h-8 shrink-0 rounded-md border px-2.5 text-xs font-semibold", showAll ? "border-navy bg-navy text-card" : "border-line")}
          onClick={() => setShowAll(true)}
        >
          All routes
        </button>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 grid-rows-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="hidden min-h-0 overflow-auto border-b border-line bg-card lg:block lg:border-r lg:border-b-0">
          {open.length ? (
            <div className="border-b border-line">
              <p className="px-3 py-2 text-[11px] font-bold tracking-wide text-muted uppercase">Open</p>
              <ul>
                {open.map((s) => (
                  <li key={s.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/stop", s.id);
                        e.dataTransfer.setData("text/book-id", s.id);
                      }}
                      onClick={() => pickStop("", s.id)}
                      className="flex w-full items-start gap-2 border-l-4 border-l-transparent px-3 py-2.5 text-left"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">{s.title.slice(0, 1)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{s.title}</span>
                          <span className="text-[11px] font-semibold text-muted">{s.type}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted">
                          {s.city || "No city"} · {s.status}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="px-3 py-2 text-[11px] font-bold tracking-wide text-muted uppercase">People</p>
          <ul>
            {here.map((u) => {
              const mine = dayJobs.filter((e) => e.resourceId === u.id);
              const late = behind(mine, hour);
              const on = selected?.id === u.id;
              return (
                <li key={u.id} className={cn("border-b border-line", on && "bg-page")}>
                  <button
                    type="button"
                    onClick={() => pick(u.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => dropOnUnit(u.id, e)}
                    className={cn("flex w-full items-start gap-2 border-l-4 px-3 py-2.5 text-left", on ? "border-l-navy" : "border-l-transparent")}
                  >
                    <span className="relative mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">
                      {initials(u.name)}
                      {late ? <i className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-card bg-stop" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{u.name}</span>
                        <span className={cn("shrink-0 text-[11px] font-semibold", late ? "text-stop" : "text-muted")}>{late ? "Behind" : mine.length ? `${mine.length}` : "Open"}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">
                        {mine.length ? `${mine.length} stop${mine.length === 1 ? "" : "s"}` : "No stops"}
                        {drive[u.id] ? ` · ${drive[u.id].mins} min` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex h-full min-h-0 min-w-0 flex-col lg:min-h-[22rem]">
          <p className="hidden shrink-0 border-b border-line bg-card px-4 py-1.5 text-center text-[13px] tabular-nums lg:block">
            <span className="font-bold">{live}</span>
            <span className="text-muted"> moving</span>
            {open.length ? (
              <>
                <span className="text-muted"> · </span>
                <span className="font-bold">{open.length}</span>
                <span className="text-muted"> open</span>
              </>
            ) : null}
            {lateCount ? (
              <>
                <span className="text-muted"> · </span>
                <span className="font-bold text-stop">{lateCount}</span>
                <span className="text-muted"> behind</span>
              </>
            ) : null}
            <span className="text-muted"> · </span>
            <span className="font-bold">{stopCount}</span>
            <span className="text-muted"> stops</span>
          </p>
          <div className="relative min-h-0 min-w-0 flex-1">
          <DispatchMap office={office} view={view} people={peoplePins} houses={houses} paths={paths} selectedId={selected?.id ?? null} selectedStopId={selectedStopId} showAll={showAll} onSelect={pick} onPickStop={pickStop} />
          <p className="absolute top-2 left-2 z-10 max-w-[70%] rounded-md border border-line bg-card/95 px-2.5 py-1 text-[11px] font-semibold tabular-nums shadow-sm lg:hidden">
            <span className="font-bold">{live}</span>
            <span className="text-muted"> live</span>
            {lateCount ? (
              <>
                <span className="text-muted"> · </span>
                <span className="font-bold text-stop">{lateCount}</span>
                <span className="text-muted"> behind</span>
              </>
            ) : null}
            <span className="text-muted"> · </span>
            <span className="font-bold">{stopCount}</span>
            <span className="text-muted"> stops</span>
          </p>
          {drawer && (selected || open.length) ? (
            <aside
              className={cn(
                "absolute inset-x-0 bottom-0 z-10 flex flex-col border-t border-line bg-card shadow-sm",
                sheet === "open" ? "max-h-[70%] overflow-auto" : "overflow-hidden",
                "lg:inset-y-0 lg:left-auto lg:max-h-none lg:w-96 lg:overflow-auto lg:border-t-0 lg:border-l",
              )}
            >
              <button
                type="button"
                className="relative flex w-full items-center gap-3 px-4 pt-4 pb-3 text-left lg:hidden"
                onClick={() => setSheet((s) => (s === "peek" ? "open" : "peek"))}
                aria-expanded={sheet === "open"}
              >
                <i className="absolute top-1.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-line" />
                {selected ? (
                  <span className="relative grid size-10 shrink-0 place-items-center rounded-md bg-navy text-[11px] font-bold text-card">
                    {initials(selected.name)}
                    {behind(selectedStops, hour) ? <i className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-card bg-stop" /> : null}
                  </span>
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-page text-[11px] font-bold text-navy">{open.length}</span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{selected ? selected.name : "Open work"}</span>
                  <span className={cn("block truncate text-[12px]", selected && behind(selectedStops, hour) ? "font-semibold text-stop" : "text-muted")}>
                    {selected
                      ? [
                          behind(selectedStops, hour) ? "Behind" : selectedStops.length ? `${selectedStops.length} stops` : "Open",
                          drive[selected.id] ? `${drive[selected.id].mins} min` : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : `${open.length} unassigned`}
                  </span>
                </span>
                {sheet === "open" ? <ChevronDown className="size-4 shrink-0 text-muted" /> : <ChevronUp className="size-4 shrink-0 text-muted" />}
              </button>
              <div className={cn("flex min-h-10 items-center justify-end px-2 max-lg:hidden")}>
                <button type="button" className="grid size-10 place-items-center" aria-label="Close" onClick={() => setDrawer(false)}>
                  <X className="size-4" />
                </button>
              </div>
              <div className={cn("px-4 pb-4", sheet === "peek" && "max-lg:hidden")}>
                {selected ? (
                  <>
                {street ? <StreetPane lat={street.lat} lng={street.lng} name={street.name} city={street.city} /> : null}
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{selected.role}</p>
                <h2 className="text-[16px] font-bold">{selected.name}</h2>
                <p className={cn("text-[13px] font-semibold", behind(selectedStops, hour) ? "text-stop" : "text-muted")}>{behind(selectedStops, hour) ? "Behind" : selectedStops.length ? "On the book" : "Open"}</p>
                {drive[selected.id] ? (
                  <p className="mt-1 text-[12px] text-muted">
                    {drive[selected.id].mins} min drive · {drive[selected.id].miles.toFixed(1)} mi
                  </p>
                ) : null}
                {selectedStops.some(active) && sendTo ? (
                  <div className="mt-3 flex gap-2">
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Send remaining to</span>
                      <select
                        value={sendTo}
                        onChange={(e) => setToId(e.target.value)}
                        className="h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold"
                      >
                        {others.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name.replace(/^Crew \d+ — /, "")}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="button" className="h-10 shrink-0 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => sendRest(sendTo)}>
                      Send remaining
                    </button>
                  </div>
                ) : null}
                <div className="mt-3 flex gap-2">
                  {phoneOf(selected.id) ? (
                    <a href={`tel:${phoneOf(selected.id)}`} className="grid h-10 flex-1 place-items-center rounded-md bg-navy text-[13px] font-semibold text-card">
                      Call
                    </a>
                  ) : (
                    <span className="grid h-10 flex-1 place-items-center rounded-md bg-navy text-[13px] font-semibold text-card">Call</span>
                  )}
                  <button type="button" className="grid h-10 flex-1 place-items-center rounded-md border border-line text-[13px] font-semibold" onClick={() => void optimize()}>
                    Optimize
                  </button>
                </div>
                <h3 className="mt-4 mb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Route</h3>
                {selectedStops.length === 0 ? <p className="text-[13px] text-muted">No stops. Drop open work here.</p> : null}
                <ul className="divide-y divide-line" onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropOnUnit(selected.id, e)}>
                  {selectedStops.map((s, i) => (
                    <StopRow key={s.id} s={s} n={i + 1} people={here} activeId={selectedStopId === s.id} warn={!familyOk(s.type, selected.kind)} onPick={() => pickStop(selected.id, s.id)} />
                  ))}
                </ul>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Open</p>
                    <ul className="mt-2 divide-y divide-line">
                      {open.map((s) => (
                        <li key={s.id}>
                          <button type="button" onClick={() => pickStop("", s.id)} className="flex w-full items-start gap-2 py-2.5 text-left">
                            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">{s.title.slice(0, 1)}</span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-baseline justify-between gap-2">
                                <span className="truncate text-sm font-semibold">{s.title}</span>
                                <span className="text-[11px] font-semibold text-muted">{s.type}</span>
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-muted">
                                {s.city || "No city"} · {s.status}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </aside>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StopRow({
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

function StreetPane({ lat, lng, name, city }: { lat: number; lng: number; name: string; city: string }) {
  return (
    <div className="mb-3 overflow-hidden rounded-md border border-line bg-page">
      <iframe title={`Street view ${name}`} src={streetViewSrc(lat, lng)} className="hidden h-48 w-full border-0 lg:block" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="min-w-0 truncate text-[12px] font-semibold">
          {name}
          {city ? ` · ${city}` : ""}
        </p>
        <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] font-semibold text-navy">
          Open
        </a>
      </div>
    </div>
  );
}
