import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createAction, useLead } from "@/features/ops/store";
import { actingName, canOverrideFee, feeApprover } from "@/features/staff/store";
import { money } from "@/lib/crm-data";
import { REPORT_FEE, reportAccess } from "../figures";
import { sendAssessmentReport, waiveReportFee } from "../store";
import type { Assessment } from "../types";
import { ReportFeeCardView } from "./part-03";

export const field = "h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

export function useReportAccess(file: Assessment) {
  const lead = useLead(file.leadId);
  return reportAccess({
    occupancy: file.property.occupancy,
    bothHome: file.property.bothHome,
    intent: file.intent,
    homeownerAnswer: lead?.qualify?.["Q-3"],
    ownersAnswer: lead?.qualify?.["Q-2"],
    paid: file.reportPaid,
    waivedBy: file.reportWaivedBy,
  });
}

export function ReportFeeCard({ file }: { file: Assessment }) {
  const access = useReportAccess(file);
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [asked, setAsked] = useState(false);
  const [sent, setSent] = useState(false);
  const [miss, setMiss] = useState(false);
  const [pay, setPay] = useState(false);

  function send() {
    const ok = sendAssessmentReport(file.id, window.location.origin, access.unlocked);
    setSent(ok);
    setMiss(!ok);
  }

  function waive() {
    if (!reason.trim()) {
      setMiss(true);
      return;
    }
    if (canOverrideFee()) {
      waiveReportFee(file.id, reason, actingName());
      setMiss(false);
      return;
    }
    createAction({
      kind: "request",
      personId: file.leadId,
      title: `Waive the ${money(REPORT_FEE)} report fee`,
      owner: feeApprover(),
      description: reason.trim(),
      category: "Fee",
    });
    setAsked(true);
    setMiss(false);
  }

  return (
    <ReportFeeCardView bag={{ access, file, navigate, send, setPay, pay, reason, setReason, miss, waive, asked, sent }} />
  );
}
