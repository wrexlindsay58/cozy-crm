import type { Proposal, Agreement } from "./types";
import { optionRollup, isProductLine } from "./seed";
import { payLabel } from "./seed-02";
import { stamp, agreementFile, hvacFromAssessment } from "./seed-04";
import { itemBySku } from "@/features/catalog/store";
import { assessmentForLead } from "@/features/assessment/store";
import { money, leads } from "@/lib/crm-data";
import { agreementDocument, fingerprint } from "../agreement";
import { getBrand } from "@/features/brand/store";
import { picksOn } from "../proposal-copy";

export function attachSigned(p: Proposal): Proposal {
  if (p.signStatus !== "Signed" || !p.accepted) return p;
  const lead = leads.find((l) => l.id === p.personId);
  const opt = p.options.find((o) => o.id === p.accepted);
  if (!lead || !opt) return p;
  const brand = getBrand();
  const roll = optionRollup(opt);
  const lines = opt.lines.filter((l) => isProductLine(l) || l.kind === "adder" || l.adder);
  const preparedOn = "September 12, 2026";
  const doc = agreementDocument({
    company: brand.name,
    tagline: brand.tagline,
    phone: brand.phone,
    companyEmail: brand.email,
    web: brand.web,
    license: brand.license,
    city: brand.city,
    logoUrl: brand.logo,
    navy: brand.navy,
    red: brand.red,
    ink: brand.ink,
    paper: brand.paper,
    fontHead: brand.fontHead,
    fontSub: brand.fontSub,
    fontBody: brand.fontBody,
    customer: lead.name,
    email: lead.email,
    address: `${lead.address}, ${lead.city}`,
    optionName: opt.name,
    price: money(roll.total),
    paySummary: payLabel(p.payOffers.find((o) => o.id === p.payPick?.offerId) ?? p.payOffers[0]),
    included: lines.map((l) => ({ label: l.qty > 1 ? `${l.label} × ${l.qty}` : l.label, detail: picksOn(l) })),
    discount: money(roll.discount),
    rebateAtSale: money(roll.pos),
    rebateAfter: money(roll.after),
    prepared: preparedOn,
  });
  const agreement: Agreement = {
    id: `AG-${p.oppId}`,
    token: `seed-${p.oppId}`,
    status: "Signed",
    kind: "original",
    optionId: opt.id,
    optionName: opt.name,
    price: roll.total,
    paySummary: payLabel(p.payOffers.find((o) => o.id === p.payPick?.offerId) ?? p.payOffers[0]),
    included: lines.map((l) => l.label),
    address: `${lead.address}, ${lead.city}`,
    customer: lead.name,
    email: lead.email,
    company: brand.name,
    license: brand.license,
    body: doc.text,
    html: doc.html,
    hash: fingerprint(doc.text),
    createdAt: "2026-09-12T16:00:00.000Z",
    signedAt: "2026-09-12T16:40:00.000Z",
    method: "in-home",
    signerName: lead.name,
    witness: p.closer,
    coSigner: lead.secondaryName ? { name: lead.secondaryName, email: lead.secondaryEmail ?? "", signedAt: "2026-09-12T16:42:00.000Z", method: "in-home" } : undefined,
    events: [stamp("prepared", p.closer, "Agreement prepared."), stamp("signed", lead.name, "Signed in the home.")],
  };
  const file = agreementFile(agreement);
  agreement.fileName = file.fileName;
  agreement.fileUrl = file.fileUrl;
  return {
    ...p,
    agreement,
    agreements: [agreement],
    documents: [{ id: agreement.id, kind: "agreement", status: "Signed", at: agreement.signedAt ?? "", fileName: file.fileName, fileUrl: file.fileUrl }],
  };
}

export function catalogItem(sku: string) {
  return itemBySku(sku) ?? itemBySku(sku.split("@")[0] ?? sku);
}

export function picksFromAssessment(sku: string, leadId: string) {
  if (sku === "hvac") return hvacFromAssessment(leadId);
  const assess = assessmentForLead(leadId);
  if (!assess) return undefined;
  if (sku === "removal") {
    const fields = assess.packets.find((p) => p.id === "attic")?.fields ?? {};
    const type = (fields["Insulation type"] ?? "").toLowerCase();
    const depth = Number(fields["Depth (in)"]);
    let existing = "cellulose";
    if (type.includes("spray")) existing = "foam";
    else if (type.includes("batt")) existing = "batt";
    else if (type.includes("fiberglass")) existing = "fiberglass";
    else if (type.includes("none")) existing = "none";
    let band = "mid";
    if (fields["Depth (in)"] && !Number.isNaN(depth)) {
      if (depth < 4) band = "shallow";
      else if (depth <= 7) band = "mid";
      else if (depth <= 12) band = "deep";
      else band = "heavy";
    }
    return { existing, depth: band };
  }
  if (sku === "ducts") {
    const fields = assess.packets.find((p) => p.id === "ducts")?.fields ?? {};
    const mat = (fields["Material"] ?? "").toLowerCase();
    const r = fields["Duct insulation (R)"] ?? "";
    let material = "flex";
    if (mat.includes("metal")) material = "metal";
    else if (mat.includes("board")) material = "board";
    return { material, wrap: r.includes("8") ? "r8" : "r6" };
  }
  return undefined;
}
