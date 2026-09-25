import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Link2, Printer, X } from "lucide-react";
import { CozyWordmark } from "@/components/cozy-mark";
import { useCatalog, itemBySku } from "@/features/catalog/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { useAssessCategories } from "@/features/assessment/categories";
import { useOps } from "@/features/ops/store";
import { usePhotos } from "@/features/photos/store";
import { brandVars, useBrand } from "@/features/brand/store";
import { money } from "@/lib/crm-data";
import { cityState, placeLine } from "@/lib/place";
import { addPayOffer, applyGoodLeap, financeMonthly, lineAmount, offerPlans, optionTotal, payAmount, payLabel, requestDeposit, sendProposal, setPayPick, type Proposal } from "./store";
import { SignCeremony } from "./sign-ceremony";
import { useMoneySettings } from "@/features/money-settings/store";
import { PresentOption } from "./present-option";
import { picksOn, scopeLines } from "./proposal-copy";
import { storyFor } from "./product-story";
import { BarRow, MoneyBars, StepRail } from "./present-viz";
import { cn } from "@/lib/cn";

const STEPS = ["cover", "why", "find", "work", "options", "pay", "sign", "done"] as const;
type Step = (typeof STEPS)[number];

const SHOT = {
  house: "/brand/slides/house.jpg",
  house2: "/brand/slides/house-2.jpg",
  house3: "/brand/slides/house-3.jpg",
  inside: "/brand/slides/interior.jpg",
};

export function Present({ proposal, mode = "customer" }: { proposal: Proposal; mode?: "present" | "customer" }) {
  useCatalog();
  useAssessments();
  const brand = useBrand();
  const navigate = useNavigate();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const assess = assessmentForLead(proposal.personId);
  const cats = useAssessCategories();
  const photos = usePhotos(proposal.personId);
  const { financers } = useMoneySettings();
  const [step, setStep] = useState<Step>("cover");
  const [picked, setPicked] = useState(proposal.accepted ?? proposal.options[0]?.id ?? "");
  const [name, setName] = useState(lead?.name ?? "");
  const [copied, setCopied] = useState("");
  const [showAllOpts, setShowAllOpts] = useState(false);
  const [editing, setEditing] = useState(false);
  const staff = mode === "present";
  const opt = proposal.options.find((o) => o.id === picked) ?? proposal.options[0];
  const total = opt ? optionTotal(opt) : 0;
  const i = STEPS.indexOf(step);
  const fileTo = { to: "/opportunities/$oppId" as const, params: { oppId: proposal.oppId } };
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const payOffer = proposal.payOffers.find((o) => o.id === proposal.payPick?.offerId) ?? proposal.payOffers[0];
  const term = proposal.payPick?.term ?? payOffer?.terms[0] ?? 120;
  const plans = payOffer ? offerPlans(payOffer) : [];
  const plan = plans.find((p) => p.months === term && p.apr === proposal.payPick?.apr) ?? plans[0];
  const payNow = payOffer ? payAmount(proposal, total, payOffer, payOffer.kind === "finance" ? plan : undefined) : total;
  const products = uniqueProducts(proposal);
  const hero = photos.find((p) => p.src)?.src ?? SHOT.house;

  function go(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function signed() {
    if (payOffer?.kind === "finance") applyGoodLeap(proposal.oppId);
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
    <div className="present-root min-h-dvh bg-[var(--p-paper)]" style={brandVars(brand)}>
      <style>{`
        .p-head { font-family: var(--p-head); letter-spacing: -0.01em; line-height: 0.88; text-transform: uppercase; }
        .p-sub { font-family: var(--p-sub); letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--p-trim)] bg-white px-3 py-2 text-[var(--p-navy)] md:px-6">
        <button type="button" className="grid size-11 place-items-center text-[var(--p-gray)]" aria-label="Close proposal" onClick={() => (staff ? navigate(fileTo) : go("cover"))}>
          <X className="size-5" />
        </button>
        {step !== "cover" ? (
          <button type="button" className="grid size-11 place-items-center text-[var(--p-gray)]" aria-label="Back" onClick={() => go(STEPS[Math.max(0, i - 1)])}>
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        <CozyWordmark className="ml-1 h-7 w-36" house={brand.red} word={brand.navy} />
        <div className="ml-4 hidden flex-1 md:block">
          <StepRail i={i} n={STEPS.length} />
        </div>
        <span className="ml-auto md:hidden" />
        {staff ? (
          <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--p-gray)]" onClick={copyLink}>
            <Link2 className="size-4" />
            {copied || "Link"}
          </button>
        ) : null}
        <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--p-gray)]" onClick={() => window.print()}>
          <Printer className="size-4" />
          PDF
        </button>
      </div>

      {step === "cover" ? (
        <section className="relative min-h-[calc(100dvh-56px)] overflow-hidden">
          <img src={hero} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[var(--p-navy)]/45" />
          <div className="relative flex min-h-[calc(100dvh-56px)] flex-col justify-between p-6 md:p-12">
            <CozyWordmark className="h-10 w-48 md:h-12 md:w-56" house={brand.red} word="#FFFFFF" />
            <div className="max-w-3xl">
              <p className="p-sub text-[11px] text-white/80">Home performance plan for</p>
              <h1 className="p-head mt-3 text-5xl text-white md:text-7xl">{lead?.name ?? "This house"}</h1>
              <p className="mt-4 text-lg text-white/85">{lead ? placeLine(lead.address, lead.city, lead.office) : ""}</p>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="text-[12px] text-white/70">
                {today} · {proposal.closer} · {brand.license}
              </p>
              <button type="button" className="h-12 bg-[var(--p-red)] px-8 text-sm font-semibold text-white" onClick={() => go("why")}>
                Start
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "why" ? (
        <section className="grid min-h-[calc(100dvh-56px)] lg:grid-cols-2">
          <div className="flex flex-col justify-between bg-white p-6 md:p-12">
            <p className="p-sub text-[11px] text-[var(--p-gray)]">{brand.name}</p>
            <div>
              <h2 className="p-head text-5xl text-[var(--p-navy)] md:text-6xl">{brand.why}</h2>
              <p className="p-sub mt-8 text-[11px] text-[var(--p-gray)]">{brand.tagline}</p>
            </div>
            <button type="button" className="mt-10 h-12 w-fit bg-[var(--p-navy)] px-8 text-sm font-semibold text-white" onClick={() => go("find")}>
              Your house
            </button>
          </div>
          <div className="relative min-h-[50vh] bg-[var(--p-navy)]">
            <img src={SHOT.inside} alt="" className="absolute inset-0 size-full object-cover opacity-50" />
            <ul className="relative grid h-full content-end gap-6 p-6 md:p-12">
              {brand.proof.map((p) => (
                <li key={p} className="border-t border-white/25 pt-3">
                  <p className="p-head text-4xl text-white md:text-5xl">{p}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {step === "find" ? (
        <section className="min-h-[calc(100dvh-56px)]">
          <div className="grid grid-cols-3 gap-px bg-[var(--p-trim)]">
            {(photos.filter((p) => p.src).slice(0, 3).length
              ? photos.filter((p) => p.src).slice(0, 3)
              : [{ id: "1", src: SHOT.house, caption: "The house" }, { id: "2", src: SHOT.house2, caption: "Street" }, { id: "3", src: SHOT.house3, caption: "Envelope" }]
            ).map((ph) => (
              <figure key={ph.id} className="relative aspect-[4/3] overflow-hidden bg-[var(--p-navy)]">
                <img src={ph.src} alt={ph.caption} className="size-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-[var(--p-navy)]/70 px-3 py-2 text-[12px] text-white">{ph.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
            <p className="p-sub text-[11px] text-[var(--p-gray)]">Assessment</p>
            <h2 className="p-head mt-2 text-5xl text-[var(--p-navy)]">What we found on the walk.</h2>
            <p className="mt-3 text-sm text-[var(--p-gray)]">
              {lead ? placeLine(lead.address, lead.city, lead.office) : ""} · {proposal.closer}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-px bg-[var(--p-trim)] md:grid-cols-3">
              {assess?.property.yearBuilt ? <Stat n={assess.property.yearBuilt} l="Built" /> : null}
              {assess?.property.sqft ? <Stat n={assess.property.sqft} l="Sq ft" /> : null}
              {assess?.property.stories ? <Stat n={assess.property.stories} l="Stories" /> : null}
              {assess?.property.hoa ? <Stat n={assess.property.hoa} l="HOA" /> : null}
              {assess?.property.occupancy ? <Stat n={assess.property.occupancy} l="Occupancy" /> : null}
              {assess?.property.electrical ? <Stat n={assess.property.electrical} l="Electrical" /> : null}
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div className="space-y-4 bg-white p-6">
                <p className="p-sub text-[11px] text-[var(--p-gray)]">Where it sits</p>
                <BarRow label="Equipment age (yr)" value={ageFrom(assess)} max={20} tone="navy" />
                <BarRow label="Typical life (yr)" value={15} max={20} tone="gray" />
                <BarRow label="Attic now (in)" value={atticFrom(assess)} max={16} tone="gray" />
                <BarRow label="Attic target (in)" value={14} max={16} tone="navy" />
              </div>
              {assess?.property.notes ? (
                <div className="bg-white p-6">
                  <p className="p-sub text-[11px] text-[var(--p-gray)]">Walk notes</p>
                  <p className="mt-3 text-lg text-[var(--p-navy)]">{assess.property.notes}</p>
                </div>
              ) : null}
            </div>
            <ul className="mt-8 grid gap-px bg-[var(--p-trim)] md:grid-cols-2">
              {(assess?.packets ?? [])
                .filter((p) => Object.keys(p.fields).length || p.notes)
                .map((p) => (
                  <li key={p.id} className="bg-white p-6">
                    <p className="p-sub text-[11px] text-[var(--p-gray)]">{cats.find((c) => c.id === p.id)?.label ?? p.id}</p>
                    <p className="p-head mt-2 text-3xl text-[var(--p-navy)]">
                      {Object.entries(p.fields)
                        .filter(([, v]) => v)
                        .map(([, v]) => v)
                        .join(" · ") || "Noted"}
                    </p>
                    {p.notes ? <p className="mt-3 text-sm text-[var(--p-gray)]">{p.notes}</p> : null}
                  </li>
                ))}
            </ul>
            {photos.length > 3 ? (
              <ul className="mt-8 grid grid-cols-2 gap-px bg-[var(--p-trim)] md:grid-cols-4">
                {photos.slice(3).map((ph) => (
                  <li key={ph.id} className="bg-white">
                    {ph.src ? <img src={ph.src} alt={ph.caption} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-[var(--p-trim)]" />}
                    <p className="px-3 py-2 text-[12px] text-[var(--p-navy)]">{ph.caption}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            <button type="button" className="mt-10 h-12 bg-[var(--p-navy)] px-8 text-sm font-semibold text-white" onClick={() => go("work")}>
              The work
            </button>
          </div>
        </section>
      ) : null}

      {step === "work" ? (
        <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
          <p className="p-sub text-[11px] text-[var(--p-gray)]">The work</p>
          <h2 className="p-head mt-2 text-5xl text-[var(--p-navy)]">What it solves.</h2>
          <ul className="mt-10 space-y-px bg-[var(--p-trim)]">
            {products.map((sku, idx) => {
              const item = itemBySku(sku);
              const story = storyFor(sku);
              const inOpts = proposal.options.filter((o) => o.lines.some((l) => l.sku === sku)).map((o) => o.name);
              const shot = [SHOT.house, SHOT.house2, SHOT.house3, SHOT.inside][idx % 4];
              return (
                <li key={sku} className="grid bg-white md:grid-cols-5">
                  <div className="relative min-h-40 md:col-span-2">
                    <img src={shot} alt="" className="absolute inset-0 size-full object-cover" />
                  </div>
                  <div className="p-6 md:col-span-3 md:p-8">
                    <p className="p-sub text-[11px] text-[var(--p-gray)]">{inOpts.join(" · ")}</p>
                    <h3 className="p-head mt-2 text-4xl text-[var(--p-navy)]">{item?.label ?? sku}</h3>
                    <p className="mt-4 text-base text-[var(--p-navy)]">{story.solves}</p>
                    <p className="mt-3 text-sm text-[var(--p-gray)]">{story.benefits.join(" · ")}</p>
                    <p className="p-sub mt-5 text-[11px] text-[var(--p-gray)]">Scope</p>
                    <p className="mt-1 text-sm">{story.sow}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <button type="button" className="mt-10 h-12 bg-[var(--p-navy)] px-8 text-sm font-semibold text-white" onClick={() => go("options")}>
            See the options
          </button>
        </section>
      ) : null}

      {step === "options" ? (
        <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
          <p className="p-sub text-[11px] text-[var(--p-gray)]">Options</p>
          <div className="mt-8 flex items-end justify-between gap-3">
            <h2 className="p-head text-5xl text-[var(--p-navy)]">Pick a path.</h2>
            {staff ? (
              <button type="button" className="h-11 border border-[var(--p-trim)] bg-white px-4 text-sm font-semibold" onClick={() => setEditing((v) => !v)}>
                {editing ? "Lock" : "Edit"}
              </button>
            ) : null}
          </div>
          <div className="mt-8 space-y-4">
            {proposal.options
              .filter((o) => showAllOpts || !picked || o.id === picked)
              .map((o) => (
                <PresentOption
                  key={o.id}
                  proposal={proposal}
                  option={o}
                  selected={picked === o.id}
                  editing={staff && editing}
                  onPick={() => {
                    setPicked(o.id);
                    setShowAllOpts(false);
                  }}
                />
              ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {picked && proposal.options.length > 1 ? (
              <button type="button" className="h-12 border border-[var(--p-trim)] bg-white px-5 text-sm font-semibold text-[var(--p-navy)]" onClick={() => setShowAllOpts((v) => !v)}>
                {showAllOpts ? "Hide the others" : "See other options"}
              </button>
            ) : null}
            <button type="button" disabled={!picked} className="h-12 bg-[var(--p-navy)] px-8 text-sm font-semibold text-white disabled:opacity-40" onClick={() => go("pay")}>
              Price {opt?.name}
            </button>
          </div>
        </section>
      ) : null}

      {step === "pay" ? (
        <section className="grid min-h-[calc(100dvh-56px)] lg:grid-cols-2">
          <div className="flex flex-col justify-between bg-[var(--p-navy)] p-6 text-white md:p-12">
            <p className="p-sub text-[11px] text-white/60">{opt?.name}</p>
            <div>
              <p className="p-sub text-[11px] text-white/60">{payOffer?.kind === "finance" ? "Monthly" : "Investment"}</p>
              <p className="p-head mt-2 text-6xl md:text-8xl">
                {payOffer?.kind === "finance" && plan ? money(financeMonthly(payNow, plan.apr, plan.months)) : money(payNow)}
                {payOffer?.kind === "finance" ? <span className="text-3xl">/mo</span> : null}
              </p>
            </div>
            <p className="text-sm text-white/70">Set on the file. You can still switch.</p>
          </div>
          <div className="bg-[var(--p-paper)] p-6 md:p-12">
            <div className="bg-white p-6">
              <p className="p-sub mb-4 text-[11px] text-[var(--p-gray)]">All options</p>
              <MoneyBars rows={proposal.options.map((o) => ({ id: o.id, name: o.name, amount: optionTotal(o) }))} picked={picked} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {staff
                ? financers
                    .filter((m) => m.active && !proposal.payOffers.some((o) => o.methodId === m.id || (m.kind !== "finance" && o.kind === m.kind) || (m.kind === "finance" && o.financer === m.name)))
                    .map((m) => (
                      <button key={m.id} type="button" className="h-10 border border-[var(--p-trim)] bg-white px-3 text-xs font-semibold uppercase tracking-wider text-[var(--p-gray)]" onClick={() => addPayOffer(proposal.oppId, m.id)}>
                        Add {m.name}
                      </button>
                    ))
                : null}
            </div>
            <div className="mt-4 grid gap-2">
              {proposal.payOffers.map((offer) => {
                const on = payOffer?.id === offer.id;
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => {
                      const first = offerPlans(offer)[0];
                      setPayPick(proposal.oppId, offer.id, first?.months, first?.apr);
                    }}
                    className={cn("bg-white px-5 py-4 text-left", on ? "outline outline-2 outline-[var(--p-navy)]" : "border border-[var(--p-trim)]")}
                  >
                    <p className="p-sub text-[11px] text-[var(--p-gray)]">{payLabel(offer)}</p>
                    <p className="p-head mt-1 text-3xl text-[var(--p-navy)]">
                      {offer.kind === "finance"
                        ? `${money(financeMonthly(payAmount(proposal, total, offer, offerPlans(offer)[0]), offerPlans(offer)[0]?.apr ?? 0, offerPlans(offer)[0]?.months ?? term))}/mo`
                        : money(payAmount(proposal, total, offer))}
                    </p>
                  </button>
                );
              })}
            </div>
            {payOffer?.kind === "finance" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {plans.map((p) => (
                  <button
                    key={`${p.months}-${p.apr}`}
                    type="button"
                    onClick={() => setPayPick(proposal.oppId, payOffer.id, p.months, p.apr)}
                    className={cn("h-12 px-4 text-sm font-semibold", plan?.months === p.months && plan?.apr === p.apr ? "bg-[var(--p-navy)] text-white" : "border border-[var(--p-trim)] bg-white")}
                  >
                    {p.months % 12 === 0 ? `${p.months / 12} yr` : `${p.months} mo`} {p.apr}% {money(financeMonthly(payAmount(proposal, total, payOffer, p), p.apr, p.months))}/mo
                  </button>
                ))}
              </div>
            ) : null}
            <button type="button" disabled={!payOffer} className="mt-8 h-12 bg-[var(--p-navy)] px-8 text-sm font-semibold text-white disabled:opacity-40" onClick={() => go("sign")}>
              Next
            </button>
          </div>
        </section>
      ) : null}

      {step === "sign" && opt ? <SignCeremony proposal={proposal} mode="in-home" optionId={opt.id} witnessed={staff} onDone={signed} /> : null}

      {step === "done" ? (
        <section className="relative min-h-[calc(100dvh-56px)] overflow-hidden">
          <img src={SHOT.house2} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[var(--p-navy)]/55" />
          <div className="relative flex min-h-[calc(100dvh-56px)] flex-col justify-end p-6 md:p-12">
            <p className="p-sub text-[11px] text-white/80">You’re in</p>
            <h2 className="p-head mt-2 max-w-2xl text-6xl text-white">We’ll take it from here.</h2>
            <p className="mt-4 max-w-lg text-lg text-white/80">
              {opt?.name} · {money(total)}. {proposal.closer} will confirm the date.
            </p>
            <button type="button" className="no-print mt-8 h-12 w-fit bg-white px-8 text-sm font-semibold text-[var(--p-navy)]" onClick={() => navigate(fileTo)}>
              Back to the file
            </button>
          </div>
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

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="bg-white px-4 py-5">
      <p className="p-head text-4xl text-[var(--p-navy)]">{n}</p>
      <p className="p-sub mt-1 text-[10px] text-[var(--p-gray)]">{l}</p>
    </div>
  );
}

function ageFrom(assess: ReturnType<typeof assessmentForLead>) {
  const raw = assess?.packets.map((p) => Object.values(p.fields).join(" ")).join(" ") ?? "";
  const m = raw.match(/(\d+)\s*yr/i);
  return m ? Number(m[1]) : 16;
}

function atticFrom(assess: ReturnType<typeof assessmentForLead>) {
  const raw = assess?.packets.map((p) => Object.values(p.fields).join(" ")).join(" ") ?? "";
  const m = raw.match(/(\d+)\s*in/i);
  return m ? Number(m[1]) : 4;
}
