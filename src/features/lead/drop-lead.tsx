import { useState } from "react";
import { dropLead } from "@/features/ops/store";

export function DropLead({
  leadId,
  open,
  onClose,
}: {
  leadId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  if (!open) return null;
  return (
    <section className="rounded-md border border-stop bg-card p-4">
      <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Drop lead</h2>
      <p className="mt-1 text-sm text-muted">Leaves the book. File stays. History keeps the reason.</p>
      <label className="mt-3 block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Reason</span>
        <input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm" />
      </label>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="h-11 rounded-md bg-stop px-3 text-sm font-semibold text-card"
          onClick={() => {
            if (!reason.trim()) return;
            dropLead(leadId, reason.trim());
            onClose();
          }}
        >
          Drop
        </button>
        <button type="button" className="h-11 rounded-md border border-line px-3 text-sm font-semibold" onClick={onClose}>
          Cancel
        </button>
      </div>
    </section>
  );
}
