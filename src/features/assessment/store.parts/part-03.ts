import { addHistory } from "@/features/ops/store";
import { sendMessage } from "@/features/thread/store";
import { actingName } from "@/features/staff/store";
import { rows, emit, write_rows } from "./part-01";

export function completeAssessment(id: string, oppId?: string) {
  const cur = rows[id];
  if (!cur || cur.status === "Complete") return cur;
  const nextOpp = oppId || (cur.leadId === "L-4819" ? "O-1182" : cur.oppId);
  const credit = cur.reportPaid ? " Report fee of $149 was paid. Credit it on the job if they buy." : "";
  write_rows({ ...rows, [id]: { ...cur, status: "Complete", oppId: nextOpp } });
  addHistory(cur.leadId, actingName(), `Assessment complete. Opportunity ${nextOpp ?? "opened"}. ${credit}`.trim());
  emit();
  return rows[id];
}

export function setReportIntent(id: string, intent: "" | "Yes" | "No") {
  const cur = rows[id];
  if (!cur) return;
  write_rows({ ...rows, [id]: { ...cur, intent } });
  addHistory(cur.leadId, actingName(), intent === "Yes" ? "Marked as a qualified assessment." : "Marked as not a qualified assessment.");
  emit();
}

export function markReportPaid(id: string, charge?: { method: "Card" | "Cash" | "Check"; last4: string; brand: string; receipt: string }) {
  const cur = rows[id];
  if (!cur) return;
  const slip = charge?.method === "Card" && charge.last4 ? `${charge.brand || "Card"} ····${charge.last4}` : charge?.method ?? "Card";
  write_rows({ ...rows, [id]: { ...cur, reportPaid: true, reportCharge: charge } });
  addHistory(cur.leadId, actingName(), `Charged $149 for the report (${slip}${charge?.receipt ? `, receipt ${charge.receipt}` : ""}). Credit this on the job if they buy.`);
  emit();
}

export function waiveReportFee(id: string, reason: string, by: string) {
  const cur = rows[id];
  const clean = reason.trim();
  if (!cur || !clean) return;
  write_rows({ ...rows, [id]: { ...cur, reportWaivedBy: by, reportWaiveReason: clean } });
  addHistory(cur.leadId, by, `Waived the $149 report fee. ${clean}`);
  emit();
}

export function sendAssessmentReport(id: string, origin: string, unlocked: boolean) {
  const cur = rows[id];
  if (!cur || !unlocked) return false;
  const url = origin ? `${origin}/report/${id}` : "";
  sendMessage(cur.leadId, `Home performance report for ${cur.address || cur.name}. Measurements only. No prices.${url ? `\n\n${url}` : ""}`, "email", {
    subject: `Your home report · ${cur.address || cur.name}`,
  });
  addHistory(cur.leadId, actingName(), "Assessment report sent.");
  emit();
  return true;
}
