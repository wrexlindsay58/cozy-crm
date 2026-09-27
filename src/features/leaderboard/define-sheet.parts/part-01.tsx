import { useEffect, useState } from "react";
import type { ScoreKind } from "@/features/leaderboard/catalog";
import { raceMin, type CustomRace } from "@/features/leaderboard/define";
import { raceFields } from "@/features/leaderboard/fields";
import { RaceFieldsView } from "./part-04";

export const KINDS: { id: ScoreKind; label: string }[] = [
  { id: "money", label: "Dollars" },
  { id: "pct", label: "Percent" },
  { id: "num", label: "Count" },
  { id: "days", label: "Time" },
];

export type RaceDraft = Omit<CustomRace, "id" | "positionId" | "retired" | "scores">;

export function RaceFields({
  name,
  setName,
  fewest,
  setFewest,
  kind,
  setKind,
  sample,
  setSample,
  mode,
  setMode,
  sourceKey,
  setSourceKey,
  rightKey,
  setRightKey,
  op,
  setOp,
  row,
  names,
}: {
  name: string;
  setName: (v: string) => void;
  fewest: boolean;
  setFewest: (v: boolean) => void;
  kind: ScoreKind;
  setKind: (v: ScoreKind) => void;
  sample: string;
  setSample: (v: string) => void;
  mode: "field" | "calc" | "entered";
  setMode: (v: "field" | "calc" | "entered") => void;
  sourceKey: string;
  setSourceKey: (v: string) => void;
  rightKey: string;
  setRightKey: (v: string) => void;
  op: "+" | "-" | "/";
  setOp: (v: "+" | "-" | "/") => void;
  row: "person" | "partner" | "customer";
  names: string[];
}) {
  const fields = raceFields().filter((field) => field.row === row);
  const taken = names.some((n) => n.toLowerCase() === name.trim().toLowerCase());
  const groups = [...new Set(fields.map((field) => field.group))];
  return (
    <RaceFieldsView bag={{ name, setName, taken, setMode, mode, setFewest, fewest, setKind, kind, sample, setSample, groups, fields, setSourceKey, sourceKey, setOp, op, setRightKey, rightKey }} />
  );
}

export function useClose(onClose: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

export function RaceSheet({
  position,
  names,
  row,
  onClose,
  onSave,
}: {
  position: string;
  names: string[];
  row: "person" | "partner" | "customer";
  onClose: () => void;
  onSave: (race: RaceDraft) => void;
}) {
  const fields = raceFields().filter((field) => field.row === row);
  const first = fields[0];
  const [name, setName] = useState("");
  const [fewest, setFewest] = useState(false);
  const [kind, setKind] = useState<ScoreKind>("num");
  const [sample, setSample] = useState("");
  const [mode, setMode] = useState<"field" | "calc" | "entered">("field");
  const [sourceKey, setSourceKey] = useState(first?.id ?? "");
  const [rightKey, setRightKey] = useState(fields[1]?.id ?? first?.id ?? "");
  const [op, setOp] = useState<"+" | "-" | "/">("/");
  useClose(onClose);
  const taken = names.some((n) => n.toLowerCase() === name.trim().toLowerCase());
  const source = fields.find((field) => field.id === sourceKey) ?? first;
  const ready = Boolean(name.trim() && !taken && (mode === "entered" ? sample.trim() : source && (mode === "field" || rightKey)));
  function draft(): RaceDraft {
    const base = source && mode !== "entered" ? source : null;
    return {
      name: name.trim(),
      fewest,
      kind: base ? base.kind : kind,
      sample: base ? base.sample : sample.trim(),
      min: base ? raceMin(base.kind) : raceMin(kind),
      mode,
      field: mode === "field" ? sourceKey : undefined,
      calc: mode === "calc" ? { left: sourceKey, op, right: rightKey } : undefined,
      office: false,
    };
  }
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col bg-card shadow-sm md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:max-h-none">
        <header className="shrink-0 border-b border-line px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold">Add a race</h2>
              <p className="text-[13px] text-muted">{position}</p>
            </div>
            <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          <RaceFields name={name} setName={setName} fewest={fewest} setFewest={setFewest} kind={kind} setKind={setKind} sample={sample} setSample={setSample} mode={mode} setMode={setMode} sourceKey={sourceKey} setSourceKey={setSourceKey} rightKey={rightKey} setRightKey={setRightKey} op={op} setOp={setOp} row={row} names={names} />
        </div>
        <footer className="shrink-0 border-t border-line px-4 py-3">
          <button
            type="button"
            disabled={!ready}
            onClick={() => onSave(draft())}
            className="h-11 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40"
          >
            Add race
          </button>
        </footer>
      </aside>
    </div>
  );
}
