import { laborFromCrew } from "./seed";
import { patch } from "./events-02";
import { SHOP_CREWS, vehicleLabel } from "@/features/staff/store";
import { processFor, type CrewAssign, type JobEvent, type JobFile, type WorkOrder } from "../types";

export function syncCrew(j: JobFile): JobFile {
  const first = j.assignments[0];
  const base = !first ? { ...j, crew: "", truck: "", window: "" } : { ...j, crew: first.crew, truck: first.truck, window: first.day ? `${first.day} · ${first.start}–${first.end}` : j.window };
  return laborFromCrew(base);
}

export function vehicleFromCrew(crew: string) {
  const shop = SHOP_CREWS.find((c) => c.name === crew);
  const kind = shop?.vehicle.kind ?? "Box Truck";
  const number = shop?.vehicle.number ?? "";
  const trailer = shop?.vehicle.trailer ?? "";
  return { vehicleKind: kind, vehicleNo: number, trailerNo: trailer, truck: vehicleLabel(kind, number, trailer) };
}

export function addAssign(jobId: string) {
  patch(jobId, (j) => {
    const id = `CA-${Date.now()}`;
    const woId = `WO-${10 + j.workOrders.length}`;
    const row: CrewAssign = {
      id,
      crew: "Crew 2 — Tasha",
      ...vehicleFromCrew("Crew 2 — Tasha"),
      day: "",
      start: "07:00",
      end: "15:00",
      scopes: j.scope[0] ? [j.scope[0].id] : [],
      kind: "internal",
      company: "",
      woId,
    };
    const wo: WorkOrder = {
      id: woId,
      assignId: id,
      status: "Draft",
      day: "",
      crew: row.crew,
      notes: "",
    };
    return syncCrew({ ...j, assignments: [...j.assignments, row], workOrders: [wo, ...j.workOrders] });
  });
}

export function patchAssign(jobId: string, id: string, row: Partial<CrewAssign>) {
  patch(jobId, (j) =>
    syncCrew({
      ...j,
      assignments: j.assignments.map((a) => {
        if (a.id !== id) return a;
        let next = { ...a, ...row };
        if ((row.crew && row.crew !== a.crew && next.kind !== "sub") || row.kind === "internal") {
          next = { ...next, ...vehicleFromCrew(next.crew) };
        }
        const kind = next.vehicleKind || "Box Truck";
        next.truck = vehicleLabel(kind, next.vehicleNo || "", next.trailerNo);
        return next;
      }),
    }),
  );
}

export function removeAssign(jobId: string, id: string) {
  patch(jobId, (j) => syncCrew({ ...j, assignments: j.assignments.filter((a) => a.id !== id) }));
}

export function toggleAssignScope(jobId: string, id: string, scope: string) {
  patch(jobId, (j) => {
    const assignments = j.assignments.map((a) => {
      if (a.id !== id) return a;
      const on = a.scopes.includes(scope);
      return { ...a, scopes: on ? a.scopes.filter((s) => s !== scope) : [...a.scopes, scope] };
    });
    return syncCrew({ ...j, assignments });
  });
}

export function eventsFromAssign(j: JobFile, a: CrewAssign): JobEvent[] {
  const who = a.kind === "sub" ? a.company || a.crew : a.crew;
  return a.scopes.map((sid) => {
    const scope = j.scope.find((s) => s.id === sid);
    return {
      id: `EV-${a.id}-${sid}`,
      scopeId: sid,
      process: processFor(scope?.label ?? sid),
      day: a.day,
      start: a.start,
      end: a.end,
      crew: who,
      assignId: a.id,
      status: "Set" as const,
    };
  });
}
