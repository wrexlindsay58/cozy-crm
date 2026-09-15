import type { Tone } from "@/lib/crm-data";

export const LEAD_STATUSES: { label: string; tone: Tone }[] = [
  { label: "Unmarked", tone: "alert" },
  { label: "Pending", tone: "muted" },
  { label: "Set, no run", tone: "alert" },
  { label: "Confirmed", tone: "navy" },
  { label: "Ran", tone: "up" },
  { label: "One legger", tone: "alert" },
  { label: "No sit", tone: "alert" },
  { label: "Missed", tone: "alert" },
  { label: "No-show", tone: "alert" },
  { label: "Sold", tone: "up" },
  { label: "Not qualified", tone: "muted" },
  { label: "Cancelled", tone: "muted" },
  { label: "Dropped", tone: "muted" },
];

export function toneForStatus(status: string): Tone {
  return LEAD_STATUSES.find((s) => s.label === status)?.tone ?? "navy";
}

export function stageWash(tone: Tone) {
  return tone === "alert"
    ? "bg-alert-bg text-alert"
    : tone === "up"
      ? "bg-up-bg text-up"
      : tone === "muted"
        ? "bg-page text-muted"
        : "bg-info-bg text-navy";
}
