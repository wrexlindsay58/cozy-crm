import { cityState, placeLine } from "@/lib/place";
import { ESIGN_CONSENT } from "../agreement";
import { SignPad } from "../sign-pad";
import { optionRollup, sendAgreementEmail, emailCoSigner, startAgreement } from "../store";
import { paySummary } from "./part-01";

export function SignCeremonyView59(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
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
