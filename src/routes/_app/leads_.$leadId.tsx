import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { assessmentForLead } from "@/features/assessment/store";
import { advanceToAssessment } from "@/features/flow/advance";
import { FlowRedirect } from "@/features/flow/redirect";
import { BookWidget } from "@/features/lead/book-widget";
import { LeadCard } from "@/features/lead/lead-card";
import { QualifyCard, qualifyFilled } from "@/features/lead/qualify-card";
import { StartMembership } from "@/features/membership/start-sheet";
import { useMembershipFor } from "@/features/membership/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { FileSections, scrollFileSection } from "@/features/record-shell/file-sections";
import { useAdminSettings } from "@/features/admin-settings/store";
import { useOps } from "@/features/ops/store";
import { placeLine } from "@/lib/place";
import { opportunities } from "@/lib/crm-data";
import { followersByPerson, photosByPerson } from "@/lib/file-data";

export const Route = createFileRoute("/_app/leads_/$leadId")({ component: LeadFile });

function LeadFile() {
  const { leadId } = Route.useParams();
  const { leads, tickets, history } = useOps();
  const lead = leads.find((l) => l.id === leadId);
  const navigate = useNavigate();
  const { qualify } = useAdminSettings();
  const assessment = assessmentForLead(leadId);
  const member = useMembershipFor(leadId);
  const [planOpen, setPlanOpen] = useState(false);
  if (!lead) return <main className="p-6 text-sm text-muted">Lead not found.</main>;
  const opp = opportunities.find((o) => o.leadId === lead.id);
  const second = lead.secondaryName ? lead.secondaryName : "";
  return (
    <>
    <FlowRedirect id={lead.id} here="lead" />
    <RecordShell
      kind="lead"
      personId={lead.id}
      title={lead.name}
      subtitle={placeLine(lead.address, lead.city, lead.office, second)}
      stage={lead.status}
      stageTone={lead.tone}
      owner={{ name: lead.closer, role: "Closer" }}
      followers={followersByPerson[lead.id] ?? [{ name: lead.setter, role: "Setter" }]}
      related={
        [
          assessment ? { label: `Assessment ${assessment.id}`, href: `/assessments/${assessment.id}` } : null,
          opp ? { label: `Opp ${opp.id}`, href: `/opportunities/${opp.id}` } : null,
          member ? { label: `${member.planName} · ${member.years} yr`, href: `/memberships/${member.id}` } : null,
        ].filter(Boolean) as { label: string; href: string }[]
      }
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
        { label: "Book", onClick: () => scrollFileSection("book") },
        { label: "Plan", onClick: () => setPlanOpen(true) },
        { label: "Create", menu: [{ label: "Ticket" }, { label: "Task" }, { label: "Request" }] },
      ]}
      history={history?.[lead.id] ?? []}
      tickets={(tickets ?? []).filter((t) => t.related === lead.id)}
      photos={photosByPerson[lead.id] ?? []}
    >
      <FileSections
        start="contact"
        advance={{
          pipeline: "Assessment",
          onContinue: () => {
            const next = advanceToAssessment(lead);
            void navigate({ to: "/assessments/$assessmentId", params: { assessmentId: next.id } });
          },
        }}
        sections={[
          { id: "contact", label: "Contact", done: Boolean(lead.name && lead.phone && lead.address), node: <LeadCard lead={lead} /> },
          { id: "qualify", label: "Qualified", done: qualifyFilled(qualify ?? [], lead.qualify ?? {}), node: <QualifyCard leadId={lead.id} /> },
          {
            id: "book",
            label: "Book",
            node: (
              <BookWidget
                leadId={lead.id}
                defaultCloser={lead.closer}
                defaultKind="Sales"
                pipeline="Lead"
                onRan={() => {
                  const next = advanceToAssessment(lead);
                  void navigate({ to: "/assessments/$assessmentId", params: { assessmentId: next.id } });
                }}
              />
            ),
          },
        ]}
      />
    </RecordShell>
    <StartMembership
      open={planOpen}
      onClose={() => setPlanOpen(false)}
      personId={lead.id}
      name={lead.name}
      address={lead.address}
      city={lead.city}
      office={lead.office}
      owner={lead.closer}
      from="lead"
    />
    </>
  );
}