import { crewOf, membersOf, payFor } from "@/features/staff/store";
import { processFor, trueDiscount, type CommShare, type JobFile, type JobInvoice } from "../types";

export function isPayBill(i: JobInvoice) {
  return i.party === "pay" || i.kind === "Commission" || i.kind === "Piece";
}

export function customerLines(j: JobFile) {
  return j.scope
    .filter((s) => s.kind !== "promise")
    .map((s) => ({ id: s.id, label: s.label, amount: s.amount, qty: s.qty }));
}

export function sharePay(j: JobFile, c: CommShare) {
  const td = trueDiscount(j);
  if (c.role === "Setter") return Math.round(td.base * (c.pct / 100));
  const n = Math.max(1, (j.commissions ?? []).filter((x) => x.role !== "Setter").length);
  return Math.round((td.base * td.rate) / 100 / n);
}

export function syncPayInvoices(j: JobFile): JobFile {
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

export function assignedCrews(j: JobFile) {
  return [...new Set(j.assignments.filter((a) => a.kind !== "sub").map((a) => a.crew).filter(Boolean))];
}

export function defaultService(j: JobFile) {
  const product = j.scope.find((s) => s.kind === "product");
  return product ? processFor(product.label) : "Attic blow";
}

export function laborFromCrew(j: JobFile): JobFile {
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
