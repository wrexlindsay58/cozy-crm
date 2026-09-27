import { cozyWordmarkSvg } from "@/components/cozy-mark";
import { ESIGN_CONSENT, esc, TERMS } from "./part-01";

export function prep_agreementDocument(input: any) {
  const scope = input.included.length
    ? input.included.map((line: any, i: any) => `${i + 1}. ${line.label}${line.detail ? ` — ${line.detail}` : ""}`)
    : ["No products are listed. Do not sign until the scope is filled in."];
  const text = [
    "INSTALLATION AGREEMENT",
    input.company,
    input.tagline,
    `License ${input.license}`,
    `${input.city} · ${input.phone} · ${input.companyEmail} · ${input.web}`,
    "",
    "Customer",
    input.customer,
    input.email,
    input.address,
    "",
    "Option",
    input.optionName,
    "",
    "Contract price",
    input.price,
    input.paySummary,
    `Discount ${input.discount}`,
    `Rebate at sale ${input.rebateAtSale}`,
    `Rebate after the job ${input.rebateAfter}`,
    "",
    "Scope of work",
    ...scope,
    "",
    "Terms",
    ...TERMS.flatMap(([title, body]) => [title, body, ""]),
    ESIGN_CONSENT,
    "",
    `Prepared ${input.prepared}`,
    "This agreement is good for 14 days from the prepared date unless it is signed sooner.",
  ].join("\n");
  const logo = input.logoUrl
    ? `<img class="ag-logo-img" src="${esc(input.logoUrl)}" alt="${esc(input.company)}">`
    : cozyWordmarkSvg(input.red, input.navy);
  const rows = input.included
    .map(
      (line: any) =>
        `<li><strong>${esc(line.label)}</strong>${line.detail ? `<span>${esc(line.detail)}</span>` : ""}</li>`,
    )
    .join("");
  const terms = TERMS.map(
    ([title, body]) => `<section><h3>${esc(title)}</h3><p>${esc(body)}</p></section>`,
  ).join("");
  return { logo, rows, terms, text };
}
