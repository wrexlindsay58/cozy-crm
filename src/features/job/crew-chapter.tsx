import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { addAssign, addEvent, patchAssign, patchEvent, removeAssign, removeEvent, sendAssignWo, setEventStatus, toggleAssignScope, type JobFile } from "./store";
import { processFor } from "./types";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { CLOCKS, clock12, clock24 } from "./clock";
import { Tip } from "@/components/tip";
import { Float } from "@/components/float";

import { SHOP_CREWS, VEHICLE_KINDS, needsTrailerNo, vehicleLabel, vehicleMissing } from "@/features/staff/store";
import { FillField, FillRow, FILL_IN, FILL_IN_ERR } from "./fill-row";
const SUBS = ["Valley Electric", "AeroSeal Co"];
const STATUSES = ["Set", "Dispatched", "Done", "No-show"] as const;
const DAY_WHY = ["Extra scope", "Weather", "Materials", "Punch", "Test-out", "Callback", "Access", "Other"];

export function CrewChapter({ job }: { job: JobFile }) {
  const [open, setOpen] = useState<string | null>(job.assignments[0]?.id ?? null);
  const crewsOnJob = [...new Set(job.assignments.map((a) => (a.kind === "sub" ? a.company || a.crew : a.crew)).filter(Boolean))];
  const [who, setWho] = useState(crewsOnJob[0] || SHOP_CREWS[0].name);
  const [day, setDay] = useState("");
  const [start, setStart] = useState("7:00a");
  const [end, setEnd] = useState("3:00p");
  const [why, setWhy] = useState(DAY_WHY[0]);
  const products = job.scope.filter((s) => s.kind !== "promise");

  return (
    <div className="min-w-0 space-y-2">
      <JobCard
        kicker="Crews"
        title={`${job.assignments.length} assigned · ${job.events.length} days on the book`}
        done={job.assignments.length > 0 && job.assignments.every((a) => a.woId)}
        actions={
          <button type="button" className="h-8 rounded-md border border-line px-3 text-xs font-semibold" onClick={() => addAssign(job.jobId)}>
            Add crew
          </button>
        }
      >
        <ul className="space-y-4">
          {job.assignments.map((a) => {
            const wo = job.workOrders.find((w) => w.id === a.woId);
            const who = a.kind === "sub" ? a.company || a.crew : a.crew;
            const names = a.scopes.map((id) => job.scope.find((s) => s.id === id)?.label).filter(Boolean).join(" · ");
            const expanded = open === a.id;
            const status = wo?.status ?? "Draft";
            return (
              <li key={a.id} className="min-w-0 rounded-md border border-line p-3">
                <div className="flex min-w-0 items-start gap-2">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(expanded ? null : a.id)}>
                    <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">{a.kind === "sub" ? "Sub" : "In-house"}</span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">{who}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted">
                      {a.day || "No date"} {clock12(a.start)}–{clock12(a.end)}
                      {a.vehicleKind || a.truck ? ` · ${a.truck || vehicleLabel(a.vehicleKind || "Box Truck", a.vehicleNo || "", a.trailerNo)}` : ""}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted">{names || "No install"}</span>
                  </button>
                  <span className="flex shrink-0 items-center gap-1 pt-0.5">
                    <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{status}</span>
                    <Tip label="Remove" on>
                      <button type="button" aria-label="Remove crew" className="grid size-8 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeAssign(job.jobId, a.id)}>
                        <Trash2 className="size-4" />
                      </button>
                    </Tip>
                  </span>
                </div>
                {expanded ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(["internal", "sub"] as const).map((k) => (
                        <button key={k} type="button" onClick={() => patchAssign(job.jobId, a.id, { kind: k, company: k === "sub" ? SUBS[0] : "" })} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", a.kind === k ? "bg-navy text-card" : "border border-line")}>
                          {k === "internal" ? "In-house" : "Sub"}
                        </button>
                      ))}
                    </div>
                    <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <select value={a.kind === "sub" ? a.company : a.crew} onChange={(e) => patchAssign(job.jobId, a.id, a.kind === "sub" ? { company: e.target.value, crew: e.target.value } : { crew: e.target.value })} className="h-10 min-w-0 rounded-md border border-line px-2 text-sm">
                        {(a.kind === "sub" ? SUBS : SHOP_CREWS.map((c) => c.name)).map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <input type="date" value={a.day} onChange={(e) => patchAssign(job.jobId, a.id, { day: e.target.value })} className="h-10 min-w-0 rounded-md border border-line px-2 text-sm" />
                      <select value={clock12(a.start)} onChange={(e) => patchAssign(job.jobId, a.id, { start: clock24(e.target.value) })} className="h-10 min-w-0 rounded-md border border-line px-2 text-sm">
                        {CLOCKS.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                      <select value={clock12(a.end)} onChange={(e) => patchAssign(job.jobId, a.id, { end: clock24(e.target.value) })} className="h-10 min-w-0 rounded-md border border-line px-2 text-sm">
                        {CLOCKS.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    {a.kind === "internal" ? <VehicleFields jobId={job.jobId} assignId={a.id} kind={a.vehicleKind || "Box Truck"} number={a.vehicleNo || ""} trailer={a.trailerNo || ""} /> : null}
                    <InstallPick job={job} assignId={a.id} selected={a.scopes} products={products} />
                    <div className="flex min-w-0 items-center gap-2">
                      <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => sendAssignWo(job.jobId, a.id)}>
                        {status === "Draft" ? "Send work order" : "Resend WO"}
                      </button>
                      <span className="ml-auto shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{status}</span>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </JobCard>

      <JobCard kicker="Schedule" title="When we’re on site">
        {job.events.length === 0 ? <p className="mb-3 text-sm text-muted">No days on the book yet.</p> : null}
        <ul className="divide-y divide-line">
          {job.events.map((e) => {
            const scope = job.scope.find((s) => s.id === e.scopeId);
            return (
              <li key={e.id} className="min-w-0 py-3 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{prettyDay(e.day)}</p>
                    <p className="truncate text-[11px] text-muted">
                      {e.crew}
                      {scope?.label ? ` · ${scope.label}` : ""}
                      {e.why ? ` · ${e.why}` : ""}
                    </p>
                  </div>
                  <Tip label="Remove day" on>
                    <button type="button" aria-label="Remove day" className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeEvent(job.jobId, e.id)}>
                      <Trash2 className="size-4" />
                    </button>
                  </Tip>
                </div>
                <div className="mt-2 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,9rem)]">
                  <label className="min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
                    Start
                    <select value={clock12(e.start)} onChange={(ev) => patchEvent(job.jobId, e.id, { start: clock24(ev.target.value) })} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                      {CLOCKS.map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </label>
                  <label className="min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
                    End
                    <select value={clock12(e.end)} onChange={(ev) => patchEvent(job.jobId, e.id, { end: clock24(ev.target.value) })} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                      {CLOCKS.map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-2 min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase sm:col-span-1">
                    Status
                    <select value={e.status} onChange={(ev) => setEventStatus(job.jobId, e.id, ev.target.value as (typeof STATUSES)[number])} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 min-w-0 space-y-2 border-t border-line pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!day) return;
            const a = job.assignments.find((x) => (x.kind === "sub" ? x.company || x.crew : x.crew) === who);
            const sid = a?.scopes[0] || products[0]?.id || "";
            const label = job.scope.find((s) => s.id === sid)?.label ?? "";
            addEvent(job.jobId, processFor(label), sid, day, clock24(start), clock24(end), who, why);
            setDay("");
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Add a day</p>
            <button type="submit" aria-label="Add day" className="grid size-8 shrink-0 place-items-center rounded-md bg-navy text-card">
              <Plus className="size-4" />
            </button>
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-2">
            <label className="block min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
              Crew
              <select value={who} onChange={(e) => setWho(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                {(crewsOnJob.length ? crewsOnJob : SHOP_CREWS.map((c) => c.name)).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
              Day
              <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal" />
            </label>
            <label className="block min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase sm:col-span-2">
              Reason
              <select value={why} onChange={(e) => setWhy(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                {DAY_WHY.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2">
            <label className="min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
              Start
              <select value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                {CLOCKS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </label>
            <label className="min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
              End
              <select value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                {CLOCKS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </label>
          </div>
        </form>
      </JobCard>
    </div>
  );
}

function prettyDay(iso: string) {
  if (!iso) return "Needs a day";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function InstallPick({
  job,
  assignId,
  selected,
  products,
}: {
  job: JobFile;
  assignId: string;
  selected: string[];
  products: JobFile["scope"];
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const label = selected.length ? selected.map((id) => job.scope.find((s) => s.id === id)?.label).filter(Boolean).join(", ") : "Pick installs";
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Install</p>
      <button
        type="button"
        className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-line px-3 text-left text-sm"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown className="size-4 shrink-0 text-muted" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {products.map((s) => {
            const on = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                className="flex h-10 w-full min-w-56 items-center justify-between gap-3 px-3 text-sm hover:bg-page"
                onClick={() => toggleAssignScope(job.jobId, assignId, s.id)}
              >
                <span>{s.label}</span>
                <span className={cn("text-[11px] font-bold uppercase", on ? "text-navy" : "text-muted")}>{on ? "On" : "Off"}</span>
              </button>
            );
          })}
        </Float>
      ) : null}
    </div>
  );
}

function VehicleFields({
  jobId,
  assignId,
  kind,
  number,
  trailer,
}: {
  jobId: string;
  assignId: string;
  kind: string;
  number: string;
  trailer: string;
}) {
  const miss = vehicleMissing(kind, number, trailer);
  const combo = needsTrailerNo(kind);
  return (
    <div>
      <FillRow min="7rem">
        <FillField label="Vehicle">
          <select
            value={kind}
            onChange={(e) => {
              const next = e.target.value;
              patchAssign(jobId, assignId, { vehicleKind: next, trailerNo: needsTrailerNo(next) ? trailer : "" });
            }}
            className={FILL_IN}
          >
            {VEHICLE_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </FillField>
        <FillField label={kind === "Trailer" ? "Trailer #" : "Vehicle #"}>
          <input
            value={number}
            onChange={(e) => patchAssign(jobId, assignId, { vehicleNo: e.target.value })}
            placeholder="#"
            className={miss && !number.trim() ? FILL_IN_ERR : FILL_IN}
          />
        </FillField>
        {combo ? (
          <FillField label="Trailer #">
            <input
              value={trailer}
              onChange={(e) => patchAssign(jobId, assignId, { trailerNo: e.target.value })}
              placeholder="#"
              className={miss && !trailer.trim() ? FILL_IN_ERR : FILL_IN}
            />
          </FillField>
        ) : null}
      </FillRow>
      {miss ? (
        <p className="mt-1 text-[12px] font-semibold text-alert">
          {kind === "Pickup and Trailer" ? "Pickup and Trailer needs the pickup number and the trailer number." : "Need the vehicle number."}
        </p>
      ) : null}
    </div>
  );
}