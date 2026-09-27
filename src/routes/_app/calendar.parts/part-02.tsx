import { Plus } from "lucide-react";
import { TODAY } from "@/features/book/time";
import { BookPick } from "@/features/book/pick";
import { setBookDay } from "@/features/book/day";
import { VIEWS, VIEW_LABEL } from "./part-01";

export function CalendarPageView(props: { bag: { view: any; setView: any; office: any; setOffice: any; group: any; setGroup: any; family: any; setFamily: any; cursor: any; step: any; bookEvent: any } }) {
  const { view, setView, office, setOffice, group, setGroup, family, setFamily, cursor, step, bookEvent } = props.bag;
  return (
    <header className="shrink-0 border-b border-line bg-card px-3 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold tracking-tight">Book</h1>
        </div>
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">
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
          <button
            type="button"
            className="ml-auto inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-navy px-2.5 text-xs font-semibold text-card"
            onClick={bookEvent}
          >
            <Plus className="size-3.5" />
            Event
          </button>
        </div>
      </header>
  );
}
