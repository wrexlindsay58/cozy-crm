import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addBom, addJobSurvey, addScopeMedia, addSurveyMedia, addSurveyRoom, attachPlanFile, orderBom, patchBom, patchJobSurvey, patchPermit, patchSurveyFact, patchSurveyRoom, removeJobSurvey, setSurveyDone, skipSurvey, togglePre, type JobFile } from "./store";
import { CheckSign } from "./check-sign";
import { profileById, useProdProfiles } from "./profiles";
import { money } from "@/lib/crm-data";
import type { Lead } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { FillField, FillRow, FILL_IN, SEC_HEAD } from "./fill-row";
import { MediaStrip } from "./media-strip";
import { bomAssumed, bomOrderedCost, catFromTag, leftoverQty, type BomLine, type JobSurvey, type ScopeLine, type SurveyKind } from "./types";
import { BookWidget } from "@/features/lead/book-widget";

const HVAC_FIELDS = [
  { key: "size", label: "Size", options: ["2 ton", "2.5 ton", "3 ton", "3.5 ton", "4 ton", "5 ton"] },
  { key: "type", label: "Type", options: ["Split", "Package", "Heat pump", "Gas furnace"] },
  { key: "placement", label: "Placement", options: [] },
  { key: "clearance", label: "Clearance", options: [] },
];
const KINDS: { id: SurveyKind; label: string }[] = [
  { id: "hvac", label: "HVAC" },
  { id: "ducts", label: "Ducts" },
  { id: "attic", label: "Attic" },
  { id: "windows", label: "Windows" },
  { id: "other", label: "Other" },
];

export function ReadyChapter({ job }: { job: JobFile }) {
  const lines = job.scope.filter((s) => s.kind === "product" || s.kind === "adder");
  return (
    <div className="space-y-3">
      <JobCard kicker="Ready" title="Pre-install" done={Boolean(job.preCheck.signedAt)} aside={job.preCheck.signedAt ? `Signed ${job.preCheck.signedBy}` : "Open"}>
        <ul>
          {job.preCheck.items.map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => togglePre(job.jobId, i.id)} className="flex h-10 w-full items-center gap-2 text-left text-sm">
                <span className={cn("grid size-5 place-items-center rounded-sm border", i.on ? "border-navy bg-navy text-card" : "border-line")}>{i.on ? "✓" : ""}</span>
                {i.label}
              </button>
            </li>
          ))}
        </ul>
        <CheckSign job={job} kind="pre" />
        {lines[0] ? (
          <MediaStrip
            files={lines[0].media.filter((m) => m.cat === "Before" || m.purpose === "Pre-install")}
            onAdd={(f, meta) => addScopeMedia(job.jobId, lines[0].id, f, catFromTag(meta.tag), { caption: meta.caption, purpose: meta.tag, name: meta.name })}
            label="Pre-install photos"
          />
        ) : null}
      </JobCard>

      {lines.map((s) => (
        <MaterialsCard key={s.id} job={job} line={s} />
      ))}
    </div>
  );
}

export function SurveyChapter({ job, lead }: { job: JobFile; lead?: Lead }) {
  useProdProfiles();
  const products = job.scope.filter((s) => s.kind === "product" || s.kind === "adder");
  const fromSold = products.filter((s) => s.surveyOn || profileById(s.categoryId)?.needsSurvey);
  const extras = job.surveys ?? [];
  return (
    <div className="space-y-3">
      {lead ? <BookWidget leadId={lead.id} defaultCloser={job.pm} defaultKind="Site survey" /> : null}
      <div className="flex items-center justify-end">
        <button type="button" aria-label="Add survey" className="grid size-8 place-items-center rounded-md bg-navy text-card hover:opacity-90" onClick={() => addJobSurvey(job.jobId)}>
          <Plus className="size-4" />
        </button>
      </div>

      {fromSold.map((s) => (
        <SurveyCard
          key={s.id}
          job={job}
          id={s.id}
          label={s.label}
          kind={(profileById(s.categoryId)?.id as SurveyKind) || kindOf(s.categoryId)}
          done={Boolean(s.surveyDone || s.surveySkip)}
          skip={s.surveySkip}
          facts={s.surveyFacts ?? {}}
          rooms={s.surveyRooms ?? []}
          media={s.media}
          plan={Boolean(profileById(s.categoryId)?.needsPlan)}
          planFile={s.plan?.file?.name ?? s.media.find((m) => m.cat === "Design")?.name}
        />
      ))}
      {extras.map((s) => (
        <SurveyCard
          key={s.id}
          job={job}
          id={s.id}
          label={s.label}
          kind={s.kind}
          done={Boolean(s.surveyDone)}
          facts={s.surveyFacts ?? {}}
          rooms={s.surveyRooms ?? []}
          media={s.media}
          extra
        />
      ))}
    </div>
  );
}

function kindOf(id: string): SurveyKind {
  if (id === "hvac" || id === "ducts" || id === "attic" || id === "windows") return id;
  return "other";
}

function SurveyCard({
  job,
  id,
  label,
  kind,
  done,
  skip,
  facts,
  rooms,
  media,
  plan,
  planFile,
  extra,
}: {
  job: JobFile;
  id: string;
  label: string;
  kind: SurveyKind;
  done: boolean;
  skip?: string;
  facts: Record<string, string>;
  rooms: JobSurvey["surveyRooms"];
  media: JobSurvey["media"];
  plan?: boolean;
  planFile?: string;
  extra?: boolean;
}) {
  const [why, setWhy] = useState("");
  const [skipOpen, setSkipOpen] = useState(false);
  const hvac = kind === "hvac";
  const ducts = kind === "ducts";
  return (
    <JobCard
      kicker="Site survey"
      title={skip ? `${label} · Skipped` : label}
      done={done}
      actions={
        <div className="flex items-center gap-2">
          {extra ? (
            <select
              value={kind}
              aria-label="Survey type"
              onChange={(e) => {
                const next = e.target.value as SurveyKind;
                const nextLabel = KINDS.find((k) => k.id === next)?.label ?? "Site survey";
                patchJobSurvey(job.jobId, id, { kind: next, label: nextLabel });
              }}
              className="h-8 rounded-md border border-line px-2 text-[12px] font-semibold"
            >
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          ) : null}
          {!skip ? (
            <button type="button" onClick={() => setSurveyDone(job.jobId, id, !done)} className={cn("h-8 rounded-md px-3 text-[12px] font-semibold", done ? "bg-navy text-card" : "border border-line")}>
              {done ? "Done" : "Mark done"}
            </button>
          ) : null}
          {extra ? (
            <button type="button" aria-label="Delete survey" className="grid size-8 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeJobSurvey(job.jobId, id)}>
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      }
    >
      {skip ? <p className="mb-3 text-sm text-muted">Skipped · {skip}</p> : null}
      {hvac ? (
        <FillRow>
          {HVAC_FIELDS.map((f) => (
            <FillField key={f.key} label={f.label}>
              {f.options.length ? (
                <select value={facts[f.key] ?? ""} onChange={(e) => patchSurveyFact(job.jobId, id, f.key, e.target.value)} className={FILL_IN}>
                  <option value="">Select</option>
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input value={facts[f.key] ?? ""} onChange={(e) => patchSurveyFact(job.jobId, id, f.key, e.target.value)} placeholder={f.key === "placement" ? "Pad, closet, attic" : "Sides and overhead"} className={FILL_IN} />
              )}
            </FillField>
          ))}
        </FillRow>
      ) : null}

      {ducts ? (
        <div>
          <p className={SEC_HEAD}>Rooms and registers</p>
          <ul className="mt-2 space-y-2">
            {(rooms ?? []).map((r) => (
              <li key={r.id}>
                <FillRow>
                  <FillField label="Room">
                    <input value={r.name} onChange={(e) => patchSurveyRoom(job.jobId, id, r.id, { name: e.target.value })} className={FILL_IN} />
                  </FillField>
                  <FillField label="Area (sqft)">
                    <input value={r.area} onChange={(e) => patchSurveyRoom(job.jobId, id, r.id, { area: e.target.value })} className={FILL_IN} />
                  </FillField>
                  <FillField label="Registers">
                    <input value={r.registers} onChange={(e) => patchSurveyRoom(job.jobId, id, r.id, { registers: e.target.value })} className={FILL_IN} />
                  </FillField>
                </FillRow>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => addSurveyRoom(job.jobId, id)} className="mt-2 inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-[12px] font-semibold">
            <Plus className="size-3.5" />
            Add room
          </button>
        </div>
      ) : null}

      {!hvac && !ducts ? (
        <FillField label="Notes">
          <input value={facts.notes ?? ""} onChange={(e) => patchSurveyFact(job.jobId, id, "notes", e.target.value)} className={FILL_IN} />
        </FillField>
      ) : null}

      <MediaStrip files={media} onAdd={(f, meta) => addSurveyMedia(job.jobId, id, f, { caption: meta.caption, purpose: meta.tag, name: meta.name, cat: catFromTag(meta.tag) })} label="Survey photos and video" />

      {plan ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className={SEC_HEAD}>Design file</p>
          <label className="mt-1.5 inline-flex h-8 cursor-pointer items-center rounded-md border border-line px-2 text-[12px] font-semibold">
            Upload
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) attachPlanFile(job.jobId, id, f);
                e.target.value = "";
              }}
            />
          </label>
          {planFile ? <p className="mt-1 truncate text-[12px] text-navy">{planFile}</p> : <p className="mt-1 text-[12px] text-muted">No file yet.</p>}
        </div>
      ) : null}

      {!extra && !skip ? (
        skipOpen ? (
          <form
            className="mt-3 flex min-w-0 flex-wrap items-end gap-2 border-t border-line pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              skipSurvey(job.jobId, id, why);
              setWhy("");
              setSkipOpen(false);
            }}
          >
            <FillField label="Why we're skipping" className="min-w-0 flex-1">
              <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Need a real reason" className={FILL_IN} />
            </FillField>
            <button type="submit" disabled={!why.trim()} className="h-10 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
              Skip survey
            </button>
          </form>
        ) : (
          <button type="button" className="mt-3 text-[12px] font-semibold text-muted hover:text-navy" onClick={() => setSkipOpen(true)}>
            Skip this survey
          </button>
        )
      ) : null}
    </JobCard>
  );
}

function MaterialsCard({ job, line }: { job: JobFile; line: ScopeLine }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [cost, setCost] = useState("");
  const [track, setTrack] = useState<"bulk" | "unit">("bulk");
  const p = profileById(line.categoryId);
  const needsPermit = p?.needsPermit ?? false;
  const ordered = line.bom.length > 0 && line.bom.every((b) => b.ordered);

  return (
    <JobCard
      kicker="Materials"
      title={line.label}
      done={ordered && line.bom.length > 0}
      actions={
        line.bom.length ? (
          <button type="button" className={cn("h-8 rounded-md px-3 text-[12px] font-semibold", ordered ? "border border-line text-muted" : "bg-navy text-card")} onClick={() => orderBom(job.jobId, line.id)}>
            {ordered ? "Ordered" : "Order"}
          </button>
        ) : null
      }
    >
      {needsPermit ? (
        <FillRow>
          <FillField label="Permit #">
            <input value={job.permit.number} onChange={(e) => patchPermit(job.jobId, { number: e.target.value })} className={FILL_IN} />
          </FillField>
          <FillField label="City">
            <input value={job.permit.city} onChange={(e) => patchPermit(job.jobId, { city: e.target.value })} className={FILL_IN} />
          </FillField>
          <FillField label="Inspection">
            <select value={job.permit.result} onChange={(e) => patchPermit(job.jobId, { result: e.target.value as typeof job.permit.result })} className={FILL_IN}>
              {["None", "Scheduled", "Pass", "Fail"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </FillField>
        </FillRow>
      ) : null}

      {line.bom.length ? (
        <ul className="divide-y divide-line">
          {line.bom.map((b) => (
            <BomRow key={b.id} job={job} line={line} bom={b} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No materials on this line yet.</p>
      )}

      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          addBom(job.jobId, line.id, name, Number(qty) || 0, Number(cost) || 0, p?.supplier ?? "", track);
          setName("");
          setQty("1");
          setCost("");
        }}
      >
        <FillRow min="6.5rem">
          <FillField label="Add material" className="sm:col-span-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Part" className={FILL_IN} />
          </FillField>
          <FillField label="Qty">
            <input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" className={FILL_IN} />
          </FillField>
          <FillField label="$/ea">
            <input value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" className={FILL_IN} />
          </FillField>
          <FillField label="Track">
            <select value={track} onChange={(e) => setTrack(e.target.value as "bulk" | "unit")} className={FILL_IN}>
              <option value="bulk">Bulk</option>
              <option value="unit">Unit</option>
            </select>
          </FillField>
          <div className="flex items-end">
            <button type="submit" aria-label="Add material" className="grid h-10 w-full place-items-center rounded-md bg-navy text-card">
              <Plus className="size-4" />
            </button>
          </div>
        </FillRow>
      </form>

      <MediaStrip files={line.media.filter((m) => m.cat !== "Design")} onAdd={(f, meta) => addScopeMedia(job.jobId, line.id, f, catFromTag(meta.tag), { caption: meta.caption, purpose: meta.tag, name: meta.name })} label="Delivery and material photos" />
    </JobCard>
  );
}

function BomRow({ job, line, bom }: { job: JobFile; line: ScopeLine; bom: BomLine }) {
  const assumed = bomAssumed(bom);
  const orderedCost = bomOrderedCost(bom);
  const ordered = bom.orderQty ?? bom.estQty;
  const used = bom.usedQty || 0;
  const left = leftoverQty(bom);
  const ret = bom.returnQty || 0;
  const warehoused = bom.warehouseQty || 0;
  const delta = bom.ordered ? orderedCost - assumed : 0;
  const variance = !bom.ordered ? null : delta > 0 ? "Over" : delta < 0 ? "Under" : "Match";
  const track = bom.track ?? (bom.unitCost >= 200 ? "unit" : "bulk");
  const bits = [
    track === "unit" ? "Unit" : "Bulk",
    bom.ordered ? "Ordered" : "Open",
    used ? `${left} left` : "",
    ret ? `${ret} return` : "",
    warehoused ? `${warehoused} warehouse` : "",
  ].filter(Boolean);

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold">
          {bom.name}
          <span className="ml-2 text-[11px] font-normal text-muted">{bits.join(" · ")}</span>
        </p>
        {variance ? (
          <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase", variance === "Over" ? "bg-alert-bg text-alert" : variance === "Under" ? "bg-up-bg text-up" : "bg-info-bg text-navy")}>
            {variance} {delta ? money(Math.abs(delta)) : ""}
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <FillRow min="6.5rem">
          <FillField label="Assumed qty">
            <input value={bom.estQty || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { estQty: Number(e.target.value) || 0 })} className={FILL_IN} />
          </FillField>
          <FillField label="Assumed $">
            <input value={bom.unitCost || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { unitCost: Number(e.target.value) || 0 })} className={FILL_IN} />
          </FillField>
          <FillField label="Paid $">
            <input value={(bom.actualUnitCost ?? (bom.ordered ? bom.unitCost : 0)) || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { actualUnitCost: Number(e.target.value) || 0 })} className={FILL_IN} />
          </FillField>
          <FillField label="Used">
            <input value={used || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, line.id, bom.id, { usedQty: Number(e.target.value) || 0 })} className={FILL_IN} />
          </FillField>
          <div className="flex items-end gap-3 pb-1">
            <Check label="In" on={Boolean(bom.received)} onClick={() => patchBom(job.jobId, line.id, bom.id, { received: !bom.received })} />
            <Check label="Ready" on={Boolean(bom.ready)} onClick={() => patchBom(job.jobId, line.id, bom.id, { ready: !bom.ready })} />
          </div>
        </FillRow>
      </div>
      {left > 0 && used > 0 ? (
        <div className="mt-2">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Left {left} · return or warehouse</p>
          <div className="mt-1">
            <FillRow min="6.5rem">
              <FillField label="Return qty">
                <input
                  value={ret || ""}
                  inputMode="decimal"
                  onChange={(e) => patchBom(job.jobId, line.id, bom.id, { returnQty: Number(e.target.value) || 0 })}
                  className={FILL_IN}
                />
              </FillField>
              <FillField label="$ back">
                <input
                  value={bom.returnCredit || ""}
                  inputMode="decimal"
                  onChange={(e) => patchBom(job.jobId, line.id, bom.id, { returnCredit: Number(e.target.value) || 0 })}
                  className={FILL_IN}
                />
              </FillField>
              <FillField label="Warehouse">
                <input
                  value={warehoused || ""}
                  inputMode="decimal"
                  onChange={(e) => patchBom(job.jobId, line.id, bom.id, { warehouseQty: Number(e.target.value) || 0 })}
                  className={FILL_IN}
                />
              </FillField>
            </FillRow>
          </div>
          {ret ? <p className="mt-1 text-[12px] font-semibold text-navy">{money(bom.returnCredit || 0)} back from {bom.supplier || "supplier"}.</p> : null}
          {warehoused ? <p className="mt-1 text-[12px] text-muted">{warehoused} stays in shop stock. Off this job.</p> : null}
          {ret + warehoused < left ? <p className="mt-1 text-[12px] text-alert">{left - ret - warehoused} left unassigned.</p> : null}
        </div>
      ) : null}
    </li>
  );
}

function Check({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-10 items-center gap-1.5 text-[12px] font-semibold">
      <span className={cn("grid size-5 place-items-center rounded-sm border", on ? "border-navy bg-navy text-card" : "border-line")}>{on ? "✓" : ""}</span>
      {label}
    </button>
  );
}
