import { CountStrip } from "./bits-01";
import { QueueCard } from "./bits-05";
import { CreateCard } from "./bits-06";
import { FilterRow } from "./bits-07";
import { MenuPick } from "./bits-08";
import { useActionQueue2 } from "./useActionQueue2";
import { Search } from "lucide-react";
import { houseOf } from "@/features/action/house";
import { OFFICES } from "@/features/staff/store";
import { ActBar } from "@/components/act-bar";
import { cn } from "@/lib/cn";

export function VActionQueue01({ bag }: { bag: ReturnType<typeof useActionQueue2> }) {
  const { actions, active, counts, creating, kind, leads, listRef, me, mobileTalk, nestUnderId, office, onCreated, open, people, query, rows, setCreating, setKind, setNestUnderId, setOffice, setQuery, setSort, setStatus, sort, startCreate, status, tally } = bag;
  return (
    <>
<div className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-line bg-card md:col-start-1 md:row-span-2 md:row-start-1", mobileTalk && "max-md:hidden")}>
          <div className="shrink-0 border-b border-line px-3 py-2.5">
          <div className="flex items-center gap-2">
            <h1 className="type-page shrink-0">Actions</h1>
            <MenuPick
              label="Office"
              value={office}
              options={[{ id: "all", label: "All" }, ...OFFICES.map((o) => ({ id: o, label: o }))]}
              onChange={setOffice}
              compact
            />
            <div className="ml-auto">
              <ActBar
                items={[
                  {
                    label: "Create",
                    variant: "navy",
                    menu: [
                      { label: "Ticket", onClick: () => startCreate("ticket") },
                      { label: "Task", onClick: () => startCreate("task") },
                      { label: "Request", onClick: () => startCreate("request") },
                    ],
                  },
                ]}
              />
            </div>
          </div>
          <div className="mt-3">
            <CountStrip counts={tally} status={status} onStatus={setStatus} />
            <label className="relative mt-2 block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, house, owner, id"
                aria-label="Search actions"
                className="h-11 w-full rounded-md border border-line bg-card pr-3 pl-9 text-sm focus:border-navy"
              />
            </label>
            <div className="mt-2">
              <FilterRow
                kind={kind}
                status={status}
                sort={sort}
                counts={counts}
                onKind={setKind}
                onStatus={setStatus}
                onSort={setSort}
              />
            </div>
          </div>
          </div>

        <aside className="flex min-h-0 min-w-0 flex-1 flex-col">
          {creating ? (
            <CreateCard
              kind={creating}
              owner={me}
              people={people.map((p) => p.name)}
              leads={leads}
              nestUnder={nestUnderId ? actions.find((a) => a.id === nestUnderId) ?? active : active}
              onDone={onCreated}
              onCancel={() => {
                setCreating(null);
                setNestUnderId(null);
              }}
            />
          ) : null}
          <ul ref={listRef} className="min-h-0 flex-1 overflow-auto">
            {rows.map((a) => (
              <li key={a.id} data-action-id={a.id} data-row-active={a.id === active?.id ? "" : undefined} className="border-b border-line">
                <QueueCard
                  action={a}
                  house={houseOf(a.personId, leads)}
                  parent={a.parentId ? actions.find((p) => p.id === a.parentId) : undefined}
                  nested={actions.filter((k) => k.parentId === a.id).length}
                  selected={a.id === active?.id}
                  onOpen={() => open(a.id)}
                  onAdd={(k) => startCreate(k, a.id)}
                />
              </li>
            ))}
            {rows.length === 0 ? (
              <li className="px-4 py-8">
                <p className="type-body text-muted">Nothing in this filter.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {query || kind !== "all" || status !== "all" || office !== "all" ? (
                    <button
                      type="button"
                      className="h-11 rounded-md border border-line bg-card px-3 text-sm font-semibold"
                      onClick={() => {
                        setQuery("");
                        setKind("all");
                        setStatus("all");
                        setOffice("all");
                      }}
                    >
                      Show all
                    </button>
                  ) : null}
                  <button type="button" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => startCreate("ticket")}>
                    New ticket
                  </button>
                </div>
              </li>
            ) : null}
          </ul>
        </aside>
        </div>
    </>
  );
}
