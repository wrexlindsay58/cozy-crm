import { money } from "@/lib/crm-data";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { changeMembershipPlan } from "../store";
import { field, ChangesCardView, ChangesCardView2 } from "./part-01";

export function ChangesCardView3(props: { bag: { file: any; changes: any; admin: any; closed: any; pick: any; action: any; planId: any; setMiss: any; setAction: any; setPlanId: any; plans: any; address: any; city: any; why: any; setAddress: any; setCity: any; setWhy: any; reason: any; refund: any; partial: any; setReason: any; left: any; setRefund: any; setPartial: any; miss: any } }) {
  const { file, changes, admin, closed, pick, action, planId, setMiss, setAction, setPlanId, plans, address, city, why, setAddress, setCity, setWhy, reason, refund, partial, setReason, left, setRefund, setPartial, miss } = props.bag;
  return (
    <FileBlock title="Changes" hint="A prepaid term stays locked. A refund is not automatic.">
      {file.cancel ? (
        <p className="text-sm">
          Canceled {file.cancel.at} by {file.cancel.by}. {file.cancel.reason} {file.cancel.amount > 0 ? `Refund ${money(file.cancel.amount)}.` : "No refund."}
        </p>
      ) : null}
      {changes.length ? (
        <ul className="space-y-2">
          {changes.map((change: any) => (
            <li key={change.id} className="text-sm">
              <span className="font-semibold">{change.kind === "transfer" ? "Transfer" : change.kind === "upgrade" ? "Upgrade" : "Downgrade"}</span>
              {" · "}
              {change.at} · {change.by}
              <span className="mt-0.5 block text-muted">
                {change.from} → {change.to}. {change.note}
              </span>
            </li>
          ))}
        </ul>
      ) : file.cancel ? null : (
        <p className="text-sm text-muted">No changes on this plan.</p>
      )}
      {admin && !closed ? (
        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          {(
            [
              ["plan", "Change plan"],
              ["transfer", "Transfer"],
              ["cancel", "Cancel"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => pick(value)}
              className={action === value ? "h-10 rounded-md border border-navy bg-info-bg px-3 text-sm font-semibold text-navy" : "h-10 rounded-md border border-line px-3 text-sm font-semibold"}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {action === "plan" && admin && !closed ? (
        <form
          className="grid gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const result = changeMembershipPlan(file.id, planId);
            if (result === "ok") {
              setMiss("");
              setAction(null);
            } else setMiss("Pick a different plan.");
          }}
        >
          <label className="block text-sm">
            <span className="type-label">Plan</span>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={`mt-1 ${field}`}>
              {plans.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={!plans.length} className="h-10 self-end rounded-md border border-navy px-3 text-sm font-semibold text-navy disabled:opacity-40">
            Change plan
          </button>
        </form>
      ) : null}
      {action === "transfer" && admin && !closed ? (
        <ChangesCardView2 bag={{ file, address, city, why, setAddress, setCity, setWhy, setMiss, setAction }} />
      ) : null}
      {action === "cancel" && admin && !closed ? (
        <ChangesCardView bag={{ file, reason, refund, partial, setMiss, setReason, left, setRefund, setPartial }} />
      ) : null}
      {miss ? <p className="text-sm text-stop">{miss}</p> : null}
    </FileBlock>
  );
}
