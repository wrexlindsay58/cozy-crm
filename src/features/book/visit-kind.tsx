import { field, label } from "./event-modal.parts/part-01";
import { PHONE_REASONS } from "./results";

export function VisitKind({
  type,
  visit,
  setVisit,
  visitWhy,
  setVisitWhy,
  visitNote,
  setVisitNote,
}: {
  type: string;
  visit: string;
  setVisit: (v: "in-person" | "phone") => void;
  visitWhy: string;
  setVisitWhy: (v: string) => void;
  visitNote: string;
  setVisitNote: (v: string) => void;
}) {
  if (type !== "Sales" && type !== "Callback") return null;
  const phone = visit === "phone";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={label}>
        Visit
        <select value={visit} onChange={(e) => setVisit(e.target.value === "phone" ? "phone" : "in-person")} className={field}>
          <option value="in-person">In person</option>
          <option value="phone">Phone</option>
        </select>
      </label>
      {phone ? (
        <label className={label}>
          Why a phone consult
          <select required value={visitWhy} onChange={(e) => setVisitWhy(e.target.value)} className={field}>
            <option value="">Select a reason</option>
            {PHONE_REASONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </label>
      ) : null}
      {phone && visitWhy === "other" ? (
        <label className={label}>
          Custom reason
          <input required value={visitNote} onChange={(e) => setVisitNote(e.target.value)} placeholder="Why this is a phone consult" className={field} />
        </label>
      ) : null}
    </div>
  );
}
