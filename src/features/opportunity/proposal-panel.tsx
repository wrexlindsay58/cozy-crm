import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { picksOn } from "./proposal-copy";
import { acceptOption, chargedFee, feeCeiling, financeMonthly, generateProposal, isProductLine, offerPlans, optionRollup, payAmount, payLabel, priceWithFee, sendAgreementEmail, sendCustomerFile, startAgreement, unacceptOption, type Proposal } from "./store";
import { useBrand } from "@/features/brand/store";
import { useOps } from "@/features/ops/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { reportAccess } from "@/features/assessment/figures";
import { placeLine } from "@/lib/place";
import { SignDialog } from "./sign-ceremony";

export function ProposalPanel({ proposal }: { proposal: Proposal }) {
  const navigate = useNavigate();
  const docs = proposal.documents.filter((d) => d.kind === "proposal" || d.kind === "agreement" || d.kind === "report" || d.kind === "packet");
  const [needPay, setNeedPay] = useState(false);
  const [feeHold, setFeeHold] = useState(false);
  const [inPerson, setInPerson] = useState(false);
  useAssessments();
  const brand = useBrand();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const assess = assessmentForLead(proposal.personId);
  const reportOpen =
    !assess ||
    reportAccess({
      occupancy: assess.property.occupancy,
      bothHome: assess.property.bothHome,
      intent: assess.intent,
      homeownerAnswer: lead?.qualify?.["Q-3"],
      ownersAnswer: lead?.qualify?.["Q-2"],
      paid: assess.reportPaid,
      waivedBy: assess.reportWaivedBy,
    }).unlocked;
  const signed = proposal.agreement?.status === "Signed" || proposal.agreements?.some((a) => a.status === "Signed");
  const sold = proposal.options.find((o) => o.id === proposal.accepted);
  const priced = proposal.options.filter((o) => o.lines.length > 0);
  const ready = priced.length > 0 && proposal.payOffers.length > 0;

  function openDoc(doc?: "report" | "packet" | "proposal") {
    if (doc !== "report") {
      const ok = generateProposal(proposal.oppId);
      if (!ok) {
        setNeedPay(true);
        return;
      }
    }
    setNeedPay(false);
    navigate({ to: "/proposal/$oppId", params: { oppId: proposal.oppId }, search: { mode: "present", doc } });
  }

  function send(kind: "report" | "proposal" | "packet") {
    if ((kind === "report" || kind === "packet") && !reportOpen) {
      setFeeHold(true);
      return;
    }
    setFeeHold(false);
    const ok = sendCustomerFile(proposal.oppId, kind, window.location.origin);
    if (!ok) setNeedPay(true);
  }

  return (
    <FileBlock
      title="Proposal"
      hint={sold ? `${sold.name} is the sold option.` : ready ? "Ready to put in front of them." : "Not ready to present."}
      aside={<p className="type-value text-navy">{proposal.proposalStatus}</p>}
    >
      <ul className="space-y-3">
        {proposal.options.map((o) => {
          const on = o.id === proposal.accepted;
          const roll = optionRollup(o);
          const included = o.lines.filter((l) => isProductLine(l) || l.kind === "adder" || l.adder);
          return (
            <li key={o.id} className={cn("rounded-md border p-3", on ? "border-navy bg-info-bg/40 ring-1 ring-navy" : "border-line")}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="type-group">{o.name || "Untitled option"}</p>
                <p className="type-value text-navy">{money(roll.total)}</p>
              </div>
              <p className="type-meta mt-0.5">{on ? "Sold" : proposal.accepted ? "Locked" : "Open"}</p>
              {included.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {included.map((l) => (
                    <li key={l.sku} className="type-body">
                      {l.label}
                      {picksOn(l) ? <span className="type-meta"> {picksOn(l)}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="type-meta mt-2">No products yet.</p>
              )}
              <dl className="mt-3 space-y-1">
                <div className="flex justify-between gap-4">
                  <dt className="type-meta">Discount</dt>
                  <dd className="type-value">{money(roll.discount)}</dd>
                </div>
                {roll.pos ? (
                  <div className="flex justify-between gap-4">
                    <dt className="type-meta">Rebate at sale</dt>
                    <dd className="type-value">{money(roll.pos)}</dd>
                  </div>
                ) : null}
                {roll.after ? (
                  <div className="flex justify-between gap-4">
                    <dt className="type-meta">Rebate after</dt>
                    <dd className="type-value">{money(roll.after)}</dd>
                  </div>
                ) : null}
              </dl>
              {proposal.payOffers.length ? (
                <ul className="mt-3">
                  {proposal.payOffers
                    .filter((offer) => offer.kind !== "finance")
                    .map((offer) => {
                      const shown = payAmount(proposal, roll.total, offer);
                      const added = shown - priceWithFee(roll.total, offer);
                      return (
                        <li key={offer.id} className="flex items-baseline justify-between gap-4 border-t border-line py-1.5">
                          <span className="type-value">{payLabel(offer)}</span>
                          <span className="flex items-baseline gap-4">
                            {proposal.matchHighFee && added > 0 ? <span className="type-meta">Added {money(added)}</span> : null}
                            {proposal.matchHighFee ? null : <span className="type-meta">{chargedFee(offer) ? `${chargedFee(offer)}%` : "No fee"}</span>}
                            <span className="type-value text-navy">{money(shown)}</span>
                          </span>
                        </li>
                      );
                    })}
                  {proposal.payOffers
                    .filter((offer) => offer.kind === "finance")
                    .flatMap((offer) =>
                      offerPlans(offer).map((plan) => {
                        const shown = payAmount(proposal, roll.total, offer, plan);
                        return (
                          <li key={`${offer.id}-${plan.months}-${plan.apr}`} className="flex items-baseline justify-between gap-4 border-t border-line py-1.5">
                            <span className="flex flex-wrap items-baseline gap-x-4">
                              <span className="type-value">{payLabel(offer)}</span>
                              <span className="type-body">{plan.months % 12 === 0 ? `${plan.months / 12} yr` : `${plan.months} mo`}</span>
                              <span className="type-body">{plan.apr}%</span>
                            </span>
                            <span className="flex items-baseline gap-4">
                              {proposal.matchHighFee ? null : <span className="type-meta">{chargedFee(offer, plan)}%</span>}
                              <span className="type-value text-navy">{money(shown)}</span>
                              <span className="type-body">{money(financeMonthly(shown, plan.apr, plan.months))}/mo</span>
                            </span>
                          </li>
                        );
                      }),
                    )}
                </ul>
              ) : null}
              {on ? (
                <button type="button" className="mt-3 h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy" onClick={() => unacceptOption(proposal.oppId)}>
                  Unaccept
                </button>
              ) : proposal.accepted ? null : (
                <button type="button" className="mt-3 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => acceptOption(proposal.oppId, o.id)}>
                  Accept this option
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {proposal.matchHighFee && proposal.payOffers.length ? <p className="type-meta mt-4">Payments matched to the {feeCeiling(proposal)}% fee.</p> : null}

      {!ready ? (
        <ul className="mt-3 space-y-1">
          {priced.length === 0 ? <li className="type-body text-stop">Add a priced line to an option.</li> : null}
          {proposal.payOffers.length === 0 || needPay ? <li className="type-body text-stop">Add cash, card, or financing.</li> : null}
        </ul>
      ) : null}

      {signed ? (
        <p className="type-meta mt-4">The signed agreement is on the Agreement tab.</p>
      ) : proposal.accepted ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => setInPerson(true)}>
            Sign in person
          </button>
          <button
            type="button"
            className="h-10 rounded-md border border-line px-3 text-sm font-semibold"
            onClick={() => {
              if (!lead) return;
              const opt = proposal.options.find((o) => o.id === proposal.accepted);
              if (!opt) return;
              if (!proposal.agreement || proposal.agreement.status === "Void" || proposal.agreement.optionId !== opt.id) {
                startAgreement(proposal.oppId, {
                  optionId: opt.id,
                  paySummary: `${money(optionRollup(opt).total)} on the accepted option`,
                  address: placeLine(lead.address, lead.city, lead.office),
                  customer: lead.name,
                  email: lead.email,
                  company: brand.name,
                  license: brand.license,
                  coSigner: lead.secondaryName ? { name: lead.secondaryName, email: lead.secondaryEmail ?? "" } : undefined,
                });
              }
              sendAgreementEmail(proposal.oppId, window.location.origin);
            }}
          >
            {lead?.secondaryName ? "Email the primary first" : "Email to sign"}
          </button>
          {inPerson ? <SignDialog proposal={proposal} optionId={proposal.accepted} onClose={() => setInPerson(false)} /> : null}
        </div>
      ) : (
        <p className="type-meta mt-4">Accept an option, then sign it in person or from Present.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => openDoc("report")}>
          Report
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => openDoc("proposal")}>
          Proposal
        </button>
        <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => openDoc()}>
          Present both
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => send("report")}>
          Send report
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => send("proposal")}>
          Send proposal
        </button>
        <button type="button" className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy" onClick={() => send("packet")}>
          Send both
        </button>
      </div>
      <p className="type-meta mt-2">The report and the proposal are separate files. Send both attaches them as one.</p>
      {feeHold ? <p className="mt-2 text-sm text-alert">The report is $149 until they qualify, it is paid, or a fee is waived.</p> : null}

      {docs.length ? (
        <ul className="mt-4 divide-y divide-line">
          {docs.map((d) => (
            <li key={d.id}>
              {d.fileUrl ? (
                <a href={d.fileUrl} download={d.fileName ?? "agreement.html"} className="flex w-full items-center justify-between gap-3 py-3 text-left">
                  <span>
                    <span className="type-value">Agreement {d.id}</span>
                    <span className="type-meta mt-0.5 block">{d.status} · Download</span>
                  </span>
                </a>
              ) : (
                <button type="button" className="flex w-full items-center justify-between gap-3 py-3 text-left" onClick={() => openDoc(d.kind === "report" ? "report" : d.kind === "packet" ? "packet" : "proposal")}>
                  <span>
                    <span className="type-value">{d.kind === "agreement" ? "Agreement" : d.kind === "report" ? "Assessment report" : d.kind === "packet" ? "Report and proposal" : "Proposal"} {d.id}</span>
                    <span className="type-meta mt-0.5 block">{d.status}</span>
                  </span>
                  <span className="type-meta">{d.totals?.map((t) => money(t.amount)).join("  ") || ""}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </FileBlock>
  );
}