import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { BookPick } from "@/features/book/pick";
import { setBookDay } from "@/features/book/day";
import { TODAY } from "@/features/book/time";
import { cn } from "@/lib/cn";

export function CalendarPageView(props: { bag: { view: any; setView: any; office: any; setOffice: any; group: any; setGroup: any; family: any; setFamily: any; status: any; setStatus: any; statuses: any; cursor: any; step: any; bookEvent: any; q: any; setQ: any } }) {
  const { view, setView, office, setOffice, group, setGroup, family, setFamily, status, setStatus, statuses, bookEvent, q, setQ } = props.bag;
  const month = view === "month";
  const [find, setFind] = useState(false);
  const seg = "h-8 px-2 text-[12px] font-semibold";
  return (
    <header className="shrink-0 border-b border-line bg-card px-3 py-2 md:hidden">
      <div className="flex items-center gap-2">
        <h1 className="text-[20px] font-bold tracking-tight">Book</h1>
        <div className="flex overflow-hidden rounded-md border border-line">
          <button type="button" className={cn(seg, !month && "bg-navy text-card")} onClick={() => setView("resource")}>
            Resource
          </button>
          <button type="button" className={cn(seg, "border-l border-line", month && "bg-navy text-card")} onClick={() => setView("month")}>
            Month
          </button>
        </div>
        <div className="ml-auto flex gap-1.5">
          <button type="button" aria-label="Find an event" aria-pressed={find} className={cn("grid size-8 place-items-center rounded-md border border-line", find && "bg-navy text-card")} onClick={() => setFind((v) => !v)}>
            <Search className="size-4" />
          </button>
          <button type="button" aria-label="Add event" className="grid size-8 place-items-center rounded-md bg-navy text-card" onClick={bookEvent}>
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
          <BookPick
            className="min-w-0 flex-1 justify-between max-md:max-w-none max-md:px-1.5 max-md:text-[11px]"
            value={office}
            onChange={setOffice}
            items={[
              { id: "all", label: "All markets", short: "Market" },
              { id: "PHX", label: "Phoenix" },
              { id: "DFW", label: "Dallas" },
            ]}
          />
          <BookPick
            className="min-w-0 flex-1 justify-between max-md:max-w-none max-md:px-1.5 max-md:text-[11px]"
            value={group}
            onChange={setGroup}
            items={[
              { id: "all", label: "All people", short: "People" },
              { id: "sales", label: "Closers" },
              { id: "crews", label: "Crews" },
              { id: "mine", label: "Mine" },
            ]}
          />
          <BookPick
            className="min-w-0 flex-1 justify-between max-md:max-w-none max-md:px-1.5 max-md:text-[11px]"
            value={family}
            onChange={setFamily}
            items={[
              { id: "all", label: "All types", short: "Type" },
              { id: "sales", label: "Sales" },
              { id: "production", label: "Production", short: "Prod" },
              { id: "shop", label: "Shop" },
            ]}
          />
          <BookPick
            className="min-w-0 flex-1 justify-between max-md:max-w-none max-md:px-1.5 max-md:text-[11px]"
            value={status}
            onChange={setStatus}
            items={[
              { id: "all", label: "All statuses", short: "Status" },
              ...statuses.map((id: string) => ({
                id,
                label: id === "No-show" ? "No show" : id === "No-run" ? "No run" : id,
                short: id === "Confirmed" ? "Confirm" : id === "Dispatched" ? "Dispatch" : id === "No-show" ? "No show" : id === "No-run" ? "No run" : id,
              })),
            ]}
          />
      </div>
      {find ? (
        <label className="relative mt-2 block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-faint" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an event" className="h-8 w-full rounded-md border border-line bg-card pr-3 pl-8 text-[12px] outline-none placeholder:text-faint" />
        </label>
      ) : null}
    </header>
  );
}

export function BookDayBar({ view, cursor }: { view: string; cursor: Date }) {
  const month = view === "month";
  function move(dir: number) {
    setBookDay(month ? new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1) : new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + dir));
  }
  const label = cursor.toLocaleDateString("en-US", month ? { month: "short", year: "numeric" } : { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-line bg-card px-1 py-0.5 md:hidden">
      <button type="button" aria-label={month ? "Previous month" : "Previous day"} className="grid size-8 place-items-center text-navy" onClick={() => move(-1)}>
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" className="text-[13px] font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
        {label}
      </button>
      <button type="button" aria-label={month ? "Next month" : "Next day"} className="grid size-8 place-items-center text-navy" onClick={() => move(1)}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
