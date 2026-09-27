import type { Agreement, SignEvent } from "./types";
import { itemBySku, pickFits, resolvePicks } from "@/features/catalog/store";
import { assessmentForLead } from "@/features/assessment/store";
import { agreementPage } from "../agreement";

export function hvacFromAssessment(leadId: string) {
  const fields = assessmentForLead(leadId)?.packets.find((p) => p.id === "hvac")?.fields;
  if (!fields) return undefined;
  const system = fields["System type"];
  const ton = fields["Tonnage"];
  if (!system && !ton) return undefined;
  let type = "split";
  let fuel = "gas";
  if (system === "Package") type = "package";
  else if (system === "Mini-split") {
    type = "mini";
    fuel = "hp";
  } else if (system === "Heat pump") fuel = "hp";
  else if (system === "Dual fuel") fuel = "dual";
  const brand = (fields["Brand"] ?? "").toLowerCase();
  const seed = { type, fuel, ...(ton ? { size: ton } : {}) };
  const item = itemBySku("hvac");
  if (!item || !brand) return seed;
  const resolved = resolvePicks(item, seed);
  const match = item.choices?.find((c) => c.id === "equip")?.picks.find((p) => pickFits(p, resolved) && p.label.toLowerCase().includes(brand));
  return match ? { ...resolved, equip: match.id } : resolved;
}

export function esc(value: string) {
  return value.replace(/&/g, "&" + "amp;").replace(/</g, "&" + "lt;").replace(/>/g, "&" + "gt;");
}

export function agreementFile(agreement: Agreement) {
  const primary = `<p>${esc(agreement.signerName ?? "")} · ${agreement.signedAt ?? ""}</p><p>${agreement.method === "in-home" ? "Signed in person" : "Signed from email"}${agreement.witness ? ` · Witness ${esc(agreement.witness)}` : ""}</p>${agreement.signature ? `<img alt="Primary signature" src="${agreement.signature}" style="height:88px;margin-top:8px;background:#fff">` : ""}`;
  const co = agreement.coSigner?.signature
    ? `<p style="margin-top:16px">${esc(agreement.coSigner.name)} · ${agreement.coSigner.signedAt ?? ""}</p><p>Co-signer · ${agreement.coSigner.method === "in-home" ? "Signed in person" : "Signed from email"}</p><img alt="Co-signer signature" src="${agreement.coSigner.signature}" style="height:88px;margin-top:8px;background:#fff">`
    : "";
  const signature = `<section class="ag-sign">${primary}${co}<p>Record ${agreement.hash}</p></section>`;
  const page = agreementPage(agreement.html || `<pre>${esc(agreement.body)}</pre>`, signature);
  return { fileName: `${agreement.id}.html`, fileUrl: `data:text/html;charset=utf-8,${encodeURIComponent(page)}` };
}

export function stamp(kind: SignEvent["kind"], who: string, detail: string): SignEvent {
  return { at: new Date().toISOString(), kind, who, detail };
}
