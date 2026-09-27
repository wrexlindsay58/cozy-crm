import { MixTrack } from "./bits-02";
import { Medal } from "./bits-03";
import { RANK_ITEMS } from "./bits-04";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { BookPick } from "@/features/book/pick";
import { Tip } from "@/components/tip";

export function VSalesDashboard09({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { board, closerShown, rankBy, setCloserShown, setPerson, setRankBy } = bag;
  return (
    <>
<section className="rounded-md bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[13px] font-bold">Closers</h3>
          <BookPick
            value={rankBy}
            onChange={(id) => {
              setRankBy(id);
              setCloserShown(3);
            }}
            items={RANK_ITEMS}
          />
        </div>
        <ol className="space-y-2 hover:[&>li]:opacity-40 hover:[&>li:hover]:opacity-100">
          {board.slice(0, closerShown).map((p, i) => {
            const shown =
              rankBy === "qty"
                ? `${p.count} sold`
                : rankBy === "close"
                  ? `${p.close}%`
                  : rankBy === "nsa"
                    ? money(p.nsa)
                    : rankBy === "avg"
                      ? money(p.avg)
                      : rankBy === "overall"
                        ? `${Math.round(p.overall * 100)}`
                        : money(p.amount);
            const barMax = Math.max(
              ...board.map((r) =>
                rankBy === "qty" ? r.count : rankBy === "close" ? r.close : rankBy === "nsa" ? r.nsa : rankBy === "avg" ? r.avg : rankBy === "overall" ? r.overall : r.amount,
              ),
              0.01,
            );
            const barNow =
              rankBy === "qty" ? p.count : rankBy === "close" ? p.close : rankBy === "nsa" ? p.nsa : rankBy === "avg" ? p.avg : rankBy === "overall" ? p.overall : p.amount;
            return (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => setPerson(p.name)}
                  className="group grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-left text-[13px] transition-opacity duration-150"
                >
                  <Medal place={i + 1} />
                  <div className="min-w-0">
                    <p className="font-semibold">{p.name}</p>
                    <MixTrack pct={(barNow / barMax) * 100} />
                    <p className="mt-0.5 text-[11px] text-muted">
                      {p.count} sold · {p.close}% close ·{" "}
                      <Tip label="Net revenue per appointment" on>
                        <span>NRA</span>
                      </Tip>{" "}
                      {money(p.nsa)} · {money(p.avg)}{" "}
                      <Tip label="Average ticket" on>
                        <span>avg</span>
                      </Tip>
                    </p>
                  </div>
                  <b className={cn("tabular-nums", p.amount === 0 && "text-stop")}>{shown}</b>
                </button>
              </li>
            );
          })}
        </ol>
        {closerShown < board.length ? (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setCloserShown((n) => Math.min(board.length, n + 3))}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-navy"
            >
              Next {Math.min(3, board.length - closerShown)}
              <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                <path d="M4 6.2 8 10.2 12 6.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}
