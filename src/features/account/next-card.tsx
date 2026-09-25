import { useState } from "react";
import { setMembership, setWarranty, spawnLead, type AccountFile, type Membership } from "./store";
import { money } from "@/lib/crm-data";
import { Bits } from "@/features/record-shell/file-sheet";

const field = "h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

export function NextCard({ file }: { file: AccountFile }) {
  return (
    <div className="space-y-2">
      <WarrantyCard file={file} />
      <MembershipCard file={file} />
      <OpenCard file={file} />
    </div>
  );
}

function WarrantyCard({ file }: { file: AccountFile }) {
  const [edit, setEdit] = useState(false);
  const [start, setStart] = useState(file.warrantyStart);
  const [until, setUntil] = useState(file.warrantyUntil);
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="type-section">Warranty</h2>
          <p className="type-meta mt-1">Workmanship coverage on the finished jobs.</p>
        </div>
        <button type="button" onClick={() => setEdit((v) => !v)} className="text-[12px] font-semibold text-navy">
          {edit ? "Close" : "Edit"}
        </button>
      </div>
      {edit ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="Starts" className={field} />
          <input value={until} onChange={(e) => setUntil(e.target.value)} placeholder="Expires" className={field} />
          <button
            type="button"
            onClick={() => {
              setWarranty(file.accountId, start, until);
              setEdit(false);
            }}
            className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card"
          >
            Save
          </button>
        </div>
      ) : (
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Fact label="Starts" value={file.warrantyStart || "Not set"} />
          <Fact label="Expires" value={file.warrantyUntil || "Not set"} />
        </dl>
      )}
    </section>
  );
}

function MembershipCard({ file }: { file: AccountFile }) {
  const [edit, setEdit] = useState(false);
  const m = file.membership;
  const [draft, setDraft] = useState<Membership>(
    m ?? {
      plan: "Comfort",
      cadence: "Monthly",
      amount: 29,
      next: "",
      method: "Card",
      brand: "Visa",
      last4: "",
      exp: "",
      bank: "",
      routingLast4: "",
      payments: [],
    },
  );

  function save() {
    setMembership(file.accountId, { ...draft, amount: Number(draft.amount) || 0 });
    setEdit(false);
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="type-section">Membership</h2>
          <p className="type-meta mt-1">{m ? `${m.plan} · ${money(m.amount)} ${m.cadence}` : "No plan on this house."}</p>
        </div>
        <button type="button" onClick={() => setEdit((v) => !v)} className="text-[12px] font-semibold text-navy">
          {edit ? "Close" : m ? "Edit" : "Add"}
        </button>
      </div>
      {edit ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input value={draft.plan} onChange={(e) => setDraft({ ...draft, plan: e.target.value })} placeholder="Plan" className={field} />
          <input value={draft.cadence} onChange={(e) => setDraft({ ...draft, cadence: e.target.value })} placeholder="Monthly or yearly" className={field} />
          <input value={String(draft.amount)} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) || 0 })} placeholder="Amount" className={field} />
          <input value={draft.next} onChange={(e) => setDraft({ ...draft, next: e.target.value })} placeholder="Next charge" className={field} />
          <select value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value as Membership["method"] })} className={field}>
            <option>Card</option>
            <option>ACH</option>
          </select>
          {draft.method === "Card" ? (
            <>
              <input value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} placeholder="Visa" className={field} />
              <input value={draft.last4} onChange={(e) => setDraft({ ...draft, last4: e.target.value })} placeholder="Last 4" className={field} />
              <input value={draft.exp} onChange={(e) => setDraft({ ...draft, exp: e.target.value })} placeholder="Exp" className={field} />
            </>
          ) : (
            <>
              <input value={draft.bank} onChange={(e) => setDraft({ ...draft, bank: e.target.value })} placeholder="Bank" className={field} />
              <input value={draft.last4} onChange={(e) => setDraft({ ...draft, last4: e.target.value })} placeholder="Account last 4" className={field} />
              <input value={draft.routingLast4} onChange={(e) => setDraft({ ...draft, routingLast4: e.target.value })} placeholder="Routing last 4" className={field} />
            </>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <button type="button" onClick={save} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
              Save
            </button>
            {m ? (
              <button
                type="button"
                onClick={() => {
                  setMembership(file.accountId, null);
                  setEdit(false);
                }}
                className="h-10 rounded-md border border-line px-3 text-sm font-semibold"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ) : m ? (
        <>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Fact label="Next charge" value={m.next || "Not set"} />
            <Fact label="Method" value={m.method} />
            <Fact label="Account" value={m.method === "Card" ? `${m.brand || "Card"} ${m.last4}` : `${m.bank || "ACH"} ${m.last4}`} />
            <Fact label="Expires" value={m.exp} />
          </dl>
          <h3 className="mt-4 text-[13px] font-semibold">Payments</h3>
          {m.payments.length === 0 ? <p className="mt-1 text-sm text-muted">No charges yet.</p> : null}
          <ul className="mt-2 space-y-1.5">
            {m.payments.map((p) => (
              <li key={p.id}>
                <Bits items={[{ label: "When", value: p.at }, { label: "Method", value: p.method }, { label: "Amount", value: money(p.amount) }, { label: "Status", value: p.status }]} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function OpenCard({ file }: { file: AccountFile }) {
  const open = file.issues.filter((i) => i.status === "Open" || i.status === "Scheduled");
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="type-section">Still open</h2>
      <Bits
        items={[
          { label: "Reviews", value: String(file.reviews.filter((r) => r.status === "Left").length) },
          { label: "Referrals", value: String(file.referrals.length) },
        ]}
      />
      <ul className="mt-3 space-y-1.5 text-sm">
        {open.length === 0 ? <li className="text-muted">No open issues.</li> : null}
        {open.map((i) => (
          <li key={i.id}>
            <p className="type-value">{i.title}</p>
            <Bits items={[{ label: "Status", value: i.status }]} />
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => spawnLead(file.accountId, "Next project")} className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          New job
        </button>
        {file.childLeads.map((c) => (
          <a key={c.id} href={`/leads/${c.id}`} className="inline-flex h-9 items-center rounded-md border border-line px-3 text-sm font-semibold text-navy">
            New lead
          </a>
        ))}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="type-label">{label}</dt>
      <dd className="type-value mt-1">{value}</dd>
    </div>
  );
}
