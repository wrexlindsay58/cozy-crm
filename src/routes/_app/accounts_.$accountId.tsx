import { createFileRoute } from "@tanstack/react-router";
import { AccountWorkspace } from "@/features/account/workspace";
import { useAccount, useAccountPhotos } from "@/features/account/store";
import { scrollFileSection } from "@/features/record-shell/file-sections";
import { RecordShell } from "@/features/record-shell/record-shell";
import { useJobs } from "@/features/job/store";
import { useOps } from "@/features/ops/store";
import { accounts, byId, leads, money } from "@/lib/crm-data";
import { followersByPerson } from "@/lib/file-data";
import { placeLine } from "@/lib/place";

export const Route = createFileRoute("/_app/accounts_/$accountId")({ component: AccountPage });

function AccountPage() {
  const { accountId } = Route.useParams();
  const account = byId(accounts, accountId);
  const file = useAccount(accountId);
  const photos = useAccountPhotos(accountId);
  const { history, actions, appointments } = useOps();
  const jobs = Object.values(useJobs()).filter((j) => j.accountId === accountId);
  if (!account) return <main className="p-6 text-sm text-muted">Account not found.</main>;
  const lead = leads.find((l) => l.id === file.leadId) ?? leads.find((l) => l.name === account.name);
  const personId = lead?.id ?? file.leadId;
  const jobIds = new Set(jobs.map((j) => j.jobId));
  const mine = (actions ?? []).filter((a) => a.personId === personId || a.personId === account.id || jobIds.has(a.personId));
  return (
    <RecordShell
      kind="account"
      personId={personId}
      title={account.name}
      subtitle={lead ? placeLine(lead.address, lead.city, lead.office) : account.city}
      stage={account.type}
      moneyLabel={money(account.lifetime)}
      owner={{ name: account.owner, role: "Owner" }}
      followers={followersByPerson[personId] ?? followersByPerson[account.id] ?? []}
      related={jobs.map((j) => ({ label: j.window.split("·")[0]?.trim() || "Job", href: `/projects/${j.jobId}` }))}
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
        { label: "Book service", onClick: () => scrollFileSection("service") },
        { label: "New job", onClick: () => scrollFileSection("follow") },
        { label: "Review", onClick: () => scrollFileSection("reviews") },
        { label: "Create", menu: [{ label: "Ticket" }, { label: "Task" }, { label: "Request" }] },
      ]}
      history={[...(history?.[personId] ?? []), ...(history?.[accountId] ?? [])]}
      tickets={mine.filter((a) => a.kind === "ticket").map((a) => ({ id: a.id, title: a.title, related: a.personId, owner: a.owner, priority: a.priority ?? "Normal", status: a.status, age: a.age ?? "", description: a.description, due: a.due }))}
      photos={photos.length ? photos : file.photos}
    >
      <AccountWorkspace file={file} actions={mine} history={[...(history?.[personId] ?? []), ...(history?.[accountId] ?? [])]} photos={photos.length ? photos : file.photos} appointments={appointments ?? []} />
    </RecordShell>
  );
}
