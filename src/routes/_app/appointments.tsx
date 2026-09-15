import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FilterChip, Page, PageTitle, StatusPill, wash } from "@/components/ui-bits";
import { appointments, money } from "@/lib/crm-data";
import { board } from "@/lib/dispatch-data";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/_app/appointments")({
  component: AppointmentsPage,
});

const BUCKETS = ["Unmarked", "No sit", "Missed", "One legger", "Reschedule", "Confirmed", "Ran", "Install"] as const;

function bucketFlag(b: string) {
  if (b === "Unmarked" || b === "No sit" || b === "Missed") return "stop" as const;
  if (b === "One legger" || b === "Reschedule") return "watch" as const;
  if (b === "Ran" || b === "Install") return "go" as const;
  return "info" as const;
}

function AppointmentsPage() {
  const [bucket, setBucket] = useState<(typeof BUCKETS)[number]>("Unmarked");
  const rows = useMemo(() => {
    const mapped = appointments.map((a) => {
      const b = board.find((x) => x.leadId === a.leadId && x.day === a.day);
      return { ...a, amount: b?.amount ?? 0 };
    });
    return mapped.filter((a) => a.status === bucket);
  }, [bucket]);

  const counts = BUCKETS.map((b) => ({
    b,
    n: appointments.filter((a) => a.status === b).length,
  }));
  const flag = bucketFlag(bucket);

  return (
    <Page>
      <PageTitle title="Appointments" count={`${rows.length}`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {counts.map(({ b, n }) => (
          <FilterChip key={b} active={bucket === b} onClick={() => setBucket(b)}>
            {b} {n}
          </FilterChip>
        ))}
      </div>
      <ul className="overflow-hidden rounded-sm bg-card">
        {rows.map((a) => (
          <li key={a.id} className={cn("flex flex-wrap items-center gap-3 border-l-4 px-4 py-3", wash(flag), flag === "stop" ? "border-l-stop" : flag === "watch" ? "border-l-watch" : "border-l-navy")}>
            <div className="min-w-0 flex-1">
              <Link to="/leads/$leadId" params={{ leadId: a.leadId }} className="font-semibold hover:text-navy">
                {a.name}
              </Link>
              <p className="text-[11px] text-muted">
                Sep {a.day} {a.time} · {a.city} · {a.closer} · {a.product}
              </p>
            </div>
            {a.amount ? <span className="text-[13px] font-semibold tabular-nums">{money(a.amount)}</span> : null}
            <StatusPill label={a.status} tone={a.tone} />
          </li>
        ))}
        {rows.length === 0 ? <li className="px-4 py-8 text-[13px] text-muted">None in {bucket}.</li> : null}
      </ul>
    </Page>
  );
}
