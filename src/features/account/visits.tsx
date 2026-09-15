import { useState } from "react";
import { defaultsFor, scheduleVisit, VISIT_KINDS, type AccountFile, type VisitKind } from "./store";
import { money } from "@/lib/crm-data";

export function VisitBoard({ file, open }: { file: AccountFile; open: boolean }) {
  const [kind, setKind] = useState<VisitKind>("Service");
  const d = defaultsFor(kind);
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Visits</h2>
      {open ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {VISIT_KINDS.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={kind === k ? "h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card" : "h-9 rounded-md border border-line px-3 text-sm font-semibold"}>{k}</button>
          ))}
          <button type="button" onClick={() => scheduleVisit({ accountId: file.accountId, kind, closer: file.owner, day: 18, hour: "10:00a", fee: d.fee, cost: d.cost })} className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">Book</button>
        </div>
      ) : null}
      <ul className="space-y-2 text-sm">
        {file.visits.map((v) => (
          <li key={v.id} className="flex justify-between"><span>{v.kind} · {v.day} · {v.who}</span><span className="text-muted">{money(v.fee)} · {v.status}</span></li>
        ))}
      </ul>
    </section>
  );
}
