import { useMemo, useState } from "react";
import { useOps } from "@/features/ops/store";
import { useProposals } from "@/features/opportunity/store";
import { canSeeCost, useStaff } from "@/features/staff/store";
import { useJobs } from "@/features/job/store";
import { sendMessage } from "@/features/thread/store";
import { buildPaper, byQueue, jobReady, type PaperKind, type PaperRow } from "../model";
import { htmlOf, runImmediate, owned } from "./part-01";
import { PaperPageView2 } from "./part-06";

export function PaperPage({ initialKind, initialJob }: { initialKind?: PaperKind; initialJob?: string }) {
  const jobs = useJobs();
  const proposals = useProposals();
  const { leads } = useOps();
  const { viewAs, people, actorName } = useStaff();
  const seeCost = canSeeCost(viewAs);
  const actor = actorName;
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
    runImmediate(row);
    advance(row);
  }

  function sendBatch(group: PaperRow[]) {
    const next = visible.find((r) => r.stack && !group.some((g) => g.id === r.id));
    group.forEach((row) => runImmediate(row));
    setComposer(null);
    if (next) {
      setJobId(next.jobId);
      setFocus(next.id);
    }
  }

  return (
    <PaperPageView2 bag={{ mobilePacket, morning, query, setQuery, mine, view, setMine, setView, kind, rows, viewAs, people, setKind, batches, sendBatch, visible, focused, setComposer, setJobId, setFocus, setMobilePacket, act, job, ready, packet, composing, actor, advance, preview }} />
  );
}

export function ActionSlot({ row, onAct }: { row: PaperRow; onAct: () => void }) {
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

export function emailPaper(row: PaperRow) {
  if (row.internal || !row.fileUrl || row.fileUrl === "#") return;
  sendMessage(row.personId, `${row.detail} is attached.`, "email", {
    subject: row.number || row.detail,
    files: [{ name: row.fileName || "paper.html", kind: "file", src: row.fileUrl }],
  });
}
