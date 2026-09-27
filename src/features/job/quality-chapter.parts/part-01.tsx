import { patchQcResult, patchTest, setQcCorrected, type JobFile } from "../store";
import type { ScopeLine } from "../types";
import { profileById } from "../profiles";
import { cn } from "@/lib/cn";
import { JobCard } from "../job-card";
import { FillField, FillRow, FILL_IN } from "../fill-row";
import { BookWidget } from "@/features/lead/book-widget";
import { QcCard } from "./part-02";

export const QC: Record<string, { title: string; fields: { key: string; label: string }[]; checks: string[] }> = {
  attic: {
    title: "Attic QC",
    fields: [
      { key: "depth", label: "Depth (in)" },
      { key: "rValue", label: "R-value" },
      { key: "baffles", label: "Baffle count" },
    ],
    checks: ["Baffles in", "Hatch dam", "IC cans covered", "Platform built", "Bath fans ducted", "Can lights sealed"],
  },
  hvac: {
    title: "HVAC commissioning",
    fields: [
      { key: "staticSupply", label: "Supply static" },
      { key: "staticReturn", label: "Return static" },
      { key: "deltaT", label: "Delta T" },
      { key: "superheat", label: "Superheat" },
      { key: "subcool", label: "Subcool" },
      { key: "amps", label: "Amp draw" },
      { key: "suction", label: "Suction PSI" },
      { key: "head", label: "Head PSI" },
    ],
    checks: ["Pad level", "Disconnect on", "Lineset insulated", "Condensate trapped", "Tstat programmed", "Filter in", "Breaker labeled"],
  },
  ducts: {
    title: "Duct QC",
    fields: [
      { key: "pressurePan", label: "Pressure pan" },
      { key: "supplyCount", label: "Supplies" },
      { key: "returnCount", label: "Returns" },
      { key: "regTemp", label: "Register temp" },
    ],
    checks: ["Boots sealed", "Returns sealed", "Trunk supported", "Registers open", "Filter rack tight"],
  },
  windows: {
    title: "Window QC",
    fields: [
      { key: "uFactor", label: "U-factor" },
      { key: "shgc", label: "SHGC" },
      { key: "count", label: "Units set" },
    ],
    checks: ["Sticker on", "Operates", "Weeps clear", "Trim sealed"],
  },
};

export function catOf(line: ScopeLine) {
  return profileById(line.categoryId)?.id ?? line.categoryId;
}

export function QualityChapter({ job }: { job: JobFile }) {
  const products = job.scope.filter((s) => s.kind === "product");
  const envelope = products.some((s) => catOf(s) === "attic" || catOf(s) === "air-seal");
  const ducts = products.some((s) => catOf(s) === "ducts");
  const cards = products.filter((s) => QC[catOf(s)]);
  if (!envelope && !ducts && !cards.length) {
    return <JobCard kicker="Quality" title="Nothing on this job needs a test" />;
  }
  return (
    <div className="space-y-2">
      {envelope ? (
        <JobCard kicker="Quality" title="Blower door" aside={<QcMark job={job} id="blower" />} actions={<QcToggle job={job} id="blower" />}>
          <FillRow>
            <FillField label="Before (CFM50)">
              <input value={job.testOut.blowerBefore} onChange={(e) => patchTest(job.jobId, { blowerBefore: e.target.value })} className={FILL_IN} />
            </FillField>
            <FillField label="After (CFM50)">
              <input value={job.testOut.blowerAfter} onChange={(e) => patchTest(job.jobId, { blowerAfter: e.target.value })} className={FILL_IN} />
            </FillField>
          </FillRow>
          <QcFollowUp job={job} id="blower" />
        </JobCard>
      ) : null}
      {ducts ? (
        <JobCard kicker="Quality" title="Duct tester" aside={<QcMark job={job} id="duct" />} actions={<QcToggle job={job} id="duct" />}>
          <FillRow>
            <FillField label="Before (CFM25)">
              <input value={job.testOut.ductBefore} onChange={(e) => patchTest(job.jobId, { ductBefore: e.target.value })} className={FILL_IN} />
            </FillField>
            <FillField label="After (CFM25)">
              <input value={job.testOut.ductAfter} onChange={(e) => patchTest(job.jobId, { ductAfter: e.target.value })} className={FILL_IN} />
            </FillField>
          </FillRow>
          <QcFollowUp job={job} id="duct" />
        </JobCard>
      ) : null}
      {cards.map((line) => (
        <QcCard key={line.id} job={job} line={line} />
      ))}
    </div>
  );
}

export function QcToggle({ job, id }: { job: JobFile; id: string }) {
  const on = job.testOut.results?.[id];
  const fix = job.testOut.fixes?.[id];
  const failed = on === "fail";
  return (
    <span className="flex flex-wrap justify-end gap-1">
      <button type="button" disabled={failed} onClick={() => patchQcResult(job.jobId, id, "pass")} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold disabled:opacity-40", on === "pass" ? "bg-up text-card" : "border border-line")}>
        Pass
      </button>
      <button type="button" disabled={failed} onClick={() => patchQcResult(job.jobId, id, "fail")} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold disabled:opacity-40", failed ? "bg-alert text-card" : "border border-line")}>
        Fail
      </button>
      {failed ? (
        <button type="button" onClick={() => setQcCorrected(job.jobId, id, !fix?.correctedByQc)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", fix?.correctedByQc ? "bg-navy text-card" : "border border-line")}>
          Corrected by QC
        </button>
      ) : null}
    </span>
  );
}

export function QcMark({ job, id }: { job: JobFile; id: string }) {
  const on = job.testOut.results?.[id];
  const fix = job.testOut.fixes?.[id];
  const who = job.testOut.by?.[id];
  if (!on) return <span className="text-[11px] font-semibold text-muted">Open</span>;
  if (on === "fail" && fix?.correctedByQc) return <span className="text-[11px] font-bold tracking-wide text-navy uppercase">Fail · fixed{who ? ` · ${who}` : ""}</span>;
  return <span className={cn("text-[11px] font-bold tracking-wide uppercase", on === "pass" ? "text-up" : "text-alert")}>{on === "pass" ? "Pass" : "Fail"}{who ? ` · ${who}` : ""}</span>;
}

export function QcFollowUp({ job, id }: { job: JobFile; id: string }) {
  const on = job.testOut.results?.[id];
  const fix = job.testOut.fixes?.[id];
  if (on !== "fail") return null;
  if (fix?.correctedByQc) {
    return <p className="mt-3 text-[12px] text-muted">Failed. Corrected on site by QC. The fail stays on the record. Ticket closed.</p>;
  }
  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3">
      <p className="text-[12px] font-semibold text-alert">Failed. Ticket opened{fix?.ticketId ? ` · ${fix.ticketId}` : ""}. Book the fix. This fail stays on the record.</p>
      {job.leadId ? <BookWidget leadId={job.leadId} defaultCloser={job.pm} defaultKind="Go-back" pipeline="Job" /> : <p className="text-[12px] text-muted">The go-back is on the book. It needs a day.</p>}
    </div>
  );
}
