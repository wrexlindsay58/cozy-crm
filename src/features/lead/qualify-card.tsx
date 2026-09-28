import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { useAdminSettings } from "@/features/admin-settings/store";
import { setLeadQualify, setLeadRebate, useLead } from "@/features/ops/store";

function picks(name: string) {
  if (/homeowner|renter/i.test(name)) return ["Homeowner", "Renter"];
  if (/bill|power/i.test(name)) return ["Under $150", "$150–300", "Over $300"];
  if (/age/i.test(name)) return ["Under 10", "10–25", "Over 25"];
  if (/pain/i.test(name)) return ["Hot rooms", "High bill", "Old unit", "Drafts", "Noise"];
  if (/product/i.test(name)) return ["Attic", "HVAC", "Ducts", "Air seal"];
  if (/^pay$/i.test(name) || /financ/i.test(name)) return ["Cash", "Finance", "Either"];
  return ["Yes", "No"];
}

export function qualifyFilled(questions: { id: string; note?: string }[], answers: Record<string, string>) {
  const need = questions.filter((q) => !q.note || /^required/i.test(q.note));
  return need.length === 0 || need.every((q) => Boolean(answers[q.id]));
}

function verdict(questions: { id: string; name: string }[], answers: Record<string, string>) {
  if (questions.length === 0) return { label: "No questions", tone: "muted" as const };
  const area = questions.find((q) => /in area/i.test(q.name));
  const home = questions.find((q) => /homeowner|renter/i.test(q.name));
  const owners = questions.find((q) => /all owners/i.test(q.name));
  if (area && answers[area.id] === "No") return { label: "Not qualified", tone: "alert" as const };
  if (home && answers[home.id] === "Renter") return { label: "Not qualified", tone: "alert" as const };
  if (questions.some((q) => !answers[q.id])) return { label: "Open", tone: "muted" as const };
  if (owners && answers[owners.id] === "No") return { label: "Needs review", tone: "alert" as const };
  return { label: "Qualified", tone: "up" as const };
}

export function QualifyCard({ leadId }: { leadId: string }) {
  const lead = useLead(leadId);
  const { qualify } = useAdminSettings();
  const questions = qualify ?? [];
  const answers = lead?.qualify ?? {};
  const result = verdict(questions, answers);
  if (!lead) return null;
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Qualified</h2>
        <span
          className={cn(
            "inline-flex h-6 items-center rounded-md px-2 text-[11px] font-bold tracking-wide uppercase",
            result.tone === "up" ? "bg-up-bg text-up" : result.tone === "alert" ? "bg-alert-bg text-alert" : "bg-page text-muted",
          )}
        >
          {result.label}
        </span>
      </div>
      {questions.length === 0 ? <p className="text-sm text-muted">Add questions in Settings → File sections.</p> : null}
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {questions.map((q) => {
          const options = picks(q.name);
          const on = answers[q.id] ?? "";
          const many = /pain|product/i.test(q.name);
          const picked = new Set(on.split(",").map((s) => s.trim()).filter(Boolean));
          return (
            <div key={q.id} className={cn("min-w-0", options.length > 2 && "sm:col-span-2")}>
              <Tip label={q.note} on={Boolean(q.note)}>
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{q.name}</p>
              </Tip>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {options.map((p) => {
                  const hot = many ? picked.has(p) : on === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setLeadQualify(lead.id, q.id, many ? (hot ? [...picked].filter((x) => x !== p) : [...picked, p]).join(", ") : p)}
                      className={cn(
                        "h-7 min-w-0 rounded-md px-2 text-[11px] font-semibold",
                        hot ? "border border-navy bg-info-bg text-navy" : "border border-line text-muted hover:border-navy hover:text-ink",
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Rebate eligible</p>
          <div className="mt-1.5 flex gap-1">
            {(
              [
                { label: "Yes", on: lead.rebate === true },
                { label: "No", on: lead.rebate === false },
              ] as const
            ).map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setLeadRebate(lead.id, p.label === "Yes")}
                className={cn(
                  "h-7 min-w-0 flex-1 rounded-md px-2 text-[11px] font-semibold",
                  p.on ? "border border-navy bg-info-bg text-navy" : "border border-line text-muted hover:border-navy hover:text-ink",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}