import { createFileRoute } from "@tanstack/react-router";
import { assessmentForLead } from "@/features/assessment/store";
import { MembershipWorkspace } from "@/features/membership/workspace";
import { memberTone, priceLabel, useMembership } from "@/features/membership/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { useOps } from "@/features/ops/store";
import { accounts, money, opportunities, projects } from "@/lib/crm-data";
import { followersByPerson, photosByPerson } from "@/lib/file-data";
import { placeLine } from "@/lib/place";

export const Route = createFileRoute("/_app/memberships_/$membershipId")({ component: MembershipPage });

function MembershipPage() {
  const { membershipId } = Route.useParams();
  const file = useMembership(membershipId);
  const { leads, tickets, history } = useOps();
  if (!file) return <main className="p-6 text-sm text-muted">Membership not found.</main>;
  const lead = leads.find((l) => l.id === file.personId);
  const assess = assessmentForLead(file.personId);
  const opp = opportunities.find((o) => o.leadId === file.personId);
  const job = projects.find((p) => p.name.includes(file.name.split(" ")[0] ?? ""));
  const account = accounts.find((a) => a.name === file.name);
  return (
    <RecordShell
      kind="membership"
      personId={file.personId}
      title={file.name}
      subtitle={placeLine(file.address, file.city, file.office)}
      stage={file.status}
      stageTone={memberTone(file.status)}
      moneyLabel={priceLabel(file, money)}
      owner={{ name: file.owner, role: "Owner" }}
      followers={followersByPerson[file.personId] ?? []}
      related={
        [
          lead ? { label: "Lead", href: `/leads/${lead.id}` } : null,
          assess ? { label: "Assessment", href: `/assessments/${assess.id}` } : null,
          opp ? { label: "Opportunity", href: `/opportunities/${opp.id}` } : null,
          job ? { label: "Job", href: `/projects/${job.id}` } : null,
          account ? { label: "Account", href: `/accounts/${account.id}` } : null,
        ].filter(Boolean) as { label: string; href: string }[]
      }
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
      ]}
      history={history?.[file.personId] ?? []}
      tickets={(tickets ?? []).filter((t) => t.related === file.personId)}
      photos={photosByPerson[file.personId] ?? []}
    >
      <MembershipWorkspace file={file} lead={lead} />
    </RecordShell>
  );
}
