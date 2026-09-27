import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { setWarranty, spawnLead, type AccountFile } from "./store";
import { money } from "@/lib/crm-data";
import { Bits } from "@/features/record-shell/file-sheet";
import { priceLabel, useMembershipFor } from "@/features/membership/store";

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
  const member = useMembershipFor(file.leadId);
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="type-section">Membership</h2>
      {member ? (
        <>
          <p className="type-meta mt-1">
            {member.planName} · {member.years} years · {member.status}
          </p>
          <Bits
            items={[
              { label: "Term price", value: priceLabel(member, money) },
              { label: "After the term", value: `${money(member.continueMonthly)}/mo` },
              { label: "Through", value: member.end },
            ]}
          />
          <Link to="/memberships/$membershipId" params={{ membershipId: member.id }} className="mt-3 inline-flex h-11 items-center text-sm font-semibold text-navy">
            Open the membership
          </Link>
        </>
      ) : (
        <p className="type-meta mt-1">No plan on this house. Use Plan in the header. It stays on this account.</p>
      )}
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
