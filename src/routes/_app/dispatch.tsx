import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { DispatchMap, streetViewSrc, unitColor, type MapView } from "@/components/dispatch-map";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";
import { offices, statusLabel, statusTone, stops, units, type Stop, type Unit } from "@/lib/dispatch-data";

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

function DispatchPage() {
  const [office, setOffice] = useState<"PHX" | "DFW">("PHX");
  const [view, setView] = useState<MapView>("base");
  const [selectedId, setSelectedId] = useState<string | null>("marco");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(true);
  const here = useMemo(() => units.filter((u) => u.office === office), [office]);
  const selected = here.find((u) => u.id === selectedId) ?? null;
  const selectedStops = selected ? (stops[selected.id] ?? []) : [];
  const selectedStop = selectedStops.find((s) => s.id === selectedStopId) ?? selectedStops[0] ?? null;
  const live = here.filter((u) => u.status === "en-route" || u.status === "on-site" || u.status === "late").length;
  const street = selectedStop ?? (selected ? { lat: selected.lat, lng: selected.lng, name: selected.name, address: selected.next ?? "", city: "" } : null);

  function pick(id: string) {
    setSelectedId(id);
    setSelectedStopId(null);
    setDrawer(true);
  }

  function pickStop(unitId: string, stopId: string) {
    setSelectedId(unitId);
    setSelectedStopId(stopId);
    setDrawer(true);
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
                <span className="text-muted"> moving · {here.length} on the board</span>
              </p>
            </>
          }
        />
      </header>

      <div className="relative grid min-h-0 min-w-0 flex-1 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-auto border-b border-line bg-card lg:border-r lg:border-b-0">
          <ul>
            {here.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => pick(u.id)}
                  className={cn(
                    "flex w-full items-start gap-2 border-l-4 px-3 py-3 text-left",
                    u.status === "late" && "border-l-stop bg-stop-bg",
                    selected?.id === u.id && u.status !== "late" && "border-l-navy bg-page",
                    selected?.id !== u.id && u.status !== "late" && "border-l-transparent hover:bg-page/60",
                  )}
                >
                  <i className="mt-1 size-2.5 shrink-0 rounded-sm" style={{ background: unitColor(u) }} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold">{u.name}</span>
                      <span className={cn("text-[11px] font-bold uppercase", TONE[statusTone(u.status)])}>{statusLabel(u.status)}</span>
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {u.next}
                      {u.eta ? ` · ETA ${u.eta}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="relative min-h-[22rem] min-w-0 lg:h-full">
          <DispatchMap office={office} view={view} selectedId={selected?.id ?? null} selectedStopId={selectedStopId} onSelect={pick} onPickStop={pickStop} />
          {selected && drawer ? (
            <aside className="absolute inset-x-0 bottom-0 z-10 flex max-h-[78%] flex-col overflow-auto border-t border-line bg-card shadow-sm lg:inset-y-0 lg:left-auto lg:max-h-none lg:w-96 lg:border-t-0 lg:border-l">
              <div className="flex min-h-10 items-center justify-end px-2">
                <button type="button" className="grid size-10 place-items-center" aria-label="Close" onClick={() => setDrawer(false)}>
                  <X className="size-4" />
                </button>
              </div>
              <div className="px-4 pb-4">
                {street ? <StreetPane lat={street.lat} lng={street.lng} name={selectedStop?.name ?? selected.name} address={selectedStop?.address ?? ""} city={selectedStop?.city ?? ""} /> : null}
                <UnitDetail u={selected} stops={selectedStops} activeStopId={selectedStop?.id ?? null} onStop={(id) => pickStop(selected.id, id)} />
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
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

function UnitDetail({ u, stops: jobStops, activeStopId, onStop }: { u: Unit; stops: Stop[]; activeStopId: string | null; onStop: (id: string) => void }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{u.role}</p>
      <h2 className="text-[16px] font-bold">{u.name}</h2>
      <p className={cn("text-[13px] font-semibold", TONE[statusTone(u.status)])}>{statusLabel(u.status)}</p>
      <p className="mt-1 text-[13px] text-muted">{u.note}</p>
      <dl className="mt-3 divide-y divide-line text-[13px]">
        <Row k="Last ping" v={u.lastPing} />
        <Row k="Speed" v={u.speed === "0" ? "Stopped" : u.speed} />
        <Row k="Next" v={u.next ?? "None"} />
        {u.eta ? <Row k="ETA" v={u.eta} /> : null}
      </dl>
      <div className="mt-3 flex gap-2">
        <a href={`tel:${u.phone}`} className="grid h-10 flex-1 place-items-center rounded-md bg-navy text-[13px] font-semibold text-card">
          Call
        </a>
        <Link to="/conversations" className="grid h-10 flex-1 place-items-center rounded-md bg-page text-[13px] font-semibold">
          Text
        </Link>
      </div>
      <h3 className="mt-4 mb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Stops</h3>
      {jobStops.length === 0 ? <p className="text-[13px] text-muted">No stops on the route.</p> : null}
      <ul className="divide-y divide-line">
        {jobStops.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => onStop(s.id)} className={cn("w-full py-2 text-left", activeStopId === s.id ? "bg-page" : "")}>
              {s.leadId ? (
                <Link to="/leads/$leadId" params={{ leadId: s.leadId }} className="text-[13px] font-semibold hover:text-navy" onClick={(e) => e.stopPropagation()}>
                  {s.name}
                </Link>
              ) : (
                <p className="text-[13px] font-semibold">{s.name}</p>
              )}
              <p className="text-[11px] text-muted">
                {s.time} · {s.job} · {s.city}
              </p>
              <p className="text-[11px] tabular-nums">
                {money(s.amount)} · {s.pay} · {s.status}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2 py-2">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
