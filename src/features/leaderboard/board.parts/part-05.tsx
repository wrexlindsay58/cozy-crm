import { Archive, LayoutGrid, Plus, Trash2 } from "lucide-react";
import { Tip } from "@/components/tip";
import { BookPick } from "@/features/book/pick";
import { initials, Entry } from "./part-01";
import { Row } from "./part-02";

export function TileView(props: { bag: { position: any; choices: any; onChoice: any; choice: any; title: any; onMap: any; onAdd: any; onRetire: any; onRemove: any; entered: any; offices: any; locked: any; openEntry: any; roster: any; ranked: any; needle: any; onOpen: any; meta: any; metric: any; onScore: any; pool: any; open: any } }) {
  const { position, choices, onChoice, choice, title, onMap, onAdd, onRetire, onRemove, entered, offices, locked, openEntry, roster, ranked, needle, onOpen, meta, metric, onScore, pool, open } = props.bag;
  return (
    <section className="flex min-w-0 flex-col border border-line bg-card">
      <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-line px-3 py-2">
        <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold">{position}</h2>
        {choices && choices.length > 1 && onChoice && choice ? (
          <BookPick value={choice} items={choices.map((c: any) => ({ id: c.id, label: c.label }))} onChange={onChoice} />
        ) : (
          <p className="truncate text-[12px] text-muted">{title}</p>
        )}
        {onMap ? (
          <Tip label="Boards this group is on" on>
            <button type="button" aria-label="Boards this group is on" onClick={onMap} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink">
              <LayoutGrid className="size-4" />
            </button>
          </Tip>
        ) : null}
        {onAdd ? (
          <Tip label="Add race" on>
            <button type="button" aria-label="Add race" onClick={onAdd} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink">
              <Plus className="size-4" />
            </button>
          </Tip>
        ) : null}
        {onRetire ? (
          <Tip label="Retire this race" on>
            <button type="button" aria-label="Retire this race" onClick={onRetire} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink">
              <Archive className="size-4" />
            </button>
          </Tip>
        ) : null}
        {onRemove ? (
          <Tip label="Remove this board" on>
            <button type="button" aria-label="Remove this board" onClick={onRemove} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-alert">
              <Trash2 className="size-4" />
            </button>
          </Tip>
        ) : null}
      </header>
      {entered && !offices ? <p className="border-b border-line px-3 py-1.5 text-[12px] text-muted">{locked ? "Entered · this period is closed" : "Entered · today can still be changed"}</p> : null}
      {openEntry ? (
        <ol className="max-h-[17.5rem] divide-y divide-line overflow-y-auto">
          {roster
            .map((person: any) => ranked.find((r: any) => r.name === person.name) ?? { name: person.name, score: 0, n: 0, office: person.office, rank: 0, moved: null, streak: 0 })
            .filter((row: any) => !needle || row.name.toLowerCase().includes(needle))
            .sort((a: any, b: any) => (a.rank === 0 ? 1 : 0) - (b.rank === 0 ? 1 : 0) || a.rank - b.rank || a.name.localeCompare(b.name))
            .map((row: any) => (
              <li key={row.name} className="flex min-h-14 items-center gap-2 px-3">
                <button type="button" onClick={() => onOpen(row.name)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className="w-7 text-[15px] font-semibold text-navy tabular-nums">{row.rank || "–"}</span>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-[10px] font-bold text-card">{initials(row.name)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{row.name}</span>
                    <span className="block truncate text-[12px] text-muted">{row.n ? meta(row) : row.office}</span>
                  </span>
                </button>
                <Entry kind={metric.kind} score={row.score} n={row.n} onCommit={(score, n) => onScore?.(row.name, score, n)} />
              </li>
            ))}
        </ol>
      ) : pool.length === 0 ? (
        <p className="px-3 py-6 text-[13px] text-muted">{locked ? "This period is closed." : needle ? "No one matches that name." : metric.min > 1 ? `No one has ${metric.min} ${metric.sample}s yet.` : "No one on this board."}</p>
      ) : (
        <ol className="max-h-[17.5rem] divide-y divide-line overflow-y-auto">
          {pool.map((row: any) => (
            <Row key={row.name} row={row} metric={metric} meta={meta(row)} on={open === row.name} onOpen={() => onOpen(row.name)} />
          ))}
        </ol>
      )}
      {pool.length > 5 ? <p className="border-t border-line px-3 py-2 text-[12px] text-muted">Scroll for {pool.length - 5} more</p> : null}
    </section>
  );
}
