import { useState } from "react";
import { cn } from "@/lib/cn";
import { useJobs } from "@/features/job/store";
import { useLead } from "@/features/ops/store";
import { familyOf, type BookType } from "./types";

function modeOf(type: string) {
  if (type === "Service" || type === "Warranty" || type === "Go-back" || type === "Membership") return "house" as const;
  if (familyOf(type as BookType) === "production") return "sold" as const;
  if (type === "Sales" || type === "Assessment" || type === "Callback" || type === "Ride-along") return "ask" as const;
  return "none" as const;
}

export function WorkPicks({ leadId, type, onApply }: { leadId: string; type: string; onApply: (text: string, products: { label: string; notes: string; qty: number }[]) => void }) {
  const lead = useLead(leadId);
  const jobs = useJobs();
  const job = Object.values(jobs).find((j) => j.personId === leadId || j.leadId === leadId);
  const mode = modeOf(type);
  const [on, setOn] = useState<string[]>([]);
  if (!lead || mode === "none") return null;
  const sold = (job?.scope ?? []).filter((s) => s.kind === "product" || s.kind === "adder");
  const asked = `${lead.product ?? ""}`.split("+").map((s) => s.trim()).filter(Boolean);
  const lines = mode === "ask" ? asked.map((label) => ({ id: label, label, notes: lead.notes ?? "", qty: 1 })) : sold.map((s) => ({ id: s.id, label: s.label, notes: s.notes, qty: s.qty }));
  if (!lines.length) return null;
  const title = mode === "sold" ? "Sold services" : mode === "house" ? "On this house" : "What they asked about";
  function toggle(id: string) {
    const next = on.includes(id) ? on.filter((x) => x !== id) : [...on, id];
    setOn(next);
    const picked = lines.filter((l) => next.includes(l.id));
    onApply(picked.map((l) => `${l.label}: ${l.notes}`.trim()).join("\n"), picked.map((l) => ({ label: l.label, notes: l.notes, qty: l.qty || 1 })));
  }
  return (
    <div>
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{title}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {lines.map((l) => (
          <button key={l.id} type="button" onClick={() => toggle(l.id)} className={cn("h-8 rounded-md px-2 text-[12px] font-semibold", on.includes(l.id) ? "bg-navy text-card" : "border border-line")}>
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
