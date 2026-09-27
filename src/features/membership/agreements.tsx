import { useState } from "react";
import { createPortal } from "react-dom";
import { Download, Expand, Printer, X } from "lucide-react";
import { Tip } from "@/components/tip";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { useBrand } from "@/features/brand/store";
import { noteMemberSigned } from "@/features/opportunity/store";
import { acceptMembership } from "./store";
import type { MembershipFile } from "./types";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

function agreementHtml(title: string, body: string) {
  const lines = body.split("\n");
  const rest = lines[0]?.trim() === title.trim() ? lines.slice(1) : lines;
  const paras = rest
    .map((line) => (line.trim() ? `<p>${escapeHtml(line)}</p>` : ""))
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  html, body { height: 100%; margin: 0; }
  body { box-sizing: border-box; min-height: 100%; padding: 28px 32px; color: #10233f; font-family: "Source Sans 3", "Segoe UI", sans-serif; font-size: 15px; line-height: 1.55; }
  h1 { margin: 0 0 20px; font-family: Oswald, "Segoe UI", sans-serif; font-size: 28px; font-weight: 500; letter-spacing: 0.02em; }
  p { margin: 0 0 12px; }
</style></head><body><h1>${escapeHtml(title)}</h1>${paras}</body></html>`;
}

function printHtml(html: string) {
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
  doc.write(html);
  doc.close();
  window.setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 500);
  }, 250);
}

function AgreementReader({ title, html, fileName, onClose }: { title: string; html: string; fileName: string; onClose: () => void }) {
  const href = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" role="dialog" aria-modal="true" aria-label="Membership agreement">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-md bg-card shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="type-group">{title}</p>
          <div className="flex items-center gap-1">
            <Tip label="Download" on>
              <a href={href} download={fileName} aria-label="Download" className="grid size-10 place-items-center rounded-md text-navy">
                <Download className="size-4" />
              </a>
            </Tip>
            <Tip label="Print or save as PDF" on>
              <button type="button" aria-label="Print or save as PDF" className="grid size-10 place-items-center rounded-md text-navy" onClick={() => printHtml(html)}>
                <Printer className="size-4" />
              </button>
            </Tip>
            <button type="button" className="grid size-10 place-items-center text-muted" aria-label="Close" onClick={onClose}>
              <X className="size-5" />
            </button>
          </div>
        </div>
        <iframe title={title} srcDoc={html} className="min-h-0 w-full flex-1 bg-white" />
      </div>
    </div>,
    document.body,
  );
}

export function MembershipAgreements({ file }: { file: MembershipFile }) {
  const brand = useBrand();
  const [signer, setSigner] = useState(file.agreement?.signer ?? "");
  const [miss, setMiss] = useState(false);
  const [open, setOpen] = useState(false);
  const agreement = file.agreement;
  const signed = agreement?.status === "Signed";
  const body = agreement?.body ?? "";
  const title = `${brand.name} membership agreement`;
  const html = body ? agreementHtml(title, body) : "";

  return (
    <FileBlock
      title="Membership agreement"
      hint={signed ? `Signed by ${agreement.signer} · ${agreement.at}` : "Ready to sign here, even if the plan was started on an opportunity."}
      fill
    >
      {html ? (
        <div className="relative min-h-0 flex-1">
          <iframe title={title} srcDoc={html} className="absolute inset-0 h-full w-full bg-white" />
          <Tip label="Expand" on>
            <button type="button" aria-label="Expand" className="absolute top-3 right-3 grid size-9 place-items-center rounded-md border border-line bg-card text-navy shadow-sm" onClick={() => setOpen(true)}>
              <Expand className="size-4" />
            </button>
          </Tip>
        </div>
      ) : (
        <p className="px-4 py-3 text-sm text-muted">No agreement on this plan yet.</p>
      )}
      {open && html ? <AgreementReader title={title} html={html} fileName={`${file.id}-membership.html`} onClose={() => setOpen(false)} /> : null}
      {signed ? null : (
        <form
          className="space-y-2 border-t border-line px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!signer.trim()) {
              setMiss(true);
              return;
            }
            const next = acceptMembership(file.id, signer, brand.name);
            if (next && file.oppId) noteMemberSigned(file.oppId, signer.trim());
          }}
        >
          <label className="block text-sm">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Signer</span>
            <input
              value={signer}
              onChange={(e) => setSigner(e.target.value)}
              className={miss && !signer.trim() ? "mt-1 h-11 w-full rounded-md border border-stop px-3" : "mt-1 h-11 w-full rounded-md border border-line px-3"}
            />
          </label>
          {miss && !signer.trim() ? <p className="text-sm text-stop">The name is required before this can be signed.</p> : null}
          <button type="submit" className="h-11 rounded-md bg-navy px-4 text-sm font-semibold text-card">
            Sign the membership
          </button>
        </form>
      )}
    </FileBlock>
  );
}
