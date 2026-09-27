import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { Fact, FactGrid, FileBlock } from "@/features/record-shell/file-sheet";
import { canOverrideFee, namesIn, useStaff } from "@/features/staff/store";
import { PaymentTerminal } from "@/features/pay/terminal";
import {
  addVisit,
  bookMembershipVisit,
  postVisit,
  amendVisit,
  addVisitPart,
  addVisitRepair,
  dropVisit,
  dropVisitPart,
  dropVisitRepair,
  patchVisit,
  patchVisitCheck,
  patchVisitPart,
  patchVisitRepair,
  payVisitRepair,
  setRepairCovered,
  memberPrice,
} from "./store";
import type { MembershipFile, MemberVisit } from "./types";

const field = "h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";
const line = "h-10 min-w-0 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

function clock(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (!h && h !== 0) return time;
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, "0")}${h >= 12 ? "p" : "a"}`;
}

function includedIds(visits: MemberVisit[], perYear: number) {
  const byYear = new Map<number, MemberVisit[]>();
  for (const visit of [...visits].sort((a, b) => a.on.localeCompare(b.on))) {
    const year = Number(visit.on.slice(0, 4));
    const list = byYear.get(year) ?? [];
    list.push(visit);
    byYear.set(year, list);
  }
  const ids = new Set<string>();
  for (const list of byYear.values()) list.slice(0, perYear).forEach((visit) => ids.add(visit.id));
  return ids;
}

function showDay(on: string) {
  const [y, m, d] = on.split("-").map(Number);
  if (!y || !m || !d) return on;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function posted(visit: MemberVisit) {
  return visit.status !== "Set" && visit.status !== "Open";
}

export function visitDue(file: MembershipFile) {
  if (file.status !== "Active" && file.status !== "Continued") return false;
  const year = new Date().getFullYear();
  const visits = file.visits ?? [];
  const done = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && posted(visit)).length;
  const set = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && visit.status === "Set").length;
  return done + set < file.visitsPerYear;
}

export function openVisitRepairs(file: MembershipFile) {
  return (file.visits ?? []).flatMap((visit) => {
    if (!posted(visit)) return [];
    return visit.repairs.filter((repair) => repair.status === "Open" && !repair.covered).map((repair) => ({ on: visit.on, repair }));
  });
}

export function visitsDone(file: MembershipFile) {
  const year = new Date().getFullYear();
  const visits = file.visits ?? [];
  const used = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && posted(visit)).length;
  const open = visits.some((visit) => posted(visit) && visit.repairs.some((repair) => repair.status === "Open" && !repair.covered));
  return (file.status === "Active" || file.status === "Continued") && used >= file.visitsPerYear && !open;
}

export function MembershipVisits({ file }: { file: MembershipFile }) {
  useStaff();
  const techs = namesIn("Crew", "PM");
  const year = new Date().getFullYear();
  const visits = file.visits ?? [];
  const used = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && posted(visit)).length;
  const booked = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && visit.status === "Set").length;
  const covered = includedIds(visits.filter((visit) => posted(visit)), file.visitsPerYear);
  const [charge, setCharge] = useState<{ visitId: string; repairId: string; amount: number; name: string } | null>(null);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("09:00");
  const [tech, setTech] = useState(techs[0] ?? "");
  const [miss, setMiss] = useState(false);
  const active = file.status === "Active" || file.status === "Continued";
  const hours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

  return (
    <div className="space-y-4">
      <FileBlock
        title="This year"
        hint={`${file.visitsPerYear} included on ${file.planName}. A repair is not plan dues.`}
        aside={
          <button
            type="button"
            disabled={!active}
            title={active ? "Add a visit" : "The plan has to be active"}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40"
            onClick={() => addVisit(file.id, techs[0] ?? "")}
          >
            <Plus className="h-4 w-4" />
            Visit
          </button>
        }
      >
        <FactGrid>
          <Fact label="Included" value={file.visitsPerYear} />
          <Fact label="Used" value={used} />
          <Fact label="On the book" value={booked} />
          <Fact label="Left" value={Math.max(0, file.visitsPerYear - used - booked)} />
        </FactGrid>
        <form
          className="grid gap-2 border-t border-line pt-3 sm:grid-cols-[1fr_8rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const result = bookMembershipVisit(file.id, { on: day, time, tech });
            setMiss(result !== "ok");
            if (result === "ok") setDay("");
          }}
        >
          <input type="date" aria-label="Visit date" value={day} onChange={(e) => setDay(e.target.value)} className={field} />
          <select aria-label="Visit time" value={time} onChange={(e) => setTime(e.target.value)} className={field}>
            {hours.map((hour) => (
              <option key={hour} value={hour}>
                {clock(hour)}
              </option>
            ))}
          </select>
          <select aria-label="Tech" value={tech} onChange={(e) => setTech(e.target.value)} className={field}>
            <option value="">Tech</option>
            {techs.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <button type="submit" disabled={!active} className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy disabled:opacity-40">
            On the book
          </button>
          {miss ? <p className="text-sm text-stop sm:col-span-4">Pick a date and a tech. The plan has to be active.</p> : null}
        </form>
      </FileBlock>
      {visits.map((visit) => (
        <VisitCard
          key={visit.id}
          file={file}
          visit={visit}
          techs={techs}
          included={covered.has(visit.id)}
          onCharge={(repair) => setCharge({ visitId: visit.id, repairId: repair.id, amount: memberPrice(repair.amount, file.repairDiscount), name: repair.name })}
        />
      ))}
      {!visits.length ? <p className="text-sm text-muted">No visits yet.</p> : null}
      {charge ? (
        <PaymentTerminal
          title={charge.name || "Visit repair"}
          amount={charge.amount}
          purpose={`Membership ${file.id} repair ${charge.repairId}`}
          vault={file.card?.vaultId ? { vaultId: file.card.vaultId, brand: file.card.brand, last4: file.card.last4, rail: file.card.rail } : undefined}
          onClose={() => setCharge(null)}
          onPaid={(slip) => {
            payVisitRepair(file.id, charge.visitId, charge.repairId, { brand: slip.brand || "Card", last4: slip.last4 || "", receipt: slip.receipt || "" });
            setCharge(null);
          }}
        />
      ) : null}
    </div>
  );
}

function visitMark(visit: MemberVisit, included: boolean) {
  if (visit.status === "Set") return "On the book";
  if (visit.status === "Open") return "Not posted";
  return included ? "Included" : "Extra";
}

const HOURS = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

function VisitLedger({
  file,
  visit,
  included,
  onChange,
  onCharge,
}: {
  file: MembershipFile;
  visit: MemberVisit;
  included: boolean;
  onChange?: () => void;
  onCharge: (repair: MemberVisit["repairs"][number]) => void;
}) {
  const checks = visit.checks ?? [];
  return (
    <FileBlock title={showDay(visit.on)} hint={visit.tech || "No tech"} aside={<p className="text-[12px] font-semibold text-muted">{visitMark(visit, included)}</p>}>
      <FactGrid>
        <Fact label="Time" value={visit.time ? clock(visit.time) : undefined} />
        <Fact label="Tech" value={visit.tech} />
        <Fact label="Posted" value={visit.postedBy ? `${visit.postedAt} · ${visit.postedBy}` : "On the record"} wide />
      </FactGrid>
      {visit.did ? (
        <div>
          <p className="type-label">What they did</p>
          <p className="mt-1 text-sm">{visit.did}</p>
        </div>
      ) : null}
      {checks.length ? (
        <div>
          <p className="type-label">Included on this visit</p>
          <ul className="mt-2 space-y-1">
            {checks.map((check) => (
              <li key={check.id} className="text-sm">
                <span className={check.done ? "font-semibold text-up" : "text-muted"}>{check.done ? "Done" : "Not done"}</span>
                {" · "}
                {check.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {visit.parts.length ? (
        <div>
          <p className="type-label">Used</p>
          <ul className="mt-2 space-y-1">
            {visit.parts.map((part) => (
              <li key={part.id} className="text-sm">
                {part.name || "Part"} · {part.qty}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <FactGrid>
        <Fact label="Customer" value={visit.customerNote} wide />
        <Fact label="Service" value={visit.serviceNote} wide />
        <Fact label="Failing" value={visit.failing} wide />
      </FactGrid>
      {visit.repairs.length ? (
        <div>
          <p className="type-label">Repairs</p>
          <ul className="mt-2 space-y-2">
            {visit.repairs.map((repair) => (
              <li key={repair.id} className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm">
                  {repair.name || "Repair"}
                  {" · "}
                  {repair.status === "Paid" ? `Paid ····${repair.last4}` : repair.covered ? "Covered" : money(memberPrice(repair.amount, file.repairDiscount))}
                </p>
                {repair.status === "Open" && !repair.covered ? (
                  <button type="button" disabled={repair.amount <= 0} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40" onClick={() => onCharge(repair)}>
                    Run card {money(memberPrice(repair.amount, file.repairDiscount))}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {(visit.edits ?? []).length ? (
        <ul className="space-y-1 border-t border-line pt-3">
          {(visit.edits ?? []).map((edit) => (
            <li key={`${edit.at}-${edit.by}-${edit.why}`} className="text-sm">
              Changed {edit.at} by {edit.by}. {edit.why}
            </li>
          ))}
        </ul>
      ) : null}
      {onChange ? (
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={onChange}>
          Change
        </button>
      ) : null}
    </FileBlock>
  );
}

function VisitCard({
  file,
  visit,
  techs,
  included,
  onCharge,
}: {
  file: MembershipFile;
  visit: MemberVisit;
  techs: string[];
  included: boolean;
  onCharge: (repair: MemberVisit["repairs"][number]) => void;
}) {
  useStaff();
  const admin = canOverrideFee();
  const isPosted = posted(visit);
  const [changing, setChanging] = useState(false);
  const [draft, setDraft] = useState<MemberVisit | null>(null);
  const [why, setWhy] = useState("");
  const [miss, setMiss] = useState("");
  const source = changing && draft ? draft : visit;
  const techOptions = techs.includes(source.tech) || !source.tech ? techs : [source.tech, ...techs];
  const hours = source.time && !HOURS.includes(source.time) ? [source.time, ...HOURS] : HOURS;
  const paid = source.repairs.some((repair) => repair.status === "Paid");

  function startChange() {
    setDraft({
      ...visit,
      checks: (visit.checks ?? []).map((check) => ({ ...check })),
      parts: visit.parts.map((part) => ({ ...part })),
      repairs: visit.repairs.map((repair) => ({ ...repair })),
    });
    setWhy("");
    setMiss("");
    setChanging(true);
  }

  function write(patch: Partial<Pick<MemberVisit, "on" | "time" | "tech" | "did" | "customerNote" | "serviceNote" | "failing">>) {
    if (changing && draft) setDraft({ ...draft, ...patch });
    else patchVisit(file.id, visit.id, patch);
  }

  if (isPosted && !changing) {
    return <VisitLedger file={file} visit={visit} included={included} onChange={admin ? startChange : undefined} onCharge={onCharge} />;
  }

  return (
    <FileBlock title={showDay(source.on)} hint={source.tech || "No tech yet"} aside={<p className="text-[12px] font-semibold text-muted">{changing ? "Changing the record" : visitMark(visit, included)}</p>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="type-label">Date</span>
          <input type="date" value={source.on} onChange={(e) => write({ on: e.target.value })} className={`mt-1 ${field}`} />
        </label>
        <label className="block text-sm">
          <span className="type-label">Time</span>
          <select value={source.time ?? ""} onChange={(e) => write({ time: e.target.value })} className={`mt-1 ${field}`}>
            <option value="">Time</option>
            {hours.map((hour) => (
              <option key={hour} value={hour}>
                {clock(hour)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="type-label">Tech</span>
          <select value={source.tech} onChange={(e) => write({ tech: e.target.value })} className={`mt-1 ${field}`}>
            <option value="">Select</option>
            {techOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="type-label">What they did</span>
        <textarea value={source.did} rows={2} onChange={(e) => write({ did: e.target.value })} className={`mt-1 ${field} h-auto py-2`} />
      </label>
      {(source.checks ?? []).length ? (
        <div>
          <p className="type-label">Included on this visit</p>
          <ul className="mt-2 space-y-1">
            {(source.checks ?? []).map((check) => (
              <li key={check.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={check.done}
                    onChange={(e) => {
                      const done = e.target.checked;
                      if (changing && draft) setDraft({ ...draft, checks: (draft.checks ?? []).map((row) => (row.id === check.id ? { ...row, done } : row)) });
                      else patchVisitCheck(file.id, visit.id, check.id, done);
                    }}
                  />
                  {check.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="type-label">Used</p>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 text-sm font-semibold text-navy"
            onClick={() => {
              if (changing && draft) setDraft({ ...draft, parts: [...draft.parts, { id: `VP-${Date.now()}`, name: "", qty: 1 }] });
              else addVisitPart(file.id, visit.id);
            }}
          >
            <Plus className="h-4 w-4" />
            Part
          </button>
        </div>
        <ul className="space-y-2">
          {source.parts.map((part) => (
            <li key={part.id} className="flex items-center gap-2">
              <input
                value={part.name}
                placeholder="Part"
                aria-label="Part"
                onChange={(e) => {
                  const name = e.target.value;
                  if (changing && draft) setDraft({ ...draft, parts: draft.parts.map((row) => (row.id === part.id ? { ...row, name } : row)) });
                  else patchVisitPart(file.id, visit.id, part.id, { name });
                }}
                className={`${line} flex-1`}
              />
              <input
                value={part.qty}
                inputMode="numeric"
                aria-label="Quantity"
                onChange={(e) => {
                  const qty = Math.max(1, Number(e.target.value) || 1);
                  if (changing && draft) setDraft({ ...draft, parts: draft.parts.map((row) => (row.id === part.id ? { ...row, qty } : row)) });
                  else patchVisitPart(file.id, visit.id, part.id, { qty });
                }}
                className={`${line} w-16 shrink-0 text-center`}
              />
              <button
                type="button"
                aria-label="Remove part"
                className="grid h-10 w-10 shrink-0 place-items-center text-muted"
                onClick={() => {
                  if (changing && draft) setDraft({ ...draft, parts: draft.parts.filter((row) => row.id !== part.id) });
                  else dropVisitPart(file.id, visit.id, part.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <label className="block text-sm">
        <span className="type-label">Customer</span>
        <textarea value={source.customerNote} rows={2} onChange={(e) => write({ customerNote: e.target.value })} className={`mt-1 ${field} h-auto py-2`} />
      </label>
      <label className="block text-sm">
        <span className="type-label">Service</span>
        <textarea value={source.serviceNote} rows={2} onChange={(e) => write({ serviceNote: e.target.value })} className={`mt-1 ${field} h-auto py-2`} />
      </label>
      <label className="block text-sm">
        <span className="type-label">Failing</span>
        <input value={source.failing} onChange={(e) => write({ failing: e.target.value })} className={`mt-1 ${field}`} />
      </label>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="type-label">Repairs</p>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 text-sm font-semibold text-navy"
            onClick={() => {
              if (changing && draft) setDraft({ ...draft, repairs: [...draft.repairs, { id: `VR-${Date.now()}`, name: "", amount: 0, status: "Open" }] });
              else addVisitRepair(file.id, visit.id);
            }}
          >
            <Plus className="h-4 w-4" />
            Repair
          </button>
        </div>
        <ul className="space-y-2">
          {source.repairs.map((repair) => (
            <li key={repair.id} className="flex flex-wrap items-center gap-2">
              <input
                value={repair.name}
                placeholder="What failed"
                disabled={repair.status === "Paid"}
                onChange={(e) => {
                  const name = e.target.value;
                  if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.map((row) => (row.id === repair.id && row.status === "Open" ? { ...row, name } : row)) });
                  else patchVisitRepair(file.id, visit.id, repair.id, { name });
                }}
                className={`${line} min-w-0 flex-1`}
              />
              <input
                value={repair.amount || ""}
                inputMode="decimal"
                placeholder="0"
                disabled={repair.status === "Paid"}
                onChange={(e) => {
                  const amount = Math.max(0, Number(e.target.value) || 0);
                  if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.map((row) => (row.id === repair.id && row.status === "Open" ? { ...row, amount } : row)) });
                  else patchVisitRepair(file.id, visit.id, repair.id, { amount });
                }}
                className={`${line} w-28 shrink-0`}
              />
              {repair.status === "Paid" ? (
                <p className="text-sm font-semibold text-up">Paid ····{repair.last4}</p>
              ) : repair.covered ? (
                <button
                  type="button"
                  className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy"
                  onClick={() => {
                    if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.map((row) => (row.id === repair.id ? { ...row, covered: false } : row)) });
                    else setRepairCovered(file.id, visit.id, repair.id, false);
                  }}
                >
                  Bill
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="h-10 rounded-md border border-line px-3 text-sm font-semibold"
                    onClick={() => {
                      if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.map((row) => (row.id === repair.id ? { ...row, covered: true } : row)) });
                      else setRepairCovered(file.id, visit.id, repair.id, true);
                    }}
                  >
                    Covered
                  </button>
                  <button type="button" disabled={repair.amount <= 0 || changing} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40" onClick={() => onCharge(repair)}>
                    Run card {money(memberPrice(repair.amount, file.repairDiscount))}
                  </button>
                </>
              )}
              {repair.status === "Open" ? (
                <button
                  type="button"
                  aria-label="Remove repair"
                  className="grid h-10 w-10 shrink-0 place-items-center text-muted"
                  onClick={() => {
                    if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.filter((row) => row.id !== repair.id) });
                    else dropVisitRepair(file.id, visit.id, repair.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      {changing ? (
        <label className="block text-sm">
          <span className="type-label">Why this changed</span>
          <input value={why} onChange={(e) => setWhy(e.target.value)} className={`mt-1 ${field}`} />
        </label>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        {changing ? (
          <button
            type="button"
            className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              if (!draft) return;
              const result = amendVisit(file.id, visit.id, why, {
                on: draft.on,
                time: draft.time,
                tech: draft.tech,
                did: draft.did,
                customerNote: draft.customerNote,
                serviceNote: draft.serviceNote,
                failing: draft.failing,
                checks: draft.checks,
                parts: draft.parts,
                repairs: draft.repairs,
              });
              setMiss(result === "why" ? "The reason stays on the record." : result === "admin" ? "Only an admin can change a posted visit." : result === "ok" ? "" : "Date and tech are required.");
              if (result === "ok") {
                setChanging(false);
                setDraft(null);
              }
            }}
          >
            Save
          </button>
        ) : (
          <button
            type="button"
            className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              const result = postVisit(file.id, visit.id);
              setMiss(result === "tech" ? "A tech has to be on the visit before it can be posted." : result === "ok" ? "" : "The date is required.");
            }}
          >
            Post
          </button>
        )}
        {!changing && !paid ? (
          <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-muted" onClick={() => dropVisit(file.id, visit.id)}>
            <Trash2 className="h-4 w-4" />
            Remove visit
          </button>
        ) : null}
        {changing ? (
          <button type="button" className="text-sm font-semibold text-muted" onClick={() => { setChanging(false); setDraft(null); setMiss(""); }}>
            Cancel
          </button>
        ) : null}
      </div>
      {miss ? <p className="text-sm text-stop">{miss}</p> : null}
    </FileBlock>
  );
}

