import { useState } from "react";
import { createPortal } from "react-dom";
import { Download, Expand, Mail, Printer, X } from "lucide-react";
import { Tip } from "@/components/tip";
import { money } from "@/lib/crm-data";
import { placeLine } from "@/lib/place";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { useBrand } from "@/features/brand/store";
import { useOps } from "@/features/ops/store";
import { sendMessage } from "@/features/thread/store";
import { SignDialog } from "./sign-ceremony";
import { optionRollup, sendAgreementEmail, startAgreement, type Agreement, type Proposal } from "./store";

function htmlOf(fileUrl: string) {
  return decodeURIComponent(fileUrl.slice(fileUrl.indexOf(",") + 1));
}

function printAgreement(fileUrl: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("title", "Print agreement");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(htmlOf(fileUrl));
  doc.close();
  window.setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 500);
  }, 250);
}

function AgreementReader({ agreement, personId, onClose }: { agreement: Agreement; personId: string; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  function emailCopy() {
    if (!agreement.fileUrl) return;
    sendMessage(personId, `Copy of the signed ${agreement.kind === "change" ? "change order" : "agreement"} for ${agreement.optionName}. Open it to print, or save it as a PDF.`, "email", {
      subject: `Agreement copy: ${agreement.optionName}`,
      files: [{ name: agreement.fileName ?? "agreement.html", kind: "file", src: agreement.fileUrl }],
    });
    setSent(true);
  }
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" role="dialog" aria-modal="true" aria-label="Agreement">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-md bg-card shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="type-group">{agreement.kind === "change" ? "Change order" : "Agreement"} · {agreement.optionName}</p>
          <div className="flex items-center gap-1">
            {agreement.fileUrl ? (
              <Tip label="Download" on>
                <a href={agreement.fileUrl} download={agreement.fileName ?? "agreement.html"} aria-label="Download" className="grid size-10 place-items-center rounded-md text-navy">
                  <Download className="size-4" />
                </a>
              </Tip>
            ) : null}
            {agreement.fileUrl ? (
              <Tip label="Print or save as PDF" on>
                <button type="button" aria-label="Print or save as PDF" className="grid size-10 place-items-center rounded-md text-navy" onClick={() => printAgreement(agreement.fileUrl!)}>
                  <Printer className="size-4" />
                </button>
              </Tip>
            ) : null}
            <Tip label={sent ? "Emailed" : "Email a copy"} on>
              <button type="button" aria-label="Email a copy" className="grid size-10 place-items-center rounded-md text-navy" onClick={emailCopy}>
                <Mail className="size-4" />
              </button>
            </Tip>
            <button type="button" className="grid size-10 place-items-center text-muted" aria-label="Close" onClick={onClose}>
              <X className="size-5" />
            </button>
          </div>
        </div>
        {agreement.fileUrl ? (
          <iframe title={agreement.id} srcDoc={htmlOf(agreement.fileUrl)} className="min-h-0 w-full flex-1 bg-white" />
        ) : (
          <p className="type-body p-6">This agreement does not have a file yet.</p>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function signedProposals(personId: string, all: Record<string, Proposal>) {
  return Object.values(all).filter((p) => p.personId === personId && (p.agreement?.status === "Signed" || p.agreements?.some((a) => a.status === "Signed")));
}

export function AgreementPanel({ proposal, fileOnly = false }: { proposal: Proposal; fileOnly?: boolean }) {
  const brand = useBrand();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const [inPerson, setInPerson] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const packet = proposal.agreement;
  const file = (proposal.agreements ?? []).filter((a) => a.status === "Signed" || a.status === "Partial" || a.status === "Void" || a.id === packet?.id);
  const open = file.find((a) => a.id === openId);
  const co = lead?.secondaryName ? { name: lead.secondaryName, email: lead.secondaryEmail ?? "" } : undefined;

  function prepare(kind: "original" | "change") {
    if (!proposal.accepted || !lead) return;
    const opt = proposal.options.find((o) => o.id === proposal.accepted);
    if (!opt) return;
    startAgreement(proposal.oppId, {
      optionId: opt.id,
      paySummary: `${money(optionRollup(opt).total)} on the accepted option`,
      address: placeLine(lead.address, lead.city, lead.office),
      customer: lead.name,
      email: lead.email,
      company: brand.name,
      license: brand.license,
      coSigner: co,
      kind,
    });
  }

  function email() {
    if (!packet || packet.status === "Void" || packet.optionId !== proposal.accepted || (co && !packet.coSigner)) prepare("original");
    sendAgreementEmail(proposal.oppId, window.location.origin);
  }

  return (
    <FileBlock title="Agreement" hint="Signed agreements stay on this file. A change order does not replace the original.">
      {file.length ? (
        <ul className="mb-4 divide-y divide-line">
          {file.map((a) => (
            <li key={a.id} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="type-value">{a.kind === "change" ? "Change order" : "Original"} · {a.optionName}</p>
                <p className="type-meta">{a.status}</p>
              </div>
              <p className="type-meta mt-1">
                {a.signerName ? `${a.signerName} signed` : "Not signed"}
                {a.coSigner ? ` · ${a.coSigner.name}${a.coSigner.signature ? " signed" : " waiting"}` : ""}
              </p>
              {a.fileUrl ? (
                <div className="relative mt-3">
                  <iframe title={a.id} srcDoc={htmlOf(a.fileUrl)} className="h-80 w-full rounded-md border border-line bg-white" />
                  <Tip label="Expand" on>
                    <button type="button" aria-label="Expand" className="absolute top-2 right-2 grid size-9 place-items-center rounded-md border border-line bg-card text-navy shadow-sm" onClick={() => setOpenId(a.id)}>
                      <Expand className="size-4" />
                    </button>
                  </Tip>
                </div>
              ) : (
                <button type="button" className="mt-3 h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => setOpenId(a.id)}>
                  Expand
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {open ? <AgreementReader agreement={open} personId={proposal.personId} onClose={() => setOpenId(null)} /> : null}

      {!fileOnly && !proposal.accepted ? <p className="type-meta">Accept an option on the Proposal tab first.</p> : null}

      {!fileOnly && proposal.accepted && packet?.status !== "Signed" ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => setInPerson(true)}>
            Sign in person
          </button>
          <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={email}>
            {co ? "Email the primary first" : "Email to sign"}
          </button>
        </div>
      ) : null}

      {!fileOnly && proposal.accepted && packet?.status === "Signed" ? (
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => prepare("change")}>
          Change order
        </button>
      ) : null}

      {!fileOnly && packet && packet.status !== "Signed" && packet.status !== "Void" ? (
        <p className="type-meta mt-3">
          {packet.kind === "change" ? "Change order" : "Original"} · {packet.status}
          {packet.coSigner ? ` · Co-signer ${packet.coSigner.name}` : ""}
        </p>
      ) : null}

      {!fileOnly && inPerson && proposal.accepted ? <SignDialog proposal={proposal} optionId={proposal.accepted} onClose={() => setInPerson(false)} /> : null}
    </FileBlock>
  );
}
