export const REPORT_FEE = 149;
const ATTIC_TARGET = 49;
const LIFE_YEARS = 15;
const KWH_RATE = 0.14;
const DESIGN_DT = 30;
const ATTIC_AIR_DT = 50;
const PEAK_HOURS = 300;
const TARGET_SEER = 16;

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

function num(value?: string) {
  const n = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && String(value ?? "").trim() ? n : null;
}

function field(packets: { id: string; fields: Record<string, string> }[], id: string, label: string) {
  const own = packets.find((p) => p.id === id)?.fields[label]?.trim() ?? "";
  if (own || id !== "air-seal") return own;
  return packets.find((p) => p.id === "attic")?.fields[label]?.trim() ?? "";
}

function rPerInch(type: string) {
  const parts = type.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s && s !== "none");
  const rates = parts.map((p) => R_PER_INCH[p]).filter((n) => n != null);
  if (!rates.length) return null;
  return Math.min(...rates);
}

function grille(size: string) {
  const match = size.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  return Number(match[1]) * Number(match[2]);
}

function band(n: number) {
  const low = Math.max(0, Math.round(n * 0.75));
  const high = Math.max(low, Math.round(n * 1.25));
  return { low, high };
}

function letter(score: number): GradeLetter {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 55) return "D";
  return "F";
}

function grade(id: string, label: string, score: number, line: string): SectionGrade {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return { id, label, letter: letter(clamped), score: clamped, line };
}

function dollarsFromBtu(btu: number, seer: number) {
  return (btu / (seer * 1000)) * KWH_RATE;
}

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
  const packets = input.packets;
  const f = (id: string, label: string) => field(packets, id, label);
  const assumptions = [
    "No blower door was run. Open paths and duct loss are allowances from what was written down, not a measured air-changes number.",
    "Dollars are a peak-month estimate. They are not the utility bill and they are not a price.",
    `Cooling energy uses about ${Math.round(KWH_RATE * 100)}¢ a kilowatt-hour and this unit's effective SEER. A modern comparison unit is ${TARGET_SEER} SEER.`,
    `Heat through the ceiling uses a ${DESIGN_DT}° difference and about ${PEAK_HOURS} hours in a peak month. Attic air leaking in uses a ${ATTIC_AIR_DT}° difference, because an attic runs hotter than the outdoor design temperature.`,
  ];
  const verdicts: Record<string, string> = {};
  const dust: string[] = [];
  const comfort: string[] = [];
  const concerns: { score: number; line: string }[] = [];
  const grades: SectionGrade[] = [];
  const raw: CostSlice[] = [];

  const year = num(f("hvac", "Manufacture year"));
  const age = year != null ? new Date().getFullYear() - year : null;
  const listedSeer = num(f("hvac", "Listed SEER"));
  let seer = listedSeer ?? (age != null && age >= 12 ? 10 : age != null && age >= 5 ? 13 : 14);
  if (age != null && age > 8) seer = Math.max(8, seer * (1 - 0.015 * (age - 8)));
  seer = Math.round(seer * 10) / 10;
  if (listedSeer == null) assumptions.push(`No SEER was on the nameplate line, so ${seer} SEER is used from the age of the equipment.`);
  else if (age != null && age > 8) assumptions.push(`Nameplate SEER is ${listedSeer}. Effective SEER is figured at ${seer} after ${age - 8} years of wear.`);

  const depth = num(f("attic", "Depth (in)"));
  const type = f("attic", "Insulation type");
  const rate = rPerInch(type);
  const atticR = depth != null && rate != null ? Math.round(depth * rate) : null;
  const sqft = num(input.sqft);
  let atticScore: number | null = null;
  const stories = input.stories.startsWith("3") ? 3 : num(input.stories) || 1;
  const ceiling = sqft ? sqft / stories : null;
  let heat: string | null = null;
  if (atticR != null && ceiling) {
    const nowBtu = (ceiling * DESIGN_DT) / atticR;
    const targetBtu = (ceiling * DESIGN_DT) / ATTIC_TARGET;
    const extra = Math.max(0, nowBtu - targetBtu) * PEAK_HOURS;
    const dollars = dollarsFromBtu(extra, seer);
    const span = band(dollars);
    heat = `${Math.round(nowBtu).toLocaleString()} BTU/hr through the ceiling now. At R-${ATTIC_TARGET} it would be about ${Math.round(targetBtu).toLocaleString()}.`;
    verdicts.attic = `${depth} in of ${type.toLowerCase()} is about R-${atticR}. ${heat}`;
    assumptions.push(`Attic R-value is depth times ${rate} per inch for ${type.toLowerCase()}. The ceiling area is the floor area divided by the number of stories.`);
    if (span.high > 5) {
      raw.push({ id: "heat", label: "Attic heat gain", low: span.low, high: span.high, note: `Extra heat through the ceiling versus R-${ATTIC_TARGET}, removed by this ${seer} SEER unit.` });
    }
    const score = Math.round((atticR / ATTIC_TARGET) * 100);
    atticScore = score;
    if (atticR < 38) concerns.push({ score: ATTIC_TARGET - atticR, line: `Attic heat gain. About R-${atticR} against a R-${ATTIC_TARGET} target.` });
  } else if (atticR != null) {
    verdicts.attic = `${depth} in of ${type.toLowerCase()} is about R-${atticR}.`;
    atticScore = Math.round((atticR / ATTIC_TARGET) * 100);
  }

  const paths: string[] = [];
  let leakCfm = 0;
  if (f("air-seal", "Top plates open") === "Yes") {
    paths.push("open top plates");
    leakCfm += 30;
  }
  const cans = num(f("air-seal", "Unsealed cans (count)"));
  if (cans) {
    paths.push(`${cans} unsealed can lights`);
    leakCfm += cans * 6;
  }
  if (f("air-seal", "Hatch weatherstrip") === "No") {
    paths.push("a hatch with no weatherstrip");
    leakCfm += 15;
  }
  const plumbing = num(f("air-seal", "Plumbing penetrations (count)"));
  if (plumbing) {
    paths.push(`${plumbing} open plumbing holes`);
    leakCfm += plumbing * 2;
  }
  const electrical = num(f("air-seal", "Electrical penetrations (count)"));
  if (electrical) {
    paths.push(`${electrical} open electrical holes`);
    leakCfm += electrical * 2;
  }
  if (f("air-seal", "Chimney chase") === "Yes") {
    paths.push("an open chimney chase");
    leakCfm += 25;
  }
  if (paths.length) {
    const btu = 1.08 * leakCfm * ATTIC_AIR_DT * PEAK_HOURS;
    const span = band(dollarsFromBtu(btu, seer));
    verdicts.attic = [verdicts.attic, `${paths.join(", ")}. About ${Math.round(leakCfm)} CFM of attic air is the allowance for those openings.`].filter(Boolean).join(" ");
    if (span.high > 5) raw.push({ id: "air", label: "Attic loss", low: span.low, high: span.high, note: "Hot attic air coming through the openings above, on top of the heat gain through the insulation." });
    const airScore = leakCfm <= 10 ? 88 : leakCfm <= 40 ? 72 : leakCfm <= 80 ? 58 : 42;
    atticScore = atticScore == null ? airScore : Math.min(atticScore, airScore);
    concerns.push({ score: Math.min(80, leakCfm), line: `Attic air is getting in through ${paths.slice(0, 2).join(" and ")}.` });
    assumptions.push("Each unsealed can is allowed 6 CFM, an open top-plate line 30 CFM, a bare hatch 15 CFM, and a chase 25 CFM. Those are allowances, not a test.");
  }
  if (atticScore != null) grades.push(grade("attic", "Attic", atticScore, verdicts.attic));

  const cellulose = /cellulose/i.test(type);
  if (cellulose && paths.length) dust.push(`Blown cellulose breaks down and gets dusty. These openings pull that dust in: ${paths.join(", ")}.`);
  else if (cellulose) dust.push("The attic has blown cellulose. It breaks down and gets dusty. This assessment did not find an open path.");

  const people = num(input.occupants);
  const actual = num(input.peakBill);
  const occupantAdd = Math.max(0, (people ?? 2) - 2) * 12;
  const bill = sqft
    ? {
        actual: actual ?? undefined,
        low: Math.round(sqft * 0.1 + occupantAdd),
        high: Math.round(sqft * 0.14 + occupantAdd),
        note: `A ${sqft.toLocaleString()} sq ft house${people ? ` with ${people} people` : ""} usually lands in this range in a peak summer month when the attic and ducts are doing their job.`,
      }
    : null;
  if (bill) assumptions.push("The bill range is about 10¢ to 14¢ of peak-month cost per square foot, plus a little for each person past two. It is not their rate plan.");
  const coolingPool = actual != null ? actual * 0.7 : bill ? ((bill.low + bill.high) / 2) * 0.7 : null;
  if (coolingPool != null) assumptions.push(actual != null ? "About 70% of the peak bill is treated as cooling." : "Where no bill was written down, the cooling share uses the middle of the size-based range.");

  const tons = num(f("hvac", "Tonnage"));
  const splitField = num(f("hvac", "Delta T (°F)"));
  const retT = num(f("hvac", "Return temp (°F)"));
  const supT = num(f("hvac", "Supply temp (°F)"));
  const split = splitField ?? (retT != null && supT != null ? retT - supT : null);
  const rs = num(f("hvac", "Return static (in WC)"));
  const ss = num(f("hvac", "Supply static (in WC)"));
  const staticTotal = rs != null && ss != null ? Math.round((rs + ss) * 100) / 100 : null;
  if (age != null || listedSeer != null || split != null) {
    const bits = [
      age != null ? `${age} years old` : "",
      listedSeer != null ? `${listedSeer} SEER on the nameplate, about ${seer} SEER effective` : `about ${seer} SEER effective`,
      split != null ? `${split}° temperature split` : "",
      staticTotal != null ? `${staticTotal} in total static` : "",
    ].filter(Boolean);
    verdicts.hvac = `The equipment is ${bits.join(", ")}.`;
    let score = 96;
    if (age != null && age > LIFE_YEARS) score -= age > 20 ? 34 : 18;
    if (seer < 13) score -= 12;
    if (seer < 10) score -= 12;
    if (split != null && (split < 16 || split > 22)) score -= 16;
    if (staticTotal != null && staticTotal > 0.5) score -= staticTotal > 0.8 ? 22 : 12;
    grades.push(grade("hvac", "HVAC", score, verdicts.hvac));
    if (tons && seer < TARGET_SEER) {
      const baseBtu = tons * 12000 * PEAK_HOURS * 0.55;
      const extra = dollarsFromBtu(baseBtu, seer) - dollarsFromBtu(baseBtu, TARGET_SEER);
      const span = band(extra);
      if (span.high > 5) {
        raw.push({
          id: "equipment",
          label: "Equipment",
          low: span.low,
          high: span.high,
          note: `What this ${seer} SEER unit adds on a normal ${tons}-ton load versus ${TARGET_SEER} SEER. Age is already in the effective SEER.`,
        });
      }
      assumptions.push("The equipment dollar is only the efficiency gap on a normal load. It is not added again on top of the attic and duct loads.");
    }
    if (age != null && age > LIFE_YEARS) concerns.push({ score: 20 + (age - LIFE_YEARS), line: `The equipment is ${age - LIFE_YEARS} years past a ${LIFE_YEARS}-year life, running near ${seer} SEER.` });
  }

  const returns = num(f("ducts", "Return registers (count)"));
  const supplies = num(f("ducts", "Supply registers (count)"));
  const returnCount = returns ?? 0;
  const sizes: string[] = [];
  for (let i = 1; i <= Math.max(returnCount, 1); i += 1) {
    const sized = f("ducts", `Return ${i} size`) || (i === 1 ? f("ducts", "Return size") : "");
    if (sized) sizes.push(sized);
  }
  const listed = sizes.reduce((sum, sized) => sum + (grille(sized) ?? 0), 0);
  const oneSize = sizes.length === 1 && returnCount > 1 && !f("ducts", "Return 2 size");
  const grilleArea = oneSize ? listed * returnCount : listed;
  let perTon: number | null = null;
  if (grilleArea && tons && returnCount) {
    perTon = Math.round(grilleArea / tons);
    const listedSizes = sizes.join(" and ");
    const word = perTon >= 250 ? "Excellent" : perTon >= 200 ? "Tight" : "Too small. The air is choking.";
    verdicts.ducts = `${listedSizes} across ${returnCount} return${returnCount === 1 ? "" : "s"} is ${perTon} sq in per ton. ${word}`;
    assumptions.push("Each return is sized on its own. The areas are added, then divided by the tons. Under 200 sq in per ton, the air is treated as choking. 250 is excellent.");
    if (perTon < 200 && coolingPool != null) {
      const penalty = Math.min(0.25, ((200 - perTon) / 200) * 0.45);
      const span = band(coolingPool * penalty);
      raw.push({ id: "return", label: "Choked return", low: span.low, high: span.high, note: `A short return makes the system run longer. This is about ${Math.round(penalty * 100)}% of the cooling share.` });
      concerns.push({ score: 75, line: `The return is choking at ${perTon} sq in per ton.` });
    }
  }

  const jumps = num(f("ducts", "Jump ducts")) ?? num(f("ducts", "Jump ducts (count)"));
  const transfers = num(f("ducts", "Transfer grilles")) ?? num(f("ducts", "Air transfers (count)"));
  const jumpN = jumps ?? 0;
  const transferN = transfers ?? 0;
  const pathsBack = (returns ?? 0) + jumpN + transferN;
  const pathLine = `${jumpN} jump duct${jumpN === 1 ? "" : "s"}. ${transferN} transfer grille${transferN === 1 ? "" : "s"}.`;
  if (returnCount || supplies != null || jumps != null || transfers != null) {
    verdicts.ducts = verdicts.ducts ? `${verdicts.ducts} ${pathLine}` : pathLine;
  }
  if (supplies != null && pathsBack > 0 && supplies / pathsBack >= 5) {
    const heavy = supplies / pathsBack >= 8 || pathsBack <= 1;
    const line = `There are ${supplies} supplies and ${pathsBack} ways back. Closed doors still hold air in the room.`;
    verdicts.ducts = verdicts.ducts ? `${verdicts.ducts} ${line}` : line;
    if (coolingPool != null) {
      const span = band(coolingPool * (heavy ? 0.1 : 0.06));
      raw.push({
        id: "doors",
        label: "Closed-door rooms",
        low: span.low,
        high: span.high,
        note: jumpN + transferN > 0 ? "Jump ducts and transfers are not enough for the number of supplies." : "No jump duct or air transfer was counted for the extra supplies.",
      });
    }
    concerns.push({ score: heavy ? 48 : 32, line: `Closed-door rooms need a way back. ${supplies} supplies, ${pathsBack} return paths.` });
    assumptions.push("A return path is a return grille, a jump duct, or an air transfer. The closed-door allowance applies when supplies outnumber those paths by five to one or more.");
  } else if ((jumps != null || transfers != null) && jumpN + transferN > 0 && supplies != null) {
    assumptions.push("Jump ducts and air transfers are counted as return paths, so a closed door can still get air back to the system.");
  }

  const location = f("ducts", "Location");
  const ductR = f("ducts", "Duct insulation (R)");
  const condition = f("ducts", "Condition");
  const inAttic = /attic|garage|crawl/i.test(location);
  const boots = num(f("ducts", "Boot leaks (count)")) ?? 0;
  const drops = num(f("ducts", "Disconnected runs (count)")) ?? 0;
  if (boots || drops) dust.push(`${[drops ? `${drops} disconnected run${drops === 1 ? "" : "s"}` : "", boots ? `${boots} leaking boot${boots === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ")} can pull attic air and attic dust into the rooms.`);
  let baseLoss = 0;
  let conditionLoss = 0;
  let leakLoss = 0;
  if (inAttic && ductR) {
    baseLoss = ductR === "None" ? 35 : ductR === "R-4" ? 28 : ductR === "R-6" ? 20 : ductR === "R-8" ? 15 : 20;
    if (drops) leakLoss += Math.min(16, drops * 8);
    if (boots) leakLoss += Math.min(10, boots * 2);
    if (/kinked/i.test(condition)) conditionLoss += 5;
    if (/sagging/i.test(condition)) conditionLoss += 5;
    if (/crushed/i.test(condition)) conditionLoss += 5;
    if (/deck/i.test(condition)) conditionLoss += 5;
    const totalLoss = Math.min(45, baseLoss + leakLoss + conditionLoss);
    const ductLine = `Ducts are ${ductR} in the ${location.toLowerCase()}. About ${totalLoss}% of the cooled air is figured as never reaching the rooms.`;
    verdicts.ducts = verdicts.ducts ? `${verdicts.ducts} ${ductLine}` : ductLine;
    if (coolingPool != null) {
      const baseSpan = band(coolingPool * Math.max(0, baseLoss + leakLoss - 10) / 100);
      if (baseSpan.high > 5) raw.push({ id: "ducts", label: "Duct loss", low: baseSpan.low, high: baseSpan.high, note: `${ductR} ducts in the ${location.toLowerCase()}${boots || drops ? ", plus open boots or disconnected runs" : ""}. The first 10% is treated as ordinary.` });
      if (conditionLoss && condition) {
        const condSpan = band(coolingPool * conditionLoss / 100);
        raw.push({ id: "shape", label: /kinked/i.test(condition) && /sagging/i.test(condition) ? "Kinked and sagging" : condition, low: condSpan.low, high: condSpan.high, note: `${condition} adds about ${conditionLoss} points of loss on top of the duct R-value.` });
      }
    }
    assumptions.push("Duct loss starts from the R-value and where the ducts sit, then adds disconnected runs, boot leaks, and kinked, sagging, crushed, or decked lines. It is capped at 45%.");
    if (totalLoss >= 25) concerns.push({ score: totalLoss, line: `About ${totalLoss}% of the cooled air is figured as lost before it reaches the rooms.` });
    const ductScore = (totalLoss <= 12 ? 92 : totalLoss <= 20 ? 80 : totalLoss <= 30 ? 64 : 46) - (perTon != null && perTon < 200 ? 12 : 0);
    grades.push(grade("ducts", "Ducts", ductScore, verdicts.ducts));
  } else if (verdicts.ducts || condition) {
    if (condition) verdicts.ducts = `${verdicts.ducts ? `${verdicts.ducts} ` : ""}Duct lines are ${condition.toLowerCase()}.`;
    grades.push(grade("ducts", "Ducts", perTon != null && perTon < 200 ? 58 : 72, verdicts.ducts));
  }

  const glazing = f("windows", "Glazing");
  const failed = num(f("windows", "Failed seals (count)")) ?? 0;
  const stuck = num(f("windows", "Won't operate (count)")) ?? 0;
  const count = num(f("windows", "Count"));
  const glass = num(f("windows", "Window temperature (°F)"));
  const outside = num(input.outdoorTemp) ?? num(f("windows", "Outside temperature (°F)"));
  if (glazing || failed || count || glass != null) {
    let score = glazing === "Single" ? 48 : glazing === "Triple" ? 94 : 84;
    score -= Math.min(30, failed * 6 + stuck * 4);
    const room = num(input.indoorTemp) ?? 78;
    let heatLine = "";
    if (glass != null) {
      const panes = Math.max(count ?? 1, 1);
      const area = panes * 12;
      const now = area * 1.5 * Math.max(0, glass - room);
      const target = area * 1.5 * 4;
      const extra = Math.max(0, now - target);
      const sun = outside != null && glass > outside;
      heatLine = `The glass is ${glass}°${outside != null ? ` and it is ${outside}° outside` : ""}. ${sun ? "The sun is heating the panes past the air. " : ""}Against a ${room}° room, the glass is adding about ${Math.round(now).toLocaleString()} BTU/hr.`;
      if (extra > 0) {
        const span = band(dollarsFromBtu(extra * PEAK_HOURS, seer));
        if (span.high > 5) raw.push({ id: "windows", label: "Window heat", low: span.low, high: span.high, note: `Interior glass at ${glass}° versus a pane that would sit about 4° above the ${room}° room. Area is an allowance of 12 sq ft per window.` });
      }
      const over = glass - room - 8;
      if (over > 0) score -= Math.min(24, Math.round(over / 5) * 6);
      assumptions.push("Window heat uses the glass temperature against the room, at about 1.5 BTU per hour per square foot per degree. Each window is allowed 12 square feet. A better pane is figured at 4° above the room.");
    }
    const line = [count ? `${count} windows` : "", glazing ? glazing.toLowerCase() : "", failed ? `${failed} failed seals` : ""].filter(Boolean).join(", ");
    verdicts.windows = [line ? `${line}.` : "Windows were assessed.", heatLine].filter(Boolean).join(" ");
    grades.push(grade("windows", "Windows", score, verdicts.windows));
    if (glazing === "Single" || failed >= 3 || (glass != null && glass - room >= 20)) concerns.push({ score: 24, line: heatLine || verdicts.windows });
  }

  if (cellulose && paths.length) concerns.push({ score: 60, line: "Cellulose dust has a way into the house." });
  const hot = input.hotRooms.trim();
  if (hot) comfort.push(`${hot} run hot. That lines up with the attic, the ducts, or the equipment.`);
  if (input.coldRooms.trim()) comfort.push(`${input.coldRooms.trim()} run cold.`);

  let slices = raw.filter((slice) => slice.high > 0);
  if (actual != null && slices.length) {
    const mid = slices.reduce((sum, slice) => sum + (slice.low + slice.high) / 2, 0);
    const cap = actual * 0.85;
    if (mid > cap && mid > 0) {
      const scale = cap / mid;
      slices = slices.map((slice) => ({ ...slice, low: Math.round(slice.low * scale), high: Math.round(slice.high * scale) }));
      assumptions.push("The separate allowances were scaled so together they stay under the peak bill. They still overlap in a real house.");
    }
  }

  const weights = grades.map((grade) => ({ A: 95, B: 85, C: 72, D: 60, F: 45 }[grade.letter]));
  const overall = weights.length ? letter(weights.reduce((sum, n) => sum + n, 0) / weights.length) : "C";

  return {
    grades,
    overall,
    slices,
    concerns: concerns.sort((a, b) => b.score - a.score).slice(0, 4).map((item) => item.line),
    dust,
    comfort,
    bill,
    assumptions,
    verdicts,
    heat,
  };
}
