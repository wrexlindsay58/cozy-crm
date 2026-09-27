import { money } from "@/lib/crm-data";
import { Fact, FactGrid, FileBlock, Ledger } from "@/features/record-shell/file-sheet";
import { shortDay, clock, CheckList } from "./part-01";

export function JobRecordView(props: { bag: { customerInvoices: any; job: any } }) {
  const { customerInvoices, job } = props.bag;
  return (
    <FileBlock title="Paperwork">
        {customerInvoices.length === 0 && job.workOrders.length === 0 && job.pos.length === 0 && job.changeOrders.length === 0 ? (
          <p className="type-meta">No paperwork yet.</p>
        ) : null}
        <Ledger
          columns={["Invoice", "Amount", "Status", "Paid"]}
          rows={customerInvoices.map((inv: any) => ({ id: inv.id, cells: [`${inv.kind} invoice`, money(inv.amount), inv.status, inv.paid ? money(inv.paid) : ""] }))}
        />
        {job.workOrders.length ? (
          <div className="mt-6">
            <Ledger
              columns={["Work order", "Day", "Crew", "Status", "Acknowledged", "Signed"]}
              rows={job.workOrders.map((w: any) => ({ id: w.id, cells: ["Work order", shortDay(w.day) || "No day", w.crew, w.status, w.ackedAt, w.signedAt] }))}
            />
          </div>
        ) : null}
        {job.pos.length ? (
          <div className="mt-6">
            <Ledger columns={["Vendor", "What", "Status"]} rows={job.pos.map((po: any) => ({ id: po.id, cells: [po.vendor, po.what, po.status] }))} />
          </div>
        ) : null}
        {job.changeOrders.length ? (
          <div className="mt-6">
            <Ledger columns={["Change", "Amount", "Status"]} rows={job.changeOrders.map((c: any) => ({ id: c.id, cells: [c.why, money(c.amount), c.status] }))} />
          </div>
        ) : null}
        <p className="type-meta mt-5">{job.packet.sentAt ? `Closing packet sent ${job.packet.sentAt}` : "Closing packet not sent"}</p>
        <ul className="mt-2 divide-y divide-line">
          {job.packet.parts.map((p: any) => (
            <li key={p.id} className="flex items-center justify-between gap-4 py-2.5">
              <span className="type-body">{p.label}</span>
              <span className={p.on ? "type-value text-up" : "type-meta"}>{p.on ? "In" : "Out"}</span>
            </li>
          ))}
        </ul>
      </FileBlock>
  );
}

export function JobRecordView2(props: { bag: { qcDone: any; job: any; onSite: any; start: any; finish: any } }) {
  const { qcDone, job, onSite, start, finish } = props.bag;
  return (
    <FileBlock title="QC" hint={qcDone ? "Checks are done." : `${job.checks.filter((c: any) => c.on).length} of ${job.checks.length} checks done.`}>
        <FactGrid>
          <Fact label="On site" value={onSite} />
          <Fact label="Window" value={start ? `${clock(start)}–${finish ? clock(finish) : ""}` : ""} />
        </FactGrid>
        <ul className="mt-5 divide-y divide-line">
          {job.checks.map((c: any) => (
            <li key={c.id} className="flex items-center justify-between gap-4 py-2.5">
              <span className="type-body">{c.label}</span>
              <span className={c.on ? "type-value text-up" : "type-meta"}>{c.on ? "Done" : "Open"}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <CheckList title="Pre-install acknowledgement" signedAt={job.preCheck.signedAt} signedBy={job.preCheck.signedBy} relation={job.preCheck.relation} signature={job.preCheck.signature} photos={job.preCheck.photos} items={job.preCheck.items} />
          <CheckList title="Post-install acknowledgement" signedAt={job.postCheck.signedAt} signedBy={job.postCheck.signedBy} relation={job.postCheck.relation} signature={job.postCheck.signature} photos={job.postCheck.photos} items={job.postCheck.items} />
        </div>
        {job.testOut.blowerBefore || job.testOut.blowerAfter || job.testOut.ductBefore || job.testOut.ductAfter ? (
          <div className="mt-5">
            <FactGrid>
              <Fact label="Blower before" value={job.testOut.blowerBefore} />
              <Fact label="Blower after" value={job.testOut.blowerAfter} />
              <Fact label="Ducts before" value={job.testOut.ductBefore} />
              <Fact label="Ducts after" value={job.testOut.ductAfter} />
            </FactGrid>
          </div>
        ) : (
          <p className="type-meta mt-5">No blower or duct numbers yet.</p>
        )}
        {job.punch.length ? (
          <div className="mt-5">
            <Ledger columns={["Punch", "Status", "Owner"]} rows={job.punch.map((p: any) => ({ id: p.id, cells: [p.item, p.status, p.owner] }))} />
          </div>
        ) : null}
      </FileBlock>
  );
}

export function JobRecordView3(props: { bag: { job: any } }) {
  const { job } = props.bag;
  return (
    <FileBlock title="House and permits">
        <FactGrid>
          <Fact label="Access" value={job.access} wide />
          <Fact label="Permit" value={job.permit.number} />
          <Fact label="City" value={job.permit.city} />
          <Fact label="Inspection" value={job.permit.inspection ? shortDay(job.permit.inspection) : ""} />
          <Fact label="Result" value={job.permit.result === "None" ? "" : job.permit.result} />
          <Fact label="Utility" value={job.rebate.utility} />
          <Fact label="Program" value={job.rebate.program} />
          <Fact label="Rebate status" value={job.rebate.status === "None" ? "" : job.rebate.status} />
          <Fact label="Rebate" value={job.rebate.amount ? money(job.rebate.amount) : ""} />
          {job.holds.flatMap((h: any) => [
            <Fact key={`${h.kind}-note`} label={h.kind} value={h.note} wide />,
            <Fact key={`${h.kind}-when`} label={`${h.kind} since`} value={h.at} />,
          ])}
        </FactGrid>
        {job.scope.some((s: any) => s.surveyFacts && Object.keys(s.surveyFacts).length) ? (
          <div className="mt-5">
            <Ledger
              columns={["Scope", "Fact", "Value"]}
              rows={job.scope.flatMap((s: any) => Object.entries(s.surveyFacts ?? {}).map(([k, v]) => ({ id: `${s.id}-${k}`, cells: [s.label, k, v] })))}
            />
          </div>
        ) : null}
        {job.scope.some((s: any) => s.surveyRooms?.length) ? (
          <div className="mt-5">
            <Ledger
              columns={["Room", "Scope", "Area", "Registers"]}
              rows={job.scope.flatMap((s: any) => (s.surveyRooms ?? []).map((r: any) => ({ id: r.id, cells: [r.name, s.label, r.area, r.registers] })))}
            />
          </div>
        ) : null}
      </FileBlock>
  );
}
