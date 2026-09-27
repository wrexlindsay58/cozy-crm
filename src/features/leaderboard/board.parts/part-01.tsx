import { useState } from "react";
import { Tip } from "@/components/tip";
import type { Board, Metric } from "@/features/leaderboard/catalog";
import type { Period, Ranked } from "@/features/leaderboard/rank";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";

export type Choice = { id: string; label: string; metric: Metric; who?: string[]; customId?: string; raceId?: string; entered?: boolean };

export function initials(name: string) {
  const crew = name.match(/Crew\s+(\d)/);
  if (crew) return `C${crew[1]}`;
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return name.slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function scoreText(metric: Metric, score: number) {
  if (metric.sample === "minute") return score < 60 ? `${score} min` : plural(Math.max(1, Math.round(score / 60)), "hour");
  if (metric.kind === "money") return money(score);
  if (metric.kind === "pct") return `${Math.round(score)}%`;
  if (metric.kind === "days") return plural(score, "day");
  return String(score);
}

function gapText(metric: Metric, gap: number) {
  if (metric.sample === "minute") return gap < 60 ? `${gap} min` : plural(Math.max(1, Math.round(gap / 60)), "hour");
  if (metric.kind === "money") return money(gap);
  if (metric.kind === "pct") return `${Math.round(gap)} pts`;
  if (metric.kind === "days") return plural(gap, "day");
  return plural(gap, metric.sample);
}

export function paceText(metric: Metric, who: string, row: Ranked, heads: number) {
  if (metric.kind === "pct" || metric.kind === "days" || metric.sample === "minute") return plural(row.n, metric.sample === "minute" ? "answer" : metric.sample);
  if (metric.fewest) {
    const per = row.n ? row.score / row.n : row.score;
    const text = per < 10 ? String(Math.round(per * 10) / 10) : String(Math.round(per));
    return `${text} per ${metric.sample}`;
  }
  if (!heads) return "";
  const per = row.score / heads;
  const text = metric.kind === "money" ? money(Math.round(per)) : String(Math.max(1, Math.round(per)));
  return `${text} per ${who}`;
}

export function fillPeriod(period: Period, people: { name: string }[], metric: Metric): Period {
  const have = new Set(period.current.map((s) => s.name));
  const missing = people.filter((p) => !have.has(p.name));
  if (!missing.length || !period.current.length) return period;
  const scores = period.current.map((s) => s.score);
  const edge = metric.fewest ? Math.max(...scores) : Math.min(...scores);
  const stepSize = metric.kind === "money" ? Math.max(400, Math.round(edge * 0.08)) : 1;
  const added = missing.map((p, i) => {
    const step = i + 1;
    const score = metric.fewest ? edge + step : Math.max(1, edge - step * stepSize);
    const n = period.id === "day" ? 1 : Math.max(metric.min, 3 + (i % 3));
    return { name: p.name, score, n };
  });
  return { ...period, current: [...period.current, ...added] };
}

export function behind(metric: Metric, ahead: Ranked | undefined, row: Ranked) {
  if (!ahead) return "";
  if (ahead.rank === row.rank) return "Tied";
  const gap = Math.abs(ahead.score - row.score);
  if (gap === 0) return "Tied";
  return metric.fewest ? `${gapText(metric, gap)} more` : `${gapText(metric, gap)} back`;
}

export function choicesFor(board: Board, customs: { id: string; name: string; sourceId: string; metricId: string; who: string[] }[], races: { id: string; mode: string }[]): Choice[] {
  const built = board.metrics.map((metric) => {
    const race = races.find((r) => r.id === metric.id);
    return { id: metric.id, label: metric.label, metric, raceId: race?.id, entered: race?.mode === "entered" };
  });
  const saved = customs.flatMap((custom) => {
    if (custom.sourceId !== board.id) return [];
    const metric = board.metrics.find((m) => m.id === custom.metricId);
    if (!metric) return [];
    return [{ id: custom.id, label: custom.name, metric, who: custom.who, customId: custom.id }];
  });
  return [...built, ...saved];
}

export function Move({ moved }: { moved: number | null }) {
  if (moved == null) {
    return (
      <Tip label="First period on the board" on>
        <span className="text-[11px] font-semibold text-muted">New</span>
      </Tip>
    );
  }
  if (moved === 0) {
    return (
      <Tip label="Held this rank" on>
        <span className="text-[13px] font-semibold text-muted">–</span>
      </Tip>
    );
  }
  const up = moved > 0;
  const places = Math.abs(moved);
  return (
    <Tip label={`${up ? "Up" : "Down"} ${places} ${places === 1 ? "place" : "places"}`} on>
      <span className={cn("inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums", up ? "text-go" : "text-stop")}>
        <svg viewBox="0 0 10 10" className="size-2.5 shrink-0" aria-hidden>
          {up ? <path d="M5 1.5 9 8.5H1Z" fill="currentColor" /> : <path d="M5 8.5 9 1.5H1Z" fill="currentColor" />}
        </svg>
        {places}
      </span>
    </Tip>
  );
}

export function Entry({ kind, score, n, onCommit }: { kind: Metric["kind"]; score: number; n: number; onCommit: (score: number, n: number) => void }) {
  const tries = kind === "pct" || kind === "days";
  const [text, setText] = useState(n ? String(score) : "");
  const [sample, setSample] = useState(n ? String(n) : "");
  function commit() {
    const value = Number(text);
    if (!Number.isFinite(value) || value < 0 || text.trim() === "") {
      onCommit(0, 0);
      return;
    }
    const count = tries ? Number(sample) : kind === "num" ? value : 1;
    onCommit(value, Number.isFinite(count) && count > 0 ? count : 0);
  }
  return (
    <span className="flex shrink-0 items-center gap-1">
      <input value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} inputMode="decimal" aria-label="Score" className="h-8 w-16 rounded-md border border-line bg-card px-2 text-right text-[13px] font-semibold outline-none focus:border-navy" />
      {tries ? <input value={sample} onChange={(e) => setSample(e.target.value)} onBlur={commit} inputMode="numeric" aria-label="How many" placeholder="Tries" className="h-8 w-14 rounded-md border border-line bg-card px-2 text-[12px] outline-none focus:border-navy" /> : null}
    </span>
  );
}
