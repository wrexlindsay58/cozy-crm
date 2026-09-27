import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { money } from "@/lib/crm-data";
import { generateProposal, optionRollup, sendAgreementEmail, sendCustomerFile, startAgreement, type Proposal } from "../store";
import { useBrand } from "@/features/brand/store";
import { useOps } from "@/features/ops/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { reportAccess } from "@/features/assessment/figures";
import { placeLine } from "@/lib/place";
import { SignDialog } from "../sign-ceremony";
import { ProposalPanelView3, ProposalPanelView10 } from "./part-02";

export function ProposalPanel({ proposal }: { proposal: Proposal }) {
  const navigate = useNavigate();
  const docs = proposal.documents.filter((d) => d.kind === "proposal" || d.kind === "agreement" || d.kind === "report" || d.kind === "packet");
  const [needPay, setNeedPay] = useState(false);
  const [feeHold, setFeeHold] = useState(false);
  const [inPerson, setInPerson] = useState(false);
  useAssessments();
  const brand = useBrand();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const assess = assessmentForLead(proposal.personId);
  const reportOpen =
    !assess ||
    reportAccess({
      occupancy: assess.property.occupancy,
      bothHome: assess.property.bothHome,
      intent: assess.intent,
      homeownerAnswer: lead?.qualify?.["Q-3"],
      ownersAnswer: lead?.qualify?.["Q-2"],
      paid: assess.reportPaid,
      waivedBy: assess.reportWaivedBy,
    }).unlocked;
  const signed = proposal.agreement?.status === "Signed" || proposal.agreements?.some((a) => a.status === "Signed");
  const sold = proposal.options.find((o) => o.id === proposal.accepted);
  const priced = proposal.options.filter((o) => o.lines.length > 0);
  const ready = priced.length > 0 && proposal.payOffers.length > 0;

  function openDoc(doc?: "report" | "packet" | "proposal") {
    if (doc !== "report") {
      const ok = generateProposal(proposal.oppId);
      if (!ok) {
        setNeedPay(true);
        return;
      }
    }
    setNeedPay(false);
    navigate({ to: "/proposal/$oppId", params: { oppId: proposal.oppId }, search: { mode: "present", doc } });
  }

  function send(kind: "report" | "proposal" | "packet") {
    if ((kind === "report" || kind === "packet") && !reportOpen) {
      setFeeHold(true);
      return;
    }
    setFeeHold(false);
    const ok = sendCustomerFile(proposal.oppId, kind, window.location.origin);
    if (!ok) setNeedPay(true);
  }

  return (
    <ProposalPanelView3 bag={{ sold, ready, proposal, priced, needPay, signed, setInPerson, lead, brand, inPerson, openDoc, send, feeHold, docs }} />
  );
}

export function ProposalPanelView(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView4 bag={{ proposal }} />
  );
}

export function ProposalPanelView2(props: { bag: { setInPerson: any; lead: any; proposal: any; brand: any; inPerson: any } }) {
  const { setInPerson, lead, proposal, brand, inPerson } = props.bag;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => setInPerson(true)}>
            Sign in person
          </button>
          <button
            type="button"
            className="h-10 rounded-md border border-line px-3 text-sm font-semibold"
            onClick={() => {
              if (!lead) return;
              const opt = proposal.options.find((o: any) => o.id === proposal.accepted);
              if (!opt) return;
              if (!proposal.agreement || proposal.agreement.status === "Void" || proposal.agreement.optionId !== opt.id) {
                startAgreement(proposal.oppId, {
                  optionId: opt.id,
                  paySummary: `${money(optionRollup(opt).total)} on the accepted option`,
                  address: placeLine(lead.address, lead.city, lead.office),
                  customer: lead.name,
                  email: lead.email,
                  company: brand.name,
                  license: brand.license,
                  coSigner: lead.secondaryName ? { name: lead.secondaryName, email: lead.secondaryEmail ?? "" } : undefined,
                });
              }
              sendAgreementEmail(proposal.oppId, window.location.origin);
            }}
          >
            {lead?.secondaryName ? "Email the primary first" : "Email to sign"}
          </button>
          {inPerson ? <SignDialog proposal={proposal} optionId={proposal.accepted} onClose={() => setInPerson(false)} /> : null}
        </div>
  );
}

function ProposalPanelView4(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView5 bag={{ proposal }} />
  );
}

function ProposalPanelView5(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView6 bag={{ proposal }} />
  );
}

function ProposalPanelView6(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView7 bag={{ proposal }} />
  );
}

function ProposalPanelView7(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView8 bag={{ proposal }} />
  );
}

function ProposalPanelView8(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView9 bag={{ proposal }} />
  );
}

function ProposalPanelView9(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ProposalPanelView10 bag={{ proposal }} />
  );
}
