import { accounts, leads, projects } from "@/lib/crm-data";
import { cashLoan, defaultChecks, defaultPacket, defaultPost, defaultPre, emptyPermit, emptyRebate, emptyTest, type JobFile, type Stage } from "../types";
import { atticBefore, prep_seedJobs, stampJob, withPrep, withAccept } from "./part-01";

export function step_03(ctx: any): any {
ctx.rest = projects
    .filter((p) => p.id !== "P-331")
    .map((p) => {
      const account = accounts.find((a) => a.id === p.accountId);
      const lead = leads.find((l) => l.name === account?.name);
      const contact = lead?.id ?? p.accountId;
      const sid = `SC-${p.id}`;
      return {
        jobId: p.id,
        personId: contact,
        leadId: lead?.id ?? "",
        accountId: p.accountId,
        name: p.name,
        product: p.product,
        pm: p.pm,
        closer: account?.owner || "Dana Ortiz",
        stage: (p.status === "On hold" ? "Sold" : p.status) as Stage,
        holds: p.status === "On hold" ? [{ kind: "HOA" as const, note: "Waiting on HOA. Need the written sign-off.", at: "Sep 10" }] : [],
        sold: p.amount,
        labor: Math.round(p.amount * 0.12),
        commission: Math.round(p.amount * 0.1),
        commissions: [{ id: `CM-${p.id}`, who: "Dana Ortiz", role: "Closer" as const, pct: 10, paid: false }],
        extras: 0,
        crew: p.pm,
        truck: "Truck 2",
        window: p.install,
        assignments: p.install
          ? [{ id: `CA-${p.id}`, crew: p.pm, truck: "Truck 2", day: "", start: "07:00", end: "15:00", scopes: [sid], kind: "internal" as const, company: "" }]
          : [],
        soldNotes: "",
        scope: [{ id: sid, label: p.product, kind: "product" as const, categoryId: p.product.toLowerCase().includes("hvac") ? "hvac" : p.product.toLowerCase().includes("duct") || p.product.toLowerCase().includes("aero") ? "ducts" : "attic", amount: p.amount, qty: 1, notes: "", quotedCost: Math.round(p.amount * 0.4), estHours: 8, media: [], owner: "", promiseDone: false, bom: [] }],
        warranty: p.product.toLowerCase().includes("attic"),
        loan: { ...cashLoan(), amount: p.amount },
        workOrders: [],
        pos: [],
        changeOrders: [],
        invoices:
          p.status === "Closed"
            ? [{ id: `INV-${p.id.slice(2)}`, kind: "Final" as const, amount: p.amount, paid: p.amount, status: "Paid" as const, payments: [{ id: `PY-${p.id}`, amount: p.amount, at: p.install, how: "Cash", status: "Paid" as const }] }]
            : [],
        events: p.install ? [{ id: `EV-${p.id}`, scopeId: sid, process: p.product, day: p.install, start: "07:00", end: "15:00", crew: p.pm, status: "Set" as const }] : [],
        punch: [],
        equipment: [],
        checks: defaultChecks(),
        punches: [],
        access: "",
        permit: emptyPermit(),
        rebate: emptyRebate(),
        testOut: emptyTest(),
        preCheck: defaultPre(),
        postCheck: defaultPost(),
        packet: defaultPacket(),
        installRev: 1,
        financeRev: 1,
      };
    });
return { __halt: true as const, __ret: [ctx.cho, ...ctx.rest].map((job) => withPrep(withAccept(stampJob(job)))) }
}
