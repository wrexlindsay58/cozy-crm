import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCatalog, itemBySku } from "@/features/catalog/store";
import { useOps } from "@/features/ops/store";
import { usePhotos } from "@/features/photos/store";
import { useBrand } from "@/features/brand/store";
import { applyGoodLeap, bundledDue, offerPlans, optionTotal, payAmount, requestDeposit, sendProposal, type Proposal } from "../store";
import { useMoneySettings } from "@/features/money-settings/store";
import { storyFor } from "../product-story";
import { PresentView8 } from "./part-02";

const STEPS = ["cover", "why", "find", "work", "options", "pay", "sign", "done"] as const;

type Step = (typeof STEPS)[number];

export const SHOT = {
  house: "/brand/slides/house.jpg",
  house2: "/brand/slides/house-2.jpg",
  house3: "/brand/slides/house-3.jpg",
  inside: "/brand/slides/interior.jpg",
};

export function Present({ proposal, mode = "customer", scope = "both" }: { proposal: Proposal; mode?: "present" | "customer"; scope?: "both" | "proposal" }) {
  useCatalog();
  const brand = useBrand();
  const navigate = useNavigate();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const photos = usePhotos(proposal.personId);
  const { financers } = useMoneySettings();
  const [step, setStep] = useState<Step>("cover");
  const [picked, setPicked] = useState(proposal.accepted ?? proposal.options[0]?.id ?? "");
  const [name, setName] = useState(lead?.name ?? "");
  const [copied, setCopied] = useState("");
  const [showAllOpts, setShowAllOpts] = useState(false);
  const [editing, setEditing] = useState(false);
  const [planSigner, setPlanSigner] = useState("");
  const [planMiss, setPlanMiss] = useState(false);
  const staff = mode === "present";
  const opt = proposal.options.find((o) => o.id === picked) ?? proposal.options[0];
  const total = opt ? optionTotal(opt) : 0;
  const steps = (scope === "proposal" ? STEPS.filter((s) => s !== "find") : [...STEPS]) as Step[];
  const i = steps.indexOf(step);
  const fileTo = { to: "/opportunities/$oppId" as const, params: { oppId: proposal.oppId } };
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const payOffer = proposal.payOffers.find((o) => o.id === proposal.payPick?.offerId) ?? proposal.payOffers[0];
  const term = proposal.payPick?.term ?? payOffer?.terms[0] ?? 120;
  const plans = payOffer ? offerPlans(payOffer) : [];
  const plan = plans.find((p) => p.months === term && p.apr === proposal.payPick?.apr) ?? plans[0];
  const payNow = payOffer ? payAmount(proposal, total, payOffer, payOffer.kind === "finance" ? plan : undefined) : total;
  const bundle = payOffer ? bundledDue(proposal, total, payOffer, payOffer.kind === "finance" ? plan : undefined) : null;
  const shownDue = bundle?.ride ? bundle.due : payNow;
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
    <PresentView5 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
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

export function PresentView3(props: { bag: { products: any; proposal: any; go: any } }) {
  const { products, proposal, go } = props.bag;
  return (
    <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
          <p className="p-sub text-[11px] text-[var(--p-gray)]">The work</p>
          <h2 className="p-head mt-2 text-5xl text-[var(--p-navy)]">What it solves.</h2>
          <ul className="mt-10 space-y-px bg-[var(--p-trim)]">
            {products.map((sku: any, idx: any) => {
              const item = itemBySku(sku);
              const story = storyFor(sku);
              const inOpts = proposal.options.filter((o: any) => o.lines.some((l: any) => l.sku === sku)).map((o: any) => o.name);
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
  );
}

function PresentView5(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView6 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView6(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView7 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView7(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView8 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}
