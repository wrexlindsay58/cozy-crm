import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/ui-bits";
import { units } from "@/lib/dispatch-data";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

const OFFICES = [
  { name: "Phoenix", shop: "15420 N El Mirage Rd", people: 6 },
  { name: "Scottsdale", shop: "Runs from PHX shop", people: 2 },
  { name: "Dallas", shop: "4418 Swiss corridor", people: 2 },
  { name: "Fort Worth", shop: "With DFW-1", people: 1 },
];

function SettingsPage() {
  return (
    <Page>
      <PageTitle title="Settings" />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm bg-card p-4">
          <h2 className="mb-2 text-[13px] font-bold">Company</h2>
          <dl className="divide-y divide-line text-[13px]">
            <Row k="Name" v="Cozy Home Performance" />
            <Row k="HQ" v="Surprise, AZ" />
            <Row k="Fiscal year" v="January to December" />
          </dl>
        </section>
        <section className="rounded-sm bg-card p-4">
          <h2 className="mb-2 text-[13px] font-bold">Offices</h2>
          <ul className="divide-y divide-line text-[13px]">
            {OFFICES.map((o) => (
              <li key={o.name} className="flex justify-between py-2">
                <span>
                  {o.name}
                  <span className="block text-[11px] text-muted">{o.shop}</span>
                </span>
                <span className="tabular-nums text-muted">{o.people}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-sm bg-card p-4 lg:col-span-2">
          <h2 className="mb-2 text-[13px] font-bold">People</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {units.map((u) => (
              <li key={u.id} className="rounded-sm bg-page px-3 py-2 text-[13px]">
                <p className="font-semibold">{u.name}</p>
                <p className="text-[11px] text-muted">
                  {u.role} · {u.office} · {u.phone}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-8 text-[11px] text-faint">Sample records. Not live Odin.</p>
    </Page>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-2">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
