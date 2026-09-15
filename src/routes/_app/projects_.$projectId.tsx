import { Link, createFileRoute } from "@tanstack/react-router";
import { Page, StatusPill } from "@/components/ui-bits";
import { accounts, byId, money, projects } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/projects_/$projectId")({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const job = byId(projects, projectId);
  if (!job) {
    return (
      <Page>
        <p className="text-[13px] text-muted">Job not found.</p>
        <Link to="/projects" className="text-[13px] font-semibold text-navy">
          Jobs
        </Link>
      </Page>
    );
  }
  const account = byId(accounts, job.accountId);

  return (
    <Page className="space-y-4">
      <Link to="/projects" className="text-[13px] font-semibold text-muted hover:text-ink">
        Jobs
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-sm bg-card p-4">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{job.id}</p>
          <h1 className="text-[28px] font-bold tracking-tight">{job.name}</h1>
          <p className="mt-1 text-[13px] text-muted">
            {job.product} · {job.office}
          </p>
        </div>
        <div className="text-right">
          <StatusPill label={job.status} tone={job.tone} />
          <p className="mt-2 text-[20px] font-bold tabular-nums">{money(job.amount)}</p>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-sm bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Install</p>
          <p className="mt-1 text-[16px] font-bold">{job.install}</p>
        </article>
        <article className="rounded-sm bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">PM</p>
          <p className="mt-1 text-[16px] font-bold">{job.pm}</p>
        </article>
        <article className="rounded-sm bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Account</p>
          {account ? (
            <Link to="/accounts/$accountId" params={{ accountId: account.id }} className="mt-1 block text-[16px] font-bold text-navy">
              {account.name}
            </Link>
          ) : (
            <p className="mt-1 text-[16px] font-bold">None</p>
          )}
        </article>
      </section>
    </Page>
  );
}
