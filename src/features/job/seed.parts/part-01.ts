import { splitSoldNotes, type JobFile } from "../types";
import { prepDays, prepLines } from "../prep";

export const atticBefore = "/brand/slides/house.jpg";

export function prep_seedJobs() {
    const __bag0 = {
  jobId: "P-331",
  personId: "L-4788",
  leadId: "L-4788",
  accountId: "A-204",
  name: "Cho — attic + HVAC",
  product: "Attic + HVAC",
  pm: "Tasha Reed",
  closer: "Dana Ortiz",
  stage: "Scheduled",
  holds: [],
  sold: 31250,
  soldAt: "Sep 4",
  labor: 4200,
  commission: 3125,
  commissions: [{ id: "CM-1", who: "Dana Ortiz", role: "Closer", pct: 10, paid: false }],
  extras: 0,
  crew: "Crew 2 — Tasha",
  truck: "Truck 4",
  window: "Sep 22 · 7a–3p",
  assignments: [
        { id: "CA-1", crew: "Crew 2 — Tasha", truck: "Box Truck 4", vehicleKind: "Box Truck", vehicleNo: "4", day: "2026-09-22", start: "07:00", end: "15:00", scopes: ["SC-1", "SC-3"], kind: "internal", company: "", woId: "WO-14" },
        { id: "CA-2", crew: "Crew 1 — Evan", truck: "Van 2", vehicleKind: "Van", vehicleNo: "2", day: "2026-09-22", start: "08:00", end: "16:00", scopes: ["SC-2"], kind: "internal", company: "" },
      ],
  soldNotes: "Both home. Hatch in the hall. Dumpster off the street for HOA.",
  };
  return { __bag0 };
}

export function stampJob(job: JobFile): JobFile {
    if (job.jobId === "P-328") {
      return {
        ...job,
        invoices: [{ id: "INV-328", kind: "Deposit" as const, amount: 4200, paid: 0, status: "Past due" as const, payments: [], party: "customer" as const, since: "2026-09-16" }],
      };
    }
    if (job.jobId === "P-322") {
      return {
        ...job,
        pos: [{ id: "PO-322", vendor: "GreenFiber", amount: 1460, status: "Sent" as const, what: "Cellulose", since: "2026-09-21" }],
        invoices: [{ id: "INV-322", kind: "Deposit" as const, amount: 2500, paid: 0, status: "Draft" as const, payments: [], party: "customer" as const, since: "2026-09-23" }],
      };
    }
    if (job.jobId === "P-318") {
      return {
        ...job,
        changeOrders: [{ id: "CO-318", why: "Extra return", amount: 800, cost: 220, status: "Approved" as const, lane: "install" as const, signed: true, signedAt: "Sep 14", since: "2026-09-14" }],
        invoices: [{ id: "INV-318", kind: "Final" as const, amount: 6400, paid: 6400, status: "Paid" as const, payments: [{ id: "PY-318", amount: 6400, at: "Sep 12", how: "Card", status: "Paid" as const }], party: "customer" as const }],
      };
    }
    return job;
}

export function withPrep(job: JobFile): JobFile {
  const done = job.stage === "In progress" || job.stage === "Test-out" || job.stage === "Punch" || job.stage === "Invoiced" || job.stage === "Closed";
  if (!done) return job;
  const prep: NonNullable<JobFile["prep"]> = {};
  prepDays(job).forEach((day) => {
    prep[day] = {};
    prepLines(job).forEach((line) => {
      prep[day][line.id] = { scheduled: true, confirmed: true };
    });
  });
  return { ...job, prep };
}

export function withAccept(job: JobFile): JobFile {
  const notes = splitSoldNotes(job.soldNotes);
  const accepted = job.stage !== "Sold";
  return {
    ...job,
    acceptance: {
      reviewed: accepted ? job.scope.map((s) => s.id) : [],
      notes: notes.map((n) => (accepted ? { ...n, state: "clear" as const } : n)),
      discrepancies: [],
      ...(accepted ? { by: job.pm, at: job.soldAt || "On file" } : {}),
    },
  };
}
