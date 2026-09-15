import { Link, createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/ui-bits";
import { appointments, leads, money, projects } from "@/lib/crm-data";
import { funnel, offices, products } from "@/lib/sales-data";
import { snapshot as s } from "@/lib/snapshot";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const unmarked = appointments.filter((a) => a.status === "Unmarked" || a.status === "Missed").length;
  const holds = projects.filter((p) => p.status === "On hold").length;
  const openLeads = leads.filter((l) => l.status !== "Sold").length;

  return (
    <Page>
      <PageTitle title="Reports" />
      <section className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat k="Sales this week" v={money(s.salesWeek)} />
        <Stat k="Open leads" v={openLeads} />
        <Stat k="Unmarked / missed" v={unmarked} />
        <Stat k="Jobs on hold" v={holds} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-sm bg-card p-4">
          <h2 className="mb-3 text-[13px] font-bold">Product</h2>
          <ul className="divide-y divide-line text-[13px]">
            {products.map((p) => (
              <li key={p.name} className="flex justify-between py-2">
                <span>{p.name}</span>
                <span className="font-semibold tabular-nums">{p.amt}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-sm bg-card p-4">
          <h2 className="mb-3 text-[13px] font-bold">Office</h2>
          <ul className="divide-y divide-line text-[13px]">
            {offices.map((o) => (
              <li key={o.name} className="flex justify-between py-2">
                <span>{o.name}</span>
                <span className="font-semibold tabular-nums">{o.amt}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-sm bg-card p-4 lg:col-span-2">
          <h2 className="mb-3 text-[13px] font-bold">Path</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {funnel.map((f) => (
              <div key={f.l} className="rounded-sm bg-page px-3 py-2">
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{f.l}</p>
                <p className="text-[20px] font-bold tabular-nums">{f.n}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
            <Link to="/appointments" className="font-semibold text-navy">
              Appointments
            </Link>
            <Link to="/scoreboard" className="font-semibold text-navy">
              Sales
            </Link>
            <Link to="/leaderboard" className="font-semibold text-navy">
              Leaderboard
            </Link>
          </div>
        </article>
      </section>
    </Page>
  );
}

function Stat({ k, v }: { k: string; v: string | number }) {
  return (
    <article className="rounded-sm bg-card px-3 py-3">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{k}</p>
      <p className="text-[20px] font-bold tabular-nums">{v}</p>
    </article>
  );
}
