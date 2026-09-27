import { numClass, Pip, Delta } from "./bits-01";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function VSalesDashboard05({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { open, picked, rates, setOpen, setPicked, t } = bag;
  return (
    <>
{open === "projects" ? (
        <section className="rounded-md bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-bold">Jobs</h2>
            <Link to="/projects" className="text-[13px] font-semibold text-navy">
              Open
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {t.jobSplit.map((item) => (
              <div key={item.label} className="rounded-sm bg-page px-3 py-2">
                <b className="block text-[20px] font-bold tabular-nums">{item.n}</b>
                <span className="text-[11px] font-semibold text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2 lg:grid-cols-4">
        {rates.map((r) => {
          const pct = r.b ? Math.round((r.a / r.b) * 100) : 0;
          const priorPct = r.priorB ? Math.round((r.priorA / r.priorB) * 100) : 0;
          return (
            <button
              key={r.label}
              type="button"
              onClick={() => { setOpen(r.key); setPicked(`rate-${r.label}`); }}
              className={cn("bg-card p-4 text-left", picked === `rate-${r.label}` && "shadow-[inset_3px_0_0_0_var(--color-navy)]")}
            >
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                {r.label}
                <Pip now={pct} yest={priorPct} />
              </p>
              <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(pct, priorPct))}>{pct}%</p>
              <p className="mt-1 text-[12px] text-muted">
                {r.a.toLocaleString()} of {r.b.toLocaleString()}
              </p>
              <p className="mt-1 text-[12px] text-muted">
                <Delta now={pct} was={priorPct} /> vs {t.vs}
              </p>
              <p className="mt-2 text-[12px] text-muted">{r.drop}</p>
            </button>
          );
        })}
      </section>
    </>
  );
}
