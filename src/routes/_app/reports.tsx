import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { funnel, offices, products } from "@/lib/sales-data";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

const CARDS = [
  { title: "Sales dashboard", to: "/", note: "Revenue, KPIs, conversion path" },
  { title: "Lead book", to: "/leads", note: "Unmarked, pending, set no-run" },
  { title: "Production schedule", to: "/projects", note: "Install dates and holds" },
  { title: "Rep performance", to: "/leaderboard", note: "Closer revenue and setter volume" },
];

function ReportsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4 pb-10 md:p-5">
      <PageHeader kicker="Ops" title="Reports" />
      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="rounded-xl border border-line bg-card p-4 shadow-sm hover:border-navy"
          >
            <h2 className="font-bold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted">{c.note}</p>
          </Link>
        ))}
      </div>
      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">YTD product mix</h3>
          <ul className="space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.name} className="flex justify-between">
                <span>{p.name}</span>
                <b className="tabular-nums">{p.amt}</b>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">Office revenue</h3>
          <ul className="space-y-2 text-sm">
            {offices.map((o) => (
              <li key={o.name} className="flex justify-between">
                <span>{o.name}</span>
                <b className="tabular-nums">{o.amt}</b>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Path: {funnel.map((f) => `${f.l} ${f.n}`).join(" → ")}
          </p>
        </article>
      </section>
    </main>
  );
}
