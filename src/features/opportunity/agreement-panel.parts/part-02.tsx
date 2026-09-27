import { Expand } from "lucide-react";
import { Tip } from "@/components/tip";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { SignDialog } from "../sign-ceremony";
import { htmlOf, AgreementReader } from "./part-01";

export function AgreementPanelView(props: { bag: { file: any; setOpenId: any; open: any; proposal: any; fileOnly: any; packet: any; setInPerson: any; email: any; co: any; prepare: any; inPerson: any } }) {
  const { file, setOpenId, open, proposal, fileOnly, packet, setInPerson, email, co, prepare, inPerson } = props.bag;
  return (
    <FileBlock title="Agreement" hint="Signed agreements stay on this file. A change order does not replace the original.">
      {file.length ? (
        <ul className="mb-4 divide-y divide-line">
          {file.map((a: any) => (
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
