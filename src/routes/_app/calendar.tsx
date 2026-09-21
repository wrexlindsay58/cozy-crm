import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { PageTitle } from "@/components/ui-bits";
import { Tip } from "@/components/tip";
import { useStaff } from "@/features/staff/store";
import { ResourceBoard } from "@/features/book/board";
import { EventModal } from "@/features/book/event-modal";
import { MonthGrid } from "@/features/book/month";
import { hoursFor, useRoster } from "@/features/book/roster";
import { DaySpan } from "@/features/book/span";
import { addHrs, durationHrs, hourOf, TODAY, toIso } from "@/features/book/time";
import { BookPick } from "@/features/book/pick";
import { familyOf } from "@/features/book/types";
import { moveBook, useBook } from "@/features/book/store";
import { setBookDay, useBookDay } from "@/features/book/day";

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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden overscroll-none">
      <header className="shrink-0 border-b border-line bg-card px-3 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold tracking-tight">Book</h1>
          <Tip label="Event" on className="ml-auto">
            <button
              type="button"
              aria-label="Event"
              className="grid size-9 place-items-center rounded-md bg-navy text-card"
              onClick={bookEvent}
            >
              <Plus className="size-4" />
            </button>
          </Tip>
        </div>
        <div className="mt-2 overflow-x-auto">
          <div className="flex w-max rounded-md bg-page p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                className={cn("h-8 shrink-0 px-2.5 text-[13px] font-semibold", view === v ? "bg-navy text-card" : "text-muted")}
                onClick={() => setView(v)}
              >
                {VIEW_LABEL[v]}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">
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
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - step))}>
            Prev
          </button>
          <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
            Today
          </button>
          <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + step))}>
            Next
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">
            {cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
      </header>

      <header className="hidden min-h-14 shrink-0 items-center gap-2 overflow-x-auto border-b border-line bg-card px-4 md:flex">
        <PageTitle
          title="Book"
          flush
          actions={
            <>
              <div className="flex rounded-md bg-page p-0.5">
                {VIEWS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={cn(
                      "h-8 px-2.5 text-[13px] font-semibold",
                      v === "resource" && "max-md:hidden",
                      view === v ? "bg-navy text-card" : "text-muted",
                    )}
                    onClick={() => setView(v)}
                  >
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
                onClick={bookEvent}
              >
                <Plus className="size-4" />
                Event
              </button>
            </>
          }
        />
      </header>

      <div className="hidden shrink-0 flex-nowrap items-center gap-2 overflow-x-auto border-b border-line bg-card px-4 py-2 md:flex">
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - (view === "week" ? 7 : view === "three" ? 3 : 1)))}>
          Prev
        </button>
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
          Today
        </button>
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + (view === "week" ? 7 : view === "three" ? 3 : 1)))}>
          Next
        </button>
        <p className="shrink-0 truncate text-sm font-semibold">
          {cursor.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        <label className="relative min-w-0 max-w-64 flex-1 md:ml-auto md:min-w-40">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a sit"
            className="h-8 w-full rounded-md border border-line bg-card pr-3 pl-8 text-[13px] outline-none placeholder:text-faint"
          />
        </label>
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
          phone={phone}
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
          phone={phone}
        />
      ) : null}
      {view === "month" ? (
        <MonthGrid
          events={shown}
          selectedDay={cursor.getDate()}
          onDay={(d) => {
            setBookDay(new Date(cursor.getFullYear(), cursor.getMonth(), d));
            setView("three");
          }}
        />
      ) : null}

      {compose ? (
        <EventModal resources={roster} preset={compose} onClose={() => setCompose(null)} />
      ) : selected ? (
        <EventModal resources={roster} event={selected} onClose={() => setPicked(null)} />
      ) : null}
    </div>
  );
}
