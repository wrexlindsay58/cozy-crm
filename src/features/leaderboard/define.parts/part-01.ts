import { useSyncExternalStore } from "react";
import { BOARDS, type Metric, type ScoreKind } from "@/features/leaderboard/catalog";
import { BUILT_BOARDS, calcSnaps, defaultBoards, fieldSnaps, type RowKind } from "@/features/leaderboard/fields";
import type { Period, Person, Snap } from "@/features/leaderboard/rank";
import { ranges, type RangeId } from "@/lib/sales-data";
export type CustomPosition = { id: string; name: string; people: Person[]; page?: "people" | "partners" | "customers"; boards?: string[] };
export type CustomRace = {
  id: string;
  positionId: string;
  name: string;
  fewest: boolean;
  kind: ScoreKind;
  sample: string;
  min: number;
  mode: "measured" | "entered" | "field" | "calc";
  sourceKey?: string;
  field?: string;
  calc?: { left: string; op: "+" | "-" | "/"; right: string };
  office: boolean;
  retired: boolean;
  scores: Partial<Record<RangeId, Snap[]>>;
};
export type PageBoard = { id: string; name: string; row: RowKind };
type Defs = { positions: CustomPosition[]; races: CustomRace[]; boards: PageBoard[]; maps: Record<string, string[]> };
const KEY = "cozy-leaderboard-defs";
const GRAIN: Record<RangeId, Period["grain"]> = { day: "day", wtd: "week", mtd: "month", qtd: "quarter", ytd: "year", ltd: "year" };
function read(): Defs {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Defs) : null;
    if (!parsed || !Array.isArray(parsed.positions) || !Array.isArray(parsed.races)) return { positions: [], races: [], boards: [], maps: {} };
    return { positions: parsed.positions, races: parsed.races, boards: Array.isArray(parsed.boards) ? parsed.boards : [], maps: parsed.maps && typeof parsed.maps === "object" ? parsed.maps : {} };
  } catch {
    return { positions: [], races: [], boards: [], maps: {} };
  }
}
export let defs = read();
const listeners = new Set<() => void>();
export function emit() {
  defs = { positions: [...defs.positions], races: [...defs.races], boards: [...defs.boards], maps: { ...defs.maps } };
  try {
    localStorage.setItem(KEY, JSON.stringify(defs));
  } catch {
    /* demo storage can be blocked */
  }
  listeners.forEach((l) => l());
}
export function useDefinitions() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => defs,
    () => defs,
  );
}
export function directory(): Person[] {
  const map = new Map<string, Person>();
  for (const board of BOARDS) for (const person of board.people) map.set(person.name, person);
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
export function measuredSources() {
  return BOARDS.flatMap((board) => board.metrics.map((metric) => ({ key: `${board.id}:${metric.id}`, label: `${board.label} · ${metric.label}`, metric })));
}
export function raceMin(kind: ScoreKind) {
  return kind === "pct" || kind === "days" ? 3 : 1;
}
function sourceMetric(key: string) {
  const [boardId, metricId] = key.split(":");
  return BOARDS.find((b) => b.id === boardId)?.metrics.find((m) => m.id === metricId);
}
export function useBoards(): PageBoard[] {
  const { boards } = useDefinitions();
  return [...BUILT_BOARDS, ...boards];
}
export function mapsFor(id: string, page?: string) {
  const custom = defs.positions.find((position) => position.id === id);
  if (custom?.boards?.length) return custom.boards;
  return defs.maps[id] ?? defaultBoards(page);
}
export function setGroupBoards(id: string, boards: string[]) {
  defs = { ...defs, maps: { ...defs.maps, [id]: boards } };
  emit();
}
export function addBoard(input: { name: string; row: RowKind }) {
  const board: PageBoard = { id: `RB-${Date.now()}`, name: input.name.trim(), row: input.row };
  defs = { ...defs, boards: [...defs.boards, board] };
  emit();
  return board.id;
}
function periodsFrom(currentFor: (range: RangeId) => Snap[]): Period[] {
  return ranges.map((range) => ({ id: range.id, grain: GRAIN[range.id], history: [], current: currentFor(range.id) }));
}
export function asMetric(race: CustomRace): Metric {
  if (race.mode === "measured" && race.sourceKey) {
    const source = sourceMetric(race.sourceKey);
    if (source) {
      return { ...source, id: race.id, label: race.name, fewest: race.fewest, kind: race.kind, sample: race.sample, min: race.min, noun: race.sample };
    }
  }
  if (race.mode === "field" && race.field) {
    return { id: race.id, label: race.name, fewest: race.fewest, kind: race.kind, sample: race.sample, min: race.min, noun: race.sample, periods: periodsFrom((range) => fieldSnaps(race.field!, range)) };
  }
  if (race.mode === "calc" && race.calc) {
    const calc = race.calc;
    return { id: race.id, label: race.name, fewest: race.fewest, kind: race.kind, sample: race.sample, min: race.min, noun: race.sample, periods: periodsFrom((range) => calcSnaps(calc.left, calc.op, calc.right, range)) };
  }
  const periods: Period[] = ranges.map((range) => ({
    id: range.id,
    grain: GRAIN[range.id],
    history: [],
    current: race.scores[range.id] ?? [],
  }));
  return { id: race.id, label: race.name, fewest: race.fewest, kind: race.kind, sample: race.sample, min: race.min, noun: race.sample, periods };
}
export function addPosition(input: { name: string; people: Person[]; page?: "people" | "partners" | "customers"; boards?: string[]; race: Omit<CustomRace, "id" | "positionId" | "retired" | "scores"> }) {
  const position: CustomPosition = { id: `RP-${Date.now()}`, name: input.name.trim(), people: input.people, page: input.page ?? "people", boards: input.boards };
  const race: CustomRace = { ...input.race, id: `RC-${Date.now() + 1}`, positionId: position.id, name: input.race.name.trim(), retired: false, scores: {} };
  defs = { ...defs, positions: [...defs.positions, position], races: [...defs.races, race] };
  emit();
  return { positionId: position.id, raceId: race.id };
}
export function retireRace(id: string) {
  defs = { ...defs, races: defs.races.map((race) => (race.id === id ? { ...race, retired: true } : race)) };
  emit();
}
export function write_defs(__v: any) { defs = __v; }
