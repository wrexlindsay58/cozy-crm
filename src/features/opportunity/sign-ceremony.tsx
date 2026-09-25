import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { money } from "@/lib/crm-data";
import { cityState, placeLine } from "@/lib/place";
import { useBrand } from "@/features/brand/store";
import { useOps } from "@/features/ops/store";
import { ESIGN_CONSENT } from "./agreement";
import { SignPad } from "./sign-pad";
import {
  financeMonthly,
  markAgreementOpened,
  noteAgreementRead,
  offerPlans,
  optionRollup,
  payAmount,
  payLabel,
  signAgreement,
  sendAgreementEmail,
  emailCoSigner,
  startAgreement,
  type Proposal,
} from "./store";

function paySummary(proposal: Proposal, total: number) {
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
  const brand = useBrand();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const opt = proposal.options.find((o) => o.id === optionId);
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
    <section className="mx-auto max-w-3xl px-5 py-6">
      <p className="type-meta">{mode === "in-home" ? "Read the agreement, then sign in person." : "Read it through, then sign."} {lead ? `${lead.name} · ${cityState(lead.city, lead.office)}` : agreement?.customer}</p>
      <div
        onScroll={onScroll}
        className={tall ? "mt-3 h-[68vh] overflow-auto rounded-md border border-line bg-page" : "mt-3 h-[72vh] overflow-auto rounded-md border border-line bg-page"}
      >
        {markup ? <div dangerouslySetInnerHTML={{ __html: markup }} /> : <p className="type-body p-6">Preparing the agreement.</p>}
      </div>
      <p className="type-meta mt-2">{read ? "Read through." : "Scroll to the end before you can sign."}</p>
      <div className="mt-4 space-y-3">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1" checked={records} onChange={(e) => setRecords(e.target.checked)} />
          <span>{ESIGN_CONSENT}</span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1" checked={paper} onChange={(e) => setPaper(e.target.checked)} />
          <span>I know I can ask for a paper copy, and I can still get email at {lead?.email ?? agreement?.email}.</span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1" checked={intent} onChange={(e) => setIntent(e.target.checked)} />
          <span>I intend this signature to sign this agreement, and only the words above.</span>
        </label>
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Primary</p>
        {waiting && agreement?.signature ? (
          <div className="mt-2">
            <p className="type-body">{agreement.signerName} signed.</p>
            <img src={agreement.signature} alt="Primary signature" className="mt-2 h-16 rounded-md border border-line bg-white" />
          </div>
        ) : (
          <>
            <label className="mt-2 block text-[11px] font-bold tracking-wide text-muted uppercase">
              Legal name
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-base font-normal tracking-normal" />
            </label>
            <div className="mt-3">
              <SignPad onChange={setSignature} />
            </div>
            <button type="button" disabled={!ready} className="mt-3 h-12 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40" onClick={() => sign("primary")}>
              {co ? "Primary signs" : mode === "in-home" ? "Sign in person" : "Sign agreement"}
            </button>
          </>
        )}
      </div>
      {co ? (
        <div className={waiting ? "mt-6" : "mt-6 opacity-40"}>
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Co-signer</p>
          {waiting ? null : <p className="type-meta mt-1">Unlocks after the primary signs.</p>}
          <label className="mt-2 block text-[11px] font-bold tracking-wide text-muted uppercase">
            Legal name
            <input value={coName} disabled={!waiting} onChange={(e) => setCoName(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-base font-normal tracking-normal disabled:bg-page" />
          </label>
          <div className={waiting ? "mt-3" : "pointer-events-none mt-3"}>
            <SignPad onChange={setCoSignature} />
          </div>
          <button type="button" disabled={!waiting || !coReady} className="mt-3 h-12 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40" onClick={() => sign("co")}>
            Co-signer signs
          </button>
        </div>
      ) : null}
      {mode === "in-home" && witnessed ? <p className="type-meta mt-3">{proposal.closer} is the witness on this device.</p> : null}
      {mode === "in-home" && !waiting ? (
        <button
          type="button"
          className="mt-3 h-11 w-full rounded-md border border-line text-sm font-semibold"
          onClick={() => {
            if (opt && lead && (!agreement || agreement.status === "Void" || agreement.optionId !== opt.id || (lead.secondaryName && !agreement.coSigner))) {
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
            }
            sendAgreementEmail(proposal.oppId, window.location.origin);
            setEmailed(true);
          }}
        >
          {emailed || agreement?.status === "Sent" ? `Sent to ${lead?.email ?? agreement?.email}` : co ? "Email the primary first" : "Email it to sign later"}
        </button>
      ) : null}
      {mode === "in-home" && waiting && co?.email ? (
        <button type="button" className="mt-3 h-11 w-full rounded-md border border-line text-sm font-semibold" onClick={() => emailCoSigner(proposal.oppId, window.location.origin)}>
          Email {co.name}
        </button>
      ) : null}
    </section>
  );
}

export function SignDialog({
  proposal,
  optionId,
  onClose,
}: {
  proposal: Proposal;
  optionId: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" role="dialog" aria-modal="true" aria-label="Sign in person">
      <div className="max-h-[94vh] w-full max-w-4xl overflow-auto rounded-md bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="type-group">Sign in person</p>
          <button type="button" className="grid size-10 place-items-center text-muted" aria-label="Close" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>
        <SignCeremony proposal={proposal} mode="in-home" optionId={optionId} witnessed tall onDone={onClose} />
      </div>
    </div>,
    document.body,
  );
}
