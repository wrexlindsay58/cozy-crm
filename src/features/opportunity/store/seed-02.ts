import type { PayOffer, Proposal } from "./types";
import { linesFrom, defaultOffers } from "./seed";
import { defaultSkus } from "@/lib/pricebook";
import { leads } from "@/lib/crm-data";

export function payLabel(offer: PayOffer) {
  if (offer.kind === "cash") return "Cash";
  if (offer.kind === "card") return "Card";
  if (offer.kind === "ach") return "ACH";
  return offer.financer || "Financing";
}

export function seedFor(oppId: string, personId: string, closer: string, product: string, stage: string): Proposal {
  const products = defaultSkus(product);
  const a = linesFrom(products, personId);
  const lead = leads.find((l) => l.id === personId);
  const won = /^Won/.test(stage);
  const cash = /cash/i.test(lead?.finance ?? "") || /cash/i.test(lead?.notes ?? "");
  const payOffers = defaultOffers(oppId).map((o) =>
    won && !cash && o.kind === "finance" ? { ...o, terms: [120], pickedPlans: [{ months: 120, apr: 6.99 }] } : o,
  );
  const financeId = payOffers.find((o) => o.kind === "finance")?.id ?? payOffers[0].id;
  const cashId = payOffers.find((o) => o.kind === "cash")?.id ?? payOffers[0].id;
  return {
    oppId,
    personId,
    closer,
    products,
    options: [
      { id: "A", name: "Recommended", lines: a },
      { id: "B", name: "Better", lines: a.length > 1 ? a.slice(0, -1).map((l) => ({ ...l })) : a.map((l) => ({ ...l })) },
      { id: "C", name: "Good", lines: a.slice(0, 1).map((l) => ({ ...l })) },
    ],
    accepted: won ? "A" : undefined,
    pay: cash ? "cash" : "goodleap",
    payOffers,
    payPick: won ? (cash ? { offerId: cashId } : { offerId: financeId, term: 120, apr: 6.99 }) : undefined,
    goodleapTerm: "10yr",
    goodleapStatus: won && !cash ? "Approved" : "Not run",
    proposalStatus: won ? "Sent" : "Draft",
    signStatus: won ? "Signed" : "—",
    documents: [],
    memberOffer:
      personId === "L-4819"
        ? {
            planId: "comfort",
            planName: "Comfort",
            years: 5,
            pay: "prepaid",
            termPrice: 1500,
            continueMonthly: 39,
            visitsPerYear: 2,
            funding: "loan",
          }
        : undefined,
  };
}
