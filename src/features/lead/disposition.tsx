import { DISPOSITIONS, setDisposition, setLeadStatus } from "@/features/ops/store";
import type { Appointment, Lead } from "@/lib/crm-data";
import { LEAD_STATUSES } from "@/lib/lead-status";
import { cn } from "@/lib/cn";

export function DispositionControl({
  lead,
  appointment,
  onRan,
}: {
  lead: Lead;
  appointment?: Appointment;
  onRan?: () => void;
}) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Disposition</h2>
      <div className="flex flex-wrap gap-1.5">
        {LEAD_STATUSES.map((d) => {
          const on = lead.status === d.label;
          return (
            <button
              key={d.label}
              type="button"
              onClick={() => {
                setLeadStatus(lead.id, d.label);
                if (appointment && (DISPOSITIONS as readonly string[]).includes(d.label)) {
                  setDisposition(appointment.id, d.label);
                }
                if (d.label === "Ran") onRan?.();
              }}
              className={cn(
                "h-7 rounded-md px-2 text-[11px] font-semibold",
                on ? "bg-navy text-card" : "border border-line bg-card hover:border-navy",
              )}
            >
              {d.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
