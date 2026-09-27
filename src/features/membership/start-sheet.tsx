import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { money } from "@/lib/crm-data";
import { planById, termPrice, usePlans } from "./catalog";
import { startMembership, useMembershipFor } from "./store";
import { TERMS, type MemberOrigin, type PayMode, type TermYears } from "./types";

export function StartMembership({
  open,
  onClose,
  personId,
  name,
  address,
  city,
  office,
  owner,
  from,
}: {
  open: boolean;
  onClose: () => void;
  personId: string;
  name: string;
  address: string;
  city: string;
  office: string;
  owner: string;
  from: MemberOrigin;
}) {
  const plans = usePlans();
  const existing = useMembershipFor(personId);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "comfort");
  const [years, setYears] = useState<TermYears>(3);
  const [pay, setPay] = useState<PayMode>("prepaid");
  if (!open) return null;
  const plan = planById(planId);
  const price = termPrice(plan, years);
  const term = pay === "prepaid" ? money(price.prepaid) : `${money(price.monthly)}/mo`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-md border border-line bg-card shadow-sm sm:rounded-md">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Membership</p>
          <button type="button" className="h-10 px-2 text-sm font-semibold text-muted" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
          {existing ? (
            <div className="space-y-3">
              <p className="text-sm">
                {existing.name} is already on {existing.planName}, {existing.years} years. Starting another plan would leave this page, so this one stays.
              </p>
              <p className="text-sm text-muted">
                {existing.pay === "prepaid" ? `${money(existing.termPrice)} prepaid` : `${money(existing.termPrice)}/mo`} through {existing.end}. After that, {money(existing.continueMonthly)}/mo until they cancel.
              </p>
              <Link to="/memberships/$membershipId" params={{ membershipId: existing.id }} className="inline-flex h-11 items-center text-sm font-semibold text-navy">
                Open the membership
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                startMembership({ personId, name, address, city, office, owner, planId, years, pay, from });
                onClose();
              }}
            >
              <p className="text-sm text-muted">This stays on the {from}. The plan is its own file, with this price copied onto it.</p>
              <label className="block text-sm">
                <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Plan</span>
                <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3">
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Term</span>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value) as TermYears)}
                  className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3"
                >
                  {TERMS.map((y) => (
                    <option key={y} value={y}>
                      {y} {y === 1 ? "year" : "years"}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="space-y-2">
                <legend className="text-[11px] font-bold tracking-wide text-muted uppercase">How they pay the term</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="pay" checked={pay === "prepaid"} onChange={() => setPay("prepaid")} />
                  Prepaid {money(price.prepaid)}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="pay" checked={pay === "billed"} onChange={() => setPay("billed")} />
                  Billed {money(price.monthly)}/mo
                </label>
              </fieldset>
              <p className="text-sm">
                Term price {term}. After {years} years, {money(plan.continueMonthly)}/mo until they cancel or lock a new term.
              </p>
              <button type="submit" className="h-11 rounded-md bg-navy px-4 text-sm font-semibold text-card">
                Start plan
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
