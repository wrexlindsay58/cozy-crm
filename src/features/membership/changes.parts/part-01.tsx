import { useState } from "react";
import { money } from "@/lib/crm-data";
import { canOverrideFee, useStaff } from "@/features/staff/store";
import { usePlans } from "../catalog";
import { amountLeft, cancelMembership, transferMembership } from "../store";
import type { CancelRecord, MembershipFile } from "../types";
import { ChangesCardView3 } from "./part-02";

export const field = "h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

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
    <ChangesCardView3 bag={{ file, changes, admin, closed, pick, action, planId, setMiss, setAction, setPlanId, plans, address, city, why, setAddress, setCity, setWhy, reason, refund, partial, setReason, left, setRefund, setPartial, miss }} />
  );
}

export function ChangesCardView(props: { bag: { file: any; reason: any; refund: any; partial: any; setMiss: any; setReason: any; left: any; setRefund: any; setPartial: any } }) {
  const { file, reason, refund, partial, setMiss, setReason, left, setRefund, setPartial } = props.bag;
  return (
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
  );
}

export function ChangesCardView2(props: { bag: { file: any; address: any; city: any; why: any; setAddress: any; setCity: any; setWhy: any; setMiss: any; setAction: any } }) {
  const { file, address, city, why, setAddress, setCity, setWhy, setMiss, setAction } = props.bag;
  return (
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
  );
}
