import { cashOut, reviews, snapshot } from "@/lib/snapshot";
import { tickets, type Lead } from "@/lib/crm-data";
import type { Resource } from "@/features/book/roster";
import { familyOf, isWatch, type BookEvent } from "@/features/book/types";
import { hourOf, labelTime } from "@/features/book/time";

export type Fire = { id: string; title: string; detail: string; href: string; stop: boolean };
export type SitRow = { id: string; time: string; name: string; who: string; city: string; status: string; href: string; amount: number };
export type Meter = { label: string; fact: string; score: number };

function active(e: BookEvent) {
  return e.status !== "Done" && e.status !== "No-sit" && e.status !== "No-show";
}

function valueOf(e: BookEvent, leads: Lead[]) {
  return leads.find((l) => l.id === e.personId)?.value ?? 0;
}

function whoName(id: string, roster: Resource[]) {
  return roster.find((r) => r.id === id)?.name ?? id;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function buildToday(opts: {
  events: BookEvent[];
  leads: Lead[];
  roster: Resource[];
  dayKey: string;
  yestKey: string;
  hour: number;
  office: "all" | "PHX" | "DFW";
}) {
  const { events, leads, roster, dayKey, yestKey, hour, office } = opts;
  const day = events.filter((e) => e.start.slice(0, 10) === dayKey && (office === "all" || e.office === office) && !e.blank);
  const yest = events.filter((e) => e.start.slice(0, 10) === yestKey && (office === "all" || e.office === office) && !e.blank);
  const sales = day.filter((e) => familyOf(e.type) === "sales");
  const prod = day.filter((e) => familyOf(e.type) === "production");
  const soldEv = sales.filter((e) => e.status === "Done");
  const yestSold = yest.filter((e) => familyOf(e.type) === "sales" && e.status === "Done");
  const sold = soldEv.reduce((s, e) => s + valueOf(e, leads), 0);
  const soldN = soldEv.length;
  const yesterday = yestSold.reduce((s, e) => s + valueOf(e, leads), 0);
  const sitsLeft = sales.filter((e) => active(e) && hourOf(e.start) >= hour).sort((a, b) => a.start.localeCompare(b.start));
  const onBook = sitsLeft.reduce((s, e) => s + valueOf(e, leads), 0);
  const street = prod.filter(active).sort((a, b) => a.start.localeCompare(b.start));
  const behindEv = [...sales, ...prod].filter((e) => active(e) && hourOf(e.start) < hour);
  const behindN = new Set(behindEv.map((e) => e.resourceId).filter(Boolean)).size;
  const unsigned = prod.filter((e) => isWatch(e) && active(e));
  const nosit = day.filter((e) => e.status === "No-sit" || e.status === "No-show");
  const cashIn = snapshot.cashInToday;
  const spent = snapshot.cashOutToday;

  const closers = roster.filter((r) => r.kind === "closer" && (office === "all" || r.office === office));
  const crews = roster.filter((r) => r.kind === "crew" && (office === "all" || r.office === office));
  const idle = closers.filter((r) => !sales.some((e) => e.resourceId === r.id));
  const unmarked = leads.filter((l) => l.status === "Unmarked" || l.status === "Missed");
  const notCalled = leads.filter((l) => l.status === "Pending" || l.status === "Unmarked");
  const openTickets = tickets.filter((t) => t.status !== "Complete" && t.status !== "Cancel");
  const hotTickets = openTickets.filter((t) => t.priority === "High");
  const badReview = reviews.filter((r) => r.flag === "stop");

  const fire: Fire[] = [];
  behindEv.forEach((e) => {
    fire.push({
      id: `b-${e.id}`,
      title: `${e.title} is behind`,
      detail: `${e.type} · ${whoName(e.resourceId, roster)} · ${labelTime(e.start)}`,
      href: e.href || "/calendar",
      stop: true,
    });
  });
  nosit.forEach((e) => {
    fire.push({
      id: `n-${e.id}`,
      title: `${e.title} ${e.status.toLowerCase()}`,
      detail: `${whoName(e.resourceId, roster)} · ${e.city}`,
      href: e.href || "/calendar",
      stop: true,
    });
  });
  unsigned.forEach((e) => {
    fire.push({
      id: `w-${e.id}`,
      title: `${e.title} needs a signed work order`,
      detail: whoName(e.resourceId, roster),
      href: e.href || "/projects",
      stop: false,
    });
  });
  unmarked.forEach((l) => {
    fire.push({
      id: `u-${l.id}`,
      title: `${l.name} unmarked`,
      detail: `${l.city} · ${l.closer}`,
      href: `/leads/${l.id}`,
      stop: true,
    });
  });
  badReview.forEach((r) => {
    fire.push({ id: r.id, title: `${r.name} left 1 star`, detail: r.text, href: "/accounts", stop: true });
  });
  hotTickets.forEach((t) => {
    fire.push({
      id: t.id,
      title: t.title,
      detail: `${t.owner} · ${t.age}`,
      href: t.related.startsWith("L-") ? `/leads/${t.related}` : t.related.startsWith("P-") ? `/projects/${t.related}` : "/tickets",
      stop: false,
    });
  });
  if (spent > cashIn && cashIn >= 0) {
    fire.push({
      id: "cash",
      title: "More cash went out than came in",
      detail: cashOut.map((r) => r.name).join(", "),
      href: "/invoices",
      stop: true,
    });
  }

  const sitRows: SitRow[] = sitsLeft.map((e) => ({
    id: e.id,
    time: labelTime(e.start),
    name: e.title,
    who: whoName(e.resourceId, roster),
    city: e.city,
    status: e.status,
    href: e.href || "/calendar",
    amount: valueOf(e, leads),
  }));
  const streetRows: SitRow[] = street.map((e) => ({
    id: e.id,
    time: labelTime(e.start),
    name: e.title,
    who: whoName(e.resourceId, roster),
    city: e.city,
    status: e.hold ? "Hold" : e.status,
    href: e.href || (e.jobId ? `/projects/${e.jobId}` : "/projects"),
    amount: 0,
  }));

  const people = [
    ...closers.map((r) => {
      const mine = sales.filter((e) => e.resourceId === r.id);
      const left = mine.filter((e) => active(e) && hourOf(e.start) >= hour).length;
      const late = mine.some((e) => active(e) && hourOf(e.start) < hour);
      return { id: r.id, name: r.name, role: "Closer", fact: left ? `${left} sit${left === 1 ? "" : "s"} left` : mine.length ? "Clear" : "Idle", late, href: "/calendar" };
    }),
    ...crews.map((r) => {
      const mine = street.filter((e) => e.resourceId === r.id);
      const late = mine.some((e) => hourOf(e.start) < hour);
      return { id: r.id, name: r.name, role: "Crew", fact: mine[0] ? mine[0].title : "At shop", late, href: "/dispatch" };
    }),
  ];

  const mix = [
    { label: "Set", n: sales.filter((e) => e.status === "Set").length },
    { label: "Confirmed", n: sales.filter((e) => e.status === "Confirmed").length },
    { label: "Out", n: sales.filter((e) => e.status === "Dispatched").length },
    { label: "Sold", n: soldN },
    { label: "No-sit", n: nosit.length },
  ];

  const hours = Array.from({ length: 16 }, (_, i) => i + 6);
  const strip = hours.map((h) => ({
    h,
    n: day.filter((e) => Math.floor(hourOf(e.start)) === h).length,
    sales: day.some((e) => familyOf(e.type) === "sales" && Math.floor(hourOf(e.start)) === h),
    prod: day.some((e) => familyOf(e.type) === "production" && Math.floor(hourOf(e.start)) === h),
  }));

  const moneyScore = clamp((onBook > 0 ? 55 : 25) + (sold >= yesterday ? 20 : 0) + (cashIn >= spent ? 20 : -25) + Math.min(20, soldN * 10));
  const bookScore = clamp(100 - nosit.length * 25 - unmarked.length * 8 + (sitsLeft.length ? 10 : 0));
  const streetScore = clamp(100 - behindN * 18 - unsigned.length * 12);
  const peopleScore = clamp(100 - idle.length * 12 - notCalled.length * 4);

  const meters: Meter[] = [
    { label: "Money", fact: onBook ? `$${Math.round(onBook / 1000)}k on the book` : sold ? `$${Math.round(sold / 1000)}k sold` : "$0 sold", score: moneyScore },
    { label: "Book", fact: `${sitsLeft.length} sit${sitsLeft.length === 1 ? "" : "s"} left`, score: bookScore },
    { label: "Street", fact: behindN ? `${behindN} behind` : `${street.length} out`, score: streetScore },
    { label: "People", fact: idle.length ? `${idle.length} idle` : "Working", score: peopleScore },
  ];

  return {
    day,
    sold,
    soldN,
    yesterday,
    onBook,
    cashIn,
    spent,
    cashOut,
    sitsLeft: sitRows,
    street: streetRows,
    behindN,
    fire,
    people,
    mix,
    strip,
    hour,
    meters,
    reviews,
    tickets: openTickets,
    notCalled: notCalled.length,
  };
}
