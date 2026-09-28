import type { Period, Person, Snap } from "@/features/leaderboard/rank";
import type { RangeId } from "@/lib/sales-data";
import { span, metric, SETTERS, named, set, type Grain } from "./part-01";

export const LENDERS: Person[] = [
  { name: "GoodLeap", office: "Phoenix" },
  { name: "Sunlight Financial", office: "Scottsdale" },
  { name: "GreenSky", office: "Dallas" },
  { name: "Synchrony", office: "Mesa" },
];

export const csr = named<"Brooke" | "Chris" | "Ava">({ Brooke: "Brooke Lane", Chris: "Chris Nguyen", Ava: "Ava Patel" });

export const partner = named<"Kimball" | "West" | "Red">({ Kimball: "Kimball Realty", West: "West Valley Canvass", Red: "Red Door Partners" });

export const dealer = named<"Ferguson" | "Johnstone" | "Winsupply">({ Ferguson: "Ferguson", Johnstone: "Johnstone Supply", Winsupply: "Winsupply" });

export const sub = named<"Apex" | "Ridge" | "Clearline">({ Apex: "Apex Insulation", Ridge: "Ridge Electrical", Clearline: "Clearline Crane" });

export const supplier = named<"ABC" | "Service" | "Top">({ ABC: "ABC Supply", Service: "Service Partners", Top: "TopBuild" });

export const lender = named<"GoodLeap" | "Sunlight" | "GreenSky" | "Synchrony">({ GoodLeap: "GoodLeap", Sunlight: "Sunlight Financial", GreenSky: "GreenSky", Synchrony: "Synchrony" });

export const GROWTH: Person[] = [
  { name: "Jordan Hale", office: "Phoenix" },
  { name: "Camille Ortiz", office: "Scottsdale" },
  { name: "Derek Walsh", office: "Dallas" },
  { name: "Sonia Park", office: "Mesa" },
  { name: "Ruth Nguyen", office: "Tucson" },
  { name: "Felix Grant", office: "Fort Worth" },
  { name: "Helen Cho", office: "North Phoenix" },
  { name: "Isaac Romero", office: "Phoenix" },
];

export const growth = named<"Jordan" | "Camille" | "Derek">({ Jordan: "Jordan Hale", Camille: "Camille Ortiz", Derek: "Derek Walsh" });

export function grown(seed: Snap[], id: RangeId, pct = false): { history: Snap[][]; current: Snap[] } {
  const mult = id === "day" ? 1 : id === "wtd" ? 4 : id === "mtd" ? 12 : id === "qtd" ? 30 : id === "ytd" ? 80 : 200;
  const current = seed.map((s) => ({ ...s, score: pct ? s.score : s.score * mult, n: s.n * mult }));
  const history = [ [...seed].reverse().map((s) => ({ ...s, score: pct ? s.score : Math.max(1, Math.round(s.score * mult * 0.85)), n: Math.max(1, s.n * mult) })) ];
  return { history, current };
}

export function six(
  build: (id: RangeId, grain: Grain) => { history: Snap[][]; current: Snap[] },
): Period[] {
  const grains: [RangeId, Grain][] = [
    ["day", "day"],
    ["wtd", "week"],
    ["mtd", "month"],
    ["qtd", "quarter"],
    ["ytd", "year"],
    ["ltd", "year"],
  ];
  return grains.map(([id, grain]) => {
    const row = build(id, grain);
    return span(id, grain, row.history, row.current);
  });
}

export const __rows1 = [
{
    id: "setters",
    label: "Setters",
    who: "setter",
    people: SETTERS,
    metrics: [
      metric({
        id: "ran",
        label: "Most sits that ran",
        kind: "num",
        sample: "run",
        noun: "ran",
        periods: six((id) => {
          if (id === "day") return { history: [set([["Amber", 4, 4], ["Priya", 3, 3]])], current: set([["Priya", 3, 3], ["Amber", 2, 2]]) };
          if (id === "wtd") return { history: [set([["Amber", 11, 11], ["Priya", 9, 9]])], current: set([["Priya", 12, 12], ["Amber", 9, 9]]) };
          if (id === "mtd") return { history: [set([["Priya", 28, 28], ["Amber", 24, 24]])], current: set([["Priya", 31, 31], ["Amber", 26, 26]]) };
          if (id === "qtd") return { history: [set([["Priya", 70, 70], ["Amber", 62, 62]])], current: set([["Priya", 78, 78], ["Amber", 66, 66]]) };
          if (id === "ytd") return { history: [set([["Amber", 160, 160], ["Priya", 150, 150]])], current: set([["Priya", 168, 168], ["Amber", 149, 149]]) };
          return { history: [set([["Priya", 420, 420], ["Amber", 390, 390]])], current: set([["Priya", 510, 510], ["Amber", 460, 460]]) };
        }),
      }),
      metric({
        id: "sets",
        label: "Most sets",
        kind: "num",
        sample: "set",
        noun: "set",
        periods: six((id) => {
          if (id === "day") return { history: [set([["Priya", 5, 5], ["Amber", 4, 4]])], current: set([["Amber", 4, 4], ["Priya", 3, 3]]) };
          if (id === "wtd") return { history: [set([["Priya", 16, 16], ["Amber", 14, 14]])], current: set([["Priya", 18, 18], ["Amber", 14, 14]]) };
          if (id === "mtd") return { history: [set([["Priya", 40, 40], ["Amber", 36, 36]])], current: set([["Priya", 44, 44], ["Amber", 38, 38]]) };
          if (id === "qtd") return { history: [set([["Priya", 90, 90], ["Amber", 84, 84]])], current: set([["Priya", 102, 102], ["Amber", 88, 88]]) };
          if (id === "ytd") return { history: [set([["Amber", 190, 190], ["Priya", 180, 180]])], current: set([["Priya", 214, 214], ["Amber", 186, 186]]) };
          return { history: [set([["Priya", 600, 600], ["Amber", 540, 540]])], current: set([["Priya", 740, 740], ["Amber", 680, 680]]) };
        }),
      }),
      metric({
        id: "show",
        label: "Highest show rate",
        kind: "pct",
        min: 3,
        sample: "set",
        noun: "showed",
        periods: [
          span("day", "day", [set([["Priya", 80, 5], ["Amber", 75, 4]])], set([["Priya", 75, 4], ["Amber", 67, 3]])),
          span("wtd", "week", [set([["Amber", 72, 14], ["Priya", 68, 16]])], set([["Priya", 67, 18], ["Amber", 64, 14]])),
          span("mtd", "month", [set([["Priya", 70, 40], ["Amber", 67, 36]])], set([["Priya", 70, 44], ["Amber", 68, 38]])),
          span("qtd", "quarter", [set([["Amber", 71, 84], ["Priya", 69, 90]])], set([["Priya", 76, 102], ["Amber", 75, 88]])),
          span("ytd", "year", [set([["Amber", 74, 190], ["Priya", 72, 180]])], set([["Priya", 79, 214], ["Amber", 80, 186]])),
          span("ltd", "year", [set([["Priya", 76, 600], ["Amber", 74, 540]])], set([["Amber", 78, 680], ["Priya", 77, 740]])),
        ],
      }),
    ],
  },
];
