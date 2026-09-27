import { cn } from "@/lib/cn";
import { phoneOf } from "@/features/dispatch/geo";
import { familyOk, active, behind } from "./part-01";
import { StopRow } from "./part-02";
import { StreetPane } from "./part-03";

export function DispatchPageView6(props: { bag: { sheet: any; selected: any; street: any; selectedStops: any; hour: any; drive: any; sendTo: any; setToId: any; others: any; sendRest: any; optimize: any; dropOnUnit: any; here: any; selectedStopId: any; pickStop: any; open: any } }) {
  const { sheet, selected, street, selectedStops, hour, drive, sendTo, setToId, others, sendRest, optimize, dropOnUnit, here, selectedStopId, pickStop, open } = props.bag;
  return (
    <div className={cn("px-4 pb-4", sheet === "peek" && "max-lg:hidden")}>
                {selected ? (
                  <>
                {street ? <StreetPane lat={street.lat} lng={street.lng} name={street.name} city={street.city} /> : null}
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{selected.role}</p>
                <h2 className="text-[16px] font-bold">{selected.name}</h2>
                <p className={cn("text-[13px] font-semibold", behind(selectedStops, hour) ? "text-stop" : "text-muted")}>{behind(selectedStops, hour) ? "Behind" : selectedStops.length ? "On the book" : "Open"}</p>
                {drive[selected.id] ? (
                  <p className="mt-1 text-[12px] text-muted">
                    {drive[selected.id].mins} min drive · {drive[selected.id].miles.toFixed(1)} mi
                  </p>
                ) : null}
                {selectedStops.some(active) && sendTo ? (
                  <div className="mt-3 flex gap-2">
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Send remaining to</span>
                      <select
                        value={sendTo}
                        onChange={(e) => setToId(e.target.value)}
                        className="h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold"
                      >
                        {others.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {u.name.replace(/^Crew \d+ — /, "")}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="button" className="h-10 shrink-0 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => sendRest(sendTo)}>
                      Send remaining
                    </button>
                  </div>
                ) : null}
                <div className="mt-3 flex gap-2">
                  {phoneOf(selected.id) ? (
                    <a href={`tel:${phoneOf(selected.id)}`} className="grid h-10 flex-1 place-items-center rounded-md bg-navy text-[13px] font-semibold text-card">
                      Call
                    </a>
                  ) : (
                    <span className="grid h-10 flex-1 place-items-center rounded-md bg-navy text-[13px] font-semibold text-card">Call</span>
                  )}
                  <button type="button" className="grid h-10 flex-1 place-items-center rounded-md border border-line text-[13px] font-semibold" onClick={() => void optimize()}>
                    Optimize
                  </button>
                </div>
                <h3 className="mt-4 mb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Route</h3>
                {selectedStops.length === 0 ? <p className="text-[13px] text-muted">No stops. Drop open work here.</p> : null}
                <ul className="divide-y divide-line" onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropOnUnit(selected.id, e)}>
                  {selectedStops.map((s: any, i: any) => (
                    <StopRow key={s.id} s={s} n={i + 1} people={here} activeId={selectedStopId === s.id} warn={!familyOk(s.type, selected.kind)} onPick={() => pickStop(selected.id, s.id)} />
                  ))}
                </ul>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Open</p>
                    <ul className="mt-2 divide-y divide-line">
                      {open.map((s: any) => (
                        <li key={s.id}>
                          <button type="button" onClick={() => pickStop("", s.id)} className="flex w-full items-start gap-2 py-2.5 text-left">
                            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">{s.title.slice(0, 1)}</span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-baseline justify-between gap-2">
                                <span className="truncate text-sm font-semibold">{s.title}</span>
                                <span className="text-[11px] font-semibold text-muted">{s.type}</span>
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-muted">
                                {s.city || "No city"} · {s.status}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
  );
}
