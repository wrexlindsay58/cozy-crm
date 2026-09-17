import { useEffect, useMemo, useState, type DragEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { DispatchMap, streetViewSrc, unitColor, type MapView, type StreetPath } from "@/components/dispatch-map";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";
import { offices, statusLabel, statusTone, units, type Unit } from "@/lib/dispatch-data";
import { applyOrder, assignWork, isBehind, kindLabel, openWork, reorderWork, unitWork, useWork, type Work } from "@/features/dispatch/store";
import { fetchPath, mins, optimizeStops, rushLabel } from "@/features/dispatch/osrm";

export const Route = createFileRoute("/_app/dispatch")({
  component: DispatchPage,
});

const TONE = {
  stop: "text-stop",
  watch: "text-watch",
  go: "text-go",
  info: "text-info",
  none: "text-muted",
} as const;

const VIEWS: { id: MapView; label: string }[] = [
  { id: "base", label: "Base" },
  { id: "aerial", label: "Aerial" },
  { id: "3d", label: "3D" },
];

const HOUR = 18;

function inOffice(w: Work, office: "PHX" | "DFW") {
  if (w.unitId) return units.find((u) => u.id === w.unitId)?.office === office;
  const dfw = w.city === "Dallas" || w.city === "Fort Worth";
  return office === "DFW" ? dfw : !dfw;
}

function useStreetPaths(office: "PHX" | "DFW", jobs: Work[]) {
  const [paths, setPaths] = useState<StreetPath[]>([]);
  const [drive, setDrive] = useState<Record<string, { mins: number; miles: number }>>({});
  const sig = jobs.map((j) => `${j.id}:${j.unitId}`).join("|");
  useEffect(() => {
    let dead = false;
    (async () => {
      const here = units.filter((u) => u.office === office);
      const next: StreetPath[] = [];
      const d: Record<string, { mins: number; miles: number }> = {};
      for (const u of here) {
        const list = jobs.filter((j) => j.unitId === u.id);
        if (!list.length) continue;
        const path = await fetchPath([{ lng: u.lng, lat: u.lat }, ...list], HOUR);
        if (!path) continue;
        next.push({ unitId: u.id, color: unitColor(u), coords: path.coords });
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
  }, [office, sig, jobs]);
  return { paths, drive };
}

function DispatchPage() {
  const all = useWork();
  const [office, setOffice] = useState<"PHX" | "DFW">("PHX");
  const [view, setView] = useState<MapView>("base");
  const [selectedId, setSelectedId] = useState<string | null>("marco");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(true);
  const here = useMemo(() => units.filter((u) => u.office === office), [office]);
  const jobs = useMemo(() => all.filter((w) => inOffice(w, office)), [all, office]);
  const open = openWork(jobs);
  const selected = here.find((u) => u.id === selectedId) ?? null;
  const selectedStops = selected ? unitWork(selected.id, jobs) : [];
  const selectedStop = jobs.find((s) => s.id === selectedStopId) ?? selectedStops[0] ?? null;
  const live = here.filter((u) => u.status === "en-route" || u.status === "on-site" || u.status === "late").length;
  const { paths, drive } = useStreetPaths(office, jobs);
  const street = selectedStop ?? (selected ? { lat: selected.lat, lng: selected.lng, name: selected.name, address: selected.next ?? "", city: "" } : null);
  const helper = selected ? here.find((u) => u.id !== selected.id && (u.status === "idle" || u.status === "done") && u.role === selected.role) : null;

  function pick(id: string) {
    setSelectedId(id);
    setSelectedStopId(null);
    setDrawer(true);
  }

  function pickStop(unitId: string, stopId: string) {
    if (unitId) setSelectedId(unitId);
    setSelectedStopId(stopId);
    setDrawer(true);
  }

  function dropOnUnit(unitId: string, e: DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/stop");
    if (id) assignWork(id, unitId);
  }

  async function optimize() {
    if (!selected) return;
    const list = unitWork(selected.id);
    const ids = await optimizeStops(selected, list);
    if (ids?.length) applyOrder(selected.id, ids);
  }

  function sendRest(toId: string) {
    if (!selected) return;
    unitWork(selected.id)
      .filter((s) => s.status !== "Ran")
      .forEach((s) => assignWork(s.id, toId));
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
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
              <div className="flex rounded-md bg-page p-0.5">
                {(Object.keys(offices) as Array<"PHX" | "DFW">).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setOffice(k);
                      const first = units.find((u) => u.office === k)?.id ?? null;
                      setSelectedId(first);
                      setSelectedStopId(null);
                      setDrawer(true);
                    }}
                    className={cn("h-8 px-2.5 text-[13px] font-semibold", office === k ? "bg-navy text-card" : "text-muted")}
                  >
                    {offices[k].label}
                  </button>
                ))}
              </div>
              <p className="text-[13px] tabular-nums">
                <span className="font-bold">{live}</span>
                <span className="text-muted"> moving · {rushLabel(HOUR)}</span>
              </p>
            </>
          }
        />
      </header>

      <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(22rem,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] lg:grid-rows-1">
        <aside className="min-h-0 overflow-auto bg-page p-2 lg:border-r lg:border-line">
          {open.length ? (
            <div className="mb-3">
              <p className="px-1 pb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Open</p>
              <ul className="space-y-2">
                {open.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/stop", s.id)}
                      onClick={() => pickStop("", s.id)}
                      className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-left"
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{s.name}</span>
                        <span className="text-[11px] font-bold text-muted uppercase">{kindLabel(s.kind)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">
                        {s.job} · {s.city}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="px-1 pb-1 text-[11px] font-bold tracking-wide text-muted uppercase">People</p>
          <ul className="space-y-2">
            {here.map((u) => {
              const n = unitWork(u.id, jobs).length;
              const behind = isBehind(u.id, HOUR);
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => pick(u.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => dropOnUnit(u.id, e)}
                    className={cn("flex w-full items-start gap-2 rounded-md border bg-card px-3 py-3 text-left", selected?.id === u.id ? "border-navy" : "border-line")}
                  >
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md text-[10px] font-bold text-card" style={{ background: unitColor(u) }}>
                      {u.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{u.name}</span>
                        <span className={cn("shrink-0 text-[11px] font-bold uppercase", behind ? "text-stop" : TONE[statusTone(u.status)])}>{behind ? "Behind" : statusLabel(u.status)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">
                        {n ? `${n} stop${n === 1 ? "" : "s"}` : "Open"}
                        {drive[u.id] ? ` · ${drive[u.id].mins} min` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="relative min-h-[22rem] min-w-0 lg:min-h-0">
          <DispatchMap office={office} view={view} jobs={jobs} paths={paths} selectedId={selected?.id ?? null} selectedStopId={selectedStopId} onSelect={pick} onPickStop={pickStop} />
          {selected && drawer ? (
            <aside className="absolute inset-x-0 bottom-0 z-10 flex max-h-[78%] flex-col overflow-auto border-t border-line bg-card shadow-sm lg:inset-y-0 lg:left-auto lg:max-h-none lg:w-96 lg:border-t-0 lg:border-l">
              <div className="flex min-h-10 items-center justify-end px-2">
                <button type="button" className="grid size-10 place-items-center" aria-label="Close" onClick={() => setDrawer(false)}>
                  <X className="size-4" />
                </button>
              </div>
              <div className="px-4 pb-4">
                {street ? <StreetPane lat={street.lat} lng={street.lng} name={"name" in street ? street.name : selected.name} address={"address" in street ? street.address : ""} city={"city" in street ? street.city : ""} /> : null}
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{selected.role}</p>
                <h2 className="text-[16px] font-bold">{selected.name}</h2>
                <p className={cn("text-[13px] font-semibold", isBehind(selected.id, HOUR) ? "text-stop" : TONE[statusTone(selected.status)])}>{isBehind(selected.id, HOUR) ? "Behind" : statusLabel(selected.status)}</p>
                <p className="mt-1 text-[13px] text-muted">{selected.note}</p>
                {drive[selected.id] ? (
                  <p className="mt-1 text-[12px] text-muted">
                    {drive[selected.id].mins} min drive · {drive[selected.id].miles.toFixed(1)} mi · {rushLabel(HOUR)}
                  </p>
                ) : null}
                {isBehind(selected.id, HOUR) && helper ? (
                  <button type="button" className="mt-3 h-10 w-full rounded-md bg-stop text-sm font-semibold text-card" onClick={() => sendRest(helper.id)}>
                    Send remaining to {helper.name.split(" ")[0]}
                  </button>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <a href={`tel:${selected.phone}`} className="grid h-10 flex-1 place-items-center rounded-md bg-navy text-[13px] font-semibold text-card">
                    Call
                  </a>
                  <button type="button" className="grid h-10 flex-1 place-items-center rounded-md bg-page text-[13px] font-semibold" onClick={() => void optimize()}>
                    Optimize
                  </button>
                </div>
                <h3 className="mt-4 mb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Route</h3>
                {selectedStops.length === 0 ? <p className="text-[13px] text-muted">No stops. Drop open work here.</p> : null}
                <ul
                  className="divide-y divide-line"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => dropOnUnit(selected.id, e)}
                >
                  {selectedStops.map((s, i) => (
                    <StopRow key={s.id} s={s} n={i + 1} people={here} active={selectedStopId === s.id} onPick={() => pickStop(selected.id, s.id)} onReorder={(from, to) => reorderWork(selected.id, from, to)} />
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StopRow({
  s,
  n,
  people,
  active,
  onPick,
  onReorder,
}: {
  s: Work;
  n: number;
  people: Unit[];
  active: boolean;
  onPick: () => void;
  onReorder: (from: string, to: string) => void;
}) {
  return (
    <li
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/stop", s.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const from = e.dataTransfer.getData("text/stop");
        if (from) onReorder(from, s.id);
      }}
    >
      <div className={cn("flex gap-2 py-2", active ? "bg-page" : "")}>
        <button type="button" onClick={onPick} className="min-w-0 flex-1 text-left">
          <p className="text-[13px] font-semibold">
            {n}. {s.name}
          </p>
          <p className="text-[11px] text-muted">
            {kindLabel(s.kind)} · {s.time} · {s.city}
          </p>
          {s.amount ? (
            <p className="text-[11px] tabular-nums">
              {money(s.amount)} · {s.status}
            </p>
          ) : (
            <p className="text-[11px] text-muted">{s.status}</p>
          )}
        </button>
        <select
          aria-label="Hand off"
          className="h-8 max-w-24 self-center rounded-md border border-line bg-card text-[11px] font-semibold"
          value={s.unitId ?? ""}
          onChange={(e) => assignWork(s.id, e.target.value || null)}
        >
          <option value="">Open</option>
          {people.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name.split(" ")[0]}
            </option>
          ))}
        </select>
      </div>
      {s.leadId ? (
        <Link to="/leads/$leadId" params={{ leadId: s.leadId }} className="mb-2 block text-[11px] font-semibold text-navy">
          Open file
        </Link>
      ) : null}
    </li>
  );
}

function StreetPane({ lat, lng, name, address, city }: { lat: number; lng: number; name: string; address: string; city: string }) {
  return (
    <div className="mb-3 overflow-hidden rounded-md border border-line bg-page">
      <iframe title={`Street view ${name}`} src={streetViewSrc(lat, lng)} className="h-48 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="min-w-0 truncate text-[12px] font-semibold">
          {address || name}
          {city ? ` · ${city}` : ""}
        </p>
        <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] font-semibold text-navy">
          Open
        </a>
      </div>
    </div>
  );
}
