import { Plus, Users } from "lucide-react";
import { PageTitle } from "@/components/ui-bits";
import { Tip } from "@/components/tip";
import { BookPick } from "@/features/book/pick";
import { cn } from "@/lib/cn";
import { ranges } from "@/lib/sales-data";

export function LeaderboardView2(props: { bag: { active: any; setBoardId: any; pages: any; office: any; setOffice: any; offices: any; query: any; setQuery: any; canDefine: any; setOpenKey: any; setAddingBoard: any; setAddingPosition: any; range: any; setRange: any } }) {
  const { active, setBoardId, pages, office, setOffice, offices, query, setQuery, canDefine, setOpenKey, setAddingBoard, setAddingPosition, range, setRange } = props.bag;
  return (
    <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-line bg-card px-4">
        <PageTitle
          title="Leaderboard"
          flush
          actions={
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <BookPick value={active.id} onChange={setBoardId} items={pages.map((page: any) => ({ id: page.id, label: page.name }))} />
              {active.row === "person" || active.row === "partner" ? <BookPick value={office} onChange={setOffice} items={offices} /> : null}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a name"
                aria-label="Find a name"
                className="h-9 w-36 shrink-0 rounded-md border border-line bg-card px-2.5 text-[13px] outline-none focus:border-navy sm:w-44"
              />
              {canDefine ? (
                <button type="button" onClick={() => { setOpenKey(null); setAddingBoard(true); }} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-navy px-3 text-[13px] font-semibold text-card">
                  <Plus className="size-3.5" />
                  Add board
                </button>
              ) : null}
              {canDefine ? (
                <button type="button" onClick={() => { setOpenKey(null); setAddingPosition(true); }} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line px-3 text-[13px] font-semibold">
                  <Users className="size-3.5" />
                  Add group
                </button>
              ) : null}
              {range === "day" ? (
                <Tip label="As of this hour" on>
                  <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted">
                    <i className="live-pip" />
                    Live
                  </span>
                </Tip>
              ) : null}
              <div className="ml-auto flex shrink-0 rounded-md bg-page p-0.5">
                {ranges.map((r) => (
                  <button key={r.id} type="button" onClick={() => setRange(r.id)} className={cn("h-8 rounded-sm px-2.5 text-[12px] font-semibold", range === r.id ? "bg-card text-ink" : "text-muted")}>
                    {r.label}
                  </button>
                ))}
              </div>
            </span>
          }
        />
      </header>
  );
}
