import { Link, createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/ui-bits";
import { units } from "@/lib/dispatch-data";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/_app/crews")({
  component: CrewsPage,
});

const CREWS = [
  { id: "tasha", truck: "AZ-1", people: ["Tasha Reed", "Omar Diaz"], product: "Attic / air seal", next: "Whitaker · Fri Sep 18 7:30a", stock: "Baffles 40, cellulose 18 bags", office: "PHX" },
  { id: "evan", truck: "AZ-2", people: ["Evan Cole", "Rico Santos"], product: "HVAC / ducts", next: "Cho · Mon Sep 22 7:00a", stock: "4-ton on order", office: "PHX" },
  { id: "dfw1", truck: "DFW-1", people: ["Luis Crew", "Matt Hale"], product: "Attic / Aeroseal", next: "Rahman · Sep 24 8:00a", stock: "Loaded", office: "DFW" },
];

function CrewsPage() {
  return (
    <Page>
      <PageTitle title="Crews" count={`${CREWS.length} trucks`} />
      <div className="grid gap-4 lg:grid-cols-3">
        {CREWS.map((c) => {
          const u = units.find((x) => x.id === c.id);
          return (
            <article key={c.truck} className="rounded-sm bg-card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[16px] font-bold">{c.truck}</h2>
                <span className="text-[11px] font-bold text-muted uppercase">{c.office}</span>
              </div>
              <p className="text-[13px] text-muted">{c.product}</p>
              <ul className="mt-3 divide-y divide-line text-[13px]">
                {c.people.map((m) => (
                  <li key={m} className="py-2">
                    {m}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px]">
                <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Next</span>
                <span className="mt-1 block font-medium">{c.next}</span>
              </p>
              <p className="mt-2 text-[11px] text-muted">{c.stock}</p>
              {u ? (
                <p className={cn("mt-3 text-[11px] font-bold uppercase", u.status === "idle" ? "text-muted" : "text-watch")}>
                  {u.status === "idle" ? "At shop" : u.status}
                </p>
              ) : null}
              <Link to="/dispatch" className="mt-3 inline-block text-[13px] font-semibold text-navy">
                Map
              </Link>
            </article>
          );
        })}
      </div>
    </Page>
  );
}
