import { ATTIC_TARGET, LIFE_YEARS, KWH_RATE, DESIGN_DT, ATTIC_AIR_DT, PEAK_HOURS, TARGET_SEER, num, field, rPerInch, grille, band, letter, grade, dollarsFromBtu, type SectionGrade, type CostSlice, type ReportFigures } from "./part-01";

export function step_02(ctx: any): any {
ctx.bill = ctx.sqft
    ? {
        actual: ctx.actual ?? undefined,
        low: Math.round(ctx.sqft * 0.1 + ctx.occupantAdd),
        high: Math.round(ctx.sqft * 0.14 + ctx.occupantAdd),
        note: `A ${ctx.sqft.toLocaleString()} sq ft house${ctx.people ? ` with ${ctx.people} people` : ""} usually lands in this range in a peak summer month when the attic and ducts are doing their job.`,
      }
    : null;
if (ctx.bill) ctx.assumptions.push("The bill range is about 10¢ to 14¢ of peak-month cost per square foot, plus a little for each person past two. It is not their rate plan.");
ctx.coolingPool = ctx.actual != null ? ctx.actual * 0.7 : ctx.bill ? ((ctx.bill.low + ctx.bill.high) / 2) * 0.7 : null;
if (ctx.coolingPool != null) ctx.assumptions.push(ctx.actual != null ? "About 70% of the peak bill is treated as cooling." : "Where no bill was written down, the cooling share uses the middle of the size-based range.");
ctx.tons = num(ctx.f("hvac", "Tonnage"));
ctx.splitField = num(ctx.f("hvac", "Delta T (°F)"));
ctx.retT = num(ctx.f("hvac", "Return temp (°F)"));
ctx.supT = num(ctx.f("hvac", "Supply temp (°F)"));
ctx.split = ctx.splitField ?? (ctx.retT != null && ctx.supT != null ? ctx.retT - ctx.supT : null);
ctx.rs = num(ctx.f("hvac", "Return static (in WC)"));
ctx.ss = num(ctx.f("hvac", "Supply static (in WC)"));
ctx.staticTotal = ctx.rs != null && ctx.ss != null ? Math.round((ctx.rs + ctx.ss) * 100) / 100 : null;
if (ctx.age != null || ctx.listedSeer != null || ctx.split != null) {
    const bits = [
      ctx.age != null ? `${ctx.age} years old` : "",
      ctx.listedSeer != null ? `${ctx.listedSeer} SEER on the nameplate, about ${ctx.seer} SEER effective` : `about ${ctx.seer} SEER effective`,
      ctx.split != null ? `${ctx.split}° temperature split` : "",
      ctx.staticTotal != null ? `${ctx.staticTotal} in total static` : "",
    ].filter(Boolean);
    ctx.verdicts.hvac = `The equipment is ${bits.join(", ")}.`;
    let score = 96;
    if (ctx.age != null && ctx.age > LIFE_YEARS) score -= ctx.age > 20 ? 34 : 18;
    if (ctx.seer < 13) score -= 12;
    if (ctx.seer < 10) score -= 12;
    if (ctx.split != null && (ctx.split < 16 || ctx.split > 22)) score -= 16;
    if (ctx.staticTotal != null && ctx.staticTotal > 0.5) score -= ctx.staticTotal > 0.8 ? 22 : 12;
    ctx.grades.push(grade("hvac", "HVAC", score, ctx.verdicts.hvac));
    if (ctx.tons && ctx.seer < TARGET_SEER) {
      const baseBtu = ctx.tons * 12000 * PEAK_HOURS * 0.55;
      const extra = dollarsFromBtu(baseBtu, ctx.seer) - dollarsFromBtu(baseBtu, TARGET_SEER);
      const span = band(extra);
      if (span.high > 5) {
        ctx.raw.push({
          id: "equipment",
          label: "Equipment",
          low: span.low,
          high: span.high,
          note: `What this ${ctx.seer} SEER unit adds on a normal ${ctx.tons}-ton load versus ${TARGET_SEER} SEER. Age is already in the effective SEER.`,
        });
      }
      ctx.assumptions.push("The equipment dollar is only the efficiency gap on a normal load. It is not added again on top of the attic and duct loads.");
    }
    if (ctx.age != null && ctx.age > LIFE_YEARS) ctx.concerns.push({ score: 20 + (ctx.age - LIFE_YEARS), line: `The equipment is ${ctx.age - LIFE_YEARS} years past a ${LIFE_YEARS}-year life, running near ${ctx.seer} SEER.` });
  }
ctx.returns = num(ctx.f("ducts", "Return registers (count)"));
ctx.supplies = num(ctx.f("ducts", "Supply registers (count)"));
ctx.returnCount = ctx.returns ?? 0;
ctx.sizes = [];
for (let i = 1; i <= Math.max(ctx.returnCount, 1); i += 1) {
    const sized = ctx.f("ducts", `Return ${i} size`) || (i === 1 ? ctx.f("ducts", "Return size") : "");
    if (sized) ctx.sizes.push(sized);
  }
ctx.listed = ctx.sizes.reduce((sum: any, sized: any) => sum + (grille(sized) ?? 0), 0);
ctx.oneSize = ctx.sizes.length === 1 && ctx.returnCount > 1 && !ctx.f("ducts", "Return 2 size");
ctx.grilleArea = ctx.oneSize ? ctx.listed * ctx.returnCount : ctx.listed;
ctx.perTon = null;
if (ctx.grilleArea && ctx.tons && ctx.returnCount) {
    ctx.perTon = Math.round(ctx.grilleArea / ctx.tons);
    const listedSizes = ctx.sizes.join(" and ");
    const word = ctx.perTon >= 250 ? "Excellent" : ctx.perTon >= 200 ? "Tight" : "Too small. The air is choking.";
    ctx.verdicts.ducts = `${listedSizes} across ${ctx.returnCount} return${ctx.returnCount === 1 ? "" : "s"} is ${ctx.perTon} sq in per ton. ${word}`;
    ctx.assumptions.push("Each return is sized on its own. The areas are added, then divided by the tons. Under 200 sq in per ton, the air is treated as choking. 250 is excellent.");
    if (ctx.perTon < 200 && ctx.coolingPool != null) {
      const penalty = Math.min(0.25, ((200 - ctx.perTon) / 200) * 0.45);
      const span = band(ctx.coolingPool * penalty);
      ctx.raw.push({ id: "return", label: "Choked return", low: span.low, high: span.high, note: `A short return makes the system run longer. This is about ${Math.round(penalty * 100)}% of the cooling share.` });
      ctx.concerns.push({ score: 75, line: `The return is choking at ${ctx.perTon} sq in per ton.` });
    }
  }
ctx.jumps = num(ctx.f("ducts", "Jump ducts")) ?? num(ctx.f("ducts", "Jump ducts (count)"));
ctx.transfers = num(ctx.f("ducts", "Transfer grilles")) ?? num(ctx.f("ducts", "Air transfers (count)"));
ctx.jumpN = ctx.jumps ?? 0;
ctx.transferN = ctx.transfers ?? 0;
ctx.pathsBack = (ctx.returns ?? 0) + ctx.jumpN + ctx.transferN;
ctx.pathLine = `${ctx.jumpN} jump duct${ctx.jumpN === 1 ? "" : "s"}. ${ctx.transferN} transfer grille${ctx.transferN === 1 ? "" : "s"}.`;
if (ctx.returnCount || ctx.supplies != null || ctx.jumps != null || ctx.transfers != null) {
    ctx.verdicts.ducts = ctx.verdicts.ducts ? `${ctx.verdicts.ducts} ${ctx.pathLine}` : ctx.pathLine;
  }
}
