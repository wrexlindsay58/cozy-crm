import { leads, history, emit, write_leads, write_history } from "./part-01";

export function applyRemoteLeadDelete(id: string) {
  if (!leads.some((lead) => lead.id === id)) return;
  write_leads(leads.filter((lead) => lead.id !== id));
  emit();
}

export function applyRemoteLeadPatch(id: string, patch: Record<string, unknown>) {
  if (!leads.some((lead) => lead.id === id)) return;
  write_leads(leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)));
  emit();
}

export function dropLatestHistory(personId: string, what: string) {
  const rows = history[personId] ?? [];
  const index = rows.findIndex((row) => row.what === what);
  if (index < 0) return;
  write_history({ ...history, [personId]: rows.filter((_, i) => i !== index) });
  emit();
}
