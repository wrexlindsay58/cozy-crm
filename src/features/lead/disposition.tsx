import { DISPOSITIONS, setDisposition, type Disposition } from "@/features/ops/store";
import type { Appointment } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

export function DispositionControl({
  appointment,
  onRan,
}: {
  appointment?: Appointment;
  onRan?: () => void;
}) {
  if (!appointment) {
    return (
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Disposition</h2>
        <p className="mt-2 text-sm text-muted">Book the run first.</p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Disposition</h2>
      <div className="flex flex-wrap gap-1.5">
        {DISPOSITIONS.map((d) => {
          const on = appointment.status === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDisposition(appointment.id, d as Disposition);
                if (d === "Ran") onRan?.();
              }}
              className={cn(
                "h-10 rounded-md px-3 text-sm font-semibold",
                on ? "bg-navy text-card" : "border border-line bg-card hover:border-navy",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </section>
  );
}
