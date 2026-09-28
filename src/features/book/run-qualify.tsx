import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useAdminSettings } from "@/features/admin-settings/store";
import { setLeadQualify, useLead } from "@/features/ops/store";

export function isRequired(note: string) {
  return /^required/i.test(note);
}

function choices(name: string, lead: { product?: string; tags?: string[] } | undefined) {
  if (/homeowner|renter/i.test(name)) return ["Homeowner", "Renter"];
  if (/bill|power/i.test(name)) return ["Under $150", "$150–300", "Over $300"];
  if (/age/i.test(name)) return ["Under 10", "10–25", "Over 25"];
  if (/pain/i.test(name)) return ["Hot rooms", "High bill", "Old unit", "Drafts", "Noise"];
  if (/product/i.test(name)) {
    const bits = `${lead?.product ?? ""} ${(lead?.tags ?? []).join(" ")}`.split(/[+,]|\s{2,}/).map((s) => s.trim()).filter((s) => s.length > 2);
    return bits.length ? Array.from(new Set(bits)).slice(0, 6) : ["Attic", "HVAC", "Ducts", "Air seal"];
  }
  return ["Yes", "No"];
}

export function RunQualify({ leadId, onReady }: { leadId: string; onReady?: (ok: boolean) => void }) {
  const lead = useLead(leadId);
  const { qualify } = useAdminSettings();
  const questions = qualify ?? [];
  const answers = lead?.qualify ?? {};
  const required = questions.filter((q) => isRequired(q.note));
  const ready = required.every((q) => Boolean(answers[q.id]));
  useEffect(() => {
    onReady?.(ready);
  }, [ready, onReady]);
  if (!lead) return null;
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Run qualifications</p>
      {questions.map((q) => {
        const options = choices(q.name, lead);
        const on = answers[q.id] ?? "";
        const many = /pain|product/i.test(q.name);
        const picked = new Set(on.split(",").map((s) => s.trim()).filter(Boolean));
        return (
          <div key={q.id}>
            <p className="text-[11px] font-semibold text-navy">
              {q.name}
              {isRequired(q.note) ? " · required" : ""}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {options.map((p) => {
                const hot = many ? picked.has(p) : on === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const next = many ? (hot ? [...picked].filter((x) => x !== p) : [...picked, p]).join(", ") : p;
                      setLeadQualify(lead.id, q.id, next);
                    }}
                    className={cn("h-8 rounded-md px-2 text-[12px] font-semibold", hot ? "bg-navy text-card" : "border border-line")}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!ready ? <p className="text-[12px] text-alert">Answer the required qualifications before this Run is booked.</p> : null}
    </div>
  );
}
