import { ATTIC_TARGET, LIFE_YEARS, KWH_RATE, DESIGN_DT, ATTIC_AIR_DT, PEAK_HOURS, TARGET_SEER, num, field, rPerInch, grille, band, letter, grade, dollarsFromBtu, type SectionGrade, type CostSlice, type ReportFigures } from "./part-01";

export function step_03(ctx: any): any {
if (ctx.supplies != null && ctx.pathsBack > 0 && ctx.supplies / ctx.pathsBack >= 5) {
    const heavy = ctx.supplies / ctx.pathsBack >= 8 || ctx.pathsBack <= 1;
    const line = `There are ${ctx.supplies} supplies and ${ctx.pathsBack} ways back. Closed doors still hold air in the room.`;
    ctx.verdicts.ducts = ctx.verdicts.ducts ? `${ctx.verdicts.ducts} ${line}` : line;
    if (ctx.coolingPool != null) {
      const span = band(ctx.coolingPool * (heavy ? 0.1 : 0.06));
      ctx.raw.push({
        id: "doors",
        label: "Closed-door rooms",
        low: span.low,
        high: span.high,
        note: ctx.jumpN + ctx.transferN > 0 ? "Jump ducts and transfers are not enough for the number of supplies." : "No jump duct or air transfer was counted for the extra supplies.",
      });
    }
    ctx.concerns.push({ score: heavy ? 48 : 32, line: `Closed-door rooms need a way back. ${ctx.supplies} supplies, ${ctx.pathsBack} return paths.` });
    ctx.assumptions.push("A return path is a return grille, a jump duct, or an air transfer. The closed-door allowance applies when supplies outnumber those paths by five to one or more.");
  } else if ((ctx.jumps != null || ctx.transfers != null) && ctx.jumpN + ctx.transferN > 0 && ctx.supplies != null) {
    ctx.assumptions.push("Jump ducts and air transfers are counted as return paths, so a closed door can still get air back to the system.");
  }
ctx.location = ctx.f("ducts", "Location");
ctx.ductR = ctx.f("ducts", "Duct insulation (R)");
ctx.condition = ctx.f("ducts", "Condition");
ctx.inAttic = /attic|garage|crawl/i.test(ctx.location);
ctx.boots = num(ctx.f("ducts", "Boot leaks (count)")) ?? 0;
ctx.drops = num(ctx.f("ducts", "Disconnected runs (count)")) ?? 0;
if (ctx.boots || ctx.drops) ctx.dust.push(`${[ctx.drops ? `${ctx.drops} disconnected run${ctx.drops === 1 ? "" : "s"}` : "", ctx.boots ? `${ctx.boots} leaking boot${ctx.boots === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ")} can pull attic air and attic dust into the rooms.`);
ctx.baseLoss = 0;
ctx.conditionLoss = 0;
ctx.leakLoss = 0;
if (ctx.inAttic && ctx.ductR) {
    ctx.baseLoss = ctx.ductR === "None" ? 35 : ctx.ductR === "R-4" ? 28 : ctx.ductR === "R-6" ? 20 : ctx.ductR === "R-8" ? 15 : 20;
    if (ctx.drops) ctx.leakLoss += Math.min(16, ctx.drops * 8);
    if (ctx.boots) ctx.leakLoss += Math.min(10, ctx.boots * 2);
    if (/kinked/i.test(ctx.condition)) ctx.conditionLoss += 5;
    if (/sagging/i.test(ctx.condition)) ctx.conditionLoss += 5;
    if (/crushed/i.test(ctx.condition)) ctx.conditionLoss += 5;
    if (/deck/i.test(ctx.condition)) ctx.conditionLoss += 5;
    const totalLoss = Math.min(45, ctx.baseLoss + ctx.leakLoss + ctx.conditionLoss);
    const ductLine = `Ducts are ${ctx.ductR} in the ${ctx.location.toLowerCase()}. About ${totalLoss}% of the cooled air is figured as never reaching the rooms.`;
    ctx.verdicts.ducts = ctx.verdicts.ducts ? `${ctx.verdicts.ducts} ${ductLine}` : ductLine;
    if (ctx.coolingPool != null) {
      const baseSpan = band(ctx.coolingPool * Math.max(0, ctx.baseLoss + ctx.leakLoss - 10) / 100);
      if (baseSpan.high > 5) ctx.raw.push({ id: "ducts", label: "Duct loss", low: baseSpan.low, high: baseSpan.high, note: `${ctx.ductR} ducts in the ${ctx.location.toLowerCase()}${ctx.boots || ctx.drops ? ", plus open boots or disconnected runs" : ""}. The first 10% is treated as ordinary.` });
      if (ctx.conditionLoss && ctx.condition) {
        const condSpan = band(ctx.coolingPool * ctx.conditionLoss / 100);
        ctx.raw.push({ id: "shape", label: /kinked/i.test(ctx.condition) && /sagging/i.test(ctx.condition) ? "Kinked and sagging" : ctx.condition, low: condSpan.low, high: condSpan.high, note: `${ctx.condition} adds about ${ctx.conditionLoss} points of loss on top of the duct R-value.` });
      }
    }
    ctx.assumptions.push("Duct loss starts from the R-value and where the ducts sit, then adds disconnected runs, boot leaks, and kinked, sagging, crushed, or decked lines. It is capped at 45%.");
    if (totalLoss >= 25) ctx.concerns.push({ score: totalLoss, line: `About ${totalLoss}% of the cooled air is figured as lost before it reaches the rooms.` });
    const ductScore = (totalLoss <= 12 ? 92 : totalLoss <= 20 ? 80 : totalLoss <= 30 ? 64 : 46) - (ctx.perTon != null && ctx.perTon < 200 ? 12 : 0);
    ctx.grades.push(grade("ducts", "Ducts", ductScore, ctx.verdicts.ducts));
  } else if (ctx.verdicts.ducts || ctx.condition) {
    if (ctx.condition) ctx.verdicts.ducts = `${ctx.verdicts.ducts ? `${ctx.verdicts.ducts} ` : ""}Duct lines are ${ctx.condition.toLowerCase()}.`;
    ctx.grades.push(grade("ducts", "Ducts", ctx.perTon != null && ctx.perTon < 200 ? 58 : 72, ctx.verdicts.ducts));
  }
ctx.glazing = ctx.f("windows", "Glazing");
ctx.failed = num(ctx.f("windows", "Failed seals (count)")) ?? 0;
ctx.stuck = num(ctx.f("windows", "Won't operate (count)")) ?? 0;
ctx.count = num(ctx.f("windows", "Count"));
ctx.glass = num(ctx.f("windows", "Window temperature (°F)"));
ctx.outside = num(ctx.input.outdoorTemp) ?? num(ctx.f("windows", "Outside temperature (°F)"));
if (ctx.glazing || ctx.failed || ctx.count || ctx.glass != null) {
    let score = ctx.glazing === "Single" ? 48 : ctx.glazing === "Triple" ? 94 : 84;
    score -= Math.min(30, ctx.failed * 6 + ctx.stuck * 4);
    const room = num(ctx.input.indoorTemp) ?? 78;
    let heatLine = "";
    if (ctx.glass != null) {
      const panes = Math.max(ctx.count ?? 1, 1);
      const area = panes * 12;
      const now = area * 1.5 * Math.max(0, ctx.glass - room);
      const target = area * 1.5 * 4;
      const extra = Math.max(0, now - target);
      const sun = ctx.outside != null && ctx.glass > ctx.outside;
      heatLine = `The glass is ${ctx.glass}°${ctx.outside != null ? ` and it is ${ctx.outside}° outside` : ""}. ${sun ? "The sun is heating the panes past the air. " : ""}Against a ${room}° room, the glass is adding about ${Math.round(now).toLocaleString()} BTU/hr.`;
      if (extra > 0) {
        const span = band(dollarsFromBtu(extra * PEAK_HOURS, ctx.seer));
        if (span.high > 5) ctx.raw.push({ id: "windows", label: "Window heat", low: span.low, high: span.high, note: `Interior glass at ${ctx.glass}° versus a pane that would sit about 4° above the ${room}° room. Area is an allowance of 12 sq ft per window.` });
      }
      const over = ctx.glass - room - 8;
      if (over > 0) score -= Math.min(24, Math.round(over / 5) * 6);
      ctx.assumptions.push("Window heat uses the glass temperature against the room, at about 1.5 BTU per hour per square foot per degree. Each window is allowed 12 square feet. A better pane is figured at 4° above the room.");
    }
    const line = [ctx.count ? `${ctx.count} windows` : "", ctx.glazing ? ctx.glazing.toLowerCase() : "", ctx.failed ? `${ctx.failed} failed seals` : ""].filter(Boolean).join(", ");
    ctx.verdicts.windows = [line ? `${line}.` : "Windows were assessed.", heatLine].filter(Boolean).join(" ");
    ctx.grades.push(grade("windows", "Windows", score, ctx.verdicts.windows));
    if (ctx.glazing === "Single" || ctx.failed >= 3 || (ctx.glass != null && ctx.glass - room >= 20)) ctx.concerns.push({ score: 24, line: heatLine || ctx.verdicts.windows });
  }
if (ctx.cellulose && ctx.paths.length) ctx.concerns.push({ score: 60, line: "Cellulose dust has a way into the house." });
ctx.hot = ctx.input.hotRooms.trim();
if (ctx.hot) ctx.comfort.push(`${ctx.hot} run hot. That lines up with the attic, the ducts, or the equipment.`);
if (ctx.input.coldRooms.trim()) ctx.comfort.push(`${ctx.input.coldRooms.trim()} run cold.`);
ctx.slices = ctx.raw.filter((slice: any) => slice.high > 0);
}
