import { useSyncExternalStore } from "react";
import { addHistory, createAction, setWorkStatus } from "@/features/ops/store";
import { kindFromFile, putPhoto } from "@/features/photos/store";
import { crewOf, membersOf, payFor, SHOP_CREWS, vehicleLabel } from "@/features/staff/store";
import { putFromJob } from "@/features/book/store";
import { seedJobs } from "./seed";
import {
  closeBlocks,
  commissionCost,
  contractTotal,
  inferStage,
  materialCost,
  processFor,
  punchHours,
  quotedMaterials,
  STAGES,
  trueDiscount,
  type ChangeOrder,
  type CommShare,
  type CrewAssign,
  type EquipRow,
  type CostHit,
  type FieldExtra,
  type Hold,
  type JobEvent,
  type JobFile,
  type JobInvoice,
  type JobSurvey,
  type LaborKind,
  type LaborLine,
  type LoanFile,
  type MediaCat,
  type PayStatus,
  type PermitFile,
  type PunchItem,
  type PurchaseOrder,
  type RebateFile,
  type SalesFault,
  type ScopeLine,
  type ScopeMedia,
  type Stage,
  type TestOut,
  type TimePunch,
  type WorkOrder,
} from "./types";

export type {
  ChangeOrder,
  CrewAssign,
  EquipRow,
  Hold,
  HoldRow,
  JobEvent,
  JobFile,
  JobInvoice,
  LoanFile,
  PunchItem,
  PurchaseOrder,
  Stage,
  WorkOrder,
} from "./types";
export { CHAPTERS, closeBlocks, contractTotal, HOLDS, inferStage, jobTone, materialCost, MEDIA_CATS, PROCESSES, punchHours, quotedMaterials, STAGES, bomAssumed, bomOrderedCost, bomJobCost, trueDiscount } from "./types";

let jobs: Record<string, JobFile> = Object.fromEntries(seedJobs().map((j) => [j.jobId, syncPayInvoices(laborFromCrew(j))]));
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snap() {
  return jobs;
}
export function useJobs() {
  useSyncExternalStore(subscribe, snap, snap);
  return jobs;
}
export function useJob(jobId: string) {
  return useJobs()[jobId];
}
export function approvedCos(job: JobFile) {
  return job.changeOrders.filter((c) => c.status === "Approved").reduce((s, c) => s + c.amount, 0);
}
export function poReceived(job: JobFile) {
  return job.pos.filter((p) => p.status === "Received" || p.status === "Closed").reduce((s, p) => s + p.amount, 0);
}
export function poWatch(job: JobFile) {
  return job.pos.filter((p) => p.status === "Sent" || p.status === "Partial").reduce((s, p) => s + p.amount, 0);
}
export function isPayBill(i: JobInvoice) {
  return i.party === "pay" || i.kind === "Commission" || i.kind === "Piece";
}
export function invoiced(job: JobFile) {
  return job.invoices.filter((i) => !isPayBill(i) && i.status !== "Void" && i.status !== "Draft").reduce((s, i) => s + i.amount, 0);
}
export function paid(job: JobFile) {
  return job.invoices.filter((i) => !isPayBill(i)).reduce((s, i) => s + i.paid, 0);
}
export function quotedCost(job: JobFile) {
  return job.scope.reduce((s, r) => s + r.quotedCost, 0);
}
export function laborRows(job: JobFile) {
  if (job.laborLines?.length) {
    return job.laborLines.map((l) => {
      const amount = l.actual ?? (l.kind === "Piece" ? l.rate : Math.round(l.qty * l.rate));
      const note = l.kind === "Piece" ? (l.service || "Piece") : l.kind === "Hourly" ? `${l.qty}h × $${l.rate}` : `${l.qty} day × $${l.rate}`;
      return { who: l.who, kind: l.kind, note, amount };
    });
  }
  if (!job.punches.length) return [{ who: "Quoted", kind: "Quoted", note: "Until labor posts", amount: job.labor }];
  return job.punches.map((p) => {
    const pay = payFor(p.who);
    const hrs = punchHours(p).total;
    if (pay.kind === "Hourly") {
      return { who: p.who, kind: pay.kind, note: `${hrs.toFixed(1)}h × $${pay.rate}`, amount: Math.round(hrs * pay.rate) };
    }
    if (pay.kind === "Piece") {
      return { who: p.who, kind: pay.kind, note: `Piece · ${p.day}`, amount: pay.rate };
    }
    return { who: p.who, kind: pay.kind, note: `Day · ${p.day}`, amount: pay.rate };
  });
}
export function laborActual(job: JobFile) {
  const rows = laborRows(job);
  const sum = rows.reduce((s, r) => s + r.amount, 0);
  return sum || job.labor;
}
export function tally(job: JobFile) {
  const revenue = contractTotal(job);
  const labor = laborActual(job);
  const fee = job.loan.vendor === "GoodLeap" ? job.loan.dealerFee : 0;
  const mats = materialCost(job);
  const comm = commissionCost(job);
  const adders = job.scope.filter((s) => s.kind === "adder").reduce((s, r) => s + r.amount, 0);
  const discounts = job.scope.filter((s) => s.kind === "discount" || s.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  const td = trueDiscount(job);
  const cogs = labor + mats + job.extras + td.fieldHits + fee;
  const cost = cogs;
  const quoted = quotedCost(job);
  const invoicedAmt = invoiced(job);
  const paidAmt = paid(job);
  const funded = job.loan.vendor === "GoodLeap" ? job.loan.fundedAmount : 0;
  return {
    revenue,
    cost,
    quoted,
    labor,
    laborRows: laborRows(job),
    mats,
    materialReturns: job.scope.reduce((s, sc) => s + sc.bom.reduce((b, l) => b + (l.returnCredit || 0), 0), 0),
    warehouse: job.scope.reduce((s, sc) => s + sc.bom.reduce((b, l) => b + (l.warehouseQty || 0) * (l.actualUnitCost ?? l.unitCost), 0), 0),
    quotedMats: quotedMaterials(job),
    adders,
    discounts,
    cogs,
    commission: comm,
    gross: revenue - cogs,
    margin: revenue - cogs - comm,
    quotedMargin: revenue - quoted - comm,
    invoiced: invoicedAmt,
    paid: paidAmt,
    funded,
    collect: Math.max(0, revenue - paidAmt - funded),
    overUnder: invoicedAmt - revenue,
    watch: poWatch(job),
    balance: invoicedAmt - paidAmt,
    trueDiscount: td,
  };
}
function customerLines(j: JobFile) {
  return j.scope
    .filter((s) => s.kind !== "promise")
    .map((s) => ({ id: s.id, label: s.label, amount: s.amount, qty: s.qty }));
}
function sharePay(j: JobFile, c: CommShare) {
  const td = trueDiscount(j);
  if (c.role === "Setter") return Math.round(td.base * (c.pct / 100));
  const n = Math.max(1, (j.commissions ?? []).filter((x) => x.role !== "Setter").length);
  return Math.round((td.base * td.rate) / 100 / n);
}
function syncPayInvoices(j: JobFile): JobFile {
  const keep = j.invoices.filter((i) => !isPayBill(i)).map((i) => ({
    ...i,
    party: i.party ?? "customer",
    itemize: i.itemize ?? false,
    lines: i.lines ?? customerLines(j),
  }));
  const prev = new Map(j.invoices.map((i) => [i.id, i]));
  const pay: JobInvoice[] = [];
  for (const c of j.commissions ?? []) {
    const amount = sharePay(j, c);
    const id = `INV-CM-${c.id}`;
    const old = prev.get(id);
    pay.push({
      id,
      kind: "Commission",
      party: "pay",
      who: c.who,
      amount,
      paid: c.paid ? amount : old?.paid ?? 0,
      status: c.paid ? "Paid" : old?.status ?? "Draft",
      itemize: true,
      lines: [{ id: `${id}-1`, label: `${c.role} · ${c.who}`, amount }],
      payments: old?.payments ?? [],
      file: old?.file ?? { name: `${id}.pdf`, url: "#" },
    });
  }
  for (const l of j.laborLines ?? []) {
    if (l.kind !== "Piece") continue;
    const amount = l.actual ?? l.rate;
    if (amount <= 0) continue;
    const id = `INV-PC-${l.id}`;
    const old = prev.get(id);
    pay.push({
      id,
      kind: "Piece",
      party: "pay",
      who: l.who,
      amount,
      paid: old?.paid ?? 0,
      status: old?.status ?? "Draft",
      itemize: true,
      lines: [{ id: `${id}-1`, label: l.service || "Piece rate", amount }],
      payments: old?.payments ?? [],
      file: old?.file ?? { name: `${id}.pdf`, url: "#" },
    });
  }
  return { ...j, invoices: [...keep, ...pay] };
}
function patch(jobId: string, fn: (j: JobFile) => JobFile, opts?: { nudge?: boolean }) {
  const cur = jobs[jobId];
  if (!cur) return;
  let next = syncPayInvoices(fn(cur));
  if (opts?.nudge !== false && next.stage !== "Closed") {
    const inferred = inferStage(next);
    if (STAGES.indexOf(inferred) > STAGES.indexOf(next.stage)) {
      addHistory(next.personId, next.pm, `Stage → ${inferred}.`);
      next = { ...next, stage: inferred };
    }
  }
  jobs = { ...jobs, [jobId]: next };
  emit();
}
export function applyCommissionPct(pct: number) {
  const rate = Math.max(0, pct);
  jobs = Object.fromEntries(
    Object.entries(jobs).map(([id, j]) => {
      const commissions = (j.commissions ?? []).map((c, i, all) => {
        const closers = all.filter((x) => x.role === "Closer" || x.role === "Split");
        if (closers.length === 1 && c.id === closers[0].id) return { ...c, pct: rate };
        return c;
      });
      const commission = commissions.length ? commissions.reduce((s, c) => s + Math.round(j.sold * (c.pct / 100)), 0) : Math.round(j.sold * (rate / 100));
      return [id, { ...j, commissions, commission }];
    }),
  );
  emit();
}
export function addCommission(jobId: string, role: CommShare["role"]) {
  patch(jobId, (j) => {
    const row: CommShare = {
      id: `CM-${Date.now()}`,
      who: role === "Setter" ? "Setter" : j.closer,
      role,
      pct: role === "Setter" ? 1 : role === "Split" ? 5 : 10,
      paid: false,
    };
    const commissions = [...(j.commissions ?? []), row];
    return { ...j, commissions, commission: commissions.reduce((s, c) => s + Math.round(j.sold * (c.pct / 100)), 0) };
  }, { nudge: false });
}
export function patchCommission(jobId: string, id: string, row: Partial<CommShare>) {
  patch(jobId, (j) => {
    if (row.paid && tally(j).collect > 0) return j;
    const commissions = (j.commissions ?? []).map((c) => (c.id === id ? { ...c, ...row } : c));
    return { ...j, commissions, commission: commissions.reduce((s, c) => s + Math.round(j.sold * (c.pct / 100)), 0) };
  }, { nudge: false });
}
export function removeCommission(jobId: string, id: string) {
  patch(jobId, (j) => {
    const commissions = (j.commissions ?? []).filter((c) => c.id !== id);
    return { ...j, commissions, commission: commissions.reduce((s, c) => s + Math.round(j.sold * (c.pct / 100)), 0) };
  }, { nudge: false });
}
export function addLaborer(jobId: string, crew = "") {
  patch(jobId, (j) => {
    const crews = assignedCrews(j);
    const pick = crew || crews[0] || "Crew 2 — Tasha";
    const taken = new Set((j.laborLines ?? []).map((l) => l.who));
    const who = membersOf(pick).find((n) => !taken.has(n)) || membersOf(pick)[0] || "";
    if (!who) return j;
    const service = defaultService(j);
    const pay = payFor(who, service);
    const row: LaborLine = {
      id: `LB-${Date.now()}`,
      who,
      crew: pick,
      kind: pay.kind,
      qty: pay.kind === "Hourly" ? 8 : 1,
      rate: pay.rate,
      service: pay.kind === "Piece" ? service : "",
      added: true,
    };
    return { ...j, laborLines: [...(j.laborLines ?? []), row] };
  }, { nudge: false });
}
export function patchLabor(jobId: string, id: string, row: Partial<LaborLine>) {
  patch(jobId, (j) => ({
    ...j,
    laborLines: (j.laborLines ?? []).map((l) => {
      if (l.id !== id) return l;
      const next = { ...l, ...row };
      if (row.crew && !row.who) {
        const first = membersOf(row.crew).find((n) => n !== l.who) ?? membersOf(row.crew)[0];
        if (first) next.who = first;
      }
      if (row.who || row.service || row.crew) {
        const pay = payFor(next.who, next.service);
        next.kind = row.kind ?? pay.kind;
        if (row.rate == null) next.rate = pay.rate;
      }
      return next;
    }),
  }), { nudge: false });
}
export function removeLabor(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, laborLines: (j.laborLines ?? []).filter((l) => l.id !== id) }), { nudge: false });
}
export function setStage(jobId: string, stage: Stage) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Stage → ${stage}.`);
    return { ...j, stage };
  }, { nudge: false });
}
export function toggleHold(jobId: string, kind: Hold) {
  patch(jobId, (j) => {
    const on = j.holds.some((h) => h.kind === kind);
    addHistory(j.personId, j.pm, on ? `Hold cleared: ${kind}.` : `Hold set: ${kind}.`);
    return { ...j, holds: on ? j.holds.filter((h) => h.kind !== kind) : [...j.holds, { kind, note: "", at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }] };
  });
}
export function setHoldNote(jobId: string, kind: Hold, note: string) {
  patch(jobId, (j) => ({ ...j, holds: j.holds.map((h) => (h.kind === kind ? { ...h, note } : h)) }), { nudge: false });
}
function assignedCrews(j: JobFile) {
  return [...new Set(j.assignments.filter((a) => a.kind !== "sub").map((a) => a.crew).filter(Boolean))];
}
function defaultService(j: JobFile) {
  const product = j.scope.find((s) => s.kind === "product");
  return product ? processFor(product.label) : "Attic blow";
}
function laborFromCrew(j: JobFile): JobFile {
  const wanted: { crew: string; who: string }[] = [];
  for (const crew of assignedCrews(j)) {
    for (const who of membersOf(crew)) wanted.push({ crew, who });
  }
  const existing = j.laborLines ?? [];
  const auto = wanted.map(({ crew, who }) => {
    const prev = existing.find((l) => !l.added && l.who === who && (l.crew || crewOf(l.who)) === crew);
    if (prev) return { ...prev, crew };
    const service = defaultService(j);
    const pay = payFor(who, service);
    return {
      id: `LB-${crew}-${who}`.replace(/\s+/g, ""),
      who,
      crew,
      kind: pay.kind,
      qty: pay.kind === "Hourly" ? 8 : pay.kind === "Salary" ? 1 : 1,
      rate: pay.rate,
      service: pay.kind === "Piece" ? service : "",
    };
  });
  const extras = existing.filter((l) => l.added);
  return { ...j, laborLines: [...auto, ...extras] };
}
function syncCrew(j: JobFile): JobFile {
  const first = j.assignments[0];
  const base = !first ? { ...j, crew: "", truck: "", window: "" } : { ...j, crew: first.crew, truck: first.truck, window: first.day ? `${first.day} · ${first.start}–${first.end}` : j.window };
  return laborFromCrew(base);
}
function vehicleFromCrew(crew: string) {
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
function eventsFromAssign(j: JobFile, a: CrewAssign): JobEvent[] {
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
export function sendAssignWo(jobId: string, assignId: string) {
  patch(jobId, (j) => {
    const a = j.assignments.find((x) => x.id === assignId);
    if (!a) return j;
    const who = a.kind === "sub" ? a.company || a.crew : a.crew;
    const row: WorkOrder = {
      id: a.woId ?? `WO-${10 + j.workOrders.length}`,
      assignId: a.id,
      status: "Sent",
      day: a.day || j.window,
      crew: who,
      notes: a.scopes.map((id) => j.scope.find((s) => s.id === id)?.label ?? id).join(", "),
      file: { name: `${a.woId ?? "WO"}.pdf`, url: "#" },
    };
    addHistory(j.personId, j.pm, `Work order ${row.id} sent to ${who}.`);
    const workOrders = a.woId ? j.workOrders.map((w) => (w.id === a.woId ? { ...w, ...row } : w)) : [row, ...j.workOrders];
    const fresh = eventsFromAssign(j, a);
    const events = [...j.events.filter((e) => e.assignId !== a.id), ...fresh];
    const next = { ...j, workOrders, events, assignments: j.assignments.map((x) => (x.id === assignId ? { ...x, woId: row.id } : x)) };
    fresh.forEach((ev) =>
      putFromJob({
        jobId: j.jobId,
        personId: j.personId,
        title: `${j.name} · ${ev.process}`,
        process: ev.process,
        day: ev.day,
        start: ev.start,
        end: ev.end,
        crew: ev.crew,
        sourceId: ev.id,
        woSigned: false,
      }),
    );
    return next;
  });
}
export function ackWo(jobId: string, woId: string, who: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, who, `WO ${woId} acknowledged.`);
    return { ...j, workOrders: j.workOrders.map((w) => (w.id === woId ? { ...w, status: "Acked", ackedAt: "Now", ackedBy: who } : w)) };
  });
}
export function signWo(jobId: string, woId: string, who: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, who, `WO ${woId} signed.`);
    const assign = j.assignments.find((a) => a.woId === woId);
    j.events.filter((e) => e.assignId === assign?.id).forEach((ev) =>
      putFromJob({
        jobId: j.jobId,
        personId: j.personId,
        title: `${j.name} · ${ev.process}`,
        process: ev.process,
        day: ev.day,
        start: ev.start,
        end: ev.end,
        crew: ev.crew,
        sourceId: ev.id,
        woSigned: true,
      }),
    );
    return { ...j, workOrders: j.workOrders.map((w) => (w.id === woId ? { ...w, status: "Signed", signedAt: "Now", signedBy: who } : w)) };
  });
}
export function issueWo(jobId: string) {
  const j = jobs[jobId];
  if (j?.assignments[0]) sendAssignWo(jobId, j.assignments[0].id);
}
export function patchScope(jobId: string, id: string, row: Partial<ScopeLine>) {
  patch(jobId, (j) => {
    const line = j.scope.find((s) => s.id === id);
    if (row.notes != null) addHistory(j.personId, j.pm, `Notes on ${line?.label ?? "scope"}: ${row.notes.trim() || "cleared"}.`);
    else if (row.qty != null) addHistory(j.personId, j.pm, `Qty ${line?.label ?? "scope"} → ${row.qty}.`);
    return { ...j, scope: j.scope.map((s) => (s.id === id ? { ...s, ...row } : s)) };
  }, { nudge: false });
}
export function setSoldNotes(jobId: string, soldNotes: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Sold notes updated.");
    return { ...j, soldNotes };
  }, { nudge: false });
}
export function addCostHit(jobId: string, kind: CostHit["kind"], reason: SalesFault | FieldExtra, amount: number, note = "") {
  if (amount <= 0) return;
  patch(jobId, (j) => {
    const row: CostHit = {
      id: `CH-${Date.now()}`,
      kind,
      reason,
      amount,
      note: note.trim(),
      at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    addHistory(j.personId, j.pm, `${reason} ${kind === "sales" ? "true discount" : "field extra"} $${amount}.`);
    return { ...j, costHits: [...(j.costHits ?? []), row] };
  }, { nudge: false });
}
export function removeCostHit(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, costHits: (j.costHits ?? []).filter((h) => h.id !== id) }), { nudge: false });
}
export function addScopeMedia(jobId: string, scopeId: string, file: File, cat: MediaCat, extra?: { caption?: string; purpose?: string; name?: string }) {
  const url = URL.createObjectURL(file);
  const kind: ScopeMedia["kind"] = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "photo" : "doc";
  const row: ScopeMedia = { id: `M-${Date.now()}`, cat, name: extra?.name?.trim() || file.name, url, kind, caption: extra?.caption, purpose: extra?.purpose };
  patch(jobId, (j) => {
    const line = j.scope.find((s) => s.id === scopeId);
    addHistory(j.personId, j.pm, `Media ${row.name} on ${line?.label ?? "job"}${row.caption ? `. ${row.caption}` : ""}.`);
    putPhoto(j.personId, { id: row.id, personId: j.personId, caption: `${row.purpose || cat} · ${row.caption || row.name}`, tone: "info", src: url, kind: kindFromFile(file), name: row.name });
    return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, media: [row, ...s.media] } : s)) };
  }, { nudge: false });
}
export function addChangeOrder(jobId: string, why: string, amount: number, cost: number, lane: ChangeOrder["lane"] = "install") {
  if (!why.trim() || amount <= 0) return;
  patch(jobId, (j) => {
    const row: ChangeOrder = { id: `CO-${j.changeOrders.length + 1}`, why: why.trim(), amount, cost, status: "Approved", lane, signed: false };
    addHistory(j.personId, j.pm, `${lane === "finance" ? "GoodLeap" : "Install"} change order ${why.trim()} +$${amount}.`);
    return {
      ...j,
      changeOrders: [row, ...j.changeOrders],
      extras: lane === "install" ? j.extras + cost : j.extras,
      installRev: lane === "install" ? j.installRev + 1 : j.installRev,
      financeRev: lane === "finance" ? j.financeRev + 1 : j.financeRev,
      scope:
        lane === "install"
          ? [...j.scope, { id: `SC-${Date.now()}`, label: why.trim(), kind: "adder", categoryId: j.scope[0]?.categoryId ?? "attic", amount, qty: 1, notes: "", quotedCost: cost, estHours: 2, media: [], owner: "", promiseDone: false, bom: [] }]
          : j.scope,
    };
  });
}
export function signCo(jobId: string, id: string) {
  patch(jobId, (j) => ({
    ...j,
    changeOrders: j.changeOrders.map((c) => (c.id === id ? { ...c, signed: true, signedAt: "Now", status: "Approved" } : c)),
  }));
}
export function signFinanceCo(jobId: string) {
  patch(jobId, (j) => ({ ...j, financeRev: j.installRev }), { nudge: false });
}
export function setLoanStatus(jobId: string, status: LoanFile["status"]) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `GoodLeap ${status}.`);
    return { ...j, loan: { ...j.loan, status } };
  }, { nudge: false });
}
export function sendCompletionCert(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Completion cert sent to GoodLeap.");
    return { ...j, loan: { ...j.loan, status: j.loan.status === "NTP" || j.loan.status === "Received" ? "Complete" : j.loan.status, notes: [j.loan.notes, "Completion cert sent."].filter(Boolean).join(" ") } };
  }, { nudge: false });
}
export function sendGoodLeapPay(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Funding request sent to GoodLeap.");
    return { ...j, loan: { ...j.loan, paySentAt: j.loan.paySentAt || "Now", status: j.loan.status === "NTP" ? "Complete" : j.loan.status } };
  }, { nudge: false });
}
export function receiveGoodLeapPay(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `GoodLeap funded ${j.loan.amount}.`);
    return { ...j, loan: { ...j.loan, fundedAmount: j.loan.amount, payReceivedAt: "Now", status: "Funded" } };
  }, { nudge: false });
}
export function addPurchaseOrder(jobId: string, vendor: string, what: string, amount: number, received: boolean) {
  if (!vendor.trim() || amount <= 0) return;
  patch(jobId, (j) => {
    const row: PurchaseOrder = { id: `PO-${60 + j.pos.length}`, vendor: vendor.trim(), what: what.trim() || vendor.trim(), amount, status: received ? "Received" : "Sent", file: { name: `${vendor}.pdf`, url: "#" } };
    addHistory(j.personId, j.pm, received ? `PO received ${vendor} $${amount}.` : `PO sent ${vendor} $${amount}.`);
    return { ...j, pos: [row, ...j.pos] };
  });
}
export function receivePo(jobId: string, poId: string) {
  patch(jobId, (j) => ({ ...j, pos: j.pos.map((p) => (p.id === poId ? { ...p, status: "Received" } : p)) }));
}
export function addInvoice(jobId: string, kind: JobInvoice["kind"], amount: number) {
  if (amount <= 0) return;
  patch(jobId, (j) => {
    const row: JobInvoice = {
      id: `INV-${30 + j.invoices.length}`,
      kind,
      amount,
      paid: 0,
      status: "Sent",
      file: { name: `INV.pdf`, url: "#" },
      payments: [],
      party: "customer",
      itemize: false,
      lines: customerLines(j),
    };
    addHistory(j.personId, j.pm, `${kind} invoice sent ${amount}.`);
    return { ...j, invoices: [row, ...j.invoices] };
  });
}
export function setInvoiceItemize(jobId: string, invoiceId: string, itemize: boolean) {
  patch(jobId, (j) => ({ ...j, invoices: j.invoices.map((i) => (i.id === invoiceId ? { ...i, itemize } : i)) }), { nudge: false });
}
export function setInvoiceStatus(jobId: string, invoiceId: string, status: PayStatus) {
  patch(jobId, (j) => ({ ...j, invoices: j.invoices.map((i) => (i.id === invoiceId ? { ...i, status } : i)) }));
}
export function payInvoice(jobId: string, invoiceId: string, how = "Card") {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Invoice ${invoiceId} paid.`);
    return {
      ...j,
      invoices: j.invoices.map((i) =>
        i.id === invoiceId
          ? { ...i, paid: i.amount, status: "Paid", payments: [...i.payments, { id: `PY-${Date.now()}`, amount: i.amount - i.paid, at: "Now", how, status: "Paid" }] }
          : i,
      ),
    };
  });
}
export function patchLoan(jobId: string, row: Partial<LoanFile>) {
  patch(jobId, (j) => {
    const loan = { ...j.loan, ...row };
    if (loan.status === "Funded" && loan.fundedAmount <= 0) loan.fundedAmount = loan.amount;
    addHistory(j.personId, j.pm, `GoodLeap ${loan.status}.`);
    return { ...j, loan };
  });
}
export function setEventStatus(jobId: string, id: string, status: JobEvent["status"]) {
  patch(jobId, (j) => ({ ...j, events: j.events.map((e) => (e.id === id ? { ...e, status } : e)) }));
}
export function addEvent(jobId: string, process: string, scopeId: string, day: string, start = "07:00", end = "15:00", crew?: string, why?: string) {
  const id = `EV-${Date.now()}`;
  patch(jobId, (j) => {
    const scope = j.scope.find((s) => s.id === scopeId);
    const who = crew || j.crew;
    const row: JobEvent = { id, scopeId, process, day: day.trim(), start, end, crew: who, why: why?.trim() || undefined, status: "Set" };
    addHistory(j.personId, j.pm, `${process} · ${scope?.label ?? ""} ${row.day || "needs a day"}${why ? ` · ${why}` : ""}.`);
    if (row.day) {
      putFromJob({
        jobId: j.jobId,
        personId: j.personId,
        title: `${j.name} · ${process}`,
        process,
        day: row.day,
        start: row.start,
        end: row.end,
        crew: row.crew,
        sourceId: row.id,
      });
    }
    return { ...j, events: [...j.events, row] };
  });
  return id;
}
export function patchEvent(jobId: string, id: string, row: Partial<JobEvent>) {
  patch(jobId, (j) => {
    const cur = j.events.find((e) => e.id === id);
    const next = j.events.map((e) => (e.id === id ? { ...e, ...row } : e));
    if (cur && row.day && !cur.day) {
      const ev = next.find((e) => e.id === id);
      if (ev) {
        putFromJob({
          jobId: j.jobId,
          personId: j.personId,
          title: `${j.name} · ${ev.process}`,
          process: ev.process,
          day: ev.day,
          start: ev.start,
          end: ev.end,
          crew: ev.crew,
          sourceId: ev.id,
        });
      }
    }
    return { ...j, events: next };
  });
}
export function removeEvent(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, events: j.events.filter((e) => e.id !== id) }));
}
export function addPunch(jobId: string, item: string) {
  if (!item.trim()) return;
  patch(jobId, (j) => ({ ...j, punch: [{ id: `PU-${Date.now()}`, item: item.trim(), owner: j.crew, status: "Open" }, ...j.punch] }));
}
export function togglePunch(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, punch: j.punch.map((p) => (p.id === id ? { ...p, status: p.status === "Open" ? "Done" : "Open" } : p)) }));
}
export function addEquip(jobId: string, name: string, eta: string) {
  if (!name.trim()) return;
  patch(jobId, (j) => ({
    ...j,
    equipment: [...j.equipment, { id: `EQ-${Date.now()}`, name: name.trim(), model: "", serial: "", ahri: "", eta: eta.trim() || "TBD", status: "Ordered", oldRecovered: false }],
  }));
}
export function setEquip(jobId: string, id: string, patchRow: Partial<EquipRow>) {
  patch(jobId, (j) => ({ ...j, equipment: j.equipment.map((e) => (e.id === id ? { ...e, ...patchRow } : e)) }));
}
export function toggleCheck(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, checks: j.checks.map((c) => (c.id === id ? { ...c, on: !c.on } : c)) }));
}
export function handsOnJob(j: JobFile) {
  const crews = assignedCrews(j);
  const names = crews.length ? crews.flatMap((c) => membersOf(c)) : [];
  return [...new Set(names.filter(Boolean))];
}
export function crewsOnJob(j: JobFile) {
  const on = assignedCrews(j);
  return on.length ? on : [];
}
export function addTimePunch(jobId: string, who: string, day: string) {
  if (!who.trim()) return;
  const row: TimePunch = { id: `HR-${Date.now()}`, who: who.trim(), day: day || "Today", leftYard: "", onSite: "", complete: "", back: "" };
  patch(jobId, (j) => ({ ...j, punches: [row, ...j.punches] }));
}
export function patchPunchClock(jobId: string, id: string, row: Partial<TimePunch>) {
  patch(jobId, (j) => {
    const punches = j.punches.map((p) => (p.id === id ? { ...p, ...row } : p));
    const labor = punches.reduce((s, p) => s + Math.round(punchHours(p).total * 55), 0);
    return { ...j, punches, labor: labor || j.labor };
  });
}
export function setAccess(jobId: string, access: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Access notes updated.");
    return { ...j, access };
  }, { nudge: false });
}
export function patchPermit(jobId: string, row: Partial<PermitFile>) {
  patch(jobId, (j) => ({ ...j, permit: { ...j.permit, ...row } }));
}
export function patchRebate(jobId: string, row: Partial<RebateFile>) {
  patch(jobId, (j) => ({ ...j, rebate: { ...j.rebate, ...row } }), { nudge: false });
}
export function patchTest(jobId: string, row: Partial<TestOut>) {
  patch(jobId, (j) => ({ ...j, testOut: { ...j.testOut, ...row } }));
}
export function togglePre(jobId: string, id: string) {
  patch(jobId, (j) => {
    const items = j.preCheck.items.map((i) => (i.id === id ? { ...i, on: !i.on } : i));
    const row = items.find((i) => i.id === id);
    addHistory(j.personId, j.pm, `Pre-install ${row?.label ?? id} ${row?.on ? "checked" : "cleared"}.`);
    return { ...j, preCheck: { ...j.preCheck, items } };
  }, { nudge: false });
}
export function togglePost(jobId: string, id: string) {
  patch(jobId, (j) => {
    const items = j.postCheck.items.map((i) => (i.id === id ? { ...i, on: !i.on } : i));
    const row = items.find((i) => i.id === id);
    addHistory(j.personId, j.pm, `Post-install ${row?.label ?? id} ${row?.on ? "checked" : "cleared"}.`);
    return { ...j, postCheck: { ...j.postCheck, items } };
  }, { nudge: false });
}
export function setCheckCallout(jobId: string, which: "pre" | "post", id: string, callout: string) {
  patch(jobId, (j) => {
    const key = which === "pre" ? "preCheck" : "postCheck";
    const pack = j[key];
    const items = pack.items.map((i) => (i.id === id ? { ...i, callout } : i));
    const row = items.find((i) => i.id === id);
    addHistory(j.personId, j.pm, `${which === "pre" ? "Pre" : "Post"}-install call-out · ${row?.label ?? id}: ${callout.trim() || "cleared"}.`);
    return { ...j, [key]: { ...pack, items } };
  }, { nudge: false });
}
export function signPre(jobId: string, who: string) {
  if (!who.trim()) return;
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Pre-install signed by ${who.trim()}.`);
    return { ...j, preCheck: { ...j.preCheck, signedBy: who.trim(), signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } };
  }, { nudge: false });
}
export function signPost(jobId: string, who: string) {
  if (!who.trim()) return;
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Post-install signed by ${who.trim()}.`);
    return { ...j, postCheck: { ...j.postCheck, signedBy: who.trim(), signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } };
  }, { nudge: false });
}
export function togglePacket(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, packet: { ...j.packet, parts: j.packet.parts.map((p) => (p.id === id ? { ...p, on: !p.on } : p)) } }), { nudge: false });
}
export function sendPacket(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Closing packet sent.");
    return { ...j, packet: { ...j.packet, sent: true, sentAt: "Now" } };
  }, { nudge: false });
}
export function sendFinalInvoice(jobId: string) {
  patch(jobId, (j) => {
    const due = Math.max(0, contractTotal(j) - paid(j));
    if (due <= 0) return j;
    const row: JobInvoice = {
      id: `INV-${30 + j.invoices.length}`,
      kind: "Final",
      amount: due,
      paid: 0,
      status: "Sent",
      file: { name: "final-invoice.pdf", url: "#" },
      payments: [],
      party: "customer",
      itemize: false,
      lines: customerLines(j),
    };
    addHistory(j.personId, j.pm, `Final invoice sent ${due}.`);
    return { ...j, invoices: [row, ...j.invoices] };
  });
}
export function setPlan(jobId: string, scopeId: string, status: import("./types").PlanStatus) {
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) => (s.id === scopeId ? { ...s, plan: { status, approvedBy: status === "Released" || status === "Approved" ? "Office" : s.plan?.approvedBy ?? "" } } : s)),
  }));
}
export function togglePromise(jobId: string, scopeId: string) {
  patch(jobId, (j) => {
    const line = j.scope.find((s) => s.id === scopeId);
    const next = !line?.promiseDone;
    addHistory(j.personId, j.pm, `Promise ${line?.label ?? "line"} ${next ? "done" : "reopened"}.`);
    return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, promiseDone: next } : s)) };
  }, { nudge: false });
}
export function patchBom(jobId: string, scopeId: string, bomId: string, row: Partial<import("./types").BomLine>) {
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) =>
      s.id === scopeId
        ? {
            ...s,
            bom: s.bom.map((b) => {
              if (b.id !== bomId) return b;
              const next = { ...b, ...row };
              const ordered = next.orderQty ?? next.estQty;
              const left = Math.max(0, ordered - (next.usedQty || 0));
              let ret = next.returnQty || 0;
              let wh = next.warehouseQty || 0;
              if (ret > left) ret = left;
              if (ret + wh > left) wh = Math.max(0, left - ret);
              next.returnQty = ret;
              next.warehouseQty = wh;
              next.leftQty = left;
              if (row.returnQty != null && row.returnCredit == null) {
                next.returnCredit = ret * (next.actualUnitCost ?? next.unitCost);
              }
              if (ret === 0 && row.returnQty != null) next.returnCredit = 0;
              return next;
            }),
          }
        : s,
    ),
  }));
}
export function addBom(jobId: string, scopeId: string, name: string, qty: number, unitCost: number, supplier = "", track?: "bulk" | "unit") {
  if (!name.trim() || qty <= 0) return;
  const kind = track ?? (unitCost >= 200 ? "unit" : "bulk");
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) =>
      s.id === scopeId
        ? {
            ...s,
            bom: [
              ...s.bom,
              {
                id: `B-${Date.now()}`,
                name: name.trim(),
                estQty: qty,
                usedQty: 0,
                unit: "ea",
                unitCost,
                supplier: supplier.trim(),
                ordered: false,
                received: false,
                ready: false,
                track: kind,
                orderQty: qty,
              },
            ],
          }
        : s,
    ),
  }));
}
export function attachPlanFile(jobId: string, scopeId: string, file: File) {
  const url = URL.createObjectURL(file);
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) =>
      s.id === scopeId
        ? {
            ...s,
            plan: { status: s.plan?.status ?? "Draft", approvedBy: s.plan?.approvedBy ?? "", file: { name: file.name, url } },
            media: [{ id: `M-${Date.now()}`, cat: "Design" as const, name: file.name, url, kind: file.type.startsWith("image/") ? ("photo" as const) : ("doc" as const) }, ...s.media],
          }
        : s,
    ),
  }));
}
export function setSurveyDone(jobId: string, scopeId: string, on: boolean) {
  patch(jobId, (j) => {
    if (j.scope.some((s) => s.id === scopeId)) return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveyDone: on } : s)) };
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === scopeId ? { ...s, surveyDone: on } : s)) };
  }, { nudge: false });
}
export function patchSurveyFact(jobId: string, scopeId: string, key: string, value: string) {
  patch(jobId, (j) => {
    if (j.scope.some((s) => s.id === scopeId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveyFacts: { ...s.surveyFacts, [key]: value } } : s)) };
    }
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === scopeId ? { ...s, surveyFacts: { ...s.surveyFacts, [key]: value } } : s)) };
  }, { nudge: false });
}
export function addSurveyRoom(jobId: string, scopeId: string) {
  const room = { id: `R-${Date.now()}`, name: "", area: "", registers: "" };
  patch(jobId, (j) => {
    if (j.scope.some((s) => s.id === scopeId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveyRooms: [...(s.surveyRooms ?? []), room] } : s)) };
    }
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === scopeId ? { ...s, surveyRooms: [...(s.surveyRooms ?? []), room] } : s)) };
  }, { nudge: false });
}
export function patchSurveyRoom(jobId: string, scopeId: string, roomId: string, row: Partial<import("./types").SurveyRoom>) {
  patch(jobId, (j) => {
    if (j.scope.some((s) => s.id === scopeId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveyRooms: (s.surveyRooms ?? []).map((r) => (r.id === roomId ? { ...r, ...row } : r)) } : s)) };
    }
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === scopeId ? { ...s, surveyRooms: (s.surveyRooms ?? []).map((r) => (r.id === roomId ? { ...r, ...row } : r)) } : s)) };
  }, { nudge: false });
}
export function removeJobSurvey(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, surveys: (j.surveys ?? []).filter((s) => s.id !== id) }), { nudge: false });
}
export function skipSurvey(jobId: string, scopeId: string, why: string) {
  const reason = why.trim();
  if (!reason) return;
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveySkip: reason, surveyDone: true } : s)),
  }), { nudge: false });
}
export function patchJobSurvey(jobId: string, id: string, row: Partial<JobSurvey>) {
  patch(jobId, (j) => ({
    ...j,
    surveys: (j.surveys ?? []).map((s) => (s.id === id ? { ...s, ...row } : s)),
  }), { nudge: false });
}
export function addJobSurvey(jobId: string, kind: import("./types").SurveyKind = "other", attachId?: string) {
  const label = { hvac: "HVAC", ducts: "Ducts", attic: "Attic", windows: "Windows", other: "Site survey" }[kind];
  patch(jobId, (j) => {
    if (attachId && j.scope.some((s) => s.id === attachId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === attachId ? { ...s, surveyOn: true } : s)) };
    }
    const row: JobSurvey = { id: `SV-${Date.now()}`, kind, label, surveyDone: false, surveyFacts: {}, surveyRooms: kind === "ducts" ? [{ id: `R-${Date.now()}`, name: "", area: "", registers: "" }] : [], media: [] };
    return { ...j, surveys: [...(j.surveys ?? []), row] };
  });
}
export function addSurveyMedia(jobId: string, surveyId: string, file: File, extra?: { caption?: string; purpose?: string; name?: string; cat?: MediaCat }) {
  const url = URL.createObjectURL(file);
  const kind: ScopeMedia["kind"] = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "photo" : "doc";
  const row: ScopeMedia = { id: `M-${Date.now()}`, cat: extra?.cat ?? "Other", name: extra?.name?.trim() || file.name, url, kind, caption: extra?.caption, purpose: extra?.purpose };
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Media ${row.name}${row.caption ? `. ${row.caption}` : ""}.`);
    putPhoto(j.personId, { id: row.id, personId: j.personId, caption: `${row.purpose || row.cat} · ${row.caption || row.name}`, tone: "info", src: url, kind: kindFromFile(file), name: row.name });
    if (j.scope.some((s) => s.id === surveyId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === surveyId ? { ...s, media: [row, ...s.media] } : s)) };
    }
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === surveyId ? { ...s, media: [row, ...s.media] } : s)) };
  }, { nudge: false });
}
export function patchQcResult(jobId: string, key: string, result: "pass" | "fail") {
  const j = jobs[jobId];
  if (!j) return;
  const cur = j.testOut.results?.[key];
  const next = cur === result ? undefined : result;
  if (next === "fail") failQc(jobId, key);
  patch(jobId, (job) => {
    const results = { ...job.testOut.results };
    if (next) results[key] = next;
    else delete results[key];
    return { ...job, testOut: { ...job.testOut, results } };
  }, { nudge: false });
}
function qcLabel(j: JobFile, key: string) {
  if (key === "blower") return "Blower door";
  if (key === "duct") return "Duct tester";
  return j.scope.find((s) => s.id === key)?.label ?? "QC";
}
function failQc(jobId: string, key: string) {
  const j = jobs[jobId];
  if (!j) return;
  if (j.testOut.fixes?.[key]?.ticketId) return;
  const label = qcLabel(j, key);
  const ticket = createAction({
    kind: "ticket",
    personId: j.personId,
    title: `QC fail · ${label}`,
    owner: j.pm,
    description: `${label} failed QC on ${j.jobId}. ${j.name}. Schedule the fix or mark corrected by QC.`,
    category: "QC",
    priority: "High",
  });
  const scopeId = j.scope.some((s) => s.id === key) ? key : j.scope[0]?.id ?? "";
  const eventId = addEvent(jobId, "Go-back", scopeId, "", "07:00", "15:00", j.crew, `QC fail · ${label}`);
  patch(jobId, (job) => ({
    ...job,
    testOut: {
      ...job.testOut,
      fixes: { ...job.testOut.fixes, [key]: { ticketId: ticket?.id, eventId, correctedByQc: false } },
    },
  }), { nudge: false });
}
export function setQcCorrected(jobId: string, key: string, on: boolean) {
  patch(jobId, (j) => {
    const fix = j.testOut.fixes?.[key] ?? {};
    if (on && fix.ticketId) setWorkStatus("ticket", fix.ticketId, "Complete");
    if (on && fix.eventId) {
      return {
        ...j,
        events: j.events.map((e) => (e.id === fix.eventId ? { ...e, status: "Done" as const, why: `${e.why ?? "QC fail"} · corrected by QC` } : e)),
        testOut: { ...j.testOut, fixes: { ...j.testOut.fixes, [key]: { ...fix, correctedByQc: true } } },
      };
    }
    return { ...j, testOut: { ...j.testOut, fixes: { ...j.testOut.fixes, [key]: { ...fix, correctedByQc: on } } } };
  }, { nudge: false });
}
export function patchQcFact(jobId: string, key: string, value: string) {
  patch(jobId, (j) => ({ ...j, testOut: { ...j.testOut, facts: { ...j.testOut.facts, [key]: value } } }), { nudge: false });
}
export function patchQcCheck(jobId: string, key: string, on: boolean) {
  patch(jobId, (j) => ({ ...j, testOut: { ...j.testOut, checks: { ...j.testOut.checks, [key]: on } } }), { nudge: false });
}
export function orderBom(jobId: string, scopeId: string) {
  patch(jobId, (j) => {
    const sc = j.scope.find((s) => s.id === scopeId);
    if (!sc) return j;
    const amount = sc.bom.reduce((n, b) => n + b.estQty * b.unitCost, 0);
    const supplier = sc.bom[0]?.supplier || "Supplier";
    addHistory(j.personId, j.pm, `PO ${supplier} ${amount}.`);
    const po: PurchaseOrder = { id: `PO-${60 + j.pos.length}`, vendor: supplier, amount, status: "Sent", what: sc.label, scopeId, file: { name: `${supplier}.pdf`, url: "#" } };
    return {
      ...j,
      pos: [po, ...j.pos],
      scope: j.scope.map((s) => (s.id === scopeId ? { ...s, bom: s.bom.map((b) => ({ ...b, ordered: true })) } : s)),
    };
  });
}
export function cancelJob(jobId: string, why = "") {
  patch(jobId, (j) => {
    if (j.cancelled) return j;
    addHistory(j.personId, j.pm, why.trim() ? `Job cancelled. ${why.trim()}` : "Job cancelled.");
    return { ...j, cancelled: true, cancelWhy: why.trim(), cancelledAt: "Now" };
  }, { nudge: false });
}
export function completeJob(jobId: string) {
  const j = jobs[jobId];
  if (!j) return;
  if (closeBlocks(j).length) return;
  patch(jobId, (cur) => {
    addHistory(cur.personId, cur.pm, cur.warranty ? "Job closed. Warranty opened." : "Job closed.");
    return { ...cur, stage: "Closed" };
  }, { nudge: false });
}
export function allInvoices() {
  return Object.values(jobs).flatMap((j) => j.invoices.map((i) => ({ ...i, jobId: j.jobId, name: j.name, personId: j.personId })));
}
export function allPos() {
  return Object.values(jobs).flatMap((j) => j.pos.map((p) => ({ ...p, jobId: j.jobId, name: j.name, personId: j.personId })));
}
export function dispatched() {
  return Object.values(jobs).filter((j) => j.stage !== "Closed" && !j.cancelled && j.crew);
}
