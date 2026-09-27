import { money } from "@/lib/crm-data";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { feeCeiling } from "../store";
import { PlanNumbers } from "@/features/membership/plan-offer";
import { ProposalPanelView, ProposalPanelView2 } from "./part-01";
import { ProposalPanelView19 } from "./part-03";

export function ProposalPanelView3(props: { bag: { sold: any; ready: any; proposal: any; priced: any; needPay: any; signed: any; setInPerson: any; lead: any; brand: any; inPerson: any; openDoc: any; send: any; feeHold: any; docs: any } }) {
  const { sold, ready, proposal, priced, needPay, signed, setInPerson, lead, brand, inPerson, openDoc, send, feeHold, docs } = props.bag;
  return (
    <FileBlock
      title="Proposal"
      hint={sold ? `${sold.name} is the sold option.` : ready ? "Ready to put in front of them." : "Not ready to present."}
      aside={<p className="type-value text-navy">{proposal.proposalStatus}</p>}
    >
      <ProposalPanelView bag={{ proposal }} />
      {proposal.memberOffer ? <div className="mt-4"><PlanNumbers proposal={proposal} /></div> : null}
      {proposal.matchHighFee && proposal.payOffers.length ? <p className="type-meta mt-4">Payments matched to the {feeCeiling(proposal)}% fee.</p> : null}

      {!ready ? (
        <ul className="mt-3 space-y-1">
          {priced.length === 0 ? <li className="type-body text-stop">Add a priced line to an option.</li> : null}
          {proposal.payOffers.length === 0 || needPay ? <li className="type-body text-stop">Add cash, card, or financing.</li> : null}
        </ul>
      ) : null}

      {signed ? (
        <p className="type-meta mt-4">The signed agreement is on the Agreement tab.</p>
      ) : proposal.accepted ? (
        <ProposalPanelView2 bag={{ setInPerson, lead, proposal, brand, inPerson }} />
      ) : (
        <p className="type-meta mt-4">Accept an option, then sign it in person or from Present.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => openDoc("report")}>
          Report
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => openDoc("proposal")}>
          Proposal
        </button>
        <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => openDoc()}>
          Present both
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => send("report")}>
          Send report
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => send("proposal")}>
          Send proposal
        </button>
        <button type="button" className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy" onClick={() => send("packet")}>
          Send both
        </button>
      </div>
      <p className="type-meta mt-2">The report and the proposal are separate files. Send both attaches them as one.</p>
      {feeHold ? <p className="mt-2 text-sm text-alert">The report is $149 until they qualify, it is paid, or a fee is waived.</p> : null}

      {docs.length ? (
        <ul className="mt-4 divide-y divide-line">
          {docs.map((d: any) => (
            <li key={d.id}>
              {d.fileUrl ? (
                <a href={d.fileUrl} download={d.fileName ?? "agreement.html"} className="flex w-full items-center justify-between gap-3 py-3 text-left">
                  <span>
                    <span className="type-value">Agreement {d.id}</span>
                    <span className="type-meta mt-0.5 block">{d.status} · Download</span>
                  </span>
                </a>
              ) : (
                <button type="button" className="flex w-full items-center justify-between gap-3 py-3 text-left" onClick={() => openDoc(d.kind === "report" ? "report" : d.kind === "packet" ? "packet" : "proposal")}>
                  <span>
                    <span className="type-value">{d.kind === "agreement" ? "Agreement" : d.kind === "report" ? "Assessment report" : d.kind === "packet" ? "Report and proposal" : "Proposal"} {d.id}</span>
                    <span className="type-meta mt-0.5 block">{d.status}</span>
                  </span>
                  <span className="type-meta">{d.totals?.map((t: any) => money(t.amount)).join("  ") || ""}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </FileBlock>
  );
}

export function ProposalPanelView10(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView11 bag={{ proposal }} />
  );
}

function ProposalPanelView11(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView12 bag={{ proposal }} />
  );
}

function ProposalPanelView12(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView13 bag={{ proposal }} />
  );
}

function ProposalPanelView13(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView14 bag={{ proposal }} />
  );
}

function ProposalPanelView14(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView15 bag={{ proposal }} />
  );
}

function ProposalPanelView15(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView16 bag={{ proposal }} />
  );
}

function ProposalPanelView16(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView17 bag={{ proposal }} />
  );
}

function ProposalPanelView17(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView18 bag={{ proposal }} />
  );
}

function ProposalPanelView18(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView19 bag={{ proposal }} />
  );
}
