import { proposals, write_proposals, emit } from "./core";
import { optionRollup, isProductLine } from "./seed";
import type { Agreement } from "./types";
import { stamp } from "./seed-04";
import { withAgreement } from "./present";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { money } from "@/lib/crm-data";
import { sendMessage } from "@/features/thread/store";
import { agreementDocument, fingerprint } from "../agreement";
import { getBrand } from "@/features/brand/store";
import { picksOn } from "../proposal-copy";

export function startAgreement(
  oppId: string,
  input: {
    optionId: string;
    paySummary: string;
    address: string;
    customer: string;
    email: string;
    company: string;
    license: string;
    coSigner?: { name: string; email: string };
    kind?: "original" | "change";
  },
) {
  const p = proposals[oppId];
  if (!p) return;
  if (p.agreement?.status === "Signed" && input.kind !== "change") return;
  if (input.kind === "change" && p.agreement?.status !== "Signed") return;
  const opt = p.options.find((o) => o.id === input.optionId);
  if (!opt) return;
  const roll = optionRollup(opt);
  const lines = opt.lines.filter((l) => isProductLine(l) || l.kind === "adder" || l.adder);
  const included = lines.map((l) => l.label);
  const brand = getBrand();
  const preparedOn = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const doc = agreementDocument({
    company: brand.name || input.company,
    tagline: brand.tagline,
    phone: brand.phone,
    companyEmail: brand.email,
    web: brand.web,
    license: brand.license || input.license,
    city: brand.city,
    logoUrl: brand.logo,
    navy: brand.navy,
    red: brand.red,
    ink: brand.ink,
    paper: brand.paper,
    fontHead: brand.fontHead,
    fontSub: brand.fontSub,
    fontBody: brand.fontBody,
    customer: input.customer,
    email: input.email,
    address: input.address,
    optionName: opt.name,
    price: money(roll.total),
    paySummary: input.paySummary,
    included: lines.map((l) => ({ label: l.qty > 1 ? `${l.label} × ${l.qty}` : l.label, detail: picksOn(l) })),
    discount: money(roll.discount),
    rebateAtSale: money(roll.pos),
    rebateAfter: money(roll.after),
    prepared: preparedOn,
  });
  const agreement: Agreement = {
    id: input.kind === "change" ? `CO-${(p.agreements?.length ?? 0) + 1}` : `AG-${p.documents.length + 1}`,
    token: crypto.randomUUID(),
    status: "Ready",
    kind: input.kind ?? "original",
    optionId: opt.id,
    optionName: opt.name,
    price: roll.total,
    paySummary: input.paySummary,
    included,
    address: input.address,
    customer: input.customer,
    email: input.email,
    company: brand.name || input.company,
    license: brand.license || input.license,
    body: doc.text,
    html: doc.html,
    hash: fingerprint(doc.text),
    createdAt: new Date().toISOString(),
    coSigner: input.coSigner?.name ? { name: input.coSigner.name, email: input.coSigner.email } : undefined,
    events: [stamp("prepared", p.closer, input.kind === "change" ? "Change order prepared. The original agreement stays on file." : "Agreement prepared for signature.")],
  };
  write_proposals({ ...proposals, [oppId]: withAgreement(p, agreement, { signStatus: input.kind === "change" ? "Change order" : "Ready" }) });
  emit();
}

export function sendAgreementEmail(oppId: string, origin: string) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.status === "Signed" || agreement.status === "Void") return;
  const url = `${origin}/proposal/${oppId}?sign=${agreement.token}`;
  sendMessage(
    p.personId,
    `${agreement.customer}, your agreement for ${agreement.optionName} is ready to read and sign.\n${url}\nRead it through before you sign. A copy comes back to this email after you sign.`,
    "email",
    { subject: `Sign your ${agreement.company} agreement` },
  );
  write_proposals({
    ...proposals,
    [oppId]: withAgreement(p, { ...agreement, status: "Sent", sentAt: new Date().toISOString(), events: [...agreement.events, stamp("sent", p.closer, `Emailed to ${agreement.email}.`)] }, { signStatus: "Sent" }),
  });
  addHistory(p.personId, actingName(), `Agreement emailed to ${agreement.email}.`);
  emit();
}

export function emailCoSigner(oppId: string, origin: string) {
  const p = proposals[oppId];
  const agreement = p?.agreement;
  if (!p || !agreement || agreement.status !== "Partial" || !agreement.coSigner?.email) return;
  const url = `${origin}/proposal/${oppId}?sign=${agreement.token}`;
  sendMessage(
    p.personId,
    `${agreement.coSigner.name}, ${agreement.signerName} signed ${agreement.optionName}. Read it, then add your signature.\n${url}`,
    "email",
    { subject: `Your signature is next: ${agreement.optionName}` },
  );
  write_proposals({
    ...proposals,
    [oppId]: withAgreement(p, { ...agreement, events: [...agreement.events, stamp("sent", p.closer, `Emailed to co-signer ${agreement.coSigner.email}.`)] }),
  });
  addHistory(p.personId, actingName(), `Co-signer email sent to ${agreement.coSigner.email}.`);
  emit();
}
