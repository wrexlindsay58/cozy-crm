import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { allInvoices, useJobs } from "@/features/job/store";
import { money } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  useJobs();
  const rows = allInvoices();

  return (
    <main className="mx-auto max-w-7xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Money" title="Invoices" count={`${rows.length} rows`} />
      <ul className="divide-y divide-line rounded-md border border-line bg-card">
        {rows.map((r) => (
          <li key={`${r.jobId}-${r.id}`}>
            <Link to="/projects/$projectId" params={{ projectId: r.jobId }} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-page">
              <span className="font-semibold">
                {r.id} · {r.name}
              </span>
              <span className="tabular-nums text-muted">
                {r.kind} · {money(r.amount)} · {r.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
