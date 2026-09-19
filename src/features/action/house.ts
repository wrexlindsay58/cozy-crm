import { accounts, projects, type Lead } from "@/lib/crm-data";

export type HouseFile = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  pipeline: string;
  href: string;
  owner: string;
  lead?: Lead;
};

export function houseOf(personId: string, leads: Lead[]): HouseFile {
  const lead = leads.find((l) => l.id === personId);
  if (lead) {
    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      city: lead.city,
      pipeline: "Lead",
      href: `/leads/${lead.id}`,
      owner: lead.closer,
      lead,
    };
  }
  const job = projects.find((p) => p.id === personId);
  if (job) {
    const account = accounts.find((a) => a.id === job.accountId);
    return {
      id: job.id,
      name: job.name,
      city: account?.city ?? job.office,
      pipeline: "Job",
      href: `/projects/${job.id}`,
      owner: job.pm,
    };
  }
  const account = accounts.find((a) => a.id === personId);
  if (account) {
    return {
      id: account.id,
      name: account.name,
      city: account.city,
      pipeline: "Account",
      href: `/accounts/${account.id}`,
      owner: account.owner,
    };
  }
  return { id: personId, name: personId, pipeline: "File", href: "/tickets", owner: "" };
}
