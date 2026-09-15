import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { appointments, money } from "@/lib/crm-data";
import { Btn, PageTitle } from "@/components/ui-bits";
import { board, boardHours, statusTone, units, type BoardBlock } from "@/lib/dispatch-data";

export const Route = createFileRoute("/_app/calendar")({
  component: CalendarPage,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const START = 2;
const LENGTH = 30;
const WEEK = [13, 14, 15, 16, 17, 18, 19];
const ROW = 56;
const TONE = {
  stop: "bg-stop text-card",
  watch: "bg-watch text-card",
  go: "bg-go text-card",
  info: "bg-navy text-card",
  none: "bg-line text-ink",
} as const;

function hourLabel(h: number) {
  if (h === 12) return "12";
  if (h > 12) return `${h - 12}p`;
  return `${h}a`;
}

function CalendarPage() {
  const [day, setDay] = useState(14);
  const [view, setView] = useState<"board" | "month">("board");
  const [kind, setKind] = useState<"all" | "run" | "install">("all");
  const [picked, setPicked] = useState<BoardBlock | null>(null);
  const cells = useMemo(() => {
    const list = Array.from({ length: START + LENGTH }, (_, i) => (i < START ? 0 : i - START + 1));
    while (list.length % 7) list.push(0);
    return list;
  }, []);
  const cols = units.filter((u) => u.role !== "Setter");
  const blocks = board.filter((b) => b.day === day && (kind === "all" || b.kind === kind));
  const onDay = appointments.filter((a) => a.day === day);
  const boardH = boardHours.length * ROW;
  const closer = picked ? (units.find((u) => u.id === picked.personId)?.name ?? "") : "";

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-line bg-card px-4">
        <PageTitle
          title="Book"
          flush
          actions={
            <>
              <div className="flex rounded-sm bg-page p-0.5">
                <button type="button" className={cn("h-8 px-3 text-[13px] font-semibold", view === "board" ? "bg-navy text-card" : "text-muted")} onClick={() => setView("board")}>
                  Board
                </button>
                <button type="button" className={cn("h-8 px-3 text-[13px] font-semibold", view === "month" ? "bg-navy text-card" : "text-muted")} onClick={() => setView("month")}>
                  Month
                </button>
              </div>
              <div className="flex rounded-sm bg-page p-0.5">
                {(["all", "run", "install"] as const).map((k) => (
                  <button key={k} type="button" onClick={() => setKind(k)} className={cn("h-8 px-3 text-[13px] font-semibold", kind === k ? "bg-navy text-card" : "text-muted")}>
                    {k === "all" ? "All" : k === "run" ? "Runs" : "Installs"}
                  </button>
                ))}
              </div>
            </>
          }
        />
      </header>

      {view === "board" ? (
        <>
          <div className="flex gap-1 overflow-x-auto border-b border-line bg-card px-4 py-2">
            {WEEK.map((d) => {
              const n = board.filter((b) => b.day === d && (kind === "all" || b.kind === kind)).length;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDay(d);
                    setPicked(null);
                  }}
                  className={cn("min-w-16 rounded-sm px-2 py-2 text-center", d === day ? "bg-navy text-card" : "bg-page")}
                >
                  <p className={cn("text-[11px] font-bold", d === day ? "text-navy-fg" : "text-muted")}>{DAYS[(START + d - 1) % 7]}</p>
                  <p className="text-[13px] font-bold tabular-nums">{d}</p>
                  <p className={cn("text-[11px] tabular-nums", d === day ? "text-navy-fg" : "text-muted")}>{n}</p>
                </button>
              );
            })}
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-auto">
            <div className="flex min-w-max">
              <div className="sticky left-0 z-20 w-14 shrink-0 bg-card">
                <div className="sticky top-0 z-30 h-14 border-b border-r border-line bg-card" />
                <div className="relative" style={{ height: boardH }}>
                  {boardHours.map((h, i) => (
                    <div key={h} className="absolute right-0 left-0 border-b border-line px-1 text-right text-[11px] font-bold text-muted" style={{ top: i * ROW, height: ROW }}>
                      {hourLabel(h)}
                    </div>
                  ))}
                </div>
              </div>
              {cols.map((u) => {
                const mine = blocks.filter((b) => b.personId === u.id);
                return (
                  <div key={u.id} className="w-40 shrink-0 border-r border-line">
                    <div className="sticky top-0 z-10 flex h-14 flex-col justify-center border-b border-line bg-card px-2">
                      <p className="truncate text-[13px] font-semibold">{u.name}</p>
                      <p className="text-[11px] text-muted">{u.role}</p>
                    </div>
                    <div className="relative bg-page/40" style={{ height: boardH }}>
                      {boardHours.map((h, i) => (
                        <div key={h} className="absolute inset-x-0 border-b border-line/80" style={{ top: i * ROW, height: ROW }} />
                      ))}
                      {mine.map((b) => {
                        const top = (b.hour - boardHours[0]) * ROW + 4;
                        const height = b.hours * ROW - 8;
                        const tone = statusTone(b.status);
                        const on = picked?.personId === b.personId && picked.hour === b.hour && picked.day === b.day;
                        return (
                          <button
                            key={`${b.personId}-${b.leadId}-${b.hour}`}
                            type="button"
                            onClick={() => setPicked(b)}
                            className={cn("absolute right-1 left-1 overflow-hidden rounded-sm px-2 py-1 text-left", on ? "bg-ink text-card" : TONE[tone])}
                            style={{ top, height }}
                          >
                            <p className="truncate text-[11px] font-bold leading-tight">{b.name}</p>
                            <p className="truncate text-[11px] opacity-80">{b.status}</p>
                            <p className="truncate text-[11px] opacity-80">{b.job}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {picked ? (
            <footer className="flex min-h-14 shrink-0 flex-wrap items-center gap-4 border-t border-line bg-card px-4 py-2 text-[13px]">
              <span className="font-semibold">{picked.name}</span>
              <span className="text-muted">
                {hourLabel(picked.hour)} · {closer} · {picked.city} · {picked.status}
              </span>
              <span className="tabular-nums">{money(picked.amount)}</span>
              <span className="ml-auto">
                <Btn href={`/leads/${picked.leadId}`}>Open lead</Btn>
              </span>
            </footer>
          ) : null}
        </>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_.9fr]">
            <section className="rounded-sm bg-card p-4">
              <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-bold tracking-wide text-muted uppercase">
                {DAYS.map((d) => (
                  <span key={d} className="py-1">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} className="min-h-16" />;
                  const marks = appointments.filter((a) => a.day === d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      className={cn("min-h-16 rounded-sm p-2 text-left", d === day ? "bg-navy text-card" : "bg-page")}
                    >
                      <span className="text-[13px] font-bold">{d}</span>
                      <div className="mt-1 space-y-0.5">
                        {marks.slice(0, 2).map((m) => (
                          <p key={m.id} className={cn("truncate text-[11px]", d === day ? "text-card/80" : "text-muted")}>
                            {m.time} {m.name.split(" ")[0]}
                          </p>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="rounded-sm bg-card p-4">
              <h2 className="text-[13px] font-bold">Sep {day}</h2>
              <ul className="mt-3 space-y-2">
                {onDay.map((a) => (
                  <li key={a.id} className="rounded-sm bg-page p-3">
                    <Link to="/leads/$leadId" params={{ leadId: a.leadId }} className="font-semibold hover:text-navy">
                      {a.name}
                    </Link>
                    <p className="text-[13px] text-muted">
                      {a.time} · {a.city} · {a.closer}
                    </p>
                  </li>
                ))}
                {onDay.length === 0 ? <li className="text-[13px] text-muted">Nothing on the book.</li> : null}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
