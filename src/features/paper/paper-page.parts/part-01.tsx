import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ClipboardList, FileDiff, FileSignature, Receipt, ScrollText, ShoppingCart, type LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/ui-bits";
import { cn } from "@/lib/cn";
import { issueWo, receiveGoodLeapPay, receivePoAmount, recordPayment, sendPo, setInvoiceStatus, signCo, signWo } from "@/features/job/store";
import type { PaperKind, PaperRow, PaperStack } from "../model";
import { ActionSlot } from "./part-02";
import { Figure } from "./part-03";

export const KIND_META: { id: PaperKind | "all"; label: string; short: string; icon: LucideIcon }[] = [
  { id: "all", label: "All", short: "All", icon: ScrollText },
  { id: "agreement", label: "Agreements", short: "Agrmts", icon: FileSignature },
  { id: "change", label: "Change orders", short: "COs", icon: FileDiff },
  { id: "work", label: "Work orders", short: "WOs", icon: ClipboardList },
  { id: "purchase", label: "Purchases", short: "POs", icon: ShoppingCart },
  { id: "invoice", label: "Invoices", short: "Inv", icon: Receipt },
];

export const STACKS: { id: PaperStack; label: string }[] = [
  { id: "collect", label: "Collect" },
  { id: "truck", label: "Clear the truck" },
  { id: "waiting", label: "Waiting" },
  { id: "send", label: "Send" },
];

export const SECTIONS: { kind: PaperKind; label: string; empty: string }[] = [
  { kind: "agreement", label: "Agreement", empty: "No agreement on this job." },
  { kind: "change", label: "Change orders", empty: "None." },
  { kind: "work", label: "Work orders", empty: "No crew on this job yet." },
  { kind: "purchase", label: "Purchases", empty: "None yet." },
  { kind: "invoice", label: "Invoices", empty: "No invoice yet." },
];

export const METHODS = ["Cash", "Check", "Card", "ACH", "Financing"];

export function htmlOf(fileUrl?: string) {
  if (!fileUrl?.startsWith("data:")) return "";
  try {
    return decodeURIComponent(fileUrl.slice(fileUrl.indexOf(",") + 1));
  } catch {
    return "";
  }
}

export function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function FitRow({ signature, labeled }: { signature: string; labeled: (compact: boolean) => ReactNode }) {
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

export function runImmediate(row: PaperRow) {
  const act = row.run;
  if (!act) return;
  if (act.type === "sign-wo") signWo(act.jobId, act.woId);
  else if (act.type === "send-po") sendPo(act.jobId, act.poId);
  else if (act.type === "send-invoice") setInvoiceStatus(act.jobId, act.invoiceId, "Sent");
  else if (act.type === "sign-co") signCo(act.jobId, act.coId);
  else if (act.type === "issue-wo") issueWo(act.jobId);
  else if (act.type === "fund") receiveGoodLeapPay(act.jobId);
  else if (act.type === "pay") recordPayment(act.jobId, act.invoiceId, row.amount ?? 0, "Card", "Now");
  else if (act.type === "receive-po") receivePoAmount(act.jobId, act.poId, row.amount ?? 0, "");
}

export function owned(row: PaperRow, viewAs: string, people: { name: string; role: string }[]) {
  if (!row.owner) return false;
  if (viewAs === "Owner") return row.owner === "Office" || row.owner === "Wrex Lindsay";
  return people.some((p) => p.role === viewAs && p.name === row.owner);
}

export function ReadyCell({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="min-w-0 border-line px-4 py-3 sm:border-l sm:first:border-l-0">
      <p className="type-label">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-semibold", bad && "text-alert")}>{value}</p>
    </div>
  );
}

export function figureHot(figure?: string) {
  const days = figure?.match(/^(\d+)d$/);
  return Boolean(days && Number(days[1]) >= 3);
}

export function QueueRow({ row, active, onOpen, onAct }: { row: PaperRow; active: boolean; onOpen: () => void; onAct: () => void }) {
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

export function PacketLine({ row, open, onOpen, onAct }: { row: PaperRow; open: boolean; onOpen: () => void; onAct: () => void }) {
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
