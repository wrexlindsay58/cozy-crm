import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Link2, Printer, X } from "lucide-react";
import { CozyHouse, CozyWordmark } from "@/components/cozy-mark";
import { useCatalog, itemBySku } from "@/features/catalog/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { useAssessCategories } from "@/features/assessment/categories";
import { useOps } from "@/features/ops/store";
import { usePhotos } from "@/features/photos/store";
import { brandVars, useBrand } from "@/features/brand/store";
import { money } from "@/lib/crm-data";
import { cityState, placeLine } from "@/lib/place";
import { addPayOffer, applyGoodLeap, demoMonthly, lineAmount, optionTotal, requestDeposit, sendProposal, sendToSign, setPayPick, acceptOption, type PayKind, type Proposal } from "./store";
import { PresentOption } from "./present-option";
import { picksOn, scopeLines, TERM_LABEL } from "./proposal-copy";
import { storyFor } from "./product-story";
import { BarRow, Card, MoneyBars, StepRail } from "./present-viz";
import { cn } from "@/lib/cn";

const STEPS = ["cover", "why", "find", "work", "options", "pay", "sign", "done"] as const;
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
  const [name, setName] = useState(lead?.name ?? "");
  const [copied, setCopied] = useState("");
  const [showAllOpts, setShowAllOpts] = useState(false);
  const opt = proposal.options.find((o) => o.id === picked) ?? proposal.options[0];
  const total = opt ? optionTotal(opt) : 0;
  const i = STEPS.indexOf(step);
  const fileTo = { to: "/opportunities/$oppId" as const, params: { oppId: proposal.oppId } };
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const payOffer = proposal.payOffers.find((o) => o.id === proposal.payPick?.offerId) ?? proposal.payOffers[0];
  const term = proposal.payPick?.term ?? payOffer?.terms[0] ?? 120;
  const products = uniqueProducts(proposal);

  function go(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function sign() {
    if (!opt || !payOffer) return;
    acceptOption(proposal.oppId, opt.id);
    sendToSign(proposal.oppId);
    if (payOffer.kind === "finance") applyGoodLeap(proposal.oppId);
    else requestDeposit(proposal.oppId);
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
        .p-head { font-family: var(--p-head); letter-spacing: 0.02em; line-height: 0.92; text-transform: uppercase; }
        .p-sub { font-family: var(--p-sub); letter-spacing: 0.16em; text-transform: uppercase; font-weight: 500; color: var(--p-gray); }
        @media print { .no-print { display: none !important; } .print-break { break-inside: avoid; } }
      `}</style>

      <div className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--p-trim)] bg-white px-3 py-2 text-[var(--p-navy)] md:px-6">
        <button type="button" className="grid size-11 place-items-center" aria-label="Close proposal" onClick={() => navigate(fileTo)}>
          <X className="size-5" />
        </button>
        {step !== "cover" ? (
          <button type="button" className="grid size-11 place-items-center" aria-label="Back" onClick={() => go(STEPS[Math.max(0, i - 1)])}>
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        <CozyWordmark className="ml-1 h-8 w-40" house={brand.red} word={brand.navy} />
        <div className="ml-4 hidden flex-1 md:block">
          <StepRail i={i} n={STEPS.length} />
        </div>
        <span className="ml-auto md:hidden" />
        <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--p-gray)]" onClick={copyLink}>
          <Link2 className="size-4" />
          {copied || "Link"}
        </button>
        <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--p-gray)]" onClick={() => window.print()}>
          <Printer className="size-4" />
          PDF
        </button>
      </div>

      {step === "cover" ? (
        <section className="relative mx-auto flex min-h-[calc(100dvh-56px)] max-w-5xl flex-col justify-between overflow-hidden px-6 py-10 md:px-12 md:py-16 print-break">
          <CozyHouse className="pointer-events-none absolute -right-8 top-8 w-[48%] max-w-lg text-[var(--p-trim)] opacity-80" color={brand.gray} />
          <div className="relative">
            <CozyWordmark className="h-14 w-64 md:h-16 md:w-80" house={brand.red} word={brand.navy} />
            <p className="p-sub mt-4 text-[11px]">{brand.tagline}</p>
          </div>
          <div className="relative max-w-2xl">
            <p className="p-sub text-[11px]">Proposal</p>
            <h1 className="p-head mt-3 text-5xl text-[var(--p-navy)] md:text-7xl">{lead?.address ?? "This house"}</h1>
            <Card className="mt-8 max-w-md">
              <p className="text-lg font-semibold text-[var(--p-navy)]">{lead?.name}</p>
              <p className="mt-1 text-sm text-[var(--p-gray)]">{lead ? placeLine(lead.address, lead.city, lead.office) : ""}</p>
              <p className="mt-3 text-[12px] text-[var(--p-gray)]">
                {today} · {proposal.closer} · {brand.license}
              </p>
            </Card>
          </div>
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <p className="text-[12px] text-[var(--p-gray)]">
              {brand.phone} · {brand.email}
            </p>
            <button type="button" className="h-12 bg-[var(--p-red)] px-7 text-sm font-semibold text-white" onClick={() => go("why")}>
              Open the plan
            </button>
          </div>
        </section>
      ) : null}

      {step === "why" ? (
        <section className="relative mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px]">Why {brand.name.split(" ")[0]}</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">{brand.tagline}.</h2>
          <p className="mt-5 max-w-2xl text-lg text-[var(--p-gray)]">{brand.why}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {brand.proof.map((p) => (
              <li key={p}>
                <Card>
                  <p className="p-head text-3xl text-[var(--p-navy)]">{p}</p>
                </Card>
              </li>
            ))}
          </ul>
          <p className="p-sub mt-10 text-[11px]">How we run</p>
          <ul className="mt-4 grid gap-3">
            {brand.different.map((d) => (
              <li key={d}>
                <Card className="flex items-start gap-4">
                  <CozyHouse className="size-9 shrink-0" color={brand.gray} />
                  <p className="text-base text-[var(--p-navy)]">{d}</p>
                </Card>
              </li>
            ))}
          </ul>
          <button type="button" className="mt-10 h-12 bg-[var(--p-navy)] px-7 text-sm font-semibold text-white" onClick={() => go("find")}>
            Your house
          </button>
        </section>
      ) : null}

      {step === "find" ? (
        <section className="relative mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px]">Assessment</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">What we found.</h2>
          <p className="mt-3 text-sm text-[var(--p-gray)]">
            {lead ? placeLine(lead.address, lead.city, lead.office) : ""} · {proposal.closer} on the walk
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {assess?.property.yearBuilt ? <Stat n={assess.property.yearBuilt} l="Built" /> : null}
            {assess?.property.sqft ? <Stat n={assess.property.sqft} l="Sq ft" /> : null}
            {assess?.property.stories ? <Stat n={assess.property.stories} l="Stories" /> : null}
            {assess?.property.hoa ? <Stat n={assess.property.hoa} l="HOA" /> : null}
            {assess?.property.occupancy ? <Stat n={assess.property.occupancy} l="Occupancy" /> : null}
            {assess?.property.electrical ? <Stat n={assess.property.electrical} l="Electrical" /> : null}
          </div>
          <Card className="mt-6 space-y-4">
            <p className="p-sub text-[11px]">Where it sits</p>
            <BarRow label="Equipment age (yr)" value={ageFrom(assess)} max={20} tone="navy" />
            <BarRow label="Typical life (yr)" value={15} max={20} tone="gray" />
            <BarRow label="Attic now (in)" value={atticFrom(assess)} max={16} tone="gray" />
            <BarRow label="Attic target (in)" value={14} max={16} tone="navy" />
          </Card>
          {assess?.property.notes ? (
            <Card className="mt-4">
              <p className="p-sub text-[11px]">Walk notes</p>
              <p className="mt-2 text-base">{assess.property.notes}</p>
            </Card>
          ) : null}
          <ul className="mt-6 grid gap-3">
            {(assess?.packets ?? [])
              .filter((p) => Object.keys(p.fields).length || p.notes || p.photos.length)
              .map((p) => (
                <li key={p.id}>
                  <Card>
                    <div className="flex gap-4">
                      <CozyHouse className="mt-1 size-9 shrink-0" color={brand.gray} />
                      <div className="min-w-0 flex-1">
                        <p className="p-sub text-[11px]">{cats.find((c) => c.id === p.id)?.label ?? p.id}</p>
                        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                          {Object.entries(p.fields)
                            .filter(([, v]) => v)
                            .map(([k, v]) => (
                              <Fact key={k} k={k} v={v} />
                            ))}
                        </dl>
                        {p.notes ? <p className="mt-3 text-sm text-[var(--p-gray)]">{p.notes}</p> : null}
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
          </ul>
          {photos.length ? (
            <div className="mt-8">
              <p className="p-sub text-[11px]">From the walk</p>
              <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {photos.map((ph) => (
                  <li key={ph.id} className="overflow-hidden border border-[var(--p-trim)] bg-white">
                    {ph.src ? <img src={ph.src} alt={ph.caption} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] grid place-items-center bg-[var(--p-trim)]/30 text-xs text-[var(--p-gray)]">Photo</div>}
                    <p className="px-3 py-2 text-[12px] text-[var(--p-navy)]">{ph.caption}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <button type="button" className="mt-10 h-12 bg-[var(--p-navy)] px-7 text-sm font-semibold text-white" onClick={() => go("work")}>
            The work
          </button>
        </section>
      ) : null}

      {step === "work" ? (
        <section className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px]">The work</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">What it solves.</h2>
          <p className="mt-3 text-sm text-[var(--p-gray)]">Each product on these options. Locked copy. Brand only changes the look.</p>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {products.map((sku) => {
              const item = itemBySku(sku);
              const story = storyFor(sku);
              const inOpts = proposal.options.filter((o) => o.lines.some((l) => l.sku === sku)).map((o) => o.name);
              return (
                <li key={sku}>
                  <Card className="h-full">
                    <p className="p-sub text-[11px]">{inOpts.join(" · ")}</p>
                    <h3 className="p-head mt-2 text-3xl text-[var(--p-navy)]">{item?.label ?? sku}</h3>
                    <p className="mt-3 text-sm text-[var(--p-gray)]">{story.solves}</p>
                    <p className="p-sub mt-4 text-[11px]">Holds</p>
                    <p className="mt-1 text-sm">{story.benefits.join(" · ")}</p>
                    <p className="p-sub mt-4 text-[11px]">Scope</p>
                    <p className="mt-1 text-sm">{story.sow}</p>
                  </Card>
                </li>
              );
            })}
          </ul>
          <button type="button" className="mt-10 h-12 bg-[var(--p-navy)] px-7 text-sm font-semibold text-white" onClick={() => go("options")}>
            See the options
          </button>
        </section>
      ) : null}

      {step === "options" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px]">Options</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">Pick a path.</h2>
          <p className="mt-3 text-sm text-[var(--p-gray)]">Pick one. The others step aside. See other options if you want them back.</p>
          <div className="mt-8 space-y-4">
            {proposal.options
              .filter((o) => showAllOpts || !picked || o.id === picked)
              .map((o) => (
                <PresentOption
                  key={o.id}
                  proposal={proposal}
                  option={o}
                  selected={picked === o.id}
                  onPick={() => {
                    setPicked(o.id);
                    setShowAllOpts(false);
                  }}
                />
              ))}
          </div>
          {picked && proposal.options.length > 1 ? (
            <button
              type="button"
              className="mt-4 h-11 text-sm font-semibold text-[var(--p-navy)] underline-offset-4 hover:underline"
              onClick={() => setShowAllOpts((v) => !v)}
            >
              {showAllOpts ? "Hide the others" : "See other options"}
            </button>
          ) : null}
          <button type="button" disabled={!picked} className="mt-10 h-12 bg-[var(--p-navy)] px-7 text-sm font-semibold text-white disabled:opacity-40" onClick={() => go("pay")}>
            Price {opt?.name}
          </button>
        </section>
      ) : null}

      {step === "pay" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px]">Investment</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">The number.</h2>
          <p className="mt-3 text-sm text-[var(--p-gray)]">How you pay was set on the file. You can still add or switch here.</p>
          <Card className="mt-8">
            <p className="p-sub mb-4 text-[11px]">Options side by side</p>
            <MoneyBars rows={proposal.options.map((o) => ({ id: o.id, name: o.name, amount: optionTotal(o) }))} picked={picked} />
          </Card>
          <div className="mt-6 overflow-x-auto border border-[var(--p-trim)] bg-white">
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
                  <tr key={o.id} className={picked === o.id ? "bg-[var(--p-navy)]/5 font-semibold" : "border-t border-[var(--p-trim)]"}>
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
          <div className="mt-6 flex flex-wrap gap-2">
            {(["cash", "card", "finance"] as PayKind[]).map((k) => (
              <button
                key={k}
                type="button"
                className="h-10 border border-[var(--p-navy)]/20 px-3 text-xs font-semibold uppercase tracking-wider"
                onClick={() => addPayOffer(proposal.oppId, k)}
              >
                Add {k === "card" ? "card" : k}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {proposal.payOffers.map((offer) => {
              const on = payOffer?.id === offer.id;
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setPayPick(proposal.oppId, offer.id, offer.terms[0])}
                  className={cn("border bg-white px-5 py-4 text-left", on ? "border-[var(--p-navy)]" : "border-[var(--p-trim)]")}
                >
                  <p className="p-sub text-[11px]">{offer.kind === "cash" ? "Cash" : offer.kind === "card" ? "Credit card" : `Financing · ${offer.financer ?? "GoodLeap"}`}</p>
                  {offer.kind !== "finance" ? <p className="p-head mt-1 text-4xl">{money(total)}</p> : <p className="p-head mt-1 text-4xl">{money(demoMonthly(total, term))}/mo</p>}
                </button>
              );
            })}
          </div>
          {payOffer?.kind === "finance" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {(payOffer.terms.length ? payOffer.terms : [120, 144, 180]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayPick(proposal.oppId, payOffer.id, m)}
                  className={cn("h-12 px-4 text-sm font-semibold", term === m ? "bg-[var(--p-navy)] text-white" : "border border-[var(--p-trim)] bg-white")}
                >
                  {TERM_LABEL[m]} · {money(demoMonthly(total, m))}/mo
                </button>
              ))}
            </div>
          ) : null}
          <button type="button" disabled={!payOffer} className="mt-10 h-12 bg-[var(--p-navy)] px-7 text-sm font-semibold text-white disabled:opacity-40" onClick={() => go("sign")}>
            Next steps
          </button>
        </section>
      ) : null}

      {step === "sign" ? (
        <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16 print-break">
          <p className="p-sub text-[11px]">Next</p>
          <h2 className="p-head mt-3 text-5xl text-[var(--p-navy)]">Lock it in.</h2>
          <Card className="mt-8">
            <p className="p-head text-3xl text-[var(--p-navy)]">
              {opt?.name} · {money(total)}
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {opt?.lines
                .filter((l) => l.kind !== "discount")
                .map((l) => (
                  <li key={l.sku}>
                    {l.label}
                    {picksOn(l) ? ` · ${picksOn(l)}` : ""} — {money(lineAmount(l) || l.unit * l.qty)}
                  </li>
                ))}
            </ul>
            <p className="mt-3 text-sm text-[var(--p-gray)]">We will {opt ? scopeLines(opt).join("; ").toLowerCase() : ""}.</p>
            <p className="mt-4 text-sm">
              Pay: {payOffer?.kind === "finance" ? `Financing · ${TERM_LABEL[term]} · ${money(demoMonthly(total, term))}/mo` : payOffer?.kind === "card" ? `Credit card ${money(total)}` : `Cash ${money(total)}`}
            </p>
          </Card>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2">
            <li><Card><p className="p-head text-2xl text-[var(--p-navy)]">1</p><p className="mt-1 text-sm">Sign this agreement.</p></Card></li>
            <li><Card><p className="p-head text-2xl text-[var(--p-navy)]">2</p><p className="mt-1 text-sm">{payOffer?.kind === "finance" ? "Apply for financing." : "Deposit on the card to hold the date."}</p></Card></li>
            <li><Card><p className="p-head text-2xl text-[var(--p-navy)]">3</p><p className="mt-1 text-sm">We confirm the install. Crew gets the scope and photos.</p></Card></li>
            <li><Card><p className="p-head text-2xl text-[var(--p-navy)]">4</p><p className="mt-1 text-sm">Work starts after sign and deposit or financing. Good 14 days from {today}.</p></Card></li>
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
        </section>
      ) : null}

      {step === "done" ? (
        <section className="relative mx-auto flex min-h-[80dvh] max-w-3xl flex-col justify-center px-6 py-16">
          <CozyHouse className="pointer-events-none absolute -right-6 bottom-8 w-48 text-[var(--p-trim)]" color={brand.gray} />
          <CozyWordmark className="relative h-12 w-56" house={brand.red} word={brand.navy} />
          <p className="p-sub relative mt-8 text-[11px]">You’re in</p>
          <h2 className="p-head relative mt-3 max-w-2xl text-6xl text-[var(--p-navy)]">We’ll take it from here.</h2>
          <p className="relative mt-5 max-w-lg text-lg text-[var(--p-gray)]">
            {opt?.name} is on the book at {money(total)}. {proposal.closer} will confirm the install date.
          </p>
          <button type="button" className="no-print relative mt-8 h-12 w-fit bg-[var(--p-navy)] px-7 text-sm font-semibold text-white" onClick={() => navigate(fileTo)}>
            Back to the file
          </button>
        </section>
      ) : null}
    </div>
  );
}

function uniqueProducts(proposal: Proposal) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const o of proposal.options) {
    for (const l of o.lines) {
      if (l.kind === "discount" || seen.has(l.sku)) continue;
      seen.add(l.sku);
      out.push(l.sku);
    }
  }
  return out;
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
    <Card>
      <p className="p-head text-3xl text-[var(--p-navy)]">{n}</p>
      <p className="p-sub mt-1 text-[10px]">{l}</p>
    </Card>
  );
}

function ageFrom(assess: ReturnType<typeof assessmentForLead>) {
  const raw = assess?.packets.map((p) => Object.values(p.fields).join(" ")).join(" ") ?? "";
  const m = raw.match(/(\d+)\s*yr/i);
  return m ? Number(m[1]) : 16;
}

function atticFrom(assess: ReturnType<typeof assessmentForLead>) {
  const raw = assess?.packets.map((p) => Object.values(p.fields).join(" ")).join(" ") ?? "";
  const m = raw.match(/(\d+)\s*in/i) || raw.match(/\b(\d+)\b/);
  return m ? Number(m[1]) : 4;
}
