import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { assessmentForLead, startAssessment } from "@/features/assessment/store";
import { BookWidget } from "@/features/lead/book-widget";
import { CreateChore } from "@/features/lead/create-chore";
import { DetailsForm } from "@/features/lead/details-form";
import { DispositionControl } from "@/features/lead/disposition";
import { RecordShell } from "@/features/record-shell/record-shell";
import { updateLead, useOps } from "@/features/ops/store";
import { money, opportunities } from "@/lib/crm-data";
import { followersByPerson, photosByPerson } from "@/lib/file-data";

export const Route = createFileRoute("/_app/leads_/$leadId")({ component: LeadFile });

function LeadFile() {
  const { leadId } = Route.useParams();
  const { leads, appointments, tickets, history } = useOps();
  const lead = leads.find((l) => l.id === leadId);
  const [bookOpen, setBookOpen] = useState(false);
  const [editDetails, setEditDetails] = useState(true);
  const [chore, setChore] = useState<"ticket" | "task" | null>(null);
  const navigate = useNavigate();
  const assessment = assessmentForLead(leadId);
  if (!lead) return <main className="p-6 text-sm text-muted">Lead not found.</main>;
  const opp = opportunities.find((o) => o.leadId === lead.id);
  const appt = appointments.find((a) => a.leadId === lead.id);
  return (
    <RecordShell kind="lead" personId={lead.id} title={lead.name} subtitle={`${lead.address} · ${lead.city}`} stage={lead.status} moneyLabel={money(lead.value)} owner={{ name: lead.closer, role: "Closer" }} followers={followersByPerson[lead.id] ?? [{ name: lead.setter, role: "Setter" }]} related={[assessment ? { label: `Assessment ${assessment.id}`, href: `/assessments/${assessment.id}` } : null, opp ? { label: `Opp ${opp.id}`, href: `/opportunities/${opp.id}` } : null].filter(Boolean) as { label: string; href: string }[]} acts={[{ label: "Call" }, { label: "Text", opens: "thread" }, { label: "Book", onClick: () => setBookOpen((v) => !v) }, { label: "Create", menu: [{ label: "Ticket", onClick: () => setChore("ticket") }, { label: "Task", onClick: () => setChore("task") }] }]} history={history?.[lead.id] ?? []} tickets={(tickets ?? []).filter((t) => t.related === lead.id)} photos={photosByPerson[lead.id] ?? []}>
      <div className="space-y-3">
        <section className="rounded-md border border-line bg-card p-4 md:hidden">
          <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => setEditDetails((v) => !v)}>{editDetails ? "Close" : "Edit details"}</button>
          {editDetails ? <div className="mt-3"><DetailsForm initial={lead} submitLabel="Save details" onSubmit={(d) => updateLead(lead.id, d)} /></div> : null}
        </section>
        <div className="hidden md:block"><DetailsForm initial={lead} submitLabel="Save details" onSubmit={(d) => updateLead(lead.id, d)} /></div>
        <BookWidget leadId={lead.id} defaultCloser={lead.closer} open={bookOpen} />
        <DispositionControl appointment={appt} onRan={() => { const next = startAssessment({ leadId: lead.id, name: lead.name, address: lead.address, closer: lead.closer }); navigate({ to: "/assessments/$assessmentId", params: { assessmentId: next.id } }); }} />
        <CreateChore personId={lead.id} owner={lead.closer} kind={chore} onDone={() => setChore(null)} />
      </div>
    </RecordShell>
  );
}
