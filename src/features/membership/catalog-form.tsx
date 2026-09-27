import { useState } from "react";
import { money } from "@/lib/crm-data";
import { setContinueRate, setIncluded, setRepairDiscount, setTermAmount, usePlans } from "./catalog";
import type { MemberPlan, TermYears } from "./types";

export function CatalogForm() {
  const plans = usePlans();
  return (
    <div className="space-y-4">
      <p className="max-w-xl text-sm text-muted">
        These are the prices a new membership copies. A plan already started keeps the price it was sold at.
      </p>
      {plans.map((plan) => (
        <section key={plan.id} className="max-w-3xl rounded-md border border-line bg-card">
          <header className="border-b border-line px-4 py-3">
            <h2 className="type-section">{plan.name}</h2>
            <p className="type-meta mt-1">{plan.visitsPerYear} visits a year</p>
          </header>
          <div className="space-y-4 px-4 py-3">
            <label className="block max-w-xs text-sm">
              <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Continue rate / month</span>
              <input
                value={plan.continueMonthly}
                inputMode="numeric"
                onChange={(e) => setContinueRate(plan.id, Number(e.target.value) || 0)}
                className="mt-1 h-11 w-full rounded-md border border-line px-3"
              />
              <span className="mt-1 block text-sm text-muted">After the term, until they cancel. Now {money(plan.continueMonthly)}/mo.</span>
            </label>
            <IncludedEditor plan={plan} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="text-[11px] font-bold tracking-wide text-muted uppercase">
                    <th className="py-2 pr-3 font-bold">Term</th>
                    <th className="py-2 pr-3 font-bold">Prepaid</th>
                    <th className="py-2 font-bold">Monthly during the term</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.terms.map((term) => (
                    <tr key={term.years} className="border-t border-line">
                      <td className="py-2 pr-3">{term.years} years</td>
                      <td className="py-2 pr-3">
                        <input
                          value={term.prepaid}
                          inputMode="numeric"
                          aria-label={`${plan.name} ${term.years} year prepaid`}
                          onChange={(e) => setTermAmount(plan.id, term.years as TermYears, "prepaid", Number(e.target.value) || 0)}
                          className="h-11 w-full rounded-md border border-line px-3"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          value={term.monthly}
                          inputMode="numeric"
                          aria-label={`${plan.name} ${term.years} year monthly`}
                          onChange={(e) => setTermAmount(plan.id, term.years as TermYears, "monthly", Number(e.target.value) || 0)}
                          className="h-11 w-full rounded-md border border-line px-3"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function IncludedEditor({ plan }: { plan: MemberPlan }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
      <div>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Included on a visit</p>
        <ul className="mt-2 space-y-1">
          {plan.included.map((item) => (
            <li key={item} className="flex items-center justify-between gap-3 text-sm">
              <span>{item}</span>
              <button type="button" className="text-sm font-semibold text-muted" onClick={() => setIncluded(plan.id, plan.included.filter((row) => row !== item).join("\n"))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const next = draft.trim();
            if (!next || plan.included.includes(next)) return;
            setIncluded(plan.id, [...plan.included, next].join("\n"));
            setDraft("");
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} className="h-11 min-w-0 flex-1 rounded-md border border-line px-3" />
          <button type="submit" className="h-11 rounded-md border border-line px-3 text-sm font-semibold">
            Add
          </button>
        </form>
      </div>
      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Repair discount</span>
        <input
          value={plan.repairDiscount}
          inputMode="numeric"
          onChange={(e) => setRepairDiscount(plan.id, Number(e.target.value) || 0)}
          className="mt-1 h-11 w-full rounded-md border border-line px-3"
        />
        <span className="mt-1 block text-sm text-muted">Percent off a billed repair. A plan already started keeps its own.</span>
      </label>
    </div>
  );
}
