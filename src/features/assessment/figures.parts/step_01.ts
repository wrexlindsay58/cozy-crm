import { ATTIC_TARGET, LIFE_YEARS, KWH_RATE, DESIGN_DT, ATTIC_AIR_DT, PEAK_HOURS, TARGET_SEER, num, field, rPerInch, grille, band, letter, grade, dollarsFromBtu, type SectionGrade, type CostSlice, type ReportFigures } from "./part-01";

export function step_01(ctx: any): any {
ctx.packets = ctx.input.packets;
ctx.f = (id: string, label: string) => field(ctx.packets, id, label);
ctx.assumptions = [
    "No blower door was run. Open paths and duct loss are allowances from what was written down, not a measured air-changes number.",
    "Dollars are a peak-month estimate. They are not the utility bill and they are not a price.",
    `Cooling energy uses about ${Math.round(KWH_RATE * 100)}¢ a kilowatt-hour and this unit's effective SEER. A modern comparison unit is ${TARGET_SEER} SEER.`,
    `Heat through the ceiling uses a ${DESIGN_DT}° difference and about ${PEAK_HOURS} hours in a peak month. Attic air leaking in uses a ${ATTIC_AIR_DT}° difference, because an attic runs hotter than the outdoor design temperature.`,
  ];
ctx.verdicts = {};
ctx.dust = [];
ctx.comfort = [];
ctx.concerns = [];
ctx.grades = [];
ctx.raw = [];
ctx.year = num(ctx.f("hvac", "Manufacture year"));
ctx.age = ctx.year != null ? new Date().getFullYear() - ctx.year : null;
ctx.listedSeer = num(ctx.f("hvac", "Listed SEER"));
ctx.seer = ctx.listedSeer ?? (ctx.age != null && ctx.age >= 12 ? 10 : ctx.age != null && ctx.age >= 5 ? 13 : 14);
if (ctx.age != null && ctx.age > 8) ctx.seer = Math.max(8, ctx.seer * (1 - 0.015 * (ctx.age - 8)));
ctx.seer = Math.round(ctx.seer * 10) / 10;
if (ctx.listedSeer == null) ctx.assumptions.push(`No SEER was on the nameplate line, so ${ctx.seer} SEER is used from the age of the equipment.`);
  else if (ctx.age != null && ctx.age > 8) ctx.assumptions.push(`Nameplate SEER is ${ctx.listedSeer}. Effective SEER is figured at ${ctx.seer} after ${ctx.age - 8} years of wear.`);
ctx.depth = num(ctx.f("attic", "Depth (in)"));
ctx.type = ctx.f("attic", "Insulation type");
ctx.rate = rPerInch(ctx.type);
ctx.atticR = ctx.depth != null && ctx.rate != null ? Math.round(ctx.depth * ctx.rate) : null;
ctx.sqft = num(ctx.input.sqft);
ctx.atticScore = null;
ctx.stories = ctx.input.stories.startsWith("3") ? 3 : num(ctx.input.stories) || 1;
ctx.ceiling = ctx.sqft ? ctx.sqft / ctx.stories : null;
ctx.heat = null;
if (ctx.atticR != null && ctx.ceiling) {
    const nowBtu = (ctx.ceiling * DESIGN_DT) / ctx.atticR;
    const targetBtu = (ctx.ceiling * DESIGN_DT) / ATTIC_TARGET;
    const extra = Math.max(0, nowBtu - targetBtu) * PEAK_HOURS;
    const dollars = dollarsFromBtu(extra, ctx.seer);
    const span = band(dollars);
    ctx.heat = `${Math.round(nowBtu).toLocaleString()} BTU/hr through the ceiling now. At R-${ATTIC_TARGET} it would be about ${Math.round(targetBtu).toLocaleString()}.`;
    ctx.verdicts.attic = `${ctx.depth} in of ${ctx.type.toLowerCase()} is about R-${ctx.atticR}. ${ctx.heat}`;
    ctx.assumptions.push(`Attic R-value is depth times ${ctx.rate} per inch for ${ctx.type.toLowerCase()}. The ceiling area is the floor area divided by the number of stories.`);
    if (span.high > 5) {
      ctx.raw.push({ id: "heat", label: "Attic heat gain", low: span.low, high: span.high, note: `Extra heat through the ceiling versus R-${ATTIC_TARGET}, removed by this ${ctx.seer} SEER unit.` });
    }
    const score = Math.round((ctx.atticR / ATTIC_TARGET) * 100);
    ctx.atticScore = score;
    if (ctx.atticR < 38) ctx.concerns.push({ score: ATTIC_TARGET - ctx.atticR, line: `Attic heat gain. About R-${ctx.atticR} against a R-${ATTIC_TARGET} target.` });
  } else if (ctx.atticR != null) {
    ctx.verdicts.attic = `${ctx.depth} in of ${ctx.type.toLowerCase()} is about R-${ctx.atticR}.`;
    ctx.atticScore = Math.round((ctx.atticR / ATTIC_TARGET) * 100);
  }
ctx.paths = [];
ctx.leakCfm = 0;
if (ctx.f("air-seal", "Top plates open") === "Yes") {
    ctx.paths.push("open top plates");
    ctx.leakCfm += 30;
  }
ctx.cans = num(ctx.f("air-seal", "Unsealed cans (count)"));
if (ctx.cans) {
    ctx.paths.push(`${ctx.cans} unsealed can lights`);
    ctx.leakCfm += ctx.cans * 6;
  }
if (ctx.f("air-seal", "Hatch weatherstrip") === "No") {
    ctx.paths.push("a hatch with no weatherstrip");
    ctx.leakCfm += 15;
  }
ctx.plumbing = num(ctx.f("air-seal", "Plumbing penetrations (count)"));
if (ctx.plumbing) {
    ctx.paths.push(`${ctx.plumbing} open plumbing holes`);
    ctx.leakCfm += ctx.plumbing * 2;
  }
ctx.electrical = num(ctx.f("air-seal", "Electrical penetrations (count)"));
if (ctx.electrical) {
    ctx.paths.push(`${ctx.electrical} open electrical holes`);
    ctx.leakCfm += ctx.electrical * 2;
  }
if (ctx.f("air-seal", "Chimney chase") === "Yes") {
    ctx.paths.push("an open chimney chase");
    ctx.leakCfm += 25;
  }
if (ctx.paths.length) {
    const btu = 1.08 * ctx.leakCfm * ATTIC_AIR_DT * PEAK_HOURS;
    const span = band(dollarsFromBtu(btu, ctx.seer));
    ctx.verdicts.attic = [ctx.verdicts.attic, `${ctx.paths.join(", ")}. About ${Math.round(ctx.leakCfm)} CFM of attic air is the allowance for those openings.`].filter(Boolean).join(" ");
    if (span.high > 5) ctx.raw.push({ id: "air", label: "Attic loss", low: span.low, high: span.high, note: "Hot attic air coming through the openings above, on top of the heat gain through the insulation." });
    const airScore = ctx.leakCfm <= 10 ? 88 : ctx.leakCfm <= 40 ? 72 : ctx.leakCfm <= 80 ? 58 : 42;
    ctx.atticScore = ctx.atticScore == null ? airScore : Math.min(ctx.atticScore, airScore);
    ctx.concerns.push({ score: Math.min(80, ctx.leakCfm), line: `Attic air is getting in through ${ctx.paths.slice(0, 2).join(" and ")}.` });
    ctx.assumptions.push("Each unsealed can is allowed 6 CFM, an open top-plate line 30 CFM, a bare hatch 15 CFM, and a chase 25 CFM. Those are allowances, not a test.");
  }
if (ctx.atticScore != null) ctx.grades.push(grade("attic", "Attic", ctx.atticScore, ctx.verdicts.attic));
ctx.cellulose = /cellulose/i.test(ctx.type);
if (ctx.cellulose && ctx.paths.length) ctx.dust.push(`Blown cellulose breaks down and gets dusty. These openings pull that dust in: ${ctx.paths.join(", ")}.`);
  else if (ctx.cellulose) ctx.dust.push("The attic has blown cellulose. It breaks down and gets dusty. This assessment did not find an open path.");
ctx.people = num(ctx.input.occupants);
ctx.actual = num(ctx.input.peakBill);
ctx.occupantAdd = Math.max(0, (ctx.people ?? 2) - 2) * 12;
}
