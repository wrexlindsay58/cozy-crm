import { Link, createFileRoute } from "@tanstack/react-router";
import { StatusPill } from "@/components/ui-bits";
import { byId, leads, money, opportunities, projects } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/opportunities/$oppId")({
  component: OppDetail,
});

function OppDetail() {
  const { oppId } = Route.useParams();
  const opp = byId(opportunities, oppId);
  if (!opp) {
    return (
      <main className="p-6 text-sm text-muted">
        Opportunity not found. <Link to="/opportunities">Back</Link>
      </main>
    );
  }
  const lead = byId(leads, opp.leadId);
  const job = projects.find((p) => p.name.includes(opp.name.split(" ")[0]));

  return (
    <main className="mx-auto max-w-5xl space-y-3 p-4 pb-10 md:p-5">
      <Link to="/opportunities" className="text-xs font-semibold text-muted hover:text-ink">
        ← Opportunities
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-card p-4 shadow-sm">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">{opp.id}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{opp.name}</h1>
          <p className="mt-1 text-sm text-muted">{opp.product}</p>
        </div>
        <div className="text-right">
          <StatusPill label={opp.stage} tone={opp.tone} />
          <p className="mt-2 text-xl font-extrabold tabular-nums">{money(opp.amount)}</p>
        </div>
      </header>
      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold">Deal</h2>
          <p className="text-sm text-muted">Closer {opp.closer} · {opp.office}</p>
          <p className="mt-1 text-sm text-muted">Updated {opp.updated} · Close by {opp.closeBy}</p>
          {lead ? (
            <Link to="/leads/$leadId" params={{ leadId: lead.id }} className="mt-3 block text-sm font-semibold text-navy">
              Open lead {lead.id} →
            </Link>
          ) : null}
          {job ? (
            <Link to="/projects/$projectId" params={{ projectId: job.id }} className="mt-1 block text-sm font-semibold text-navy">
              Open project {job.id} →
            </Link>
          ) : null}
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold">Proposal</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Package</span><b>{opp.product}</b></li>
            <li className="flex justify-between"><span>Price</span><b className="tabular-nums">{money(opp.amount)}</b></li>
            <li className="flex justify-between"><span>Financing</span><b>Cash or 12-mo</b></li>
          </ul>
        </article>
      </section>
    </main>
  );
}
