import { projects } from "@/lib/crm-data";
import type { Hold, JobFile, Stage } from "./types";

export function seedJobs(): JobFile[] {
  const cho: JobFile = {
    jobId: "P-331",
    personId: "A-204",
    name: "Cho — attic + HVAC",
    product: "Attic + HVAC",
    pm: "Tasha Reed",
    closer: "Dana Ortiz",
    stage: "Scheduled",
    holds: [],
    sold: 31250,
    labor: 4200,
    commission: 3125,
    extras: 0,
    crew: "Crew 2 — Tasha",
    truck: "Truck 4",
    window: "Sep 22",
    scope: [
      { label: "Attic R-49", amount: 8900 },
      { label: "HVAC replacement", amount: 18600 },
      { label: "Ducts", amount: 3750 },
    ],
    warranty: true,
    financeVendor: "GoodLeap",
    financeStatus: "Approved",
    ntp: "Ready",
    workOrders: [{ id: "WO-14", status: "Issued", day: "Sep 22", crew: "Crew 2 — Tasha", notes: "Pull R-49 + 4-ton." }],
    pos: [
      { id: "PO-88", vendor: "Carrier", amount: 9800, status: "Sent", what: "4-ton condenser + coil" },
      { id: "PO-81", vendor: "GreenFiber", amount: 2100, status: "Received", what: "Cellulose" },
    ],
    changeOrders: [],
    invoices: [{ id: "INV-41", kind: "Deposit", amount: 5000, paid: 0, status: "Sent" }],
  };
  const rest = projects
    .filter((p) => p.id !== "P-331")
    .map((p) => ({
      jobId: p.id,
      personId: p.accountId,
      name: p.name,
      product: p.product,
      pm: p.pm,
      closer: "Dana Ortiz",
      stage: (p.status === "On hold" ? "Sold" : p.status) as Stage,
      holds: p.status === "On hold" ? (["HOA"] as Hold[]) : [],
      sold: p.amount,
      labor: Math.round(p.amount * 0.12),
      commission: Math.round(p.amount * 0.1),
      extras: 0,
      crew: p.pm,
      truck: "Truck 2",
      window: p.install,
      scope: [{ label: p.product, amount: p.amount }],
      warranty: p.product.toLowerCase().includes("attic"),
      financeVendor: "Cash" as const,
      financeStatus: "—",
      ntp: "Not ready" as const,
      workOrders: [],
      pos: [],
      changeOrders: [],
      invoices:
        p.status === "Closed"
          ? [{ id: `INV-${p.id.slice(2)}`, kind: "Final" as const, amount: p.amount, paid: p.amount, status: "Paid" as const }]
          : [],
    }));
  return [cho, ...rest];
}
