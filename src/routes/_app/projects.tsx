import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ListPage } from "@/features/lists/list-page";
import { jobTone, STAGES, tally, useJobs, type JobFile } from "@/features/job/store";
import { useOps } from "@/features/ops/store";
import { money, type Lead } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/projects")({
  component: JobsPage,
});

const VIEWS = ["All", ...STAGES, "Holds"] as const;

type JobRow = JobFile & { id: string; lead?: Lead };

function JobsPage() {
  const jobs = useJobs();
  const { leads } = useOps();
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.values(jobs)
      .map((j) => {
        const lead = leads.find((l) => l.id === j.leadId) ?? leads.find((l) => l.id === j.personId);
        return { ...j, id: j.jobId, lead } satisfies JobRow;
      })
      .filter((j) => {
        if (view === "Holds") {
          if (!j.holds.length) return false;
        } else if (view !== "All" && j.stage !== view) {
          return false;
        }
        if (!needle) return true;
        return [j.lead?.name, j.name, j.product, j.pm, j.closer, j.crew, j.jobId, j.lead?.address, j.lead?.city, j.lead?.office, j.window, j.stage, j.holds.map((h) => `${h.kind} ${h.note}`).join(" ")].join(" ").toLowerCase().includes(needle);
      });
  }, [jobs, leads, view, query]);

  const booked = rows.reduce((s, r) => s + tally(r).revenue, 0);

  return (
    <ListPage
      title="Jobs"
      count={`${rows.length} · ${money(booked)}`}
      views={[...VIEWS]}
      view={view}
      onView={(v) => setView(v as (typeof VIEWS)[number])}
      search={query}
      onSearch={setQuery}
      searchPlaceholder="Name, address, crew, stage"
      empty={rows.length === 0 ? <Empty>No jobs in {view}. Clear the filter.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/projects/${r.jobId}`}
        columns={[
          {
            key: "name",
            label: "Name",
            render: (r) => (
              <span>
                <span className="font-semibold">{r.lead?.name ?? r.name}</span>
                {r.lead?.address ? <span className="mt-0.5 block text-[12px] font-normal text-muted">{r.lead.address}</span> : null}
              </span>
            ),
          },
          {
            key: "stage",
            label: "Stage",
            render: (r) => <StatusPill label={r.holds.length ? `${r.stage} · ${r.holds.map((h) => h.kind).join(", ")}` : r.stage} tone={jobTone(r)} />,
          },
          {
            key: "next",
            label: "Next",
            hide: "md",
            render: (r) => {
              const next = r.appointments.find((a) => a.status !== "Done") ?? r.appointments[0];
              return <span className="text-muted">{next ? `${next.kind} ${next.day}` : r.window}</span>;
            },
          },
          { key: "who", label: "Who", hide: "md", render: (r) => r.pm },
          { key: "crew", label: "Crew", hide: "lg", render: (r) => <span className="text-muted">{r.assignments.length > 1 ? `${r.assignments.length} crews` : r.crew || "—"}</span> },
          { key: "office", label: "Office", hide: "lg", render: (r) => r.lead?.office ?? "—" },
          { key: "amount", label: "$", render: (r) => <span className="font-semibold tabular-nums">{money(tally(r).revenue)}</span> },
        ]}
      />
    </ListPage>
  );
}
