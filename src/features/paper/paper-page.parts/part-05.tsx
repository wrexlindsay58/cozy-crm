import { CircleAlert, Library, UserRound } from "lucide-react";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { blockedJobs, uncollected } from "../model";
import { KIND_META, STACKS, FitRow, owned, QueueRow } from "./part-01";

export function PaperPageView(props: { bag: { mobilePacket: any; morning: any; query: any; setQuery: any; mine: any; view: any; setMine: any; setView: any; kind: any; rows: any; viewAs: any; people: any; setKind: any; batches: any; sendBatch: any; visible: any; focused: any; setComposer: any; setJobId: any; setFocus: any; setMobilePacket: any; act: any } }) {
  const { mobilePacket, morning, query, setQuery, mine, view, setMine, setView, kind, rows, viewAs, people, setKind, batches, sendBatch, visible, focused, setComposer, setJobId, setFocus, setMobilePacket, act } = props.bag;
  return (
    <section className={cn("min-h-0 w-full min-w-0 flex-col border-line bg-card lg:flex lg:w-[32rem] lg:shrink-0 lg:border-r xl:w-[34rem]", mobilePacket ? "max-lg:hidden" : "flex")}>
        <PaperPageView3 bag={{ morning, query, setQuery, mine, view, setMine, setView, kind, rows, viewAs, people, setKind }} />
        <div className="min-h-0 flex-1 overflow-auto bg-card">
          {view === "queue" && batches.length ? (
            <div className="flex flex-col gap-2 border-b border-line px-4 py-3">
              {batches.map((group: any) => (
                <button key={group[0].batch} type="button" onClick={() => sendBatch(group)} className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">
                  {group[0].batch === "send-po" ? `Send ${group.length} purchases` : `Send ${group.length} invoices`}
                </button>
              ))}
            </div>
          ) : null}
          {visible.length === 0 ? <p className="type-meta px-4 py-6">{view === "queue" ? "Nothing to chase." : "Nothing in this filter."}</p> : null}
          {view === "queue" ? (
            STACKS.map((stack) => {
              const list = visible.filter((r: any) => r.stack === stack.id);
              if (!list.length) return null;
              return (
                <section key={stack.id}>
                  <h2 className="type-label px-4 pt-3">{stack.label}</h2>
                  <ul>
                    {list.map((row: any) => (
                      <li key={row.id}>
                        <QueueRow row={row} active={row.id === focused?.id} onOpen={() => { setComposer(null); setJobId(row.jobId); setFocus(row.id); setMobilePacket(true); }} onAct={() => act(row)} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          ) : (
            <ul>
              {visible.map((row: any) => (
                <li key={row.id}>
                  <QueueRow row={row} active={row.id === focused?.id} onOpen={() => { setComposer(null); setJobId(row.jobId); setFocus(row.id); setMobilePacket(true); }} onAct={() => act(row)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
  );
}

function PaperPageView3(props: { bag: { morning: any; query: any; setQuery: any; mine: any; view: any; setMine: any; setView: any; kind: any; rows: any; viewAs: any; people: any; setKind: any } }) {
  const { morning, query, setQuery, mine, view, setMine, setView, kind, rows, viewAs, people, setKind } = props.bag;
  return (
    <header className="shrink-0 border-b border-line bg-card px-4 py-3">
          <h1 className="type-section">Paper</h1>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-sm font-semibold tabular-nums">{money(uncollected(morning))} to collect</span>
            <span className="text-sm font-semibold tabular-nums">{blockedJobs(morning) === 1 ? "1 install blocked" : `${blockedJobs(morning)} installs blocked`}</span>
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Customer, vendor, crew, number"
            className="mt-3 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
          />
          <FitRow
            signature="views"
            labeled={(compact) => (
              <div className={cn("inline-flex h-9 divide-x divide-line overflow-hidden rounded-md border border-line", compact && "flex")}>
                {([["queue", "Stuck", CircleAlert], ["all", "Register", Library], ["mine", "Mine", UserRound]] as const).map(([id, label, Icon]) => {
                  const on = id === "mine" ? mine : view === id && !mine;
                  const button = (
                    <button
                      type="button"
                      aria-label={label}
                      onClick={() => {
                        if (id === "mine") {
                          setMine(true);
                          setView("queue");
                        } else {
                          setMine(false);
                          setView(id);
                        }
                      }}
                      className={cn("inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold", compact && "w-9 justify-center px-0", on ? "bg-navy text-card" : "bg-card text-muted")}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      {compact ? null : label}
                    </button>
                  );
                  return compact ? (
                    <Tip key={id} label={label} on>
                      {button}
                    </Tip>
                  ) : (
                    <span key={id}>{button}</span>
                  );
                })}
              </div>
            )}
          />
          <FitRow
            signature={`${view}-${mine}-${kind}-${rows.length}`}
            labeled={(compact) => (
              <div className="flex w-max items-center gap-1">
                {KIND_META.map((item) => {
                  const on = kind === item.id;
                  const pool = (view === "queue" ? morning : rows).filter((r: any) => !mine || owned(r, viewAs, people));
                  const count = item.id === "all" ? pool.length : pool.filter((r: any) => r.kind === item.id && !r.lender && !r.mismatch).length;
                  if (item.id !== "all" && count === 0) return null;
                  const label = item.short;
                  const Icon = item.icon;
                  const tip = item.id === "all" || !count ? item.label : `${item.label} ${count}`;
                  const button = (
                    <button
                      type="button"
                      aria-label={tip}
                      onClick={() => setKind(item.id)}
                      className={cn("inline-flex h-8 shrink-0 items-center gap-1 rounded-md text-[13px] font-semibold", compact ? "px-1.5" : "px-2", on ? "bg-navy text-card" : "text-muted")}
                    >
                      <Icon className={cn("size-3.5 shrink-0", on ? "text-card" : "text-navy")} />
                      {item.id === "all" ? null : <span className={cn("tabular-nums", on ? "text-card" : "text-navy")}>{count}</span>}
                      {compact ? null : label}
                    </button>
                  );
                  return compact ? (
                    <Tip key={item.id} label={tip} on>
                      {button}
                    </Tip>
                  ) : (
                    <span key={item.id} className="inline-flex">{button}</span>
                  );
                })}
              </div>
            )}
          />
        </header>
  );
}
