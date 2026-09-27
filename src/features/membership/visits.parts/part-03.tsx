import { money } from "@/lib/crm-data";
import { Fact, FactGrid, FileBlock } from "@/features/record-shell/file-sheet";
import { memberPrice } from "../store";
import type { MembershipFile, MemberVisit } from "../types";
import { clock, showDay, visitMark } from "./part-01";

export function VisitLedger({
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
