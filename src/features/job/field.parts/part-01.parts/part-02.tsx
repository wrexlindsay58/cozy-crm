import { addPunch, setAccess, toggleCheck, togglePunch } from "../../store";
import { cn } from "@/lib/cn";

export function FieldBlockView2(props: { bag: { job: any; punch: any; setPunch: any; access: any; setAcc: any } }) {
  const { job, punch, setPunch, access, setAcc } = props.bag;
  return (
    <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Punch</h2>
          <ul className="space-y-1">
            {job.punch.map((p: any) => (
              <li key={p.id}>
                <button type="button" onClick={() => togglePunch(job.jobId, p.id)} className={cn("flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm", p.status === "Done" ? "text-muted line-through" : "bg-page")}>
                  <span>{p.item}</span>
                  <span className="text-[11px] font-bold uppercase">{p.status}</span>
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addPunch(job.jobId, punch);
              setPunch("");
            }}
          >
            <input value={punch} onChange={(e) => setPunch(e.target.value)} placeholder="What’s left" className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
            <button type="submit" className="h-10 rounded-md border border-line px-3 text-sm font-semibold">
              Add
            </button>
          </form>
        </section>
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Closeout list</h2>
          <ul className="space-y-1">
            {job.checks.map((c: any) => (
              <li key={c.id}>
                <button type="button" onClick={() => toggleCheck(job.jobId, c.id)} className="flex h-10 w-full items-center gap-2 text-left text-sm">
                  <span className={cn("grid size-5 place-items-center rounded-sm border", c.on ? "border-navy bg-navy text-card" : "border-line")}>{c.on ? "✓" : ""}</span>
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
          <textarea value={access} onChange={(e) => setAcc(e.target.value)} onBlur={() => setAccess(job.jobId, access)} rows={3} className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm" placeholder="Access" />
        </section>
      </div>
  );
}
