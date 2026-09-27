import { BOARDS, type Metric, type ScoreKind } from "@/features/leaderboard/catalog";
import type { Period, Snap } from "@/features/leaderboard/rank";
import { membershipFiles } from "@/features/membership/store";
import { accounts, type Account } from "@/lib/crm-data";
import { referrals, reviews } from "@/lib/snapshot";
import { ranges, type RangeId } from "@/lib/sales-data";

export type RowKind = "person" | "partner" | "customer" | "office" | "area" | "district" | "region";

export type RaceField = {
  id: string;
  group: string;
  label: string;
  row: "person" | "partner" | "customer";
  kind: ScoreKind;
  sample: string;
  fewest?: boolean;
};

const PLACES: Record<string, { area: string; district: string; region: string }> = {
  Phoenix: { area: "Valley", district: "Arizona", region: "West" },
  Scottsdale: { area: "Valley", district: "Arizona", region: "West" },
  Mesa: { area: "Valley", district: "Arizona", region: "West" },
  "North Phoenix": { area: "Valley", district: "Arizona", region: "West" },
  Tucson: { area: "South Arizona", district: "Arizona", region: "West" },
  Dallas: { area: "Metroplex", district: "Texas", region: "South" },
  "Fort Worth": { area: "Metroplex", district: "Texas", region: "South" },
};

export function isPlace(row: RowKind) {
  return row === "office" || row === "area" || row === "district" || row === "region";
}

export function placeOf(office: string, row: RowKind) {
  if (!isPlace(row) || row === "office") return office;
  return PLACES[office]?.[row] ?? office;
}

export function groupRow(page?: string): "person" | "partner" | "customer" {
  if (page === "partners") return "partner";
  if (page === "customers") return "customer";
  return "person";
}

export function defaultBoards(page?: string) {
  if (page === "partners") return ["partners"];
  if (page === "customers") return ["customers"];
  return ["people", "office", "area", "district", "region"];
}

export function compatible(group: "person" | "partner" | "customer", board: RowKind) {
  if (group === "person") return board === "person" || isPlace(board);
  if (group === "partner") return board === "partner" || isPlace(board);
  return board === "customer" || isPlace(board);
}

function loose(account: string, other: string) {
  const a = account.toLowerCase();
  const b = other.toLowerCase();
  if (a.includes(b) || b.includes(a)) return true;
  return a.split(/\W+/).some((word) => word.length > 3 && b.includes(word));
}

function cityOffice(city: string) {
  if (city.includes("Scottsdale")) return "Scottsdale";
  if (city.includes("Dallas")) return "Dallas";
  if (city.includes("Fort Worth")) return "Fort Worth";
  return "Phoenix";
}

export function customerPeople() {
  return accounts.map((account) => ({ name: account.name, office: cityOffice(account.city) }));
}

function customerSnaps(pick: (account: Account) => { score: number; n: number }): Snap[] {
  return accounts.map((account) => ({ name: account.name, ...pick(account) })).filter((row) => row.n > 0);
}

const CUSTOMER: Record<string, () => Snap[]> = {
  "customers:spend": () => customerSnaps((account) => ({ score: account.lifetime, n: account.jobs || 1 })),
  "customers:jobs": () => customerSnaps((account) => ({ score: account.jobs, n: account.jobs || 1 })),
  "customers:referrals": () =>
    customerSnaps((account) => {
      const n = referrals.filter((row) => loose(account.name, row.from)).length;
      return { score: n, n };
    }),
  "customers:reviews": () =>
    customerSnaps((account) => {
      const rows = reviews.filter((row) => loose(account.name, row.name));
      if (!rows.length) return { score: 0, n: 0 };
      return { score: Math.round(rows.reduce((sum, row) => sum + row.stars, 0) / rows.length), n: rows.length };
    }),
  "customers:member": () =>
    customerSnaps((account) => {
      const file = membershipFiles().find((row) => loose(account.name, row.name));
      return file ? { score: file.years, n: 1 } : { score: 0, n: 0 };
    }),
};

function catalogSnaps(id: string, range: RangeId): Snap[] {
  const [boardId, metricId] = id.split(":");
  const metric = BOARDS.find((board) => board.id === boardId)?.metrics.find((row) => row.id === metricId);
  return metric?.periods.find((period) => period.id === range)?.current ?? [];
}

export function fieldSnaps(id: string, range: RangeId): Snap[] {
  if (CUSTOMER[id]) return CUSTOMER[id]();
  return catalogSnaps(id, range);
}

export function calcSnaps(left: string, op: "+" | "-" | "/", right: string, range: RangeId): Snap[] {
  const a = fieldSnaps(left, range);
  const b = fieldSnaps(right, range);
  const names = new Set([...a.map((row) => row.name), ...b.map((row) => row.name)]);
  return [...names].flatMap((name) => {
    const leftRow = a.find((row) => row.name === name);
    const rightRow = b.find((row) => row.name === name);
    const av = leftRow?.score ?? 0;
    const bv = rightRow?.score ?? 0;
    const n = Math.max(leftRow?.n ?? 0, rightRow?.n ?? 0);
    if (n <= 0) return [];
    const score = op === "+" ? av + bv : op === "-" ? av - bv : bv ? av / bv : 0;
    return [{ name, score: Math.round(score), n }];
  });
}

export function raceFields(): RaceField[] {
  const fromBoards = BOARDS.filter((board) => board.page !== "customers").flatMap((board) =>
    board.metrics.map((metric) => ({
      id: `${board.id}:${metric.id}`,
      group: board.label,
      label: metric.label,
      row: (board.page === "partners" ? "partner" : "person") as "person" | "partner",
      kind: metric.kind,
      sample: metric.sample,
      fewest: metric.fewest,
    })),
  );
  const customers: RaceField[] = [
    { id: "customers:spend", group: "Customers", label: "Lifetime spend", row: "customer", kind: "money", sample: "job" },
    { id: "customers:jobs", group: "Customers", label: "Jobs", row: "customer", kind: "num", sample: "job" },
    { id: "customers:referrals", group: "Customers", label: "Referrals given", row: "customer", kind: "num", sample: "referral" },
    { id: "customers:reviews", group: "Customers", label: "Review stars", row: "customer", kind: "num", sample: "review" },
    { id: "customers:member", group: "Customers", label: "Membership years", row: "customer", kind: "num", sample: "year" },
  ];
  return [...fromBoards, ...customers];
}

export const BUILT_BOARDS: { id: string; name: string; row: RowKind }[] = [
  { id: "people", name: "People", row: "person" },
  { id: "office", name: "Office", row: "office" },
  { id: "area", name: "Area", row: "area" },
  { id: "district", name: "District", row: "district" },
  { id: "region", name: "Region", row: "region" },
  { id: "partners", name: "Partners", row: "partner" },
  { id: "customers", name: "Customers", row: "customer" },
];

const GRAIN: Record<RangeId, Period["grain"]> = { day: "day", wtd: "week", mtd: "month", qtd: "quarter", ytd: "year", ltd: "year" };

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
