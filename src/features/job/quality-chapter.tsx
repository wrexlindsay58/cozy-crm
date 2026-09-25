import { Check } from "lucide-react";
import { addScopeMedia, patchQcCheck, patchQcFact, patchQcResult, patchTest, setQcCorrected, type JobFile } from "./store";
import { catFromTag, type ScopeLine } from "./types";
import { profileById } from "./profiles";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { FillField, FillRow, FILL_IN } from "./fill-row";
import { MediaStrip } from "./media-strip";
import { BookWidget } from "@/features/lead/book-widget";

const QC: Record<string, { title: string; fields: { key: string; label: string }[]; checks: string[] }> = {
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

function catOf(line: ScopeLine) {
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

function QcToggle({ job, id }: { job: JobFile; id: string }) {
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

function QcMark({ job, id }: { job: JobFile; id: string }) {
  const on = job.testOut.results?.[id];
  const fix = job.testOut.fixes?.[id];
  const who = job.testOut.by?.[id];
  if (!on) return <span className="text-[11px] font-semibold text-muted">Open</span>;
  if (on === "fail" && fix?.correctedByQc) return <span className="text-[11px] font-bold tracking-wide text-navy uppercase">Fail · fixed{who ? ` · ${who}` : ""}</span>;
  return <span className={cn("text-[11px] font-bold tracking-wide uppercase", on === "pass" ? "text-up" : "text-alert")}>{on === "pass" ? "Pass" : "Fail"}{who ? ` · ${who}` : ""}</span>;
}

function QcFollowUp({ job, id }: { job: JobFile; id: string }) {
  const on = job.testOut.results?.[id];
  const fix = job.testOut.fixes?.[id];
  if (on !== "fail") return null;
  if (fix?.correctedByQc) {
    return <p className="mt-3 text-[12px] text-muted">Failed. Corrected on site by QC. The fail stays on the record. Ticket closed.</p>;
  }
  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3">
      <p className="text-[12px] font-semibold text-alert">Failed. Ticket opened{fix?.ticketId ? ` · ${fix.ticketId}` : ""}. Book the fix. This fail stays on the record.</p>
      {job.leadId ? <BookWidget leadId={job.leadId} defaultCloser={job.pm} defaultKind="Go-back" /> : <p className="text-[12px] text-muted">The go-back is on the book. It needs a day.</p>}
    </div>
  );
}

function QcCard({ job, line }: { job: JobFile; line: ScopeLine }) {
  const pack = QC[catOf(line)];
  if (!pack) return null;
  const facts = job.testOut.facts ?? {};
  const checks = job.testOut.checks ?? {};
  const result = job.testOut.results?.[line.id];
  return (
    <JobCard kicker="Quality" title={`${pack.title} · ${line.label}`} aside={<QcMark job={job} id={line.id} />} actions={<QcToggle job={job} id={line.id} />} done={result === "pass" || (result === "fail" && Boolean(job.testOut.fixes?.[line.id]?.correctedByQc))}>
      <FillRow min="7rem">
        {pack.fields.map((f) => (
          <FillField key={f.key} label={f.label}>
            <input value={facts[`${line.id}:${f.key}`] ?? ""} onChange={(e) => patchQcFact(job.jobId, `${line.id}:${f.key}`, e.target.value)} className={FILL_IN} />
          </FillField>
        ))}
      </FillRow>
      <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {pack.checks.map((c) => {
          const key = `${line.id}:${c}`;
          return (
            <li key={c}>
              <button type="button" onClick={() => patchQcCheck(job.jobId, key, !checks[key])} className="flex h-10 w-full items-center gap-2 text-left text-sm">
                <span className={cn("grid size-5 place-items-center rounded-sm border", checks[key] ? "border-navy bg-navy text-card" : "border-line")}>{checks[key] ? <Check className="size-3.5" strokeWidth={2.5} /> : null}</span>
                {c}
              </button>
            </li>
          );
        })}
      </ul>
      <MediaStrip
        files={line.media}
        onAdd={(f, meta) => addScopeMedia(job.jobId, line.id, f, catFromTag(meta.tag), { caption: meta.caption, purpose: meta.tag, name: meta.name })}
        label="QC photos and video"
      />
      <QcFollowUp job={job} id={line.id} />
    </JobCard>
  );
}
