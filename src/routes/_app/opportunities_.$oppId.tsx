import { Link, createFileRoute } from "@tanstack/react-router";
import { Page, StatusPill } from "@/components/ui-bits";
import { byId, leads, money, opportunities, projects } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/opportunities_/$oppId")({
  component: OppDetail,
});

function OppDetail() {
  const { oppId } = Route.useParams();
  const opp = byId(opportunities, oppId);
  if (!opp) {
    return (
      <Page>
        <p className="text-[13px] text-muted">Opportunity not found.</p>
        <Link to="/opportunities" className="text-[13px] font-semibold text-navy">
          Opportunities
        </Link>
      </Page>
    );
  }
  const lead = byId(leads, opp.leadId);
  const job = projects.find((p) => p.name.includes(opp.name.split(" ")[0]));

  return (
    <Page className="space-y-4">
      <Link to="/opportunities" className="text-[13px] font-semibold text-muted hover:text-ink">
        Opportunities
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-sm bg-card p-4">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{opp.id}</p>
          <h1 className="text-[28px] font-bold tracking-tight">{opp.name}</h1>
          <p className="mt-1 text-[13px] text-muted">{opp.product}</p>
        </div>
        <div className="text-right">
          <StatusPill label={opp.stage} tone={opp.tone} />
          <p className="mt-2 text-[20px] font-bold tabular-nums">{money(opp.amount)}</p>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-sm bg-card p-4">
          <h2 className="mb-3 text-[13px] font-bold">Deal</h2>
          <p className="text-[13px] text-muted">
            Closer {opp.closer} · {opp.office}
          </p>
          <p className="mt-1 text-[13px] text-muted">
            Updated {opp.updated} · Close by {opp.closeBy}
          </p>
          {lead ? (
            <Link to="/leads/$leadId" params={{ leadId: lead.id }} className="mt-3 block text-[13px] font-semibold text-navy">
              Open lead
            </Link>
          ) : null}
          {job ? (
            <Link to="/projects/$projectId" params={{ projectId: job.id }} className="mt-1 block text-[13px] font-semibold text-navy">
              Open job
            </Link>
          ) : null}
        </article>
        <article className="rounded-sm bg-card p-4">
          <h2 className="mb-3 text-[13px] font-bold">Proposal</h2>
          <ul className="space-y-2 text-[13px]">
            <li className="flex justify-between">
              <span>Package</span>
              <b>{opp.product}</b>
            </li>
            <li className="flex justify-between">
              <span>Price</span>
              <b className="tabular-nums">{money(opp.amount)}</b>
            </li>
            <li className="flex justify-between">
              <span>Financing</span>
              <b>Cash or 12-mo</b>
            </li>
          </ul>
        </article>
      </section>
    </Page>
  );
}
