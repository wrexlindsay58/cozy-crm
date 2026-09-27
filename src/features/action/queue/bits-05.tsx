import { CatChip } from "./bits-01";
import { initials } from "./bits-02";
import { ACTION_LABEL, workTone } from "@/features/action/types";
import type { ActionKind, ShopAction } from "@/features/action/types";
import { houseOf } from "@/features/action/house";
import { WorkMoves } from "@/features/action/moves";
import { liveStatus } from "@/lib/chrome";
import { StatusPill } from "@/components/ui-bits";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

export function QueueCard({
  action,
  house,
  parent,
  nested,
  selected,
  onOpen,
  onAdd,
}: {
  action: ShopAction;
  house: ReturnType<typeof houseOf>;
  parent?: ShopAction;
  nested: number;
  selected: boolean;
  onOpen: () => void;
  onAdd: (kind: ActionKind) => void;
}) {
  const status = liveStatus(action.status, action.due);
  return (
    <div
      className={cn(
        "border-l-4",
        selected ? "border-l-navy bg-page" : "border-l-transparent hover:bg-page/60",
      )}
    >
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 px-3 pt-3 pb-2 text-left max-md:gap-2.5">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">
          {initials(action.owner)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{ACTION_LABEL[action.kind]}</span>
            <CatChip cat={action.category} />
            <StatusPill label={status} tone={workTone(status)} />
          </span>
          <span className="mt-0.5 block text-sm font-semibold text-navy">{action.title}</span>
          {action.description ? (
            <Tip label={action.description} on wide className="mt-0.5 min-w-0 w-full">
              <span className="line-clamp-1 block w-full text-[12px] text-muted">{action.description}</span>
            </Tip>
          ) : null}
          <span className="mt-1 block text-[12px] text-muted">
            {house.name}
            {house.city ? ` · ${house.city}` : ""}
            {parent ? ` · on ${parent.title}` : ""}
          </span>
          <span className="mt-0.5 block text-[11px] text-faint">
            {action.due || "No due"} · {action.owner}
            {action.kind === "ticket" && action.priority === "High" ? " · High" : ""}
            {nested ? ` · ${nested} nested` : ""}
            {` · ${action.id}`}
          </span>
        </span>
      </button>
      <div className="px-3 pb-3 pl-[3.75rem]">
        <WorkMoves kind={action.kind} id={action.id} status={status} onAdd={onAdd} />
      </div>
    </div>
  );
}
