import { useState } from "react";
import { money } from "@/lib/crm-data";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { canOverrideFee, useStaff } from "@/features/staff/store";
import { usePlans } from "./catalog";
import { amountLeft, cancelMembership, changeMembershipPlan, transferMembership } from "./store";
import type { CancelRecord, MembershipFile } from "./types";

const field = "h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

type Action = "plan" | "transfer" | "cancel";

export function ChangesCard({ file }: { file: MembershipFile }) {
  useStaff();
  const plans = usePlans().filter((plan) => plan.id !== file.planId);
  const admin = canOverrideFee();
  const [action, setAction] = useState<Action | null>(null);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [why, setWhy] = useState("");
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState<CancelRecord["refund"]>("none");
  const [partial, setPartial] = useState("");
  const [miss, setMiss] = useState("");
  const left = amountLeft(file);
  const closed = file.status === "Canceled" || file.status === "Offered";
  const changes = file.changes ?? [];

  function pick(next: Action) {
    setMiss("");
    setAction((current) => (current === next ? null : next));
  }

  return (
    <FileBlock title="Changes" hint="A prepaid term stays locked. A refund is not automatic.">
      {file.cancel ? (
        <p className="text-sm">
          Canceled {file.cancel.at} by {file.cancel.by}. {file.cancel.reason} {file.cancel.amount > 0 ? `Refund ${money(file.cancel.amount)}.` : "No refund."}
        </p>
      ) : null}
      {changes.length ? (
        <ul className="space-y-2">
          {changes.map((change) => (
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
              {plans.map((plan) => (
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
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const result = transferMembership(file.id, address, city, why);
            if (result === "ok") {
              setAddress("");
              setCity("");
              setWhy("");
              setMiss("");
              setAction(null);
            } else setMiss("Address, city, and the reason are required.");
          }}
        >
          <label className="block text-sm">
            <span className="type-label">New address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={`mt-1 ${field}`} />
          </label>
          <label className="block text-sm">
            <span className="type-label">City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={`mt-1 ${field}`} />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="type-label">Why we agreed</span>
            <input value={why} onChange={(e) => setWhy(e.target.value)} className={`mt-1 ${field}`} />
          </label>
          <button type="submit" className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy sm:col-span-2 sm:w-fit">
            Transfer
          </button>
        </form>
      ) : null}
      {action === "cancel" && admin && !closed ? (
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const result = cancelMembership(file.id, reason, refund, Number(partial));
            setMiss(result === "reason" ? "The reason stays on the record." : result === "amount" ? "Enter the refund amount." : "");
          }}
        >
          <label className="block text-sm">
            <span className="type-label">Why it is canceled</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className={`mt-1 ${field}`} />
          </label>
          <p className="text-sm text-muted">
            {file.pay === "prepaid" ? `${money(left)} is left on the prepaid term.` : `${money(left)} is still open.`} Choosing full uses that number. Choosing none leaves it.
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["none", "No refund"],
                ["partial", "Partial"],
                ["full", "Full left"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRefund(value)}
                className={refund === value ? "h-9 rounded-md border border-navy bg-info-bg px-3 text-sm font-semibold text-navy" : "h-9 rounded-md border border-line px-3 text-sm font-semibold text-muted"}
              >
                {label}
              </button>
            ))}
          </div>
          {refund === "partial" ? <input value={partial} inputMode="decimal" placeholder="Refund amount" onChange={(e) => setPartial(e.target.value)} className={field} /> : null}
          <button type="submit" className="h-10 w-fit rounded-md border border-stop px-3 text-sm font-semibold text-stop">
            Cancel plan
          </button>
        </form>
      ) : null}
      {miss ? <p className="text-sm text-stop">{miss}</p> : null}
    </FileBlock>
  );
}
