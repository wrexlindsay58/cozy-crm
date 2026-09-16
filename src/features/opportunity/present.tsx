import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useCatalog } from "@/features/catalog/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { useAssessCategories } from "@/features/assessment/categories";
import { useOps } from "@/features/ops/store";
import { money } from "@/lib/crm-data";
import { placeLine } from "@/lib/place";
import { acceptOption, applyGoodLeap, demoMonthly, optionTotal, requestDeposit, sendToSign, type PayKind, type Proposal } from "./store";
import { BRAND } from "./brand";
import { picksOn, scopeLines, TERM_LABEL } from "./proposal-copy";
import { cn } from "@/lib/cn";

const STEPS = ["cover", "find", "options", "pay", "sign", "done"] as const;
type Step = (typeof STEPS)[number];

export function Present({ proposal }: { proposal: Proposal }) {
  useCatalog();
  useAssessments();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const assess = assessmentForLead(proposal.personId);
  const cats = useAssessCategories();
  const [step, setStep] = useState<Step>("cover");
  const [picked, setPicked] = useState(proposal.accepted ?? proposal.options[0]?.id ?? "");
  const [pay, setPay] = useState<PayKind>(proposal.payOffers[0]?.kind ?? "cash");
  const [term, setTerm] = useState(proposal.payOffers.find((o) => o.kind === "finance")?.terms[0] ?? 120);
  const [name, setName] = useState(lead?.name ?? "");
  const opt = proposal.options.find((o) => o.id === picked) ?? proposal.options[0];
  const total = opt ? optionTotal(opt) : 0;
  const i = STEPS.indexOf(step);

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

  return (
    <div className="min-h-dvh bg-[#f3eee4] text-ink">
      {step !== "cover" ? (
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#ddd4c4] bg-[#f3eee4]/95 px-4 py-3 backdrop-blur md:px-8">
          <button type="button" className="grid size-11 place-items-center text-muted" aria-label="Back" onClick={() => go(STEPS[Math.max(0, i - 1)])}>
            <ChevronLeft className="size-5" />
          </button>
          <p className="text-[11px] font-bold tracking-[0.2em] text-navy uppercase">{BRAND.name}</p>
          <p className="w-11 text-right text-[11px] font-semibold tabular-nums text-muted">{i}/{STEPS.length - 1}</p>
        </header>
      ) : null}

      {step === "cover" ? (
        <section className="flex min-h-dvh flex-col justify-between bg-navy px-6 py-10 text-card md:px-16 md:py-16">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase">{BRAND.license} · {BRAND.city}</p>
          <div className="max-w-3xl">
            <p className="text-sm tracking-wide text-card/70">{BRAND.line}</p>
            <h1 className="mt-4 text-4xl font-medium leading-[1.05] md:text-6xl" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
              A plan for {lead?.address ?? "this house"}.
            </h1>
            <p className="mt-5 text-lg text-card/80">{lead?.name}</p>
            <p className="mt-1 text-sm text-card/60">{lead ? placeLine(lead.address, lead.city, lead.office) : ""}</p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-sm text-card/60">
              {proposal.closer} · {BRAND.phone}
            </p>
            <button type="button" className="h-12 rounded-sm bg-card px-6 text-sm font-semibold text-navy" onClick={() => go("find")}>
              Open the plan
            </button>
          </div>
        </section>
      ) : null}

      {step === "find" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
          <p className="text-[11px] font-bold tracking-[0.2em] text-navy uppercase">What we found</p>
          <h2 className="mt-3 text-4xl font-medium leading-tight md:text-5xl" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
            The house is telling us a story.
          </h2>
          {assess?.property.notes ? <p className="mt-4 text-lg text-muted">{assess.property.notes}</p> : null}
          <p className="mt-3 text-sm text-muted">
            {assess?.property.yearBuilt ? `${assess.property.yearBuilt} · ` : ""}
            {assess?.property.sqft ? `${assess.property.sqft} sq ft` : ""}
            {assess?.property.hoa ? ` · HOA ${assess.property.hoa}` : ""}
          </p>
          <ul className="mt-10 space-y-6">
            {(assess?.packets ?? [])
              .filter((p) => Object.keys(p.fields).length || p.notes)
              .map((p) => (
                <li key={p.id} className="border-t border-[#ddd4c4] pt-5">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-navy uppercase">{cats.find((c) => c.id === p.id)?.label ?? p.id}</p>
                  <p className="mt-2 text-xl" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
                    {Object.entries(p.fields)
                      .filter(([, v]) => v)
                      .map(([, v]) => v)
                      .join(" · ") || p.notes}
                  </p>
                  {p.notes ? <p className="mt-2 text-sm text-muted">{p.notes}</p> : null}
                </li>
              ))}
          </ul>
          <button type="button" className="mt-12 h-12 rounded-sm bg-navy px-6 text-sm font-semibold text-card" onClick={() => go("options")}>
            See the options
          </button>
        </section>
      ) : null}

      {step === "options" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
          <p className="text-[11px] font-bold tracking-[0.2em] text-navy uppercase">Choose a path</p>
          <h2 className="mt-3 text-4xl font-medium leading-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
            Three ways to fix it. Pick one.
          </h2>
          <ul className="mt-10 space-y-4">
            {proposal.options.map((o) => {
              const on = picked === o.id;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(o.id)}
                    className={cn("w-full rounded-sm border px-5 py-5 text-left", on ? "border-navy bg-navy text-card" : "border-[#ddd4c4] bg-[#faf7f0]")}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-2xl font-medium" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
                        {o.name}
                      </span>
                      <span className="text-2xl font-extrabold tabular-nums">{money(optionTotal(o))}</span>
                    </div>
                    <ul className={cn("mt-3 space-y-1 text-sm", on ? "text-card/80" : "text-muted")}>
                      {o.lines
                        .filter((l) => l.kind !== "discount")
                        .map((l) => (
                          <li key={l.sku}>
                            {l.label}
                            {picksOn(l) ? ` · ${picksOn(l)}` : ""}
                          </li>
                        ))}
                    </ul>
                    <p className={cn("mt-3 text-sm", on ? "text-card/70" : "text-muted")}>We will {scopeLines(o).join("; ").toLowerCase()}.</p>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" disabled={!picked} className="mt-10 h-12 rounded-sm bg-navy px-6 text-sm font-semibold text-card disabled:opacity-40" onClick={() => go("pay")}>
            Continue with {opt?.name}
          </button>
        </section>
      ) : null}

      {step === "pay" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
          <p className="text-[11px] font-bold tracking-[0.2em] text-navy uppercase">{opt?.name} · {money(total)}</p>
          <h2 className="mt-3 text-4xl font-medium leading-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
            How do you want to pay?
          </h2>
          <div className="mt-10 grid gap-3">
            {(["cash", "card", "finance"] as PayKind[]).map((k) => {
              const offer = proposal.payOffers.find((o) => o.kind === k);
              const label = k === "cash" ? "Cash" : k === "card" ? "Credit card" : "Financing";
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPay(k)}
                  className={cn("rounded-sm border px-5 py-4 text-left", pay === k ? "border-navy bg-navy text-card" : "border-[#ddd4c4] bg-[#faf7f0]")}
                >
                  <p className="text-lg font-semibold">{label}</p>
                  {k !== "finance" ? <p className="mt-1 text-2xl font-extrabold tabular-nums">{money(total)}</p> : null}
                  {k === "finance" ? (
                    <p className="mt-1 text-sm opacity-80">{offer?.financer ?? "GoodLeap"} · pick a term next</p>
                  ) : null}
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
                  className={cn("h-12 rounded-sm px-4 text-sm font-semibold", term === m ? "bg-navy text-card" : "border border-[#ddd4c4] bg-[#faf7f0]")}
                >
                  {TERM_LABEL[m]} · {money(demoMonthly(total, m))}/mo
                </button>
              ))}
            </div>
          ) : null}
          <button type="button" className="mt-10 h-12 rounded-sm bg-navy px-6 text-sm font-semibold text-card" onClick={() => go("sign")}>
            Review and sign
          </button>
        </section>
      ) : null}

      {step === "sign" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
          <p className="text-[11px] font-bold tracking-[0.2em] text-navy uppercase">Agreement</p>
          <h2 className="mt-3 text-4xl font-medium leading-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
            Lock it in.
          </h2>
          <div className="mt-8 rounded-sm border border-[#ddd4c4] bg-[#faf7f0] p-5">
            <p className="text-sm text-muted">Scope</p>
            <p className="mt-1 text-lg" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
              {opt?.name} · {money(total)}
            </p>
            <p className="mt-2 text-sm text-muted">We will {opt ? scopeLines(opt).join("; ").toLowerCase() : ""}.</p>
            <p className="mt-4 text-sm">
              Pay: {pay === "cash" ? "Cash" : pay === "card" ? "Credit card" : `Financing · ${TERM_LABEL[term]} · ${money(demoMonthly(total, term))}/mo`}
            </p>
          </div>
          <label className="mt-6 block text-[11px] font-bold tracking-wide text-muted uppercase">
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-12 w-full rounded-sm border border-[#ddd4c4] bg-card px-3 text-base text-ink outline-none focus:border-navy" />
          </label>
          <p className="mt-4 text-sm text-muted">
            By signing, {name || "you"} authorize {BRAND.name} ({BRAND.license}) to perform the scope above at {lead?.address}. Work starts after this signature and a deposit or financing approval.
          </p>
          <button type="button" disabled={name.trim().length < 3} className="mt-8 h-12 w-full rounded-sm bg-navy text-sm font-semibold text-card disabled:opacity-40" onClick={sign}>
            Sign agreement
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            {pay === "finance" ? (
              <button type="button" className="h-12 flex-1 rounded-sm border border-navy px-4 text-sm font-semibold text-navy" onClick={() => applyGoodLeap(proposal.oppId)}>
                Apply for financing
              </button>
            ) : (
              <button type="button" className="h-12 flex-1 rounded-sm border border-navy px-4 text-sm font-semibold text-navy" onClick={() => requestDeposit(proposal.oppId)}>
                Put a deposit on the card
              </button>
            )}
          </div>
        </section>
      ) : null}

      {step === "done" ? (
        <section className="flex min-h-[80dvh] flex-col justify-center px-6 py-16 md:px-16">
          <p className="text-[11px] font-bold tracking-[0.2em] text-navy uppercase">You’re in</p>
          <h2 className="mt-3 max-w-2xl text-5xl font-medium leading-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
            We’ll take it from here.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-muted">
            {opt?.name} is on the book. {pay === "finance" ? "Financing is in. " : "Deposit is next. "}
            {proposal.closer} will confirm the install date.
          </p>
          <p className="mt-8 text-sm text-muted">
            {BRAND.name} · {BRAND.phone} · {BRAND.email}
          </p>
        </section>
      ) : null}
    </div>
  );
}
