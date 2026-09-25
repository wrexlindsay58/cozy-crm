import { cozyWordmarkSvg } from "@/components/cozy-mark";

export const ESIGN_CONSENT =
  "You agree to use electronic records and an electronic signature for this agreement. You can ask for a paper copy. You need a device that can open this page and an email address where we can send the copy. You can stop before you sign by closing this page. A signature already made stays on the record.";

export function fingerprint(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export type AgreementDoc = {
  company: string;
  tagline: string;
  phone: string;
  companyEmail: string;
  web: string;
  license: string;
  city: string;
  logoUrl: string;
  navy: string;
  red: string;
  ink: string;
  paper: string;
  fontHead: string;
  fontSub: string;
  fontBody: string;
  customer: string;
  email: string;
  address: string;
  optionName: string;
  price: string;
  paySummary: string;
  included: { label: string; detail: string }[];
  discount: string;
  rebateAtSale: string;
  rebateAfter: string;
  prepared: string;
};

function esc(value: string) {
  return value.replace(/&/g, "&" + "amp;").replace(/</g, "&" + "lt;").replace(/>/g, "&" + "gt;");
}

const TERMS = [
  ["Scope only", "The work is only what is written in the scope. Anything not listed is excluded, including painting, drywall finish beyond the opening we make, electrical upgrades, structural repair, code upgrades that were not visible, and haul-away beyond the debris this job creates."],
  ["Price", "The price is the contract price on this page. It is not a line-item bid. Adders and discounts already written here are part of that price. A rebate at sale reduces what is due to us. A rebate after the job is paid by the program to you and does not reduce what you owe us."],
  ["Payment", "You pay by the method on this page. A deposit is due before we order materials or hold a crew. The balance is due when the scope is substantially complete, before we leave the last day, unless financing has already funded. We may stop work if a payment is late. Finance, if chosen, does not start the job until the lender issues a notice to proceed. You still owe the contract price if financing is denied after you sign."],
  ["Change orders", "A change in scope, layout, equipment, or access is a change order. We do not do it until you approve the price and any extra days in writing or by electronic signature. Verbal requests are not part of this agreement."],
  ["Access", "You give us safe access to the attic, equipment, panels, and the work area on the scheduled days. Pets are secured. An adult is available to make decisions. If we cannot work because access is blocked, the day can be billed and the schedule moves."],
  ["Install walk-throughs", "On install day we do a pre-install walk-through and a post-install walk-through. You authorize the person left at the property for the crews to sign those checklists for you. If that person is not a signer on this agreement, we write their name and how they are related to you. Those signatures record the house before we start and the work as we left it. They do not change the price or the scope."],
  ["Concealed conditions", "We price what we could see. Mold, asbestos, knob-and-tube wiring, wet insulation, structural damage, undersized electrical service, and other hidden conditions are not included. We will stop that part of the work and price it before we continue."],
  ["Schedule", "Dates are targets. Weather, inspections, material lead times, and a prior job running long can move them. We will tell you. A delay that is not our failure to show up is not a breach and does not create a credit."],
  ["Permits", "If this scope needs a permit, we pull it and schedule the inspection. You allow the inspector in. Existing unpermitted work is not ours to legalize unless the scope says so."],
  ["Comfort", "We do not guarantee a room will hold a specific temperature, a specific bill, or a specific blower-door number unless that test is written in the scope. The house, ducts, windows, and how it is used all affect the result."],
  ["Workmanship warranty", "We warrant our workmanship for two years from substantial completion: the work will be done in a workmanlike manner and will stay installed as specified. Manufacturer warranties on equipment and materials pass through to you and are not extended by us. The warranty is void if the balance is unpaid, if someone else alters the work, or if the house is not maintained, including filters, drainage, and ventilation."],
  ["What the warranty is not", "We do not warrant existing equipment, existing ducts, the structure, or conditions we did not install. We do not warrant damage from storms, pests, power surges, or lack of access for a callback. A callback is for our work. It is not a new scope."],
  ["Limit of liability", "We are not liable for indirect or consequential loss, including mold that was already present, spoiled food, lodging, or lost wages. Our total liability for this job is capped at the amount you paid us under this agreement."],
  ["Your disclosures", "You tell us about known hazards, prior damage, and anyone else who must approve the work. You are responsible for loss that comes from a condition you knew about and did not tell us."],
  ["Cancellation", "If this was signed at your home, you may cancel within three business days. Notice must be in writing or by email to the company address on this page. After that window, a cancellation before we start is subject to the cost of materials already ordered and a reasonable scheduling charge. After we start, you owe the work performed and the materials that cannot be returned."],
  ["Right to stop", "We may suspend or cancel if you do not pay, you refuse access, or you ask us to work in a way that is unsafe or against code. Suspension is not a waiver of the amount already earned."],
  ["Lien rights", "We, and suppliers we use, may have lien rights under state law for unpaid labor and materials. This sentence is notice of that right. It is not a lien."],
  ["Photos", "We may photograph the work for the job file. We will not use a photo that shows your face or house number in marketing unless you agree separately."],
  ["Disputes", "This agreement is governed by the law of the state where the property sits. You and we will try to resolve a dispute directly before either files a claim. A claim is brought in the county of the property."],
  ["Entire agreement", "This page, including the scope and these terms, is the whole agreement. Proposals, texts, and conversations do not change it. A change has to be a signed change order. If one term is unenforceable, the rest stays."],
];

export function agreementDocument(input: AgreementDoc) {
  const scope = input.included.length
    ? input.included.map((line, i) => `${i + 1}. ${line.label}${line.detail ? ` — ${line.detail}` : ""}`)
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
      (line) =>
        `<li><strong>${esc(line.label)}</strong>${line.detail ? `<span>${esc(line.detail)}</span>` : ""}</li>`,
    )
    .join("");
  const terms = TERMS.map(
    ([title, body]) => `<section><h3>${esc(title)}</h3><p>${esc(body)}</p></section>`,
  ).join("");

  const html = `<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&family=Oswald:wght@500;600&family=Teko:wght@500;600&display=swap');
.ag { box-sizing: border-box; max-width: 760px; margin: 0 auto; padding: 36px 40px 48px; background: #fff; color: ${input.ink}; font-family: '${input.fontBody}', 'IBM Plex Sans', sans-serif; font-size: 14px; line-height: 1.5; }
.ag * { box-sizing: border-box; }
.ag-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding-bottom: 18px; border-bottom: 3px solid ${input.navy}; }
.ag-logo svg, .ag-logo-img { display: block; width: 210px; height: auto; }
.ag-kicker { margin: 0; font-family: '${input.fontSub}', Oswald, sans-serif; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; color: ${input.red}; }
.ag-date { margin: 4px 0 0; text-align: right; color: #5c7380; font-size: 12px; }
.ag h2 { margin: 28px 0 8px; font-family: '${input.fontHead}', Teko, sans-serif; font-size: 28px; font-weight: 600; letter-spacing: 0.02em; line-height: 1; color: ${input.navy}; }
.ag h3 { margin: 0 0 4px; font-family: '${input.fontSub}', Oswald, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: ${input.navy}; }
.ag p { margin: 0; }
.ag-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 28px; margin-top: 22px; }
.ag-card { padding: 14px 16px; background: ${input.paper}; border-left: 3px solid ${input.navy}; }
.ag-card strong { display: block; margin-top: 2px; font-size: 16px; font-weight: 600; }
.ag-card span, .ag-note { display: block; margin-top: 2px; color: #5c7380; font-size: 12px; }
.ag-price { font-family: '${input.fontHead}', Teko, sans-serif; font-size: 40px; line-height: 0.9; color: ${input.navy}; }
.ag ol { margin: 8px 0 0; padding: 0; list-style: none; }
.ag ol li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid #d5e0e6; }
.ag ol li span { color: #5c7380; text-align: right; }
.ag-terms { margin-top: 8px; }
.ag-terms section { padding: 12px 0; border-bottom: 1px solid #e4ebef; }
.ag-sign { margin-top: 28px; padding-top: 8px; color: #5c7380; font-size: 12px; }
</style>
<div class="ag">
  <header class="ag-top">
    <div class="ag-logo">${logo}</div>
    <div>
      <p class="ag-kicker">Installation agreement</p>
      <p class="ag-date">${esc(input.license)} · ${esc(input.city)}<br>${esc(input.prepared)}</p>
    </div>
  </header>
  <p class="ag-note" style="margin-top:12px">${esc(input.tagline)} · ${esc(input.phone)} · ${esc(input.companyEmail)} · ${esc(input.web)}</p>
  <div class="ag-grid">
    <div class="ag-card"><p class="ag-kicker">Customer</p><strong>${esc(input.customer)}</strong><span>${esc(input.email)}</span><span>${esc(input.address)}</span></div>
    <div class="ag-card"><p class="ag-kicker">Option</p><strong>${esc(input.optionName)}</strong><span>${esc(input.paySummary)}</span></div>
  </div>
  <h2>Contract price</h2>
  <p class="ag-price">${esc(input.price)}</p>
  <p class="ag-note">Discount ${esc(input.discount)} · Rebate at sale ${esc(input.rebateAtSale)} · Rebate after the job ${esc(input.rebateAfter)}</p>
  <h2>Scope of work</h2>
  <ol>${rows || "<li><strong>Scope not listed</strong></li>"}</ol>
  <p class="ag-note" style="margin-top:8px">Only the lines above are included. The price is for this scope, not for each line.</p>
  <h2>Terms</h2>
  <div class="ag-terms">${terms}</div>
  <p class="ag-sign">${esc(ESIGN_CONSENT)} This agreement is good for 14 days from the prepared date unless it is signed sooner.</p>
</div><!--ag-end-->`;

  return { text, html };
}

export function agreementPage(article: string, signatureHtml = "") {
  const marker = "</div><!--ag-end-->";
  const body = article.includes(marker) ? article.replace(marker, `${signatureHtml}${marker}`) : `${article}${signatureHtml}`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Installation agreement</title></head><body style="margin:0;background:#f3f6f8">${body}</body></html>`;
}
