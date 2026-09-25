import { profileById } from "./profiles";
import { prepDays, prepDone } from "./prep";
import { qualityDone, qualityKeys } from "./quality";
import { contractTotal, isAccepted, type JobFile } from "./types";

export type ReviewLine = { id: string; label: string; detail: string; ok: boolean; block: boolean };

export function closeReview(job: JobFile): ReviewLine[] {
  const paid = job.invoices.filter((i) => (i.party ?? "customer") !== "pay" && i.status !== "Refunded" && i.status !== "Void").reduce((sum, i) => sum + i.paid, 0);
  const funded = job.loan.vendor === "GoodLeap" ? job.loan.fundedAmount : 0;
  const collect = Math.max(0, contractTotal(job) - paid - funded);
  const house = job.assignments.filter((a) => a.kind === "internal" && a.day);
  const inventoryOk = house.length === 0 || house.every((a) => a.inventory?.signedAt);
  const back = job.punches.length > 0 && job.punches.every((p) => p.back);
  const unsigned = job.changeOrders.filter((c) => c.lane !== "finance" && !c.signed);
  const fails = qualityKeys(job).filter((key) => job.testOut.results?.[key] === "fail" && !job.testOut.fixes?.[key]?.correctedByQc);
  return [
    { id: "accept", label: "Accepted", detail: job.acceptance?.by ? `${job.acceptance.by}` : "Office has not accepted the job", ok: isAccepted(job), block: true },
    { id: "prep", label: "Prep", detail: prepDays(job).length ? (prepDone(job) ? "Every day confirmed" : "A day is still open") : "No day on the book", ok: prepDone(job), block: true },
    { id: "inventory", label: "Inventory", detail: inventoryOk ? "Load signed" : "An in-house load is unsigned", ok: inventoryOk, block: true },
    { id: "walks", label: "Walks", detail: job.preCheck.signedAt && job.postCheck.signedAt ? "Both signed" : "Pre or post walk is open", ok: Boolean(job.preCheck.signedAt && job.postCheck.signedAt), block: true },
    { id: "time", label: "Back at the shop", detail: back ? "Clocks are closed" : "A crew is still out", ok: back, block: true },
    { id: "quality", label: "Quality", detail: fails.length ? `${fails.length} fail${fails.length === 1 ? "" : "s"} still open` : qualityDone(job) ? "Tests are in" : "A test is still open", ok: qualityDone(job), block: true },
    { id: "co", label: "Change orders", detail: unsigned.length ? `${unsigned.length} unsigned` : "None waiting", ok: unsigned.length === 0, block: true },
    { id: "money", label: "Left to collect", detail: collect ? "Money is still out" : "Collected", ok: collect === 0, block: true },
    ...(job.loan.vendor === "GoodLeap" ? [{ id: "loan", label: "GoodLeap", detail: job.loan.status, ok: job.loan.status === "Funded", block: true }] : []),
  ];
}

export function closeBlockers(job: JobFile) {
  return closeReview(job).filter((row) => row.block && !row.ok).map((row) => row.label);
}

export type PacketLine = { id: string; label: string; detail: string };

export function packetLines(job: JobFile): PacketLine[] {
  const lines: PacketLine[] = [
    { id: "agreement", label: "Signed agreement", detail: "The contract" },
    { id: "photos", label: "Photos", detail: "Before, during, and after" },
    { id: "invoices", label: "Invoices", detail: "Customer bills only" },
    { id: "warranty", label: "Warranties", detail: "What we stand behind" },
  ];
  if (job.changeOrders.some((c) => c.signed)) lines.splice(1, 0, { id: "changes", label: "Change orders", detail: "Signed changes only" });
  if (job.rebate.amount > 0 || (job.rebate.status && job.rebate.status !== "None")) lines.push({ id: "rebate", label: "Rebate forms", detail: job.rebate.program || "Rebate" });
  if (job.rebate.amount > 0 || Boolean(job.loan.vendor)) lines.push({ id: "tax", label: "Tax forms", detail: "Only when they apply" });
  if (job.permit.number || job.scope.some((s) => profileById(s.categoryId)?.needsPermit)) lines.push({ id: "permit", label: "Approved permit", detail: job.permit.number || "Permit on the job" });
  if (job.scope.some((s) => s.kind === "discount" || s.amount < 0)) lines.push({ id: "coupons", label: "Coupons", detail: "Discounts on this job" });
  return lines;
}

export function packetOn(job: JobFile, id: string) {
  const part = job.packet.parts.find((p) => p.id === id);
  return part ? part.on : true;
}
