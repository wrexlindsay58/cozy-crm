import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FilterChip, PageHeader, StatusPill } from "@/components/ui-bits";
import { tickets, type Ticket } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/tickets")({
  component: TicketsPage,
});

function toneFor(t: Ticket) {
  if (t.status === "Done") return "up" as const;
  if (t.priority === "High") return "alert" as const;
  return "navy" as const;
}

function relatedTo(id: string) {
  if (id.startsWith("L-")) return `/leads/${id}`;
  if (id.startsWith("P-")) return `/projects/${id}`;
  return "/tickets";
}

function TicketsPage() {
  const [filter, setFilter] = useState<"All" | "Open" | "Waiting" | "Done">("All");
  const rows = useMemo(
    () => tickets.filter((t) => filter === "All" || t.status === filter),
    [filter],
  );

  return (
    <main className="mx-auto max-w-5xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Ops" title="Tickets" count={`${rows.filter((t) => t.status !== "Done").length} open`} />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["All", "Open", "Waiting", "Done"] as const).map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </FilterChip>
        ))}
      </div>
      <ul className="space-y-2">
        {rows.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.title}</p>
              <p className="text-xs text-muted">
                {t.id} · {t.owner} · {t.age}
              </p>
            </div>
            <Link to={relatedTo(t.related) as never} className="text-xs font-semibold text-navy">
              {t.related}
            </Link>
            <StatusPill label={`${t.priority} · ${t.status}`} tone={toneFor(t)} />
          </li>
        ))}
      </ul>
    </main>
  );
}
