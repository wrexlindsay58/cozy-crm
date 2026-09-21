import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AssessField } from "./categories";

const inputClass = "mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";
const selectClass = `${inputClass} appearance-none pr-10`;
const OTHER = "Other";

function split(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: AssessField;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = field.options ?? [];
  if (field.kind === "multi") {
    const on = split(value);
    return (
      <div className="mt-1.5 flex flex-wrap gap-1">
        {options.map((opt) => {
          const hit = on.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(hit ? on.filter((x) => x !== opt).join(", ") : [...on, opt].join(", "))}
              className={cn(
                "h-7 rounded-md px-2 text-[11px] font-semibold",
                hit ? "border border-navy bg-info-bg text-navy" : "border border-line text-muted hover:border-navy hover:text-ink",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }
  if (field.kind === "select") {
    return (
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
          <option value="">—</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
      </span>
    );
  }
  if (field.kind === "pick") {
    const listed = options.includes(value);
    const custom = Boolean(value) && !listed;
    const mode = listed ? value : custom || value === OTHER ? OTHER : "";
    return (
      <div>
        <span className="relative block">
          <select
            value={mode}
            onChange={(e) => onChange(e.target.value === OTHER ? OTHER : e.target.value)}
            className={selectClass}
          >
            <option value="">—</option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
            <option value={OTHER}>{OTHER}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
        </span>
        {mode === OTHER ? (
          <input
            value={value === OTHER ? "" : value}
            onChange={(e) => onChange(e.target.value || OTHER)}
            placeholder="Not on the list"
            className={inputClass}
          />
        ) : null}
      </div>
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode={field.kind === "number" ? "decimal" : undefined}
      className={inputClass}
    />
  );
}