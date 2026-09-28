import { Plus, Search } from "lucide-react";
import { ResourceBoard } from "@/features/book/board";
import { UnassignedQueue } from "@/features/book/queue";
import { EventModal } from "@/features/book/event-modal";
import { MonthGrid } from "@/features/book/month";
import { DaySpan } from "@/features/book/span";
import { TODAY } from "@/features/book/time";
import { setBookDay } from "@/features/book/day";
import { CalendarPageView2 } from "./part-01";
import { BookDayBar, CalendarPageView } from "./part-02";

export function CalendarPageView3(props: { bag: { view: any; setView: any; office: any; setOffice: any; group: any; setGroup: any; family: any; setFamily: any; status: any; setStatus: any; statuses: any; cursor: any; step: any; bookEvent: any; q: any; setQ: any; dayKey: any; resources: any; shown: any; picked: any; setPicked: any; setCompose: any; onMove: any; phone: any; hours: any; compose: any; roster: any; selected: any } }) {
  const { view, setView, office, setOffice, group, setGroup, family, setFamily, status, setStatus, statuses, cursor, step, bookEvent, q, setQ, dayKey, resources, shown, picked, setPicked, setCompose, onMove, phone, hours, compose, roster, selected } = props.bag;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden overscroll-none">
      <CalendarPageView bag={{ view, setView, office, setOffice, group, setGroup, family, setFamily, status, setStatus, statuses, cursor, step, bookEvent, q, setQ }} />
      <CalendarPageView2 bag={{ view, setView, office, setOffice, group, setGroup, family, setFamily, status, setStatus, statuses }} />
      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:pr-64">

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
        <label className="relative w-56 shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find an Event"
            className="h-8 w-full rounded-md border border-line bg-card pr-3 pl-8 text-[13px] outline-none placeholder:text-faint"
          />
        </label>
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-navy px-3 text-sm font-semibold text-card"
          onClick={bookEvent}
        >
          <Plus className="size-4" />
          Event
        </button>
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
            setView("resource");
          }}
          onEvent={setPicked}
        />
      ) : null}

      <BookDayBar view={view} cursor={cursor} />
      </div>

      {!phone ? (
        <UnassignedQueue day={dayKey} events={shown} resources={resources} selectedId={picked} onSelect={setPicked} onMove={onMove} />
      ) : null}
      </div>

      {compose ? (
        <EventModal resources={roster} preset={compose} onClose={() => setCompose(null)} />
      ) : selected ? (
        <EventModal resources={roster} event={selected} onClose={() => setPicked(null)} />
      ) : null}
    </div>
  );
}
