import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { PageTitle } from "@/components/ui-bits";
import { useStaff } from "@/features/staff/store";
import { ResourceBoard } from "@/features/book/board";
import { Compose } from "@/features/book/compose";
import { BookDetail } from "@/features/book/detail";
import { MonthGrid } from "@/features/book/month";
import { hoursFor, useRoster } from "@/features/book/roster";
import { DaySpan } from "@/features/book/span";
import { addHrs, durationHrs, hourOf, TODAY, toIso } from "@/features/book/time";
import { BookPick } from "@/features/book/pick";
import { familyOf } from "@/features/book/types";
import { moveBook, useBook } from "@/features/book/store";

export const Route = createFileRoute("/_app/calendar")({
  component: CalendarPage,
});

const VIEWS = ["resource", "three", "week", "month"] as const;
type View = (typeof VIEWS)[number];
const VIEW_LABEL: Record<View, string> = { resource: "Resource", three: "3-day", week: "Week", month: "Month" };

function CalendarPage() {
  const events = useBook();
  const roster = useRoster();
  const { viewAs } = useStaff();
  const [view, setView] = useState<View>("resource");
  const [office, setOffice] = useState<"all" | "PHX" | "DFW">("PHX");
  const [group, setGroup] = useState<"all" | "sales" | "crews" | "mine">(viewAs === "Closer" || viewAs === "Setter" ? "sales" : viewAs === "PM" || viewAs === "Crew" ? "crews" : "all");
  const [family, setFamily] = useState<"all" | "sales" | "production" | "shop">("all");
  const [cursor, setCursor] = useState(() => new Date(TODAY));
  const [picked, setPicked] = useState<string | null>(null);
  const [compose, setCompose] = useState<{ resourceId: string; start: string } | null>(null);

  useEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    function apply() {
      if (q.matches) setView((v) => (v === "resource" ? "three" : v));
    }
    apply();
    q.addEventListener("change", apply);
    return () => q.removeEventListener("change", apply);
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
  const shown = events.filter((e) => {
    if (office !== "all" && e.office !== office && e.office) return false;
    if (family !== "all" && familyOf(e.type) !== family) return false;
    return true;
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

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-line bg-card px-4">
        <PageTitle
          title="Book"
          flush
          actions={
            <>
              <div className="flex rounded-md bg-page p-0.5">
                {VIEWS.map((v) => (
                  <button key={v} type="button" className={cn("h-8 px-2.5 text-[13px] font-semibold", view === v ? "bg-navy text-card" : "text-muted")} onClick={() => setView(v)}>
                    {VIEW_LABEL[v]}
                  </button>
                ))}
              </div>
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
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1 rounded-md bg-navy px-3 text-sm font-semibold text-card"
                onClick={() => setCompose({ resourceId: resources[0]?.id ?? "", start: `${dayKey}T${String(hours[0] ?? 9).padStart(2, "0")}:00` })}
              >
                <Plus className="size-4" />
                Event
              </button>
            </>
          }
        />
      </header>

      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-card px-4 py-2">
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - (view === "week" ? 7 : view === "three" ? 3 : 1)))}>
          Prev
        </button>
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setCursor(new Date(TODAY))}>
          Today
        </button>
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + (view === "week" ? 7 : view === "three" ? 3 : 1)))}>
          Next
        </button>
        <p className="text-sm font-semibold">
          {cursor.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {view === "resource" ? (
        <ResourceBoard
          day={dayKey}
          resources={resources}
          events={shown}
          selectedId={picked}
          onSelect={setPicked}
          onSlot={(resourceId, start) => setCompose({ resourceId, start })}
          onMove={onMove}
        />
      ) : null}
      {view === "three" || view === "week" ? (
        <DaySpan
          start={cursor}
          days={view === "three" ? 3 : 7}
          hours={hours}
          events={shown}
          selectedId={picked}
          onSelect={setPicked}
          onSlot={(_, start) => setCompose({ resourceId: resources[0]?.id ?? "", start })}
          onMove={onMove}
        />
      ) : null}
      {view === "month" ? (
        <MonthGrid
          events={shown}
          selectedDay={cursor.getDate()}
          onDay={(d) => {
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), d));
            setView("three");
          }}
        />
      ) : null}

      {compose ? (
        <div className="shrink-0 border-t border-line bg-card">
          <Compose resources={resources} preset={compose} onClose={() => setCompose(null)} />
        </div>
      ) : selected ? (
        <BookDetail e={selected} onClose={() => setPicked(null)} />
      ) : null}
    </div>
  );
}
