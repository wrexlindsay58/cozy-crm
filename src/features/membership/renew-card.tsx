import { useEffect, useState } from "react";
import { money } from "@/lib/crm-data";
import { Fact, FactGrid, FileBlock } from "@/features/record-shell/file-sheet";
import { canOverrideFee, useStaff } from "@/features/staff/store";
import { planById, termPrice, usePlans } from "./catalog";
import { isoDay, parseDay, plusDays, rateAfterTerm, renewalOpen, renewalOpensOn, NOTICE_DAYS, RENEW_MONTHS } from "./renew";
import { applyDueNotice, lockRenewal, passRenewal, scheduleNotice, settleTerm } from "./store";
import { TERMS, type MembershipFile, type PayMode, type TermYears } from "./types";

const field = "h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

function showDay(value: string) {
  const d = parseDay(value);
  return d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : value;
}

export function RenewCard({ file }: { file: MembershipFile }) {
  useStaff();
  usePlans();
  const plan = planById(file.planId);
  const admin = canOverrideFee();
  const [years, setYears] = useState<TermYears>(file.years);
  const [pay, setPay] = useState<PayMode>("prepaid");
  const [rateOpen, setRateOpen] = useState(false);
  const [amount, setAmount] = useState(String(plan.continueMonthly));
  const [starts, setStarts] = useState(isoDay(plusDays(new Date(), NOTICE_DAYS)));
  const [miss, setMiss] = useState("");
  const open = renewalOpen(file);
  const price = termPrice(plan, years);
  const termAmount = pay === "prepaid" ? price.prepaid : price.monthly;
  const after = rateAfterTerm(file);
  const opens = renewalOpensOn(file.end);
  const windowLabel = file.renewal?.status === "Locked" ? "Locked" : open ? "Open" : opens ? showDay(isoDay(opens)) : file.end;

  useEffect(() => {
    applyDueNotice(file.id);
    settleTerm(file.id);
  }, [file.id, file.end, file.status, file.notice?.startsOn, file.renewal?.status]);

  if (file.status === "Offered" || file.status === "Canceled") return null;

  return (
    <FileBlock title="Renewal" hint="A new term is a discount against month to month. The signed agreement stays on the file.">
      <FactGrid>
        <Fact label="Term ends" value={file.end} />
        <Fact label="Window" value={windowLabel} />
        <Fact label="After the term" value={`${money(after)}/mo`} />
        <Fact label="Continue rate" value={`${money(file.continueMonthly)}/mo`} />
        {file.notice ? (
          <Fact label="Told" value={`${file.notice.toldOn}. ${money(file.notice.amount)}/mo starts ${showDay(file.notice.startsOn)}.`} wide />
        ) : null}
      </FactGrid>
      {file.renewal?.status === "Locked" ? (
        <p className="text-sm font-semibold">
          Locked {file.renewal.at}. {file.renewal.years} years, {file.renewal.pay === "prepaid" ? `${money(file.renewal.termPrice)} prepaid` : `${money(file.renewal.termPrice)}/mo`}, through {file.end}.
        </p>
      ) : null}
      {file.renewal?.status === "Passed" ? <p className="text-sm">Passed on {file.renewal.at}. They can still lock a term before the plan is left month to month.</p> : null}
      {!open && file.renewal?.status !== "Locked" ? (
        <p className="text-sm text-muted">The window opens {RENEW_MONTHS} months before the term ends.</p>
      ) : null}
      {open && file.agreement?.status !== "Signed" ? <p className="text-sm text-muted">The agreement has to be signed before a new term can be locked.</p> : null}
      {open && file.agreement?.status === "Signed" && file.renewal?.status !== "Locked" ? (
        <div className="grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="type-label">New term</span>
            <select value={years} onChange={(e) => setYears(Number(e.target.value) as TermYears)} className={`mt-1 ${field}`}>
              {TERMS.map((term) => (
                <option key={term} value={term}>
                  {term} years
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="type-label">Pay</span>
            <select value={pay} onChange={(e) => setPay(e.target.value as PayMode)} className={`mt-1 ${field}`}>
              <option value="prepaid">Prepaid</option>
              <option value="billed">Monthly</option>
            </select>
          </label>
          <p className="text-sm sm:col-span-2">
            {pay === "prepaid" ? `${money(termAmount)} prepaid` : `${money(termAmount)}/mo`} for {years} years. After that, {money(plan.continueMonthly)}/mo until they cancel or lock again.
          </p>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => lockRenewal(file.id, years, pay)}>
              Lock term
            </button>
            <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => passRenewal(file.id)}>
              Stay month to month
            </button>
          </div>
        </div>
      ) : null}
      {admin && open ? (
        <div className="border-t border-line pt-3">
          <button
            type="button"
            className="h-10 rounded-md border border-line px-3 text-sm font-semibold"
            onClick={() => setRateOpen((on) => !on)}
          >
            Change the rate
          </button>
          {rateOpen ? (
            <form
              className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                const result = scheduleNotice(file.id, Number(amount), starts);
                setMiss(result === "early" ? `The new rate has to start at least ${NOTICE_DAYS} days from today.` : result === "admin" ? "Only an admin can change the continue rate." : result === "ok" ? "" : "Enter the new monthly rate.");
                if (result === "ok") setRateOpen(false);
              }}
            >
              <label className="block text-sm">
                <span className="type-label">New continue rate</span>
                <input value={amount} inputMode="decimal" onChange={(e) => setAmount(e.target.value)} className={`mt-1 ${field}`} />
              </label>
              <label className="block text-sm">
                <span className="type-label">Starts</span>
                <input type="date" value={starts} min={isoDay(plusDays(new Date(), NOTICE_DAYS))} onChange={(e) => setStarts(e.target.value)} className={`mt-1 ${field}`} />
              </label>
              <button type="submit" className="h-10 self-end rounded-md border border-navy px-3 text-sm font-semibold text-navy">
                Tell them
              </button>
              {miss ? <p className="text-sm text-stop sm:col-span-3">{miss}</p> : null}
            </form>
          ) : null}
        </div>
      ) : null}
    </FileBlock>
  );
}
