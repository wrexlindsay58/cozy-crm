import { useState } from "react";
import { addIssue, defaultsFor, scheduleVisit, setIssueStatus, VISIT_KINDS, type AccountFile, type IssueStatus, type VisitKind } from "./store";
import { Bits } from "@/features/record-shell/file-sheet";

const ISSUE_NEXT: IssueStatus[] = ["Open", "Scheduled", "Resolved", "New job"];

export function ServiceCard({ file }: { file: AccountFile }) {
  const [kind, setKind] = useState<VisitKind>("Service");
  const [why, setWhy] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const d = defaultsFor(kind);

  return (
    <div className="space-y-2">
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="type-section">Service and QC</h2>
        <p className="type-meta mt-1">Book a visit on this house. The reason stays with the visit.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {VISIT_KINDS.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={kind === k ? "h-8 rounded-md bg-navy px-2.5 text-[12px] font-semibold text-card" : "h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold"}>
              {k}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why we are going" className="h-10 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
          <button
            type="button"
            onClick={() => {
              scheduleVisit({ accountId: file.accountId, kind, closer: file.owner, day: 24, hour: "9:00a", fee: d.fee, cost: d.cost, why });
              setWhy("");
            }}
            className="h-10 shrink-0 rounded-md bg-navy px-3 text-sm font-semibold text-card"
          >
            Book
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {file.visits.length === 0 ? <li className="text-sm text-muted">No visits yet.</li> : null}
          {file.visits.map((v) => (
            <li key={v.id}>
              <p className="type-value">{v.kind}</p>
              <Bits items={[{ label: "Day", value: v.day }, { label: "Who", value: v.who }, { label: "Status", value: v.status }, { label: "Why", value: v.why }]} />
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="type-section">Issues</h2>
        <p className="type-meta mt-1">An issue opens a ticket. Finish it from Actions.</p>
        <div className="mt-3 flex flex-col gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is wrong" className="h-10 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
          <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Where, and what they said" className="h-10 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
          <button
            type="button"
            onClick={() => {
              addIssue(file.accountId, title, detail);
              setTitle("");
              setDetail("");
            }}
            className="h-10 self-start rounded-md bg-navy px-3 text-sm font-semibold text-card"
          >
            Add issue
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {file.issues.length === 0 ? <li className="text-sm text-muted">No open issues.</li> : null}
          {file.issues.map((issue) => (
            <li key={issue.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                <span className="font-semibold">{issue.title}</span>
                {issue.detail ? <span className="block text-[12px] text-muted">{issue.detail}</span> : null}
              </span>
              <select
                value={issue.status}
                onChange={(e) => setIssueStatus(file.accountId, issue.id, e.target.value as IssueStatus)}
                className="h-8 rounded-md border border-line bg-card px-2 text-[12px]"
              >
                {ISSUE_NEXT.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
