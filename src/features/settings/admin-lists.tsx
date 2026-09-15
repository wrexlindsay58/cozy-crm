import { useState } from "react";
import { addRow, setSalesforce, toggleFlag, useAdminSettings } from "@/features/admin-settings/store";

type Bucket = Exclude<keyof ReturnType<typeof useAdminSettings>, "flags" | "salesforce">;

function AddRow({ bucket }: { bucket: Bucket }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  return (
    <form
      className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        addRow(bucket, name, note);
        setName("");
        setNote("");
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-11 rounded-md border border-line px-3 text-sm" />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="h-11 rounded-md border border-line px-3 text-sm" />
      <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">Add</button>
    </form>
  );
}

export function FlagList() {
  const { flags } = useAdminSettings();
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-card">
      {flags.map((f) => (
        <li key={f.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <span>{f.label}</span>
          <button type="button" onClick={() => toggleFlag(f.id)} className="h-10 rounded-md border border-line px-3 text-xs font-semibold">
            {f.on ? "On" : "Off"}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function NamedRows({ title, bucket }: { title: string; bucket: Bucket }) {
  const snap = useAdminSettings();
  const rows = snap[bucket];
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{title}</h2>
      <ul className="space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.id}>
            <b>{r.name}</b>
            <span className="text-muted"> · {r.note}</span>
          </li>
        ))}
      </ul>
      <AddRow bucket={bucket} />
    </section>
  );
}

export function SalesforceSkin() {
  const { salesforce } = useAdminSettings();
  const [org, setOrg] = useState(salesforce.org);
  return (
    <section className="max-w-lg rounded-md border border-line bg-card p-4">
      <p className="mb-2 text-sm text-muted">Skin only. No live Salesforce push.</p>
      <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Org id" className="h-11 w-full rounded-md border border-line px-3 text-sm" />
      <button
        type="button"
        className="mt-2 h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card"
        onClick={() => setSalesforce(org, true)}
      >
        {salesforce.on ? "Connected (demo)" : "Save org"}
      </button>
    </section>
  );
}
