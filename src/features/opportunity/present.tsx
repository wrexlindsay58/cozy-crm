import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Link2, Printer, X } from "lucide-react";
import { CozyHouse, CozyWordmark } from "@/components/cozy-mark";
import { useCatalog } from "@/features/catalog/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { useAssessCategories } from "@/features/assessment/categories";
import { useOps } from "@/features/ops/store";
import { usePhotos } from "@/features/photos/store";
import { brandVars, useBrand } from "@/features/brand/store";
import { money } from "@/lib/crm-data";
import { cityState, placeLine } from "@/lib/place";
import { interestsLabel, inferInterests } from "@/features/lead/interests";
import { acceptOption, applyGoodLeap, demoMonthly, lineAmount, optionTotal, requestDeposit, sendProposal, sendToSign, type PayKind, type Proposal } from "./store";
import { PresentOption } from "./present-option";
import { picksOn, scopeLines, TERM_LABEL } from "./proposal-copy";
import { cn } from "@/lib/cn";

const STEPS = ["cover", "house", "find", "options", "pay", "sign", "done"] as const;
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
  const photos = usePhotos(proposal.personId);
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
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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

  return (
    <div className="present-root min-h-dvh" style={brandVars(brand)}>
      <style>{`
        .p-head { font-family: var(--p-head); letter-spacing: 0.02em; line-height: 0.95; text-transform: uppercase; }
        .p-sub { font-family: var(--p-sub); letter-spacing: 0.18em; text-transform: uppercase; font-weight: 500; }
        @media print {
          .no-print { display: none !important; }
          .present-root { background: white !important; }
          .print-break { break-inside: avoid; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-20 flex items-center gap-2 bg-[var(--p-navy)] px-3 py-2 text-white md:px-6">
        <button type="button" className="grid size-11 place-items-center" aria-label="Close proposal" onClick={() => navigate(fileTo)}>
          <X className="size-5" />
        </button>
        {step !== "cover" ? (
          <button type="button" className="grid size-11 place-items-center" aria-label="Back" onClick={() => go(STEPS[Math.max(0, i - 1)])}>
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        <CozyWordmark className="ml-1 h-8 w-40" house={brand.red} word="#FFFFFF" />
        <span className="ml-auto" />
        <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider" onClick={copyLink}>
          <Link2 className="size-4" />
          {copied || "Link"}
        </button>
        <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider" onClick={() => window.print()}>
          <Printer className="size-4" />
          PDF
        </button>
      </div>

      {step === "cover" ? (
        <section className="relative flex min-h-[calc(100dvh-56px)] flex-col justify-between overflow-hidden bg-[var(--p-navy)] px-6 py-10 text-white md:px-16 md:py-16 print-break">
          <CozyHouse className="pointer-events-none absolute -right-16 -top-8 w-[58%] max-w-xl opacity-25" color={brand.red} />
          <div className="relative">
            <CozyWordmark className="h-16 w-72 md:h-20 md:w-96" house={brand.red} word="#FFFFFF" />
            <p className="p-sub mt-4 text-[11px] text-white/70">{brand.tagline}</p>
            <p className="p-sub mt-2 text-[11px] text-white/50">
              {brand.license} · {brand.city}
            </p>
          </div>
          <div className="relative max-w-3xl">
            <div className="mb-5 h-1.5 w-24 bg-[var(--p-red)]" />
            <h1 className="p-head text-5xl md:text-7xl">A plan for {lead?.address ?? "this house"}</h1>
            <p className="p-sub mt-6 text-sm text-white/75">{lead?.name}</p>
            <p className="mt-2 text-base text-white/60">{lead ? placeLine(lead.address, lead.city, lead.office) : ""}</p>
            <p className="mt-4 text-sm text-white/55">
              Prepared {today} by {proposal.closer}. Good for 14 days.
            </p>
          </div>
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <p className="p-sub text-[11px] text-white/50">
              {brand.phone} · {brand.email}
            </p>
            <button type="button" className="h-12 bg-[var(--p-red)] px-7 text-sm font-semibold text-white" onClick={() => go("house")}>
              Open the plan
            </button>
          </div>
        </section>
      ) : null}

      {step === "house" ? (
        <section className="relative mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <CozyHouse className="pointer-events-none absolute right-4 top-6 w-36 opacity-10" color={brand.red} />
          <p className="p-sub text-[11px] text-[var(--p-red)]">The house</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">{lead?.name}</h2>
          <p className="mt-3 text-lg text-[var(--p-gray)]">{lead ? placeLine(lead.address, lead.city, lead.office) : ""}</p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <Fact k="Phone" v={lead?.phone} />
            <Fact k="Email" v={lead?.email} />
            {lead?.secondaryName ? <Fact k="Second" v={`${lead.secondaryName}${lead.secondaryPhone ? ` · ${lead.secondaryPhone}` : ""}`} /> : null}
            <Fact k="Source" v={lead?.source} />
            <Fact k="Interests" v={lead ? interestsLabel(lead.interests ?? inferInterests(lead.product), lead.otherInterest) : ""} />
            <Fact k="Closer" v={proposal.closer} />
            <Fact k="File" v={`${proposal.oppId} · ${lead?.id ?? ""}`} />
          </dl>
          {lead?.notes ? (
            <div className="mt-8 border-l-4 border-[var(--p-red)] pl-4">
              <p className="p-sub text-[11px] text-[var(--p-red)]">On the file</p>
              <p className="mt-2 text-base">{lead.notes}</p>
            </div>
          ) : null}
          <button type="button" className="mt-10 h-12 bg-[var(--p-red)] px-7 text-sm font-semibold text-white" onClick={() => go("find")}>
            What we found
          </button>
        </section>
      ) : null}

      {step === "find" ? (
        <section className="relative mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px] text-[var(--p-red)]">What we found</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">The house is talking.</h2>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {assess?.property.yearBuilt ? <Stat n={assess.property.yearBuilt} l="Built" /> : null}
            {assess?.property.sqft ? <Stat n={assess.property.sqft} l="Sq ft" /> : null}
            {assess?.property.stories ? <Stat n={assess.property.stories} l="Stories" /> : null}
            {assess?.property.hoa ? <Stat n={assess.property.hoa} l="HOA" /> : null}
            {assess?.property.occupancy ? <Stat n={assess.property.occupancy} l="Occupancy" /> : null}
            {assess?.property.electrical ? <Stat n={assess.property.electrical} l="Electrical" /> : null}
          </div>
          {assess?.property.notes ? <p className="mt-6 text-lg">{assess.property.notes}</p> : null}
          {assess?.property.access ? <p className="mt-2 text-sm text-[var(--p-gray)]">Access: {assess.property.access}</p> : null}
          <ul className="mt-10 space-y-0">
            {(assess?.packets ?? [])
              .filter((p) => Object.keys(p.fields).length || p.notes || p.photos.length)
              .map((p) => (
                <li key={p.id} className="border-t-2 border-[var(--p-red)] py-6">
                  <div className="flex gap-4">
                    <CozyHouse className="mt-1 size-10 shrink-0" color={brand.red} />
                    <div className="min-w-0 flex-1">
                      <p className="p-sub text-[11px] text-[var(--p-navy)]">{cats.find((c) => c.id === p.id)?.label ?? p.id}</p>
                      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                        {Object.entries(p.fields)
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <Fact key={k} k={k} v={v} />
                          ))}
                      </dl>
                      {p.notes ? <p className="mt-3 text-sm">{p.notes}</p> : null}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
          {photos.length ? (
            <div className="mt-8">
              <p className="p-sub text-[11px] text-[var(--p-red)]">From the walk</p>
              <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                {photos.map((ph) => (
                  <li key={ph.id} className="overflow-hidden bg-[var(--p-navy)]/5">
                    {ph.src ? <img src={ph.src} alt={ph.caption} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] grid place-items-center text-xs text-[var(--p-gray)]">{ph.caption}</div>}
                    <p className="px-2 py-1.5 text-[11px] text-[var(--p-gray)]">{ph.caption}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
          <div className="mt-6 overflow-x-auto border border-[var(--p-navy)]/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--p-navy)] text-left text-white">
                  <th className="p-sub px-3 py-2 text-[10px] font-medium">Option</th>
                  <th className="p-sub px-3 py-2 text-[10px] font-medium">What’s in it</th>
                  <th className="p-sub px-3 py-2 text-right text-[10px] font-medium">Investment</th>
                </tr>
              </thead>
              <tbody>
                {proposal.options.map((o) => (
                  <tr key={o.id} className={picked === o.id ? "bg-[var(--p-red)]/8" : "border-t border-[var(--p-navy)]/10"}>
                    <td className="px-3 py-3 font-semibold">{o.name}</td>
                    <td className="px-3 py-3 text-[var(--p-gray)]">
                      {o.lines
                        .filter((l) => l.kind !== "discount")
                        .map((l) => `${l.label}${picksOn(l) ? ` (${picksOn(l)})` : ""}`)
                        .join(" · ")}
                    </td>
                    <td className="px-3 py-3 text-right font-extrabold tabular-nums">{money(optionTotal(o))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <p className="mt-3 text-sm text-[var(--p-gray)]">Every option priced. Cash and card are the number. Financing shows the monthly.</p>
          <div className="mt-8 overflow-x-auto border border-[var(--p-navy)]/15">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="bg-[var(--p-navy)] text-white">
                  <th className="p-sub px-3 py-2 text-left text-[10px] font-medium">Option</th>
                  <th className="p-sub px-3 py-2 text-right text-[10px] font-medium">Cash / card</th>
                  {[120, 144, 180].map((m) => (
                    <th key={m} className="p-sub px-3 py-2 text-right text-[10px] font-medium">
                      {TERM_LABEL[m]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposal.options.map((o) => (
                  <tr key={o.id} className={picked === o.id ? "bg-[var(--p-red)]/8 font-semibold" : "border-t border-[var(--p-navy)]/10"}>
                    <td className="px-3 py-3">{o.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{money(optionTotal(o))}</td>
                    {[120, 144, 180].map((m) => (
                      <td key={m} className="px-3 py-3 text-right tabular-nums">
                        {money(demoMonthly(optionTotal(o), m))}/mo
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 grid gap-3">
            {(["cash", "card", "finance"] as PayKind[]).map((k) => {
              const offer = proposal.payOffers.find((o) => o.kind === k);
              const label = k === "cash" ? "Cash" : k === "card" ? "Credit card" : "Financing";
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPay(k)}
                  className={cn("border-2 px-5 py-4 text-left", pay === k ? "border-[var(--p-red)] bg-[var(--p-navy)] text-white" : "border-[var(--p-navy)]/15 bg-white")}
                >
                  <p className="p-sub text-[11px]">{label}</p>
                  {k !== "finance" ? <p className="p-head mt-1 text-4xl">{money(total)}</p> : <p className="mt-1 text-sm opacity-80">{offer?.financer ?? "GoodLeap"}</p>}
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
                  className={cn("h-12 px-4 text-sm font-semibold", term === m ? "bg-[var(--p-red)] text-white" : "border border-[var(--p-navy)]/20")}
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
          <div className="mt-8 border-l-4 border-[var(--p-red)] bg-[var(--p-navy)]/5 p-5">
            <p className="p-sub text-[11px] text-[var(--p-gray)]">Scope</p>
            <p className="p-head mt-1 text-3xl text-[var(--p-navy)]">
              {opt?.name} · {money(total)}
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {opt?.lines
                .filter((l) => l.kind !== "discount")
                .map((l) => (
                  <li key={l.sku}>
                    {l.label}
                    {picksOn(l) ? ` · ${picksOn(l)}` : ""}
                    {l.qty > 1 ? ` × ${l.qty}` : ""} — {money(lineAmount(l) || l.unit * l.qty)}
                  </li>
                ))}
            </ul>
            <p className="mt-3 text-sm text-[var(--p-gray)]">We will {opt ? scopeLines(opt).join("; ").toLowerCase() : ""}.</p>
            <p className="mt-4 text-sm">
              Pay: {pay === "cash" ? `Cash ${money(total)}` : pay === "card" ? `Credit card ${money(total)}` : `Financing · ${TERM_LABEL[term]} · ${money(demoMonthly(total, term))}/mo`}
            </p>
          </div>
          <ol className="mt-8 list-decimal space-y-2 pl-5 text-sm">
            <li>Sign this agreement.</li>
            <li>{pay === "finance" ? "Apply for financing." : "Put a deposit on the card to hold the date."}</li>
            <li>We confirm the install and send the crew the scope and photos.</li>
            <li>Work starts after sign and deposit or financing approval. This proposal is good 14 days from {today}.</li>
          </ol>
          <label className="mt-6 block text-[11px] font-bold tracking-wide uppercase text-[var(--p-gray)]">
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-12 w-full border border-[var(--p-navy)]/20 bg-white px-3 text-base outline-none focus:border-[var(--p-red)]" />
          </label>
          <p className="mt-4 text-sm text-[var(--p-gray)]">
            By signing, {name || "you"} authorize {brand.name} ({brand.license}) to perform the scope above at {lead?.address}
            {lead ? `, ${cityState(lead.city, lead.office)}` : ""}.
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
        <section className="relative flex min-h-[80dvh] flex-col justify-center overflow-hidden bg-[var(--p-navy)] px-6 py-16 text-white md:px-16">
          <CozyHouse className="pointer-events-none absolute -right-10 bottom-0 w-[42%] opacity-25" color={brand.red} />
          <CozyWordmark className="relative h-12 w-56" house={brand.red} word="#FFFFFF" />
          <p className="p-sub relative mt-8 text-[11px] text-[var(--p-red)]">You’re in</p>
          <h2 className="p-head relative mt-3 max-w-2xl text-6xl">We’ll take it from here.</h2>
          <p className="relative mt-5 max-w-lg text-lg text-white/75">
            {opt?.name} is on the book at {money(total)}. {pay === "finance" ? "Financing is in. " : "Deposit is next. "}
            {proposal.closer} will confirm the install date.
          </p>
          <p className="p-sub relative mt-10 text-[11px] text-white/50">
            {brand.name} · {brand.license} · {brand.phone} · {brand.email}
          </p>
          <button type="button" className="no-print relative mt-8 h-12 w-fit bg-[var(--p-red)] px-7 text-sm font-semibold" onClick={() => navigate(fileTo)}>
            Back to the file
          </button>
        </section>
      ) : null}
    </div>
  );
}

function Fact({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div>
      <dt className="p-sub text-[10px] text-[var(--p-gray)]">{k}</dt>
      <dd className="mt-1 text-base">{v}</dd>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="border border-[var(--p-navy)]/10 bg-white px-3 py-3">
      <p className="p-head text-3xl text-[var(--p-navy)]">{n}</p>
      <p className="p-sub mt-1 text-[10px] text-[var(--p-gray)]">{l}</p>
    </div>
  );
}
