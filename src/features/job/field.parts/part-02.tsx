import { addTimePunch, patchPunchClock } from "../store";
import { punchHours } from "../types";

export function FieldBlockView(props: { bag: { est: any; actual: any; job: any; who: any; setWho: any } }) {
  const { est, actual, job, who, setWho } = props.bag;
  return (
    <section className="rounded-md border border-line bg-card p-4">
        <div className="mb-3 flex items-end justify-between gap-2">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Labor</h2>
          <p className="text-[12px] text-muted">
            Est {est}h · actual {actual.toFixed(1)}h
          </p>
        </div>
        <ul className="space-y-2">
          {job.punches.map((p: any) => {
            const h = punchHours(p);
            return (
              <li key={p.id} className="rounded-md border border-line p-3">
                <p className="text-sm font-semibold">
                  {p.who} · {p.day}
                  <span className="ml-2 text-[12px] font-normal text-muted">{h.total ? `${h.site.toFixed(1)}h on site · ${h.travel.toFixed(1)}h travel` : "Open"}</span>
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      ["leftYard", "Leave yard"],
                      ["onSite", "On site"],
                      ["complete", "Complete"],
                      ["back", "Back"],
                    ] as const
                  ).map(([k, lab]) => (
                    <label key={k} className="text-[11px] font-bold tracking-wide text-muted uppercase">
                      {lab}
                      <input type="time" value={p[k]} onChange={(e) => patchPunchClock(job.jobId, p.id, { [k]: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal" />
                    </label>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTimePunch(job.jobId, who, "Today");
          }}
        >
          <input value={who} onChange={(e) => setWho(e.target.value)} className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md border border-line px-3 text-sm font-semibold">
            Clock
          </button>
        </form>
      </section>
  );
}
