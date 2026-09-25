import { useAccount } from "@/features/account/store";
import { canSeeCost } from "@/features/staff/store";
import { money, opportunities } from "@/lib/crm-data";
import { useProposals } from "@/features/opportunity/store";
import { SoldSummary } from "@/features/opportunity/sold-summary";
import { Bits, Fact, FactGrid, FileBlock, Ledger } from "@/features/record-shell/file-sheet";
import type { JobFile } from "@/features/job/types";

function when(job: JobFile) {
  return job.window.split("·")[0]?.trim() || job.window || "Job";
}

function shortDay(raw: string) {
  if (!raw) return "";
  if (!raw.includes("-")) return raw;
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function clock(raw: string) {
  const [h, m] = raw.split(":").map(Number);
  if (Number.isNaN(h)) return raw;
  const hr = h % 12 || 12;
  return `${hr}:${String(m || 0).padStart(2, "0")}${h < 12 ? "a" : "p"}`;
}

function mins(raw: string) {
  const [h, m] = raw.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

function span(from: string, to: string) {
  const a = mins(from);
  const b = mins(to);
  if (a == null || b == null || b < a) return "";
  const d = b - a;
  const h = Math.floor(d / 60);
  const m = d % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

function dur(min: number) {
  if (min <= 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

export function JobRecord({ job }: { job: JobFile }) {
  const costs = canSeeCost();
  const account = useAccount(job.accountId);
  const proposals = useProposals();
  const opp = opportunities.find((o) => o.leadId === job.leadId);
  const proposal = opp ? proposals[opp.id] : undefined;
  const customerInvoices = job.invoices.filter((i) => costs || (i.party !== "pay" && i.kind !== "Commission" && i.kind !== "Piece"));
  const start = job.assignments.reduce((min, a) => (min && a.start > min ? min : a.start), job.assignments[0]?.start ?? "");
  const finish = job.assignments.reduce((max, a) => (a.end > max ? a.end : max), job.assignments[0]?.end ?? "");
  const onSite = job.assignments[0]?.day ? shortDay(job.assignments[0].day) : when(job);
  const materials = job.scope.flatMap((s) => s.bom.map((b) => ({ ...b, scope: s.label })));
  const qcDone = job.checks.length > 0 && job.checks.every((c) => c.on);
  const estHours = job.scope.reduce((s, line) => s + (line.estHours || 0), 0);
  const travelMin = job.punches.reduce((s, p) => s + (mins(p.onSite) != null && mins(p.leftYard) != null ? (mins(p.onSite)! - mins(p.leftYard)!) : 0) + (mins(p.back) != null && mins(p.complete) != null ? (mins(p.back)! - mins(p.complete)!) : 0), 0);
  const siteMin = job.punches.reduce((s, p) => s + (mins(p.complete) != null && mins(p.onSite) != null ? mins(p.complete)! - mins(p.onSite)! : 0), 0);
  const jobMin = job.punches.reduce((s, p) => s + (mins(p.back) != null && mins(p.leftYard) != null ? mins(p.back)! - mins(p.leftYard)! : 0), 0);

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
          rows={job.assignments.map((a) => ({
            id: a.id,
            cells: [
              a.crew,
              shortDay(a.day) || "No day",
              `${clock(a.start)}–${clock(a.end)}`,
              a.scopes.map((id) => job.scope.find((s) => s.id === id)?.label ?? id).join(", "),
              [a.vehicleKind, a.vehicleNo].filter(Boolean).join(" ") || a.truck || "Not set",
            ],
          }))}
        />
      </FileBlock>

      <FileBlock title="Hours" hint="Travel, time on site, and the whole job.">
        <FactGrid>
          <Fact label="On site" value={job.punches.length ? dur(siteMin) : "No clock"} />
          <Fact label="Travel" value={job.punches.length ? dur(travelMin) : "No clock"} />
          <Fact label="Total job hours" value={job.punches.length ? dur(jobMin) : "No clock"} />
          <Fact label="Estimated" value={estHours ? `${estHours}h` : "Not set"} />
        </FactGrid>
        {job.punches.length ? (
          <ul className="mt-5 space-y-3">
            {job.punches.map((p) => (
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

      <FileBlock title="Labor" hint="Who was paid, and for what.">
        {job.laborLines?.length ? (
          <Ledger
            columns={["Name", "Crew", "Pay", "Service", "Qty"]}
            rows={job.laborLines.map((l) => ({
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
          rows={job.events.map((e) => ({
            id: e.id,
            cells: [e.process || "Day", shortDay(e.day), `${clock(e.start)}–${clock(e.end)}`, e.crew, e.status],
          }))}
        />
      </FileBlock>

      <FileBlock title="What was sold">
        {proposal ? <SoldSummary proposal={proposal} /> : <p className="type-meta">No accepted option on this account.</p>}
      </FileBlock>

      <FileBlock title="Materials">
        {materials.length === 0 && job.equipment.length === 0 ? <p className="type-meta">No materials on this job.</p> : null}
        <Ledger
          columns={["Item", "Assumed", "Used", "Status", "Returned", "Credit", "Cost"]}
          rows={materials.map((b) => ({
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
              rows={job.equipment.map((e) => ({ id: e.id, cells: [e.name || "Equipment", e.model, e.serial, e.eta, e.status] }))}
            />
          </div>
        ) : null}
      </FileBlock>

      <FileBlock title="QC" hint={qcDone ? "Checks are done." : `${job.checks.filter((c) => c.on).length} of ${job.checks.length} checks done.`}>
        <FactGrid>
          <Fact label="On site" value={onSite} />
          <Fact label="Window" value={start ? `${clock(start)}–${finish ? clock(finish) : ""}` : ""} />
        </FactGrid>
        <ul className="mt-5 divide-y divide-line">
          {job.checks.map((c) => (
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
            <Ledger columns={["Punch", "Status", "Owner"]} rows={job.punch.map((p) => ({ id: p.id, cells: [p.item, p.status, p.owner] }))} />
          </div>
        ) : null}
      </FileBlock>

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
          {job.holds.flatMap((h) => [
            <Fact key={`${h.kind}-note`} label={h.kind} value={h.note} wide />,
            <Fact key={`${h.kind}-when`} label={`${h.kind} since`} value={h.at} />,
          ])}
        </FactGrid>
        {job.scope.some((s) => s.surveyFacts && Object.keys(s.surveyFacts).length) ? (
          <div className="mt-5">
            <Ledger
              columns={["Scope", "Fact", "Value"]}
              rows={job.scope.flatMap((s) => Object.entries(s.surveyFacts ?? {}).map(([k, v]) => ({ id: `${s.id}-${k}`, cells: [s.label, k, v] })))}
            />
          </div>
        ) : null}
        {job.scope.some((s) => s.surveyRooms?.length) ? (
          <div className="mt-5">
            <Ledger
              columns={["Room", "Scope", "Area", "Registers"]}
              rows={job.scope.flatMap((s) => (s.surveyRooms ?? []).map((r) => ({ id: r.id, cells: [r.name, s.label, r.area, r.registers] })))}
            />
          </div>
        ) : null}
      </FileBlock>

      <FileBlock title="Paperwork">
        {customerInvoices.length === 0 && job.workOrders.length === 0 && job.pos.length === 0 && job.changeOrders.length === 0 ? (
          <p className="type-meta">No paperwork yet.</p>
        ) : null}
        <Ledger
          columns={["Invoice", "Amount", "Status", "Paid"]}
          rows={customerInvoices.map((inv) => ({ id: inv.id, cells: [`${inv.kind} invoice`, money(inv.amount), inv.status, inv.paid ? money(inv.paid) : ""] }))}
        />
        {job.workOrders.length ? (
          <div className="mt-6">
            <Ledger
              columns={["Work order", "Day", "Crew", "Status", "Acknowledged", "Signed"]}
              rows={job.workOrders.map((w) => ({ id: w.id, cells: ["Work order", shortDay(w.day) || "No day", w.crew, w.status, w.ackedAt, w.signedAt] }))}
            />
          </div>
        ) : null}
        {job.pos.length ? (
          <div className="mt-6">
            <Ledger columns={["Vendor", "What", "Status"]} rows={job.pos.map((po) => ({ id: po.id, cells: [po.vendor, po.what, po.status] }))} />
          </div>
        ) : null}
        {job.changeOrders.length ? (
          <div className="mt-6">
            <Ledger columns={["Change", "Amount", "Status"]} rows={job.changeOrders.map((c) => ({ id: c.id, cells: [c.why, money(c.amount), c.status] }))} />
          </div>
        ) : null}
        <p className="type-meta mt-5">{job.packet.sentAt ? `Closing packet sent ${job.packet.sentAt}` : "Closing packet not sent"}</p>
        <ul className="mt-2 divide-y divide-line">
          {job.packet.parts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 py-2.5">
              <span className="type-body">{p.label}</span>
              <span className={p.on ? "type-value text-up" : "type-meta"}>{p.on ? "In" : "Out"}</span>
            </li>
          ))}
        </ul>
      </FileBlock>
    </div>
  );
}

function CheckList({
  title,
  signedAt,
  signedBy,
  relation,
  signature,
  photos,
  items,
}: {
  title: string;
  signedAt: string;
  signedBy: string;
  relation?: string;
  signature?: string;
  photos?: { id: string; name: string; url: string; kind: string }[];
  items: { id: string; label: string; on: boolean; callout?: string }[];
}) {
  return (
    <div className="rounded-md bg-page px-4 py-4">
      <p className="type-group">{title}</p>
      <Bits items={[{ label: "Signed", value: signedAt || "Not signed" }, { label: "By", value: signedBy || "—" }, ...(relation ? [{ label: "Relation", value: relation }] : [])]} />
      {signature ? <img src={signature} alt="Signature" className="mt-3 h-16 rounded-md border border-line bg-white" /> : null}
      {photos?.length ? (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <li key={photo.id}>
              {photo.kind === "photo" ? <img src={photo.url} alt={photo.name} className="h-16 w-full rounded-md border border-line object-cover" /> : <p className="type-meta">{photo.name}</p>}
            </li>
          ))}
        </ul>
      ) : null}
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.id}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="type-body">{i.label}</span>
              <span className={i.on ? "type-value text-up" : "type-meta"}>{i.on ? "Done" : "Open"}</span>
            </div>
            {i.callout ? <p className="type-meta mt-0.5">{i.callout}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
