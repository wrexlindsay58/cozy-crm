import { useMemo } from "react";
import type { Board, Metric } from "@/features/leaderboard/catalog";
import { grainWord, rankOffices, rankPeriod, type Ranked } from "@/features/leaderboard/rank";
import { cn } from "@/lib/cn";
import type { RangeId } from "@/lib/sales-data";
import { initials, plural, scoreText, paceText, fillPeriod, behind, Move, type Choice } from "./part-01";
import { TileView } from "./part-05";

export function Row({
  row,
  metric,
  meta,
  on,
  onOpen,
}: {
  row: Ranked;
  metric: Metric;
  meta: string;
  on: boolean;
  onOpen: () => void;
}) {
  const quiet = row.rank === 0;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "grid min-h-14 w-full grid-cols-[1.75rem_2.75rem_minmax(0,1fr)_auto] items-center gap-2 border-l-2 px-3 py-1.5 text-left",
          row.rank === 1 ? "border-navy" : "border-transparent",
          on ? "bg-page" : "hover:bg-page",
        )}
      >
        <span className="text-[15px] font-semibold text-navy tabular-nums">{quiet ? "–" : row.rank}</span>
        {quiet ? <span /> : <Move moved={row.moved} />}
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-[10px] font-bold text-card">{initials(row.name)}</span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold">{row.name}</span>
            <span className="block truncate text-[12px] text-muted">{meta}</span>
          </span>
        </span>
        <span className="text-[15px] font-semibold text-navy tabular-nums">{scoreText(metric, row.score)}</span>
      </button>
    </li>
  );
}

export function Tile({
  position,
  title,
  board,
  metric,
  range,
  office,
  query,
  who,
  you,
  open,
  offices,
  rollup,
  choices,
  choice,
  entered,
  locked,
  onChoice,
  onOpen,
  onScore,
  onRetire,
  onAdd,
  onMap,
  onRemove,
}: {
  position: string;
  title: string;
  board: Board;
  metric: Metric;
  range: RangeId;
  office: string;
  query: string;
  who?: string[];
  you: string;
  open: string | null;
  offices?: boolean;
  rollup?: (office: string) => string;
  choices?: Choice[];
  choice?: string;
  entered?: boolean;
  locked?: boolean;
  onChoice?: (id: string) => void;
  onOpen: (name: string) => void;
  onScore?: (name: string, score: number, n: number) => void;
  onRetire?: () => void;
  onAdd?: () => void;
  onMap?: () => void;
  onRemove?: () => void;
}) {
  const period = metric.periods.find((p) => p.id === range) ?? metric.periods[0];
  const roster = who ? board.people.filter((p) => who.includes(p.name)) : board.people;
  const blend = metric.kind === "pct" || metric.kind === "days";
  const pad = !metric.id.startsWith("RC-") && !metric.id.startsWith("customers:");
  const filled = useMemo(() => (pad ? fillPeriod(period, roster, metric) : period), [period, roster, metric, pad]);
  const rankingRoster = useMemo(() => (rollup ? roster.map((person) => ({ ...person, office: rollup(person.office) })) : roster), [roster, rollup]);
  const ranked = useMemo(
    () => (offices ? rankOffices(filled, rankingRoster, Boolean(metric.fewest), blend, metric.min) : rankPeriod(filled, roster, office, Boolean(metric.fewest), metric.min)),
    [filled, rankingRoster, roster, office, metric.fewest, metric.min, offices, blend],
  );
  const placed = ranked.filter((r) => r.rank > 0);
  const needle = query.trim().toLowerCase();
  const pool = needle ? placed.filter((r) => r.name.toLowerCase().includes(needle)) : placed;
  const order = new Map(placed.map((r, i) => [r.name, placed[i - 1]]));
  const openEntry = Boolean(entered && !locked && onScore);

  function meta(row: Ranked) {
    if (row.rank === 0) return `${plural(row.n, metric.sample)} · needs ${metric.min}`;
    const chase = row.rank === 1 ? `${grainWord(period.grain, row.streak)} at #1` : behind(metric, order.get(row.name), row);
    if (offices) {
      const heads = rankingRoster.filter((p) => p.office === row.name && filled.current.some((s) => s.name === p.name && s.n > 0)).length;
      const fair = paceText(metric, board.who, row, heads);
      return fair ? `${fair} · ${chase}` : chase;
    }
    const whoLine = row.name === you ? "You" : row.office;
    return `${whoLine} · ${chase}`;
  }

  return (
    <TileView bag={{ position, choices, onChoice, choice, title, onMap, onAdd, onRetire, onRemove, entered, offices, locked, openEntry, roster, ranked, needle, onOpen, meta, metric, onScore, pool, open }} />
  );
}
