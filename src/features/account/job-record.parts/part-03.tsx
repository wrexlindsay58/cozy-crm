import { money } from "@/lib/crm-data";
import { Bits, Fact, FactGrid, FileBlock, Ledger } from "@/features/record-shell/file-sheet";
import { clock, span, dur } from "./part-01";

export function JobRecordView4(props: { bag: { job: any; siteMin: any; travelMin: any; jobMin: any; estHours: any } }) {
  const { job, siteMin, travelMin, jobMin, estHours } = props.bag;
  return (
    <FileBlock title="Hours" hint="Travel, time on site, and the whole job.">
        <FactGrid>
          <Fact label="On site" value={job.punches.length ? dur(siteMin) : "No clock"} />
          <Fact label="Travel" value={job.punches.length ? dur(travelMin) : "No clock"} />
          <Fact label="Total job hours" value={job.punches.length ? dur(jobMin) : "No clock"} />
          <Fact label="Estimated" value={estHours ? `${estHours}h` : "Not set"} />
        </FactGrid>
        {job.punches.length ? (
          <ul className="mt-5 space-y-3">
            {job.punches.map((p: any) => (
              <li key={p.id} className="rounded-md bg-page px-4 py-4">
                <p className="type-value">{p.who}</p>
                <Bits
                  items={[
                    { label: "Day", value: p.day },
                    { label: "Left yard", value: clock(p.leftYard) },
                    { label: "Arrived", value: clock(p.onSite) },
                    { label: "Travel", value: span(p.leftYard, p.onSite) },
                    { label: "Done", value: clock(p.complete) },
                    { label: "On site", value: span(p.onSite, p.complete) },
                    { label: "Back", value: clock(p.back) },
                    { label: "Return", value: span(p.complete, p.back) },
                  ]}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </FileBlock>
  );
}

export function JobRecordView5(props: { bag: { materials: any; job: any } }) {
  const { materials, job } = props.bag;
  return (
    <FileBlock title="Materials">
        {materials.length === 0 && job.equipment.length === 0 ? <p className="type-meta">No materials on this job.</p> : null}
        <Ledger
          columns={["Item", "Assumed", "Used", "Status", "Returned", "Credit", "Cost"]}
          rows={materials.map((b: any) => ({
            id: b.id,
            cells: [
              b.name,
              `${b.estQty} ${b.unit}`,
              `${b.usedQty || 0} ${b.unit}`,
              b.received ? "Received" : b.ready ? "Ready" : b.ordered ? "Ordered" : "Not ordered",
              b.returnQty ? String(b.returnQty) : "",
              b.returnCredit ? money(b.returnCredit) : "",
              b.actualUnitCost == null ? "" : b.actualUnitCost > b.unitCost ? "Over assumed" : b.actualUnitCost < b.unitCost ? "Under assumed" : "Matched",
            ],
          }))}
        />
        {job.equipment.length ? (
          <div className="mt-6">
            <Ledger
              columns={["Equipment", "Model", "Serial", "ETA", "Status"]}
              rows={job.equipment.map((e: any) => ({ id: e.id, cells: [e.name || "Equipment", e.model, e.serial, e.eta, e.status] }))}
            />
          </div>
        ) : null}
      </FileBlock>
  );
}
