import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/ui-bits";
import { money } from "@/lib/crm-data";
import { units } from "@/lib/dispatch-data";
import { weekClosers as closers, weekSetters as setters } from "@/lib/snapshot";

export const Route = createFileRoute("/_app/team")({
  component: TeamPage,
});

function TeamPage() {
  return (
    <Page>
      <PageTitle title="Team" count={`${units.length}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm bg-card p-4">
          <h2 className="mb-2 text-[13px] font-bold">Closers</h2>
          <ul className="divide-y divide-line text-[13px]">
            {closers.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-2 py-2">
                <span>{r.name}</span>
                <span className="tabular-nums text-muted">{r.sold} sold</span>
                <span className="font-semibold tabular-nums">{money(r.rev)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-sm bg-card p-4">
          <h2 className="mb-2 text-[13px] font-bold">Setters</h2>
          <ul className="divide-y divide-line text-[13px]">
            {setters.map((r) => (
              <li key={r.name} className="flex justify-between py-2">
                <span>{r.name}</span>
                <span className="tabular-nums text-muted">
                  {r.set} set · {r.ran} ran
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-sm bg-card p-4 lg:col-span-2">
          <h2 className="mb-2 text-[13px] font-bold">Ping</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {units.map((u) => (
              <li key={u.id} className="rounded-sm bg-page px-3 py-2">
                <p className="font-semibold">{u.name}</p>
                <p className="text-[11px] text-muted">
                  {u.role} · {u.office} · {u.lastPing}
                </p>
                <p className="text-[11px]">{u.next}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
}
