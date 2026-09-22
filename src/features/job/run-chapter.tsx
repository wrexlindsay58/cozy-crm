import { useState } from "react";
import { addCostHit, addPunch, addScopeMedia, addTimePunch, handsOnJob, patchPunchClock, patchQcCheck, patchQcFact, patchQcResult, patchTest, removeCostHit, setEquip, setQcCorrected, togglePunch, type JobFile } from "./store";
import { FIELD_EXTRAS, catFromTag, punchHours, type FieldExtra } from "./types";
import { money } from "@/lib/crm-data";
import { Trash2 } from "lucide-react";
import { crewOf } from "@/features/staff/store";
import { profileById } from "./profiles";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { FillField, FillRow, FILL_IN } from "./fill-row";
import { MediaStrip } from "./media-strip";
import { BookWidget } from "@/features/lead/book-widget";
import type { ScopeLine } from "./types";

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

export function RunChapter({ job }: { job: JobFile }) {
  const est = job.scope.reduce((s, r) => s + r.estHours, 0);
  const actual = job.punches.reduce((s, p) => s + punchHours(p).total, 0);
  const hands = handsOnJob(job);
  const [who, setWho] = useState(hands[0] || job.crew);
  const [item, setItem] = useState("");
  const products = job.scope.filter((s) => s.kind === "product");
  const needsSerial = products.some((s) => profileById(s.categoryId)?.needsSerial);
  const envelope = products.some((s) => {
    const id = profileById(s.categoryId)?.id ?? s.categoryId;
    return id === "attic" || id === "air-seal";
  });
  const ducts = products.some((s) => (profileById(s.categoryId)?.id ?? s.categoryId) === "ducts");

  return (
    <div className="space-y-3">
      <JobCard kicker="Time" title="Time clocks" done={job.punches.length > 0} aside={`Est ${est}h · actual ${actual.toFixed(1)}h`}>
        <ul className="space-y-3">
          {job.punches.map((p) => {
            const h = punchHours(p);
            return (
              <li key={p.id}>
                <p className="text-sm font-semibold">
                  {p.who} · {p.day}
                  <span className="ml-2 text-[12px] font-normal text-muted">{h.total ? `${h.site.toFixed(1)}h site · ${h.travel.toFixed(1)}h travel` : "Open"}</span>
                </p>
                <div className="mt-2">
                  <FillRow min="7rem">
                    {(
                      [
                        ["leftYard", "Yard"],
                        ["onSite", "On site"],
                        ["complete", "Done"],
                        ["back", "Back"],
                      ] as const
                    ).map(([k, lab]) => (
                      <FillField key={k} label={lab}>
                        <input type="time" value={p[k]} onChange={(e) => patchPunchClock(job.jobId, p.id, { [k]: e.target.value })} className={FILL_IN} />
                      </FillField>
                    ))}
                  </FillRow>
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTimePunch(job.jobId, who, "Today");
          }}
        >
          <select value={who} onChange={(e) => setWho(e.target.value)} className={cn(FILL_IN, "flex-1")}>
            {hands.length ? (
              Object.entries(
                hands.reduce<Record<string, string[]>>((acc, name) => {
                  const crew = crewOf(name) || "Crew";
                  acc[crew] = [...(acc[crew] ?? []), name];
                  return acc;
                }, {}),
              ).map(([crew, names]) => (
                <optgroup key={crew} label={crew}>
                  {names.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </optgroup>
              ))
            ) : (
              <option value="">Assign a crew first</option>
            )}
          </select>
          <button type="submit" disabled={!who} className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
            Clock
          </button>
        </form>
      </JobCard>

      {needsSerial ? (
        <JobCard kicker="Equipment" title="Serials">
          <ul className="space-y-2">
            {job.equipment.map((e) => (
              <li key={e.id}>
                <FillRow>
                  <FillField label="Unit">
                    <p className="flex h-10 items-center text-sm font-semibold normal-case tracking-normal">{e.name}</p>
                  </FillField>
                  <FillField label="Serial">
                    <input value={e.serial} onChange={(ev) => setEquip(job.jobId, e.id, { serial: ev.target.value })} className={FILL_IN} />
                  </FillField>
                  <FillField label="AHRI">
                    <input value={e.ahri} onChange={(ev) => setEquip(job.jobId, e.id, { ahri: ev.target.value })} className={FILL_IN} />
                  </FillField>
                </FillRow>
              </li>
            ))}
          </ul>
        </JobCard>
      ) : null}

      {envelope ? (
        <JobCard kicker="QC" title="Blower door" aside={<QcMark job={job} id="blower" />} actions={<QcToggle job={job} id="blower" />}>
          <FillRow>
            <FillField label="Before (CFM50)">
              <input value={job.testOut.blowerBefore} onChange={(e) => patchTest(job.jobId, { blowerBefore: e.target.value })} className={FILL_IN} />
            </FillField>
            <FillField label="After (CFM50)">
              <input value={job.testOut.blowerAfter} onChange={(e) => patchTest(job.jobId, { blowerAfter: e.target.value })} className={FILL_IN} />
            </FillField>
          </FillRow>
          {products.find((s) => (profileById(s.categoryId)?.id ?? s.categoryId) === "attic") ? (
            <MediaStrip
              files={products.find((s) => (profileById(s.categoryId)?.id ?? s.categoryId) === "attic")!.media.filter((m) => m.cat === "After" || m.purpose === "After")}
              onAdd={(f, meta) =>
                addScopeMedia(job.jobId, products.find((s) => (profileById(s.categoryId)?.id ?? s.categoryId) === "attic")!.id, f, catFromTag(meta.tag), {
                  caption: meta.caption,
                  purpose: meta.tag,
                  name: meta.name,
                })
              }
              label="Blower door photos"
            />
          ) : null}
          <QcFollowUp job={job} id="blower" />
        </JobCard>
      ) : null}

      {ducts ? (
        <JobCard kicker="QC" title="Duct tester" aside={<QcMark job={job} id="duct" />} actions={<QcToggle job={job} id="duct" />}>
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

      {products.map((s) => (
        <QcCard key={s.id} job={job} line={s} />
      ))}

      <JobCard kicker="Punch" title="Open items" done={job.punch.length > 0 && job.punch.every((p) => p.status === "Done")}>
        <ul>
          {job.punch.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => togglePunch(job.jobId, p.id)} className={cn("flex w-full items-center justify-between py-2 text-left text-sm", p.status === "Done" && "text-muted line-through")}>
                {p.item}
                <span className="text-[11px] font-bold uppercase">{p.status}</span>
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addPunch(job.jobId, item);
            setItem("");
          }}
        >
          <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="What’s left" className={cn(FILL_IN, "flex-1")} />
          <button type="submit" className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold">
            Add
          </button>
        </form>
      </JobCard>

      <FieldExtras job={job} />
    </div>
  );
}

function FieldExtras({ job }: { job: JobFile }) {
  const rows = (job.costHits ?? []).filter((h) => h.kind === "field");
  const [reason, setReason] = useState<FieldExtra>(FIELD_EXTRAS[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  return (
    <JobCard kicker="Field extras" title="Does not hit closer commission">
      <p className="text-[12px] text-muted">Step-throughs, material runs, install issues, extra on site, wrong equipment. Sales is not punished for these.</p>
      {rows.length ? (
        <ul className="mt-3 divide-y divide-line">
          {rows.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span>
                {h.reason}
                {h.note ? ` · ${h.note}` : ""}
                <span className="ml-2 text-[11px] text-muted">{h.at}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-semibold tabular-nums">{money(h.amount)}</span>
                <button type="button" aria-label="Remove" className="grid size-8 place-items-center rounded-md text-muted hover:text-alert" onClick={() => removeCostHit(job.jobId, h.id)}>
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,1.2fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          addCostHit(job.jobId, "field", reason, Number(amount) || 0, note);
          setAmount("");
          setNote("");
        }}
      >
        <select value={reason} onChange={(e) => setReason(e.target.value as FieldExtra)} className={FILL_IN}>
          {FIELD_EXTRAS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="$" className={FILL_IN} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className={FILL_IN} />
        <button type="submit" className="h-10 rounded-md bg-navy px-3 text-[12px] font-semibold text-card">
          Add
        </button>
      </form>
    </JobCard>
  );
}

function QcToggle({ job, id }: { job: JobFile; id: string }) {
  const on = job.testOut.results?.[id];
  const fix = job.testOut.fixes?.[id];
  return (
    <span className="flex flex-wrap justify-end gap-1">
      <button type="button" onClick={() => patchQcResult(job.jobId, id, "pass")} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", on === "pass" ? "bg-up text-card" : "border border-line")}>
        Pass
      </button>
      <button type="button" onClick={() => patchQcResult(job.jobId, id, "fail")} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", on === "fail" ? "bg-alert text-card" : "border border-line")}>
        Fail
      </button>
      {on === "fail" ? (
        <button
          type="button"
          onClick={() => setQcCorrected(job.jobId, id, !fix?.correctedByQc)}
          className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", fix?.correctedByQc ? "bg-navy text-card" : "border border-line")}
        >
          Corrected by QC
        </button>
      ) : null}
    </span>
  );
}
function QcMark({ job, id }: { job: JobFile; id: string }) {
  const on = job.testOut.results?.[id];
  const fix = job.testOut.fixes?.[id];
  if (!on) return <span className="text-[11px] font-semibold text-muted">Open</span>;
  if (on === "fail" && fix?.correctedByQc) return <span className="text-[11px] font-bold tracking-wide text-navy uppercase">Fail · QC fixed</span>;
  return <span className={cn("text-[11px] font-bold tracking-wide uppercase", on === "pass" ? "text-up" : "text-alert")}>{on === "pass" ? "Pass" : "Fail"}</span>;
}

function QcFollowUp({ job, id }: { job: JobFile; id: string }) {
  const on = job.testOut.results?.[id];
  const fix = job.testOut.fixes?.[id];
  if (on !== "fail") return null;
  if (fix?.correctedByQc) {
    return <p className="mt-3 text-[12px] text-muted">Failed and corrected on site by QC. Ticket closed. No go-back on the book.</p>;
  }
  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3">
      <p className="text-[12px] font-semibold text-alert">Failed. Ticket opened{fix?.ticketId ? ` · ${fix.ticketId}` : ""}. Book the fix.</p>
      {job.leadId ? <BookWidget leadId={job.leadId} defaultCloser={job.pm} defaultKind="Go-back" /> : <p className="text-[12px] text-muted">Go-back is on Crew schedule. Needs a day.</p>}
    </div>
  );
}

function QcCard({ job, line }: { job: JobFile; line: ScopeLine }) {
  const id = profileById(line.categoryId)?.id ?? line.categoryId;
  const pack = QC[id];
  if (!pack) return null;
  const facts = job.testOut.facts ?? {};
  const checks = job.testOut.checks ?? {};
  const result = job.testOut.results?.[line.id];
  return (
    <JobCard kicker="QC" title={`${pack.title} · ${line.label}`} aside={<QcMark job={job} id={line.id} />} actions={<QcToggle job={job} id={line.id} />} done={result === "pass"}>
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
              <button type="button" onClick={() => patchQcCheck(job.jobId, key, !checks[key])} className="flex h-9 w-full items-center gap-2 text-left text-sm">
                <span className={cn("grid size-5 place-items-center rounded-sm border", checks[key] ? "border-navy bg-navy text-card" : "border-line")}>{checks[key] ? "✓" : ""}</span>
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
