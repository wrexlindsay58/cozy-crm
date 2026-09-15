import { useNavigate } from "@tanstack/react-router";
import { createLead } from "@/features/ops/store";
import { DetailsForm } from "./details-form";

export function NewLeadSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-auto rounded-t-xl bg-card p-4 shadow-sm md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:rounded-none">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">New lead</h2>
          <button type="button" className="h-10 px-2 text-sm font-semibold text-muted" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="mb-3 text-sm text-muted">Name and phone are enough to open a file.</p>
        <DetailsForm
          submitLabel="Create file"
          onSubmit={(draft) => {
            const lead = createLead(draft);
            onClose();
            if (lead) void navigate({ to: "/leads/$leadId", params: { leadId: lead.id } });
          }}
        />
      </aside>
    </div>
  );
}
