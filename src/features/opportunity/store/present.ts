import { listeners, snap, proposals, write_proposals, emit } from "./core";
import type { DocStub, Agreement, Proposal } from "./types";
import { optionTotal } from "./options";
import { stamp } from "./seed-04";
import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { money, leads } from "@/lib/crm-data";
import { sendMessage } from "@/features/thread/store";

export function useProposals() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snap,
    snap,
  );
}

export function useProposal(oppId: string) {
  return useProposals()[oppId];
}

export function generateProposal(oppId: string) {
  const p = proposals[oppId];
  if (!p) return false;
  if (!p.payOffers.length) return false;
  const doc: DocStub = {
    id: `D-${p.documents.length + 1}`,
    kind: "proposal",
    status: "Generated",
    at: new Date().toISOString(),
    totals: p.options.map((o) => ({ id: o.id, name: o.name, amount: optionTotal(o) })),
  };
  write_proposals({
    ...proposals,
    [oppId]: { ...p, proposalStatus: "Generated", documents: [doc, ...p.documents] },
  });
  addHistory(p.personId, actingName(), `Proposal generated. ${p.options.map((o) => `${o.name} ${money(optionTotal(o))}`).join(" · ")}.`);
  emit();
  return true;
}

export function sendProposal(oppId: string) {
  sendCustomerFile(oppId, "proposal");
}

export function sendCustomerFile(oppId: string, kind: "report" | "proposal" | "packet", origin = "") {
  const p = proposals[oppId];
  if (!p) return false;
  if ((kind === "proposal" || kind === "packet") && !p.payOffers.length) return false;
  const lead = leads.find((l) => l.id === p.personId);
  const name = kind === "report" ? "Assessment report" : kind === "packet" ? "Report and proposal" : "Proposal";
  const doc: DocStub = {
    id: `D-${p.documents.length + 1}`,
    kind,
    status: "Sent",
    at: new Date().toISOString(),
    fileName: name,
    totals: kind === "report" ? undefined : p.options.map((o) => ({ id: o.id, name: o.name, amount: optionTotal(o) })),
  };
  const path = kind === "report" ? "?doc=report" : kind === "packet" ? "?doc=packet" : "";
  const url = origin ? `${origin}/proposal/${oppId}${path}` : "";
  const where = lead?.address || lead?.name || "this house";
  const body =
    kind === "report"
      ? `Assessment report for ${where}. This file has the measurements. It does not have prices.${url ? `\n\n${url}` : ""}`
      : kind === "packet"
        ? `Two documents for ${where}, sent as one file. The assessment report is first. The proposal, with prices, starts after it.${url ? `\n\n${url}` : ""}`
        : `Proposal for ${where}.${url ? `\n\n${url}` : ""}`;
  sendMessage(p.personId, body, "email", { subject: `${name} · ${where}` });
  write_proposals({
    ...proposals,
    [oppId]: { ...p, proposalStatus: kind === "report" ? p.proposalStatus : "Sent", documents: [doc, ...p.documents] },
  });
  addHistory(p.personId, actingName(), `${name} sent.`);
  emit();
  return true;
}

export function sendToSign(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({
    ...proposals,
    [oppId]: {
      ...p,
      signStatus: "Sent",
      documents: [{ id: `D-${p.documents.length + 1}`, kind: "agreement", status: "Sent", at: new Date().toISOString() }, ...p.documents],
    },
  });
  addHistory(p.personId, actingName(), "Agreement sent to sign.");
  emit();
}

export function voided(agreement: Agreement, who: string, detail: string): Agreement {
  return { ...agreement, status: "Void", events: [...agreement.events, stamp("voided", who, detail)] };
}

export function withAgreement(p: Proposal, agreement: Agreement, extra: Partial<Proposal> = {}): Proposal {
  const agreements = [...(p.agreements ?? []).filter((a) => a.id !== agreement.id), agreement];
  return { ...p, ...extra, agreement, agreements };
}
