import { StatusPill } from "@/components/ui-bits";
import { useOps } from "@/features/ops/store";
import type { WorkTarget } from "./work-dialog";

export function WorkTab({
  personId,
  onOpen,
}: {
  personId: string;
  owner: string;
  onOpen: (target: WorkTarget) => void;
}) {
  const { tickets, tasks } = useOps();
  const mineT = tickets.filter((t) => t.related === personId);
  const mineK = tasks.filter((t) => t.personId === personId && !t.ticketId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {mineT.length === 0 && mineK.length === 0 ? <p className="text-sm text-muted">None yet.</p> : null}
        {mineT.length > 0 ? <h2 className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Tickets</h2> : null}
        <ul className="space-y-2">
          {mineT.map((t) => (
            <li key={t.id}>
              <button type="button" className="w-full rounded-md border border-line p-2 text-left" onClick={() => onOpen({ kind: "ticket", id: t.id })}>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-[11px] text-muted">
                  {t.owner} · {t.due || t.age}
                </p>
                <StatusPill label={`${t.priority} · ${t.status}`} tone={t.status === "Done" ? "up" : t.priority === "High" ? "alert" : "navy"} />
              </button>
            </li>
          ))}
        </ul>
        {mineK.length > 0 ? <h2 className="mt-4 mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Tasks</h2> : null}
        <ul className="space-y-2">
          {mineK.map((t) => (
            <li key={t.id}>
              <button type="button" className="w-full rounded-md border border-line p-2 text-left" onClick={() => onOpen({ kind: "task", id: t.id })}>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-[11px] text-muted">
                  {t.owner} · {t.due} · {t.status}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-line p-2">
        <button type="button" className="h-11 rounded-md bg-navy text-sm font-semibold text-card" onClick={() => onOpen({ kind: "ticket" })}>
          New ticket
        </button>
        <button type="button" className="h-11 rounded-md border border-line text-sm font-semibold" onClick={() => onOpen({ kind: "task" })}>
          New task
        </button>
      </div>
    </div>
  );
}