import { SoldSummary } from "@/features/opportunity/sold-summary";
import { Fact, FactGrid, FileBlock, Ledger } from "@/features/record-shell/file-sheet";
import { when, shortDay, clock } from "./part-01";
import { JobRecordView, JobRecordView2, JobRecordView3 } from "./part-02";
import { JobRecordView4, JobRecordView5 } from "./part-03";

export function JobRecordView6(props: { bag: { job: any; onSite: any; start: any; finish: any; account: any; siteMin: any; travelMin: any; jobMin: any; estHours: any; proposal: any; materials: any; qcDone: any; customerInvoices: any } }) {
  const { job, onSite, start, finish, account, siteMin, travelMin, jobMin, estHours, proposal, materials, qcDone, customerInvoices } = props.bag;
  return (
    <div className="space-y-2">
      <FileBlock
        title={`${when(job)} · ${job.stage}`}
        hint={job.closer}
        aside={
          <a href={`/projects/${job.jobId}`} className="type-value text-navy">
            Open job
          </a>
        }
      >
        <FactGrid>
          <Fact label="Sold" value={job.soldAt || "Not dated"} />
          <div>
            <dt className="type-label">On site</dt>
            <dd className="type-value mt-1 text-navy">{onSite}</dd>
          </div>
          <Fact label="Start" value={start ? clock(start) : "Not set"} />
          <Fact label="Finish" value={finish ? clock(finish) : "Not set"} />
          <Fact label="Warranty starts" value={account.warrantyStart || "Not set"} />
          <Fact label="Warranty ends" value={account.warrantyUntil || "Not set"} />
        </FactGrid>
      </FileBlock>

      <FileBlock title="Crews" hint="Who went, when, and in what vehicle.">
        {job.assignments.length === 0 ? <p className="type-meta">No crew assigned.</p> : null}
        <Ledger
          columns={["Crew", "Day", "Window", "Scope", "Vehicle"]}
          rows={job.assignments.map((a: any) => ({
            id: a.id,
            cells: [
              a.crew,
              shortDay(a.day) || "No day",
              `${clock(a.start)}–${clock(a.end)}`,
              a.scopes.map((id: any) => job.scope.find((s: any) => s.id === id)?.label ?? id).join(", "),
              [a.vehicleKind, a.vehicleNo].filter(Boolean).join(" ") || a.truck || "Not set",
            ],
          }))}
        />
      </FileBlock>

      <JobRecordView4 bag={{ job, siteMin, travelMin, jobMin, estHours }} />

      <FileBlock title="Labor" hint="Who was paid, and for what.">
        {job.laborLines?.length ? (
          <Ledger
            columns={["Name", "Crew", "Pay", "Service", "Qty"]}
            rows={job.laborLines.map((l: any) => ({
              id: l.id,
              cells: [l.who, l.crew || "", l.kind, l.service || "", `${l.qty}${l.kind === "Hourly" ? "h" : ""}`],
            }))}
          />
        ) : (
          <p className="type-meta">No labor lines.</p>
        )}
      </FileBlock>

      <FileBlock title="On the book" hint="Each day the crew is scheduled.">
        {job.events.length === 0 ? <p className="type-meta">No days on the book.</p> : null}
        <Ledger
          columns={["Work", "Day", "Window", "Crew", "Status"]}
          rows={job.events.map((e: any) => ({
            id: e.id,
            cells: [e.process || "Day", shortDay(e.day), `${clock(e.start)}–${clock(e.end)}`, e.crew, e.status],
          }))}
        />
      </FileBlock>

      <FileBlock title="What was sold">
        {proposal ? <SoldSummary proposal={proposal} /> : <p className="type-meta">No accepted option on this account.</p>}
      </FileBlock>

      <JobRecordView5 bag={{ materials, job }} />

      <JobRecordView2 bag={{ qcDone, job, onSite, start, finish }} />

      <JobRecordView3 bag={{ job }} />

      <JobRecordView bag={{ customerInvoices, job }} />
    </div>
  );
}
