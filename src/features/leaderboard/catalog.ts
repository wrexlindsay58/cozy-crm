import { CLOSER_PEOPLE, CLOSER_SOLD, closerSnap } from "@/features/leaderboard/closers";
import type { Period, Person, Snap } from "@/features/leaderboard/rank";
import type { RangeId } from "@/lib/sales-data";

export type ScoreKind = "money" | "pct" | "num" | "days";

export type Metric = {
  id: string;
  label: string;
  fewest?: boolean;
  kind: ScoreKind;
  min: number;
  sample: string;
  noun: string;
  periods: Period[];
};

export type Board = {
  id: string;
  label: string;
  who: string;
  people: Person[];
  metrics: Metric[];
  page?: "people" | "partners" | "customers";
};

type Grain = Period["grain"];

function span(id: RangeId, grain: Grain, history: Snap[][], current: Snap[]): Period {
  return { id, grain, history, current };
}

function metric(partial: Omit<Metric, "min"> & { min?: number }): Metric {
  return { min: 1, ...partial };
}

const c = closerSnap;

const SETTERS: Person[] = [
  { name: "Priya Shah", office: "Phoenix" },
  { name: "Amber Quinn", office: "Scottsdale" },
  { name: "Lila Nguyen", office: "Mesa" },
  { name: "Owen Blake", office: "Dallas" },
  { name: "Rosa Diaz", office: "Tucson" },
  { name: "Ian Cho", office: "Fort Worth" },
  { name: "Tess Morgan", office: "North Phoenix" },
];

const PMS: Person[] = [
  { name: "Tasha Reed", office: "Scottsdale" },
  { name: "Evan Cole", office: "Phoenix" },
  { name: "Nina Flores", office: "Dallas" },
  { name: "Paul Okonkwo", office: "Mesa" },
  { name: "Greta Holm", office: "Tucson" },
  { name: "Victor Lang", office: "Fort Worth" },
];

const CREWS: Person[] = [
  { name: "Crew 1 — Evan", office: "Phoenix" },
  { name: "Crew 2 — Tasha", office: "Scottsdale" },
  { name: "Crew 3 — Marco", office: "Dallas" },
  { name: "Crew 4 — Nina", office: "Mesa" },
  { name: "Crew 5 — Paul", office: "Tucson" },
  { name: "Crew 6 — Greta", office: "Fort Worth" },
];

const HANDS: Person[] = [
  { name: "Omar Diaz", office: "Phoenix" },
  { name: "Luis Cruz", office: "Phoenix" },
  { name: "Rico Marquez", office: "Dallas" },
  { name: "Sam Patel", office: "Dallas" },
  { name: "Ivy Tran", office: "Scottsdale" },
  { name: "Noah Kim", office: "Mesa" },
  { name: "Eden Walsh", office: "Tucson" },
  { name: "Caleb Ruiz", office: "Fort Worth" },
  { name: "Mina Shah", office: "North Phoenix" },
  { name: "Joel Hart", office: "Phoenix" },
];

function named<K extends string>(names: Record<K, string>) {
  return (rows: [K, number, number][]): Snap[] => rows.map(([key, score, n]) => ({ name: names[key], score, n }));
}

const set = named< "Priya" | "Amber">({ Priya: "Priya Shah", Amber: "Amber Quinn" });
const pm = named<"Tasha" | "Evan">({ Tasha: "Tasha Reed", Evan: "Evan Cole" });
const crew = named<"C1" | "C2" | "C3">({ C1: "Crew 1 — Evan", C2: "Crew 2 — Tasha", C3: "Crew 3 — Marco" });
const hand = named<"Omar" | "Luis" | "Rico" | "Sam">({
  Omar: "Omar Diaz",
  Luis: "Luis Cruz",
  Rico: "Rico Marquez",
  Sam: "Sam Patel",
});

const TECHS: Person[] = [
  { name: "Diego Alvarez", office: "Phoenix" },
  { name: "Hannah Brooks", office: "Scottsdale" },
  { name: "Marcus Webb", office: "Dallas" },
  { name: "Alicia Nguyen", office: "Mesa" },
  { name: "Pete Okada", office: "Tucson" },
  { name: "Renee Clark", office: "Fort Worth" },
  { name: "Samir Haddad", office: "North Phoenix" },
  { name: "Kelly Ortiz", office: "Phoenix" },
];

const CSRS: Person[] = [
  { name: "Brooke Lane", office: "Phoenix" },
  { name: "Chris Nguyen", office: "Scottsdale" },
  { name: "Ava Patel", office: "Dallas" },
  { name: "Noah Ellis", office: "Mesa" },
  { name: "Gina Brooks", office: "Tucson" },
  { name: "Leo Martin", office: "Fort Worth" },
  { name: "Mia Shah", office: "North Phoenix" },
  { name: "Evan Walsh", office: "Phoenix" },
];

const PARTNERS: Person[] = [
  { name: "Kimball Realty", office: "Scottsdale" },
  { name: "West Valley Canvass", office: "Phoenix" },
  { name: "Red Door Partners", office: "Dallas" },
  { name: "Mesa Neighbors", office: "Mesa" },
  { name: "Tucson Home Group", office: "Tucson" },
  { name: "Fort Worth Referral Co", office: "Fort Worth" },
  { name: "North Valley Signs", office: "North Phoenix" },
  { name: "Yard Sign Co", office: "Phoenix" },
];

const DEALERS: Person[] = [
  { name: "Ferguson", office: "Phoenix" },
  { name: "Johnstone Supply", office: "Scottsdale" },
  { name: "Winsupply", office: "Dallas" },
  { name: "RE Michel", office: "Mesa" },
];

const SUBS: Person[] = [
  { name: "Apex Insulation", office: "Phoenix" },
  { name: "Ridge Electrical", office: "Scottsdale" },
  { name: "Clearline Crane", office: "Dallas" },
  { name: "Mesa Drywall", office: "Mesa" },
];

const SUPPLIERS: Person[] = [
  { name: "ABC Supply", office: "Phoenix" },
  { name: "Service Partners", office: "Dallas" },
  { name: "TopBuild", office: "Mesa" },
];

const LENDERS: Person[] = [
  { name: "GoodLeap", office: "Phoenix" },
  { name: "Sunlight Financial", office: "Scottsdale" },
  { name: "GreenSky", office: "Dallas" },
  { name: "Synchrony", office: "Mesa" },
];

const tech = named<"Diego" | "Hannah" | "Marcus">({ Diego: "Diego Alvarez", Hannah: "Hannah Brooks", Marcus: "Marcus Webb" });
const csr = named<"Brooke" | "Chris" | "Ava">({ Brooke: "Brooke Lane", Chris: "Chris Nguyen", Ava: "Ava Patel" });
const partner = named<"Kimball" | "West" | "Red">({ Kimball: "Kimball Realty", West: "West Valley Canvass", Red: "Red Door Partners" });
const dealer = named<"Ferguson" | "Johnstone" | "Winsupply">({ Ferguson: "Ferguson", Johnstone: "Johnstone Supply", Winsupply: "Winsupply" });
const sub = named<"Apex" | "Ridge" | "Clearline">({ Apex: "Apex Insulation", Ridge: "Ridge Electrical", Clearline: "Clearline Crane" });
const supplier = named<"ABC" | "Service" | "Top">({ ABC: "ABC Supply", Service: "Service Partners", Top: "TopBuild" });
const lender = named<"GoodLeap" | "Sunlight" | "GreenSky" | "Synchrony">({ GoodLeap: "GoodLeap", Sunlight: "Sunlight Financial", GreenSky: "GreenSky", Synchrony: "Synchrony" });

const GROWTH: Person[] = [
  { name: "Jordan Hale", office: "Phoenix" },
  { name: "Camille Ortiz", office: "Scottsdale" },
  { name: "Derek Walsh", office: "Dallas" },
  { name: "Sonia Park", office: "Mesa" },
  { name: "Ruth Nguyen", office: "Tucson" },
  { name: "Felix Grant", office: "Fort Worth" },
  { name: "Helen Cho", office: "North Phoenix" },
  { name: "Isaac Romero", office: "Phoenix" },
];

const growth = named<"Jordan" | "Camille" | "Derek">({ Jordan: "Jordan Hale", Camille: "Camille Ortiz", Derek: "Derek Walsh" });

function grown(seed: Snap[], id: RangeId, pct = false): { history: Snap[][]; current: Snap[] } {
  const mult = id === "day" ? 1 : id === "wtd" ? 4 : id === "mtd" ? 12 : id === "qtd" ? 30 : id === "ytd" ? 80 : 200;
  const current = seed.map((s) => ({ ...s, score: pct ? s.score : s.score * mult, n: s.n * mult }));
  const history = [ [...seed].reverse().map((s) => ({ ...s, score: pct ? s.score : Math.max(1, Math.round(s.score * mult * 0.85)), n: Math.max(1, s.n * mult) })) ];
  return { history, current };
}

function six(
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

export const BOARDS: Board[] = [
  {
    id: "closers",
    label: "Closers",
    who: "closer",
    people: CLOSER_PEOPLE,
    metrics: [
      metric({ id: "sold", label: "Most sold", kind: "money", sample: "deal", noun: "sold", periods: CLOSER_SOLD }),
      metric({
        id: "close",
        label: "Highest close rate",
        kind: "pct",
        min: 3,
        sample: "sit",
        noun: "close",
        periods: [
          span("day", "day", [c([["Dana", 50, 2], ["Marco", 100, 1]])], c([["Dana", 100, 1], ["Marco", 0, 1], ["Cole", 100, 1]])),
          span("wtd", "week", [c([["Marco", 42, 12], ["Dana", 38, 8], ["Luis", 33, 6], ["Cole", 40, 5]]), c([["Dana", 50, 8], ["Marco", 45, 11]])], c([["Dana", 44, 9], ["Marco", 41, 12], ["Luis", 36, 8], ["Cole", 33, 6], ["Nate", 100, 2]])),
          span("mtd", "month", [c([["Marco", 40, 20], ["Dana", 39, 18], ["Luis", 34, 12], ["Cole", 30, 10], ["Nate", 28, 7]])], c([["Dana", 46, 24], ["Marco", 41, 22], ["Luis", 35, 14], ["Cole", 31, 11], ["Nate", 22, 9]])),
          span("qtd", "quarter", [c([["Dana", 44, 48], ["Marco", 41, 52], ["Luis", 36, 30], ["Cole", 33, 24], ["Nate", 29, 18]])], c([["Dana", 44, 52], ["Marco", 41, 58], ["Luis", 36, 33], ["Cole", 33, 27], ["Nate", 29, 20]])),
          span("ytd", "year", [c([["Dana", 44, 90], ["Marco", 41, 110], ["Luis", 36, 86], ["Cole", 33, 70], ["Nate", 29, 62]])], c([["Dana", 44, 96], ["Marco", 41, 118], ["Luis", 36, 92], ["Cole", 33, 74], ["Nate", 29, 66]])),
          span("ltd", "year", [c([["Dana", 43, 240], ["Marco", 40, 280], ["Luis", 35, 200], ["Cole", 32, 160], ["Nate", 28, 140]])], c([["Dana", 44, 280], ["Marco", 41, 320], ["Luis", 36, 230], ["Cole", 33, 190], ["Nate", 29, 170]])),
        ],
      }),
      metric({
        id: "nra",
        label: "Highest NRA",
        kind: "money",
        min: 3,
        sample: "sit",
        noun: "per sit",
        periods: [
          span("day", "day", [], c([["Dana", 18600, 1], ["Marco", 14200, 1], ["Cole", 9800, 1]])),
          span("wtd", "week", [c([["Dana", 4200, 8], ["Marco", 3800, 12], ["Luis", 3600, 6], ["Cole", 3100, 5]])], c([["Dana", 4400, 9], ["Luis", 4147, 8], ["Marco", 3600, 12], ["Cole", 3667, 6], ["Nate", 7500, 2]])),
          span("mtd", "month", [c([["Dana", 4100, 18], ["Marco", 3900, 22], ["Luis", 3700, 12]])], c([["Dana", 4300, 24], ["Luis", 4000, 14], ["Marco", 3760, 22], ["Cole", 3400, 11], ["Nate", 2000, 9]])),
          span("qtd", "quarter", [c([["Dana", 4000, 48], ["Marco", 3700, 52]])], c([["Dana", 4100, 52], ["Marco", 3800, 58], ["Luis", 3600, 33], ["Cole", 3300, 27], ["Nate", 3100, 20]])),
          span("ytd", "year", [c([["Marco", 3900, 110], ["Dana", 4100, 90]])], c([["Dana", 4125, 96], ["Marco", 3680, 118], ["Luis", 3480, 92], ["Cole", 3070, 74], ["Nate", 2820, 66]])),
          span("ltd", "year", [c([["Dana", 3900, 240], ["Marco", 3600, 280]])], c([["Dana", 4000, 280], ["Marco", 3650, 320], ["Luis", 3400, 230], ["Cole", 3100, 190], ["Nate", 2900, 170]])),
        ],
      }),
      metric({
        id: "ticket",
        label: "Highest average ticket",
        kind: "money",
        min: 3,
        sample: "deal",
        noun: "a deal",
        periods: [
          span("day", "day", [], c([["Dana", 18600, 1], ["Marco", 14200, 1], ["Cole", 9800, 1]])),
          span("wtd", "week", [c([["Dana", 21000, 3], ["Marco", 18000, 4], ["Luis", 16000, 2]])], c([["Luis", 22000, 1], ["Dana", 19800, 4], ["Marco", 17280, 5], ["Cole", 11000, 2]])),
          span("mtd", "month", [c([["Dana", 20000, 6], ["Marco", 18500, 6], ["Luis", 17000, 4], ["Cole", 15000, 3]])], c([["Dana", 23667, 6], ["Marco", 25600, 5], ["Luis", 21333, 3], ["Cole", 20500, 2], ["Nate", 18000, 1]])),
          span("qtd", "quarter", [c([["Marco", 21000, 18], ["Dana", 20500, 16]])], c([["Dana", 24118, 17], ["Marco", 22778, 18], ["Luis", 22222, 9], ["Cole", 22143, 7], ["Nate", 24500, 4]])),
          span("ytd", "year", [c([["Dana", 20769, 39], ["Marco", 20789, 38]])], c([["Dana", 20842, 38], ["Marco", 20667, 42], ["Luis", 20677, 31], ["Cole", 20636, 22], ["Nate", 20667, 18]])),
          span("ltd", "year", [c([["Dana", 21000, 112], ["Marco", 20800, 118]])], c([["Dana", 21013, 150], ["Marco", 20925, 160], ["Luis", 20540, 113], ["Cole", 21000, 74], ["Nate", 20765, 68]])),
        ],
      }),
      metric({
        id: "discount",
        label: "Lowest true discount",
        kind: "pct",
        fewest: true,
        min: 3,
        sample: "deal",
        noun: "true discount",
        periods: [
          span("day", "day", [], c([["Dana", 0, 1], ["Marco", 4, 1], ["Cole", 8, 1]])),
          span("wtd", "week", [c([["Luis", 6, 4], ["Dana", 8, 6], ["Marco", 11, 8], ["Cole", 12, 3]])], c([["Luis", 4, 4], ["Dana", 6, 6], ["Marco", 9, 8], ["Cole", 11, 3], ["Nate", 0, 1]])),
          span("mtd", "month", [c([["Dana", 7, 8], ["Luis", 8, 6], ["Marco", 10, 10], ["Cole", 12, 4]])], c([["Luis", 5, 6], ["Dana", 7, 9], ["Marco", 9, 11], ["Cole", 12, 5], ["Nate", 14, 3]])),
          span("qtd", "quarter", [c([["Dana", 8, 16], ["Luis", 9, 9], ["Marco", 11, 18]])], c([["Luis", 6, 9], ["Dana", 7, 17], ["Marco", 10, 18], ["Cole", 12, 7], ["Nate", 13, 4]])),
          span("ytd", "year", [c([["Dana", 8, 39], ["Marco", 10, 38], ["Luis", 9, 28]])], c([["Luis", 7, 31], ["Dana", 8, 38], ["Marco", 10, 42], ["Cole", 12, 22], ["Nate", 13, 18]])),
          span("ltd", "year", [c([["Dana", 9, 112], ["Luis", 9, 82], ["Marco", 11, 118]])], c([["Luis", 8, 113], ["Dana", 9, 150], ["Marco", 11, 160], ["Cole", 12, 74], ["Nate", 13, 68]])),
        ],
      }),
      metric({
        id: "attach",
        label: "Highest membership attachment",
        kind: "pct",
        min: 3,
        sample: "job",
        noun: "attachment",
        periods: [
          span("day", "day", [], c([["Dana", 100, 1], ["Marco", 0, 1]])),
          span("wtd", "week", [c([["Marco", 40, 5], ["Dana", 33, 3], ["Luis", 25, 4]])], c([["Dana", 50, 4], ["Marco", 40, 5], ["Cole", 0, 2], ["Luis", 25, 4]])),
          span("mtd", "month", [c([["Dana", 45, 8], ["Marco", 38, 8], ["Luis", 30, 6], ["Cole", 20, 4]])], c([["Dana", 50, 6], ["Marco", 40, 5], ["Luis", 33, 3], ["Cole", 0, 2], ["Nate", 0, 1]])),
          span("qtd", "quarter", [c([["Dana", 42, 16], ["Marco", 36, 18]])], c([["Dana", 47, 17], ["Marco", 39, 18], ["Luis", 33, 9], ["Cole", 29, 7], ["Nate", 25, 4]])),
          span("ytd", "year", [c([["Dana", 40, 39], ["Marco", 35, 38]])], c([["Dana", 42, 38], ["Marco", 36, 42], ["Luis", 32, 31], ["Cole", 27, 22], ["Nate", 22, 18]])),
          span("ltd", "year", [c([["Dana", 38, 112], ["Marco", 34, 118]])], c([["Dana", 40, 150], ["Marco", 35, 160], ["Luis", 30, 113], ["Cole", 26, 74], ["Nate", 22, 68]])),
        ],
      }),
    ],
  },
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
        sample: "sit",
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
  {
    id: "pms",
    label: "PMs",
    who: "PM",
    people: PMS,
    metrics: [
      metric({
        id: "moving",
        label: "Most jobs moving",
        kind: "num",
        sample: "job",
        noun: "moving",
        periods: six((id) => {
          if (id === "day") return { history: [pm([["Evan", 4, 4], ["Tasha", 3, 3]])], current: pm([["Tasha", 4, 4], ["Evan", 3, 3]]) };
          if (id === "wtd") return { history: [pm([["Tasha", 6, 6], ["Evan", 6, 6]])], current: pm([["Tasha", 7, 7], ["Evan", 5, 5]]) };
          if (id === "mtd") return { history: [pm([["Evan", 9, 9], ["Tasha", 8, 8]])], current: pm([["Tasha", 11, 11], ["Evan", 8, 8]]) };
          if (id === "qtd") return { history: [pm([["Tasha", 18, 18], ["Evan", 16, 16]])], current: pm([["Tasha", 22, 22], ["Evan", 17, 17]]) };
          if (id === "ytd") return { history: [pm([["Evan", 40, 40], ["Tasha", 36, 36]])], current: pm([["Tasha", 48, 48], ["Evan", 41, 41]]) };
          return { history: [pm([["Tasha", 90, 90], ["Evan", 84, 84]])], current: pm([["Tasha", 120, 120], ["Evan", 104, 104]]) };
        }),
      }),
      metric({
        id: "holds",
        label: "Fewest holds",
        kind: "num",
        fewest: true,
        sample: "job",
        noun: "holds",
        periods: [
          span("day", "day", [pm([["Tasha", 1, 3], ["Evan", 0, 4]])], pm([["Evan", 1, 3], ["Tasha", 0, 4]])),
          span("wtd", "week", [pm([["Evan", 2, 6], ["Tasha", 1, 6]])], pm([["Tasha", 1, 7], ["Evan", 2, 5]])),
          span("mtd", "month", [pm([["Tasha", 3, 8], ["Evan", 2, 9]])], pm([["Tasha", 1, 11], ["Evan", 3, 8]])),
          span("qtd", "quarter", [pm([["Evan", 4, 16], ["Tasha", 3, 18]])], pm([["Tasha", 2, 22], ["Evan", 4, 17]])),
          span("ytd", "year", [pm([["Tasha", 6, 36], ["Evan", 7, 40]])], pm([["Tasha", 4, 48], ["Evan", 7, 41]])),
          span("ltd", "year", [pm([["Evan", 12, 84], ["Tasha", 14, 90]])], pm([["Tasha", 10, 120], ["Evan", 16, 104]])),
        ],
      }),
      metric({
        id: "days",
        label: "Fewest days to close",
        kind: "days",
        fewest: true,
        min: 3,
        sample: "job",
        noun: "to close",
        periods: [
          span("day", "day", [], pm([["Tasha", 12, 1], ["Evan", 18, 1]])),
          span("wtd", "week", [pm([["Evan", 16, 4], ["Tasha", 14, 5]])], pm([["Tasha", 11, 4], ["Evan", 15, 3]])),
          span("mtd", "month", [pm([["Tasha", 14, 6], ["Evan", 17, 6]])], pm([["Tasha", 12, 8], ["Evan", 16, 6]])),
          span("qtd", "quarter", [pm([["Evan", 15, 12], ["Tasha", 13, 14]])], pm([["Tasha", 12, 16], ["Evan", 15, 13]])),
          span("ytd", "year", [pm([["Tasha", 13, 30], ["Evan", 16, 32]])], pm([["Tasha", 12, 36], ["Evan", 15, 34]])),
          span("ltd", "year", [pm([["Evan", 16, 70], ["Tasha", 14, 80]])], pm([["Tasha", 13, 96], ["Evan", 16, 88]])),
        ],
      }),
    ],
  },
  {
    id: "crews",
    label: "Crews",
    who: "crew",
    people: CREWS,
    metrics: [
      metric({
        id: "finished",
        label: "Most jobs finished",
        kind: "num",
        sample: "job",
        noun: "finished",
        periods: six((id) => {
          if (id === "day") return { history: [crew([["C2", 1, 1], ["C1", 1, 1]])], current: crew([["C1", 1, 1], ["C3", 1, 1]]) };
          if (id === "wtd") return { history: [crew([["C1", 3, 3], ["C2", 2, 2], ["C3", 2, 2]])], current: crew([["C2", 3, 3], ["C1", 2, 2], ["C3", 2, 2]]) };
          if (id === "mtd") return { history: [crew([["C1", 6, 6], ["C3", 5, 5], ["C2", 4, 4]])], current: crew([["C1", 7, 7], ["C2", 6, 6], ["C3", 4, 4]]) };
          if (id === "qtd") return { history: [crew([["C2", 12, 12], ["C1", 11, 11], ["C3", 9, 9]])], current: crew([["C1", 14, 14], ["C2", 12, 12], ["C3", 9, 9]]) };
          if (id === "ytd") return { history: [crew([["C1", 28, 28], ["C2", 24, 24], ["C3", 20, 20]])], current: crew([["C1", 32, 32], ["C2", 27, 27], ["C3", 21, 21]]) };
          return { history: [crew([["C1", 70, 70], ["C2", 64, 64], ["C3", 48, 48]])], current: crew([["C1", 88, 88], ["C2", 76, 76], ["C3", 54, 54]]) };
        }),
      }),
      metric({
        id: "qc",
        label: "Highest QC pass",
        kind: "pct",
        min: 3,
        sample: "job",
        noun: "passed",
        periods: [
          span("day", "day", [], crew([["C1", 100, 1], ["C3", 100, 1]])),
          span("wtd", "week", [crew([["C2", 100, 3], ["C1", 67, 3], ["C3", 50, 2]])], crew([["C2", 100, 3], ["C1", 50, 2], ["C3", 50, 2]])),
          span("mtd", "month", [crew([["C1", 83, 6], ["C2", 75, 4], ["C3", 80, 5]])], crew([["C2", 100, 6], ["C1", 86, 7], ["C3", 75, 4]])),
          span("qtd", "quarter", [crew([["C2", 92, 12], ["C1", 82, 11], ["C3", 78, 9]])], crew([["C2", 92, 12], ["C1", 86, 14], ["C3", 78, 9]])),
          span("ytd", "year", [crew([["C1", 89, 28], ["C2", 88, 24], ["C3", 80, 20]])], crew([["C2", 93, 27], ["C1", 88, 32], ["C3", 81, 21]])),
          span("ltd", "year", [crew([["C1", 86, 70], ["C2", 85, 64], ["C3", 78, 48]])], crew([["C2", 91, 76], ["C1", 87, 88], ["C3", 80, 54]])),
        ],
      }),
      metric({
        id: "callbacks",
        label: "Fewest callbacks",
        kind: "num",
        fewest: true,
        sample: "job",
        noun: "callbacks",
        periods: [
          span("day", "day", [crew([["C1", 0, 1]])], crew([["C1", 0, 1], ["C3", 1, 1]])),
          span("wtd", "week", [crew([["C2", 0, 3], ["C1", 1, 3], ["C3", 1, 2]])], crew([["C2", 0, 3], ["C1", 1, 2], ["C3", 1, 2]])),
          span("mtd", "month", [crew([["C1", 1, 6], ["C3", 1, 5], ["C2", 2, 4]])], crew([["C2", 0, 6], ["C1", 1, 7], ["C3", 2, 4]])),
          span("qtd", "quarter", [crew([["C2", 1, 12], ["C1", 2, 11], ["C3", 2, 9]])], crew([["C2", 1, 12], ["C1", 2, 14], ["C3", 3, 9]])),
          span("ytd", "year", [crew([["C1", 3, 28], ["C2", 3, 24], ["C3", 4, 20]])], crew([["C2", 2, 27], ["C1", 4, 32], ["C3", 5, 21]])),
          span("ltd", "year", [crew([["C2", 6, 64], ["C1", 8, 70], ["C3", 9, 48]])], crew([["C2", 6, 76], ["C1", 9, 88], ["C3", 11, 54]])),
        ],
      }),
      metric({
        id: "reviews",
        label: "Most reviews",
        kind: "num",
        sample: "review",
        noun: "reviews",
        periods: six((id) => {
          if (id === "day") return { history: [crew([["C2", 1, 1]])], current: crew([["C3", 1, 1]]) };
          if (id === "wtd") return { history: [crew([["C1", 2, 2], ["C2", 1, 1]])], current: crew([["C2", 2, 2], ["C1", 1, 1], ["C3", 1, 1]]) };
          if (id === "mtd") return { history: [crew([["C1", 3, 3], ["C3", 2, 2], ["C2", 1, 1]])], current: crew([["C1", 4, 4], ["C2", 3, 3], ["C3", 1, 1]]) };
          if (id === "qtd") return { history: [crew([["C2", 6, 6], ["C1", 5, 5], ["C3", 3, 3]])], current: crew([["C1", 7, 7], ["C2", 6, 6], ["C3", 3, 3]]) };
          if (id === "ytd") return { history: [crew([["C1", 12, 12], ["C2", 10, 10], ["C3", 6, 6]])], current: crew([["C1", 14, 14], ["C2", 11, 11], ["C3", 7, 7]]) };
          return { history: [crew([["C1", 30, 30], ["C2", 26, 26], ["C3", 14, 14]])], current: crew([["C1", 36, 36], ["C2", 30, 30], ["C3", 16, 16]]) };
        }),
      }),
    ],
  },
  {
    id: "hands",
    label: "Crew members",
    who: "crew member",
    people: HANDS,
    metrics: [
      metric({
        id: "work",
        label: "Most work completed",
        kind: "num",
        sample: "job",
        noun: "completed",
        periods: six((id) => {
          if (id === "day") return { history: [hand([["Omar", 2, 2], ["Luis", 1, 1]])], current: hand([["Luis", 2, 2], ["Rico", 1, 1], ["Sam", 1, 1]]) };
          if (id === "wtd") return { history: [hand([["Omar", 4, 4], ["Luis", 3, 3], ["Rico", 3, 3], ["Sam", 2, 2]])], current: hand([["Omar", 5, 5], ["Luis", 4, 4], ["Rico", 3, 3], ["Sam", 2, 2]]) };
          if (id === "mtd") return { history: [hand([["Luis", 8, 8], ["Omar", 7, 7], ["Sam", 6, 6], ["Rico", 5, 5]])], current: hand([["Omar", 9, 9], ["Luis", 8, 8], ["Rico", 6, 6], ["Sam", 5, 5]]) };
          if (id === "qtd") return { history: [hand([["Omar", 16, 16], ["Luis", 14, 14], ["Rico", 12, 12], ["Sam", 10, 10]])], current: hand([["Omar", 18, 18], ["Luis", 16, 16], ["Rico", 13, 13], ["Sam", 11, 11]]) };
          if (id === "ytd") return { history: [hand([["Luis", 30, 30], ["Omar", 28, 28], ["Rico", 22, 22], ["Sam", 20, 20]])], current: hand([["Omar", 34, 34], ["Luis", 31, 31], ["Rico", 24, 24], ["Sam", 22, 22]]) };
          return { history: [hand([["Omar", 70, 70], ["Luis", 66, 66], ["Rico", 48, 48], ["Sam", 44, 44]])], current: hand([["Omar", 88, 88], ["Luis", 80, 80], ["Rico", 58, 58], ["Sam", 52, 52]]) };
        }),
      }),
      metric({
        id: "hours",
        label: "Most hours",
        kind: "num",
        sample: "hour",
        noun: "hours",
        periods: [
          span("day", "day", [hand([["Omar", 8, 8], ["Luis", 8, 8], ["Rico", 6, 6]])], hand([["Luis", 9, 9], ["Omar", 8, 8], ["Rico", 7, 7], ["Sam", 4, 4]])),
          span("wtd", "week", [hand([["Omar", 36, 36], ["Luis", 34, 34], ["Rico", 30, 30], ["Sam", 28, 28]])], hand([["Luis", 38, 38], ["Omar", 36, 36], ["Rico", 32, 32], ["Sam", 24, 24]])),
          span("mtd", "month", [hand([["Omar", 140, 140], ["Luis", 132, 132], ["Sam", 120, 120], ["Rico", 118, 118]])], hand([["Omar", 152, 152], ["Luis", 148, 148], ["Rico", 130, 130], ["Sam", 110, 110]])),
          span("qtd", "quarter", [hand([["Luis", 400, 400], ["Omar", 390, 390], ["Rico", 340, 340], ["Sam", 320, 320]])], hand([["Omar", 420, 420], ["Luis", 410, 410], ["Rico", 360, 360], ["Sam", 330, 330]])),
          span("ytd", "year", [hand([["Omar", 1500, 1500], ["Luis", 1460, 1460], ["Rico", 1200, 1200], ["Sam", 1180, 1180]])], hand([["Omar", 1620, 1620], ["Luis", 1580, 1580], ["Rico", 1310, 1310], ["Sam", 1240, 1240]])),
          span("ltd", "year", [hand([["Luis", 4200, 4200], ["Omar", 4000, 4000], ["Rico", 3100, 3100], ["Sam", 3000, 3000]])], hand([["Omar", 4800, 4800], ["Luis", 4600, 4600], ["Rico", 3500, 3500], ["Sam", 3300, 3300]])),
        ],
      }),
      metric({
        id: "fails",
        label: "Fewest QC fails",
        kind: "num",
        fewest: true,
        sample: "check",
        noun: "fails",
        periods: [
          span("day", "day", [hand([["Omar", 0, 2], ["Luis", 1, 2]])], hand([["Luis", 0, 2], ["Rico", 0, 1], ["Sam", 1, 1]])),
          span("wtd", "week", [hand([["Sam", 0, 3], ["Omar", 1, 4], ["Luis", 1, 4], ["Rico", 1, 3]])], hand([["Omar", 0, 5], ["Luis", 1, 4], ["Rico", 1, 3], ["Sam", 1, 2]])),
          span("mtd", "month", [hand([["Omar", 1, 8], ["Luis", 1, 8], ["Rico", 2, 6], ["Sam", 2, 6]])], hand([["Luis", 0, 8], ["Omar", 1, 9], ["Rico", 1, 6], ["Sam", 2, 5]])),
          span("qtd", "quarter", [hand([["Luis", 1, 14], ["Omar", 2, 16], ["Sam", 2, 10], ["Rico", 3, 12]])], hand([["Luis", 1, 16], ["Omar", 2, 18], ["Rico", 2, 13], ["Sam", 3, 11]])),
          span("ytd", "year", [hand([["Omar", 3, 28], ["Luis", 4, 30], ["Rico", 4, 22], ["Sam", 5, 20]])], hand([["Luis", 2, 31], ["Omar", 3, 34], ["Rico", 4, 24], ["Sam", 6, 22]])),
          span("ltd", "year", [hand([["Luis", 8, 66], ["Omar", 9, 70], ["Rico", 10, 48], ["Sam", 12, 44]])], hand([["Luis", 8, 80], ["Omar", 10, 88], ["Rico", 11, 58], ["Sam", 14, 52]])),
        ],
      }),
    ],
  },
  {
    id: "techs",
    label: "Service techs",
    who: "tech",
    people: TECHS,
    metrics: [
      metric({
        id: "visits",
        label: "Most visits completed",
        kind: "num",
        sample: "visit",
        noun: "completed",
        periods: six((id) => grown(tech([["Diego", 5, 5], ["Hannah", 4, 4], ["Marcus", 3, 3]]), id)),
      }),
      metric({
        id: "repairs",
        label: "Most repairs collected",
        kind: "money",
        sample: "repair",
        noun: "collected",
        periods: six((id) => grown(tech([["Diego", 2400, 3], ["Hannah", 1800, 2], ["Marcus", 900, 1]]), id)),
      }),
      metric({
        id: "failed",
        label: "Fewest failed visits",
        kind: "num",
        fewest: true,
        sample: "visit",
        noun: "failed",
        periods: six((id) => grown(tech([["Marcus", 2, 3], ["Diego", 1, 5], ["Hannah", 0, 4]]), id)),
      }),
    ],
  },
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
