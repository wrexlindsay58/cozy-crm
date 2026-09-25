import { useState } from "react";
import { addChangeOrder, addCostHit, addFieldIssue, addPunch, addScopeMedia, addTimePunch, crewsOnJob, patchBom, patchPunchClock, removeCostHit, setCheckCallout, setEquip, togglePost, togglePre, togglePunch, type JobFile } from "./store";
import { FIELD_EXTRAS, ISSUE_TYPES, catFromTag, isAccepted, punchHours, type FieldExtra, type FieldIssue } from "./types";
import { money } from "@/lib/crm-data";
import { Trash2 } from "lucide-react";
import { CheckSign } from "./check-sign";
import { CheckLine } from "./callouts";
import { inventoryLines } from "./inventory-chapter";
import { profileById } from "./profiles";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { FillField, FillRow, FILL_IN } from "./fill-row";
import { MediaStrip } from "./media-strip";

export function RunChapter({ job }: { job: JobFile }) {
  const est = job.scope.reduce((s, r) => s + r.estHours, 0);
  const actual = job.punches.reduce((s, p) => s + punchHours(p).total, 0);
  const crews = crewsOnJob(job);
  const [crew, setCrew] = useState(crews[0] || "");
  const day = job.assignments.find((a) => a.crew === crew)?.day || job.events[0]?.day || "";
  const [item, setItem] = useState("");
  const products = job.scope.filter((s) => s.kind === "product");
  const photoProducts = products;
  const closed = job.punches.length > 0 && job.punches.every((p) => p.back);
  const needsSerial = products.some((s) => profileById(s.categoryId)?.needsSerial);
  const accepted = isAccepted(job);

  return (
    <div className="space-y-2">
      {!accepted ? <p className="rounded-md border border-line bg-card px-4 py-3 text-sm">Acceptance is still open. The crew does not roll until the office accepts the job.</p> : null}
      <Walk job={job} kind="pre" title="Pre-install walk" locked={!accepted} />
      <JobCard kicker="Time" title="Shop to shop" done={closed} aside={`Est ${est}h · actual ${actual.toFixed(1)}h`}>
        <ul className="space-y-3">
          {job.punches.map((p) => {
            const h = punchHours(p);
            return (
              <li key={p.id}>
                <p className="text-sm font-semibold">
                  {p.who} · {labelDay(p.day)}
                  <span className="ml-2 text-[12px] font-normal text-muted">
                    {h.total ? `${h.site.toFixed(1)}h on site · ${h.travel.toFixed(1)}h travel · ${h.total.toFixed(1)}h total` : "Open"}
                  </span>
                </p>
                <div className="mt-2">
                  <FillRow min="7rem">
                    {(
                      [
                        ["leftYard", "Leave shop"],
                        ["onSite", "On site"],
                        ["complete", "Leave site"],
                        ["back", "Back at shop"],
                      ] as const
                    ).map(([k, lab]) => (
                      <FillField key={k} label={lab}>
                        <input type="time" disabled={!accepted} value={p[k]} onChange={(e) => patchPunchClock(job.jobId, p.id, { [k]: e.target.value })} className={FILL_IN} />
                      </FillField>
                    ))}
                  </FillRow>
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!accepted || !day) return;
            addTimePunch(job.jobId, crew, day);
          }}
        >
          <select value={crew} disabled={!accepted} onChange={(e) => setCrew(e.target.value)} className={cn(FILL_IN, "min-w-0 flex-1")}>
            {crews.length ? crews.map((name) => <option key={name}>{name}</option>) : <option value="">Assign a crew first</option>}
          </select>
          <p className="type-meta shrink-0">{day ? labelDay(day) : "No day on this crew"}</p>
          <button type="submit" disabled={!crew || !day || !accepted} className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
            Clock
          </button>
        </form>
      </JobCard>
      <Brought job={job} locked={!accepted} />
      {photoProducts.map((line) => (
        <JobCard key={line.id} kicker="Photos" title={line.label}>
          <MediaStrip
            files={line.media.filter((m) => m.cat === "Before" || m.cat === "During" || m.cat === "After" || m.purpose === "Pre-install")}
            onAdd={(f, meta) => {
              if (!accepted) return;
              addScopeMedia(job.jobId, line.id, f, catFromTag(meta.tag), { caption: meta.caption, purpose: meta.tag, name: meta.name });
            }}
            label="Install photos"
          />
        </JobCard>
      ))}

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
                    <input disabled={!accepted} value={e.serial} onChange={(ev) => setEquip(job.jobId, e.id, { serial: ev.target.value })} className={FILL_IN} />
                  </FillField>
                  <FillField label="AHRI">
                    <input disabled={!accepted} value={e.ahri} onChange={(ev) => setEquip(job.jobId, e.id, { ahri: ev.target.value })} className={FILL_IN} />
                  </FillField>
                </FillRow>
              </li>
            ))}
          </ul>
        </JobCard>
      ) : null}

      <Walk job={job} kind="post" title="Post-install walk" locked={!accepted} />

      <JobCard kicker="Punch" title="Open items" done={job.punch.length > 0 && job.punch.every((p) => p.status === "Done")}>
        <ul>
          {job.punch.map((p) => (
            <li key={p.id}>
              <button type="button" disabled={!accepted} onClick={() => togglePunch(job.jobId, p.id)} className={cn("flex h-10 w-full items-center justify-between text-left text-sm disabled:opacity-40", p.status === "Done" && "text-muted line-through")}>
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
            if (!accepted || !item.trim()) return;
            addPunch(job.jobId, item);
            setItem("");
          }}
        >
          <input disabled={!accepted} value={item} onChange={(e) => setItem(e.target.value)} placeholder="What’s left" className={cn(FILL_IN, "flex-1")} />
          <button type="submit" disabled={!accepted || !item.trim()} className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
            Add
          </button>
        </form>
      </JobCard>

      <FieldExtras job={job} locked={!accepted} />
      <Issues job={job} locked={!accepted} />
      <FieldChange job={job} locked={!accepted} />
    </div>
  );
}

function labelDay(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "No date";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function Walk({ job, kind, title, locked }: { job: JobFile; kind: "pre" | "post"; title: string; locked?: boolean }) {
  const check = kind === "pre" ? job.preCheck : job.postCheck;
  return (
    <JobCard kicker={kind === "pre" ? "Start" : "End"} title={title} aside={check.signedAt ? `Signed ${check.signedBy}` : "Open"} done={Boolean(check.signedAt)}>
      <ul>
        {check.items.map((i) => (
          <CheckLine
            key={i.id}
            label={i.label}
            on={i.on}
            who={i.by}
            callout={i.callout}
            onToggle={() => {
              if (locked) return;
              if (kind === "pre") togglePre(job.jobId, i.id);
              else togglePost(job.jobId, i.id);
            }}
            onCallout={(v) => {
              if (locked) return;
              setCheckCallout(job.jobId, kind, i.id, v);
            }}
          />
        ))}
      </ul>
      <CheckSign job={job} kind={kind} locked={locked} />
    </JobCard>
  );
}

function Brought({ job, locked }: { job: JobFile; locked?: boolean }) {
  const loads = job.assignments.filter((a) => a.kind === "internal" && a.inventory?.signedAt);
  return (
    <JobCard kicker="Used" title="Brought is the signed load" done={loads.length > 0}>
      {loads.length === 0 ? <p className="text-sm text-muted">No signed load yet. Inventory has to be signed before used quantity is entered.</p> : null}
      {loads.map((assign) => (
        <div key={assign.id} className="mt-3 first:mt-0">
          <p className="text-sm font-semibold">{assign.crew}</p>
          <ul className="mt-1 divide-y divide-line">
            {inventoryLines(job, assign).map((line) => {
              const scope = job.scope.find((s) => s.bom.some((b) => b.id === line.id));
              const bom = scope?.bom.find((b) => b.id === line.id);
              if (!scope || !bom) return <li key={line.id} className="py-2 text-sm">{line.name}</li>;
              const brought = bom.orderQty ?? bom.estQty;
              const used = bom.usedQty || 0;
              return (
                <li key={line.id} className="py-2">
                  <FillRow min="6.5rem">
                    <FillField label={bom.name}>
                      <p className="flex h-10 items-center text-sm">Brought {brought} {bom.unit}</p>
                    </FillField>
                    <FillField label="Used">
                      <input disabled={locked} value={used || ""} inputMode="decimal" onChange={(e) => patchBom(job.jobId, scope.id, bom.id, { usedQty: Number(e.target.value) || 0 })} className={FILL_IN} />
                    </FillField>
                    <FillField label="Left">
                      <p className="flex h-10 items-center text-sm tabular-nums">{Math.max(0, brought - used)} {bom.unit}</p>
                    </FillField>
                  </FillRow>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </JobCard>
  );
}

function Issues({ job, locked }: { job: JobFile; locked?: boolean }) {
  const [type, setType] = useState<FieldIssue["type"]>(ISSUE_TYPES[0]);
  const [note, setNote] = useState("");
  const [miss, setMiss] = useState(false);
  return (
    <JobCard kicker="Issues" title="What happened on site">
      {(job.issues ?? []).length ? (
        <ul className="mb-3 divide-y divide-line">
          {(job.issues ?? []).map((row) => (
            <li key={row.id} className="py-2 text-sm">
              <span className="font-semibold">{row.type}</span> · {row.note}
              <span className="type-meta"> · {row.by}{row.at ? ` · ${row.at}` : ""}</span>
            </li>
          ))}
        </ul>
      ) : <p className="mb-3 text-sm text-muted">None logged.</p>}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (locked || !note.trim()) {
            setMiss(true);
            return;
          }
          addFieldIssue(job.jobId, type, note);
          setNote("");
          setMiss(false);
        }}
      >
        <select disabled={locked} value={type} onChange={(e) => setType(e.target.value as FieldIssue["type"])} className={cn(FILL_IN, "w-40")}>
          {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input value={note} disabled={locked} onChange={(e) => setNote(e.target.value)} placeholder="What happened" className={cn(FILL_IN, "min-w-0 flex-1", miss && !note.trim() && "border-alert")} />
        <button type="submit" disabled={locked} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40">Add</button>
      </form>
      {miss && !note.trim() ? <p className="mt-2 text-[12px] font-semibold text-alert">Say what happened.</p> : null}
    </JobCard>
  );
}

function FieldChange({ job, locked }: { job: JobFile; locked?: boolean }) {
  const [why, setWhy] = useState("");
  const [amount, setAmount] = useState("");
  const [miss, setMiss] = useState(false);
  const open = job.changeOrders.filter((c) => c.lane === "install");
  const badWhy = miss && !why.trim();
  const badAmt = miss && !(Number(amount) > 0);
  return (
    <JobCard kicker="Change order" title="More work the customer agreed to">
      <p className="text-sm text-muted">This starts the change order. It is not signed on this tab.</p>
      {open.length ? (
        <ul className="mt-2 divide-y divide-line">
          {open.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span>{c.why}</span>
              <span className="text-[12px] font-semibold">{c.signed ? "Signed" : "Waiting on signature"}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (locked || !why.trim() || !(Number(amount) > 0)) {
            setMiss(true);
            return;
          }
          addChangeOrder(job.jobId, why, Number(amount), 0);
          setWhy("");
          setAmount("");
          setMiss(false);
        }}
      >
        <input disabled={locked} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="What was added" className={cn(FILL_IN, "min-w-0 flex-1", badWhy && "border-alert")} />
        <input disabled={locked} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="$" className={cn(FILL_IN, "w-28", badAmt && "border-alert")} />
        <button type="submit" disabled={locked} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40">Start</button>
      </form>
      {badWhy || badAmt ? <p className="mt-2 text-[12px] font-semibold text-alert">Need what was added, and an amount.</p> : null}
    </JobCard>
  );
}

function FieldExtras({ job, locked }: { job: JobFile; locked?: boolean }) {
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
        <select disabled={locked} value={reason} onChange={(e) => setReason(e.target.value as FieldExtra)} className={FILL_IN}>
          {FIELD_EXTRAS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="$" className={FILL_IN} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className={FILL_IN} />
        <button type="submit" disabled={locked} className="h-10 rounded-md bg-navy px-3 text-[12px] font-semibold text-card disabled:opacity-40">
          Add
        </button>
      </form>
    </JobCard>
  );
}

