import { accounts, leads, opportunities, projects, tickets } from "@/lib/crm-data";
import type { Lead } from "@/lib/crm-data";

export type FileHit = { href: string; name: string; kind: string; detail: string };

function hay(parts: (string | number | undefined)[]) {
  return parts.join(" ").toLowerCase();
}

export function searchFiles(q: string, liveLeads: Lead[] = leads): FileHit[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const hits: FileHit[] = [];
  for (const l of liveLeads) {
    if (hay([l.name, l.phone, l.email, l.address, l.city, l.id, l.setter, l.closer]).includes(needle)) {
      hits.push({ href: `/leads/${l.id}`, name: l.name, kind: "Lead", detail: `${l.phone} · ${l.city}` });
    }
  }
  for (const o of opportunities) {
    if (hay([o.name, o.id, o.product, o.closer]).includes(needle)) {
      hits.push({ href: `/opportunities/${o.id}`, name: o.name, kind: "Opportunity", detail: o.product });
    }
  }
  for (const p of projects) {
    if (hay([p.name, p.id, p.product, p.pm]).includes(needle)) {
      hits.push({ href: `/projects/${p.id}`, name: p.name, kind: "Job", detail: p.status });
    }
  }
  for (const a of accounts) {
    if (hay([a.name, a.id, a.city, a.owner]).includes(needle)) {
      hits.push({ href: `/accounts/${a.id}`, name: a.name, kind: "Account", detail: a.city });
    }
  }
  for (const t of tickets) {
    if (hay([t.title, t.id, t.related, t.owner]).includes(needle)) {
      hits.push({ href: t.related.startsWith("L-") ? `/leads/${t.related}` : t.related.startsWith("P-") ? `/projects/${t.related}` : `/tickets`, name: t.title, kind: "Ticket", detail: t.related });
    }
  }
  return hits.slice(0, 12);
}
