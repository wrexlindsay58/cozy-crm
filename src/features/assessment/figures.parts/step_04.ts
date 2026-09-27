import { ATTIC_TARGET, LIFE_YEARS, KWH_RATE, DESIGN_DT, ATTIC_AIR_DT, PEAK_HOURS, TARGET_SEER, num, field, rPerInch, grille, band, letter, grade, dollarsFromBtu, type SectionGrade, type CostSlice, type ReportFigures } from "./part-01";

export function step_04(ctx: any): any {
if (ctx.actual != null && ctx.slices.length) {
    const mid = ctx.slices.reduce((sum: any, slice: any) => sum + (slice.low + slice.high) / 2, 0);
    const cap = ctx.actual * 0.85;
    if (mid > cap && mid > 0) {
      const scale = cap / mid;
      ctx.slices = ctx.slices.map((slice: any) => ({ ...slice, low: Math.round(slice.low * scale), high: Math.round(slice.high * scale) }));
      ctx.assumptions.push("The separate allowances were scaled so together they stay under the peak bill. They still overlap in a real house.");
    }
  }
ctx.weights = ctx.grades.map((grade: any) => ({ A: 95, B: 85, C: 72, D: 60, F: 45 } as Record<string, number>)[grade.letter]);
ctx.overall = ctx.weights.length ? letter(ctx.weights.reduce((sum: any, n: any) => sum + n, 0) / ctx.weights.length) : "C";
return { __halt: true as const, __ret: {
    grades: ctx.grades,
    overall: ctx.overall,
    slices: ctx.slices,
    concerns: ctx.concerns.sort((a: any, b: any) => b.score - a.score).slice(0, 4).map((item: any) => item.line),
    dust: ctx.dust,
    comfort: ctx.comfort,
    bill: ctx.bill,
    assumptions: ctx.assumptions,
    verdicts: ctx.verdicts,
    heat: ctx.heat,
  } }
}
