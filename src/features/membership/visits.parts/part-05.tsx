import { Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { addVisitRepair, dropVisitRepair, patchVisitRepair, setRepairCovered, memberPrice } from "../store";
import { line } from "./part-01";

export function VisitCardView(props: { bag: { changing: any; draft: any; setDraft: any; file: any; visit: any; source: any; onCharge: any } }) {
  const { changing, draft, setDraft, file, visit, source, onCharge } = props.bag;
  return (
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
          {source.repairs.map((repair: any) => (
            <li key={repair.id} className="flex flex-wrap items-center gap-2">
              <input
                value={repair.name}
                placeholder="What failed"
                disabled={repair.status === "Paid"}
                onChange={(e) => {
                  const name = e.target.value;
                  if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.map((row: any) => (row.id === repair.id && row.status === "Open" ? { ...row, name } : row)) });
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
                  if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.map((row: any) => (row.id === repair.id && row.status === "Open" ? { ...row, amount } : row)) });
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
                    if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.map((row: any) => (row.id === repair.id ? { ...row, covered: false } : row)) });
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
                      if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.map((row: any) => (row.id === repair.id ? { ...row, covered: true } : row)) });
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
                    if (changing && draft) setDraft({ ...draft, repairs: draft.repairs.filter((row: any) => row.id !== repair.id) });
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
  );
}
