import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Link2, Printer, X } from "lucide-react";
import { useCatalog } from "@/features/catalog/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { useAssessCategories } from "@/features/assessment/categories";
import { useOps } from "@/features/ops/store";
import { brandVars, useBrand } from "@/features/brand/store";
import { money } from "@/lib/crm-data";
import { placeLine } from "@/lib/place";
import { acceptOption, applyGoodLeap, demoMonthly, optionTotal, requestDeposit, sendProposal, sendToSign, type PayKind, type Proposal } from "./store";
import { HouseMark } from "./house-mark";
import { PresentOption } from "./present-option";
import { scopeLines, TERM_LABEL } from "./proposal-copy";
import { cn } from "@/lib/cn";

const STEPS = ["cover", "find", "options", "pay", "sign", "done"] as const;
type Step = (typeof STEPS)[number];

export function Present({ proposal }: { proposal: Proposal }) {
  useCatalog();
  useAssessments();
  const brand = useBrand();
  const navigate = useNavigate();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const assess = assessmentForLead(proposal.personId);
  const cats = useAssessCategories();
  const [step, setStep] = useState<Step>("cover");
  const [picked, setPicked] = useState(proposal.accepted ?? proposal.options[0]?.id ?? "");
  const [pay, setPay] = useState<PayKind>(proposal.payOffers[0]?.kind ?? "cash");
  const [term, setTerm] = useState(proposal.payOffers.find((o) => o.kind === "finance")?.terms[0] ?? 120);
  const [name, setName] = useState(lead?.name ?? "");
  const [copied, setCopied] = useState("");
  const opt = proposal.options.find((o) => o.id === picked) ?? proposal.options[0];
  const total = opt ? optionTotal(opt) : 0;
  const i = STEPS.indexOf(step);
  const fileTo = { to: "/opportunities/$oppId" as const, params: { oppId: proposal.oppId } };

  function go(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function sign() {
    if (!opt) return;
    acceptOption(proposal.oppId, opt.id);
    sendToSign(proposal.oppId);
    if (pay === "finance") applyGoodLeap(proposal.oppId);
    if (pay === "card" || pay === "cash") requestDeposit(proposal.oppId);
    go("done");
  }

  async function copyLink() {
    const url = `${window.location.origin}/proposal/${proposal.oppId}`;
    await navigator.clipboard.writeText(url);
    sendProposal(proposal.oppId);
    setCopied("Link copied");
    setTimeout(() => setCopied(""), 2000);
  }

  function pdf() {
    window.print();
  }

  return (
    <div className="present-root min-h-dvh" style={brandVars(brand)}>
      <style>{`
        .present-root { --p-red: ${brand.red}; --p-navy: ${brand.navy}; --p-black: ${brand.black}; }
        .p-head { font-family: var(--p-head); letter-spacing: 0.02em; line-height: 0.95; text-transform: uppercase; }
        .p-sub { font-family: var(--p-sub); letter-spacing: 0.18em; text-transform: uppercase; font-weight: 500; }
        @media print {
          .no-print { display: none !important; }
          .present-root { background: white !important; }
          .print-break { break-inside: avoid; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-black/10 bg-[var(--p-black)] px-3 py-2 text-white md:px-6">
        <button type="button" className="grid size-11 place-items-center" aria-label="Close proposal" onClick={() => navigate(fileTo)}>
          <X className="size-5" />
        </button>
        {step !== "cover" ? (
          <button type="button" className="grid size-11 place-items-center" aria-label="Back" onClick={() => go(STEPS[Math.max(0, i - 1)])}>
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        <img src={brand.logo} alt={brand.name} className="ml-1 h-8 w-auto" />
        <span className="ml-auto" />
        <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider" onClick={copyLink}>
          <Link2 className="size-4" />
          {copied || "Link"}
        </button>
        <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider" onClick={pdf}>
          <Printer className="size-4" />
          PDF
        </button>
      </div>

      {step === "cover" ? (
        <section className="relative flex min-h-[calc(100dvh-56px)] flex-col justify-between overflow-hidden bg-[var(--p-black)] px-6 py-10 text-white md:px-16 md:py-16 print-break">
          <HouseMark className="pointer-events-none absolute -right-8 -top-8 w-[55%] max-w-xl opacity-20" color={brand.red} />
          <div className="relative">
            <img src={brand.logo} alt={brand.name} className="h-16 w-auto md:h-20" />
            <p className="p-sub mt-6 text-[11px] text-white/60">
              {brand.license} · {brand.city}
            </p>
          </div>
          <div className="relative max-w-3xl">
            <div className="mb-5 h-1.5 w-24 bg-[var(--p-red)]" />
            <h1 className="p-head text-5xl md:text-7xl">A plan for {lead?.address ?? "this house"}</h1>
            <p className="p-sub mt-6 text-sm text-white/70">{lead?.name}</p>
            <p className="mt-2 text-base text-white/55">{lead ? placeLine(lead.address, lead.city, lead.office) : ""}</p>
          </div>
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <p className="p-sub text-[11px] text-white/50">
              {proposal.closer} · {brand.phone}
            </p>
            <button type="button" className="h-12 bg-[var(--p-red)] px-7 text-sm font-semibold text-white" onClick={() => go("find")}>
              Open the plan
            </button>
          </div>
        </section>
      ) : null}

      {step === "find" ? (
        <section className="relative mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <HouseMark className="pointer-events-none absolute right-0 top-8 w-40 opacity-10" color={brand.red} />
          <p className="p-sub text-[11px] text-[var(--p-red)]">What we found</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)] md:text-6xl">The house is talking.</h2>
          {assess?.property.notes ? <p className="mt-5 text-lg text-[var(--p-gray)]">{assess.property.notes}</p> : null}
          <p className="mt-3 text-sm text-[var(--p-gray)]">
            {assess?.property.yearBuilt ? `${assess.property.yearBuilt} · ` : ""}
            {assess?.property.sqft ? `${assess.property.sqft} sq ft` : ""}
            {assess?.property.hoa ? ` · HOA ${assess.property.hoa}` : ""}
          </p>
          <ul className="mt-10 space-y-0">
            {(assess?.packets ?? [])
              .filter((p) => Object.keys(p.fields).length || p.notes)
              .map((p) => (
                <li key={p.id} className="flex gap-4 border-t-2 border-[var(--p-red)] py-5">
                  <HouseMark className="mt-1 size-8 shrink-0" color={brand.red} />
                  <div>
                    <p className="p-sub text-[11px] text-[var(--p-navy)]">{cats.find((c) => c.id === p.id)?.label ?? p.id}</p>
                    <p className="p-head mt-1 text-3xl text-[var(--p-navy)]">
                      {Object.entries(p.fields)
                        .filter(([, v]) => v)
                        .map(([, v]) => v)
                        .join(" · ") || p.notes}
                    </p>
                    {p.notes ? <p className="mt-2 text-sm text-[var(--p-gray)]">{p.notes}</p> : null}
                  </div>
                </li>
              ))}
          </ul>
          <button type="button" className="mt-10 h-12 bg-[var(--p-red)] px-7 text-sm font-semibold text-white" onClick={() => go("options")}>
            See the options
          </button>
        </section>
      ) : null}

      {step === "options" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px] text-[var(--p-red)]">Proposal options</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">Pick a path. Edit it here.</h2>
          <p className="mt-3 text-sm text-[var(--p-gray)]">Tap an option to select it. Change the mix, the name, the subs. What you see is what they sign.</p>
          <div className="mt-8 space-y-4">
            {proposal.options.map((o) => (
              <PresentOption key={o.id} proposal={proposal} option={o} selected={picked === o.id} onPick={() => setPicked(o.id)} />
            ))}
          </div>
          <button type="button" disabled={!picked} className="mt-10 h-12 bg-[var(--p-red)] px-7 text-sm font-semibold text-white disabled:opacity-40" onClick={() => go("pay")}>
            Continue with {opt?.name}
          </button>
        </section>
      ) : null}

      {step === "pay" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px] text-[var(--p-red)]">
            {opt?.name} · {money(total)}
          </p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">How do you want to pay?</h2>
          <div className="mt-10 grid gap-3">
            {(["cash", "card", "finance"] as PayKind[]).map((k) => {
              const offer = proposal.payOffers.find((o) => o.kind === k);
              const label = k === "cash" ? "Cash" : k === "card" ? "Credit card" : "Financing";
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPay(k)}
                  className={cn("border-2 px-5 py-4 text-left", pay === k ? "border-[var(--p-red)] bg-[var(--p-black)] text-white" : "border-black/10 bg-white")}
                >
                  <p className="p-sub text-[11px]">{label}</p>
                  {k !== "finance" ? (
                    <p className="p-head mt-1 text-4xl">{money(total)}</p>
                  ) : (
                    <p className="mt-1 text-sm opacity-80">{offer?.financer ?? "GoodLeap"}</p>
                  )}
                </button>
              );
            })}
          </div>
          {pay === "finance" ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {(proposal.payOffers.find((o) => o.kind === "finance")?.terms.length
                ? proposal.payOffers.find((o) => o.kind === "finance")!.terms
                : [60, 120, 144, 180]
              ).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTerm(m)}
                  className={cn("h-12 px-4 text-sm font-semibold", term === m ? "bg-[var(--p-red)] text-white" : "border border-black/15")}
                >
                  {TERM_LABEL[m]} · {money(demoMonthly(total, m))}/mo
                </button>
              ))}
            </div>
          ) : null}
          <button type="button" className="mt-10 h-12 bg-[var(--p-red)] px-7 text-sm font-semibold text-white" onClick={() => go("sign")}>
            Review and sign
          </button>
        </section>
      ) : null}

      {step === "sign" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px] text-[var(--p-red)]">Agreement</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">Lock it in.</h2>
          <div className="mt-8 border-l-4 border-[var(--p-red)] bg-black/[0.03] p-5">
            <p className="p-sub text-[11px] text-[var(--p-gray)]">Scope</p>
            <p className="p-head mt-1 text-3xl text-[var(--p-navy)]">
              {opt?.name} · {money(total)}
            </p>
            <p className="mt-2 text-sm text-[var(--p-gray)]">We will {opt ? scopeLines(opt).join("; ").toLowerCase() : ""}.</p>
            <p className="mt-4 text-sm">
              Pay: {pay === "cash" ? "Cash" : pay === "card" ? "Credit card" : `Financing · ${TERM_LABEL[term]} · ${money(demoMonthly(total, term))}/mo`}
            </p>
          </div>
          <label className="mt-6 block text-[11px] font-bold tracking-wide uppercase text-[var(--p-gray)]">
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-12 w-full border border-black/15 bg-white px-3 text-base outline-none focus:border-[var(--p-red)]" />
          </label>
          <p className="mt-4 text-sm text-[var(--p-gray)]">
            By signing, {name || "you"} authorize {brand.name} ({brand.license}) to perform the scope above at {lead?.address}. Work starts after this signature and a deposit or financing approval.
          </p>
          <button type="button" disabled={name.trim().length < 3} className="mt-8 h-12 w-full bg-[var(--p-red)] text-sm font-semibold text-white disabled:opacity-40" onClick={sign}>
            Sign agreement
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            {pay === "finance" ? (
              <button type="button" className="h-12 flex-1 border-2 border-[var(--p-navy)] px-4 text-sm font-semibold text-[var(--p-navy)]" onClick={() => applyGoodLeap(proposal.oppId)}>
                Apply for financing
              </button>
            ) : (
              <button type="button" className="h-12 flex-1 border-2 border-[var(--p-navy)] px-4 text-sm font-semibold text-[var(--p-navy)]" onClick={() => requestDeposit(proposal.oppId)}>
                Put a deposit on the card
              </button>
            )}
          </div>
        </section>
      ) : null}

      {step === "done" ? (
        <section className="relative flex min-h-[80dvh] flex-col justify-center overflow-hidden bg-[var(--p-black)] px-6 py-16 text-white md:px-16">
          <HouseMark className="pointer-events-none absolute -right-10 bottom-0 w-[40%] opacity-20" color={brand.red} />
          <p className="p-sub text-[11px] text-[var(--p-red)]">You’re in</p>
          <h2 className="p-head relative mt-3 max-w-2xl text-6xl">We’ll take it from here.</h2>
          <p className="relative mt-5 max-w-lg text-lg text-white/70">
            {opt?.name} is on the book. {pay === "finance" ? "Financing is in. " : "Deposit is next. "}
            {proposal.closer} will confirm the install date.
          </p>
          <p className="p-sub relative mt-10 text-[11px] text-white/50">
            {brand.name} · {brand.phone} · {brand.email}
          </p>
          <button type="button" className="no-print relative mt-8 h-12 w-fit bg-[var(--p-red)] px-7 text-sm font-semibold" onClick={() => navigate(fileTo)}>
            Back to the file
          </button>
        </section>
      ) : null}
    </div>
  );
}
