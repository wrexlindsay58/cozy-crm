import { Link, createFileRoute } from "@tanstack/react-router";
import { Page, StatusPill } from "@/components/ui-bits";
import { activities, appointments, byId, conversations, leads, money, opportunities } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/leads_/$leadId")({
  component: LeadDetail,
});

function LeadDetail() {
  const { leadId } = Route.useParams();
  const lead = byId(leads, leadId);
  if (!lead) {
    return (
      <Page>
        <p className="text-[13px] text-muted">Lead not found.</p>
        <Link to="/leads" className="text-[13px] font-semibold text-navy">
          Leads
        </Link>
      </Page>
    );
  }
  const timeline = activities[lead.id] ?? [{ at: lead.created, who: lead.setter, what: `Lead created from ${lead.source}.` }];
  const opp = opportunities.find((o) => o.leadId === lead.id);
  const sits = appointments.filter((a) => a.leadId === lead.id);
  const thread = conversations.find((c) => c.leadId === lead.id);

  return (
    <Page className="space-y-4">
      <Link to="/leads" className="text-[13px] font-semibold text-muted hover:text-ink">
        Leads
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-sm bg-card p-4">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{lead.id}</p>
          <h1 className="text-[28px] font-bold tracking-tight">{lead.name}</h1>
          <p className="mt-1 text-[13px] text-muted">
            {lead.address} · {lead.city}
          </p>
        </div>
        <div className="text-right">
          <StatusPill label={lead.status} tone={lead.tone} />
          <p className="mt-2 text-[20px] font-bold tabular-nums">{money(lead.value)}</p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-sm bg-card p-4 lg:col-span-2">
          <h2 className="mb-3 text-[13px] font-bold">File</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
            <Field k="Phone" v={lead.phone} />
            <Field k="Email" v={lead.email} />
            <Field k="Source" v={lead.source} />
            <Field k="Office" v={lead.office} />
            <Field k="Setter" v={lead.setter} />
            <Field k="Closer" v={lead.closer} />
            <Field k="Product" v={lead.product} />
            <Field k="Created" v={lead.created} />
          </dl>
          <p className="mt-4 rounded-sm bg-page px-3 py-2 text-[13px]">{lead.notes}</p>
        </article>
        <article className="rounded-sm bg-card p-4">
          <h2 className="mb-3 text-[13px] font-bold">Next</h2>
          <p className="text-[16px] font-bold">{lead.next}</p>
          {opp ? (
            <Link to="/opportunities/$oppId" params={{ oppId: opp.id }} className="mt-3 block text-[13px] font-semibold text-navy">
              Opportunity {opp.id}
            </Link>
          ) : null}
          <div className="mt-4 grid gap-2">
            <a href={`tel:${lead.phone}`} className="grid h-10 place-items-center rounded-md bg-navy text-[13px] font-semibold text-card">
              Call
            </a>
            <Link to="/calendar" className="grid h-10 place-items-center rounded-md bg-page text-[13px] font-semibold">
              Book
            </Link>
            {thread ? (
              <Link to="/conversations" className="grid h-10 place-items-center rounded-md bg-page text-[13px] font-semibold">
                Inbox{thread.unread ? ` ${thread.unread}` : ""}
              </Link>
            ) : null}
          </div>
        </article>
      </section>

      <article className="rounded-sm bg-card p-4">
        <h2 className="mb-3 text-[13px] font-bold">Appointments</h2>
        {sits.length === 0 ? <p className="text-[13px] text-muted">None on the book.</p> : null}
        <ul className="divide-y divide-line text-[13px]">
          {sits.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                Sep {a.day} {a.time} · {a.product}
              </span>
              <StatusPill label={a.status} tone={a.tone} />
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-sm bg-card p-4">
        <h2 className="mb-3 text-[13px] font-bold">Activity</h2>
        <ol className="space-y-3">
          {timeline.map((a) => (
            <li key={a.at} className="border-l-4 border-line pl-3">
              <p className="text-[11px] font-semibold text-muted">
                {a.at} · {a.who}
              </p>
              <p className="text-[13px]">{a.what}</p>
            </li>
          ))}
        </ol>
      </article>
    </Page>
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
