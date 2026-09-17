import { useEffect, useMemo, useState, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { DispatchMap, streetViewSrc, type MapView, type StreetPath } from "@/components/dispatch-map";
import { cn } from "@/lib/cn";
import { HEX } from "@/lib/tokens";
import { PageTitle } from "@/components/ui-bits";
import { BookPick } from "@/features/book/pick";
import { setBookDay, shiftBookDay, useBookDay } from "@/features/book/day";
import { TODAY, addHrs, hourOf, toIso } from "@/features/book/time";
import { familyOf, type BookEvent } from "@/features/book/types";
import { moveBook, useBook } from "@/features/book/store";
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
  const sig = jobs.map((j) => `${j.id}:${j.resourceId}:${j.start}`).join("|");
  useEffect(() => {
    let dead = false;
    (async () => {
      const next: StreetPath[] = [];
      const d: Record<string, { mins: number; miles: number }> = {};
      for (const u of people) {
        const list = jobs.filter((j) => j.resourceId === u.id && isField(j)).sort((a, b) => a.start.localeCompare(b.start));
        if (!list.length) continue;
        const path = await fetchPath([pingOf(u), ...list.map(geoOf)], 18);
        if (!path) continue;
        next.push({ unitId: u.id, color: routeColor(u.id), coords: path.coords });
        d[u.id] = { mins: mins(path.seconds), miles: path.miles };
      }
      if (!dead) {
        setPaths(next);
        setDrive(d);
      }
    })();
    return () => {
      dead = true;
    };
  }, [people, sig, jobs]);
  return { paths, drive };
}

function DispatchPage() {
  const events = useBook();
  const roster = useRoster();
  const cursor = useBookDay();
  const dayKey = toIso(cursor).slice(0, 10);
  const hour = clockHour(cursor);
  const [office, setOffice] = useState<"all" | "PHX" | "DFW">("PHX");
  const [view, setView] = useState<MapView>("base");
  const [selectedId, setSelectedId] = useState<string | null>("marco");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(true);
  const [showAll, setShowAll] = useState(true);

  const here = useMemo(() => roster.filter((r) => office === "all" || r.office === office), [roster, office]);
  const dayJobs = useMemo(
    () => events.filter((e) => e.start.slice(0, 10) === dayKey && (office === "all" || e.office === office) && isField(e)),
    [events, dayKey, office],
  );
  const open = dayJobs.filter((e) => !e.resourceId);
  const selected = here.find((u) => u.id === selectedId) ?? here[0] ?? null;
  const selectedStops = selected ? dayJobs.filter((e) => e.resourceId === selected.id).sort((a, b) => a.start.localeCompare(b.start)) : [];
  const selectedStop = dayJobs.find((s) => s.id === selectedStopId) ?? selectedStops[0] ?? null;
  const live = here.filter((u) => dayJobs.some((e) => e.resourceId === u.id && e.status === "Dispatched")).length;
  const lateCount = here.filter((u) => behind(dayJobs.filter((e) => e.resourceId === u.id), hour)).length;
  const stopCount = dayJobs.filter((e) => e.resourceId).length;
  const { paths, drive } = useStreetPaths(here, dayJobs);
  const helper = selected
    ? here.find((u) => u.id !== selected.id && !dayJobs.some((e) => e.resourceId === u.id && active(e)) && (u.kind === selected.kind || (selected.kind === "closer" && u.kind === "setter")))
    : null;

  const peoplePins = here.map((u) => {
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
  });
  const houses = dayJobs.filter(isField).map((e) => {
    const g = geoOf(e);
    return { id: e.id, resourceId: e.resourceId, lat: g.lat, lng: g.lng, label: e.title, color: pinColor(e) };
  });
  const street = selectedStop ? { ...geoOf(selectedStop), name: selectedStop.title, city: selectedStop.city } : selected ? { ...pingOf(selected), name: selected.name, city: "" } : null;

  function pick(id: string) {
    setSelectedId(id);
    setSelectedStopId(null);
    setDrawer(true);
    setShowAll(false);
  }

  function pickStop(resourceId: string, stopId: string) {
    if (resourceId) setSelectedId(resourceId);
    setSelectedStopId(stopId);
    setDrawer(true);
    setShowAll(false);
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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-line bg-card px-4">
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

      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-card px-4 py-2">
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => shiftBookDay(-1)}>
          Prev
        </button>
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
          Today
        </button>
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => shiftBookDay(1)}>
          Next
        </button>
        <p className="text-sm font-semibold">{cursor.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        <button
          type="button"
          className={cn("ml-auto h-8 rounded-md border px-2.5 text-xs font-semibold", showAll ? "border-navy bg-navy text-card" : "border-line")}
          onClick={() => setShowAll(true)}
        >
          All routes
        </button>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(22rem,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] lg:grid-rows-1">
        <aside className="min-h-0 overflow-auto border-b border-line bg-card lg:border-r lg:border-b-0">
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

        <div className="flex h-full min-h-[22rem] min-w-0 flex-col">
          <p className="shrink-0 border-b border-line bg-card px-4 py-1.5 text-center text-[13px] tabular-nums">
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
          {selected && drawer ? (
            <aside className="absolute inset-x-0 bottom-0 z-10 flex max-h-[78%] flex-col overflow-auto border-t border-line bg-card shadow-sm lg:inset-y-0 lg:left-auto lg:max-h-none lg:w-96 lg:border-t-0 lg:border-l">
              <div className="flex min-h-10 items-center justify-end px-2">
                <button type="button" className="grid size-10 place-items-center" aria-label="Close" onClick={() => setDrawer(false)}>
                  <X className="size-4" />
                </button>
              </div>
              <div className="px-4 pb-4">
                {street ? <StreetPane lat={street.lat} lng={street.lng} name={street.name} city={street.city} /> : null}
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{selected.role}</p>
                <h2 className="text-[16px] font-bold">{selected.name}</h2>
                <p className={cn("text-[13px] font-semibold", behind(selectedStops, hour) ? "text-stop" : "text-muted")}>{behind(selectedStops, hour) ? "Behind" : selectedStops.length ? "On the book" : "Open"}</p>
                {drive[selected.id] ? (
                  <p className="mt-1 text-[12px] text-muted">
                    {drive[selected.id].mins} min drive · {drive[selected.id].miles.toFixed(1)} mi
                  </p>
                ) : null}
                {behind(selectedStops, hour) && helper ? (
                  <button type="button" className="mt-3 h-10 w-full rounded-md bg-navy text-sm font-semibold text-card" onClick={() => sendRest(helper.id)}>
                    Send remaining to {helper.name.split(" ")[0]}
                  </button>
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
      <iframe title={`Street view ${name}`} src={streetViewSrc(lat, lng)} className="h-48 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
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
