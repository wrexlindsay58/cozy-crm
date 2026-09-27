import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Float } from "@/components/float";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/crm-data";
import { LEAD_STATUSES, stageWash } from "@/lib/lead-status";
import type { RecordKind } from "../types";

export const KIND_LABEL: Record<RecordKind, string> = {
  lead: "Lead",
  assessment: "Assessment",
  opportunity: "Opportunity",
  job: "Job",
  account: "Account",
  membership: "Membership",
  action: "Action",
  ticket: "Ticket",
  task: "Task",
  request: "Request",
};

export const KIND_BACK: Record<RecordKind, { to: string; label: string }> = {
  lead: { to: "/leads", label: "Leads" },
  assessment: { to: "/assessments", label: "Assessments" },
  opportunity: { to: "/opportunities", label: "Opportunities" },
  job: { to: "/projects", label: "Jobs" },
  account: { to: "/accounts", label: "Accounts" },
  membership: { to: "/memberships", label: "Memberships" },
  action: { to: "/tickets", label: "Actions" },
  ticket: { to: "/tickets", label: "Actions" },
  task: { to: "/tickets", label: "Actions" },
  request: { to: "/tickets", label: "Actions" },
};

export function StageChip({
  label,
  tone,
  onStage,
  options,
}: {
  label: string;
  tone: Tone;
  onStage?: (status: string) => void;
  options?: { label: string; tone: Tone }[];
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const wash = stageWash(tone);
  const picks = options ?? LEAD_STATUSES;
  if (!onStage) {
    return (
      <span className={cn("inline-flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-bold tracking-wide uppercase", wash)}>
        {label}
      </span>
    );
  }
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Status"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
        className={cn("inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase", wash)}
      >
        {label}
        <ChevronDown className="size-3" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {picks.map((s) => (
            <button
              key={s.label}
              type="button"
              className={cn("block w-full min-w-44 px-3 py-2 text-left text-sm hover:bg-page", s.label === label && "font-semibold")}
              onClick={() => {
                onStage(s.label);
                setOpen(false);
              }}
            >
              <span className={cn("mr-2 inline-block size-2 rounded-full", stageWash(s.tone))} />
              {s.label}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}
