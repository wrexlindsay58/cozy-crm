import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { patchAssign, toggleAssignScope, type JobFile } from "../store";
import { isAccepted } from "../types";
import { cn } from "@/lib/cn";
import { Float } from "@/components/float";
import { SHOP_CREWS, VEHICLE_KINDS, needsTrailerNo, vehicleMissing } from "@/features/staff/store";
import { FillField, FillRow, FILL_IN, FILL_IN_ERR } from "../fill-row";
import { CrewChapterView3 } from "./part-03";

export const SUBS = ["Valley Electric", "AeroSeal Co"];

export const STATUSES = ["Set", "Dispatched", "Done", "No-show"] as const;

export const DAY_WHY = ["Extra scope", "Weather", "Materials", "Punch", "Test-out", "Callback", "Access", "Other"];

export function CrewChapter({ job }: { job: JobFile }) {
  const [open, setOpen] = useState<string | null>(job.assignments[0]?.id ?? null);
  const crewsOnJob = [...new Set(job.assignments.map((a) => (a.kind === "sub" ? a.company || a.crew : a.crew)).filter(Boolean))];
  const [who, setWho] = useState(crewsOnJob[0] || SHOP_CREWS[0].name);
  const [day, setDay] = useState("");
  const [start, setStart] = useState("7:00a");
  const [end, setEnd] = useState("3:00p");
  const [why, setWhy] = useState(DAY_WHY[0]);
  const products = job.scope.filter((s) => s.kind !== "promise");
  const openGate = !isAccepted(job);

  return (
    <CrewChapterView3 bag={{ openGate, job, open, setOpen, products, day, start, end, why, setDay, setWho, crewsOnJob, setWhy, setStart, setEnd, who }} />
  );
}

export function prettyDay(iso: string) {
  if (!iso) return "Needs a day";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function InstallPick({
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

export function VehicleFields({
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
