import { isResulted, type BookEvent, type BookStatus, type BookType } from "./types";

export type ResultChoice = { id: string; label: string; group: string; reason: "required" | "optional"; status: BookStatus };

function rows(list: [string, string, string, "required" | "optional", BookStatus][]): ResultChoice[] {
  return list.map(([id, label, group, reason, status]) => ({ id, label, group, reason, status }));
}

const SALES = rows([
  ["follow-up", "Follow-up", "Run", "required", "Done"],
  ["not-interested", "Not interested", "Run", "required", "Done"],
  ["one-leg-ran", "One-legger, ran", "Run", "required", "Done"],
  ["other-ran", "Other, ran", "Run", "required", "Done"],
  ["failed-credit", "Failed credit", "Run", "optional", "Done"],
  ["sold", "Sold", "Run", "optional", "Done"],
  ["cancelled", "Cancelled", "No run", "optional", "No-run"],
  ["not-qualified", "Not qualified", "No run", "required", "No-run"],
  ["rescheduled", "Rescheduled", "No run", "required", "No-run"],
  ["one-leg-norun", "One-legger, no run", "No run", "required", "No-run"],
  ["no-show", "No show", "No run", "optional", "No-show"],
  ["abandoned", "Abandoned", "No run", "required", "No-run"],
  ["phone-sold", "Phone consult, sold", "No run", "optional", "No-run"],
  ["phone-nosale", "Phone consult, no sale", "No run", "required", "No-run"],
  ["phone-noanswer", "Phone consult, no answer", "No run", "optional", "No-run"],
  ["other-norun", "Other, no run", "No run", "required", "No-run"],
]);

function flat(list: [string, string, "required" | "optional", BookStatus][]): ResultChoice[] {
  return list.map(([id, label, reason, status]) => ({ id, label, group: "", reason, status }));
}

const BY_TYPE: Partial<Record<BookType, ResultChoice[]>> = {
  Sales: SALES,
  Callback: SALES,
  Assessment: flat([
    ["measured", "Measured", "optional", "Done"],
    ["partial", "Partial measure", "required", "Done"],
    ["no-access", "No access", "required", "No-run"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["rescheduled", "Rescheduled", "required", "No-run"],
    ["other", "Other", "required", "Done"],
  ]),
  "Ride-along": flat([
    ["rode", "Rode the run", "optional", "Done"],
    ["no-run", "No run", "required", "No-run"],
    ["other", "Other", "required", "Done"],
  ]),
  Install: flat([
    ["complete", "Complete", "optional", "Done"],
    ["partial", "Partial", "required", "Done"],
    ["no-access", "No access", "required", "No-run"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["materials", "Materials short", "required", "No-run"],
    ["weather", "Weather hold", "optional", "No-run"],
    ["failed-inspect", "Failed city inspection", "required", "Done"],
    ["other", "Other", "required", "Done"],
  ]),
  "Pre-install": flat([
    ["ready", "Ready to install", "optional", "Done"],
    ["not-ready", "Not ready", "required", "Done"],
    ["scope", "Scope changed", "required", "Done"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["other", "Other", "required", "Done"],
  ]),
  Service: flat([
    ["repaired", "Repaired", "optional", "Done"],
    ["parts", "Part on order", "required", "Done"],
    ["no-repro", "Could not reproduce", "required", "Done"],
    ["not-ours", "Not our work", "required", "Done"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["other", "Other", "required", "Done"],
  ]),
  Warranty: flat([
    ["covered", "Repaired, covered", "optional", "Done"],
    ["not-covered", "Not covered", "required", "Done"],
    ["parts", "Part on order", "required", "Done"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["other", "Other", "required", "Done"],
  ]),
  "Go-back": flat([
    ["corrected", "Corrected", "optional", "Done"],
    ["open", "Still open", "required", "Done"],
    ["trade", "Needs another trade", "required", "Done"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["other", "Other", "required", "Done"],
  ]),
  Inspection: flat([
    ["passed", "Passed", "optional", "Done"],
    ["failed", "Failed", "required", "Done"],
    ["partial", "Partial", "required", "Done"],
    ["not-ready", "Not ready", "required", "No-run"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["other", "Other", "required", "Done"],
  ]),
  Punch: flat([
    ["cleared", "Cleared", "optional", "Done"],
    ["open", "Still open", "required", "Done"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["other", "Other", "required", "Done"],
  ]),
  Membership: flat([
    ["enrolled", "Enrolled", "optional", "Done"],
    ["declined", "Declined", "required", "Done"],
    ["member", "Already a member", "optional", "Done"],
    ["not-home", "Customer not home", "required", "No-show"],
    ["other", "Other", "required", "Done"],
  ]),
  Permit: flat([
    ["submitted", "Submitted", "optional", "Done"],
    ["approved", "Approved", "optional", "Done"],
    ["rejected", "Rejected", "required", "Done"],
    ["other", "Other", "required", "Done"],
  ]),
  Dump: flat([
    ["dumped", "Dumped", "optional", "Done"],
    ["closed", "Site closed", "required", "No-run"],
    ["second", "Second trip", "required", "Done"],
    ["other", "Other", "required", "Done"],
  ]),
};

BY_TYPE["Test-out"] = BY_TYPE.Inspection;

const FALLBACK = flat([
  ["done", "Done", "optional", "Done"],
  ["problem", "Problem", "required", "Done"],
  ["other", "Other", "required", "Done"],
]);

export function resultsFor(type: BookType) {
  return BY_TYPE[type] ?? FALLBACK;
}

export function resultSummary(e: Pick<BookEvent, "type" | "status" | "result" | "resultNote">) {
  const choice = e.result ? resultsFor(e.type).find((c) => c.id === e.result) : undefined;
  if (choice) return `${choice.group ? `${choice.group} · ` : ""}${choice.label}${e.resultNote ? ` — ${e.resultNote}` : ""}`;
  if (e.status === "Done") return "Ran";
  if (e.status === "No-show") return "No show";
  return isResulted(e.status) ? "No run" : "";
}

export const PHONE_REASONS = [
  { id: "area", label: "Out of area" }, { id: "credit", label: "Questionable credit" }, { id: "knows", label: "Knows what they want" }, { id: "questions", label: "Additional questions" }, { id: "other", label: "Other" },
] as const;

export function phoneWhy(id?: string, note?: string) {
  if (id === "other") return note?.trim() || "Other";
  return PHONE_REASONS.find((r) => r.id === id)?.label ?? "";
}
