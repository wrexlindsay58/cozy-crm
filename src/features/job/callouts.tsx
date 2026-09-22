import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";

export function CheckLine({
  label,
  on,
  callout,
  onToggle,
  onCallout,
}: {
  label: string;
  on: boolean;
  callout?: string;
  onToggle: () => void;
  onCallout: (v: string) => void;
}) {
  const [open, setOpen] = useState(Boolean(callout?.trim()));
  const show = open || Boolean(callout?.trim());
  return (
    <li className="min-w-0">
      <div className="flex min-w-0 items-center gap-1">
        <button type="button" onClick={onToggle} className="flex h-9 min-w-0 flex-1 items-center gap-2 text-left text-sm">
          <span className={cn("grid size-5 shrink-0 place-items-center rounded-sm border", on ? "border-navy bg-navy text-card" : "border-line")}>{on ? "✓" : ""}</span>
          <span className="min-w-0 truncate">{label}</span>
        </button>
        {show ? null : (
          <Tip label="Add call-out" on>
            <button
              type="button"
              aria-label="Add call-out"
              onClick={() => setOpen(true)}
              className="grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-navy"
            >
              <Plus className="size-3.5" />
            </button>
          </Tip>
        )}
      </div>
      {show ? (
        <div className="mb-1.5 ml-7 flex min-w-0 items-center gap-1 border-l-2 border-navy py-0.5 pl-2">
          <input
            autoFocus={!callout?.trim()}
            value={callout ?? ""}
            onChange={(e) => onCallout(e.target.value)}
            placeholder="Call-out"
            className="h-7 min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-muted"
          />
          <Tip label="Remove call-out" on>
            <button
              type="button"
              aria-label="Remove call-out"
              onClick={() => {
                onCallout("");
                setOpen(false);
              }}
              className="grid size-7 shrink-0 place-items-center rounded-md text-muted hover:text-alert"
            >
              <Trash2 className="size-3.5" />
            </button>
          </Tip>
        </div>
      ) : null}
    </li>
  );
}
