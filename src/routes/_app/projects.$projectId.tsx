import { Link, createFileRoute } from "@tanstack/react-router";
import { StatusPill } from "@/components/ui-bits";
import { accounts, byId, money, projects } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/projects/$projectId")({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const job = byId(projects, projectId);
  if (!job) {
    return (
      <main className="p-6 text-sm text-muted">
        Project not found. <Link to="/projects">Back</Link>
      </main>
    );
  }
  const account = byId(accounts, job.accountId);

  return (
    <main className="mx-auto max-w-5xl space-y-3 p-4 pb-10 md:p-5">
      <Link to="/projects" className="text-xs font-semibold text-muted hover:text-ink">
        ← Projects
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-card p-4 shadow-sm">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">{job.id}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{job.name}</h1>
          <p className="mt-1 text-sm text-muted">{job.product} · {job.office}</p>
        </div>
        <div className="text-right">
          <StatusPill label={job.status} tone={job.tone} />
          <p className="mt-2 text-xl font-extrabold tabular-nums">{money(job.amount)}</p>
        </div>
      </header>
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">Install</p>
          <p className="mt-1 text-lg font-bold">{job.install}</p>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">Project manager</p>
          <p className="mt-1 text-lg font-bold">{job.pm}</p>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">Account</p>
          {account ? (
            <Link to="/accounts/$accountId" params={{ accountId: account.id }} className="mt-1 block text-lg font-bold text-navy">
              {account.name}
            </Link>
          ) : (
            <p className="mt-1 text-lg font-bold">—</p>
          )}
        </article>
      </section>
    </main>
  );
}
