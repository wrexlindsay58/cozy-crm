import { closerSnap } from "@/features/leaderboard/closers";
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

export type Grain = Period["grain"];

export function span(id: RangeId, grain: Grain, history: Snap[][], current: Snap[]): Period {
  return { id, grain, history, current };
}

export function metric(partial: Omit<Metric, "min"> & { min?: number }): Metric {
  return { min: 1, ...partial };
}

export const c = closerSnap;

export const SETTERS: Person[] = [
  { name: "Priya Shah", office: "Phoenix" },
  { name: "Amber Quinn", office: "Scottsdale" },
  { name: "Lila Nguyen", office: "Mesa" },
  { name: "Owen Blake", office: "Dallas" },
  { name: "Rosa Diaz", office: "Tucson" },
  { name: "Ian Cho", office: "Fort Worth" },
  { name: "Tess Morgan", office: "North Phoenix" },
];

export const PMS: Person[] = [
  { name: "Tasha Reed", office: "Scottsdale" },
  { name: "Evan Cole", office: "Phoenix" },
  { name: "Nina Flores", office: "Dallas" },
  { name: "Paul Okonkwo", office: "Mesa" },
  { name: "Greta Holm", office: "Tucson" },
  { name: "Victor Lang", office: "Fort Worth" },
];

export const CREWS: Person[] = [
  { name: "Crew 1 — Evan", office: "Phoenix" },
  { name: "Crew 2 — Tasha", office: "Scottsdale" },
  { name: "Crew 3 — Marco", office: "Dallas" },
  { name: "Crew 4 — Nina", office: "Mesa" },
  { name: "Crew 5 — Paul", office: "Tucson" },
  { name: "Crew 6 — Greta", office: "Fort Worth" },
];

export const HANDS: Person[] = [
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

export function named<K extends string>(names: Record<K, string>) {
  return (rows: [K, number, number][]): Snap[] => rows.map(([key, score, n]) => ({ name: names[key], score, n }));
}

export const set = named< "Priya" | "Amber">({ Priya: "Priya Shah", Amber: "Amber Quinn" });

export const pm = named<"Tasha" | "Evan">({ Tasha: "Tasha Reed", Evan: "Evan Cole" });

export const crew = named<"C1" | "C2" | "C3">({ C1: "Crew 1 — Evan", C2: "Crew 2 — Tasha", C3: "Crew 3 — Marco" });

export const hand = named<"Omar" | "Luis" | "Rico" | "Sam">({
  Omar: "Omar Diaz",
  Luis: "Luis Cruz",
  Rico: "Rico Marquez",
  Sam: "Sam Patel",
});

export const TECHS: Person[] = [
  { name: "Diego Alvarez", office: "Phoenix" },
  { name: "Hannah Brooks", office: "Scottsdale" },
  { name: "Marcus Webb", office: "Dallas" },
  { name: "Alicia Nguyen", office: "Mesa" },
  { name: "Pete Okada", office: "Tucson" },
  { name: "Renee Clark", office: "Fort Worth" },
  { name: "Samir Haddad", office: "North Phoenix" },
  { name: "Kelly Ortiz", office: "Phoenix" },
];

export const CSRS: Person[] = [
  { name: "Brooke Lane", office: "Phoenix" },
  { name: "Chris Nguyen", office: "Scottsdale" },
  { name: "Ava Patel", office: "Dallas" },
  { name: "Noah Ellis", office: "Mesa" },
  { name: "Gina Brooks", office: "Tucson" },
  { name: "Leo Martin", office: "Fort Worth" },
  { name: "Mia Shah", office: "North Phoenix" },
  { name: "Evan Walsh", office: "Phoenix" },
];

export const PARTNERS: Person[] = [
  { name: "Kimball Realty", office: "Scottsdale" },
  { name: "West Valley Canvass", office: "Phoenix" },
  { name: "Red Door Partners", office: "Dallas" },
  { name: "Mesa Neighbors", office: "Mesa" },
  { name: "Tucson Home Group", office: "Tucson" },
  { name: "Fort Worth Referral Co", office: "Fort Worth" },
  { name: "North Valley Signs", office: "North Phoenix" },
  { name: "Yard Sign Co", office: "Phoenix" },
];

export const DEALERS: Person[] = [
  { name: "Ferguson", office: "Phoenix" },
  { name: "Johnstone Supply", office: "Scottsdale" },
  { name: "Winsupply", office: "Dallas" },
  { name: "RE Michel", office: "Mesa" },
];

export const SUBS: Person[] = [
  { name: "Apex Insulation", office: "Phoenix" },
  { name: "Ridge Electrical", office: "Scottsdale" },
  { name: "Clearline Crane", office: "Dallas" },
  { name: "Mesa Drywall", office: "Mesa" },
];

export const SUPPLIERS: Person[] = [
  { name: "ABC Supply", office: "Phoenix" },
  { name: "Service Partners", office: "Dallas" },
  { name: "TopBuild", office: "Mesa" },
];

export const tech = named<"Diego" | "Hannah" | "Marcus">({ Diego: "Diego Alvarez", Hannah: "Hannah Brooks", Marcus: "Marcus Webb" });
