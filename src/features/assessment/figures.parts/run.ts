import { ATTIC_TARGET, LIFE_YEARS, KWH_RATE, DESIGN_DT, ATTIC_AIR_DT, PEAK_HOURS, TARGET_SEER, num, field, rPerInch, grille, band, letter, grade, dollarsFromBtu, type SectionGrade, type CostSlice, type ReportFigures } from "./part-01";
import { step_01 } from "./step_01";
import { step_02 } from "./step_02";
import { step_03 } from "./step_03";
import { step_04 } from "./step_04";

export function buildFigures(input: {
  sqft: string;
  stories: string;
  occupants: string;
  peakBill: string;
  utility: string;
  hotRooms: string;
  coldRooms: string;
  indoorTemp?: string;
  outdoorTemp?: string;
  packets: { id: string; fields: Record<string, string> }[];
}): ReportFigures {
  const ctx: any = {};
  ctx.input = input;
  const __h0 = step_01(ctx);
  if (__h0 && __h0.__halt) return __h0.__ret;
  const __h1 = step_02(ctx);
  if (__h1 && __h1.__halt) return __h1.__ret;
  const __h2 = step_03(ctx);
  if (__h2 && __h2.__halt) return __h2.__ret;
  const __h3 = step_04(ctx);
  if (__h3 && __h3.__halt) return __h3.__ret;
  return undefined as unknown as ReportFigures;
}
