import type { ShopAction } from "@/features/action/types";
import { canSeeCost } from "@/features/staff/store";
import { useMessages } from "@/features/thread/store";
import { money, type Activity, type Appointment } from "@/lib/crm-data";
import type { Photo } from "@/lib/file-data";
import type { JobFile } from "@/features/job/types";
import { Bits } from "@/features/record-shell/file-sheet";
import type { AccountFile } from "./store";

export function RecordsCard({
  file,
  jobs,
  actions,
  history,
  photos,
  appointments,
}: {
  file: AccountFile;
  jobs: JobFile[];
  actions: ShopAction[];
  history: Activity[];
  photos: Photo[];
  appointments: Appointment[];
}) {
  const costs = canSeeCost();
  const messages = useMessages().filter((m) => m.personId === file.leadId || m.personId === file.accountId);
  const notes = messages.filter((m) => m.channel === "note");
  const talk = messages.filter((m) => m.channel !== "note");
  const invoices = jobs.flatMap((j) =>
    j.invoices
      .filter((i) => costs || (i.party !== "pay" && i.kind !== "Commission" && i.kind !== "Piece"))
      .map((i) => ({ id: i.id, label: `${i.kind} invoice`, bits: [{ label: "Amount", value: money(i.amount) }, { label: "Status", value: i.status }] })),
  );
  const orders = jobs.flatMap((j) => j.workOrders.map((w) => ({ id: w.id, label: "Work order", bits: [{ label: "Crew", value: w.crew }, { label: "Status", value: w.status }] })));
  const events = [
    ...jobs.flatMap((j) => j.events.map((e) => ({ id: e.id, label: e.process || "Day", bits: [{ label: "Day", value: e.day }, { label: "Crew", value: e.crew }, { label: "Status", value: e.status }] }))),
    ...appointments.map((a) => ({ id: a.id, label: a.name, bits: [{ label: "When", value: `Sep ${a.day} ${a.time}` }, { label: "Kind", value: a.kind ?? a.status }] })),
    ...file.visits.map((v) => ({ id: v.id, label: v.kind, bits: [{ label: "Day", value: v.day }, { label: "Who", value: v.who }, { label: "Status", value: v.status }] })),
  ];

  return (
    <div className="space-y-2">
      <Group title="Invoices" empty="No invoices." rows={invoices} />
      <Group title="Work orders" empty="No work orders." rows={orders} />
      <Group title="Scheduled" empty="Nothing on the book." rows={events} />
      <Group title="Actions" empty="No tickets, tasks, or requests." rows={actions.map((t) => ({ id: t.id, label: t.title, bits: [{ label: "Kind", value: t.kind }, { label: "Status", value: t.status }, { label: "Due", value: t.due }] }))} />
      <Group title="Notes" empty="No notes." rows={notes.map((m) => ({ id: m.id, label: m.text, bits: [{ label: "By", value: m.by || "Note" }, { label: "When", value: m.at }] }))} />
      <Group title="Conversation" empty="No messages yet." rows={talk.map((m) => ({ id: m.id, label: m.text, bits: [{ label: "Channel", value: m.channel }, { label: "When", value: m.at }] }))} />
      <Group title="History" empty="No history." rows={history.map((h, i) => ({ id: `${h.at}-${i}`, label: h.what, bits: [{ label: "When", value: h.at }, { label: "Who", value: h.who }] }))} />
      <Group title="Files" empty="No media." rows={photos.map((p) => ({ id: p.id, label: p.caption || "File", bits: [{ label: "Kind", value: p.kind || "photo" }] }))} />
    </div>
  );
}

function Group({ title, empty, rows }: { title: string; empty: string; rows: { id: string; label: string; bits: { label: string; value?: string }[] }[] }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="type-section">{title}</h2>
      {rows.length === 0 ? <p className="mt-1 text-sm text-muted">{empty}</p> : null}
      <ul className="mt-3 space-y-4">
        {rows.map((r) => (
          <li key={r.id}>
            <p className="type-value">{r.label}</p>
            <Bits items={r.bits} />
          </li>
        ))}
      </ul>
    </section>
  );
}
