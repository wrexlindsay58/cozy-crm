import { useEffect, useState } from "react";
import { money } from "@/lib/crm-data";
import { placeLine } from "@/lib/place";
import { useBrand } from "@/features/brand/store";
import { useOps } from "@/features/ops/store";
import { financeMonthly, markAgreementOpened, noteAgreementRead, offerPlans, optionRollup, payAmount, payLabel, signAgreement, startAgreement, type Proposal } from "../store";
import { SignCeremonyView3 } from "./part-02";

export function paySummary(proposal: Proposal, total: number) {
  const offer = proposal.payOffers.find((o) => o.id === proposal.payPick?.offerId) ?? proposal.payOffers[0];
  if (!offer) return "Payment not chosen";
  if (offer.kind !== "finance") return `${payLabel(offer)} ${money(payAmount(proposal, total, offer))}`;
  const plans = offerPlans(offer);
  const plan = plans.find((p) => p.months === proposal.payPick?.term && p.apr === proposal.payPick?.apr) ?? plans[0];
  if (!plan) return payLabel(offer);
  const priced = payAmount(proposal, total, offer, plan);
  return `${payLabel(offer)} ${money(priced)} · ${plan.apr}% · ${plan.months % 12 === 0 ? `${plan.months / 12} yr` : `${plan.months} mo`} · ${money(financeMonthly(priced, plan.apr, plan.months))}/mo`;
}

export function SignCeremony({
  proposal,
  mode,
  optionId,
  token,
  witnessed = true,
  tall = false,
  onDone,
}: {
  proposal: Proposal;
  mode: "in-home" | "email";
  optionId: string;
  token?: string;
  witnessed?: boolean;
  tall?: boolean;
  onDone?: () => void;
}) {
  const { coSignature, signature, coName, name, read, records, intent, paper, dead, brand, locked, agreement, lead, setRecords, setPaper, setIntent, setName, setSignature, setCoName, setCoSignature, opt, setEmailed, emailed, onScroll } = useSignCeremony(proposal, mode, optionId, token, witnessed, tall, onDone);


  function sign(role: "primary" | "co") {
    const drawn = role === "co" ? coSignature : signature;
    const who = role === "co" ? coName : name;
    if (!drawn || !read || !records || !intent || !paper) return;
    const result = signAgreement(proposal.oppId, {
      token: token ?? proposal.agreement?.token,
      name: who,
      signature: drawn,
      method: mode,
      role,
      origin: window.location.origin,
      witness: mode === "in-home" && witnessed ? proposal.closer : undefined,
    });
    if (result === "done") onDone?.();
  }

  if (dead) {
    return (
      <section className="mx-auto max-w-xl px-5 py-16">
        <h1 className="type-section">This agreement is closed</h1>
        <p className="type-body mt-3">The link does not match an open agreement. Ask {brand.name} for a new one.</p>
      </section>
    );
  }

  if (locked && agreement) {
    return (
      <section className="mx-auto max-w-xl px-5 py-10">
        <p className="type-label">Signed</p>
        <h1 className="type-section mt-1">{agreement.optionName}</h1>
        <p className="type-body mt-3">
          {agreement.signerName} signed {agreement.method === "in-home" ? "in the home" : "from the email"} on {agreement.signedAt}.
        </p>
        <p className="type-meta mt-2">Record {agreement.hash}</p>
        {agreement.signature ? <img src={agreement.signature} alt="Signature" className="mt-4 h-24 rounded-md border border-line bg-white" /> : null}
      </section>
    );
  }

  const markup = agreement?.optionId === optionId ? agreement.html : "";
  const waiting = agreement?.status === "Partial";
  const co = agreement?.coSigner;
  const ready = read && records && intent && paper && name.trim().length > 2 && Boolean(signature);
  const coReady = read && records && intent && paper && coName.trim().length > 2 && Boolean(coSignature);

  return (
    <SignCeremonyView bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function useSignCeremony(proposal: any, mode: any, optionId: any, token: any, witnessed: any, tall: any, onDone: any) {
  const brand = useBrand();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const opt = proposal.options.find((o: any) => o.id === optionId);
  const [name, setName] = useState(mode === "email" ? "" : (lead?.name ?? ""));
  const [coName, setCoName] = useState(lead?.secondaryName ?? "");
  const [signature, setSignature] = useState<string | null>(null);
  const [coSignature, setCoSignature] = useState<string | null>(null);
  const [read, setRead] = useState(false);
  const [records, setRecords] = useState(false);
  const [intent, setIntent] = useState(false);
  const [paper, setPaper] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const agreement = proposal.agreement;
  const locked = agreement?.status === "Signed" && agreement.optionId === optionId;
  const dead = agreement?.status === "Void" || (mode === "email" && (!agreement || agreement.token !== token));
  useEffect(() => {
    if (mode !== "in-home" || !opt || !lead || locked) return;
    if (agreement?.status === "Signed") return;
    const needsCo = Boolean(lead.secondaryName) && !agreement?.coSigner && agreement?.status !== "Partial";
    if (agreement && agreement.optionId === opt.id && agreement.status !== "Void" && agreement.html && !needsCo) return;
    startAgreement(proposal.oppId, {
      optionId: opt.id,
      paySummary: paySummary(proposal, optionRollup(opt).total),
      address: placeLine(lead.address, lead.city, lead.office),
      customer: lead.name,
      email: lead.email,
      company: brand.name,
      license: brand.license,
      coSigner: lead.secondaryName ? { name: lead.secondaryName, email: lead.secondaryEmail ?? "" } : undefined,
    });
  }, [agreement, brand.license, brand.name, lead, locked, mode, opt, proposal]);
  useEffect(() => {
    if (mode === "email" && token) markAgreementOpened(proposal.oppId, token);
  }, [mode, proposal.oppId, token]);
  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) {
      setRead(true);
      if (token) noteAgreementRead(proposal.oppId, token);
      else if (proposal.agreement) noteAgreementRead(proposal.oppId, proposal.agreement.token);
    }
  }
  return { coSignature, signature, coName, name, read, records, intent, paper, dead, brand, locked, agreement, lead, setRecords, setPaper, setIntent, setName, setSignature, setCoName, setCoSignature, opt, setEmailed, emailed, onScroll };
}

function SignCeremonyView(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView2 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView2(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView3 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}
