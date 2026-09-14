import { Link, createFileRoute } from "@tanstack/react-router";
import { StatusPill } from "@/components/ui-bits";
import { accounts, byId, money, projects } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/accounts/$accountId")({
  component: AccountDetail,
});

function AccountDetail() {
  const { accountId } = Route.useParams();
  const account = byId(accounts, accountId);
  if (!account) {
    return (
      <main className="p-6 text-sm text-muted">
        Account not found. <Link to="/accounts">Back</Link>
      </main>
    );
  }
  const jobs = projects.filter((p) => p.accountId === account.id);

  return (
    <main className="mx-auto max-w-5xl space-y-3 p-4 pb-10 md:p-5">
      <Link to="/accounts" className="text-xs font-semibold text-muted hover:text-ink">
        ← Accounts
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-card p-4 shadow-sm">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">{account.id}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{account.name}</h1>
          <p className="mt-1 text-sm text-muted">{account.city} · {account.owner}</p>
        </div>
        <div className="text-right">
          <StatusPill label={account.type} tone={account.type === "Repeat" ? "navy" : "up"} />
          <p className="mt-2 text-xl font-extrabold tabular-nums">{money(account.lifetime)}</p>
        </div>
      </header>
      <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">Jobs</h2>
        <ul className="divide-y divide-line">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between py-2 text-sm">
              <Link to="/projects/$projectId" params={{ projectId: j.id }} className="font-semibold hover:text-navy">
                {j.name}
              </Link>
              <span className="tabular-nums text-muted">{money(j.amount)}</span>
            </li>
          ))}
          {jobs.length === 0 ? <li className="py-2 text-sm text-muted">No jobs on file.</li> : null}
        </ul>
      </article>
    </main>
  );
}
