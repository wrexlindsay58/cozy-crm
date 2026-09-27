import type { RangeId } from "@/lib/sales-data";

export type Grain = "day" | "week" | "month" | "quarter" | "year";

export type Snap = { name: string; score: number; n: number };

export type Person = { name: string; office: string };

export type Period = {
  id: RangeId;
  grain: Grain;
  current: Snap[];
  history: Snap[][];
};

export type Ranked = Snap & {
  office: string;
  rank: number;
  moved: number | null;
  streak: number;
};

export function grainWord(grain: Grain, n: number) {
  const word = grain === "day" ? "day" : grain === "week" ? "week" : grain === "month" ? "month" : grain === "quarter" ? "quarter" : "year";
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function placed(snaps: Snap[], allow: Set<string> | null, fewest: boolean, min: number) {
  const active = snaps.filter((s) => s.n > 0 && (!allow || allow.has(s.name)));
  const ready = active.filter((s) => s.n >= min);
  const pending = active.filter((s) => s.n < min);
  ready.sort((a, b) => (fewest ? a.score - b.score : b.score - a.score) || a.name.localeCompare(b.name));
  let last = Number.NaN;
  let rank = 0;
  const rows = ready.map((row, i) => {
    if (row.score !== last) {
      rank = i + 1;
      last = row.score;
    }
    return { ...row, rank };
  });
  return { rows, pending };
}

function finish(periods: { rows: (Snap & { rank: number })[] }[], officeOf: (name: string) => string): Ranked[] {
  const now = periods[periods.length - 1];
  const prior = periods.length > 1 ? periods[periods.length - 2] : undefined;
  return (now?.rows ?? []).map((row) => {
    const before = prior?.rows.find((p) => p.name === row.name);
    let streak = 1;
    for (let i = periods.length - 2; i >= 0; i -= 1) {
      const then = periods[i].rows.find((p) => p.name === row.name);
      if (!then || then.rank !== row.rank) break;
      streak += 1;
    }
    return { ...row, office: officeOf(row.name), moved: before ? before.rank - row.rank : null, streak };
  });
}

export function rankPeriod(period: Period, people: Person[], office: string, fewest: boolean, min = 1): Ranked[] {
  const allow = office === "all" ? null : new Set(people.filter((p) => p.office === office).map((p) => p.name));
  const periods = [...period.history, period.current].map((snaps) => placed(snaps, allow, fewest, min));
  return finish(periods, (name) => people.find((p) => p.name === name)?.office ?? "");
}

export function rankOffices(period: Period, people: Person[], fewest: boolean, blend: boolean, min = 1): Ranked[] {
  function roll(snaps: Snap[]): Snap[] {
    const by = new Map<string, { n: number; score: number; weight: number }>();
    for (const snap of snaps) {
      if (snap.n <= 0) continue;
      const person = people.find((p) => p.name === snap.name);
      if (!person) continue;
      const cur = by.get(person.office) ?? { n: 0, score: 0, weight: 0 };
      cur.n += snap.n;
      cur.score += snap.score;
      cur.weight += snap.score * snap.n;
      by.set(person.office, cur);
    }
    return [...by.entries()].map(([name, v]) => ({
      name,
      n: v.n,
      score: blend ? Math.round(v.weight / v.n) : v.score,
    }));
  }
  const periods = [...period.history, period.current].map((snaps) => placed(roll(snaps), null, fewest, min));
  return finish(periods, () => "");
}
