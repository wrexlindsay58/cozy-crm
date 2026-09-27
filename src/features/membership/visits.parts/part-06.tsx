import { FileBlock } from "@/features/record-shell/file-sheet";
import { patchVisitCheck } from "../store";
import { field, clock, showDay, visitMark, VisitCardView2 } from "./part-01";
import { VisitCardView3 } from "./part-04";
import { VisitCardView } from "./part-05";

export function VisitCardView4(props: { bag: { source: any; changing: any; visit: any; included: any; write: any; hours: any; techOptions: any; draft: any; setDraft: any; file: any; onCharge: any; why: any; setWhy: any; setMiss: any; setChanging: any; paid: any; miss: any } }) {
  const { source, changing, visit, included, write, hours, techOptions, draft, setDraft, file, onCharge, why, setWhy, setMiss, setChanging, paid, miss } = props.bag;
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
            {hours.map((hour: any) => (
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
            {techOptions.map((name: any) => (
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
            {(source.checks ?? []).map((check: any) => (
              <li key={check.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={check.done}
                    onChange={(e) => {
                      const done = e.target.checked;
                      if (changing && draft) setDraft({ ...draft, checks: (draft.checks ?? []).map((row: any) => (row.id === check.id ? { ...row, done } : row)) });
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
      <VisitCardView2 bag={{ changing, draft, setDraft, file, visit, source }} />
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
      <VisitCardView bag={{ changing, draft, setDraft, file, visit, source, onCharge }} />
      {changing ? (
        <label className="block text-sm">
          <span className="type-label">Why this changed</span>
          <input value={why} onChange={(e) => setWhy(e.target.value)} className={`mt-1 ${field}`} />
        </label>
      ) : null}
      <VisitCardView3 bag={{ changing, draft, file, visit, why, setMiss, setChanging, setDraft, paid }} />
      {miss ? <p className="text-sm text-stop">{miss}</p> : null}
    </FileBlock>
  );
}
