import { Link } from "@tanstack/react-router";
import { spawnLead, type AccountFile } from "./store";
import { money } from "@/lib/crm-data";

export function JobLanes({ file, lane, onLane }: { file: AccountFile; lane: string; onLane: (id: string) => void }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Job history</h2>
      <div className="flex flex-wrap gap-1.5">
        {file.lanes.map((l) => (
          <button key={l.id} type="button" onClick={() => onLane(l.id)} className={lane === l.id ? "h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card" : "h-9 rounded-md border border-line px-3 text-sm font-semibold"}>{l.label}</button>
        ))}
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {(file.lanes.find((l) => l.id === lane) ?? file.lanes[0])?.history.map((h) => (
          <li key={`${h.at}-${h.what}`}><span className="text-muted">{h.at} · {h.who}</span> — {h.what}</li>
        ))}
      </ul>
    </section>
  );
}
export function MembershipCard({ file }: { file: AccountFile }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Membership</h2>
      {file.membership ? <p className="text-sm">{file.membership.plan} · {money(file.membership.amount)} {file.membership.cadence} · next {file.membership.next}</p> : <p className="text-sm text-muted">None</p>}
    </section>
  );
}
export function NewLeadCard({ file, open }: { file: AccountFile; open: boolean }) {
  if (!open) return null;
  return (
    <section className="rounded-md border border-navy bg-card p-4">
      <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">New lead from account</h2>
      <button type="button" onClick={() => spawnLead(file.accountId, "Attic")} className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">Open attic follow-up</button>
      {file.childLeads.map((c) => (
        <p key={c.id} className="mt-2 text-sm"><Link to="/leads/$leadId" params={{ leadId: c.id }} className="font-semibold text-navy">{c.name}</Link></p>
      ))}
    </section>
  );
}
