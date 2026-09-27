import { useEffect, useMemo, useState } from "react";
import { Archive, LayoutGrid, Plus, Trash2, Users } from "lucide-react";
import { PageTitle } from "@/components/ui-bits";
import { Tip } from "@/components/tip";
import { BookPick } from "@/features/book/pick";
import { BOARDS, type Board, type Metric } from "@/features/leaderboard/catalog";
import { addBoard, addPosition, addRace, asMetric, mapsFor, retireRace, setEntered, setGroupBoards, useBoards, useDefinitions } from "@/features/leaderboard/define";
import { BoardSheet, MapSheet, PositionSheet, RaceSheet } from "@/features/leaderboard/define-sheet";
import { compatible, customerBoard, groupRow, isPlace, placeOf } from "@/features/leaderboard/fields";
import { removeCustom, useCustomBoards } from "@/features/leaderboard/custom";
import { RankDrawer } from "@/features/leaderboard/drawer";
import { grainWord, rankOffices, rankPeriod, type Period, type Ranked } from "@/features/leaderboard/rank";
import { useStaff } from "@/features/staff/store";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { ranges, type RangeId } from "@/lib/sales-data";

type Choice = { id: string; label: string; metric: Metric; who?: string[]; customId?: string; raceId?: string; entered?: boolean };

function initials(name: string) {
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

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function scoreText(metric: Metric, score: number) {
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

function paceText(metric: Metric, who: string, row: Ranked, heads: number) {
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

function fillPeriod(period: Period, people: { name: string }[], metric: Metric): Period {
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

function behind(metric: Metric, ahead: Ranked | undefined, row: Ranked) {
  if (!ahead) return "";
  if (ahead.rank === row.rank) return "Tied";
  const gap = Math.abs(ahead.score - row.score);
  if (gap === 0) return "Tied";
  return metric.fewest ? `${gapText(metric, gap)} more` : `${gapText(metric, gap)} back`;
}

function choicesFor(board: Board, customs: { id: string; name: string; sourceId: string; metricId: string; who: string[] }[], races: { id: string; mode: string }[]): Choice[] {
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

function Move({ moved }: { moved: number | null }) {
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

function Row({
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

function Entry({ kind, score, n, onCommit }: { kind: Metric["kind"]; score: number; n: number; onCommit: (score: number, n: number) => void }) {
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

function Tile({
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
    <section className="flex min-w-0 flex-col border border-line bg-card">
      <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-line px-3 py-2">
        <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold">{position}</h2>
        {choices && choices.length > 1 && onChoice && choice ? (
          <BookPick value={choice} items={choices.map((c) => ({ id: c.id, label: c.label }))} onChange={onChoice} />
        ) : (
          <p className="truncate text-[12px] text-muted">{title}</p>
        )}
        {onMap ? (
          <Tip label="Boards this group is on" on>
            <button type="button" aria-label="Boards this group is on" onClick={onMap} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink">
              <LayoutGrid className="size-4" />
            </button>
          </Tip>
        ) : null}
        {onAdd ? (
          <Tip label="Add race" on>
            <button type="button" aria-label="Add race" onClick={onAdd} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink">
              <Plus className="size-4" />
            </button>
          </Tip>
        ) : null}
        {onRetire ? (
          <Tip label="Retire this race" on>
            <button type="button" aria-label="Retire this race" onClick={onRetire} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink">
              <Archive className="size-4" />
            </button>
          </Tip>
        ) : null}
        {onRemove ? (
          <Tip label="Remove this board" on>
            <button type="button" aria-label="Remove this board" onClick={onRemove} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-alert">
              <Trash2 className="size-4" />
            </button>
          </Tip>
        ) : null}
      </header>
      {entered && !offices ? <p className="border-b border-line px-3 py-1.5 text-[12px] text-muted">{locked ? "Entered · this period is closed" : "Entered · today can still be changed"}</p> : null}
      {openEntry ? (
        <ol className="max-h-[17.5rem] divide-y divide-line overflow-y-auto">
          {roster
            .map((person) => ranked.find((r) => r.name === person.name) ?? { name: person.name, score: 0, n: 0, office: person.office, rank: 0, moved: null, streak: 0 })
            .filter((row) => !needle || row.name.toLowerCase().includes(needle))
            .sort((a, b) => (a.rank === 0 ? 1 : 0) - (b.rank === 0 ? 1 : 0) || a.rank - b.rank || a.name.localeCompare(b.name))
            .map((row) => (
              <li key={row.name} className="flex min-h-14 items-center gap-2 px-3">
                <button type="button" onClick={() => onOpen(row.name)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className="w-7 text-[15px] font-semibold text-navy tabular-nums">{row.rank || "–"}</span>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-[10px] font-bold text-card">{initials(row.name)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{row.name}</span>
                    <span className="block truncate text-[12px] text-muted">{row.n ? meta(row) : row.office}</span>
                  </span>
                </button>
                <Entry kind={metric.kind} score={row.score} n={row.n} onCommit={(score, n) => onScore?.(row.name, score, n)} />
              </li>
            ))}
        </ol>
      ) : pool.length === 0 ? (
        <p className="px-3 py-6 text-[13px] text-muted">{locked ? "This period is closed." : needle ? "No one matches that name." : metric.min > 1 ? `No one has ${metric.min} ${metric.sample}s yet.` : "No one on this board."}</p>
      ) : (
        <ol className="max-h-[17.5rem] divide-y divide-line overflow-y-auto">
          {pool.map((row) => (
            <Row key={row.name} row={row} metric={metric} meta={meta(row)} on={open === row.name} onOpen={() => onOpen(row.name)} />
          ))}
        </ol>
      )}
      {pool.length > 5 ? <p className="border-t border-line px-3 py-2 text-[12px] text-muted">Scroll for {pool.length - 5} more</p> : null}
    </section>
  );
}

export function Leaderboard() {
  const { actorName, viewAs, perms } = useStaff();
  const canDefine = Boolean(perms[viewAs]?.editCatalog);
  const customs = useCustomBoards();
  const { positions, races } = useDefinitions();
  const [range, setRange] = useState<RangeId>("day");
  const pages = useBoards();
  const [boardId, setBoardId] = useState("people");
  const [office, setOffice] = useState("all");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [addingPosition, setAddingPosition] = useState(false);
  const [addingBoard, setAddingBoard] = useState(false);
  const [mapping, setMapping] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>({});

  const active = pages.find((page) => page.id === boardId) ?? pages[0];

  const wall = useMemo(() => {
    const extra = (id: string) => races.filter((race) => race.positionId === id && !race.retired).map(asMetric);
    return [
      ...BOARDS.map((board) => ({ ...board, page: board.page ?? "people", metrics: [...board.metrics, ...extra(board.id)] })),
      { ...customerBoard(), metrics: [...customerBoard().metrics, ...extra("customers")] },
      ...positions.map((position) => ({
        id: position.id,
        label: position.name,
        who: position.page === "partners" ? "partner" : position.page === "customers" ? "customer" : "person",
        page: position.page ?? "people",
        people: position.people,
        metrics: extra(position.id),
      })),
    ];
  }, [positions, races]);

  const shown = useMemo(() => {
    return wall.flatMap((board) => {
      const row = groupRow(board.page);
      if (!mapsFor(board.id, board.page).includes(active.id) || !compatible(row, active.row) || !board.metrics.length) return [];
      const choices = choicesFor(board, customs, races);
      const pick = choices.find((choice) => choice.id === picks[board.id]) ?? choices[0];
      if (!pick) return [];
      return [{ key: board.id, position: board.label, title: pick.label, board, metric: pick.metric, who: pick.who, customId: pick.customId, raceId: pick.raceId, entered: pick.entered, choices, choice: pick.id, offices: isPlace(active.row) }];
    });
  }, [active.id, active.row, customs, picks, races, wall]);
  const openSpec = shown.find((s) => s.key === openKey?.split("::")[0]);
  const openName = openKey?.split("::")[1] ?? null;
  const period = openSpec?.metric.periods.find((p) => p.id === range) ?? openSpec?.metric.periods[0];
  const roll = isPlace(active.row) ? (officeName: string) => placeOf(officeName, active.row) : undefined;
  const openRoster = openSpec ? (openSpec.who ? openSpec.board.people.filter((p) => openSpec.who?.includes(p.name)) : openSpec.board.people) : [];
  const memberRoster = roll ? openRoster.map((person) => ({ ...person, office: roll(person.office) })) : openRoster;
  const filled = openSpec && period ? (openSpec.metric.id.startsWith("RC-") || openSpec.metric.id.startsWith("customers:") ? period : fillPeriod(period, openRoster, openSpec.metric)) : null;
  const members = openSpec?.offices && filled && openName ? rankPeriod(filled, memberRoster, openName, Boolean(openSpec.metric.fewest), openSpec.metric.min).filter((r) => r.rank > 0) : undefined;
  const openRow = openSpec && filled
    ? (openSpec.offices ? rankOffices(filled, memberRoster, Boolean(openSpec.metric.fewest), openSpec.metric.kind === "pct" || openSpec.metric.kind === "days", openSpec.metric.min) : rankPeriod(filled, openRoster, office, Boolean(openSpec.metric.fewest), openSpec.metric.min)).find((r) => r.name === openName)
    : null;

  useEffect(() => {
    setOpenKey(null);
  }, [range, office, boardId]);

  const offices = [{ id: "all", label: "All offices" }, ...Array.from(new Set(BOARDS.flatMap((b) => b.people.map((p) => p.office)))).map((id) => ({ id, label: id }))];

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-line bg-card px-4">
        <PageTitle
          title="Leaderboard"
          flush
          actions={
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <BookPick value={active.id} onChange={setBoardId} items={pages.map((page) => ({ id: page.id, label: page.name }))} />
              {active.row === "person" || active.row === "partner" ? <BookPick value={office} onChange={setOffice} items={offices} /> : null}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a name"
                aria-label="Find a name"
                className="h-9 w-36 shrink-0 rounded-md border border-line bg-card px-2.5 text-[13px] outline-none focus:border-navy sm:w-44"
              />
              {canDefine ? (
                <button type="button" onClick={() => { setOpenKey(null); setAddingBoard(true); }} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-navy px-3 text-[13px] font-semibold text-card">
                  <Plus className="size-3.5" />
                  Add board
                </button>
              ) : null}
              {canDefine ? (
                <button type="button" onClick={() => { setOpenKey(null); setAddingPosition(true); }} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line px-3 text-[13px] font-semibold">
                  <Users className="size-3.5" />
                  Add group
                </button>
              ) : null}
              {range === "day" ? (
                <Tip label="As of this hour" on>
                  <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted">
                    <i className="live-pip" />
                    Live
                  </span>
                </Tip>
              ) : null}
              <div className="ml-auto flex shrink-0 rounded-md bg-page p-0.5">
                {ranges.map((r) => (
                  <button key={r.id} type="button" onClick={() => setRange(r.id)} className={cn("h-8 rounded-sm px-2.5 text-[12px] font-semibold", range === r.id ? "bg-card text-ink" : "text-muted")}>
                    {r.label}
                  </button>
                ))}
              </div>
            </span>
          }
        />
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((spec) => (
            <Tile
              key={spec.key}
              position={spec.position}
              title={spec.title}
              board={spec.board}
              metric={spec.metric}
              range={range}
              office={spec.offices ? "all" : office}
              query={query}
              who={spec.who}
              you={actorName}
              offices={spec.offices}
              rollup={spec.offices ? (officeName) => placeOf(officeName, active.row) : undefined}
              choices={spec.choices}
              choice={spec.choice}
              entered={spec.entered}
              locked={Boolean(spec.entered && range !== "day")}
              onChoice={(id) => {
                setPicks((cur) => ({ ...cur, [spec.board.id]: id }));
                setOpenKey(null);
              }}
              open={openKey === `${spec.key}::${openName}` ? openName : null}
              onOpen={(name) => setOpenKey(`${spec.key}::${name}`)}
              onScore={spec.entered && spec.raceId && range === "day" ? (name, score, n) => setEntered(spec.raceId!, "day", name, score, n) : undefined}
              onRetire={canDefine && spec.raceId && !spec.offices ? () => { retireRace(spec.raceId!); setPicks((cur) => ({ ...cur, [spec.board.id]: spec.board.metrics[0]?.id ?? "" })); } : undefined}
              onAdd={canDefine ? () => setAdding(spec.board.id) : undefined}
              onMap={canDefine ? () => setMapping(spec.board.id) : undefined}
              onRemove={
                spec.customId
                  ? () => {
                      removeCustom(spec.customId!);
                      setPicks((cur) => ({ ...cur, [spec.board.id]: spec.board.metrics[0].id }));
                      if (openKey?.startsWith(`${spec.key}::`)) setOpenKey(null);
                    }
                  : undefined
              }
            />
          ))}
          {positions
            .filter((position) => mapsFor(position.id, position.page).includes(active.id) && !shown.some((spec) => spec.key === position.id))
            .map((position) => (
              <section key={position.id} className="border border-line bg-card">
                <header className="flex h-14 items-center justify-between gap-2 px-3">
                  <h2 className="truncate text-[13px] font-semibold">{position.name}</h2>
                  {canDefine ? (
                    <Tip label="Add race" on>
                      <button type="button" aria-label="Add race" onClick={() => setAdding(position.id)} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink">
                        <Plus className="size-4" />
                      </button>
                    </Tip>
                  ) : null}
                </header>
                <p className="px-3 py-6 text-[13px] text-muted">No races on this group.</p>
              </section>
            ))}
        </div>
      </div>
      {openSpec && openRow ? <RankDrawer row={openRow} metric={openSpec.metric} range={range} members={members} onClose={() => setOpenKey(null)} /> : null}
      {adding ? (
        <RaceSheet
          position={wall.find((board) => board.id === adding)?.label ?? "Group"}
          row={groupRow(wall.find((board) => board.id === adding)?.page)}
          names={(wall.find((board) => board.id === adding)?.metrics ?? []).map((metric) => metric.label)}
          onClose={() => setAdding(null)}
          onSave={(race) => {
            const positionId = adding;
            const id = addRace({ ...race, positionId });
            setPicks((cur) => ({ ...cur, [positionId]: id }));
            setAdding(null);
          }}
        />
      ) : null}
      {addingPosition ? (
        <PositionSheet
          page={active.row === "partner" ? "partners" : active.row === "customer" ? "customers" : "people"}
          current={active.id}
          pages={pages}
          names={wall.map((board) => board.label)}
          groups={wall.filter((board) => (board.page ?? "people") === (active.row === "partner" ? "partners" : active.row === "customer" ? "customers" : "people")).map((board) => ({ label: board.label, people: board.people }))}
          onClose={() => setAddingPosition(false)}
          onSave={(row) => {
            const made = addPosition(row);
            setPicks((cur) => ({ ...cur, [made.positionId]: made.raceId }));
            if (row.boards[0]) setBoardId(row.boards.includes(active.id) ? active.id : row.boards[0]);
            setAddingPosition(false);
          }}
        />
      ) : null}
      {addingBoard ? (
        <BoardSheet
          names={pages.map((page) => page.name)}
          onClose={() => setAddingBoard(false)}
          onSave={(row) => {
            setBoardId(addBoard(row));
            setAddingBoard(false);
          }}
        />
      ) : null}
      {mapping ? (
        <MapSheet
          group={wall.find((board) => board.id === mapping)?.label ?? "Group"}
          row={groupRow(wall.find((board) => board.id === mapping)?.page)}
          pages={pages}
          selected={mapsFor(mapping, wall.find((board) => board.id === mapping)?.page)}
          onClose={() => setMapping(null)}
          onSave={(boards) => {
            setGroupBoards(mapping, boards);
            setMapping(null);
          }}
        />
      ) : null}
    </div>
  );
}
