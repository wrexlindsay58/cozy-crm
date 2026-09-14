import { Link, createFileRoute } from "@tanstack/react-router";
import { StatusPill } from "@/components/ui-bits";
import { activities, byId, leads, money, opportunities } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/leads/$leadId")({
  component: LeadDetail,
});

function LeadDetail() {
  const { leadId } = Route.useParams();
  const lead = byId(leads, leadId);
  if (!lead) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted">Lead not found.</p>
        <Link to="/leads" className="text-sm font-semibold text-navy">
          Back to leads
        </Link>
      </main>
    );
  }
  const timeline = activities[lead.id] ?? [
    { at: lead.created, who: lead.setter, what: `Lead created from ${lead.source}.` },
  ];
  const opp = opportunities.find((o) => o.leadId === lead.id);

  return (
    <main className="mx-auto max-w-5xl space-y-3 p-4 pb-10 md:p-5">
      <Link to="/leads" className="text-xs font-semibold text-muted hover:text-ink">
        ← Leads
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-card p-4 shadow-sm">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">{lead.id}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {lead.address} · {lead.city}
          </p>
        </div>
        <div className="text-right">
          <StatusPill label={lead.status} tone={lead.tone} />
          <p className="mt-2 text-xl font-extrabold tabular-nums">{money(lead.value)}</p>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm md:col-span-2">
          <h2 className="mb-3 text-sm font-bold">Record</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field k="Phone" v={lead.phone} />
            <Field k="Email" v={lead.email} />
            <Field k="Source" v={lead.source} />
            <Field k="Office" v={lead.office} />
            <Field k="Setter" v={lead.setter} />
            <Field k="Closer" v={lead.closer} />
            <Field k="Product" v={lead.product} />
            <Field k="Created" v={lead.created} />
          </dl>
          <p className="mt-4 rounded-lg bg-page px-3 py-2 text-sm text-muted">{lead.notes}</p>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold">Next</h2>
          <p className="text-lg font-bold">{lead.next}</p>
          {opp ? (
            <Link
              to="/opportunities/$oppId"
              params={{ oppId: opp.id }}
              className="mt-3 block text-sm font-semibold text-navy"
            >
              Open opportunity {opp.id} →
            </Link>
          ) : null}
          <div className="mt-4 grid gap-2">
            <button type="button" className="h-10 rounded-lg bg-navy text-sm font-semibold text-card">
              Log activity
            </button>
            <button type="button" className="h-10 rounded-lg border border-line text-sm font-semibold">
              Set appointment
            </button>
          </div>
        </article>
      </section>

      <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">Activity</h2>
        <ol className="space-y-3">
          {timeline.map((a) => (
            <li key={a.at} className="border-l-2 border-line pl-3">
              <p className="text-[11px] font-semibold text-muted">
                {a.at} · {a.who}
              </p>
              <p className="text-sm">{a.what}</p>
            </li>
          ))}
        </ol>
      </article>
    </main>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
