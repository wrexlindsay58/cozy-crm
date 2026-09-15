import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FilterChip, Page, PageTitle, StatusPill } from "@/components/ui-bits";
import { tickets, type Ticket } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

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
  const rows = useMemo(() => tickets.filter((t) => filter === "All" || t.status === filter), [filter]);
  const oldest = tickets.filter((t) => t.status !== "Done").sort((a, b) => parseInt(b.age, 10) - parseInt(a.age, 10))[0];

  return (
    <Page>
      <PageTitle title="Tickets" count={oldest ? `oldest ${oldest.age}` : undefined} />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", "Open", "Waiting", "Done"] as const).map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </FilterChip>
        ))}
      </div>
      <ul className="overflow-hidden rounded-sm bg-card">
        {rows.map((t) => (
          <li
            key={t.id}
            className={cn(
              "flex flex-wrap items-center gap-3 border-l-4 px-4 py-3",
              t.priority === "High" && t.status !== "Done" ? "border-l-stop bg-stop-bg" : "border-l-navy",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.title}</p>
              <p className="text-[11px] text-muted">
                {t.id} · {t.owner} · {t.age}
              </p>
            </div>
            <Link to={relatedTo(t.related) as never} className="text-[13px] font-semibold text-navy">
              {t.related}
            </Link>
            <StatusPill label={`${t.priority} · ${t.status}`} tone={toneFor(t)} />
          </li>
        ))}
      </ul>
    </Page>
  );
}
