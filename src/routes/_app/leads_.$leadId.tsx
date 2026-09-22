import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { assessmentForLead, startAssessment } from "@/features/assessment/store";
import { BookWidget } from "@/features/lead/book-widget";
import { LeadCard } from "@/features/lead/lead-card";
import { QualifyCard } from "@/features/lead/qualify-card";
import { RecordShell } from "@/features/record-shell/record-shell";
import { FileSections, scrollFileSection } from "@/features/record-shell/file-sections";
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
  const assessment = assessmentForLead(leadId);
  if (!lead) return <main className="p-6 text-sm text-muted">Lead not found.</main>;
  const opp = opportunities.find((o) => o.leadId === lead.id);
  const second = lead.secondaryName ? lead.secondaryName : "";
  return (
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
        ].filter(Boolean) as { label: string; href: string }[]
      }
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
        { label: "Book", onClick: () => scrollFileSection("book") },
        { label: "Create", menu: [{ label: "Ticket" }, { label: "Task" }, { label: "Request" }] },
      ]}
      history={history?.[lead.id] ?? []}
      tickets={(tickets ?? []).filter((t) => t.related === lead.id)}
      photos={photosByPerson[lead.id] ?? []}
    >
      <FileSections
        start="contact"
        sections={[
          { id: "contact", label: "Contact", node: <LeadCard lead={lead} /> },
          { id: "qualify", label: "Qualified", node: <QualifyCard leadId={lead.id} /> },
          {
            id: "book",
            label: "Book",
            node: (
              <BookWidget
                leadId={lead.id}
                defaultCloser={lead.closer}
                defaultKind="Sales"
                onRan={() => {
                  const next = startAssessment({
                    leadId: lead.id,
                    name: lead.name,
                    address: lead.address,
                    closer: lead.closer,
                    property: {
                      yearBuilt: lead.yearBuilt ?? "",
                      sqft: lead.sqft ?? "",
                      stories: lead.stories ?? "",
                      hoa: lead.hoa === "Yes" ? "Yes" : lead.hoa ?? "",
                      access: lead.access ?? "",
                      utility: lead.utility ?? "",
                      bothHome: lead.bothHome ? "Yes" : "",
                    },
                  });
                  void navigate({ to: "/assessments/$assessmentId", params: { assessmentId: next.id } });
                }}
              />
            ),
          },
        ]}
      />
    </RecordShell>
  );
}