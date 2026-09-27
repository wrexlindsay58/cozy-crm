import { useEffect, useMemo, useState } from "react";
import { PageTitle } from "@/components/ui-bits";
import { useStaff } from "@/features/staff/store";
import { hoursFor, useRoster } from "@/features/book/roster";
import { addHrs, durationHrs, hourOf, toIso } from "@/features/book/time";
import { BookPick } from "@/features/book/pick";
import { familyOf } from "@/features/book/types";
import { moveBook, useBook } from "@/features/book/store";
import { rollsOn } from "@/features/job/prep";
import { useJobs } from "@/features/job/store";
import { useBookDay } from "@/features/book/day";
import { CalendarPageView3 } from "./part-03";

export const VIEWS = ["resource", "three", "week", "month"] as const;

export type View = (typeof VIEWS)[number];

export const VIEW_LABEL: Record<View, string> = { resource: "Resource", three: "3-day", week: "Week", month: "Month" };

export function CalendarPage() {
  const jobs = useJobs();
  const events = useBook().filter((e) => rollsOn(e.jobId ? jobs[e.jobId] : undefined, e.start.slice(0, 10)));
  const roster = useRoster();
  const { viewAs } = useStaff();
  const [view, setView] = useState<View>("resource");
  const [office, setOffice] = useState<"all" | "PHX" | "DFW">("PHX");
  const [group, setGroup] = useState<"all" | "sales" | "crews" | "mine">(viewAs === "Closer" || viewAs === "Setter" ? "sales" : viewAs === "PM" || viewAs === "Crew" ? "crews" : "all");
  const [family, setFamily] = useState<"all" | "sales" | "production" | "shop">("all");
  const cursor = useBookDay();
  const [picked, setPicked] = useState<string | null>(null);
  const [compose, setCompose] = useState<{ resourceId: string; start: string } | null>(null);
  const [q, setQ] = useState("");
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    function apply() {
      setPhone(mq.matches);
    }
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const resources = useMemo(() => {
    return roster.filter((r) => {
      if (office !== "all" && r.office !== office) return false;
      if (group === "sales" && r.kind !== "closer" && r.kind !== "setter") return false;
      if (group === "crews" && r.kind !== "crew") return false;
      if (group === "mine" && viewAs !== "Owner" && !r.name.toLowerCase().includes(String(viewAs).toLowerCase()) && r.role !== viewAs) return false;
      return true;
    });
  }, [roster, office, group, viewAs]);

  const dayKey = toIso(cursor).slice(0, 10);
  const needle = q.trim().toLowerCase();
  const shown = events.filter((e) => {
    if (office !== "all" && e.office !== office && e.office) return false;
    if (family !== "all" && familyOf(e.type) !== family) return false;
    if (!needle) return true;
    return `${e.title} ${e.type} ${e.city} ${e.notes} ${e.scope} ${e.status}`.toLowerCase().includes(needle);
  });
  const selected = shown.find((e) => e.id === picked) ?? null;
  const hours = hoursFor(resources);

  function onMove(id: string, resourceId: string, start: string) {
    const cur = events.find((e) => e.id === id);
    if (!cur) return;
    const hrs = Math.max(0.5, hourOf(cur.end) - hourOf(cur.start) || durationHrs());
    const end = addHrs(start, hrs);
    moveBook(id, start, end, resourceId || cur.resourceId);
  }

  function bookEvent() {
    setCompose({ resourceId: resources[0]?.id ?? "", start: `${dayKey}T${String(hours[0] ?? 9).padStart(2, "0")}:00` });
  }

  const step = view === "week" ? 7 : view === "three" ? 3 : 1;

  return (
    <CalendarPageView3 bag={{ view, setView, office, setOffice, group, setGroup, family, setFamily, cursor, step, bookEvent, q, setQ, dayKey, resources, shown, picked, setPicked, setCompose, onMove, phone, hours, compose, roster, selected }} />
  );
}

export function CalendarPageView2(props: { bag: { view: any; setView: any; office: any; setOffice: any; group: any; setGroup: any; family: any; setFamily: any } }) {
  const { view, setView, office, setOffice, group, setGroup, family, setFamily } = props.bag;
  return (
    <header className="hidden min-h-14 shrink-0 items-center gap-2 overflow-x-auto border-b border-line bg-card px-4 md:flex">
        <PageTitle
          title="Book"
          flush
          actions={
            <>
              <BookPick
                value={view}
                onChange={setView}
                items={VIEWS.map((v) => ({ id: v, label: VIEW_LABEL[v] }))}
              />
              <BookPick
                value={office}
                onChange={setOffice}
                items={[
                  { id: "all", label: "All markets" },
                  { id: "PHX", label: "Phoenix" },
                  { id: "DFW", label: "Dallas" },
                ]}
              />
              <BookPick
                value={group}
                onChange={setGroup}
                items={[
                  { id: "all", label: "All people" },
                  { id: "sales", label: "Closers" },
                  { id: "crews", label: "Crews" },
                  { id: "mine", label: "Mine" },
                ]}
              />
              <BookPick
                value={family}
                onChange={setFamily}
                items={[
                  { id: "all", label: "All types" },
                  { id: "sales", label: "Sales" },
                  { id: "production", label: "Production" },
                  { id: "shop", label: "Shop" },
                ]}
              />
            </>
          }
        />
      </header>
  );
}
