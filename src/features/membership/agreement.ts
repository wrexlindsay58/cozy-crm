import { money } from "@/lib/crm-data";
import type { MembershipFile } from "./types";

const FUND: Record<MembershipFile["funding"], string> = {
  membership: "You pay this membership on its own. It is not added to an installation agreement or a loan.",
  job: "You asked us to collect this prepaid price with the installation agreement. It is added to the amount due. It is not part of the installation price. This membership starts when that agreement is signed. If the job is canceled before then, the amount comes off.",
  loan: "You asked us to include this prepaid price in the loan. It is added to the amount financed. It is not part of the installation price. This membership starts when the loan funds. If the loan is declined, this agreement does not start the plan.",
};

export function memberAgreement(file: Pick<MembershipFile, "planName" | "years" | "pay" | "termPrice" | "continueMonthly" | "visitsPerYear" | "funding" | "name" | "start" | "end">, company: string) {
  const price = file.pay === "prepaid" ? `${money(file.termPrice)} prepaid` : `${money(file.termPrice)} a month`;
  return [
    `${company} membership agreement`,
    "",
    `${file.name}`,
    `${file.planName} · ${file.years} years · ${price}`,
    `Starts ${file.start}. Ends ${file.end}.`,
    `${file.visitsPerYear} visits a year are included. A repair found on a visit is not included unless we say so on that visit.`,
    "",
    `The price for this term does not change. After ${file.end}, service continues at the then-current continue rate until you cancel or start a new term. The continue rate on the day you sign is ${money(file.continueMonthly)} a month. A later increase does not hit a bill until you have been told at least 60 days ahead. You can cancel before that increase, or lock a new term at the term price offered then.`,
    "",
    file.pay === "prepaid"
      ? "This term is paid in full. It runs through the end date. It is not a month-to-month plan, and it does not quietly bill again when the term ends."
      : "This term is billed monthly through the end date. Missing a payment does not end the term by itself.",
    "",
    FUND[file.funding],
    "",
    "This membership is its own agreement. Accepting or declining an installation option does not accept or cancel it.",
  ].join("\n");
}
