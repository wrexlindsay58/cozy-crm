import type { ReactNode } from "react";
import { assessmentForLead } from "@/features/assessment/store";
import { useOps } from "@/features/ops/store";
import { opportunities, projects, type Lead } from "@/lib/crm-data";
import type { RecordKind } from "./types";

const ORDER: RecordKind[] = ["lead", "assessment", "opportunity", "job", "account"];

function Row({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div className="flex gap-3 py-1 text-sm">
      <dt className="w-28 shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{k}</dt>
      <dd className="min-w-0">{v}</dd>
    </div>
  );
}

function Block({
  title,
  href,
  children,
  open,
}: {
  title: string;
  href?: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="rounded-md border border-line bg-card">
      <summary className="cursor-pointer list-none px-4 py-3 text-[11px] font-bold tracking-wide text-muted uppercase marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        {href ? (
          <a href={href} className="ml-2 font-semibold tracking-normal text-navy normal-case" onClick={(e) => e.stopPropagation()}>
            Open
          </a>
        ) : null}
      </summary>
      <dl className="border-t border-line px-4 py-2">{children}</dl>
    </details>
  );
}

function leadBody(lead: Lead) {
  return (
    <>
      <Row k="Name" v={lead.name} />
      <Row k="Phone" v={lead.phone} />
      <Row k="Email" v={lead.email} />
      <Row k="Address" v={`${lead.address}, ${lead.city}`} />
      <Row k="Source" v={lead.source} />
      <Row k="Status" v={lead.status} />
      <Row k="Interests" v={lead.interests?.join(", ") || lead.product} />
      <Row k="Notes" v={lead.notes} />
    </>
  );
}

export function PriorStages({
  leadId,
  current,
}: {
  leadId: string;
  current: RecordKind;
}) {
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === leadId);
  const assess = assessmentForLead(leadId);
  const opp = opportunities.find((o) => o.leadId === leadId);
  const jobs = projects.filter((p) => p.name.split(" ")[0] && lead && p.name.toLowerCase().includes(lead.name.split(" ")[0].toLowerCase()));
  const here = ORDER.indexOf(current);
  const blocks: { key: RecordKind; node: ReactNode }[] = [];

  if (lead && here > ORDER.indexOf("lead")) {
    blocks.push({
      key: "lead",
      node: (
        <Block key="lead" title={`Lead ${lead.id}`} href={`/leads/${lead.id}`} open={current === "assessment"}>
          {leadBody(lead)}
        </Block>
      ),
    });
  }
  if (assess && here > ORDER.indexOf("assessment")) {
    const filled = assess.packets.filter((p) => Object.keys(p.fields).length);
    blocks.push({
      key: "assessment",
      node: (
        <Block key="as" title={`Assessment ${assess.id}`} href={`/assessments/${assess.id}`}>
          <Row k="Status" v={assess.status} />
          <Row k="Closer" v={assess.closer} />
          <Row k="Address" v={assess.address} />
          {filled.map((p) => (
            <Row key={p.id} k={p.id} v={Object.entries(p.fields).map(([k, v]) => `${k} ${v}`).join(" · ")} />
          ))}
        </Block>
      ),
    });
  }
  if (opp && here > ORDER.indexOf("opportunity")) {
    blocks.push({
      key: "opportunity",
      node: (
        <Block key="opp" title={`Opportunity ${opp.id}`} href={`/opportunities/${opp.id}`}>
          <Row k="Stage" v={opp.stage} />
          <Row k="Product" v={opp.product} />
          <Row k="Amount" v={opp.amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} />
          <Row k="Closer" v={opp.closer} />
        </Block>
      ),
    });
  }
  if (jobs.length && here > ORDER.indexOf("job")) {
    blocks.push({
      key: "job",
      node: (
        <Block key="job" title={jobs.length === 1 ? `Job ${jobs[0].id}` : "Jobs"}>
          {jobs.map((j) => (
            <Row key={j.id} k={j.id} v={`${j.product} · ${j.status} · ${j.install}`} />
          ))}
        </Block>
      ),
    });
  }

  if (!blocks.length) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Earlier on this house</h2>
      {blocks.map((b) => b.node)}
    </section>
  );
}
