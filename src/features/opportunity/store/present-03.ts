import { proposals, write_proposals, emit } from "./core";
import { withAgreement } from "./present";
import { stamp, agreementFile } from "./seed-04";
import type { Agreement } from "./types";
import { emailCoSigner } from "./present-02";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { money } from "@/lib/crm-data";
import { sendMessage } from "@/features/thread/store";

export function markAgreementOpened(oppId: string, token: string) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.token !== token || agreement.status === "Signed" || agreement.status === "Void" || agreement.status === "Partial" || agreement.openedAt) return;
  write_proposals({
    ...proposals,
    [oppId]: withAgreement(p, { ...agreement, status: "Opened", openedAt: new Date().toISOString(), events: [...agreement.events, stamp("opened", agreement.customer, "Opened the agreement.")] }),
  });
  emit();
}

export function noteAgreementRead(oppId: string, token: string) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.token !== token || agreement.events.some((e) => e.kind === "read")) return;
  write_proposals({ ...proposals, [oppId]: withAgreement(p, { ...agreement, events: [...agreement.events, stamp("read", agreement.customer, "Scrolled through the agreement.")] }) });
  emit();
}

export function signAgreement(
  oppId: string,
  input: { token?: string; name: string; signature: string; method: "in-home" | "email"; witness?: string; role?: "primary" | "co"; origin?: string },
) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.status === "Signed" || agreement.status === "Void") return false;
  if (input.method === "email" && input.token !== agreement.token) return false;
  const name = input.name.trim();
  if (name.length < 3 || !input.signature.startsWith("data:image")) return false;
  const signedAt = new Date().toISOString();
  const role = input.role ?? (agreement.status === "Partial" ? "co" : "primary");
  if (role === "co") {
    if (!agreement.coSigner || !agreement.signerName) return false;
    const coSigner = { ...agreement.coSigner, name, signedAt, signature: input.signature, method: input.method };
    const next: Agreement = {
      ...agreement,
      status: "Signed",
      coSigner,
      signedAt,
      events: [...agreement.events, stamp("signed", name, `Co-signer signed ${agreement.optionName}. Record ${agreement.hash}.`)],
    };
    const file = agreementFile(next);
    next.fileName = file.fileName;
    next.fileUrl = file.fileUrl;
    write_proposals({
      ...proposals,
      [oppId]: withAgreement(p, next, {
        accepted: agreement.optionId,
        signStatus: "Signed",
        documents: [{ id: agreement.id, kind: "agreement" as const, status: "Signed", at: signedAt, fileName: file.fileName, fileUrl: file.fileUrl }, ...p.documents],
      }),
    });
    sendMessage(p.personId, `${agreement.signerName} and ${name} signed ${agreement.optionName}. Record ${agreement.hash}. The signed file is attached.`, "email", {
      subject: `Signed copy: ${agreement.optionName}`,
      files: [{ name: file.fileName, kind: "file", src: file.fileUrl }],
    });
    addHistory(p.personId, name, `Co-signer signed. ${agreement.hash}.`);
    if (input.method === "in-home") addHistory(p.personId, actingName(), `Collected the co-signer signature from ${name}.`);
    emit();
    return "done" as const;
  }
  const who = input.method === "in-home" ? `${name}, witnessed by ${actingName()}` : name;
  if (agreement.coSigner) {
    const next: Agreement = {
      ...agreement,
      status: "Partial",
      method: input.method,
      signerName: name,
      signature: input.signature,
      witness: input.method === "in-home" ? actingName() : undefined,
      signedAt,
      events: [...agreement.events, stamp("signed", who, "Primary signed. Waiting on the co-signer.")],
    };
    write_proposals({ ...proposals, [oppId]: withAgreement(p, next, { accepted: agreement.optionId, signStatus: "Waiting on co-signer" }) });
    if (input.method === "email" && input.origin) emailCoSigner(oppId, input.origin);
    addHistory(p.personId, name, "Primary signed. Co-signer is next.");
    if (input.method === "in-home") addHistory(p.personId, actingName(), `Collected the signature from ${name}.`);
    emit();
    return "partial" as const;
  }
  const next: Agreement = {
    ...agreement,
    status: "Signed",
    method: input.method,
    signerName: name,
    signature: input.signature,
    witness: input.method === "in-home" ? input.witness || p.closer : undefined,
    signedAt,
    events: [
      ...agreement.events,
      stamp("consented", name, "Agreed to electronic records and intended to sign."),
      stamp("signed", who, `Signed ${agreement.optionName}. Record ${agreement.hash}.`),
    ],
  };
  const file = agreementFile(next);
  next.fileName = file.fileName;
  next.fileUrl = file.fileUrl;
  write_proposals({
    ...proposals,
    [oppId]: withAgreement(p, next, {
      accepted: agreement.optionId,
      signStatus: "Signed",
      documents: [{ id: agreement.id, kind: "agreement" as const, status: "Signed", at: signedAt, fileName: file.fileName, fileUrl: file.fileUrl }, ...p.documents],
    }),
  });
  sendMessage(p.personId, `${name} signed ${agreement.optionName} for ${money(agreement.price)} on ${signedAt}. Record ${agreement.hash}. The signed file is attached.`, "email", {
    subject: `Signed copy: ${agreement.optionName}`,
    files: [{ name: file.fileName, kind: "file", src: file.fileUrl }],
  });
  addHistory(p.personId, name, `Signed the agreement in ${input.method === "in-home" ? "the home" : "email"}. ${agreement.hash}.`);
  if (input.method === "in-home") addHistory(p.personId, actingName(), `Collected the signature from ${name}.`);
  emit();
  return "done" as const;
}

export function requestDeposit(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  addHistory(p.personId, actingName(), "Deposit requested on the card.");
  emit();
}
