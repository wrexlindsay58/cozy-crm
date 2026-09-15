import { Link, createFileRoute } from "@tanstack/react-router";
import { Page, StatusPill } from "@/components/ui-bits";
import { accounts, byId, money, projects } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/accounts_/$accountId")({
  component: AccountDetail,
});

function AccountDetail() {
  const { accountId } = Route.useParams();
  const account = byId(accounts, accountId);
  if (!account) {
    return (
      <Page>
        <p className="text-[13px] text-muted">Account not found.</p>
        <Link to="/accounts" className="text-[13px] font-semibold text-navy">
          Accounts
        </Link>
      </Page>
    );
  }
  const jobs = projects.filter((p) => p.accountId === account.id);

  return (
    <Page className="space-y-4">
      <Link to="/accounts" className="text-[13px] font-semibold text-muted hover:text-ink">
        Accounts
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-sm bg-card p-4">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{account.id}</p>
          <h1 className="text-[28px] font-bold tracking-tight">{account.name}</h1>
          <p className="mt-1 text-[13px] text-muted">
            {account.city} · {account.owner}
          </p>
        </div>
        <div className="text-right">
          <StatusPill label={account.type} tone={account.type === "Repeat" ? "navy" : "up"} />
          <p className="mt-2 text-[20px] font-bold tabular-nums">{money(account.lifetime)}</p>
        </div>
      </header>
      <article className="rounded-sm bg-card p-4">
        <h2 className="mb-3 text-[13px] font-bold">Jobs</h2>
        <ul className="divide-y divide-line">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between py-2 text-[13px]">
              <Link to="/projects/$projectId" params={{ projectId: j.id }} className="font-semibold hover:text-navy">
                {j.name}
              </Link>
              <span className="tabular-nums text-muted">{money(j.amount)}</span>
            </li>
          ))}
          {jobs.length === 0 ? <li className="py-2 text-[13px] text-muted">No jobs on file.</li> : null}
        </ul>
      </article>
    </Page>
  );
}
