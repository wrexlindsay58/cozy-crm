import { useState } from "react";
import { useLead } from "@/features/ops/store";
import { membershipSections } from "@/features/membership/workspace";
import { useMembershipFor } from "@/features/membership/store";
import { cn } from "@/lib/cn";

export function AccountMembership({ leadId }: { leadId: string }) {
  const member = useMembershipFor(leadId);
  const lead = useLead(leadId);
  const [tab, setTab] = useState("plan");
  if (!member) return <p className="text-sm text-muted">No membership on this account.</p>;
  const sections = membershipSections(member, lead).filter((section) => section.id !== "contact");
  const current = sections.find((section) => section.id === tab) ?? sections[0];
  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto border-b border-line">
        {sections.map((section) => {
          const on = section.id === current?.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setTab(section.id)}
              className={cn("h-11 shrink-0 border-b-2 px-3 text-sm font-semibold", on ? "border-navy text-navy" : "border-transparent text-muted")}
            >
              {section.label}
            </button>
          );
        })}
      </div>
      <div className="min-w-0">{current?.node}</div>
    </div>
  );
}
