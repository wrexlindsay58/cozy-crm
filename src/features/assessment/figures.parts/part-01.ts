export const REPORT_FEE = 149;

export const ATTIC_TARGET = 49;

export const LIFE_YEARS = 15;

export const KWH_RATE = 0.14;

export const DESIGN_DT = 30;

export const ATTIC_AIR_DT = 50;

export const PEAK_HOURS = 300;

export const TARGET_SEER = 16;

const R_PER_INCH: Record<string, number> = {
  "blown cellulose": 3.7,
  "fiberglass blown": 2.5,
  "fiberglass batts": 3.2,
  "spray foam": 6,
};

export type GradeLetter = "A" | "B" | "C" | "D" | "F";

export type SectionGrade = { id: string; label: string; letter: GradeLetter; score: number; line: string };

export type CostSlice = { id: string; label: string; low: number; high: number; note: string };

export type ReportFigures = {
  grades: SectionGrade[];
  overall: GradeLetter;
  slices: CostSlice[];
  concerns: string[];
  dust: string[];
  comfort: string[];
  bill: { actual?: number; low: number; high: number; note: string } | null;
  assumptions: string[];
  verdicts: Record<string, string>;
  heat: string | null;
};

export function reportAccess(input: {
  occupancy: string;
  bothHome: string;
  intent: string;
  homeownerAnswer?: string;
  ownersAnswer?: string;
  paid: boolean;
  waivedBy: string;
}) {
  const owner =
    input.occupancy === "Owner" ||
    (input.occupancy !== "Renter" && input.occupancy !== "Vacant" && input.homeownerAnswer === "Homeowner");
  const both = input.bothHome === "Yes" || (input.bothHome !== "No" && input.ownersAnswer === "Yes");
  const serious = input.intent === "Yes";
  const missing: string[] = [];
  if (!owner) missing.push("Homeowner");
  if (!both) missing.push("Both decision makers");
  if (!serious) missing.push("Qualified assessment");
  const free = missing.length === 0;
  return { free, unlocked: free || input.paid || Boolean(input.waivedBy), missing };
}

export function num(value?: string) {
  const n = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && String(value ?? "").trim() ? n : null;
}

export function field(packets: { id: string; fields: Record<string, string> }[], id: string, label: string) {
  const own = packets.find((p) => p.id === id)?.fields[label]?.trim() ?? "";
  if (own || id !== "air-seal") return own;
  return packets.find((p) => p.id === "attic")?.fields[label]?.trim() ?? "";
}

export function rPerInch(type: string) {
  const parts = type.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s && s !== "none");
  const rates = parts.map((p) => R_PER_INCH[p]).filter((n) => n != null);
  if (!rates.length) return null;
  return Math.min(...rates);
}

export function grille(size: string) {
  const match = size.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  return Number(match[1]) * Number(match[2]);
}

export function band(n: number) {
  const low = Math.max(0, Math.round(n * 0.75));
  const high = Math.max(low, Math.round(n * 1.25));
  return { low, high };
}

export function letter(score: number): GradeLetter {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 55) return "D";
  return "F";
}

export function grade(id: string, label: string, score: number, line: string): SectionGrade {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return { id, label, letter: letter(clamped), score: clamped, line };
}

export function dollarsFromBtu(btu: number, seer: number) {
  return (btu / (seer * 1000)) * KWH_RATE;
}
