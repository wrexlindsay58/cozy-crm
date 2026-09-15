import type { Activity, Ticket } from "@/lib/crm-data";
import type { Photo } from "@/lib/file-data";

export function TicketRail({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="border-t border-line p-3">
      <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Tickets</h2>
      {tickets.length === 0 ? <p className="mt-2 text-sm text-muted">None on this file.</p> : null}
      <ul className="mt-2 space-y-2">
        {tickets.map((t) => (
          <li key={t.id} className="text-sm">
            <p className="font-semibold">{t.title}</p>
            <p className="text-[11px] text-muted">
              {t.owner} · {t.status} · {t.age}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PhotoRail({ photos }: { photos: Photo[] }) {
  return (
    <section className="border-t border-line p-3">
      <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Photos</h2>
      {photos.length === 0 ? <p className="mt-2 text-sm text-muted">No photos yet.</p> : null}
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {photos.map((p) => (
          <li key={p.id} className="rounded-md bg-page p-2">
            <div className="mb-1 h-14 rounded bg-line" />
            <p className="text-[11px] font-medium">{p.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HistoryList({ history, flush }: { history: Activity[]; flush?: boolean }) {
  const body = (
    <>
      {history.length === 0 ? <p className="text-sm text-muted">No history yet.</p> : null}
      <ol className="space-y-3">
        {history.map((a) => (
          <li key={`${a.at}-${a.what}`} className="border-l-2 border-line pl-3">
            <p className="text-[11px] font-semibold text-muted">
              {a.at} · {a.who}
            </p>
            <p className="text-sm">{a.what}</p>
          </li>
        ))}
      </ol>
    </>
  );
  if (flush) return body;
  return (
    <section className="mt-4 rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">History</h2>
      {body}
    </section>
  );
}
