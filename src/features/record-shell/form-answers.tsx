import type { Lead } from "@/lib/crm-data";

export function FormAnswers({ lead }: { lead: Lead }) {
  const rows = lead.formAnswers ?? [];
  if (rows.length === 0) {
    return (
      <div className="p-3">
        <p className="text-sm text-muted">No landing form. Came in as {lead.source}.</p>
      </div>
    );
  }
  return (
    <div className="h-full overflow-auto p-3">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
        {lead.formName || "Landing form"} · {lead.source}
      </p>
      <dl className="mt-3 space-y-3">
        {rows.map((r) => (
          <div key={r.q} className="border-b border-line pb-3 last:border-0">
            <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">{r.q}</dt>
            <dd className="mt-1 text-sm">{r.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
