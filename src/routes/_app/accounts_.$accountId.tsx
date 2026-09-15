import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AccountWorkspace } from "@/features/account/workspace";
import { useAccount, useAccountPhotos, type AccountFile } from "@/features/account/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { PriorStages } from "@/features/record-shell/prior-stages";
import { useOps } from "@/features/ops/store";
import { accounts, byId, money, projects } from "@/lib/crm-data";
import { followersByPerson } from "@/lib/file-data";

export const Route = createFileRoute("/_app/accounts_/$accountId")({ component: AccountPage });

function AccountPage() {
  const { accountId } = Route.useParams();
  const account = byId(accounts, accountId);
  const live = useAccount(accountId);
  const photos = useAccountPhotos(accountId);
  const { tickets, history } = useOps();
  const [bookOpen, setBookOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [lane, setLane] = useState("all");
  const file: AccountFile | undefined = live ?? (account ? { accountId, leadId: accountId, name: account.name, city: account.city, owner: account.owner, visits: [], membership: null, photos: [], lanes: [], childLeads: [] } : undefined);
  if (!account || !file) return <main className="p-6 text-sm text-muted">Account not found.</main>;
  const jobs = projects.filter((p) => p.accountId === accountId);
  return (
    <RecordShell kind="account" personId={account.id} title={account.name} subtitle={`${account.city} · ${account.owner}`} stage={account.type} moneyLabel={money(account.lifetime)} owner={{ name: account.owner, role: "Owner" }} followers={followersByPerson[account.id] ?? []} related={jobs.slice(0, 2).map((j) => ({ label: `Job ${j.id}`, href: `/projects/${j.id}` }))} acts={[{ label: "Call" }, { label: "Text", opens: "thread" }, { label: "Book service", onClick: () => setBookOpen(true) }, { label: "New lead", onClick: () => setLeadOpen(true) }]} history={history?.[accountId] ?? []} tickets={(tickets ?? []).filter((t) => t.related === account.id)} photos={photos.length ? photos : file.photos}>
      <AccountWorkspace file={file} bookOpen={bookOpen} leadOpen={leadOpen} lane={lane} onLane={setLane} />
      <PriorStages leadId={file.leadId} current="account" />
    </RecordShell>
  );
}
