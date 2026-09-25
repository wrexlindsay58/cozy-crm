import { useEffect, useState } from "react";
import { acceptJob, answerAcceptNote, flagLine, requestSurvey, resolveDiscrepancy, reviewLine, setAcceptNote, signCo, syncAcceptance, type JobFile } from "./store";
import { money, opportunities } from "@/lib/crm-data";
import { useProposals } from "@/features/opportunity/store";
import { acceptReady, isAccepted, type ScopeLine } from "./types";
import { JobCard } from "./job-card";
import { cn } from "@/lib/cn";

const GROUP: { kind: ScopeLine["kind"]; label: string }[] = [
  { kind: "product", label: "Scope" },
  { kind: "adder", label: "Adders" },
  { kind: "discount", label: "Discounts" },
  { kind: "promise", label: "Promises" },
];

export function SoldChapter({ job }: { job: JobFile }) {
  const proposal = useProposals()[opportunities.find((o) => o.leadId === job.leadId)?.id ?? ""];
  const sold = proposal?.options.find((o) => o.id === proposal.accepted);
  const rebateLines = (sold?.lines ?? []).filter((l) => l.on !== false && l.rebate);
  const file = job.acceptance;
  const accepted = isAccepted(job);
  const rows = [
    ...job.scope.map((s) => s.id),
    ...rebateLines.map((l) => `RB-${l.sku}`),
    ...(job.rebate.amount ? ["RB-job"] : []),
  ];
  useEffect(() => {
    syncAcceptance(job.jobId, rows);
  }, [job.jobId, rows.join("|")]);

  const status = accepted ? `Accepted by ${file?.by} · ${file?.at}` : file?.surveyAsked ? "Waiting on a site survey" : "Waiting on the office";

  return (
    <div className="space-y-2">
      <JobCard kicker="Acceptance" title={status} done={accepted} aside={<span className="text-lg font-extrabold tabular-nums tracking-tight text-navy md:text-xl">{money(job.sold)}</span>}>
        <p className="text-sm text-muted">The signed deal. Nothing here is rewritten. A problem is a discrepancy, or a question back to the rep.</p>
        {GROUP.map((group) => {
          const lines = job.scope.filter((s) => s.kind === group.kind);
          return (
            <section key={group.kind} className="mt-4">
              <h3 className="text-[15px] font-semibold">{group.label}</h3>
              {lines.length === 0 ? <p className="type-meta mt-1">None on this job.</p> : (
                <ul className="mt-1 divide-y divide-line">
                  {lines.map((line) => <DealLine key={line.id} job={job} line={line} />)}
                </ul>
              )}
            </section>
          );
        })}
        <section className="mt-4">
          <h3 className="text-[15px] font-semibold">Rebates</h3>
          {rebateLines.length === 0 && !job.rebate.amount ? <p className="type-meta mt-1">None on this job.</p> : (
            <ul className="mt-1 divide-y divide-line">
              {rebateLines.map((line) => (
                <DealLine
                  key={line.sku}
                  job={job}
                  line={{ id: `RB-${line.sku}`, label: line.label, kind: "discount", amount: line.unit * line.qty, qty: line.qty, notes: line.rebateWhen === "pos" ? "Point of sale. Comes off what the customer pays." : "After sale. Does not come off what the customer pays." }}
                />
              ))}
              {job.rebate.amount ? (
                <DealLine
                  job={job}
                  line={{ id: "RB-job", label: `${job.rebate.utility} ${job.rebate.program}`.trim(), kind: "discount", amount: job.rebate.amount, qty: 1, notes: `${job.rebate.status}. After sale. Does not come off what the customer pays.` }}
                />
              ) : null}
            </ul>
          )}
        </section>
      </JobCard>

      <JobCard kicker="Rep notes" title={file?.notes.length ? `${file.notes.length} on the file` : "No rep notes"}>
        {file?.notes.length ? (
          <ul className="divide-y divide-line">
            {file.notes.map((note) => <NoteLine key={note.id} jobId={job.jobId} note={note} locked={accepted} />)}
          </ul>
        ) : <p className="text-sm">No rep notes.</p>}
      </JobCard>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={accepted || file?.surveyAsked} onClick={() => requestSurvey(job.jobId)} className="h-10 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
          {file?.surveyAsked ? "Survey requested" : "Request a site survey"}
        </button>
        {accepted ? (
          <p className="text-sm font-semibold text-navy">Accepted by {file?.by}</p>
        ) : (
          <button type="button" disabled={!acceptReady(job)} onClick={() => acceptJob(job.jobId)} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40">
            Accept
          </button>
        )}
      </div>
    </div>
  );
}

function DealLine({ job, line }: { job: JobFile; line: Pick<ScopeLine, "id" | "label" | "kind" | "amount" | "qty" | "notes"> }) {
  const file = job.acceptance;
  const locked = isAccepted(job);
  const reviewed = file?.reviewed.includes(line.id);
  const disc = file?.discrepancies.find((d) => d.lineId === line.id);
  const [open, setOpen] = useState(false);
  const [what, setWhat] = useState("");
  const [how, setHow] = useState<"clarified" | "as-is" | "co">("clarified");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const co = job.changeOrders.find((c) => c.id === disc?.coId);
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{line.label}</p>
          <p className="type-meta mt-0.5">{line.qty ? `Qty ${line.qty}` : "No quantity"}{line.notes ? ` · ${line.notes}` : ""}</p>
          {line.kind === "promise" && !line.amount ? <p className="mt-1 text-sm font-semibold text-alert">Unpriced promise. This hits commission.</p> : null}
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums">{line.amount ? money(line.amount) : "—"}</p>
      </div>
      {reviewed && !disc ? <p className="type-meta mt-2">Reviewed</p> : null}
      {disc ? (
        <div className="mt-2 rounded-md border border-line px-3 py-2">
          <p className="text-sm">{disc.what}</p>
          {disc.how === "open" && !locked ? (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {(["clarified", "as-is", "co"] as const).map((id) => (
                  <button key={id} type="button" onClick={() => setHow(id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", how === id ? "bg-navy text-card" : "border border-line")}>
                    {id === "clarified" ? "Rep clarified" : id === "as-is" ? "Keep it" : "Change order"}
                  </button>
                ))}
              </div>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={how === "co" ? "What changes" : how === "as-is" ? "Why we are keeping it" : "What the rep said"} className="h-10 w-full rounded-md border border-line px-3 text-sm" />
              {how === "co" ? <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Amount" className="h-10 w-32 rounded-md border border-line px-3 text-sm" /> : null}
              <button type="button" onClick={() => resolveDiscrepancy(job.jobId, disc.id, how, note, Number(amount) || 0)} className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">Save</button>
            </div>
          ) : (
            <p className="type-meta mt-1">
              {disc.how === "clarified" ? "Clarified" : disc.how === "as-is" ? "Kept" : co?.signed ? "Change order signed" : "Change order waiting on a signature"}
              {disc.note ? ` · ${disc.note}` : ""}
            </p>
          )}
          {disc.how === "co" && co && !co.signed && !locked ? (
            <button type="button" onClick={() => signCo(job.jobId, co.id)} className="mt-2 h-9 rounded-md border border-line px-3 text-sm font-semibold">Customer signed</button>
          ) : null}
        </div>
      ) : null}
      {!locked && !reviewed && !disc ? (
        open ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="What is wrong" className="h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm" />
            <button type="button" onClick={() => { flagLine(job.jobId, line.id, what); setOpen(false); }} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">Add</button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => reviewLine(job.jobId, line.id)} className="h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold">Looks right</button>
            <button type="button" onClick={() => setOpen(true)} className="h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold">Something's off</button>
          </div>
        )
      ) : null}
    </li>
  );
}

function NoteLine({ jobId, note, locked }: { jobId: string; note: { id: string; text: string; state: "open" | "clear" | "asked"; question?: string; answer?: string }; locked: boolean }) {
  const [ask, setAsk] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  return (
    <li className="py-3">
      <p className="text-sm">{note.text}</p>
      {note.state === "clear" ? <p className="type-meta mt-1">Clear</p> : null}
      {note.state === "asked" ? (
        <div className="mt-1">
          <p className="text-sm">Question · {note.question}</p>
          {note.answer ? <p className="type-meta mt-1">Answer · {note.answer}</p> : locked ? null : (
            <div className="mt-2 flex gap-2">
              <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="What the rep said" className="h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm" />
              <button type="button" onClick={() => answerAcceptNote(jobId, note.id, answer)} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">Save</button>
            </div>
          )}
        </div>
      ) : null}
      {!locked && note.state === "open" ? (
        ask ? (
          <div className="mt-2 flex gap-2">
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What needs to be clear" className="h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm" />
            <button type="button" onClick={() => setAcceptNote(jobId, note.id, { state: "asked", question })} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">Ask</button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setAcceptNote(jobId, note.id, { state: "clear" })} className="h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold">Clear</button>
            <button type="button" onClick={() => setAsk(true)} className="h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold">Ask the rep</button>
          </div>
        )
      ) : null}
    </li>
  );
}
