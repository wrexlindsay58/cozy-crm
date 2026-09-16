import { accounts, leads, projects } from "@/lib/crm-data";
import { defaultChecks, type JobFile, type Stage } from "./types";

export function seedJobs(): JobFile[] {
  const cho: JobFile = {
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
    labor: 4200,
    commission: 3125,
    extras: 0,
    crew: "Crew 2 — Tasha",
    truck: "Truck 4",
    window: "Sep 22 · 7a–3p",
    assignments: [
      { id: "CA-1", crew: "Crew 2 — Tasha", truck: "Truck 4", day: "2026-09-22", start: "07:00", end: "15:00", scopes: ["Attic R-49", "Ducts"] },
      { id: "CA-2", crew: "Crew 1 — Evan", truck: "Truck 2", day: "2026-09-22", start: "08:00", end: "16:00", scopes: ["HVAC replacement"] },
    ],
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
    packages: [
      { id: "PKG-1", name: "Attic R-49", status: "On truck", crew: "Crew 2 — Tasha" },
      { id: "PKG-2", name: "HVAC 4-ton", status: "On order", crew: "Crew 2 — Tasha" },
      { id: "PKG-3", name: "Ducts", status: "Queued", crew: "Crew 2 — Tasha" },
    ],
    appointments: [
      { id: "JA-1", kind: "Install", day: "Sep 22", window: "7a–3p", crew: "Crew 2 — Tasha", status: "Set" },
      { id: "JA-2", kind: "Test-out", day: "Sep 24", window: "2p–4p", crew: "Tasha Reed", status: "Set" },
    ],
    punch: [{ id: "PU-1", item: "Seal hatch weatherstrip", owner: "Crew 2", status: "Open" }],
    equipment: [
      { id: "EQ-1", name: "4-ton condenser", serial: "", eta: "Sep 19", status: "Ordered" },
      { id: "EQ-2", name: "Coil", serial: "", eta: "Sep 19", status: "Ordered" },
    ],
    checks: defaultChecks().map((c) => (c.id === "equip" ? { ...c, on: true } : c)),
    hours: [{ id: "HR-1", who: "Tasha Reed", hours: 2, day: "Sep 12" }],
    access: "Side gate. Dogs in. HOA needs dumpster off the street.",
  };
  const rest = projects
    .filter((p) => p.id !== "P-331")
    .map((p) => {
      const account = accounts.find((a) => a.id === p.accountId);
      const lead = leads.find((l) => l.name === account?.name);
      const contact = lead?.id ?? p.accountId;
      return {
      jobId: p.id,
      personId: contact,
      leadId: lead?.id ?? "",
      accountId: p.accountId,
      name: p.name,
      product: p.product,
      pm: p.pm,
      closer: "Dana Ortiz",
      stage: (p.status === "On hold" ? "Sold" : p.status) as Stage,
      holds: p.status === "On hold" ? [{ kind: "HOA" as const, note: "Waiting on HOA. Need the written sign-off.", at: "Sep 10" }] : [],
      sold: p.amount,
      labor: Math.round(p.amount * 0.12),
      commission: Math.round(p.amount * 0.1),
      extras: 0,
      crew: p.pm,
      truck: "Truck 2",
      window: p.install,
      assignments: p.install
        ? [{ id: `CA-${p.id}`, crew: p.pm, truck: "Truck 2", day: "", start: "07:00", end: "15:00", scopes: [p.product] }]
        : [],
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
      packages: [{ id: `PKG-${p.id}`, name: p.product, status: p.status === "Closed" ? ("Done" as const) : ("Queued" as const), crew: p.pm }],
      appointments: p.install ? [{ id: `JA-${p.id}`, kind: "Install" as const, day: p.install, window: "7a–3p", crew: p.pm, status: "Set" as const }] : [],
      punch: [],
      equipment: [],
      checks: defaultChecks(),
      hours: [],
      access: "",
    };
    });
  return [cho, ...rest];
}
