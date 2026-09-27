import { useEffect, useState } from "react";
import { BOARDS, type Board } from "@/features/leaderboard/catalog";
import type { CustomBoard } from "@/features/leaderboard/custom";
import { cn } from "@/lib/cn";
import { ranges, type RangeId } from "@/lib/sales-data";
import { WhoList } from "@/features/leaderboard/define-sheet";
import type { Person } from "@/features/leaderboard/rank";

export function CustomSheet({
  boards = BOARDS,
  groups,
  onClose,
  onSave,
}: {
  boards?: Board[];
  groups: { label: string; people: Person[] }[];
  onClose: () => void;
  onSave: (row: Omit<CustomBoard, "id">) => void;
}) {
  const [sourceId, setSourceId] = useState(boards[0]?.id ?? "");
  const source = boards.find((b) => b.id === sourceId) ?? boards[0];
  const [metricId, setMetricId] = useState(source.metrics[0].id);
  const [range, setRange] = useState<RangeId>("mtd");
  const [who, setWho] = useState(source.people.map((p) => p.name));
  const metric = source.metrics.find((m) => m.id === metricId) ?? source.metrics[0];
  const [name, setName] = useState(`${source.label} · ${metric.label}`);
  const [named, setNamed] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pickPosition(id: string) {
    const next = boards.find((b) => b.id === id) ?? boards[0];
    if (!next) return;
    const nextMetric = next.metrics[0];
    setSourceId(next.id);
    setMetricId(nextMetric.id);
    setWho(next.people.map((p) => p.name));
    if (!named) setName(`${next.label} · ${nextMetric.label}`);
  }

  function pickMetric(id: string) {
    const next = source.metrics.find((m) => m.id === id) ?? source.metrics[0];
    setMetricId(next.id);
    if (!named) setName(`${source.label} · ${next.label}`);
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col bg-card shadow-sm md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:max-h-none">
        <header className="shrink-0 border-b border-line px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold">Save a roster</h2>
              <p className="text-[13px] text-muted">A roster is a cut of a race. It does not create a board, a group, or a race.</p>
            </div>
            <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          <p className="text-[12px] font-semibold text-muted">Group</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {boards.map((b) => (
              <button key={b.id} type="button" onClick={() => pickPosition(b.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", sourceId === b.id ? "bg-navy text-card" : "border border-line text-muted")}>
                {b.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[12px] font-semibold text-muted">Race</p>
          <div className="mt-1 flex flex-col">
            {source.metrics.map((m) => (
              <button key={m.id} type="button" onClick={() => pickMetric(m.id)} className={cn("h-10 rounded-md px-2 text-left text-[13px] font-semibold", metricId === m.id ? "bg-page text-navy" : "text-ink")}>
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[12px] font-semibold text-muted">Period</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {ranges.map((r) => (
              <button key={r.id} type="button" onClick={() => setRange(r.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", range === r.id ? "bg-navy text-card" : "border border-line text-muted")}>
                {r.label}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-[12px] font-semibold text-muted">
            Name
            <input
              value={name}
              onChange={(e) => {
                setNamed(true);
                setName(e.target.value);
              }}
              className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm font-normal text-ink outline-none focus:border-navy"
            />
          </label>
          <WhoList groups={groups} who={who} setWho={setWho} />
        </div>
        <footer className="shrink-0 border-t border-line px-4 py-3">
          <button
            type="button"
            disabled={!name.trim() || who.length === 0}
            onClick={() => onSave({ name: name.trim(), sourceId: source.id, metricId: metric.id, range, who })}
            className="h-11 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40"
          >
            Save roster
          </button>
        </footer>
      </aside>
    </div>
  );
}
