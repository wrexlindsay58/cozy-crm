import type { RangeId } from "@/lib/sales-data";
import { defs, emit, type CustomRace, write_defs } from "./part-01";

export function addRace(input: Omit<CustomRace, "id" | "retired" | "scores">) {
  const race: CustomRace = { ...input, id: `RC-${Date.now()}`, name: input.name.trim(), retired: false, scores: {} };
  write_defs({ ...defs, races: [...defs.races, race] });
  emit();
  return race.id;
}

export function setEntered(id: string, range: RangeId, name: string, score: number, n: number) {
  if (range !== "day") return;
  write_defs({
    ...defs,
    races: defs.races.map((race) => {
      if (race.id !== id || race.mode !== "entered" || race.retired) return race;
      const current = (race.scores.day ?? []).filter((snap) => snap.name !== name);
      const scores = { ...race.scores, day: n > 0 ? [...current, { name, score, n }] : current };
      return { ...race, scores };
    }),
  });
  emit();
}
