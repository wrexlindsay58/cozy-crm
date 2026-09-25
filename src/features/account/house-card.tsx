import { assessmentForLead } from "@/features/assessment/store";
import { PacketList } from "@/features/assessment/packets";
import { PropertyCard } from "@/features/assessment/property";
import { Bits, Fact, FactGrid, FileBlock } from "@/features/record-shell/file-sheet";
import type { Lead } from "@/lib/crm-data";
import type { JobFile } from "@/features/job/types";

export function HouseCard({ lead, jobs }: { lead?: Lead; jobs: JobFile[] }) {
  const assess = lead ? assessmentForLead(lead.id) : undefined;
  const gear = jobs.flatMap((j) => j.equipment.map((e) => ({ ...e, product: j.window.split("·")[0]?.trim() || "Job" })));
  const units = jobs.flatMap((j) =>
    j.scope.flatMap((s) => s.bom.filter((b) => b.track === "unit").map((b) => ({ id: `${j.jobId}-${b.id}`, name: b.name, when: j.window.split("·")[0]?.trim() || "Job" }))),
  );
  return (
    <div className="space-y-2">
      {assess ? (
        <>
          <PropertyCard file={assess} readOnly />
          <PacketList file={assess} readOnly />
        </>
      ) : (
        <FileBlock title="House" hint="No assessment on this file. These are the facts from the lead and the jobs.">
          <FactGrid>
            <Fact label="Year" value={lead?.yearBuilt} />
            <Fact label="Size" value={lead?.sqft} />
            <Fact label="Stories" value={lead?.stories} />
            <Fact label="HOA" value={lead?.hoa} />
            <Fact label="Utility" value={lead?.utility} />
            <Fact label="Access" value={lead?.access || jobs.find((j) => j.access)?.access} wide />
          </FactGrid>
        </FileBlock>
      )}
      <FileBlock title="Equipment" hint="Units left on the house after the install.">
        {gear.length === 0 && units.length === 0 ? <p className="text-sm text-muted">No equipment logged yet.</p> : null}
        <ul className="space-y-3">
          {gear.map((e) => (
            <li key={e.id}>
              <p className="type-value">{e.name || "Unit"}</p>
              <Bits items={[{ label: "Job", value: e.product }, { label: "Model", value: e.model }, { label: "Serial", value: e.serial }]} />
            </li>
          ))}
          {units.map((u) => (
            <li key={u.id}>
              <p className="type-value">{u.name}</p>
              <Bits items={[{ label: "Job", value: u.when }]} />
            </li>
          ))}
        </ul>
      </FileBlock>
    </div>
  );
}
