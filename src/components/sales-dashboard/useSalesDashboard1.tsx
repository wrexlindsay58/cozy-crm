import { Drill, MixView, RankBy } from "./bits-01";
import { avgComm } from "./bits-03";
import { useMemo, useState } from "react";
import { boards, discounts, memberSales, officeFill, payMix, sourceMix, viewBoard } from "@/lib/sales-data";
import type { MarketId, RangeId } from "@/lib/sales-data";

export function useSalesDashboard1({ embedded = false, filterSlot = null }: { embedded?: boolean; filterSlot?: HTMLElement | null }) {
const [range, setRange] = useState<RangeId>("ytd");

const [market, setMarket] = useState<MarketId>("all");

const [person, setPerson] = useState("all");

const [open, setOpen] = useState<Drill>("leads");

const [picked, setPicked] = useState("kpi-leads");

const [productView, setProductView] = useState<MixView>("dollars");

const [officeView, setOfficeView] = useState<MixView>("dollars");

const [sourceView, setSourceView] = useState<MixView>("dollars");

const [payView, setPayView] = useState<MixView>("dollars");

const [rankBy, setRankBy] = useState<RankBy>("overall");

const [closerShown, setCloserShown] = useState(3);

const [closeHover, setCloseHover] = useState<number>();

const [payHover, setPayHover] = useState<number>();

const [officeHover, setOfficeHover] = useState<number>();

const raw = boards[range];

const t = useMemo(() => viewBoard(raw, market, person), [raw, market, person]);

const moneyBars = t.id !== "day";

const leftover = Math.max(t.appts - t.runs, 0);

const unbooked = Math.max(t.deals - t.jobs, 0);

const lost = t.nosit + t.missed + t.cancelledN;

const pay = useMemo(() => payMix(t), [t]);

const sources = useMemo(() => sourceMix(t), [t]);

const disc = discounts[t.id];

const people = useMemo(() => {
    const names = [...raw.closers.map((p) => p.name), ...raw.setters.map((p) => p.name)];
    return [{ id: "all", label: "All people" }, ...names.map((name) => ({ id: name, label: name }))];
  }, [raw]);

const kpis: { key: Drill; n: number; prior: number; l: string }[] = [
    { key: "leads", n: t.leads, prior: t.priorLeads, l: "Leads" },
    { key: "appointments", n: t.appts, prior: t.priorAppts, l: "Appointments" },
    { key: "opportunities", n: t.runs, prior: t.priorRuns, l: "Runs" },
    { key: "projects", n: t.jobs, prior: t.priorJobs, l: "Jobs" },
  ];

const nsa = t.runs ? Math.round(t.sold / t.runs) : 0;

const priorNsa = t.priorRuns ? Math.round(t.priorSold / t.priorRuns) : 0;

const readyPay = Math.round(t.sold * 0.031);

const priorReady = Math.round(t.priorSold * 0.028);

const paidComm = Math.round(t.sold * 0.118);

const priorPaid = Math.round(t.priorSold * 0.112);

const commPct = avgComm(disc.truePct);

const priorCommPct = avgComm(disc.priorTrue);

const mem = memberSales(t);

const products = t.products.map((p) => {
    const qty = Math.max(1, Math.round(p.amount / Math.max(t.avg, 1)));
    return { ...p, qty };
  });

const offices = t.offices.map((o) => {
    const qty = Math.max(1, Math.round(o.amount / Math.max(t.avg, 1)));
    return { ...o, qty, fill: officeFill[o.name] ?? "var(--color-muted)", short: o.name.replace("North Phoenix", "N. PHX") };
  });

const sourceRows = sources.map((s) => ({
    ...s,
    qty: s.leads,
    amount: s.sold,
  }));
  return { embedded, filterSlot, range, setRange, market, setMarket, person, setPerson, open, setOpen, picked, setPicked, productView, setProductView, officeView, setOfficeView, sourceView, setSourceView, payView, setPayView, rankBy, setRankBy, closerShown, setCloserShown, closeHover, setCloseHover, payHover, setPayHover, officeHover, setOfficeHover, raw, t, moneyBars, leftover, unbooked, lost, pay, sources, disc, people, kpis, nsa, priorNsa, readyPay, priorReady, paidComm, priorPaid, commPct, priorCommPct, mem, products, offices, sourceRows };
}
