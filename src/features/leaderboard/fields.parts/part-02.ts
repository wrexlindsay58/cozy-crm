import type { Metric, ScoreKind } from "@/features/leaderboard/catalog";
import type { Snap } from "@/features/leaderboard/rank";
import { ranges, type RangeId } from "@/lib/sales-data";
import { customerPeople, fieldSnaps, calcSnaps, GRAIN, type RowKind } from "./part-01";

export const BUILT_BOARDS: { id: string; name: string; row: RowKind }[] = [
  { id: "people", name: "People", row: "person" },
  { id: "office", name: "Office", row: "office" },
  { id: "area", name: "Area", row: "area" },
  { id: "district", name: "District", row: "district" },
  { id: "region", name: "Region", row: "region" },
  { id: "partners", name: "Partners", row: "partner" },
  { id: "customers", name: "Customers", row: "customer" },
];

function customerMetric(id: string, label: string, kind: ScoreKind, sample: string, current: (range: RangeId) => Snap[]): Metric {
  return {
    id,
    label,
    kind,
    sample,
    min: 1,
    noun: sample,
    periods: ranges.map((range) => ({ id: range.id, grain: GRAIN[range.id], history: [], current: current(range.id) })),
  };
}

export function customerBoard() {
  return {
    id: "customers",
    label: "Customers",
    who: "customer",
    page: "customers" as const,
    people: customerPeople(),
    metrics: [
      customerMetric("customers:spend", "Highest spend", "money", "job", (range) => fieldSnaps("customers:spend", range)),
      customerMetric("customers:referrals", "Most referrals", "num", "referral", (range) => fieldSnaps("customers:referrals", range)),
      customerMetric("customers:reviews", "Highest review", "num", "review", (range) => fieldSnaps("customers:reviews", range)),
      customerMetric("customers:member", "Longest membership", "num", "year", (range) => fieldSnaps("customers:member", range)),
      customerMetric("customers:ticket", "Highest spend per job", "money", "job", (range) => calcSnaps("customers:spend", "/", "customers:jobs", range)),
    ],
  };
}
