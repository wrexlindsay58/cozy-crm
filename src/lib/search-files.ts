import { accounts, leads, opportunities, projects } from "@/lib/crm-data";

export type FileHit = { href: string; name: string; kind: string };

export function searchFiles(q: string): FileHit | null {
  const needle = q.trim().toLowerCase();
  if (!needle) return null;
  const lead = leads.find((l) =>
    [l.name, l.phone, l.address, l.city, l.id].join(" ").toLowerCase().includes(needle),
  );
  if (lead) return { href: `/leads/${lead.id}`, name: lead.name, kind: "lead" };
  const opp = opportunities.find((o) =>
    [o.name, o.id, o.product].join(" ").toLowerCase().includes(needle),
  );
  if (opp) return { href: `/opportunities/${opp.id}`, name: opp.name, kind: "opportunity" };
  const job = projects.find((p) =>
    [p.name, p.id, p.product].join(" ").toLowerCase().includes(needle),
  );
  if (job) return { href: `/projects/${job.id}`, name: job.name, kind: "job" };
  const account = accounts.find((a) =>
    [a.name, a.id, a.city].join(" ").toLowerCase().includes(needle),
  );
  if (account) return { href: `/accounts/${account.id}`, name: account.name, kind: "account" };
  return null;
}
