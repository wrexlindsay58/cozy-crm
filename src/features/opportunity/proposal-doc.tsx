import { itemBySku, useCatalog } from "@/features/catalog/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { useAssessCategories } from "@/features/assessment/categories";
import { useOps } from "@/features/ops/store";
import { money } from "@/lib/crm-data";
import { cityState, placeLine } from "@/lib/place";
import { acceptOption, applyGoodLeap, demoMonthly, lineAmount, optionTotal, requestDeposit, sendToSign, type Proposal } from "./store";
import { BRAND } from "./brand";
import { picksOn, scopeLines, TERM_LABEL } from "./proposal-copy";
import { cn } from "@/lib/cn";

export function ProposalDoc({ proposal }: { proposal: Proposal }) {
  useCatalog();
  useAssessments();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const assess = assessmentForLead(proposal.personId);
  const cats = useAssessCategories();
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <article className="overflow-hidden rounded-md border border-line bg-card">
      <header className="bg-navy px-5 py-5 text-card md:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase">{BRAND.license}</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{BRAND.name}</h2>
            <p className="mt-0.5 text-sm text-card/80">{BRAND.line}</p>
          </div>
          <div className="text-sm md:text-right">
            <p>{BRAND.phone}</p>
            <p>{BRAND.email}</p>
            <p>
              {BRAND.city} · {BRAND.hours}
            </p>
          </div>
        </div>
      </header>

      <div className="border-b border-line px-5 py-4 md:px-7">
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Proposal</p>
        <p className="mt-1 text-xl font-extrabold tracking-tight">{lead?.name ?? "This house"}</p>
        <p className="mt-0.5 text-sm text-muted">
          {lead ? placeLine(lead.address, lead.city, lead.office) : ""}
          {lead?.phone ? ` · ${lead.phone}` : ""}
        </p>
        <p className="mt-2 text-[11px] text-muted">
          Prepared {today} · {proposal.closer} · File {proposal.oppId}
        </p>
      </div>

      {lead ? (
        <section className="border-b border-line px-5 py-4 md:px-7">
          <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">The house</h3>
          <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            <Row k="Name" v={lead.name} />
            <Row k="Phone" v={lead.phone} />
            <Row k="Email" v={lead.email} />
            <Row k="Address" v={`${lead.address}, ${cityState(lead.city, lead.office)}`} />
            {lead.secondaryName ? <Row k="Second" v={lead.secondaryName} /> : null}
            <Row k="Source" v={lead.source} />
          </dl>
        </section>
      ) : null}

      {assess ? (
        <section className="border-b border-line px-5 py-4 md:px-7">
          <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">What we found</h3>
          <p className="mt-2 text-sm">
            {assess.property.yearBuilt || assess.property.sqft
              ? `${assess.property.yearBuilt ? `${assess.property.yearBuilt} build` : ""}${assess.property.sqft ? ` · ${assess.property.sqft} sq ft` : ""}${assess.property.stories ? ` · ${assess.property.stories} stor${assess.property.stories === "1" ? "y" : "ies"}` : ""}`
              : null}
            {assess.property.hoa ? ` · HOA ${assess.property.hoa}` : ""}
          </p>
          {assess.property.notes ? <p className="mt-1 text-sm">{assess.property.notes}</p> : null}
          <ul className="mt-2 space-y-1 text-sm">
            {assess.packets
              .filter((p) => Object.keys(p.fields).length || p.notes)
              .map((p) => (
                <li key={p.id}>
                  <span className="font-semibold">{cats.find((c) => c.id === p.id)?.label ?? p.id}. </span>
                  {Object.entries(p.fields)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k} ${v}`)
                    .join(" · ")}
                  {p.notes ? ` — ${p.notes}` : ""}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4 border-b border-line px-5 py-4 md:px-7">
        <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">Options</h3>
        {proposal.options.map((opt) => {
          const taken = proposal.accepted === opt.id;
          const goods = opt.lines.filter((l) => l.kind !== "discount");
          const offs = opt.lines.filter((l) => l.kind === "discount");
          return (
            <div key={opt.id} className={cn("rounded-md border p-4", taken ? "border-navy" : "border-line")}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-extrabold tracking-wide uppercase">{opt.name}</h4>
                <p className="text-xl font-extrabold tabular-nums">{money(optionTotal(opt))}</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {goods.map((l) => (
                  <li key={l.sku} className="flex justify-between gap-3">
                    <span>
                      {l.label}
                      {picksOn(l) ? <span className="text-muted"> · {picksOn(l)}</span> : null}
                      {l.kind === "adder" ? <span className="text-muted"> · adder</span> : null}
                    </span>
                    <span className="tabular-nums">{money(lineAmount(l) || l.unit * l.qty)}</span>
                  </li>
                ))}
                {offs.map((l) => (
                  <li key={l.sku} className="flex justify-between gap-3 text-muted">
                    <span>{l.label} · off</span>
                    <span className="tabular-nums">{l.pct ? `-${l.pct}%` : money(l.unit * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Scope</p>
                <p className="mt-1 text-sm">We will {scopeLines(opt).join("; ").toLowerCase()}.</p>
              </div>
              <button
                type="button"
                disabled={Boolean(proposal.accepted) && !taken}
                onClick={() => {
                  acceptOption(proposal.oppId, opt.id);
                  sendToSign(proposal.oppId);
                }}
                className={cn("mt-4 h-11 w-full rounded-md text-sm font-semibold", taken ? "bg-navy text-card" : "border border-navy text-navy hover:bg-navy hover:text-card")}
              >
                {taken ? "Accepted · agreement sent to sign" : "Accept and sign"}
              </button>
            </div>
          );
        })}
      </section>

      <section className="border-b border-line px-5 py-4 md:px-7">
        <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">How you pay</h3>
        {proposal.payOffers.length === 0 ? <p className="mt-2 text-sm text-muted">Add cash, card, or financing on the file and generate again.</p> : null}
        <div className="mt-3 space-y-3">
          {proposal.payOffers.map((offer) => (
            <div key={offer.id}>
              <p className="text-sm font-semibold">
                {offer.kind === "cash" ? "Cash" : offer.kind === "card" ? "Credit card" : `Financing · ${offer.financer ?? "GoodLeap"}`}
              </p>
              {offer.kind !== "finance" ? (
                <ul className="mt-1 text-sm">
                  {proposal.options.map((o) => (
                    <li key={o.id} className="flex justify-between gap-3">
                      <span>{o.name}</span>
                      <span className="font-extrabold tabular-nums">{money(optionTotal(o))}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                offer.terms.map((m) => (
                  <div key={m} className="mt-1">
                    <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{TERM_LABEL[m] ?? `${m} mo`}</p>
                    <ul className="text-sm">
                      {proposal.options.map((o) => (
                        <li key={o.id} className="flex justify-between gap-3">
                          <span>{o.name}</span>
                          <span className="font-extrabold tabular-nums">{money(demoMonthly(optionTotal(o), m))}/mo</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-4 md:px-7">
        <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">Next</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
          <li>Pick an option. Accept and sign the agreement on this page.</li>
          <li>If you finance, apply. If you pay cash or card, we take a deposit to hold the date.</li>
          <li>We lock the install once the agreement is signed and the deposit or financing is in.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          {proposal.payOffers.some((o) => o.kind === "finance") ? (
            <button type="button" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => applyGoodLeap(proposal.oppId)}>
              Apply for financing
            </button>
          ) : null}
          <button type="button" className="h-11 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => requestDeposit(proposal.oppId)}>
            Put a deposit on the card
          </button>
        </div>
        <p className="mt-4 text-[11px] text-muted">
          {BRAND.name} · {BRAND.license} · {BRAND.phone}. Proposal is good for 14 days. Work starts after sign and deposit or financing approval.
        </p>
      </section>
    </article>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
