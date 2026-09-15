import { useState } from "react";
import { logCall } from "@/features/ops/store";

const RESULTS = ["Answered", "VM", "No answer"] as const;

export function CallLog({
  personId,
  open,
  onClose,
}: {
  personId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [direction, setDirection] = useState<"Out" | "In">("Out");
  const [result, setResult] = useState<(typeof RESULTS)[number]>("Answered");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  if (!open) return null;
  return (
    <section className="rounded-md border border-navy bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Log call</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Direction</span>
          <select value={direction} onChange={(e) => setDirection(e.target.value as "Out" | "In")} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm">
            <option>Out</option>
            <option>In</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Result</span>
          <select value={result} onChange={(e) => setResult(e.target.value as (typeof RESULTS)[number])} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm">
            {RESULTS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Minutes</span>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="numeric" className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm" />
        </label>
      </div>
      <label className="mt-3 block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Note</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm" />
      </label>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card"
          onClick={() => {
            logCall(personId, { direction, result, duration, note });
            onClose();
          }}
        >
          Save call
        </button>
        <button type="button" className="h-11 rounded-md border border-line px-3 text-sm font-semibold" onClick={onClose}>
          Cancel
        </button>
      </div>
    </section>
  );
}
