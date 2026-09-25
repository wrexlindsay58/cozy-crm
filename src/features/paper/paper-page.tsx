import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CircleAlert, ClipboardList, FileDiff, FileSignature, Library, Mail, Receipt, ScrollText, ShoppingCart, UserRound, type LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/ui-bits";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { useOps } from "@/features/ops/store";
import { useProposals } from "@/features/opportunity/store";
import { canSeeCost, useStaff } from "@/features/staff/store";
import { issueWo, receiveGoodLeapPay, receivePoAmount, recordPayment, sendPo, setInvoiceStatus, signCo, signWo, useJobs } from "@/features/job/store";
import { sendMessage } from "@/features/thread/store";
import { blockedJobs, buildPaper, byQueue, jobReady, uncollected, type PaperKind, type PaperRow, type PaperStack } from "./model";

const KIND_META: { id: PaperKind | "all"; label: string; short: string; icon: LucideIcon }[] = [
  { id: "all", label: "All", short: "All", icon: ScrollText },
  { id: "agreement", label: "Agreements", short: "Agrmts", icon: FileSignature },
  { id: "change", label: "Change orders", short: "COs", icon: FileDiff },
  { id: "work", label: "Work orders", short: "WOs", icon: ClipboardList },
  { id: "purchase", label: "Purchases", short: "POs", icon: ShoppingCart },
  { id: "invoice", label: "Invoices", short: "Inv", icon: Receipt },
];

const STACKS: { id: PaperStack; label: string }[] = [
  { id: "collect", label: "Collect" },
  { id: "truck", label: "Clear the truck" },
  { id: "waiting", label: "Waiting" },
  { id: "send", label: "Send" },
];

const SECTIONS: { kind: PaperKind; label: string; empty: string }[] = [
  { kind: "agreement", label: "Agreement", empty: "No agreement on this job." },
  { kind: "change", label: "Change orders", empty: "None." },
  { kind: "work", label: "Work orders", empty: "No crew on this job yet." },
  { kind: "purchase", label: "Purchases", empty: "None yet." },
  { kind: "invoice", label: "Invoices", empty: "No invoice yet." },
];

const METHODS = ["Cash", "Check", "Card", "ACH", "Financing"];

function htmlOf(fileUrl?: string) {
  if (!fileUrl?.startsWith("data:")) return "";
  try {
    return decodeURIComponent(fileUrl.slice(fileUrl.indexOf(",") + 1));
  } catch {
    return "";
  }
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function FitRow({ signature, labeled }: { signature: string; labeled: (compact: boolean) => ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useLayoutEffect(() => {
    const hostEl = host.current;
    const probeEl = probe.current;
    if (!hostEl || !probeEl) return;
    const check = () => setCompact(probeEl.scrollWidth > hostEl.clientWidth + 1);
    check();
    const watch = new ResizeObserver(check);
    watch.observe(hostEl);
    return () => watch.disconnect();
  }, [signature, compact]);
  return (
    <div ref={host} className="relative mt-2 min-w-0">
      <div className="pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden" aria-hidden>
        <div ref={probe} className="w-max">
          {labeled(false)}
        </div>
      </div>
      {labeled(compact)}
    </div>
  );
}

function runImmediate(row: PaperRow, who: string) {
  const act = row.run;
  if (!act) return;
  if (act.type === "sign-wo") signWo(act.jobId, act.woId, who);
  else if (act.type === "send-po") sendPo(act.jobId, act.poId);
  else if (act.type === "send-invoice") setInvoiceStatus(act.jobId, act.invoiceId, "Sent");
  else if (act.type === "sign-co") signCo(act.jobId, act.coId);
  else if (act.type === "issue-wo") issueWo(act.jobId);
  else if (act.type === "fund") receiveGoodLeapPay(act.jobId);
  else if (act.type === "pay") recordPayment(act.jobId, act.invoiceId, row.amount ?? 0, "Card", "Now");
  else if (act.type === "receive-po") receivePoAmount(act.jobId, act.poId, row.amount ?? 0, who);
}

export function PaperPage({ initialKind, initialJob }: { initialKind?: PaperKind; initialJob?: string }) {
  const jobs = useJobs();
  const proposals = useProposals();
  const { leads } = useOps();
  const { viewAs, people } = useStaff();
  const seeCost = canSeeCost(viewAs);
  const actor = people.find((p) => p.role === viewAs)?.name ?? "Wrex Lindsay";
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<PaperKind | "all">(initialKind ?? "all");
  const [view, setView] = useState<"queue" | "all">(initialKind ? "all" : "queue");
  const [mine, setMine] = useState(false);
  const [composer, setComposer] = useState<string | null>(null);
  const rows = useMemo(() => buildPaper(Object.values(jobs), Object.values(proposals), leads, seeCost), [jobs, proposals, leads, seeCost]);
  const morning = rows.filter((r) => r.stack);
  const needle = query.trim().toLowerCase();
  function matches(row: PaperRow) {
    if (kind !== "all" && row.kind !== kind) return false;
    if (kind === "invoice" && (row.lender || row.mismatch)) return false;
    if (mine && !owned(row, viewAs, people)) return false;
    if (!needle) return true;
    return [row.customer, row.title, row.detail, row.number, row.status, row.owner].join(" ").toLowerCase().includes(needle);
  }
  const visible = (view === "queue" ? morning : rows).filter(matches).slice().sort(view === "queue" ? byQueue : (a, b) => a.customer.localeCompare(b.customer));
  const batches = ["send-invoice", "send-po"]
    .map((key) => morning.filter((r) => r.batch === key && matches(r)))
    .filter((group) => group.length >= 2);
  const firstJob = visible[0]?.jobId ?? morning[0]?.jobId ?? rows[0]?.jobId ?? "";
  const [jobId, setJobId] = useState(initialJob || "");
  const [focus, setFocus] = useState<string | null>(null);
  const [mobilePacket, setMobilePacket] = useState(Boolean(initialJob));
  const selected = jobId && rows.some((r) => r.jobId === jobId) ? jobId : firstJob;
  const job = jobs[selected];
  const packet = rows.filter((r) => r.jobId === selected).sort((a, b) => a.rank - b.rank || a.number.localeCompare(b.number));
  const focused = packet.find((r) => r.id === focus) ?? packet.find((r) => r.stack) ?? packet[0];
  const preview = focused?.kind === "agreement" ? htmlOf(focused.fileUrl) : "";
  const ready = job ? jobReady(job, Object.values(proposals)) : null;
  const composing = packet.find((r) => r.id === composer) ?? null;

  function advance(row: PaperRow) {
    const list = visible.filter((r) => r.stack);
    const index = list.findIndex((r) => r.id === row.id);
    const next = list[index + 1] ?? list[index - 1];
    if (next && next.id !== row.id) {
      setJobId(next.jobId);
      setFocus(next.id);
    }
    setComposer(null);
  }

  function act(row: PaperRow) {
    setJobId(row.jobId);
    setFocus(row.id);
    setMobilePacket(true);
    if (row.run?.type === "pay" || row.run?.type === "receive-po") {
      setComposer(row.id);
      return;
    }
    runImmediate(row, actor);
    advance(row);
  }

  function sendBatch(group: PaperRow[]) {
    const next = visible.find((r) => r.stack && !group.some((g) => g.id === r.id));
    group.forEach((row) => runImmediate(row, actor));
    setComposer(null);
    if (next) {
      setJobId(next.jobId);
      setFocus(next.id);
    }
  }

  return (
    <main className="flex h-full min-h-0 w-full min-w-0 flex-col bg-page lg:flex-row">
      <section className={cn("min-h-0 w-full min-w-0 flex-col border-line bg-card lg:flex lg:w-[32rem] lg:shrink-0 lg:border-r xl:w-[34rem]", mobilePacket ? "max-lg:hidden" : "flex")}>
        <header className="shrink-0 border-b border-line bg-card px-4 py-3">
          <h1 className="type-section">Paper</h1>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-sm font-semibold tabular-nums">{money(uncollected(morning))} to collect</span>
            <span className="text-sm font-semibold tabular-nums">{blockedJobs(morning) === 1 ? "1 install blocked" : `${blockedJobs(morning)} installs blocked`}</span>
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Customer, vendor, crew, number"
            className="mt-3 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
          />
          <FitRow
            signature="views"
            labeled={(compact) => (
              <div className={cn("inline-flex h-9 divide-x divide-line overflow-hidden rounded-md border border-line", compact && "flex")}>
                {([["queue", "Stuck", CircleAlert], ["all", "Register", Library], ["mine", "Mine", UserRound]] as const).map(([id, label, Icon]) => {
                  const on = id === "mine" ? mine : view === id && !mine;
                  const button = (
                    <button
                      type="button"
                      aria-label={label}
                      onClick={() => {
                        if (id === "mine") {
                          setMine(true);
                          setView("queue");
                        } else {
                          setMine(false);
                          setView(id);
                        }
                      }}
                      className={cn("inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold", compact && "w-9 justify-center px-0", on ? "bg-navy text-card" : "bg-card text-muted")}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      {compact ? null : label}
                    </button>
                  );
                  return compact ? (
                    <Tip key={id} label={label} on>
                      {button}
                    </Tip>
                  ) : (
                    <span key={id}>{button}</span>
                  );
                })}
              </div>
            )}
          />
          <FitRow
            signature={`${view}-${mine}-${kind}-${rows.length}`}
            labeled={(compact) => (
              <div className="flex w-max items-center gap-1">
                {KIND_META.map((item) => {
                  const on = kind === item.id;
                  const pool = (view === "queue" ? morning : rows).filter((r) => !mine || owned(r, viewAs, people));
                  const count = item.id === "all" ? pool.length : pool.filter((r) => r.kind === item.id && !r.lender && !r.mismatch).length;
                  if (item.id !== "all" && count === 0) return null;
                  const label = item.short;
                  const Icon = item.icon;
                  const tip = item.id === "all" || !count ? item.label : `${item.label} ${count}`;
                  const button = (
                    <button
                      type="button"
                      aria-label={tip}
                      onClick={() => setKind(item.id)}
                      className={cn("inline-flex h-8 shrink-0 items-center gap-1 rounded-md text-[13px] font-semibold", compact ? "px-1.5" : "px-2", on ? "bg-navy text-card" : "text-muted")}
                    >
                      <Icon className={cn("size-3.5 shrink-0", on ? "text-card" : "text-navy")} />
                      {item.id === "all" ? null : <span className={cn("tabular-nums", on ? "text-card" : "text-navy")}>{count}</span>}
                      {compact ? null : label}
                    </button>
                  );
                  return compact ? (
                    <Tip key={item.id} label={tip} on>
                      {button}
                    </Tip>
                  ) : (
                    <span key={item.id} className="inline-flex">{button}</span>
                  );
                })}
              </div>
            )}
          />
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-card">
          {view === "queue" && batches.length ? (
            <div className="flex flex-col gap-2 border-b border-line px-4 py-3">
              {batches.map((group) => (
                <button key={group[0].batch} type="button" onClick={() => sendBatch(group)} className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">
                  {group[0].batch === "send-po" ? `Send ${group.length} purchases` : `Send ${group.length} invoices`}
                </button>
              ))}
            </div>
          ) : null}
          {visible.length === 0 ? <p className="type-meta px-4 py-6">{view === "queue" ? "Nothing to chase." : "Nothing in this filter."}</p> : null}
          {view === "queue" ? (
            STACKS.map((stack) => {
              const list = visible.filter((r) => r.stack === stack.id);
              if (!list.length) return null;
              return (
                <section key={stack.id}>
                  <h2 className="type-label px-4 pt-3">{stack.label}</h2>
                  <ul>
                    {list.map((row) => (
                      <li key={row.id}>
                        <QueueRow row={row} active={row.id === focused?.id} onOpen={() => { setComposer(null); setJobId(row.jobId); setFocus(row.id); setMobilePacket(true); }} onAct={() => act(row)} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          ) : (
            <ul>
              {visible.map((row) => (
                <li key={row.id}>
                  <QueueRow row={row} active={row.id === focused?.id} onOpen={() => { setComposer(null); setJobId(row.jobId); setFocus(row.id); setMobilePacket(true); }} onAct={() => act(row)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className={cn("min-h-0 min-w-0 flex-1 flex-col bg-page lg:flex", mobilePacket ? "flex" : "max-lg:hidden")}>
        {job && ready ? (
          <>
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-card px-4 py-3">
              <div className="min-w-0">
                <button type="button" className="mb-1 text-sm font-semibold text-navy lg:hidden" onClick={() => setMobilePacket(false)}>
                  Back to paper
                </button>
                <h2 className="type-section truncate">{packet[0]?.customer || job.name}</h2>
                <p className="type-meta mt-1">{job.product}</p>
              </div>
              <Link to="/projects/$projectId" params={{ projectId: job.jobId }} className="shrink-0 text-sm font-semibold text-navy">
                Open job
              </Link>
            </header>
            <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto bg-page">
              <div className="flex w-full min-w-0 flex-col gap-3 p-4">
                <div className="grid w-full grid-cols-2 overflow-hidden rounded-md border border-line bg-card sm:grid-cols-4">
                  <ReadyCell label="Agreement" value={ready.agreement} bad={!ready.agreementOk} />
                  <ReadyCell label="Materials" value={ready.materials} bad={!ready.materialsOk && ready.materials !== "None yet"} />
                  <ReadyCell label="Work order" value={ready.work} bad={!ready.workOk && ready.work !== "None yet"} />
                  <ReadyCell label="Balance" value={money(ready.balance)} bad={ready.balance > 0} />
                </div>
                {ready.lender > 0 ? (
                  <section className="w-full rounded-md border border-line bg-card px-4 py-3">
                    <h3 className="type-label">Lender</h3>
                    <p className="mt-1 text-sm font-semibold">GoodLeap</p>
                    <p className="type-meta mt-1">{money(ready.lender)} not funded</p>
                  </section>
                ) : null}
                {composing ? <ChaseForm row={composing} who={actor} onDone={() => advance(composing)} onClose={() => setComposer(null)} /> : null}
                {preview && !composing ? (
                  <div className="flex h-[72vh] min-h-[36rem] w-full min-w-0 flex-col overflow-hidden rounded-md border border-line bg-card">
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-2">
                      <p className="type-meta truncate">{focused?.fileName || focused?.number || "Agreement"}</p>
                      {focused && !focused.internal && focused.fileUrl ? (
                        <button type="button" aria-label="Email" className="grid size-9 place-items-center text-navy" onClick={() => emailPaper(focused)}>
                          <Mail className="size-4" />
                        </button>
                      ) : null}
                    </div>
                    <iframe title={focused?.fileName || "Agreement"} srcDoc={preview} className="min-h-0 w-full flex-1 bg-white" />
                  </div>
                ) : null}
                {SECTIONS.map((section) => {
                  const list = packet.filter((r) => r.kind === section.kind && !r.internal && !r.mismatch && !r.lender);
                  const internal = packet.filter((r) => r.kind === section.kind && r.internal);
                  return (
                    <section key={section.kind} className="w-full min-w-0 rounded-md border border-line bg-card px-4 py-3">
                      <h3 className="type-label">{section.label}</h3>
                      {list.length === 0 ? <p className="type-meta mt-2">{section.empty}</p> : <ul className="mt-2 divide-y divide-line">{list.map((row) => <PacketLine key={row.id} row={row} open={row.id === focused?.id} onOpen={() => { setFocus(row.id); setComposer(null); }} onAct={() => act(row)} />)}</ul>}
                      {internal.length ? (
                        <div className="mt-3 border-t border-line pt-3">
                          <p className="type-meta">Internal pay. Not sent to the customer.</p>
                          <ul className="mt-2 divide-y divide-line">{internal.map((row) => <PacketLine key={row.id} row={row} open={row.id === focused?.id} onOpen={() => setFocus(row.id)} onAct={() => act(row)} />)}</ul>
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <p className="type-meta p-6">No paper yet.</p>
        )}
      </section>
    </main>
  );
}

function owned(row: PaperRow, viewAs: string, people: { name: string; role: string }[]) {
  if (!row.owner) return false;
  if (viewAs === "Owner") return row.owner === "Office" || row.owner === "Wrex Lindsay";
  return people.some((p) => p.role === viewAs && p.name === row.owner);
}

function ReadyCell({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="min-w-0 border-line px-4 py-3 sm:border-l sm:first:border-l-0">
      <p className="type-label">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-semibold", bad && "text-alert")}>{value}</p>
    </div>
  );
}

function figureHot(figure?: string) {
  const days = figure?.match(/^(\d+)d$/);
  return Boolean(days && Number(days[1]) >= 3);
}

function QueueRow({ row, active, onOpen, onAct }: { row: PaperRow; active: boolean; onOpen: () => void; onAct: () => void }) {
  const Icon = KIND_META.find((k) => k.id === row.kind)?.icon ?? ScrollText;
  const who = row.title !== row.customer ? row.customer : "";
  return (
    <div className={cn("flex items-center gap-3 border-b border-line bg-card px-4 py-3", active && "bg-info-bg")}>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-card text-navy">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{row.title}</span>
          <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <StatusPill label={row.status} tone={row.tone} />
            {who ? <span className="type-meta">{who}</span> : null}
            {row.detail ? <span className="type-meta min-w-0">{row.detail}</span> : null}
            {row.owner ? <span className="type-meta">{row.owner}</span> : null}
          </span>
        </span>
      </button>
      <Figure row={row} />
      <ActionSlot row={row} onAct={onAct} />
    </div>
  );
}

function PacketLine({ row, open, onOpen, onAct }: { row: PaperRow; open: boolean; onOpen: () => void; onAct: () => void }) {
  return (
    <li className={cn("flex w-full min-w-0 items-center gap-3 rounded-md px-1 py-3", open && "bg-info-bg")}>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold">{row.title}</span>
        <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <StatusPill label={row.status} tone={row.tone} />
          {row.detail ? <span className="type-meta min-w-0">{row.detail}</span> : null}
          {row.number ? <span className="type-meta shrink-0">{row.number}</span> : null}
        </span>
      </button>
      <Figure row={row} />
      <ActionSlot row={row} onAct={onAct} />
    </li>
  );
}

function Figure({ row }: { row: PaperRow }) {
  if (!row.figure) return <span className="w-24 shrink-0" />;
  return <span className={cn("w-24 shrink-0 text-right text-sm font-semibold tabular-nums", figureHot(row.figure) && "text-alert")}>{row.figure}</span>;
}

function ActionSlot({ row, onAct }: { row: PaperRow; onAct: () => void }) {
  return (
    <span className="flex w-36 shrink-0 justify-end">
      {row.action && row.run ? (
        <button type="button" className="h-9 w-full whitespace-nowrap rounded-md bg-navy px-3 text-[12px] font-semibold text-card" onClick={onAct}>
          {row.action}
        </button>
      ) : null}
    </span>
  );
}

function ChaseForm({ row, who, onDone, onClose }: { row: PaperRow; who: string; onDone: () => void; onClose: () => void }) {
  const pay = row.run?.type === "pay";
  const [amount, setAmount] = useState(String(row.amount ?? ""));
  const [how, setHow] = useState(pay ? "Card" : who);
  const [at, setAt] = useState(todayKey());
  const owed = row.amount ?? 0;
  const entered = Number(amount);
  const partial = Number.isFinite(entered) && entered > 0 && entered < owed;
  return (
    <form
      className="w-full rounded-md border border-line bg-card px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!row.run || !Number.isFinite(entered) || entered <= 0) return;
        if (row.run.type === "pay") recordPayment(row.run.jobId, row.run.invoiceId, entered, how, at);
        if (row.run.type === "receive-po") receivePoAmount(row.run.jobId, row.run.poId, entered, how);
        onDone();
      }}
    >
      <h3 className="type-label">{pay ? "Record payment" : "Mark received"}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="type-label">Amount</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
        </label>
        {pay ? (
          <label className="block">
            <span className="type-label">Method</span>
            <select value={how} onChange={(e) => setHow(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy">
              {METHODS.map((method) => <option key={method}>{method}</option>)}
            </select>
          </label>
        ) : (
          <label className="block">
            <span className="type-label">Who</span>
            <input value={how} onChange={(e) => setHow(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
          </label>
        )}
        <label className="block">
          <span className="type-label">Date</span>
          <input type="date" value={at} onChange={(e) => setAt(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">{partial ? (pay ? "Record partial" : "Received short") : pay ? "Record payment" : "Mark received"}</button>
        <button type="button" onClick={onClose} className="h-9 px-2 text-sm font-semibold text-muted">Cancel</button>
      </div>
    </form>
  );
}

export function JobPacket({ jobId }: { jobId: string }) {
  const jobs = useJobs();
  const proposals = useProposals();
  const { leads } = useOps();
  const { viewAs, people } = useStaff();
  const who = people.find((p) => p.role === viewAs)?.name ?? "Office";
  const rows = buildPaper(Object.values(jobs), Object.values(proposals), leads, canSeeCost(viewAs)).filter((r) => r.jobId === jobId && !r.internal && !r.lender && !r.mismatch);
  if (!rows.length) return <p className="type-meta">No paper on this job yet.</p>;
  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => {
        const list = rows.filter((r) => r.kind === section.kind);
        return (
          <div key={section.kind}>
            <p className="type-label">{section.label}</p>
            {list.length === 0 ? <p className="type-meta mt-1">{section.empty}</p> : <ul className="mt-1 divide-y divide-line">{list.map((row) => <PacketLine key={row.id} row={row} open={false} onOpen={() => undefined} onAct={() => runImmediate(row, who)} />)}</ul>}
          </div>
        );
      })}
      <Link to="/paper" search={{ job: jobId }} className="inline-flex h-10 items-center text-sm font-semibold text-navy">
        Open in Paper
      </Link>
    </div>
  );
}

export function emailPaper(row: PaperRow) {
  if (row.internal || !row.fileUrl || row.fileUrl === "#") return;
  sendMessage(row.personId, `${row.detail} is attached.`, "email", {
    subject: row.number || row.detail,
    files: [{ name: row.fileName || "paper.html", kind: "file", src: row.fileUrl }],
  });
}
