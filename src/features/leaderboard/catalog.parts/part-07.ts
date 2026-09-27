import { metric, SUPPLIERS } from "./part-01";
import { LENDERS, supplier, lender, GROWTH, growth, grown, six } from "./part-02";

export const __rows6 = [
{
    id: "suppliers",
    label: "Suppliers",
    who: "supplier",
    page: "partners",
    people: SUPPLIERS,
    metrics: [
      metric({
        id: "late",
        label: "Fewest late orders",
        kind: "num",
        fewest: true,
        sample: "order",
        noun: "late",
        periods: six((id) => grown(supplier([["Top", 3, 8], ["Service", 1, 6], ["ABC", 0, 9]]), id)),
      }),
    ],
  },
{
    id: "finance",
    label: "Finance companies",
    who: "lender",
    page: "partners",
    people: LENDERS,
    metrics: [
      metric({
        id: "funded",
        label: "Most funded",
        kind: "money",
        sample: "deal",
        noun: "funded",
        periods: six((id) => grown(lender([["GoodLeap", 86400, 4], ["Sunlight", 41200, 2], ["GreenSky", 22800, 2], ["Synchrony", 9600, 1]]), id)),
      }),
    ],
  },
{
    id: "growth",
    label: "Growth managers",
    who: "manager",
    people: GROWTH,
    metrics: [
      metric({
        id: "hires",
        label: "Most hires",
        kind: "num",
        sample: "hire",
        noun: "hired",
        periods: six((id) => grown(growth([["Jordan", 2, 2], ["Camille", 1, 1], ["Derek", 1, 1]]), id)),
      }),
      metric({
        id: "trained",
        label: "Most trainings completed",
        kind: "num",
        sample: "training",
        noun: "trained",
        periods: six((id) => grown(growth([["Camille", 3, 3], ["Jordan", 2, 2], ["Derek", 1, 1]]), id)),
      }),
      metric({
        id: "solo",
        label: "Fewest days to solo",
        kind: "days",
        fewest: true,
        sample: "hire",
        noun: "to solo",
        periods: six((id) => grown(growth([["Derek", 24, 1], ["Camille", 18, 1], ["Jordan", 12, 1]]), id, true)),
      }),
      metric({
        id: "kept",
        label: "Highest 90-day retention",
        kind: "pct",
        min: 3,
        sample: "hire",
        noun: "still here",
        periods: six((id) => grown(growth([["Derek", 50, 4], ["Camille", 67, 3], ["Jordan", 80, 5]]), id, true)),
      }),
    ],
  },
];
