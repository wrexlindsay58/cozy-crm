import { accounts, leads, projects } from "@/lib/crm-data";
import { cashLoan, defaultChecks, defaultPacket, defaultPost, defaultPre, emptyPermit, emptyRebate, emptyTest, type JobFile, type Stage } from "../types";
import { atticBefore, prep_seedJobs, stampJob, withPrep, withAccept } from "./part-01";

export function step_02(ctx: any): any {
ctx.__bag2 = {
  warranty: true,
  loan: {
        vendor: "GoodLeap",
        amount: 31250,
        dealerFee: 2188,
        term: 144,
        rate: 7.99,
        status: "NTP",
        notes: "Stip: proof of insurance. Alyssa is the borrower.",
        fundedAmount: 0,
      },
  workOrders: [
        {
          id: "WO-14",
          assignId: "CA-1",
          status: "Sent",
          day: "2026-09-22",
          crew: "Crew 2 — Tasha",
          notes: "Attic R-49 + ducts.",
          file: { name: "WO-14.pdf", url: "#" },
          since: "2026-09-20",
        },
      ],
  pos: [
        { id: "PO-88", vendor: "Carrier", amount: 9800, status: "Sent", what: "4-ton condenser + coil", scopeId: "SC-2", since: "2026-09-15", file: { name: "PO-88-Carrier.pdf", url: "#" } },
        { id: "PO-81", vendor: "GreenFiber", amount: 2100, status: "Received", what: "Cellulose", scopeId: "SC-1", file: { name: "PO-81-GreenFiber.pdf", url: "#" } },
      ],
  changeOrders: [],
  invoices: [
        {
          id: "INV-41",
          kind: "Deposit",
          amount: 5000,
          paid: 0,
          status: "Sent",
          file: { name: "INV-41.pdf", url: "#" },
          payments: [],
          since: "2026-09-18",
        },
        {
          id: "INV-42",
          kind: "Progress",
          amount: 8000,
          paid: 0,
          status: "Draft",
          payments: [],
          party: "customer",
          since: "2026-09-23",
        },
      ],
  events: [
        { id: "EV-1", scopeId: "SC-1", process: "Attic blow", day: "2026-09-22", start: "07:00", end: "15:00", crew: "Crew 2 — Tasha", assignId: "CA-1", status: "Set" },
        { id: "EV-2", scopeId: "SC-3", process: "Ducts", day: "2026-09-22", start: "07:00", end: "15:00", crew: "Crew 2 — Tasha", assignId: "CA-1", status: "Set" },
      ],
  punch: [{ id: "PU-1", item: "Seal hatch weatherstrip", owner: "Crew 2", status: "Open" }],
  equipment: [
        { id: "EQ-1", name: "4-ton condenser", model: "24ACC636A003", serial: "", ahri: "207398123", eta: "Sep 19", status: "Ordered", oldRecovered: false, scopeId: "SC-2" },
        { id: "EQ-2", name: "Coil", model: "CAPFA1818C6", serial: "", ahri: "", eta: "Sep 19", status: "Ordered", oldRecovered: false, scopeId: "SC-2" },
      ],
  checks: defaultChecks().map((c) => (c.id === "equip" ? { ...c, on: true } : c)),
  punches: [{ id: "HR-1", who: "Tasha Reed", day: "Sep 12", scopeId: "SC-1", leftYard: "06:40", onSite: "07:10", complete: "09:00", back: "09:25" }],
  laborLines: [
        { id: "LB-1", who: "Tasha Reed", kind: "Hourly" as const, qty: 2.6, rate: 32 },
        { id: "LB-2", who: "Omar Diaz", kind: "Piece" as const, qty: 1, rate: 185, service: "Attic blow" },
      ],
  access: "Side gate. Dogs in. HOA needs dumpster off the street.",
  permit: { number: "MECH-4491", city: "Scottsdale", inspection: "2026-09-24", result: "Scheduled", file: { name: "permit-MECH-4491.pdf", url: "#" } },
  rebate: { utility: "SRP", program: "Home Performance", amount: 800, status: "Reserved", reservation: "SRP-8821", file: undefined },
  testOut: emptyTest(),
  preCheck: {
        ...defaultPre(),
        items: defaultPre().items.map((i) => ({
          ...i,
          on: true,
          callout: i.id === "hoa" ? "Dumpster off the street for HOA." : i.id === "access" ? "Hatch in the hall. Side gate. Both home." : i.id === "pets" ? "Dogs in." : i.callout,
        })),
        signedBy: "Alyssa Cho",
        signedAt: "Sep 8",
      },
  postCheck: defaultPost(),
  packet: defaultPacket(),
  installRev: 1,
  financeRev: 1,
  };
ctx.cho = {...ctx.__bag0, ...ctx.__bag1, ...ctx.__bag2};
}
