import { metric, CSRS, PARTNERS, DEALERS, SUBS } from "./part-01";
import { csr, partner, dealer, sub, grown, six } from "./part-02";

export const __rows5 = [
{
    id: "csrs",
    label: "CSRs",
    who: "CSR",
    people: CSRS,
    metrics: [
      metric({
        id: "closed",
        label: "Most actions closed",
        kind: "num",
        sample: "action",
        noun: "closed",
        periods: six((id) => grown(csr([["Brooke", 11, 11], ["Chris", 8, 8], ["Ava", 6, 6]]), id)),
      }),
      metric({
        id: "speed",
        label: "Fastest answer",
        kind: "num",
        fewest: true,
        min: 3,
        sample: "minute",
        noun: "to answer",
        periods: six((id) => grown(csr([["Ava", 26, 6], ["Chris", 18, 8], ["Brooke", 14, 11]]), id, true)),
      }),
    ],
  },
{
    id: "partners",
    label: "Referral partners",
    who: "partner",
    page: "partners",
    people: PARTNERS,
    metrics: [
      metric({
        id: "sat",
        label: "Most leads that sat",
        kind: "num",
        sample: "lead",
        noun: "sat",
        periods: six((id) => grown(partner([["Kimball", 3, 3], ["West", 2, 2], ["Red", 1, 1]]), id)),
      }),
      metric({
        id: "deals",
        label: "Most deals from those leads",
        kind: "num",
        sample: "deal",
        noun: "sold",
        periods: six((id) => grown(partner([["Kimball", 2, 2], ["West", 1, 1], ["Red", 1, 1]]), id)),
      }),
    ],
  },
{
    id: "dealers",
    label: "Dealers",
    who: "dealer",
    page: "partners",
    people: DEALERS,
    metrics: [
      metric({
        id: "orders",
        label: "Most equipment ordered",
        kind: "money",
        sample: "order",
        noun: "ordered",
        periods: six((id) => grown(dealer([["Ferguson", 18400, 6], ["Johnstone", 12100, 4], ["Winsupply", 8600, 3]]), id)),
      }),
    ],
  },
{
    id: "subs",
    label: "Subcontractors",
    who: "sub",
    page: "partners",
    people: SUBS,
    metrics: [
      metric({
        id: "jobs",
        label: "Most jobs finished",
        kind: "num",
        sample: "job",
        noun: "finished",
        periods: six((id) => grown(sub([["Apex", 6, 6], ["Ridge", 4, 4], ["Clearline", 2, 2]]), id)),
      }),
    ],
  },
];
