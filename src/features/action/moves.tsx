import { useState } from "react";
import { Ban, Check, Pause, Play, Plus } from "lucide-react";
import { setWorkStatus } from "@/features/ops/store";
import { WORK_MOVES, type WorkStatus } from "@/lib/chrome";
import type { ActionKind } from "@/features/action/types";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

const ICONS = {
  Pause,
  Open: Play,
  Complete: Check,
  Cancel: Ban,
} as const;

function nestItems(kind: ActionKind): { id: ActionKind; label: string }[] {
  if (kind === "ticket") return [
    { id: "task", label: "Task" },
    { id: "request", label: "Request" },
  ];
  return [
    { id: "task", label: "Subtask" },
    { id: "request", label: "Subrequest" },
  ];
}

export function WorkMoves({
  kind,
  id,
  status,
  onAdd,
}: {
  kind: ActionKind;
  id: string;
  status: WorkStatus;
  onAdd?: (kind: ActionKind) => void;
}) {
  const moves = status === "Pause" ? (["Open", "Complete", "Cancel"] as const) : WORK_MOVES;
  const [addOpen, setAddOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return (
    <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      {moves.map((s) => {
        const on = s === status;
        const word = s === "Open" ? "Resume" : s;
        const Icon = ICONS[s];
        return (
          <Tip key={s} label={word} on>
            <button
              type="button"
              aria-label={word}
              aria-pressed={on}
              onClick={() => setWorkStatus(kind, id, s)}
              className={cn(
                "grid size-9 place-items-center rounded-md",
                on ? "bg-navy text-card" : s === "Cancel" ? "border border-line text-stop" : "border border-line text-muted",
              )}
            >
              <Icon className="size-4" />
            </button>
          </Tip>
        );
      })}
      {onAdd ? (
        <>
          <Tip label="Add nested" on>
            <button
              type="button"
              aria-label="Add nested"
              aria-expanded={addOpen}
              onClick={(e) => {
                setAnchor(e.currentTarget.getBoundingClientRect());
                setAddOpen((v) => !v);
              }}
              className="grid size-9 place-items-center rounded-md border border-line text-navy"
            >
              <Plus className="size-4" />
            </button>
          </Tip>
          {addOpen && anchor ? (
            <Float anchor={anchor} prefer="bottom" onClose={() => setAddOpen(false)}>
              {nestItems(kind).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="block w-full min-w-40 px-3 py-2 text-left text-sm hover:bg-page"
                  onClick={() => {
                    onAdd(item.id);
                    setAddOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </Float>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
