import { PnLSheet } from "./index";
import { money } from "@/lib/crm-data";
import { canSeeCost, useStaff } from "@/features/staff/store";
import { tally } from "../store";
import type { JobFile } from "../store";
import type { LoanFile } from "../types";
import { membershipFor } from "@/features/membership/store";

export const PAY = ["Draft", "Sent", "Partial", "Paid", "Past due", "NSF", "Card declined", "Void", "Refunded"] as const;

export const LOAN: LoanFile["status"][] = ["None", "Received", "Docs needed", "Cancelled", "NTP", "Complete", "Funded"];

export function pct(n: number, of: number) {
  if (!of) return "—";
  return `${Math.round((n / of) * 100)}%`;
}

export function marginGrade(rate: number) {
  if (rate >= 0.45) return { label: "Great", note: "Well above margin", wash: "bg-up-bg text-up" };
  if (rate >= 0.35) return { label: "Good", note: "Margin is where it should be", wash: "bg-info-bg text-navy" };
  if (rate >= 0.25) return { label: "Warning", note: "Lower than it should be", wash: "bg-watch-bg text-watch" };
  return { label: "Bad", note: "This job takes a gut punch", wash: "bg-alert-bg text-alert" };
}

export function heldPlan(job: JobFile) {
  const member = membershipFor(job.personId);
  if (!member || member.pay !== "prepaid" || (member.funding !== "job" && member.funding !== "loan")) return null;
  return member;
}

export function downloadPnl(job: JobFile) {
  const t = tally(job);
  const lines = [
    ["P&L", job.name, job.jobId],
    ["Total Contract", String(t.revenue)],
    ["Adders", String(t.adders)],
    ["Discounts", String(t.discounts)],
    ["Total Costs", String(t.cogs)],
    ["Labor", String(t.labor)],
    ["Materials", String(t.mats)],
    ["Supplier returns", String(t.materialReturns)],
    ["Warehouse stock", String(t.warehouse)],
    ["Gross Profit", String(t.gross)],
    ["Total Commissions", String(t.commission)],
    ["True discount", String(t.trueDiscount.dollars)],
    ["True discount %", t.trueDiscount.pct.toFixed(1)],
    ["Closer rate", String(t.trueDiscount.rate)],
    ["After commission", String(t.margin)],
    ["Left to collect", String(t.collect)],
    [t.overUnder >= 0 ? "Overbilled" : "Underbilled", String(Math.abs(t.overUnder))],
  ];
  const held = heldPlan(job);
  if (held) {
    lines.push(["Collected with this job, not job revenue", String(held.termPrice)]);
    if (held.planFee) lines.push(["Fee on the plan, not a job cost", String(held.planFee)]);
  }
  const blob = new Blob([lines.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${job.jobId}-pnl.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function JobPnl({ job }: { job: JobFile }) {
  useStaff();
  if (!canSeeCost()) return <p className="text-[15px]">Contract {money(tally(job).revenue)}. Cost is hidden for this login.</p>;
  return <PnLSheet job={job} readOnly />;
}
